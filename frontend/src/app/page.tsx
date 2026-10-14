"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Scale,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Lock,
  ArrowUpRight,
  Globe2,
  CheckCircle2,
  Star,
  Quote,
  Layers,
  ChevronDown,
} from "lucide-react";
import DotField from "@/components/effects/DotField";
import GradientWaves from "@/components/effects/GradientWaves";

export default function LandingAndAuthPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isLoading, loginAsDemoUser, loginAsDemoAdmin } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto redirect to /copilot if user is already logged in (ChatGPT / Claude style)
  useEffect(() => {
    setMounted(true);
    if (!isLoading && isAuthenticated) {
      router.replace("/copilot");
    }
  }, [isAuthenticated, isLoading, router]);

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showAuthModal) {
        setShowAuthModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAuthModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsDemoUser();
    setShowAuthModal(false);
    router.push("/copilot");
  };

  const handleSocialAuth = () => {
    loginAsDemoUser();
    setShowAuthModal(false);
    router.push("/copilot");
  };

  const handleAdminDemo = () => {
    loginAsDemoAdmin();
    setShowAuthModal(false);
    router.push("/copilot");
  };

  const openLoginModal = (signUp = false) => {
    setIsSignUp(signUp);
    setShowAuthModal(true);
  };

  if (!mounted || (isAuthenticated && !isLoading)) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center animate-pulse bg-[var(--accent-solid)] text-[var(--accent-contrast)]"
          >
            <Scale className="w-5 h-5" />
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {language === "bn" ? "লোড হচ্ছে..." : "Loading workspace..."}
          </span>
        </div>
      </div>
    );
  }

  const isBn = language === "bn";

  const testimonials = [
    {
      name: isBn ? "ব্যারিস্টার তারিকুল ইসলাম" : "Barrister Tariqul Islam",
      role: isBn ? "সিনিয়র পার্টনার, ইসলাম অ্যান্ড অ্যাসোসিয়েটস" : "Senior Partner, Islam & Associates",
      avatar: "/avatar_1.jpg",
      quote: isBn
        ? "“আগে ৫০ পাতার বাণিজ্যিক চুক্তি রিভিউ করতে ঘণ্টার পর ঘণ্টা সময় লাগত। Legal Copilot এর মাধ্যমে চুক্তির অসামঞ্জস্যপূর্ণ ধারা এবং দ্য কন্ট্রাক্ট অ্যাক্ট ১৮৭২ এর রেফারেন্স চোখের পলকে শনাক্ত করা সম্ভব হচ্ছে।”"
        : "“Legal Copilot transformed our contract audit workflow. Spotting void non-compete clauses under Section 27 and labor non-compliance takes seconds instead of hours.”",
      rating: 5,
    },
    {
      name: isBn ? "অ্যাডভোকেট শিরীন আক্তার" : "Advocate Shireen Akhter",
      role: isBn ? "সুপ্রিম কোর্ট অব বাংলাদেশ" : "Supreme Court of Bangladesh",
      avatar: "/avatar_2.jpg",
      quote: isBn
        ? "“জিরো হ্যালুসিনেশন ফিচারটি সত্যিই অসাধারণ। সাধারণ কোনো এআই নয়—সরাসরি bdlaws এর ধারা ও সুপ্রিম কোর্টের নজির সংযুক্ত থাকায় আত্মবিশ্বাসের সাথে ড্রাফট প্রস্তুত করা যায়।”"
        : "“Zero hallucination is real here. Having every risk tied directly to verifiable Bangladesh statutory provisions gives us complete advisory confidence.”",
      rating: 5,
    },
    {
      name: isBn ? "মাহমুদুল হাসান" : "Mahmudul Hasan",
      role: isBn ? "ব্যবস্থাপনা পরিচালক, ঢাকা টেক ভেনচার্স" : "Managing Director, Dhaka Tech Ventures",
      avatar: "/avatar_3.jpg",
      quote: isBn
        ? "“এসএমই এবং স্টার্টআপ হিসেবে বড় ল ফার্ম নিয়োগের আগে প্রাথমিক চুক্তি অডিট ও ক্লায়েন্ট-সাইড প্রাইভেসি নিশ্চিত করায় এটি আমাদের জন্য অপরিহার্য এক সঙ্গী।”"
        : "“As an SME founder, the client-side PII masking and instant contract risk scoring saved us from several unfavorable indemnity traps.”",
      rating: 5,
    },
  ];

  return (
    <div
      suppressHydrationWarning
      className="relative min-h-screen w-full flex flex-col font-sans transition-colors duration-200 overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]"
    >
      {/* Background Interactive DotField */}
      <div className="fixed inset-0 pointer-events-auto z-0 overflow-hidden">
        <DotField
          dotRadius={1.4}
          dotSpacing={16}
          bulgeStrength={65}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={450}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom={theme === "dark" ? "rgba(168, 85, 247, 0.3)" : "rgba(129, 140, 248, 0.35)"}
          gradientTo={theme === "dark" ? "rgba(216, 180, 254, 0.15)" : "rgba(192, 132, 252, 0.2)"}
          glowColor="transparent"
        />
      </div>

      {/* TOP NAVIGATION BAR (Adaptive in Light & Dark Mode) */}
      <header
        className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors border-neutral-200/80 dark:border-white/10"
        style={{
          backgroundColor: theme === "dark" ? "rgba(9, 9, 11, 0.85)" : "rgba(255, 255, 255, 0.88)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-[var(--accent-solid)] text-[var(--accent-contrast)]"
            >
              <Scale className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-[var(--text-primary)]">
              Legal Copilot<span className="text-indigo-600 dark:text-indigo-400">.</span>
            </span>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs sm:text-[13px] font-medium tracking-wide uppercase text-neutral-700 dark:text-neutral-300">
            <a href="#about" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <span className="text-indigo-600 dark:text-indigo-400">•</span>
              <span>{isBn ? "হোম" : "Home"}</span>
            </a>
            <a href="#about" className="hover:text-black dark:hover:text-white transition-colors">
              {isBn ? "পরিচিতি" : "About"}
            </a>
            <a href="#success-stories" className="hover:text-black dark:hover:text-white transition-colors">
              {isBn ? "সাফল্যের গল্প" : "Case Study"}
            </a>
            <a href="#services" className="hover:text-black dark:hover:text-white transition-colors">
              {isBn ? "সেবাসমূহ" : "Services"}
            </a>
            <a href="#consultation" className="hover:text-black dark:hover:text-white transition-colors">
              {isBn ? "আইনি পরামর্শ" : "Consultation"}
            </a>
          </nav>

          {/* Right Header Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(isBn ? "en" : "bn")}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm border border-neutral-300 dark:border-white/10 hover:border-neutral-500 bg-[var(--bg-card)] text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
            >
              <Globe2 className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>{isBn ? "EN" : "বাং"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-xs font-medium transition-all shadow-sm border border-neutral-300 dark:border-white/10 hover:border-neutral-500 bg-[var(--bg-card)] text-[var(--text-primary)] cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
            </button>

            {/* Login Modal Button - Styled like "Contact Us ↗" in reference */}
            <button
              type="button"
              onClick={() => openLoginModal(false)}
              className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all shadow-sm active:scale-[0.98] hover:opacity-90 flex items-center gap-1.5 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)]"
            >
              <span>{isBn ? "লগইন" : "Sign In"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* SECTION 1: HERO TITLE & CALL TO ACTION */}
        <section className="pt-16 sm:pt-24 pb-8 px-6 lg:px-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium uppercase tracking-tight leading-[1.15] mb-5 text-[var(--text-primary)]">
            {isBn ? (
              <>
                প্রতিটি আইনি পরিস্থিতিতে <br className="hidden sm:block" />
                আপনার নির্ভরযোগ্য সঙ্গী
              </>
            ) : (
              <>
                Your Legal Partner In <br className="hidden sm:block" />
                Every Situation
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed text-[var(--text-muted)] mb-8">
            {isBn
              ? "জটিল চুক্তি বিরোধ থেকে শুরু করে নিয়মিত করপোরেট ও বাণিজ্যিক পর্যালোচনা—বাংলাদেশের সংবিধিবদ্ধ আইনের শতভাগ নিশ্চয়তায় আমরা আপনার পাশে।"
              : "From Complex Contract Disputes To Everyday Corporate Compliance, We Deliver Strategic Statutory Solutions With Precision."}
          </p>

          <button
            type="button"
            onClick={() => openLoginModal(false)}
            className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 hover:opacity-90 flex items-center gap-2 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)]"
          >
            <span>{isBn ? "ফ্রি কনসাল্টেশন শুরু করুন" : "Start Free Consultation"}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </section>

        {/* SECTION 2: THE ICONIC STATUE HERO DISPLAY WITH FLOATING BADGES & WATERMARK */}
        <section className="relative w-full max-w-6xl mx-auto px-6 py-4 flex flex-col items-center justify-center overflow-hidden">
          {/* Watermark JUSTICE typography in background */}
          <div
            className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.06] dark:opacity-[0.05] tracking-widest font-serif font-black text-[120px] sm:text-[220px] md:text-[280px] text-neutral-900 dark:text-white"
            aria-hidden="true"
          >
            JUSTICE
          </div>

          <div className="relative w-full flex flex-col lg:flex-row items-center justify-between gap-8 z-10">
            {/* Left Micro-Copy */}
            <div className="w-full lg:w-1/4 text-center lg:text-left order-2 lg:order-1">
              <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
                {isBn ? (
                  <>
                    আমাদের লিগ্যাল ইন্টেলিজেন্স সিস্টেম{" "}
                    <strong className="text-[var(--text-primary)] font-semibold">
                      bdlaws এর সংবিধিবদ্ধ আইনের ধারা
                    </strong>{" "}
                    এবং সুপ্রিম কোর্টের হাজারো নজিরের ভিত্তিতে নির্ভুল সিদ্ধান্ত প্রদান করে।
                  </>
                ) : (
                  <>
                    Our contract intelligence draws upon{" "}
                    <strong className="text-[var(--text-primary)] font-semibold">
                      gazetted Bangladesh statutes
                    </strong>{" "}
                    with zero hallucination and verifiable legal grounding.
                  </>
                )}
              </p>
            </div>

            {/* Center: Lady Justice Statue Image */}
            <div className="relative w-72 sm:w-96 md:w-[420px] h-[380px] sm:h-[480px] md:h-[540px] flex items-center justify-center order-1 lg:order-2">
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/80 dark:border-white/10 group">
                <Image
                  src="/lady_justice.jpg"
                  alt="Lady Justice Bronze Statue with Scales of Justice"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
              </div>
            </div>

            {/* Right: Accolade Badges (Laurel Wreaths) */}
            <div className="w-full lg:w-1/4 flex flex-row lg:flex-col items-center lg:items-end justify-center gap-6 order-3">
              <div className="flex items-center gap-3 text-right">
                <div className="text-right">
                  <div className="text-xs font-serif font-bold uppercase tracking-wider text-[var(--text-primary)]">Top Advocate</div>
                  <div className="text-[10px] text-[var(--text-muted)]">bdlaws Verified 2026</div>
                </div>
                <div className="w-10 h-10 rounded-full border border-neutral-300 dark:border-white/20 bg-[var(--bg-card)] flex items-center justify-center text-amber-500 font-serif text-sm shadow-sm">
                  ★
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div className="text-right">
                  <div className="text-xs font-serif font-bold uppercase tracking-wider text-[var(--text-primary)]">Trusted AI</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Zero Hallucination</div>
                </div>
                <div className="w-10 h-10 rounded-full border border-neutral-300 dark:border-white/20 bg-[var(--bg-card)] flex items-center justify-center text-amber-500 font-serif text-sm shadow-sm">
                  ★
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: EDITORIAL MISSION STATEMENT & STATS ROW */}
        <section id="about" className="py-20 px-6 lg:px-10 max-w-5xl mx-auto text-center">
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal leading-[1.35] tracking-tight mb-16 max-w-4xl mx-auto text-neutral-800 dark:text-neutral-200">
            {isBn ? (
              <>
                Legal Copilot-এ আমরা বুদ্ধিমত্তা, নিখুঁত ধারা যাচাইকরণ এবং{" "}
                <span className="font-semibold text-black dark:text-white underline decoration-indigo-500/50 underline-offset-4">
                  ক্লায়েন্ট-কেন্দ্রিক বিশ্বস্ততার
                </span>{" "}
                সমন্বয়ে আইনি সেবা প্রদান করি। প্রতিটি পদক্ষেপে আইনি নিশ্চয়তায় আমরা আপনার পাশে।
              </>
            ) : (
              <>
                At Legal Copilot, We Deliver Smart Legal Solutions Through Expertise, Precision, And A{" "}
                <span className="font-semibold text-black dark:text-white underline decoration-indigo-500/50 underline-offset-4">
                  Client Focused Mindset
                </span>
                . Backed By Integrity And Results, We Support You Every Step Of The Way.
              </>
            )}
          </p>

          {/* Stats Bar with Center "Scroll Down" Circular Indicator */}
          <div className="relative pt-10 border-t border-neutral-200 dark:border-white/10">
            {/* Circular Scroll Down Button in the center (as seen in LexCore reference) */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById("success-stories");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="group relative w-12 h-12 rounded-full border border-neutral-300 dark:border-white/20 bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-primary)] shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Scroll down to case studies"
              >
                <ChevronDown className="w-5 h-5 text-neutral-500 group-hover:text-indigo-500 transition-colors animate-bounce" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
              <div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-1 text-neutral-900 dark:text-white">
                  99.4%
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {isBn ? "আইনি ধারা নিশ্চয়তা" : "Statutory Accuracy"}
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-1 text-neutral-900 dark:text-white">
                  1,200+
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {isBn ? "চুক্তি সফলভাবে অডিট" : "Contracts Audited"}
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-1 text-neutral-900 dark:text-white">
                  98%
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {isBn ? "আইনজীবী সন্তুষ্টি" : "Counsel Approval"}
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-1 text-neutral-900 dark:text-white">
                  100%
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {isBn ? "সার্বভৌম ডেটা গোপনীয়তা" : "PII Redaction"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: POWERFUL SUCCESS STORIES / TESTIMONIALS */}
        <section id="success-stories" className="py-20 px-6 lg:px-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                {isBn ? "সাফল্যের গল্প ও রিভিউ" : "Client Success Stories"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-normal tracking-tight text-[var(--text-primary)]">
                {isBn
                  ? "অভিজ্ঞতা ও কৌশলের মাধ্যমে সফল সমাধান"
                  : "Powerful Success Stories Driven By Strategy And Experience"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => openLoginModal(false)}
              className="self-start md:self-auto px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border border-neutral-300 dark:border-white/10 hover:border-neutral-900 dark:hover:border-white flex items-center gap-1.5 transition-all bg-[var(--bg-card)] text-[var(--text-primary)] cursor-pointer"
            >
              <span>{isBn ? "সব রিভিউ দেখুন" : "View Success Stories"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: User Selectors */}
            <div className="lg:col-span-4 flex lg:flex-col gap-4 justify-between sm:justify-start overflow-x-auto pb-2 lg:pb-0">
              {testimonials.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTestimonial(idx)}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all text-left cursor-pointer border ${
                    activeTestimonial === idx
                      ? "border-neutral-900 dark:border-white bg-neutral-100 dark:bg-white/10 shadow-sm"
                      : "border-transparent hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative border border-neutral-300 dark:border-white/20">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[var(--text-primary)]">{t.name}</div>
                    <div className="text-xs text-[var(--text-muted)] line-clamp-1">{t.role}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right: Featured Testimonial Box (Warm dark card styling) */}
            <div
              className="lg:col-span-8 rounded-3xl p-8 sm:p-12 border border-neutral-800 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]"
              style={{ backgroundColor: "#1e1713" }}
            >
              <div className="relative z-10">
                <Quote className="w-8 h-8 text-amber-500/50 mb-4" />
                <p className="text-base sm:text-xl font-serif font-light leading-relaxed mb-8 text-neutral-100">
                  {testimonials[activeTestimonial].quote}
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-neutral-700/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">
                    {testimonials[activeTestimonial].name}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {testimonials[activeTestimonial].role}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: SCHEDULE A CONSULTATION / ADVISORY WORKSPACE */}
        <section id="consultation" className="py-20 px-6 lg:px-10 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Consultation Form */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                {isBn ? "সরাসরি আইনি পরামর্শ" : "Schedule A Consultation"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-normal tracking-tight mb-4 text-[var(--text-primary)]">
                {isBn
                  ? "আমাদের বিশেষজ্ঞদের সাথে অ্যাপয়েন্টমেন্ট বুক করুন"
                  : "Schedule A Consultation With Our Legal Experts"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
                {isBn
                  ? "আপনার চুক্তি অথবা যেকোনো আইনি জটিলতায় আমাদের সুপ্রিম কোর্ট আইনজীবী প্যানেল ও এআই কোপাইলট প্রস্তুত।"
                  : "Take the first step toward resolving your legal matters with confidence. Our team provides clear guidance tailored to your needs."}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  openLoginModal(false);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={isBn ? "প্রথম নাম" : "First Name"}
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors border-neutral-300 dark:border-white/10 focus:border-neutral-900 dark:focus:border-white bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-neutral-400"
                  />
                  <input
                    type="text"
                    placeholder={isBn ? "শেষ নাম" : "Last Name"}
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors border-neutral-300 dark:border-white/10 focus:border-neutral-900 dark:focus:border-white bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-neutral-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder={isBn ? "ইমেইল অ্যাড্রেস" : "Email Address"}
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors border-neutral-300 dark:border-white/10 focus:border-neutral-900 dark:focus:border-white bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-neutral-400"
                  />
                  <input
                    type="tel"
                    placeholder={isBn ? "ফোন নম্বর" : "Phone Number"}
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors border-neutral-300 dark:border-white/10 focus:border-neutral-900 dark:focus:border-white bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-neutral-400"
                  />
                </div>

                <select
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors border-neutral-300 dark:border-white/10 focus:border-neutral-900 dark:focus:border-white bg-[var(--bg-card)] text-[var(--text-primary)]"
                >
                  <option value="">{isBn ? "সেবা নির্বাচন করুন..." : "Select Legal Service..."}</option>
                  <option value="contract">{isBn ? "বাণিজ্যিক চুক্তি অডিট" : "Commercial Contract Audit"}</option>
                  <option value="labor">{isBn ? "শ্রম আইন ২০০৬ সম্মতি" : "Labor Law 2006 Compliance"}</option>
                  <option value="arbitration">{isBn ? "আরবিট্রেশন ও বিরোধ নিষ্পত্তি" : "Arbitration & Dispute"}</option>
                </select>

                <textarea
                  rows={3}
                  placeholder={isBn ? "আপনার চুক্তি বা বিরোধের সংক্ষেপ..." : "Message or specific contract details..."}
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors border-neutral-300 dark:border-white/10 focus:border-neutral-900 dark:focus:border-white bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-neutral-400"
                />

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 hover:opacity-90 flex items-center gap-2 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)]"
                >
                  <span>{isBn ? "অ্যাপয়েন্টমেন্ট নিশ্চিত করুন" : "Confirm Your Appointment"}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right: Consultation Scene */}
            <div className="relative w-full h-[360px] sm:h-[440px] rounded-3xl overflow-hidden border border-neutral-300/80 dark:border-white/10 shadow-xl group">
              <Image
                src="/consultation.jpg"
                alt="Lawyer and client discussing legal contract"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                  {isBn ? "চেম্বার কনসাল্টেশন" : "In-Chamber & AI Review"}
                </div>
                <div className="text-sm font-serif">
                  {isBn
                    ? "আইনি নিশ্চয়তা এবং পেশাদারিত্বের সমন্বয়ে সেবা"
                    : "Backed by seasoned advocates & autonomous contract intelligence"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: FOOTER WITH OVERSIZED BRAND TYPOGRAPHY */}
        <footer
          className="mt-auto border-t border-neutral-200/80 dark:border-white/10 pt-16 pb-12 px-6 lg:px-10 bg-[var(--bg-surface)] text-[var(--text-primary)]"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
              {/* Col 1: Brand Info */}
              <div>
                <div className="font-serif font-bold text-2xl tracking-tight mb-3 text-[var(--text-primary)]">
                  Legal Copilot<span className="text-indigo-600 dark:text-indigo-400">.</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                  {isBn
                    ? "বাংলাদেশের প্রথম সার্বভৌম ও সংবিধিবদ্ধ আইন সমর্থিত লিগ্যাল কোপাইলট।"
                    : "Reliable Legal Solutions Focused On Protecting Your Rights With Clarity, Integrity, And Results."}
                </p>
                <div className="text-xs text-[var(--text-muted)]">
                  Dhaka, Bangladesh • Supreme Court Chamber
                </div>
              </div>

              {/* Col 2: Quick Links */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-4 text-[var(--text-primary)]">
                  {isBn ? "কুইক লিংকস" : "Quick Links"}
                </div>
                <ul className="space-y-2 text-xs text-[var(--text-muted)]">
                  <li><a href="#about" className="hover:text-black dark:hover:text-white transition-colors">{isBn ? "হোম" : "Home"}</a></li>
                  <li><a href="#about" className="hover:text-black dark:hover:text-white transition-colors">{isBn ? "আমাদের সম্পর্কে" : "About"}</a></li>
                  <li><a href="#services" className="hover:text-black dark:hover:text-white transition-colors">{isBn ? "সেবাসমূহ" : "Services"}</a></li>
                  <li><a href="#success-stories" className="hover:text-black dark:hover:text-white transition-colors">{isBn ? "সাফল্যের গল্প" : "Case Study"}</a></li>
                </ul>
              </div>

              {/* Col 3: Services */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-4 text-[var(--text-primary)]">
                  {isBn ? "আইনি সেবা" : "Services"}
                </div>
                <ul className="space-y-2 text-xs text-[var(--text-muted)]">
                  <li>{isBn ? "বাণিজ্যিক চুক্তি অডিট" : "Commercial Contract Audit"}</li>
                  <li>{isBn ? "দ্য কন্ট্রাক্ট অ্যাক্ট ১৮৭২ রিভিউ" : "Contract Act 1872 Review"}</li>
                  <li>{isBn ? "শ্রম আইন ২০০৬ সম্মতি" : "Labor Act Compliance"}</li>
                  <li>{isBn ? "আরবিট্রেশন ধারা যাচাই" : "Arbitration Clause Check"}</li>
                </ul>
              </div>

              {/* Col 4: Contact & Social */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-4 text-[var(--text-primary)]">
                  {isBn ? "যোগাযোগ" : "Contact Info"}
                </div>
                <div className="text-xs text-[var(--text-muted)] space-y-1.5 mb-4">
                  <div>info@legalcopilot.bd</div>
                  <div>Dhaka Chamber, Bangladesh</div>
                </div>
                <button
                  type="button"
                  onClick={handleAdminDemo}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-neutral-300 dark:border-white/20 hover:border-neutral-800 dark:hover:border-white transition-colors bg-[var(--bg-card)] text-[var(--text-primary)] cursor-pointer"
                >
                  {isBn ? "অ্যাডভোকেট ডেমো চালান" : "Run Advocate Demo"}
                </button>
              </div>
            </div>

            {/* Oversized Brand Watermark Typography */}
            <div className="pt-8 border-t border-neutral-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-3xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight text-neutral-300/80 dark:text-white/10 select-none">
                Legal Copilot.
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                © {new Date().getFullYear()} Outliers. {isBn ? "সর্বস্বত্ব সংরক্ষিত।" : "All Rights Reserved."}
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* ============================================================== */}
      {/* POPUP LOGIN / SIGNUP MODAL (Claude / ChatGPT style modal)     */}
      {/* ============================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAuthModal(false)}
          />

          {/* Modal Container */}
          <div
            className="relative w-full max-w-[1020px] min-h-[580px] md:min-h-[640px] rounded-[32px] p-3 md:p-4 shadow-2xl border border-neutral-200/80 dark:border-white/10 flex flex-col md:flex-row transition-all z-10 animate-in zoom-in-95 duration-200 bg-[var(--bg-card)] text-[var(--text-primary)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 z-30 p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Visual Hero Banner */}
            <div
              className="relative w-full md:w-[48%] rounded-[24px] p-8 md:p-12 flex flex-col justify-between overflow-hidden shrink-0 min-h-[280px] md:min-h-auto bg-[var(--bg-surface)]"
            >
              {/* Animated GradientWaves WebGL Background */}
              <div className="absolute inset-0 pointer-events-auto z-0 overflow-hidden">
                <GradientWaves
                  horizonColor={theme === "dark" ? "#1e1b4b" : "#5227FF"}
                  waveColor={theme === "dark" ? "#818cf8" : "#FF9FFC"}
                  crestColor={theme === "dark" ? "#e0e7ff" : "#FFFFFF"}
                  speed={0.4}
                  amplitude={2.5}
                  waveScale={0.6}
                  waveRatio={0.9}
                  swell={35}
                  turbulence={20}
                  tilt={1.11}
                  zoom={1}
                  height={5.5}
                  fogDepth={15}
                  detail="medium"
                  brightness={1}
                  opacity={theme === "dark" ? 0.85 : 0.9}
                  mouseInteraction
                  parallaxStrength={0.5}
                  grain
                  grainIntensity={0.05}
                />
              </div>

              {/* Top Brand Logo & Name */}
              <div className="relative z-10 flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm bg-[var(--accent-solid)] text-[var(--accent-contrast)]"
                >
                  <Scale className="w-4 h-4" />
                </div>
                <span className="font-semibold text-base tracking-tight text-[var(--text-primary)]">
                  Legal Copilot
                </span>
              </div>

              {/* Bottom Headline & Tagline */}
              <div className="relative z-10 pt-12 md:pt-0">
                <span
                  className="text-xs font-semibold uppercase tracking-wider block mb-2 text-[var(--text-muted)]"
                >
                  {isBn ? "আইনি নিশ্চয়তা ও প্রফেশনাল বুদ্ধিমত্তা" : "Sovereign Contract Intelligence"}
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-serif font-normal leading-[1.22] tracking-tight mb-3 text-[var(--text-primary)]"
                >
                  {isBn
                    ? "চুক্তির প্রতিটি ধারা বিশ্লেষণ করুন শতভাগ নিশ্চয়তায়"
                    : "Analyze every clause with zero statutory hallucination."}
                </h2>
                <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--text-muted)]">
                  {isBn
                    ? "বাংলাদেশের সংবিধিবদ্ধ আইন (bdlaws), শ্রম আইন ও চুক্তি আইনের নির্ভরযোগ্য যাচাইকরণ প্ল্যাটফর্ম।"
                    : "Verify legal risks, align compliance with Bangladesh statutes, and audit contracts in seconds."}
                </p>
              </div>
            </div>

            {/* Right Authentication Form Pane */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 md:px-12 py-8 md:py-10">
              <div className="w-full max-w-[380px] mx-auto">
                <div className="mb-4">
                  <span className="inline-block text-xl text-amber-500 font-serif leading-none select-none">
                    ✱
                  </span>
                </div>

                <h2
                  className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-[var(--text-primary)]"
                >
                  {isSignUp
                    ? isBn
                      ? "নতুন অ্যাকাউন্ট খুলুন"
                      : "Create an account"
                    : isBn
                    ? "স্বাগতম, ফিরে আসার জন্য ধন্যবাদ"
                    : "Welcome back"}
                </h2>
                <p className="text-xs sm:text-[13px] leading-relaxed mb-6 text-[var(--text-muted)]">
                  {isSignUp
                    ? isBn
                      ? "আপনার প্রতিষ্ঠানের চুক্তি ও আইনি ডকুমেন্টস নিরাপদে অডিট করতে শুরু করুন।"
                      : "Start auditing contracts and checking statutory compliance seamlessly."
                    : isBn
                    ? "আপনার সংরক্ষিত চুক্তি, অডিট রিপোর্ট এবং আইনি কনসাল্টেশনে প্রবেশ করুন।"
                    : "Sign in to access your audit workspace, legal memos, and verified citations."}
                </p>

                {/* Credentials Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {isSignUp && (
                    <div>
                      <label
                        className="block text-xs font-semibold mb-1 text-[var(--text-primary)]"
                      >
                        {isBn ? "পুরো নাম" : "Full name"}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isBn ? "ব্যারিস্টার / অ্যাডভোকেট / আপনার নাম" : "e.g. Tariqul Islam"}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors border-neutral-300 dark:border-white/10 focus:border-neutral-900 dark:focus:border-white bg-transparent text-[var(--text-primary)]"
                      />
                    </div>
                  )}

                  <div>
                    <label
                      className="block text-xs font-semibold mb-1 text-[var(--text-primary)]"
                    >
                      {isBn ? "ইমেইল অ্যাড্রেস" : "Your email"}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isBn ? "advocate@supremecourt.bd" : "counsel@lawfirm.com"}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors border-neutral-300 dark:border-white/10 focus:border-neutral-900 dark:focus:border-white bg-transparent text-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-semibold mb-1 text-[var(--text-primary)]"
                    >
                      {isSignUp
                        ? isBn
                          ? "পাসওয়ার্ড দিন"
                          : "Create password"
                        : isBn
                        ? "পাসওয়ার্ড"
                        : "Password"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm border outline-none transition-colors border-neutral-300 dark:border-white/10 focus:border-neutral-900 dark:focus:border-white bg-transparent text-[var(--text-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.99] hover:opacity-90 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)]"
                    >
                      {isSignUp
                        ? isBn
                          ? "অ্যাকাউন্ট খুলুন ও অ্যাপে প্রবেশ করুন"
                          : "Create account & launch app"
                        : isBn
                        ? "লগইন করুন ও অ্যাপে প্রবেশ করুন"
                        : "Sign in to workspace"}
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="relative my-5 flex items-center justify-center">
                  <div className="w-full border-t border-neutral-200 dark:border-white/10" />
                  <span
                    className="absolute px-3 text-[11px] uppercase tracking-wider font-semibold bg-[var(--bg-card)] text-[var(--text-muted)]"
                  >
                    {isBn ? "অথবা" : "or continue with"}
                  </span>
                </div>

                {/* Social Auth Buttons */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={handleSocialAuth}
                    className="py-2 px-3 rounded-xl border border-neutral-300 dark:border-white/10 flex items-center justify-center transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800/60 active:scale-95 cursor-pointer text-[var(--text-primary)]"
                    aria-label="Continue with Google"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleSocialAuth}
                    className="py-2 px-3 rounded-xl border border-neutral-300 dark:border-white/10 flex items-center justify-center transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800/60 active:scale-95 cursor-pointer text-[var(--text-primary)]"
                    aria-label="Continue with GitHub"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleSocialAuth}
                    className="py-2 px-3 rounded-xl border border-neutral-300 dark:border-white/10 flex items-center justify-center transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800/60 active:scale-95 cursor-pointer text-[var(--text-primary)]"
                    aria-label="Continue with Apple"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-1.97.6-2.61 1.35-.57.65-1.06 1.71-.93 2.73.99.08 2.01-.5 2.62-1.23z" />
                    </svg>
                  </button>
                </div>

                {/* Bottom Toggle between Sign In / Sign Up */}
                <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
                  <span>
                    {isSignUp
                      ? isBn
                        ? "ইতিমধ্যে অ্যাকাউন্ট আছে? "
                        : "Already have an account? "
                      : isBn
                      ? "অ্যাকাউন্ট নেই? "
                      : "Don't have an account? "}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity ml-1 cursor-pointer text-[var(--text-primary)]"
                  >
                    {isSignUp
                      ? isBn
                        ? "লগইন করুন"
                        : "Sign in"
                      : isBn
                        ? "নিবন্ধন করুন"
                        : "Register"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
