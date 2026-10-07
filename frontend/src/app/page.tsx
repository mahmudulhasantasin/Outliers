"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { usePersona } from "@/context/PersonaContext";
import { useTheme } from "@/context/ThemeContext";
import { SAMPLE_CONTRACTS, SampleContract } from "@/data/sampleContracts";
import {
  FileText,
  Bot,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Sun,
  Moon,
  Zap,
  Scale,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, loginAsDemoUser, loginAsDemoAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleOpenContract = (contract: SampleContract) => {
    loginAsDemoUser();
    sessionStorage.setItem("active_audit_contract", JSON.stringify(contract));
    router.push("/contractmind");
  };

  const handleLaunchCopilot = () => {
    loginAsDemoUser();
    router.push("/copilot");
  };

  const selectedContract = SAMPLE_CONTRACTS[activeTab];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Top Header - Ultra Minimalist & Borderless */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-base shadow-sm">
            LC
          </div>
          <div>
            <span className="font-semibold tracking-tight text-base text-neutral-900 dark:text-neutral-100">
              Legal Copilot
            </span>
            <span className="ml-2 text-xs px-2.5 py-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
              ContractMind
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-200/70 hover:bg-neutral-300 dark:bg-neutral-900/80 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            {language === "bn" ? "English" : "বাংলা"}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-neutral-200/70 hover:bg-neutral-300 dark:bg-neutral-900/80 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              loginAsDemoUser();
              router.push("/copilot");
            }}
            className="px-5 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-100 text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            {language === "bn" ? "প্রবেশ করুন (Demo)" : "Explore Platform"}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-16 text-center flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-950 max-w-3xl leading-[1.12] mb-6">
          {t("heroTitle")}
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed mb-12 font-normal">
          {t("heroSubtitle")}
        </p>

        {/* Primary CTA Cards in Style of Reference Image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl mb-14">
          <div
            onClick={() => {
              loginAsDemoUser();
              router.push("/contractmind");
            }}
            className="group cursor-pointer p-7 rounded-3xl bg-neutral-950 text-white hover:bg-neutral-900 shadow-xl transition-all duration-200 flex flex-col justify-between items-start text-left min-h-[150px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-white mb-1.5 flex items-center gap-1.5">
                {language === "bn" ? "চুক্তিপত্র বিশ্লেষণ" : "ContractMind Audit"}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-neutral-400 leading-normal">
                {language === "bn"
                  ? "আপলোড করুন ও তাৎক্ষণিক ধারাভিত্তিক ঝুঁকি ও রেডলাইন দেখুন"
                  : "Upload contract & pinpoint liability risks with redlines"}
              </p>
            </div>
          </div>

          <div
            onClick={handleLaunchCopilot}
            className="group cursor-pointer p-7 rounded-3xl bg-neutral-950 text-white hover:bg-neutral-900 shadow-xl transition-all duration-200 flex flex-col justify-between items-start text-left min-h-[150px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-white mb-1.5 flex items-center gap-1.5">
                {language === "bn" ? "লিগ্যাল কোপাইলট (Q&A)" : "Legal Copilot Q&A"}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-neutral-400 leading-normal">
                {language === "bn"
                  ? "বাংলা ও ইংরেজিতে আইনি প্রশ্নোত্তর এবং bdlaws সাইটেশন"
                  : "Ask legal questions with verifiable statutory citations"}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Pill Bar */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-neutral-600 pt-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-950">99.4%</span>
            <span>{language === "bn" ? "সাইটেশন সঠিকতা" : "Citation Accuracy"}</span>
          </div>
          <span className="text-neutral-400">•</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-950">0%</span>
            <span>{language === "bn" ? "হ্যালুসিনেশন রোধ" : "Hallucination Safeguard"}</span>
          </div>
          <span className="text-neutral-400">•</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-950">5x</span>
            <span>{language === "bn" ? "দ্রুত আইনি মেমো" : "Faster Review"}</span>
          </div>
        </div>
      </section>

      {/* Interactive Sample Contracts Section */}
      <section className="w-full max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">
            {language === "bn" ? "এক ক্লিকে নমুনা চুক্তিপত্র পরীক্ষা করুন" : "One-Click Interactive Contract Audit"}
          </h2>
          <p className="text-sm text-neutral-600">
            {language === "bn"
              ? "বাস্তব চুক্তির ওপর এআই কীভাবে ধারা ও আইন ম্যাপিং করে তা দেখুন"
              : "Select a real-world scenario to experience autonomous clause and risk extraction"}
          </p>
        </div>

        {/* Sample Tabs */}
        <div className="flex items-center justify-center gap-2.5 mb-8 flex-wrap">
          {SAMPLE_CONTRACTS.map((sample, idx) => (
            <button
              key={sample.id}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === idx
                  ? "bg-neutral-950 text-white shadow-md"
                  : "bg-neutral-200/90 text-neutral-700 hover:bg-neutral-300"
              }`}
            >
              {language === "bn" ? sample.titleBn : sample.titleEn}
            </button>
          ))}
        </div>

        {/* Selected Sample Showcase Card */}
        <div className="p-8 rounded-3xl bg-white shadow-xl transition-all flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold text-neutral-950">
              {language === "bn" ? selectedContract.titleBn : selectedContract.titleEn}
            </h3>

            <p className="text-sm text-neutral-600 leading-relaxed">
              {language === "bn" ? selectedContract.summaryBn : selectedContract.summaryEn}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-100">
                <span className="text-neutral-500 block mb-1">
                  {language === "bn" ? "১ম পক্ষ" : "First Party"}
                </span>
                <span className="font-semibold text-neutral-950">
                  {language === "bn"
                    ? selectedContract.parties.firstPartyBn
                    : selectedContract.parties.firstPartyEn}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-100">
                <span className="text-neutral-500 block mb-1">
                  {language === "bn" ? "২য় পক্ষ" : "Second Party"}
                </span>
                <span className="font-semibold text-neutral-950">
                  {language === "bn"
                    ? selectedContract.parties.secondPartyBn
                    : selectedContract.parties.secondPartyEn}
                </span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => handleOpenContract(selectedContract)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-neutral-950 text-white font-semibold text-xs shadow-lg hover:bg-neutral-900 transition-all flex items-center justify-center gap-2"
              >
                <span>{language === "bn" ? "এই চুক্তিটি বিশ্লেষণ করুন" : "Analyze This Contract"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Snippet Preview */}
          <div className="w-full md:w-80 p-5 rounded-2xl bg-neutral-100 font-mono text-xs text-neutral-700 leading-relaxed max-h-64 overflow-y-auto select-none">
            <div className="text-[10px] tracking-wider uppercase text-neutral-500 mb-2 font-sans font-bold">
              {language === "bn" ? "চুক্তির টেক্সট প্রিভিউ" : "Contract Text Snippet"}
            </div>
            {selectedContract.sampleText}
          </div>
        </div>
      </section>

      {/* Comparison Grid: Zero Borderline */}
      <section className="w-full max-w-5xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">
            {language === "bn" ? "সাধারণ চ্যাটবট থেকে আমাদের পার্থক্য" : "Why Legal Copilot is Different"}
          </h2>
          <p className="text-sm text-neutral-600">
            {language === "bn"
              ? "আইনি বিষয়ে সাধারণ অনুমানের বদলে কঠোর প্রমাণভিত্তিক ভেরিফিকেশন"
              : "Deterministic statutory cross-referencing vs generic LLM speculation"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-white shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-neutral-900" />
            </div>
            <h3 className="text-base font-bold text-neutral-950 mb-2">
              {language === "bn" ? "bdlaws আইনভাণ্ডার লিংকিং" : "Direct Statute Linkage"}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {language === "bn"
                ? "চুক্তির প্রতিটি ঝুঁকিপূর্ণ ধারাকে সরাসরি বাংলাদেশের প্রাসঙ্গিক আইনের সঙ্গে জোড়া হয়।"
                : "Every risky clause is directly connected to official Bangladesh statutory provisions."}
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-neutral-900" />
            </div>
            <h3 className="text-base font-bold text-neutral-950 mb-2">
              {language === "bn" ? "রেডলাইন ও নিরাপদ খসড়া" : "Actionable Redlining"}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {language === "bn"
                ? "শুধুমাত্র সমস্যা দেখানো নয়, বরং আদালতে গ্রহণযোগ্য বিকল্প খসড়া তৈরি করে দেওয়া হয়।"
                : "Provides enforceable counter-proposals to negotiate and balance liabilities."}
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-neutral-900" />
            </div>
            <h3 className="text-base font-bold text-neutral-950 mb-2">
              {language === "bn" ? "ক্লায়েন্ট-সাইড PII সুরক্ষা" : "Sovereign PII Protection"}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {language === "bn"
                ? "ব্যক্তিগত নাম, জাতীয় পরিচয়পত্র ও আর্থিক তথ্য ব্রাউজারে মাস্কিং করে পাঠানো হয়।"
                : "Sensitive identifiers are redacted client-side before any AI reasoning occurs."}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-12 text-center text-xs text-neutral-500 dark:text-neutral-500 border-t border-transparent">
        <p className="mb-2">
          {language === "bn"
            ? "সতর্কবার্তা: লিগ্যাল কোপাইলট একটি আইনি প্রযুক্তি টুল, এটি কোনো পেশাদার আইনজীবীর সরাসরি বিকল্প নয়।"
            : "Notice: Legal Copilot is an AI decision-support platform and does not constitute formal legal counsel."}
        </p>
        <p className="text-[11px]">
          International AI Builders Congress 2026 — JusticeSphere AI
        </p>
      </footer>
    </div>
  );
}
