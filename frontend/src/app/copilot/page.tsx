"use client";

import React, { useState, useEffect, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import PromptBar from "@/components/prompt/PromptBar";
import Aurora from "@/components/effects/Aurora";
import ThoughtLine from "@/components/effects/ThoughtLine";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { STATUTORY_PROVISIONS, StatutoryProvision } from "@/data/statutoryProvisions";
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
  citations?: string[];
  isThinking?: boolean;
  thoughtSeconds?: number;
}

export default function CopilotPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeCitation, setActiveCitation] = useState<StatutoryProvision | null>(null);
  const [loadedContractTitle, setLoadedContractTitle] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendPrompt = (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      timestamp: "Just now",
      textEn: text,
      textBn: text
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

    setTimeout(() => {
      const lower = text.toLowerCase();
      let responseEn = "";
      let responseBn = "";
      let relevantCitations: string[] = [];

      if (
        lower.includes("notice") ||
        lower.includes("terminate") ||
        lower.includes("labour") ||
        lower.includes("শ্রম") ||
        lower.includes("নোটিশ") ||
        lower.includes("চাকরি")
      ) {
        responseEn =
          "Under Section 26 of the Bangladesh Labour Act 2006, unilateral termination of a permanent worker requires a minimum of 120 days' written notice for monthly-rated employees (or wages in lieu thereof), along with statutory compensation of 30 days' wages per year of service. Any clause mandating sudden termination or forfeiture of accrued salary is unlawful and unenforceable.";
        responseBn =
          "বাংলাদেশ শ্রম আইন ২০০৬ এর ধারা ২৬ অনুযায়ী, মাসিক বেতনের স্থায়ী কর্মীর চাকরি অবসানের ক্ষেত্রে কমপক্ষে ১২০ দিনের লিখিত নোটিশ (বা সমপরিমাণ মজুরি) এবং প্রতি পূর্ণ বছরের চাকরির জন্য ৩০ দিনের মজুরি ক্ষতিপূরণ বাধ্যতামূলক। নোটিশ ছাড়া তাৎক্ষণিক বরখাস্ত বা বকেয়া বেতন বাজেয়াপ্ত করার শর্ত আইনত বাতিল ও অবৈধ।";
        relevantCitations = ["labour-act-26"];
      } else if (
        lower.includes("non-compete") ||
        lower.includes("restraint") ||
        lower.includes("নন-কম্পিট") ||
        lower.includes("বাধা") ||
        lower.includes("startup")
      ) {
        responseEn =
          "Under Section 27 of The Contract Act 1872, agreements that restrain any person from exercising a lawful trade, business, or profession are void ab initio. A post-employment clause preventing you or a freelancer from working in your domain or launching a competitive startup in Bangladesh cannot be enforced in a court of law.";
        responseBn =
          "চুক্তি আইন ১৮৭২-এর ধারা ২৭ অনুযায়ী, কাউকে বৈধ পেশা, ব্যবসা বা বাণিজ্য পরিচালনায় বিরত রাখা সংক্রান্ত যেকোনো শর্ত সম্পূর্ণ বাতিল ও অকার্যকর। চাকরি বা প্রজেক্ট শেষ হওয়ার পর অনুরূপ প্রযুক্তি খাতে কাজ করতে বা স্টার্টআপ করতে নিষেধাজ্ঞা আরোপের শর্ত বাংলাদেশের আদালতে বলবৎযোগ্য নয়।";
        relevantCitations = ["contract-act-27"];
      } else if (
        lower.includes("penalty") ||
        lower.includes("damages") ||
        lower.includes("ক্ষতিপূরণ") ||
        lower.includes("জরিমানা") ||
        lower.includes("73") ||
        lower.includes("74")
      ) {
        responseEn =
          "Under Sections 73 and 74 of The Contract Act 1872, parties are only entitled to reasonable compensation for actual, direct losses naturally arising from a breach. Disproportionate or unlimited penalty clauses (e.g., extortionate daily fines) are not awarded as pure punishment by civil courts.";
        responseBn =
          "চুক্তি আইন ১৮৭২ এর ধারা ৭৩ ও ৭৪ অনুযায়ী, চুক্তিভঙ্গের ক্ষেত্রে কেবল প্রত্যক্ষ ও যৌক্তিক ক্ষতির ক্ষতিপূরণ দাবি করা যায়। চুক্তিতে অতিরিক্ত বা একতরফা অমানবিক জরিমানার শর্ত থাকলেও আদালত কেবল ন্যায্য ও প্রমাণিত ক্ষতির ক্ষতিপূরণ মঞ্জুর করেন, শাস্তিমূলক জরিমানা নয়।";
        relevantCitations = ["contract-act-73", "contract-act-74"];
      } else {
        responseEn =
          "Your query has been evaluated against the statutory knowledge base. To maintain zero hallucination, every finding must link directly to an existing law in bdlaws. If this pertains to contractual risk, review Sections 73 and 74 (liability capping) or Section 27 (trade restraint).";
        responseBn =
          "আপনার প্রশ্নটি পরীক্ষা করা হয়েছে। তথ্যের শতভাগ নির্ভুলতা নিশ্চিত করতে প্রতিটি উত্তর সরকারি bdlaws-এর বিধানের সাথে সংযুক্ত করা হয়। বাণিজ্যিক চুক্তির ক্ষেত্রে ধারা ৭৩ ও ৭৪ (ক্ষতিপূরণ ও জরিমানা) অথবা ধারা ২৭ (বাণিজ্য স্বাধীনতা) পর্যালোচনা করুন।";
        relevantCitations = ["contract-act-73", "contract-act-27"];
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === copilotMsgId
            ? {
                ...msg,
                textEn: responseEn,
                textBn: responseBn,
                citations: relevantCitations,
                isThinking: false,
                thoughtSeconds: 1.5
              }
            : msg
        )
      );
      setIsTyping(false);
    }, 1500);
  };

  const hasMessages = messages.length > 0;

  return (
    <AppShell className="bg-transparent" mainClassName="!bg-transparent">
      {/* Background Animated Aurora - Smooth fade out once first response is ready */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-[2500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          !hasMessages || isTyping ? "opacity-100" : "opacity-0"
        }`}
      >
        <Aurora
          colorStops={
            theme === "dark"
              ? ["#4f46e5", "#06b6d4", "#10b981"]
              : ["#5227FF", "#7cff67", "#00d2ff"]
          }
          blend={theme === "dark" ? 0.6 : 0.7}
          amplitude={1.2}
          speed={0.8}
          lightMode={theme !== "dark"}
        />
      </div>

      <div className="relative z-10 flex flex-col h-[calc(100vh-80px)] w-full max-w-4xl mx-auto">
        {/* Context Bar if contract is loaded */}
        {loadedContractTitle && (
          <div className="mb-3 px-4 py-2 rounded-2xl shadow-sm flex items-center justify-between text-xs" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}>
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

                  {/* User message text */}
                  {msg.sender === "user" && (
                    <p className="text-sm sm:text-[15px] leading-relaxed font-sans">
                      {language === "bn" ? msg.textBn : msg.textEn}
                    </p>
                  )}

                  {/* Copilot message text and citations */}
                  {msg.sender === "copilot" && !msg.isThinking && (msg.textEn || msg.textBn) && (
                    <>
                      <p className="text-sm sm:text-[15px] leading-relaxed font-sans">
                        {language === "bn" ? msg.textBn : msg.textEn}
                      </p>

                      {/* Statutory Citations Section */}
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
                                className="px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
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
                className="text-3xl sm:text-4xl font-serif font-normal tracking-tight mb-2.5 [text-shadow:0_1px_2px_rgba(0,0,0,0.1)] dark:[text-shadow:0_2px_10px_rgba(255,255,255,0.2)]"
                style={{ color: "var(--text-primary)" }}
              >
                {language === "bn" ? "লিগ্যাল কোপাইলট" : "Legal Copilot"}
              </h2>
              <p
                className="text-sm sm:text-[15px] font-sans text-neutral-600 dark:text-neutral-400 font-normal tracking-normal"
              >
                {language === "bn"
                  ? "বাংলাদেশের সংবিধিবদ্ধ আইনের নির্ভরযোগ্য সহায়তায় যেকোনো প্রশ্ন করুন"
                  : "Ask statutory questions with verifiable citations"}
              </p>
            </div>

            <div className="w-full max-w-[620px] shadow-[0_12px_32px_-6px_rgba(79,70,229,0.06),0_4px_16px_-2px_rgba(15,23,42,0.03)] dark:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.35)] rounded-[22px]">
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
