"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { loginAsDemoUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartContractMind = () => {
    loginAsDemoUser();
    router.push("/contractmind");
  };

  const handleStartCopilot = () => {
    loginAsDemoUser();
    router.push("/copilot");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-[#FFFFFF]" />
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="relative min-h-screen w-full bg-[#FFFFFF] text-[#000000] flex flex-col justify-between overflow-hidden selection:bg-black selection:text-white font-sans"
    >
      {/* Background Graphic: Right Geometric Network Graph */}
      <div className="absolute right-[-60px] md:right-[-20px] top-1/2 -translate-y-1/2 w-[480px] h-[480px] md:w-[680px] md:h-[680px] pointer-events-none opacity-20 select-none">
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full stroke-black fill-black"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Network Connections */}
          <g strokeWidth="0.8">
            <line x1="280" y1="120" x2="380" y2="180" />
            <line x1="380" y1="180" x2="480" y2="130" />
            <line x1="380" y1="180" x2="340" y2="290" />
            <line x1="480" y1="130" x2="520" y2="230" />
            <line x1="340" y1="290" x2="450" y2="310" />
            <line x1="450" y1="310" x2="520" y2="230" />
            <line x1="450" y1="310" x2="540" y2="390" />
            <line x1="340" y1="290" x2="260" y2="380" />
            <line x1="260" y1="380" x2="370" y2="440" />
            <line x1="370" y1="440" x2="450" y2="310" />
            <line x1="370" y1="440" x2="500" y2="480" />
            <line x1="450" y1="310" x2="500" y2="480" />
            <line x1="280" y1="120" x2="340" y2="290" />
            <line x1="480" y1="130" x2="420" y2="60" />
            <line x1="380" y1="180" x2="420" y2="60" />
            <line x1="520" y1="230" x2="580" y2="300" />
            <line x1="540" y1="390" x2="580" y2="300" />
            <line x1="540" y1="390" x2="500" y2="480" />
            <line x1="260" y1="380" x2="220" y2="480" />
            <line x1="370" y1="440" x2="220" y2="480" />
            <line x1="370" y1="440" x2="360" y2="550" />
            <line x1="500" y1="480" x2="480" y2="570" />
          </g>

          {/* Network Nodes */}
          <circle cx="280" cy="120" r="4" />
          <circle cx="380" cy="180" r="5" />
          <circle cx="480" cy="130" r="4.5" />
          <circle cx="420" cy="60" r="3" />
          <circle cx="520" cy="230" r="6" />
          <circle cx="340" cy="290" r="5.5" />
          <circle cx="450" cy="310" r="14" />
          <circle cx="580" cy="300" r="3.5" />
          <circle cx="540" cy="390" r="8" />
          <circle cx="260" cy="380" r="4" />
          <circle cx="370" cy="440" r="6.5" />
          <circle cx="500" cy="480" r="16" />
          <circle cx="220" cy="480" r="3" />
          <circle cx="360" cy="550" r="4" />
          <circle cx="480" cy="570" r="3.5" />
        </svg>
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-8 md:px-12 pt-8 md:pt-10">
        <div className="flex items-center justify-between pb-4 border-b border-black/10">
          <div className="text-lg md:text-xl font-semibold tracking-tight text-black">
            Legal Copilot
          </div>

          <nav className="flex items-center gap-6 md:gap-9 text-xs md:text-sm font-normal text-neutral-600">
            <button
              onClick={handleStartContractMind}
              className="hover:text-black transition-colors"
            >
              ContractMind
            </button>
            <button
              onClick={handleStartCopilot}
              className="hover:text-black transition-colors"
            >
              Copilot Q&amp;A
            </button>
            <button
              onClick={() => {
                loginAsDemoUser();
                router.push("/archive");
              }}
              className="hover:text-black transition-colors"
            >
              {language === "en" ? "Archive" : "আর্কাইভ"}
            </button>
            <button
              onClick={() => setLanguage(language === "en" ? "bn" : "en")}
              className="hover:text-black transition-colors font-medium text-black"
            >
              {language === "en" ? "বাং" : "EN"}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-8 md:px-12 flex-1 flex flex-col justify-center py-16 md:py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-[58px] font-serif font-normal leading-[1.12] text-black tracking-tight mb-5">
            {language === "en"
              ? "‘Precision Legal Intelligence for the Age of AI’"
              : "‘এআই যুগের নির্ভুল ও দায়িত্বশীল আইনি বুদ্ধিমত্তা’"}
          </h1>

          <p className="text-sm sm:text-base md:text-[17px] text-neutral-600 leading-relaxed mb-9 max-w-lg font-sans">
            {language === "en"
              ? "Autonomous contract auditing, statutory verification, and hallucination-free legal memoranda."
              : "স্বয়ংক্রিয় চুক্তি পর্যালোচনা, আইনি ধারা ম্যাপিং এবং নির্ভরযোগ্য মেমো প্রস্তুতকরণ।"}
          </p>

          {/* Action Buttons: Sign In & Sign Up */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => {
                loginAsDemoUser();
                router.push("/copilot");
              }}
              className="px-7 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs md:text-sm font-medium transition-colors shadow-sm"
            >
              {language === "en" ? "Sign In" : "লগইন করুন"}
            </button>
            <button
              onClick={() => {
                loginAsDemoUser();
                router.push("/copilot");
              }}
              className="px-7 py-2.5 rounded-xl border border-black/20 hover:border-black text-black text-xs md:text-sm font-medium transition-colors bg-transparent"
            >
              {language === "en" ? "Sign Up" : "সাইন আপ"}
            </button>
          </div>
        </div>
      </main>

      {/* Clean Bottom Spacer */}
      <div className="w-full h-8" />
    </div>
  );
}
