"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { loginAsDemoUser } = useAuth();

  const handleStartContractMind = () => {
    loginAsDemoUser();
    router.push("/contractmind");
  };

  const handleStartCopilot = () => {
    loginAsDemoUser();
    router.push("/copilot");
  };

  return (
    <div className="relative min-h-screen w-full bg-[#EAE8E3] text-[#1E2322] flex flex-col justify-between overflow-hidden selection:bg-[#5C6B66] selection:text-white font-sans">
      {/* Background Graphic: Right Constellation / Network Graph */}
      <div className="absolute right-[-60px] md:right-[-20px] top-1/2 -translate-y-1/2 w-[480px] h-[480px] md:w-[680px] md:h-[680px] pointer-events-none opacity-45 select-none">
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full stroke-[#4A5551] fill-[#4A5551]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Network Connections */}
          <g strokeWidth="0.8" opacity="0.6">
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
          <circle cx="450" cy="310" r="14" fill="#6A7A74" opacity="0.8" />
          <circle cx="580" cy="300" r="3.5" />
          <circle cx="540" cy="390" r="8" fill="#586762" opacity="0.7" />
          <circle cx="260" cy="380" r="4" />
          <circle cx="370" cy="440" r="6.5" />
          <circle cx="500" cy="480" r="16" fill="#75857F" opacity="0.65" />
          <circle cx="220" cy="480" r="3" />
          <circle cx="360" cy="550" r="4" />
          <circle cx="480" cy="570" r="3.5" />
        </svg>
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-8 md:px-12 pt-8 md:pt-10">
        <div className="flex items-center justify-between pb-4 border-b border-[#2C3432]/15">
          <div className="text-lg md:text-xl font-medium tracking-tight text-[#1E2322]">
            Legal Copilot
          </div>

          <nav className="flex items-center gap-6 md:gap-9 text-xs md:text-sm font-normal text-[#2C3432]/85">
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
              onClick={() => router.push("/architecture")}
              className="hover:text-black transition-colors"
            >
              Architecture
            </button>
            <button
              onClick={() => setLanguage(language === "en" ? "bn" : "en")}
              className="hover:text-black transition-colors"
            >
              {language === "en" ? "বাং" : "EN"}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-8 md:px-12 flex-1 flex flex-col justify-center py-16 md:py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-[58px] font-serif font-normal leading-[1.12] text-[#161B1A] tracking-tight mb-5">
            {language === "en"
              ? "‘Precision Legal Intelligence for the Age of AI’"
              : "‘এআই যুগের নির্ভুল ও দায়িত্বশীল আইনি বুদ্ধিমত্তা’"}
          </h1>

          <p className="text-sm sm:text-base md:text-[17px] text-[#4F5956] leading-relaxed mb-9 max-w-lg font-sans">
            {language === "en"
              ? "Autonomous contract auditing, statutory verification, and hallucination-free legal memoranda."
              : "স্বয়ংক্রিয় চুক্তি পর্যালোচনা, আইনি ধারা ম্যাপিং এবং নির্ভরযোগ্য মেমো প্রস্তুতকরণ।"}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={handleStartContractMind}
              className="px-6 py-2.5 rounded-[9px] bg-[#63726D] hover:bg-[#52605B] text-white text-xs md:text-sm font-medium transition-colors shadow-sm"
            >
              {language === "en" ? "Analyze Contract" : "চুক্তিপত্র বিশ্লেষণ"}
            </button>
            <button
              onClick={handleStartCopilot}
              className="px-6 py-2.5 rounded-[9px] border border-[#3B4643]/30 hover:border-[#3B4643]/70 text-[#1E2322] text-xs md:text-sm font-medium transition-colors bg-transparent"
            >
              {language === "en" ? "Legal Copilot" : "লিগ্যাল কোপাইলট"}
            </button>
          </div>
        </div>
      </main>

      {/* Clean Bottom Spacer for Visual Balance */}
      <div className="w-full h-8" />
    </div>
  );
}
