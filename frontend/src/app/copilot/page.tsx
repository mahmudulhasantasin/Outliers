"use client";

import React, { useState, useEffect, useRef } from "react";
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
  getChatSessionHistory,
  closeChatSession,
  type ChatSession,
  type CitedSection,
} from "@/lib/apiServices";
import { useAuth } from "@/context/AuthContext";
import MarkdownViewer from "@/components/markdown/MarkdownViewer";
import { maskPii } from "@/lib/piiMasker"; // ✅ NEW: Client-side PII Masking
import {
  Scale,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  X,
  FileText,
  History,
  Plus,
  Trash2,
  AlertCircle,
  MessageSquare,
  Loader2,
  Copy,
  Check,
  Clock,
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

function parseServerContent(content: unknown) {
  let target = content;
  if (typeof target === "string") {
    try {
      target = JSON.parse(target);
    } catch {
      return {
        answerText: content as string,
        apiCitations: [] as CitedSection[],
        nextSteps: [] as string[],
      };
    }
  }

  if (target && typeof target === "object") {
    const obj = target as Record<string, unknown>;
    return {
      answerText: (obj.detailed_answer as string) || (obj.response as string) || "",
      apiCitations: (obj.cited_sections as CitedSection[]) || [],
      nextSteps: (obj.suggested_next_steps as string[]) || [],
    };
  }

  return {
    answerText: String(content || ""),
    apiCitations: [] as CitedSection[],
    nextSteps: [] as string[],
  };
}

function groupSessions(sessions: ChatSession[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: { [key: string]: ChatSession[] } = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  sessions.forEach((sess) => {
    const d = sess.created_at ? new Date(sess.created_at) : new Date();
    if (d >= today) groups["Today"].push(sess);
    else if (d >= yesterday) groups["Yesterday"].push(sess);
    else if (d >= lastWeek) groups["Previous 7 Days"].push(sess);
    else groups["Older"].push(sess);
  });

  return groups;
}

export default function CopilotPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const isLawyer = String(user?.role).toUpperCase() === "LAWYER";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeCitation, setActiveCitation] = useState<StatutoryProvision | null>(null);
  const [loadedContractTitle, setLoadedContractTitle] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const copyMessageText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const contractData = sessionStorage.getItem("active_audit_contract");
    if (contractData) {
      try {
        const parsed = JSON.parse(contractData);
        const title = language === "bn" ? (parsed.titleBn || parsed.titleEn) : (parsed.titleEn || parsed.titleBn);
        setLoadedContractTitle(title);

        if (parsed.existingSessionId) {
          const sid = String(parsed.existingSessionId);
          setActiveSessionId(sid);
          setIsLoadingHistory(true);
          
          getChatSessionHistory(sid).then((history) => {
            if (!isMounted) return;
            if (history && history.messages) {
              const mapped: ChatMessage[] = history.messages.map((m, idx) => {
                const parsedData = parseServerContent(m.content);
                return {
                  id: `hist-${idx}-${Date.now()}`,
                  sender: m.role === "assistant" ? "copilot" : "user",
                  timestamp: m.created_at
                    ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "History",
                  textEn: parsedData.answerText || m.content,
                  textBn: parsedData.answerText || m.content,
                  apiCitations: m.citations || (parsedData.apiCitations.length > 0 ? parsedData.apiCitations : undefined),
                  nextSteps: parsedData.nextSteps.length > 0 ? parsedData.nextSteps : undefined,
                  isThinking: false,
                };
              });
              setMessages(mapped);
            }
          }).catch(err => console.warn("Could not load existing session:", err))
            .finally(() => { if (isMounted) setIsLoadingHistory(false); });

          delete parsed.existingSessionId;
          sessionStorage.setItem("active_audit_contract", JSON.stringify(parsed));
        } 
        else if (parsed.shouldStartNewSession) {
          delete parsed.shouldStartNewSession;
          sessionStorage.setItem("active_audit_contract", JSON.stringify(parsed));

          const initContractSession = async () => {
            const cid = parsed.contractId || parsed.id;
            try {
              const sessionTitle = title ? `Audit: ${title.slice(0, 32)}` : "Contract Consultation";
              const newSession = await createChatSession(sessionTitle, "USER_CONTRACT", cid);
              if (!isMounted) return;

              const sid = String(newSession.session_id || newSession.id);
              setActiveSessionId(sid);

              const partiesText = parsed.firstPartyEn && parsed.secondPartyEn
                ? (language === "bn" ? `${parsed.firstPartyBn || parsed.firstPartyEn} ও ${parsed.secondPartyBn || parsed.secondPartyEn}` : `${parsed.firstPartyEn} & ${parsed.secondPartyEn}`)
                : null;
              const summaryText = language === "bn" ? (parsed.summaryBn || parsed.summaryEn) : (parsed.summaryEn || parsed.summaryBn);
              const riskText = parsed.riskScore != null ? `${parsed.riskScore}/100` : null;

              const introEn = `📋 **Contract Context Attached: ${parsed.titleEn || title}**\n\n${partiesText ? `- **Parties:** ${partiesText}\n` : ""}${riskText ? `- **Assessed Risk:** ${parsed.riskGradeEn || "Audited"} (${riskText})\n` : ""}${summaryText ? `- **Audit Summary:** ${summaryText}\n` : ""}\nI have loaded this agreement and its statutory audit records into our new consultation session. You can ask me to redline any clause under Bangladesh statutes (Labour Act 2006, Contract Act 1872), explain non-compliance liabilities, or draft protective terms. How can I help you?`;

              const introBn = `📋 **চুক্তিপত্রের কনটেক্সট সংযুক্ত হয়েছে: ${parsed.titleBn || title}**\n\n${partiesText ? `- **পক্ষসমূহ:** ${partiesText}\n` : ""}${riskText ? `- **আইনি ঝুঁকি:** ${parsed.riskGradeBn || "অডিট সম্পন্ন"} (${riskText})\n` : ""}${summaryText ? `- **অডিট সারাংশ:** ${summaryText}\n` : ""}\nএই চুক্তিপত্র এবং এর অডিট রেকর্ড নতুন চ্যাট সেশনে লোড করা হয়েছে। আপনি বাংলাদেশ আইন (শ্রম আইন ২০০৬, চুক্তি আইন ১৮৭২) অনুযায়ী ধারা সংশোধন, লিগ্যাল ঝুঁকি এবং ড্রাফটিং নিয়ে প্রশ্ন করতে পারেন। আমি কীভাবে সাহায্য করতে পারি?`;

              setMessages([
                {
                  id: `intro-${Date.now()}`,
                  sender: "copilot",
                  timestamp: "Just now",
                  textEn: introEn,
                  textBn: introBn,
                  isThinking: false,
                },
              ]);

              loadSessions();
            } catch (err: unknown) {
              console.warn("Could not create initial contract session:", err);
            }
          };

          initContractSession();
        }
      } catch {
        // ignore
      }
    }
    return () => {
      isMounted = false;
    };
  }, [language]);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await listChatSessions();
      setSessions(data);
    } catch {
      // noop
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSelectSession = async (session: ChatSession) => {
    const sid = String(session.session_id || session.id);
    setActiveSessionId(sid);
    setShowHistoryDrawer(false);
    setIsLoadingHistory(true);
    try {
      const history = await getChatSessionHistory(sid);
      if (history && history.messages) {
        const mapped: ChatMessage[] = history.messages.map((m, idx) => {
          const parsedData = parseServerContent(m.content);
          return {
            id: `hist-${idx}-${Date.now()}`,
            sender: m.role === "assistant" ? "copilot" : "user",
            timestamp: m.created_at
              ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "History",
            textEn: parsedData.answerText || m.content,
            textBn: parsedData.answerText || m.content,
            apiCitations: m.citations || (parsedData.apiCitations.length > 0 ? parsedData.apiCitations : undefined),
            nextSteps: parsedData.nextSteps.length > 0 ? parsedData.nextSteps : undefined,
            isThinking: false,
          };
        });
        setMessages(mapped);
      }
    } catch (err: unknown) {
      console.error("Failed to load session history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setShowHistoryDrawer(false);
    sessionStorage.removeItem("active_audit_contract");
    setLoadedContractTitle(null);
  };

  const handleCloseSession = async (sessionId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await closeChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => String(s.session_id || s.id) !== String(sessionId)));
      if (String(activeSessionId) === String(sessionId)) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (err: unknown) {
      console.error("Failed to close session:", err);
    }
  };

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

    const startTime = Date.now();

    try {
      const contractData = sessionStorage.getItem("active_audit_contract");
      let contractId: string | undefined;
      if (contractData) {
        try {
          const parsed = JSON.parse(contractData);
          contractId = parsed.contractId || parsed.id;
        } catch { /* noop */ }
      }

      let sessionId = activeSessionId;
      if (!sessionId) {
        let mode: "GENERAL" | "LAWYER_RESEARCH" | "USER_CONTRACT" = "GENERAL";
        if (isLawyer) {
          mode = "LAWYER_RESEARCH";
        } else if (contractId) {
          mode = "USER_CONTRACT";
        }

        const session = await createChatSession(
          promptText.length > 40 ? promptText.slice(0, 40) + "..." : promptText,
          mode,
          contractId
        );
        sessionId = String(session.session_id || session.id);
        setActiveSessionId(sessionId);
      }

      // ✅ SECURITY: Mask PII (emails, phones, NIDs) before sending to the backend AI
      const { redactedText, stats } = maskPii(promptText, true);
      
      if (stats.totalRedactions > 0) {
        console.log(`[PII Shield] Masked ${stats.totalRedactions} PII items from user prompt.`);
      }

      const queryWithContext = rawAttachments.length > 0
        ? `[Attached: ${rawAttachments.join(", ")}]\n${redactedText}`
        : redactedText;

      const result = await sendChatQuery({
        session_id: sessionId,
        query: queryWithContext,
        contract_id: contractId,
      });

      loadSessions();

      let answerText = "";
      let apiCitations: CitedSection[] = [];
      let nextSteps: string[] = [];

      let parsedPayload: unknown = result.response;
      if (typeof parsedPayload === "string") {
        try {
          parsedPayload = JSON.parse(parsedPayload);
        } catch {
          // Plain text response fallback
        }
      }

      if (parsedPayload && typeof parsedPayload === "object") {
        const obj = parsedPayload as Record<string, unknown>;
        answerText = (obj.detailed_answer as string) || (obj.response as string) || "";
        apiCitations = (obj.cited_sections as CitedSection[]) || [];
        nextSteps = (obj.suggested_next_steps as string[]) || [];
      } else if (typeof parsedPayload === "string") {
        answerText = parsedPayload;
      }

      if (typeof result.credits_remaining === "number" && updateUser) {
        updateUser({ creditBalance: result.credits_remaining });
      }

      const endTime = Date.now();
      const actualSeconds = parseFloat(((endTime - startTime) / 1000).toFixed(1));

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
                thoughtSeconds: actualSeconds
              }
            : msg
        )
      );
    } catch (err: unknown) {
      console.error("Chat Query failed:", err);
      
      const endTime = Date.now();
      const actualSeconds = parseFloat(((endTime - startTime) / 1000).toFixed(1));
      
      const errMsg = err instanceof Error ? err.message : "Sorry, I encountered an error connecting to the legal knowledge base. Please try again.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === copilotMsgId
            ? {
                ...msg,
                textEn: errMsg,
                textBn: err instanceof Error ? err.message : "দুঃখিত, আইনি জ্ঞান ভাণ্ডারে সংযোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
                citations: [],
                isThinking: false,
                thoughtSeconds: actualSeconds
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const hasMessages = messages.length > 0;

  const currentActiveSession = sessions.find(
    (s) => String(s.session_id || s.id) === String(activeSessionId)
  );
  const messageLimitReached = Boolean(
    currentActiveSession &&
      typeof currentActiveSession.message_count === "number" &&
      typeof currentActiveSession.message_limit === "number" &&
      currentActiveSession.message_count >= currentActiveSession.message_limit
  );

  const groupedSessions = groupSessions(sessions);

  return (
    <AppShell>
      <div className="relative z-10 flex flex-col h-[calc(100vh-80px)] w-full max-w-4xl mx-auto font-sans px-3 sm:px-4 overflow-x-hidden">
        
        {/* Top Control Bar */}
        <div className="mb-2 px-3 sm:px-3.5 py-2 rounded-2xl flex items-center justify-between gap-2 sm:gap-3 text-xs bg-(--bg-card) border border-(--text-primary)/10 shadow-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="font-semibold truncate max-w-full text-(--text-primary)">
              {currentActiveSession
                ? currentActiveSession.title
                : activeSessionId
                ? `${language === "bn" ? "সেশন" : "Session"} #${activeSessionId}`
                : isLawyer
                ? "Advocate AI Research"
                : language === "bn"
                ? "নতুন আইনি পরামর্শ"
                : "New Legal Consultation"}
            </span>
            {isLawyer && !loadedContractTitle && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap">
                LAWYER MODE
              </span>
            )}
            {currentActiveSession && (
              <span
                className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                  messageLimitReached
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300"
                    : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                }`}
              >
                {currentActiveSession.message_count ?? messages.filter((m) => m.sender === "user").length} /{" "}
                {currentActiveSession.message_limit ?? (isLawyer ? 20 : 5)} {language === "bn" ? "বার্তা" : "msgs"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeSessionId && (
              <button
                onClick={handleNewSession}
                className="px-2.5 py-1 rounded-xl text-xs font-medium border border-(--text-primary)/15 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-(--text-primary) transition-colors flex items-center gap-1 cursor-pointer"
                title={language === "bn" ? "নতুন সেশন শুরু করুন" : "Start New Consultation"}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === "bn" ? "নতুন চ্যাট" : "New Chat"}</span>
              </button>
            )}

            <button
              onClick={() => {
                setShowHistoryDrawer(true);
                loadSessions();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-(--accent-solid) text-(--accent-contrast) hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
              title={language === "bn" ? "চ্যাট হিস্ট্রি দেখুন" : "View Chat History"}
            >
              <History className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "হিস্ট্রি" : "History"}</span>
              {sessions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-black/20 dark:bg-white/20">
                  {sessions.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Loading Session History Indicator */}
        {isLoadingHistory && (
          <div className="mb-2 py-3 px-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{language === "bn" ? "পূর্ববর্তী কথোপকথনের ইতিহাস লোড হচ্ছে..." : "Loading chat session history..."}</span>
          </div>
        )}

        {/* Context Bar if contract is loaded */}
        {loadedContractTitle && (
          <div className="mb-3 px-4 py-2 rounded-xl shadow-xs flex items-center justify-between text-xs bg-(--bg-card) border border-(--text-primary)/10 text-(--text-primary)">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-(--text-primary) shrink-0" />
              <span className="font-semibold text-(--text-primary) hidden sm:inline">
                {language === "bn" ? "চুক্তির কনটেক্সট সক্রিয়:" : "Active Contract:"}
              </span>
              <span className="text-(--text-muted) truncate">{loadedContractTitle}</span>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("active_audit_contract");
                setLoadedContractTitle(null);
              }}
              className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors shrink-0 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chat Messages or Initial Center Screen */}
        {hasMessages ? (
          <div className="flex-1 overflow-y-auto px-1 space-y-4 sm:space-y-5 pb-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[78%] transition-all duration-300 ${
                    msg.sender === "user"
                      ? "p-4 sm:p-5 rounded-3xl rounded-br-md shadow-md"
                      : msg.isThinking
                      ? "p-2 shadow-none"
                      : "p-4 sm:p-5 rounded-3xl shadow-md rounded-bl-md"
                  }`}
                  style={
                    msg.sender === "user"
                      ? { backgroundColor: "var(--accent-solid)", color: "var(--accent-contrast)" }
                      : msg.isThinking
                      ? { background: "transparent" }
                      : { backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }
                  }
                >
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

                  {msg.sender === "user" && (
                    <div className="space-y-2 wrap-break-word">
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pb-1">
                          {msg.attachments.map((file, idx) => (
                            <span
                              key={`${file}-${idx}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/10 dark:bg-white/10"
                            >
                              <FileText className="w-3.5 h-3.5 opacity-70" />
                              <span className="max-w-50 truncate">{file}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm sm:text-[15px] leading-relaxed font-sans">
                        {language === "bn" ? msg.textBn : msg.textEn}
                      </p>
                    </div>
                  )}

                  {msg.sender === "copilot" && !msg.isThinking && (msg.textEn || msg.textBn) && (
                    <>
                      <div className="copilot-markdown-reply wrap-break-word overflow-x-auto">
                        <MarkdownViewer
                          variant="chat"
                          content={language === "bn" ? msg.textBn : msg.textEn}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => copyMessageText(language === "bn" ? msg.textBn : msg.textEn, msg.id)}
                          className="p-1 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--text-primary)/5 transition-colors cursor-pointer"
                          title={language === "bn" ? "মেসেজ কপি করুন" : "Copy message"}
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                          )}
                        </button>
                      </div>

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-2 items-center">
                          <span className="text-[11px] font-medium flex items-center gap-1 text-(--text-muted)">
                            <Scale className="w-3 h-3 text-(--text-muted)" />
                            {language === "bn" ? "যাচাইকৃত আইনি রেফারেন্স:" : "Statutory Citations:"}
                          </span>
                          {msg.citations.map((citeId) => {
                            const provision = STATUTORY_PROVISIONS[citeId];
                            if (!provision) return null;
                            return (
                              <button
                                key={citeId}
                                onClick={() => setActiveCitation(provision)}
                                className="px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer bg-(--bg-surface) text-(--text-primary)"
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

                      {msg.apiCitations && msg.apiCitations.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-(--text-primary)/10 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            <Scale className="w-3.5 h-3.5" />
                            <span>{language === "bn" ? "সংবিধিবদ্ধ আইনের ধারা ও সাইটেশন (Live RAG Citations):" : "Statutory Citations (Live RAG):"}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.apiCitations.map((cite, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-2.5 rounded-xl border border-(--text-primary)/10 bg-(--bg-surface) text-xs space-y-1 shadow-sm"
                              >
                                <div className="flex items-center justify-between font-bold text-(--text-primary) gap-2">
                                  <span className="text-indigo-600 dark:text-indigo-400 shrink-0">{cite.section_number || cite.section || "Section"}</span>
                                  {cite.act && (
                                    <span className="text-[10px] text-(--text-muted) truncate max-w-37.5" title={cite.act}>
                                      {cite.act}
                                    </span>
                                  )}
                                </div>
                                {(cite.title || cite.act_title) && (
                                  <p className="font-semibold text-[11px] text-(--text-primary)">
                                    {cite.title || cite.act_title}
                                  </p>
                                )}
                                {(cite.provision_summary || cite.relevance || cite.relevance_summary) && (
                                  <p className="text-[11px] text-(--text-muted) leading-relaxed">
                                    {cite.provision_summary || cite.relevance || cite.relevance_summary}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.nextSteps && msg.nextSteps.length > 0 && (
                        <div className="mt-3.5 pt-2 border-t border-(--text-primary)/10 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] uppercase font-bold text-(--text-muted) mr-1">
                            {language === "bn" ? "পরবর্তী পদক্ষেপ:" : "Suggested:"}
                          </span>
                          {msg.nextSteps.map((step, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSendPrompt(step)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium border border-(--text-primary)/15 hover:border-indigo-400 hover:bg-indigo-500/10 bg-(--bg-surface) text-(--text-primary) cursor-pointer transition-all shadow-xs text-left"
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
          <div className="flex-1 flex flex-col items-center justify-center -mt-8 px-2 sm:px-0">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight mb-2 text-(--text-primary)">
                {isLawyer ? "Advocate AI Research" : (language === "bn" ? "এডভোটেক কোপাইলট" : "Advotech Copilot")}
              </h2>
              <p className="text-xs sm:text-sm font-normal text-neutral-500 dark:text-neutral-400">
                {language === "bn"
                  ? "বাংলাদেশের সংবিধিবদ্ধ আইনের নির্ভরযোগ্য সহায়তায় যেকোনো প্রশ্ন করুন"
                  : isLawyer 
                  ? "Research statutes, draft notices, and analyze case law with verifiable citations"
                  : "Ask statutory questions with verifiable citations"}
              </p>
            </div>

            <div className="w-full max-w-155 shadow-sm rounded-[22px] mx-auto">
              <PromptBar
                placeholder={
                  language === "bn"
                    ? "আইনি প্রশ্ন বা চুক্তির ধারা জানতে লিখুন..."
                    : "Ask anything about contracts or Bangladesh statutes..."
                }
                busy={isTyping}
                onSend={handleSendPrompt}
              />
            </div>
          </div>
        )}

        {messageLimitReached && (
          <div className="my-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {language === "bn"
                  ? `এই সেশনের সর্বোচ্চ বার্তা সীমা (${currentActiveSession?.message_limit ?? 5}টি বার্তা) অতিক্রান্ত হয়েছে। পরবর্তী প্রশ্নের জন্য নতুন সেশন শুরু করুন।`
                  : `Session message limit reached (${currentActiveSession?.message_limit ?? 5} messages). Please start a new consultation to continue.`}
              </span>
            </div>
            <button
              onClick={handleNewSession}
              className="px-3.5 py-1.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center mt-2 sm:mt-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "নতুন সেশন" : "New Session"}</span>
            </button>
          </div>
        )}

        {hasMessages && !messageLimitReached && (
          <div className="pt-2 pb-2 flex justify-center w-full">
            <div className="w-full max-w-180">
              <PromptBar
                placeholder={
                  language === "bn"
                    ? "আইনি প্রশ্ন বা চুক্তির ধারা জানতে লিখুন..."
                    : "Ask follow-up question..."
                }
                busy={isTyping}
                onSend={handleSendPrompt}
              />
            </div>
          </div>
        )}

        {/* ফ্লোটিং চ্যাট হিস্ট্রি ড্রয়ার */}
        {showHistoryDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end items-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full sm:w-105 h-full max-h-[85vh] sm:max-h-[90vh] shadow-2xl flex flex-col rounded-3xl overflow-hidden bg-(--bg-card) border border-(--text-primary)/10 animate-in slide-in-from-right duration-300">
              
              <div className="p-5 border-b border-(--text-primary)/10 bg-(--bg-card)/95 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-base font-bold text-(--text-primary)">{language === "bn" ? "আইনি চ্যাট ইতিহাস" : "Chat History"}</h3>
                </div>
                <button onClick={() => setShowHistoryDrawer(false)} className="p-1.5 rounded-lg text-(--text-muted) hover:bg-(--text-primary)/5 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <button onClick={handleNewSession} className="w-full py-3 px-4 rounded-2xl text-xs font-bold border-2 border-dashed border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span>{language === "bn" ? "নতুন পরামর্শ শুরু করুন" : "Start New Consultation"}</span>
                </button>

                {isLoadingSessions ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-(--text-muted) text-xs">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <span>{language === "bn" ? "লোড হচ্ছে..." : "Loading sessions..."}</span>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="py-12 text-center text-xs text-(--text-muted) space-y-1">
                    <p>{language === "bn" ? "কোনো হিস্ট্রি পাওয়া যায়নি।" : "No chat history found."}</p>
                  </div>
                ) : (
                  Object.entries(groupedSessions).map(([groupName, groupSessions]) => {
                    if (groupSessions.length === 0) return null;
                    return (
                      <div key={groupName} className="space-y-2">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-(--text-muted) ml-1">
                          {language === "bn" 
                            ? groupName === "Today" ? "আজ" : groupName === "Yesterday" ? "গতকাল" : groupName === "Previous 7 Days" ? "গত ৭ দিন" : "পুরনো"
                            : groupName}
                        </h4>
                        <div className="space-y-1">
                          {groupSessions.map((sess) => {
                            const sid = String(sess.session_id || sess.id);
                            const isActive = String(activeSessionId) === sid;
                            const isContract = sess.mode === "USER_CONTRACT" || sess.mode === "LAWYER_RESEARCH" || sess.mode === "CONTRACT_REVIEW";
                            
                            return (
                              <div
                                key={sid}
                                onClick={() => handleSelectSession(sess)}
                                className={`group p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                                  isActive 
                                    ? "border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs" 
                                    : "border-transparent hover:bg-(--bg-surface) hover:border-(--text-primary)/10"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    {isContract ? <FileText className="w-3.5 h-3.5 text-sky-500 shrink-0" /> : <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                                    <span className={`font-semibold text-xs truncate ${isActive ? "text-indigo-700 dark:text-indigo-300" : "text-(--text-primary)"}`}>
                                      {sess.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-(--text-muted)">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {sess.updated_at ? new Date(sess.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recent"}
                                    </span>
                                    <span>·</span>
                                    <span>{sess.message_count || 0} messages</span>
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => handleCloseSession(sid, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-(--text-muted) hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                                  title={language === "bn" ? "সেশন মুছুন" : "Delete session"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-(--text-primary)/10 bg-(--bg-card) shrink-0">
                <button onClick={() => setShowHistoryDrawer(false)} className="w-full py-2.5 rounded-xl text-xs font-medium border border-(--text-primary)/15 hover:bg-(--text-primary)/5 text-(--text-primary) transition-colors cursor-pointer">
                  {language === "bn" ? "বন্ধ করুন" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Citation Modal */}
        {activeCitation && (
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-120 shadow-2xl p-5 sm:p-7 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 bg-(--bg-card) text-(--text-primary)">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-(--text-primary)/10">
                <div className="flex items-center gap-2 text-xs font-semibold text-(--text-primary)">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{language === "bn" ? "সরকারি bdlaws আইনভাণ্ডার" : "Verified Official Statute"}</span>
                </div>
                <button onClick={() => setActiveCitation(null)} className="p-1 rounded-lg transition-colors text-(--text-muted) hover:text-(--text-primary) cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase block mb-1 text-(--text-muted)">
                  {language === "bn" ? activeCitation.actTitleBn : activeCitation.actTitleEn}
                </span>
                <h3 className="text-lg font-bold leading-snug text-(--text-primary)">
                  {language === "bn" ? activeCitation.sectionBn : activeCitation.sectionEn}
                </h3>
              </div>

              <div className="p-4 rounded-2xl text-xs leading-relaxed space-y-1 bg-(--bg-surface) text-(--text-primary)">
                <span className="font-bold block">{language === "bn" ? "সহজ আইনি ব্যাখ্যা:" : "Key Takeaway:"}</span>
                <p className="text-(--text-muted)">{language === "bn" ? activeCitation.summaryBn : activeCitation.summaryEn}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block mb-2 text-(--text-muted)">
                  {language === "bn" ? "আইনের হুবহু ধারা (Statutory Verbatim):" : "Statutory Provision Text:"}
                </span>
                <div className="p-4 rounded-2xl font-serif text-xs leading-relaxed whitespace-pre-line border-l-2 bg-(--bg-surface) text-(--text-primary) border-(--text-primary)/15">
                  {language === "bn" ? activeCitation.fullTextBn : activeCitation.fullTextEn}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-(--text-primary)/10 mt-6">
              <a href={activeCitation.bdlawsUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm hover:opacity-90 bg-(--accent-solid) text-(--accent-contrast)">
                <span>{language === "bn" ? "bdlaws ওয়েবসাইটে আসল ধারাটি দেখুন" : "View on Official bdlaws Portal"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}