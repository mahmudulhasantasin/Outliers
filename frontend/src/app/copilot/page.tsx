"use client";

import React, { useState, useEffect, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { usePersona } from "@/context/PersonaContext";
import { STATUTORY_PROVISIONS, StatutoryProvision } from "@/data/statutoryProvisions";
import {
  Send,
  Scale,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  X,
  FileText,
  CornerDownLeft,
  Info
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  timestamp: string;
  textEn: string;
  textBn: string;
  citations?: string[]; // IDs in STATUTORY_PROVISIONS
  suggestedAction?: {
    en: string;
    bn: string;
  };
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-welcome",
    sender: "copilot",
    timestamp: "Just now",
    textEn: "Welcome to Legal Copilot. I am your sovereign advisory assistant grounded strictly in statutory provisions of Bangladesh. You can ask general legal compliance questions or analyze specific contractual liabilities. All findings are verified with direct citations.",
    textBn: "লিগ্যাল কোপাইলটে স্বাগতম। আমি বাংলাদেশের সংবিধিবদ্ধ আইনভাণ্ডারের সুনির্দিষ্ট ধারার ভিত্তিতে দায়িত্বশীল আইনি সহকারী। আপনি শ্রম আইন, চুক্তি আইন বা বাণিজ্যিক বাধ্যবাধকতা নিয়ে যেকোনো প্রশ্ন করতে পারেন। প্রতিটি উত্তর যাচাইকৃত আইনি ধারা সহ উপস্থাপিত হবে।",
    citations: ["contract-act-73", "contract-act-27"]
  }
];

