"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import PromptBar from "@/components/prompt/PromptBar";
import ThoughtLine from "@/components/effects/ThoughtLine";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { STATUTORY_PROVISIONS, StatutoryProvision } from "@/data/statutoryProvisions";
import {
  createChatSession,
  sendChatQuery,
  listChatSessions,
  type ChatSession,
  type CitedSection,
} from "@/lib/apiServices";
import { useAuth } from "@/context/AuthContext";
import {
  Scale,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  X,
  FileText
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  timestamp: string;
  textEn: string;
  textBn: string;
  attachments?: string[];
  citations?: string[];
  apiCitations?: CitedSection[];
  nextSteps?: string[];
  isThinking?: boolean;
  thoughtSeconds?: number;
}

export default function CopilotPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (user?.role === "lawyer" || !!user?.lawyerProfile) {
      router.replace("/lawyer/pending");
    }
  }, [user, router]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeCitation, setActiveCitation] = useState<StatutoryProvision | null>(null);
  const [loadedContractTitle, setLoadedContractTitle] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contractData = sessionStorage.getItem("active_audit_contract");
    if (contractData) {
      try {
        const parsed = JSON.parse(contractData);
        setLoadedContractTitle(language === "bn" ? parsed.titleBn : parsed.titleEn);
      } catch {
        // ignore
      }
    }
  }, [language]);

  // Load previous sessions on mount
  useEffect(() => {
    listChatSessions().then(setSessions).catch(() => {/* noop - not authenticated yet */});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendPrompt = async (text: string, detail?: { attachments?: string[] }) => {
    const rawAttachments = detail?.attachments || [];
    if (!text.trim() && rawAttachments.length === 0) return;

    const promptText = text.trim() || (language === "bn" ? "সংযুক্ত ফাইল বিশ্লেষণ করুন" : "Analyze attached document(s)");

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      timestamp: "Just now",
      textEn: promptText,
      textBn: promptText,
      attachments: rawAttachments.length > 0 ? rawAttachments : undefined
    };

    const copilotMsgId = `cop-${Date.now()}`;
    const pendingCopilotMessage: ChatMessage = {
      id: copilotMsgId,
      sender: "copilot",
      timestamp: "Just now",
      textEn: "",
      textBn: "",
      citations: [],
      isThinking: true
    };

    setMessages((prev) => [...prev, userMessage, pendingCopilotMessage]);
    setIsTyping(true);

    try {
      // Create a session if we don't have one yet
      let sessionId = activeSessionId;
      if (!sessionId) {
        const session = await createChatSession(
          promptText.length > 40 ? promptText.slice(0, 40) + "..." : promptText
        );
        sessionId = String(session.session_id || session.id);
        setActiveSessionId(sessionId);
      }

      // Get loaded contract context from sessionStorage
      const contractData = sessionStorage.getItem("active_audit_contract");
      let contractId: string | undefined;
      if (contractData) {
        try { contractId = JSON.parse(contractData).id; } catch { /* noop */ }
      }

      const queryWithContext = rawAttachments.length > 0
        ? `[Attached: ${rawAttachments.join(", ")}]\n${promptText}`
        : promptText;

      const result = await sendChatQuery({
        session_id: sessionId,
        query: queryWithContext,
        contract_id: contractId,
      });

      // Extract answer, live statutory citations, and suggested next steps
      let answerText = "";
      let apiCitations: CitedSection[] = [];
      let nextSteps: string[] = [];

      if (typeof result.response === "string") {
        answerText = result.response;
      } else if (result.response && typeof result.response === "object") {
        answerText = result.response.detailed_answer || "";
        apiCitations = result.response.cited_sections || [];
        nextSteps = result.response.suggested_next_steps || [];
      }

      // Update credit balance in context if returned
      if (typeof result.credits_remaining === "number" && updateUser) {
        updateUser({ creditBalance: result.credits_remaining });
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === copilotMsgId
            ? {
                ...msg,
                textEn: answerText || "Analysis complete.",
                textBn: answerText || "বিশ্লেষণ সম্পন্ন হয়েছে।",
                citations: [],
                apiCitations,
                nextSteps,
                isThinking: false,
                thoughtSeconds: 1.5
              }
            : msg
        )
      );
    } catch (err: any) {
      console.error("Chat Query failed:", err);
      // Fallback: show an error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === copilotMsgId
            ? {
                ...msg,
                textEn: err?.message || "Sorry, I encountered an error connecting to the legal knowledge base. Please try again.",
                textBn: err?.message || "দুঃখিত, আইনি জ্ঞান ভাণ্ডারে সংযোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
                citations: [],
                isThinking: false,
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const hasMessages = messages.length > 0;

  if (user?.role === "lawyer" || !!user?.lawyerProfile) {
    return (
      <AppShell className="bg-transparent">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
          <p className="text-base font-semibold text-[var(--text-primary)]">
            {language === "bn"
              ? "এডভোটেক কোপাইলট সাধারণ ব্যবহারকারীদের জন্য।"
              : "Advotech Copilot is reserved for General Users."}
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-md">
            {language === "bn"
              ? "আইনজীবী হিসেবে আপনার পোর্টাল হলো পেন্ডিং চুক্তি রিভিউ। রিডাইরেক্ট করা হচ্ছে..."
              : "As an advocate, your workspace is the Lawyer Portal. Redirecting to your lawyer portal..."}
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="relative z-10 flex flex-col h-[calc(100vh-80px)] w-full max-w-4xl mx-auto font-sans">
        {/* Context Bar if contract is loaded */}
        {loadedContractTitle && (
          <div className="mb-3 px-4 py-2 rounded-xl shadow-xs flex items-center justify-between text-xs bg-[var(--bg-card)] border border-[var(--text-primary)]/10 text-[var(--text-primary)]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: "var(--text-primary)" }} />
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {language === "bn" ? "চুক্তির কনটেক্সট সক্রিয়:" : "Active Contract:"}
              </span>
              <span style={{ color: "var(--text-muted)" }}>{loadedContractTitle}</span>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("active_audit_contract");
                setLoadedContractTitle(null);
              }}
              className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chat Messages or Initial Center Screen */}
        {hasMessages ? (
          <div className="flex-1 overflow-y-auto px-1 space-y-5 pb-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"
                  }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[78%] transition-all duration-300 ${
                    msg.sender === "user"
                      ? "p-5 rounded-3xl rounded-br-md shadow-md"
                      : msg.isThinking
                      ? "p-2 shadow-none"
                      : "p-5 rounded-3xl shadow-md rounded-bl-md"
                  }`}
                  style={
                    msg.sender === "user"
                      ? { backgroundColor: "var(--accent-solid)", color: "var(--accent-contrast)" }
                      : msg.isThinking
                      ? { background: "transparent" }
                      : { backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }
                  }
                >
                  {/* ThoughtLine for Copilot Response */}
                  {msg.sender === "copilot" && (
                    <div className={msg.isThinking ? "" : "mb-3"}>
                      <ThoughtLine
                        working={msg.isThinking ?? false}
                        elapsed={msg.isThinking ? undefined : (msg.thoughtSeconds ?? 1.5)}
                        steps={[]}
                        label={language === "bn" ? "আইনি বিশ্লেষণ চলছে…" : "Thinking…"}
                        doneLabel={language === "bn" ? "বিশ্লেষণ সম্পন্ন" : "Thought for"}
                        glyph="sparkle"
                        fontSize={msg.isThinking ? 15 : 13}
                        breathPeriod={1.6}
                        breathDepth={0.45}
                        settleDuration={350}
                        settleBlur={2}
                        collapsible={false}
                        collapseOnSettle={true}
                        showTimer
                        color={msg.isThinking
                          ? (theme === "dark" ? "#E4E4E7" : "#171717")
                          : (theme === "dark" ? "#A1A1AA" : "#525252")
                        }
                        glyphColor="#2563eb"
                        onSettle={(seconds) => console.log(`thought for ${seconds}s`)}
                      />
                    </div>
                  )}

                  {/* User message attachments & text */}
                  {msg.sender === "user" && (
                    <div className="space-y-2">
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pb-1">
                          {msg.attachments.map((file, idx) => (
                            <span
                              key={`${file}-${idx}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/10 dark:bg-white/10"
                            >
                              <FileText className="w-3.5 h-3.5 opacity-70" />
                              <span className="max-w-[200px] truncate">{file}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm sm:text-[15px] leading-relaxed font-sans">
                        {language === "bn" ? msg.textBn : msg.textEn}
                      </p>
                    </div>
                  )}

                  {/* Copilot message text and citations */}
                  {msg.sender === "copilot" && !msg.isThinking && (msg.textEn || msg.textBn) && (
                    <>
                      <p className="text-sm sm:text-[15px] leading-relaxed font-sans">
                        {language === "bn" ? msg.textBn : msg.textEn}
                      </p>

                      {/* Statutory Citations Section (Local) */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-2 items-center">
                          <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                            <Scale className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                            {language === "bn" ? "যাচাইকৃত আইনি রেফারেন্স:" : "Statutory Citations:"}
                          </span>
                          {msg.citations.map((citeId) => {
                            const provision = STATUTORY_PROVISIONS[citeId];
                            if (!provision) return null;
                            return (
                              <button
                                key={citeId}
                                onClick={() => setActiveCitation(provision)}
                                className="px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                                style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}
                              >
                                <span>
                                  {language === "bn"
                                    ? provision.sectionBn.split(" - ")[0]
                                    : provision.sectionEn.split(" - ")[0]}
                                </span>
                                <BookOpen className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Live Backend RAG Statutory Citations Section */}
                      {msg.apiCitations && msg.apiCitations.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-[var(--text-primary)]/10 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            <Scale className="w-3.5 h-3.5" />
                            <span>{language === "bn" ? "সংবিধিবদ্ধ আইনের ধারা ও সাইটেশন (Live RAG Citations):" : "Statutory Citations (Live RAG):"}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.apiCitations.map((cite, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-2.5 rounded-xl border border-[var(--text-primary)]/10 bg-[var(--bg-surface)] text-xs space-y-1 shadow-sm"
                              >
                                <div className="flex items-center justify-between font-bold text-[var(--text-primary)]">
                                  <span className="text-indigo-600 dark:text-indigo-400">{cite.section_number || cite.section || "Section"}</span>
                                  {cite.act && (
                                    <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[140px]" title={cite.act}>
                                      {cite.act}
                                    </span>
                                  )}
                                </div>
                                {(cite.title || cite.act_title) && (
                                  <p className="font-semibold text-[11px] text-[var(--text-primary)]">
                                    {cite.title || cite.act_title}
                                  </p>
                                )}
                                {(cite.provision_summary || cite.relevance || cite.relevance_summary) && (
                                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                                    {cite.provision_summary || cite.relevance || cite.relevance_summary}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Next Steps Chips */}
                      {msg.nextSteps && msg.nextSteps.length > 0 && (
                        <div className="mt-3.5 pt-2 border-t border-[var(--text-primary)]/10 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] mr-1">
                            {language === "bn" ? "পরবর্তী পদক্ষেপ:" : "Suggested:"}
                          </span>
                          {msg.nextSteps.map((step, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSendPrompt(step)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--text-primary)]/15 hover:border-indigo-400 hover:bg-indigo-500/10 bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer transition-all shadow-xs"
                            >
                              💡 {step}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* Initial Stage: Centered Prompt Bar */
          <div className="flex-1 flex flex-col items-center justify-center -mt-8">
            <div className="text-center mb-8">
              <h2
                className="text-2xl sm:text-3xl font-medium tracking-tight mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {language === "bn" ? "এডভোটেক কোপাইলট" : "Advotech Copilot"}
              </h2>
              <p
                className="text-xs sm:text-sm font-normal text-neutral-500 dark:text-neutral-400"
              >
                {language === "bn"
                  ? "বাংলাদেশের সংবিধিবদ্ধ আইনের নির্ভরযোগ্য সহায়তায় যেকোনো প্রশ্ন করুন"
                  : "Ask statutory questions with verifiable citations"}
              </p>
            </div>

            <div className="w-full max-w-[620px] shadow-sm rounded-[22px]">
              <PromptBar
                placeholder={
                  language === "bn"
                    ? "আইনি প্রশ্ন বা চুক্তির ধারা জানতে লিখুন..."
                    : "Ask anything about contracts or Bangladesh statutes..."
                }
                width={620}
                className="w-full !max-w-none"
                busy={isTyping}
                onSend={handleSendPrompt}
              />
            </div>
          </div>
        )}

        {/* Bottom Docked Prompt Bar when messages exist */}
        {hasMessages && (
          <div className="pt-2 flex justify-center w-full">
            <PromptBar
              placeholder={
                language === "bn"
                  ? "আইনি প্রশ্ন বা চুক্তির ধারা জানতে লিখুন..."
                  : "Ask follow-up question..."
              }
              width={720}
              busy={isTyping}
              onSend={handleSendPrompt}
            />
          </div>
        )}

        {/* Side Slide-Over Citation Reader Panel */}
        {activeCitation && (
          <div
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] shadow-2xl p-7 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
            style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}
          >
            <div className="space-y-5">
              <div
                className="flex items-center justify-between pb-3 border-b"
                style={{ borderColor: "color-mix(in srgb, var(--text-primary) 10%, transparent)" }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>
                    {language === "bn" ? "সরকারি bdlaws আইনভাণ্ডার" : "Verified Official Statute"}
                  </span>
                </div>
                <button
                  onClick={() => setActiveCitation(null)}
                  className="p-1 rounded-lg transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase block mb-1" style={{ color: "var(--text-muted)" }}>
                  {language === "bn" ? activeCitation.actTitleBn : activeCitation.actTitleEn}
                </span>
                <h3 className="text-lg font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
                  {language === "bn" ? activeCitation.sectionBn : activeCitation.sectionEn}
                </h3>
              </div>

              {/* Legal Summary Card */}
              <div className="p-4 rounded-2xl text-xs leading-relaxed space-y-1" style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}>
                <span className="font-bold block">
                  {language === "bn" ? "সহজ আইনি ব্যাখ্যা:" : "Key Takeaway:"}
                </span>
                <p style={{ color: "var(--text-muted)" }}>
                  {language === "bn" ? activeCitation.summaryBn : activeCitation.summaryEn}
                </p>
              </div>

              {/* Exact Statutory Verbatim Text */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: "var(--text-muted)" }}>
                  {language === "bn"
                    ? "আইনের হুবহু ধারা (Statutory Verbatim):"
                    : "Statutory Provision Text:"}
                </span>
                <div
                  className="p-4 rounded-2xl font-serif text-xs leading-relaxed whitespace-pre-line border-l-2"
                  style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", borderColor: "color-mix(in srgb, var(--text-primary) 15%, transparent)" }}
                >
                  {language === "bn" ? activeCitation.fullTextBn : activeCitation.fullTextEn}
                </div>
              </div>
            </div>

            {/* External Government Link */}
            <div
              className="pt-6 border-t mt-6"
              style={{ borderColor: "color-mix(in srgb, var(--text-primary) 10%, transparent)" }}
            >
              <a
                href={activeCitation.bdlawsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm hover:opacity-90"
                style={{ backgroundColor: "var(--accent-solid)", color: "var(--accent-contrast)" }}
              >
                <span>
                  {language === "bn"
                    ? "bdlaws ওয়েবসাইটে আসল ধারাটি দেখুন"
                    : "View on Official bdlaws Portal"}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
