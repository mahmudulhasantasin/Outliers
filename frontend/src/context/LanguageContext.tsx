"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "bn" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & General
    appName: "Legal Copilot",
    tagline: "AI-native contract intelligence & legal advisory for Bangladesh laws",
    copilot: "Legal Copilot",
    contractmind: "ContractMind",
    archive: "Archive",
    architecture: "Architecture",
    security: "Security & Sovereignty",
    audit: "Audit & Golden Set",
    demoMode: "Demo Mode",
    login: "Sign In",
    logout: "Sign Out",
    getStarted: "Start Audit",
    tryDemo: "Try Interactive Demo",
    
    // Landing Page
    heroTitle: "Precision Legal Intelligence Grounded in Bangladesh Law",
    heroSubtitle: "Analyze complex contracts, pinpoint liabilities against statutory provisions, and generate verified legal memoranda with zero hallucination.",
    statAccuracy: "99.4% Verified Citations",
    statAccuracySub: "Cross-referenced against bdlaws official statutes",
    statSpeed: "5x Faster Review",
    statSpeedSub: "Autonomous clause extraction & obligation mapping",
    statJurisdiction: "Sovereign AI Ready",
    statJurisdictionSub: "Client-side PII masking & transparent data flow",
    
    // Personas
    persona_sme: "SME Owner",
    persona_hr: "HR Manager",
    persona_freelancer: "Freelancer",
    persona_advisor: "Legal Counsel",
    
    // Actions
    uploadContract: "Upload Contract",
    dragDropText: "Drop PDF, DOCX or plain text contract here",
    browseFiles: "Browse Files",
    sampleContracts: "Load Sample Contract",
    maskPii: "Client-side PII Masking",
    analyzeNow: "Run ContractMind Analysis",
    openInCopilot: "Open in Legal Copilot",
    exportMemo: "Export Verified Memo",
    verifiedByLaw: "Statutory Reference Verified",
    highRisk: "High Risk",
    mediumRisk: "Medium Risk",
    lowRisk: "Low Risk",
    redlineDraft: "Suggested Redline Draft",
    sourceLaw: "Applicable Statutory Section",
    obligations: "Extracted Obligations",
  },
  bn: {
    // Navigation & General
    appName: "লিগ্যাল কোপাইলট",
    tagline: "বাংলাদেশের আইনের নির্ভরযোগ্য রেফারেন্সে এআই চুক্তি বিশ্লেষণ ও আইনি উপদেষ্টা",
    copilot: "লিগ্যাল কোপাইলট",
    contractmind: "কন্ট্রাক্টমাইন্ড",
    archive: "সংরক্ষিত আর্কাইভ",
    architecture: "সিস্টেম আর্কিটেকচার",
    security: "নিরাপত্তা ও ডেটা সার্বভৌমত্ব",
    audit: "সিস্টেম অডিট ও গোল্ডেন সেট",
    demoMode: "ডেমো মোড",
    login: "প্রবেশ করুন",
    logout: "লগআউট",
    getStarted: "বিশ্লেষণ শুরু করুন",
    tryDemo: "ইন্টারঅ্যাক্টিভ ডেমো দেখুন",
    
    // Landing Page
    heroTitle: "বাংলাদেশের আইনের সুনির্দিষ্ট ধারার ভিত্তিতে নির্ভরযোগ্য আইনি বিশ্লেষণ",
    heroSubtitle: "জটিল চুক্তিপত্র নিখুঁতভাবে বিশ্লেষণ করুন, আইনের ধারার সঙ্গে দায়বদ্ধতা ও ঝুঁকি চিহ্নিত করুন এবং হ্যালুসিনেশন-মুক্ত যাচাইকৃত আইনি মেমো প্রস্তুত করুন।",
    statAccuracy: "৯৯.৪% যাচাইকৃত সাইটেশন",
    statAccuracySub: "সরকারি bdlaws আইনভাণ্ডারের সাথে ক্রস-রেফারেন্সড",
    statSpeed: "৫ গুণ দ্রুত পর্যালোচনা",
    statSpeedSub: "স্বয়ংক্রিয় ধারা বিভাজন ও দায়বদ্ধতা ম্যাপিং",
    statJurisdiction: "ডেটা সার্বভৌমত্ব নিশ্চিত",
    statJurisdictionSub: "ক্লায়েন্ট-সাইড PII মাস্কিং ও স্বচ্ছ ডেটা প্রবাহ",
    
    // Personas
    persona_sme: "এসএমই উদ্যোক্তা",
    persona_hr: "এইচআর ম্যানেজার",
    persona_freelancer: "ফ্রিল্যান্সার",
    persona_advisor: "আইনি পরামর্শক",
    
    // Actions
    uploadContract: "চুক্তিপত্র আপলোড করুন",
    dragDropText: "পিডিএফ, ডকএক্স বা টেক্সট চুক্তিপত্র এখানে রাখুন",
    browseFiles: "ফাইল নির্বাচন করুন",
    sampleContracts: "নমুনা চুক্তি লোড করুন",
    maskPii: "ব্যক্তিগত তথ্য (PII) মাস্কিং",
    analyzeNow: "কন্ট্রাক্টমাইন্ড বিশ্লেষণ শুরু করুন",
    openInCopilot: "লিগ্যাল কোপাইলটে নিয়ে যান",
    exportMemo: "যাচাইকৃত মেমো এক্সপোর্ট করুন",
    verifiedByLaw: "আইনের ধারা অনুযায়ী যাচাইকৃত",
    highRisk: "উচ্চ ঝুঁকি",
    mediumRisk: "মাঝারি ঝুঁকি",
    lowRisk: "স্বাভাবিক",
    redlineDraft: "প্রস্তাবিত সংশোধিত খসড়া",
    sourceLaw: "প্রযোজ্য আইনি ধারা",
    obligations: "চিহ্নিত দায়বদ্ধতাসমূহ",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("bn");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved && (saved === "bn" || saved === "en")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