export default function CopilotPage() {
  const { language, t } = useLanguage();
  const { currentPersonaInfo } = usePersona();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState("");
  const [activeCitation, setActiveCitation] = useState<StatutoryProvision | null>(null);
  const [loadedContractTitle, setLoadedContractTitle] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if contract context was passed from ContractMind
    const contractData = sessionStorage.getItem("active_audit_contract");
    if (contractData) {
      try {
        const parsed = JSON.parse(contractData);
        setLoadedContractTitle(language === "bn" ? parsed.titleBn : parsed.titleEn);
      } catch {
        // Ignore parse error
      }
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      timestamp: "Just now",
      textEn: textToSend,
      textBn: textToSend
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputQuery("");
    setIsTyping(true);

    // Deterministic Statutory Reasoning Simulator matching Blueprint v2
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let responseEn = "";
      let responseBn = "";
      let relevantCitations: string[] = [];

      if (lower.includes("notice") || lower.includes("terminate") || lower.includes("labour") || lower.includes("শ্রম") || lower.includes("নোটিশ") || lower.includes("চাকরি")) {
        responseEn = "Under Section 26 of the Bangladesh Labour Act 2006, unilateral termination of a permanent worker requires a minimum of 120 days' written notice for monthly-rated employees (or wages in lieu thereof), along with statutory compensation of 30 days' wages per year of service. Any clause mandating sudden termination or forfeiture of accrued salary is unlawful and unenforceable.";
        responseBn = "বাংলাদেশ শ্রম আইন ২০০৬ এর ধারা ২৬ অনুযায়ী, মাসিক বেতনের স্থায়ী কর্মীর চাকরি অবসানের ক্ষেত্রে কমপক্ষে ১২০ দিনের লিখিত নোটিশ (বা সমপরিমাণ মজুরি) এবং প্রতি পূর্ণ বছরের চাকরির জন্য ৩০ দিনের মজুরি ক্ষতিপূরণ বাধ্যতামূলক। নোটিশ ছাড়া তাৎক্ষণিক বরখাস্ত বা বকেয়া বেতন বাজেয়াপ্ত করার শর্ত আইনত বাতিল ও অবৈধ।";
        relevantCitations = ["labour-act-26"];
      } else if (lower.includes("non-compete") || lower.includes("restraint") || lower.includes("নন-কম্পিট") || lower.includes("বাধা") || lower.includes("startup")) {
        responseEn = "Under Section 27 of The Contract Act 1872, agreements that restrain any person from exercising a lawful trade, business, or profession are void ab initio. A post-employment clause preventing you or a freelancer from working in your domain or launching a competitive startup in Bangladesh cannot be enforced in a court of law.";
        responseBn = "চুক্তি আইন ১৮৭২-এর ধারা ২৭ অনুযায়ী, কাউকে বৈধ পেশা, ব্যবসা বা বাণিজ্য পরিচালনায় বিরত রাখা সংক্রান্ত যেকোনো শর্ত সম্পূর্ণ বাতিল ও অকার্যকর। চাকরি বা প্রজেক্ট শেষ হওয়ার পর অনুরূপ প্রযুক্তি খাতে কাজ করতে বা স্টার্টআপ করতে নিষেধাজ্ঞা আরোপের শর্ত বাংলাদেশের আদালতে বলবৎযোগ্য নয়।";
        relevantCitations = ["contract-act-27"];
      } else if (lower.includes("penalty") || lower.includes("damages") || lower.includes("ক্ষতিপূরণ") || lower.includes("জরিমানা") || lower.includes("73") || lower.includes("74")) {
        responseEn = "Under Sections 73 and 74 of The Contract Act 1872, parties are only entitled to reasonable compensation for actual, direct losses naturally arising from a breach. Disproportionate or unlimited penalty clauses (e.g., extortionate daily fines) are not awarded as pure punishment by civil courts.";
        responseBn = "চুক্তি আইন ১৮৭২ এর ধারা ৭৩ ও ৭৪ অনুযায়ী, চুক্তিভঙ্গের ক্ষেত্রে কেবল প্রত্যক্ষ ও যৌক্তিক ক্ষতির ক্ষতিপূরণ দাবি করা যায়। চুক্তিতে অতিরিক্ত বা একতরফা অমানবিক জরিমানার শর্ত থাকলেও আদালত কেবল ন্যায্য ও প্রমাণিত ক্ষতির ক্ষতিপূরণ মঞ্জুর করেন, শাস্তিমূলক জরিমানা নয়।";
        relevantCitations = ["contract-act-73", "contract-act-74"];
      } else {
        responseEn = "Your query has been evaluated against the statutory knowledge base. To maintain zero hallucination, every finding must link directly to an existing law in bdlaws. If this pertains to contractual risk, review Sections 73 and 74 (liability capping) or Section 27 (trade restraint).";
        responseBn = "আপনার প্রশ্নটি পরীক্ষা করা হয়েছে। তথ্যের শতভাগ নির্ভুলতা নিশ্চিত করতে প্রতিটি উত্তর সরকারি bdlaws-এর বিধানের সাথে সংযুক্ত করা হয়। বাণিজ্যিক চুক্তির ক্ষেত্রে ধারা ৭৩ ও ৭৪ (ক্ষতিপূরণ ও জরিমানা) অথবা ধারা ২৭ (বাণিজ্য স্বাধীনতা) পর্যালোচনা করুন।";
        relevantCitations = ["contract-act-73", "contract-act-27"];
      }

      const copilotMessage: ChatMessage = {
        id: `cop-${Date.now()}`,
        sender: "copilot",
        timestamp: "Just now",
        textEn: responseEn,
        textBn: responseBn,
        citations: relevantCitations
      };

      setMessages((prev) => [...prev, copilotMessage]);
      setIsTyping(false);
    }, 600);
  };

  const samplePrompt = currentPersonaInfo.samplePromptKey;

  return (
    <AppShell>
      <div className="relative flex flex-col h-[calc(100vh-100px)] w-full max-w-5xl mx-auto">
        {/* Context Bar if contract is loaded */}
        {loadedContractTitle && (
          <div className="mb-4 px-4 py-2.5 rounded-2xl bg-neutral-100 flex items-center justify-between text-xs text-neutral-800 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-black" />
              <span className="font-semibold text-neutral-900">
                {language === "bn" ? "বিশ্লেষিত চুক্তির কনটেক্সট সক্রিয়:" : "Active Contract Context:"}
              </span>
              <span className="text-neutral-700">{loadedContractTitle}</span>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("active_audit_contract");
                setLoadedContractTitle(null);
              }}
              className="text-neutral-400 hover:text-black transition-colors"
              title="Clear Contract Context"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chat Message Scrollable Container */}
        <div className="flex-1 overflow-y-auto px-1 space-y-5 pb-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[78%] p-5 rounded-3xl ${
                  msg.sender === "user"
                    ? "bg-black text-white rounded-br-md shadow-md"
                    : "bg-white text-neutral-950 shadow-md rounded-bl-md"
                }`}
              >
                {/* Message Body */}
                <p className="text-sm sm:text-[15px] leading-relaxed font-sans">
                  {language === "bn" ? msg.textBn : msg.textEn}
                </p>

                {/* Statutory Citations Section (Zero Hallucination Proof) */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-black/5 flex flex-wrap gap-2 items-center">
                    <span className="text-[11px] font-medium text-neutral-500 flex items-center gap-1">
                      <Scale className="w-3 h-3 text-neutral-600" />
                      {language === "bn" ? "যাচাইকৃত আইনি রেফারেন্স:" : "Statutory Citations:"}
                    </span>
                    {msg.citations.map((citeId) => {
                      const provision = STATUTORY_PROVISIONS[citeId];
                      if (!provision) return null;
                      return (
                        <button
                          key={citeId}
                          onClick={() => setActiveCitation(provision)}
                          className="px-3 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <span>
                            {language === "bn" ? provision.sectionBn.split(" - ")[0] : provision.sectionEn.split(" - ")[0]}
                          </span>
                          <BookOpen className="w-3 h-3 text-neutral-500" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start">
              <div className="p-4 rounded-3xl bg-white shadow-md text-xs text-neutral-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-400 animate-ping" />
                <span>{language === "bn" ? "আইনের ধারা যাচাই করা হচ্ছে..." : "Cross-referencing bdlaws statutory repository..."}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area & Quick Prompt */}
        <div className="pt-3">
          {/* Quick Prompt Chip */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-xs select-none">
            <span className="text-neutral-400 font-medium whitespace-nowrap">
              {language === "bn" ? "প্রস্তাবিত প্রশ্ন:" : "Suggested:"}
            </span>
            <button
              onClick={() => handleSendMessage(samplePrompt)}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-normal whitespace-nowrap transition-colors shadow-sm"
            >
              {samplePrompt}
            </button>
          </div>

          {/* Clean Zero-Border Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3 p-2 rounded-2xl bg-white shadow-xl"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                language === "bn"
                  ? "আইনি প্রশ্ন বা চুক্তির ধারা উল্লেখ করে প্রশ্ন লিখুন..."
                  : "Ask statutory question or enter contract clause query..."
              }
              className="flex-1 px-4 py-2.5 bg-transparent text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-black text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-black flex items-center justify-center transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Side Slide-Over Citation Reader Panel */}
        {activeCitation && (
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl p-7 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{language === "bn" ? "সরকারি bdlaws আইনভাণ্ডার" : "Verified Official Statute"}</span>
                </div>
                <button
                  onClick={() => setActiveCitation(null)}
                  className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 block mb-1">
                  {language === "bn" ? activeCitation.actTitleBn : activeCitation.actTitleEn}
                </span>
                <h3 className="text-lg font-bold text-neutral-950 leading-snug">
                  {language === "bn" ? activeCitation.sectionBn : activeCitation.sectionEn}
                </h3>
              </div>

              {/* Legal Summary Card */}
              <div className="p-4 rounded-2xl bg-neutral-100 text-xs text-neutral-700 leading-relaxed space-y-1">
                <span className="font-bold text-neutral-950 block">
                  {language === "bn" ? "সহজ আইনি ব্যাখ্যা:" : "Key Takeaway:"}
                </span>
                <p>{language === "bn" ? activeCitation.summaryBn : activeCitation.summaryEn}</p>
              </div>

              {/* Exact Statutory Verbatim Text */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  {language === "bn" ? "আইনের হুবহু ধারা (Statutory Verbatim):" : "Statutory Provision Text:"}
                </span>
                <div className="p-4 rounded-2xl bg-neutral-50 font-serif text-xs leading-relaxed text-neutral-800 whitespace-pre-line border-l-2 border-neutral-300">
                  {language === "bn" ? activeCitation.fullTextBn : activeCitation.fullTextEn}
                </div>
              </div>
            </div>

            {/* External Government Link */}
            <div className="pt-6 border-t border-black/10 mt-6">
              <a
                href={activeCitation.bdlawsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors shadow-sm"
              >
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
