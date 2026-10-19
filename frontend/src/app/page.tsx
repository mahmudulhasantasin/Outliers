"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Scale,
  ArrowUpRight,
  Sun,
  Moon,
  Eye,
  EyeOff,
  X,
  Globe2,
  Star,
  Quote,
  ChevronDown,
  User,
  Scale as ScaleIcon,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Phone,
  Gavel,
  Mail,
  Users,
  Sparkles,
  AlertTriangle,
  Plus,
  ChevronRight,
  Check,
  Shield,
  Lock,
} from "lucide-react";
import GradientWaves from "@/components/effects/GradientWaves";

type RegistrationStep = "role" | "form" | "otp";
type SelectedRole = "general" | "lawyer" | "enterprise" | null;
type EnterpriseTab = "company" | "member";

export default function LandingAndAuthPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const {
    isAuthenticated,
    isLoading,
    login,
    registerEmail,
    verifyOtp,
    resendOtp,
    onboardLawyer,
    onboardEnterprise,
    user,
  } = useAuth();

  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [pendingOtpEmail, setPendingOtpEmail] = useState("");

  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // ── Registration multi-step state ──
  const [regStep, setRegStep] = useState<RegistrationStep>("role");
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);

  // ── Diagram Common Fields ──
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("male");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ── Lawyer Specific Fields ──
  const [barCouncilNo, setBarCouncilNo] = useState("");
  const [fieldOfLaw, setFieldOfLaw] = useState("Corporate & Commercial Law");

  // ── Enterprise Specific Fields ──
  const [entTab, setEntTab] = useState<EnterpriseTab>("company");
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("Private Limited");
  const [registrationNo, setRegistrationNo] = useState("");
  const [tinNo, setTinNo] = useState("");
  const [adminName, setAdminName] = useState("");
  const [memberCount, setMemberCount] = useState(10);
  const [companyReferCode, setCompanyReferCode] = useState("");

  // ── Email OTP State ──
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");

  // ── Login fields ──
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showAuthModal) closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAuthModal]);

  const closeModal = () => {
    setShowAuthModal(false);
    setRegStep("role");
    setSelectedRole(null);
    setPasswordError("");
    setOtpInput("");
    setOtpError("");
  };

  const openLoginModal = (signUp = false) => {
    setIsSignUp(signUp);
    setRegStep("role");
    setSelectedRole(null);
    setPasswordError("");
    setOtpInput("");
    setOtpError("");
    setShowAuthModal(true);
  };

  // Login submit — real API
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const loggedInUser = await login({ email: loginEmail, password: loginPassword });
      closeModal();
      // Route by role
      const role = loggedInUser?.role;
      if (role === "lawyer") router.push("/lawyer/pending");
      else if (role === "enterprise_admin" || role === "enterprise") router.push("/enterprise/admin");
      else if (role === "enterprise_member") router.push("/enterprise/member");
      else router.push("/copilot");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Registration form submit → call backend, move to OTP step
  const handleStartFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 6) {
      setPasswordError(
        language === "bn"
          ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"
          : "Password must be at least 6 characters."
      );
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setPasswordError(
        language === "bn"
          ? "পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মিলছে না।"
          : "Passwords do not match."
      );
      return;
    }
    setPasswordError("");
    setAuthError("");
    setAuthLoading(true);
    try {
      if (selectedRole === "enterprise" && entTab === "member") {
        // Enterprise member registration
        const res = await registerEmail({
          email: regEmail,
          password: regPassword,
          confirm_password: regConfirmPassword,
          full_name: `${firstName} ${lastName}`.trim() || "Member",
          phone: undefined,
          date_of_birth: dob || undefined,
          gender,
        });
        setPendingOtpEmail(res.email);
      } else {
        const res = await registerEmail({
          email: regEmail,
          password: regPassword,
          confirm_password: regConfirmPassword,
          full_name: `${firstName} ${lastName}`.trim() || "User",
          phone: undefined,
          date_of_birth: dob || undefined,
          gender,
        });
        setPendingOtpEmail(res.email);
      }
      setOtpInput("");
      setOtpError("");
      setRegStep("otp");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : language === "bn"
          ? "নিবন্ধন ব্যর্থ হয়েছে। ইনপুটগুলো পুনরায় চেক করুন।"
          : "Registration failed. Please check your inputs.";

      if (
        msg.toLowerCase().includes("exists") ||
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("registered")
      ) {
        // Email already registered — switch to sign-in view
        setAuthError(
          language === "bn"
            ? "এই ইমেইল ইতিমধ্যে নিবন্ধিত। অনুগ্রহ করে লগইন করুন।"
            : "This email is already registered. Please log in."
        );
        setLoginEmail(regEmail);
        setIsSignUp(false);
      } else if (msg.toLowerCase().includes("password") && msg.toLowerCase().includes("6")) {
        setPasswordError(
          language === "bn"
            ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"
            : "Password must be at least 6 characters."
        );
      } else {
        setAuthError(msg);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // OTP verify — real API, then onboard if lawyer/enterprise
  const handleVerifyOtpAndComplete = async () => {
    if (!otpInput.trim() || otpInput.trim().length < 4) {
      setOtpError(
        language === "bn"
          ? "সঠিক ওটিপি কোডটি লিখুন (যেমন: 123456)।"
          : "Enter a valid OTP code (e.g., 123456)."
      );
      return;
    }
    setOtpError("");
    setAuthLoading(true);
    try {
      const verifiedProfile = await verifyOtp({ email: pendingOtpEmail || regEmail, otp: otpInput.trim() });

      // After OTP verification, handle lawyer / enterprise onboarding & routing
      if (selectedRole === "lawyer") {
        try {
          await onboardLawyer({
            bar_council_id: barCouncilNo.trim(),
            field_of_law: fieldOfLaw.trim(),
            specializations: [fieldOfLaw.trim()],
          });
        } catch (onboardErr) {
          console.error("Lawyer onboard failed:", onboardErr);
        }
        closeModal();
        // LAWYERS GO TO LAWYER PORTAL (NOT COPILOT!)
        router.push("/lawyer/pending");
        return;
      } else if (selectedRole === "enterprise" && entTab === "company") {
        try {
          await onboardEnterprise({
            company_name: companyName,
            company_type: companyType,
            registration_no: registrationNo,
            tin_no: tinNo,
            member_limit: memberCount,
            billing_email: regEmail,
          });
        } catch (onboardErr) {
          console.error("Enterprise onboard failed:", onboardErr);
        }
        closeModal();
        router.push("/enterprise/admin");
        return;
      } else if (selectedRole === "enterprise" && entTab === "member") {
        closeModal();
        router.push("/enterprise/member");
        return;
      }

      closeModal();
      // General user goes to copilot
      router.push("/copilot");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : language === "bn"
          ? "অবৈধ বা মেয়াদোত্তীর্ণ ওটিপি কোড।"
          : "Invalid or expired OTP code.";
      setOtpError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Resend OTP
  const [resendStatus, setResendStatus] = useState("");
  const handleResendOtp = async () => {
    try {
      await resendOtp(pendingOtpEmail || regEmail);
      setResendStatus(language === "bn" ? "নতুন ওটিপি কোড পাঠানো হয়েছে।" : "New OTP code requested.");
      setOtpInput("123456");
    } catch {
      setResendStatus(language === "bn" ? "টেস্ট কোড 123456 ব্যবহার করুন।" : "Use test code 123456.");
      setOtpInput("123456");
    }
  };

  const isBn = language === "bn";

  const testimonials = [
    {
      name: isBn ? "ব্যারিস্টার তারিকুল ইসলাম" : "Barrister Tariqul Islam",
      role: isBn ? "সিনিয়র পার্টনার, ইসলাম অ্যান্ড অ্যাসোসিয়েটস" : "Senior Partner, Islam & Associates",
      avatar: "/avatar_1.jpg",
      quote: isBn
        ? '“আগে ৫০ পাতার বাণিজ্যিক চুক্তি রিভিউ করতে ঘণ্টার পর ঘণ্টা সময় লাগত। Legal Copilot এর মাধ্যমে চুক্তির অসামঞ্জস্যপূর্ণ ধারা এবং দ্য কন্ট্রাক্ট অ্যাক্ট ১৮৭২ এর রেফারেন্স চোখের পলকে শনাক্ত করা সম্ভব হচ্ছে।”'
        : '“Legal Copilot transformed our contract audit workflow. Spotting void non-compete clauses under Section 27 and labor non-compliance takes seconds instead of hours.”',
      rating: 5,
    },
    {
      name: isBn ? "অ্যাডভোকেট শিরীন আক্তার" : "Advocate Shireen Akhter",
      role: isBn ? "সুপ্রিম কোর্ট অব বাংলাদেশ" : "Supreme Court of Bangladesh",
      avatar: "/avatar_2.jpg",
      quote: isBn
        ? '“জিরো হ্যালুসিনেশন ফিচারটি সত্যিই অসাধারণ। সাধারণ কোনো এআই নয়—সরাসরি bdlaws এর ধারা ও সুপ্রিম কোর্টের নজির সংযুক্ত থাকায় আত্মবিশ্বাসের সাথে ড্রাফট প্রস্তুত করা যায়।”'
        : '“Zero hallucination is real here. Having every risk tied directly to verifiable Bangladesh statutory provisions gives us complete advisory confidence.”',
      rating: 5,
    },
    {
      name: isBn ? "মাহমুদুল হাসান" : "Mahmudul Hasan",
      role: isBn ? "ব্যবস্থাপনা পরিচালক, ঢাকা টেক ভেনচার্স" : "Managing Director, Dhaka Tech Ventures",
      avatar: "/avatar_3.jpg",
      quote: isBn
        ? '“এসএমই এবং স্টার্টআপ হিসেবে বড় ল ফার্ম নিয়োগের আগে প্রাথমিক চুক্তি অডিট ও ক্লায়েন্ট-সাইড প্রাইভেসি নিশ্চিত করায় এটি আমাদের জন্য অপরিহার্য এক সঙ্গী।”'
        : '“As an SME founder, the client-side PII masking and instant contract risk scoring saved us from several unfavorable indemnity traps.”',
      rating: 5,
    },
  ];

  /* ─── shared border colour for light/dark ─── */
  const borderClass = "border-[var(--text-primary)]/10";

  return (
    <div
      suppressHydrationWarning
      className="relative min-h-screen w-full flex flex-col font-sans transition-colors duration-200 overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]"
    >
      {/* ═══════════════════════════════════════════════════ */}
      {/* TOP NAVIGATION BAR                                */}
      {/* ═══════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-40 w-full backdrop-blur-xl transition-colors"
        style={{
          backgroundColor:
            theme === "dark"
              ? "rgba(29, 29, 27, 0.85)"
              : "rgba(231, 231, 221, 0.88)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-[var(--accent-solid)] text-[var(--accent-contrast)]">
              <Scale className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-[var(--text-primary)]">
              Legal Copilot<span className="text-indigo-600 dark:text-indigo-400">.</span>
            </span>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs sm:text-[13px] font-medium tracking-wide uppercase text-[var(--text-muted)]">
            <a href="#" className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <span className="text-indigo-600 dark:text-indigo-400">•</span>
              <span>{isBn ? "হোম" : "Home"}</span>
            </a>
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "ফিচারসমূহ" : "Features"}</a>
            <a href="#for-whom" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "কার জন্য" : "Who Is It For"}</a>
            <a href="#reviews" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "রিভিউ" : "Reviews"}</a>
            <a href="#consultation" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "আইনি পরামর্শ" : "Consultation"}</a>
          </nav>

          {/* Right Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(isBn ? "en" : "bn")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm border ${borderClass} hover:border-[var(--text-primary)]/30 bg-[var(--bg-card)] text-[var(--text-primary)] flex items-center gap-1 cursor-pointer`}
            >
              <Globe2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>{isBn ? "EN" : "বাং"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl text-xs font-medium transition-all shadow-sm border ${borderClass} hover:border-[var(--text-primary)]/30 bg-[var(--bg-card)] text-[var(--text-primary)] cursor-pointer`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--text-muted)]" />
              )}
            </button>

            {/* Auth Action */}
            {mounted && isAuthenticated ? (
              <button
                type="button"
                onClick={() => router.push(user?.role === "lawyer" ? "/lawyer/pending" : "/copilot")}
                className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all shadow-sm active:scale-[0.98] hover:opacity-90 flex items-center gap-1.5 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)]"
              >
                <span>{isBn ? "ওয়ার্কস্পেস" : "Workspace"}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal(false)}
                className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all shadow-sm active:scale-[0.98] hover:opacity-90 flex items-center gap-1.5 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)]"
              >
                <span>{isBn ? "লগইন" : "Sign In"}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════ */}
      {/* MAIN CONTENT - REDESIGNED & ANIMATED                */}
      {/* ═══════════════════════════════════════════════════ */}
      <main className="relative z-10 flex-1 flex flex-col">

        {/* ── SECTION 1: EDITORIAL LUXURY HERO (MATCHING REFERENCE DESIGN WITH VIDEO) ── */}
        <section className="relative min-h-[90vh] lg:min-h-[94vh] w-full max-w-7xl mx-auto px-6 lg:px-12 pt-6 sm:pt-10 pb-16 flex flex-col justify-between overflow-hidden">
          
          {/* Subtle Ambient Studio Light Gradients */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-700/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Central Hero Composition Grid */}
          <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 lg:pt-8 flex-1">

            {/* ── Left Column: Editorial Headline & Actions (lg:col-span-6) ── */}
            <div className="lg:col-span-6 flex flex-col justify-center text-left z-20">
              
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[var(--text-muted)]">
                  {isBn ? "বাংলাদেশের সংবিধিবদ্ধ লিগ্যাল প্ল্যাটফর্ম" : "Sovereign Legal Intelligence"}
                </span>
              </div>

              {/* Massive Bold Architectural Typography */}
              <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-sans font-black tracking-tight leading-[1.04] uppercase text-[var(--text-primary)] mb-6">
                {isBn ? (
                  <>
                    সমাধান করুন <br />
                    আইনি বিষয় <br />
                    <span className="text-[var(--text-muted)] font-light">শতভাগ নিশ্চিন্তে</span>
                  </>
                ) : (
                  <>
                    SOLVING LEGAL <br />
                    MATTERS WITH <br />
                    <span className="text-[var(--text-muted)] font-light">CONFIDENCE</span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md leading-relaxed mb-8">
                {isBn
                  ? "আপনার অধিকার সুরক্ষা ও ভবিষ্যৎ চুক্তি নিরাপত্তায় নিবেদিত বাংলাদেশের প্রথম সংবিধিবদ্ধ এআই লিগ্যাল প্ল্যাটফর্ম।"
                  : "A Dedicated Legal & AI Platform Committed to Protecting Your Rights, Reviewing Contracts, and Securing Your Future."}
              </p>

              {/* Action Buttons (Orange Primary + Modern Secondary) */}
              <div className="flex items-center gap-4 mb-10">
                <button
                  type="button"
                  onClick={() => openLoginModal(false)}
                  className="px-7 py-3.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-lg active:scale-95 hover:opacity-95 flex items-center gap-2 cursor-pointer bg-[#f2591f] text-white hover:bg-[#e04f18]"
                >
                  <span>{isBn ? "পরামর্শ নিন" : "Contact Us"}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <a
                  href="#features"
                  className={`px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all border ${borderClass} hover:border-[var(--text-primary)]/40 flex items-center gap-2 cursor-pointer bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs`}
                >
                  <span>{isBn ? "বিস্তারিত জানুন" : "Learn More"}</span>
                </a>
              </div>

              {/* Floating Mini Feature: "PROTECTING EVERY DEAL YOU MAKE" */}
              <div className="inline-flex items-center gap-3.5 p-2.5 pr-5 rounded-2xl bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--text-primary)]/10 shadow-lg max-w-xs transition-all hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative border border-[var(--text-primary)]/10">
                  <Image
                    src="/avatar_2.jpg"
                    alt="Verified Lawyer"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] leading-tight">
                    {isBn ? "প্রতিটি চুক্তির সুরক্ষা" : "PROTECTING EVERY DEAL YOU MAKE"}
                  </div>
                  <button
                    type="button"
                    onClick={() => openLoginModal(false)}
                    className="text-[10px] uppercase font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-2 transition-colors cursor-pointer mt-0.5"
                  >
                    {isBn ? "শুরু করুন" : "GET STARTED"}
                  </button>
                </div>
              </div>

            </div>

            {/* ── Right Column: Video & Floating Glass Cards (lg:col-span-6) ── */}
            <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px] sm:min-h-[560px] lg:min-h-[620px]">
              
              {/* Top-Right Badge: "28K" + Avatars */}
              <div className="absolute top-2 right-2 sm:right-6 z-30 flex flex-col items-end text-right">
                <div className="text-3xl sm:text-4xl font-black font-sans tracking-tight text-[var(--text-primary)]">
                  28K+
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-[var(--bg-card)] overflow-hidden relative">
                      <Image src="/avatar_1.jpg" alt="user" fill className="object-cover" />
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-[var(--bg-card)] overflow-hidden relative">
                      <Image src="/avatar_2.jpg" alt="user" fill className="object-cover" />
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-[var(--bg-card)] overflow-hidden relative">
                      <Image src="/avatar_3.jpg" alt="user" fill className="object-cover" />
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[var(--text-primary)] text-[var(--bg-card)] flex items-center justify-center">
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 max-w-[130px] leading-tight text-right">
                  {isBn ? "বিশ্বস্ত পার্টনার হিসেবে সুরক্ষিত" : "Partner with us as we protect your rights"}
                </p>
              </div>

              {/* ── Central Character Container: High-End WebM Transparent Video ── */}
              <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[540px] aspect-square flex items-center justify-center z-10">
                
                {/* Backlight halo glow */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-t from-amber-500/20 via-orange-400/10 to-transparent blur-2xl pointer-events-none" />

                {/* Looping Smooth Video */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)] select-none pointer-events-none transform hover:scale-105 transition-transform duration-700"
                >
                  <source src="/hero-statue.webm" type="video/webm" />
                  <source src="/From Klickpin,com- Bedroom Decor Ideas That Look So Expensive 32388-pin-id-316026098874858134-Picsart-BackgroundRemover.webm" type="video/webm" />
                </video>
              </div>

              {/* ── Bottom-Right Floating Glassmorphic Card: "Case Closure Statistics" ── */}
              <div className="absolute -bottom-2 right-2 sm:right-4 z-30 p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--text-primary)]/15 shadow-2xl w-[240px] sm:w-[270px] transition-all hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] font-bold tracking-tight text-[var(--text-primary)]">
                    {isBn ? "কেস নিষ্পত্তি পরিসংখ্যান" : "Case Closure Statistics"}
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--text-primary)]/10">
                    Yearly ▾
                  </span>
                </div>

                {/* Bar Chart Visualization */}
                <div className="flex items-end justify-between gap-1.5 h-20 pt-2 px-1">
                  {[
                    { m: "Jan", h: "45%" },
                    { m: "Feb", h: "60%" },
                    { m: "Mar", h: "85%" },
                    { m: "Apr", h: "70%" },
                    { m: "May", h: "92%" },
                    { m: "Jun", h: "78%" },
                    { m: "Jul", h: "88%" },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className="w-full rounded-t-sm transition-all duration-500 hover:opacity-80"
                        style={{
                          height: bar.h,
                          backgroundColor: idx === 4 ? "#f2591f" : "var(--text-primary)",
                          opacity: idx === 4 ? 1 : 0.25 + idx * 0.1,
                        }}
                      />
                      <span className="text-[8px] font-mono text-[var(--text-muted)]">{bar.m}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── Bottom Strip: Minimal Social Icons & Scroll cue ── */}
          <div className="w-full pt-8 flex items-center justify-between text-xs text-[var(--text-muted)] z-20 border-t border-[var(--text-primary)]/5 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--text-primary)]/10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                📷
              </span>
              <span className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--text-primary)]/10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer font-bold">
                f
              </span>
              <span className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--text-primary)]/10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer font-bold">
                𝕏
              </span>
            </div>

            <div className="text-[11px] font-mono tracking-wider text-[var(--text-muted)] uppercase hidden sm:block">
              Dhaka, Bangladesh • Codified Statutory AI
            </div>

            <a
              href="#features"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <span>{isBn ? "নিচে স্ক্রোল করুন" : "Scroll to explore"}</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </a>
          </div>

        </section>



        {/* ── SECTION 2: APP ER MAIN DUITA FEATURE (LEGAL COPILOT & CONTRACTMIND) ── */}
        <section id="features" className="py-20 px-6 lg:px-10 max-w-6xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
              {isBn ? "অ্যাপের প্রধান দুই স্তম্ভ" : "Core Flagship Capabilities"}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight text-[var(--text-primary)] mb-4">
              {isBn ? "আইনি গবেষণা ও চুক্তি বিশ্লেষণের স্বয়ংক্রিয় শক্তি" : "Legal Copilot & ContractMind: Built for High Stakes"}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
              {isBn
                ? "আমাদের প্ল্যাটফর্ম শুধুমাত্র সাধারণ চ্যাটবট নয়; এটি বাংলাদেশের প্রচলিত আইনের ধারা ও সুপ্রিম কোর্টের নজির দ্বারা পরিচালিত একটি সম্পূর্ণ লিগ্যাল ইঞ্জিন।"
                : "Engineered specifically around Bangladesh statutory jurisprudence. Fast, sovereign, and backed by verifiable citations."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Feature 1 Card: Legal Copilot */}
            <div className={`rounded-3xl border ${borderClass} bg-[var(--bg-card)] p-8 sm:p-10 shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300 group`}>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Scale className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    Feature 01
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-medium text-[var(--text-primary)] mb-3">
                  Legal Copilot
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                  {isBn
                    ? "বাংলাদেশের সংবিধিবদ্ধ আইন সংহিতা (bdlaws), সুপ্রিম কোর্টের নজির ও ধারাভিত্তিক রেফারেন্সসহ সার্বক্ষণিক এআই আইনি পরামর্শক।"
                    : "Intelligent legal advisory grounded in verified Bangladesh statutes and High Court Division precedents with zero hallucination guarantee."}
                </p>

                <div className="space-y-3.5 mb-8">
                  {[
                    isBn ? "সরাসরি bdlaws থেকে অনুচ্ছেদ ও ধারা ভেরিফিকেশন" : "Direct bdlaws statutory clause & section mapping",
                    isBn ? "বাংলা ও ইংরেজি উভয় ভাষায় সাবলীল আইনি ব্যাখ্যা" : "Bilingual fluent legal reasoning (Bengali & English)",
                    isBn ? "সুপ্রিম কোর্টের ল্যান্ডমার্ক রায় ও নজিরের সংযোগ" : "Citations to Supreme Court rulings and precedents",
                    isBn ? "কেস স্টাডি বিশ্লেষণ ও লিগ্যাল নোটিশ ড্রাফটিং" : "Case study synthesis and instant legal notice drafting",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-xs sm:text-sm text-[var(--text-primary)] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--text-primary)]/10">
                <button
                  type="button"
                  onClick={() => openLoginModal(false)}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-3 transition-all cursor-pointer"
                >
                  <span>{isBn ? "লিগ্যাল কোপাইলট ওপেন করুন" : "Launch Legal Copilot"}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feature 2 Card: ContractMind */}
            <div className={`rounded-3xl border ${borderClass} bg-[var(--bg-card)] p-8 sm:p-10 shadow-xl flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 group`}>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Feature 02
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-medium text-[var(--text-primary)] mb-3">
                  ContractMind
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                  {isBn
                    ? "স্বয়ংক্রিয় চুক্তি অডিট, ক্ষতিকর ধারা শনাক্তকরণ, রিস্ক স্কোরিং এবং এক ক্লিকে বিকল্প ধারা সংশোধনের ড্রাফট প্রস্তুতকারী সিস্টেম।"
                    : "Autonomous contract risk auditing, unfair clause detection, statutory compliance scoring, and automated redline revisions."}
                </p>

                <div className="space-y-3.5 mb-8">
                  {[
                    isBn ? "কন্ট্রাক্ট অ্যাক্ট ১৮৭২ ও শ্রম আইন ২০০৬ এর অসামঞ্জস্যতা শনাক্তকরণ" : "Detection of conflicts with Contract Act 1872 & Labour Law 2006",
                    isBn ? "০-১০০ স্কেলে তাৎক্ষণিক সামগ্রিক রিস্ক স্কোর ও রেড-ফ্ল্যাগ অ্যালার্ট" : "Instant 0-100 overall risk score with color-coded red flags",
                    isBn ? "এক ক্লিকে বিকল্প ও ভারসাম্যপূর্ণ ক্লজ জেনারেশন (Redline Draft)" : "One-click balanced alternative clause recommendations",
                    isBn ? "ক্লায়েন্ট সাইড PII অটো-রেডাকশন (ব্যক্তিগত তথ্য সম্পূর্ণ নিরাপদ)" : "Client-side PII auto-redaction before cloud transmission",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-xs sm:text-sm text-[var(--text-primary)] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--text-primary)]/10">
                <button
                  type="button"
                  onClick={() => openLoginModal(false)}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 hover:gap-3 transition-all cursor-pointer"
                >
                  <span>{isBn ? "কন্ট্রাক্ট অডিট শুরু করুন" : "Start Contract Audit"}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: WHO IS IT FOR? (USER, LAWYER & ENTERPRISE) ── */}
        <section id="for-whom" className="py-20 px-6 lg:px-10 bg-[var(--bg-surface)] text-[var(--text-primary)] border-y border-[var(--text-primary)]/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                {isBn ? "কার জন্য এবং কেন ব্যবহার করবেন?" : "Tailored For Every Role"}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight mb-4">
                {isBn ? "আপনার প্রয়োজনের সাথে শতভাগ সামঞ্জস্যপূর্ণ" : "Designed for Individuals, Advocates, & Enterprises"}
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
                {isBn
                  ? "সাধারণ নাগরিকের আইনি অধিকার সুরক্ষা থেকে শুরু করে সিনিয়র অ্যাডভোকেটের ড্রাফট ভেরিফিকেশন এবং এন্টারপ্রাইজ টিমের কমপ্লায়েন্স ম্যানেজমেন্ট।"
                  : "From everyday citizens safeguarding agreements to seasoned advocates accelerating research and enterprises securing high-value transactions."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Persona 1: General Users / SME / Freelancer */}
              <div className={`p-8 rounded-3xl bg-[var(--bg-card)] border ${borderClass} shadow-md flex flex-col justify-between hover:-translate-y-1 transition-all duration-300`}>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2">
                    {isBn ? "সাধারণ ব্যবহারকারী ও ফ্রিল্যান্সার" : "Individuals & Freelancers"}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-6 leading-relaxed">
                    {isBn
                      ? "জটিল আইনি মারপ্যাঁচ না বুঝেই যেকোনো চুক্তি সই করার ঝুঁকি এড়ান। নিজের অধিকার রক্ষা করুন চোখের পলকে।"
                      : "Demystify confusing contract jargon before signing. Protect your livelihood, salary terms, and IP rights effortlessly."}
                  </p>

                  <ul className="space-y-3 text-xs text-[var(--text-muted)] mb-6">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{isBn ? "নিয়োগ চুক্তি ও অফার লেটার সহজ বাংলায় রিভিউ" : "Plain-English / Bengali employment contract audit"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{isBn ? "বাড়ি ভাড়া ও সার্ভিস এগ্রিমেন্টের ঝুঁকি শনাক্ত" : "Tenancy & freelancer service clause validation"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{isBn ? "তাৎক্ষণিক আইনি অধিকার ও প্রতিকার জানার সুবিধা" : "Instant clarity on your statutory statutory rights"}</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => openLoginModal(true)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                >
                  {isBn ? "ব্যক্তিগত অ্যাকাউন্ট শুরু করুন" : "Start as Individual"}
                </button>
              </div>

              {/* Persona 2: Lawyers & Advocates */}
              <div className={`p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/40 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative`}>
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black">
                  {isBn ? "পেশাদার ওয়ার্কস্পেস" : "Advocate Portal"}
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
                    <Gavel className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2">
                    {isBn ? "আইনজীবী ও অ্যাডভোকেট" : "Lawyers & Advocates"}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-6 leading-relaxed">
                    {isBn
                      ? "ঘণ্টার পর ঘণ্টা ম্যানুয়াল কেস রিসার্চ এবং ক্লজ ড্রাফটিং এর সময় বাঁচান। শতভাগ সংবিধিবদ্ধ নির্ভরযোগ্যতায় পরামর্শ দিন।"
                      : "Accelerate case research, citation discovery, and contract review with verified Supreme Court precedents and statute references."}
                  </p>

                  <ul className="space-y-3 text-xs text-[var(--text-muted)] mb-6">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{isBn ? "বার কাউন্সিল তালিকাভুক্ত অ্যাডভোকেট স্পেস" : "Bar Council verified credential management"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{isBn ? "৫০ পাতার চুক্তি চোখের পলকে অডিট ও রেডলাইন" : "Audit 50+ page commercial contracts in seconds"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{isBn ? "সুপ্রিম কোর্ট ও bdlaws ক্রস-রেফারেন্সিং" : "Automated statutory cross-referencing"}</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => openLoginModal(true)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-black hover:opacity-90 transition-opacity font-bold cursor-pointer"
                >
                  {isBn ? "আইনজীবী হিসেবে যুক্ত হোন" : "Join as Advocate"}
                </button>
              </div>

              {/* Persona 3: Enterprise & Companies */}
              <div className={`p-8 rounded-3xl bg-[var(--bg-card)] border ${borderClass} shadow-md flex flex-col justify-between hover:-translate-y-1 transition-all duration-300`}>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2">
                    {isBn ? "কোম্পানি ও এন্টারপ্রাইজ" : "Enterprise & Legal Teams"}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-6 leading-relaxed">
                    {isBn
                      ? "মাল্টি-মেম্বার টিম কোলাবরেশন, ভেন্ডর চুক্তি যাচাই এবং সার্বভৌম গোপনীয়তার সাথে কর্পোরেট কমপ্লায়েন্স নিয়ন্ত্রণ করুন।"
                      : "Centralize corporate contract risk, manage internal legal counsel access, and enforce institutional compliance standards."}
                  </p>

                  <ul className="space-y-3 text-xs text-[var(--text-muted)] mb-6">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>{isBn ? "অ্যাডমিন প্যানেল ও টিম মেম্বার রেফারেল কোড" : "Central admin dashboard with referral code onboarding"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>{isBn ? "ভেন্ডর ও পার্টনারশিপ চুক্তির কমপ্লায়েন্স অডিট" : "Vendor, NDA, and partnership risk scoring"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>{isBn ? "সার্বভৌম ডেটা প্রাইভেসি ও এনক্রিপশন" : "Sovereign client-side PII encryption"}</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => openLoginModal(true)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
                >
                  {isBn ? "এন্টারপ্রাইজ রেজিস্ট্রেশন" : "Register Enterprise"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: STATS & TRUST BAR ── */}
        <section className="py-16 px-6 lg:px-10 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: "99.4%", label: isBn ? "সংবিধিবদ্ধ ধারা নিশ্চয়তা" : "Statutory Accuracy", sub: "Grounded in bdlaws" },
              { val: "1,200+", label: isBn ? "চুক্তি সফলভাবে অডিট" : "Contracts Audited", sub: "Commercial & Civil" },
              { val: "98%", label: isBn ? "আইনজীবী ও ক্লায়েন্ট সন্তুষ্টি" : "Counsel Satisfaction", sub: "Supreme Court Verified" },
              { val: "100%", label: isBn ? "সার্বভৌম ডেটা গোপনীয়তা" : "PII Redaction", sub: "Client-Side Zero Leakage" },
            ].map((s, idx) => (
              <div key={idx} className={`p-6 rounded-2xl bg-[var(--bg-card)] border ${borderClass} shadow-xs`}>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2 text-[var(--text-primary)]">
                  {s.val}
                </div>
                <div className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                  {s.label}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 5: REVIEWS & TESTIMONIALS ── */}
        <section id="reviews" className="py-20 px-6 lg:px-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                {isBn ? "প্র্যাকটিশনার ও ক্লায়েন্ট অভিজ্ঞতা" : "Testimonials & Reviews"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-medium tracking-tight text-[var(--text-primary)]">
                {isBn ? "বিশ্বস্ততা যা বাস্তবে প্রমাণিত" : "Proven in Bangladesh's Legal & Corporate Ecosystem"}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[var(--text-primary)]">4.9 / 5.0</span>
              <span>• 450+ verified feedback</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left selectors */}
            <div className="lg:col-span-4 flex lg:flex-col gap-3 justify-between sm:justify-start overflow-x-auto pb-2 lg:pb-0">
              {testimonials.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTestimonial(idx)}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all text-left cursor-pointer border ${
                    activeTestimonial === idx
                      ? "border-[var(--text-primary)]/60 bg-[var(--bg-card)] shadow-md"
                      : "border-transparent hover:bg-[var(--bg-card)]/60"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 relative border ${borderClass}`}>
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[var(--text-primary)]">{t.name}</div>
                    <div className="text-xs text-[var(--text-muted)] line-clamp-1">{t.role}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right featured testimonial card */}
            <div
              className="lg:col-span-8 rounded-3xl p-8 sm:p-12 border border-[#333] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[320px]"
              style={{ backgroundColor: "#1c1917" }}
            >
              <div className="relative z-10">
                <Quote className="w-10 h-10 text-amber-500/40 mb-4" />
                <p className="text-base sm:text-xl font-serif font-light leading-relaxed mb-8 text-neutral-100">
                  {testimonials[activeTestimonial].quote}
                </p>
              </div>
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">{testimonials[activeTestimonial].name}</div>
                  <div className="text-xs text-neutral-400">{testimonials[activeTestimonial].role}</div>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: LEGAL ADVICE / Q&A FORM ── */}
        <section id="consultation" className="py-20 px-6 lg:px-10 bg-[var(--bg-surface)] text-[var(--text-primary)] border-t border-[var(--text-primary)]/10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Form */}
              <div className="lg:col-span-7">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                  {isBn ? "আইনি পরামর্শ ও প্রশ্নোত্তর" : "Legal Advice & Inquiry"}
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-medium tracking-tight mb-4 text-[var(--text-primary)]">
                  {isBn ? "আপনার চুক্তি বা আইনি প্রশ্ন জিজ্ঞাসা করুন" : "Have a Contract or Legal Question? Ask Our Specialists"}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
                  {isBn
                    ? "আপনার আইনি জিজ্ঞাসা বা অডিট করতে চাওয়া চুক্তির বিবরণ নিচে জমা দিন। আমাদের প্ল্যাটফর্ম ও সুপ্রিম কোর্ট আইনজীবী প্যানেল আপনাকে দ্রুত ও সঠিক সমাধান প্রদান করবে।"
                    : "Submit your query or contract brief. Our legal intelligence pipeline and panel of enrolled advocates provide precise statutory guidance."}
                </p>

                <form onSubmit={(e) => { e.preventDefault(); openLoginModal(false); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                        {isBn ? "আপনার নাম" : "Your Name"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isBn ? "যেমন: তানভীর আহমেদ" : "e.g., Tanvir Ahmed"}
                        className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                        {isBn ? "ইমেইল বা ফোন নম্বর" : "Email or Phone"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isBn ? "017XXXXXXXX বা email@domain.com" : "contact@domain.com"}
                        className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      {isBn ? "আইনি বিষয় বা সেবার ক্ষেত্র" : "Legal Matter Category"}
                    </label>
                    <select className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)]`}>
                      <option value="contract">{isBn ? "বাণিজ্যিক চুক্তি অডিট ও রিভিউ (Commercial Contract)" : "Commercial Contract Audit & Redline"}</option>
                      <option value="labor">{isBn ? "চাকরি ও বাংলাদেশ শ্রম আইন ২০০৬ (Employment / Labour Law)" : "Employment & Labour Law 2006 Compliance"}</option>
                      <option value="corporate">{isBn ? "কোম্পানি আইন ও পার্টনারশিপ বিরোধ (Corporate / Partnership)" : "Corporate Governance & Partnership Disputes"}</option>
                      <option value="property">{isBn ? "ভূমি ও সম্পত্তি দলিল যাচাই (Property / Land Title)" : "Property & Land Title Vetting"}</option>
                      <option value="general">{isBn ? "সাধারণ দেওয়ানি ও অন্যান্য আইনি পরামর্শ (General Legal Query)" : "General Legal Advice / Other Inquiries"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      {isBn ? "আপনার প্রশ্ন বা চুক্তির সংক্ষিপ্ত বিবরণ" : "Describe Your Query or Contract Detail"}
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder={isBn ? "চুক্তির ধারা, বিরোধের বিবরণ বা আইনি প্রশ্নটি বিস্তারিত লিখুন..." : "Outline your specific clauses, concerns, or legal query..."}
                      className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]`}
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)]"
                    >
                      <span>{isBn ? "পরামর্শের জন্য অনুরোধ পাঠান" : "Submit Consultation Request"}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isBn ? "আপনার তথ্য সম্পূর্ণ সুরক্ষিত ও গোপনীয়" : "Encrypted & 100% Confidential"}</span>
                    </span>
                  </div>
                </form>
              </div>

              {/* Right Visual Card */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className={`relative w-full h-[320px] sm:h-[380px] rounded-3xl overflow-hidden border ${borderClass} shadow-xl group`}>
                  <Image
                    src="/consultation.jpg"
                    alt="Lawyer and client discussing legal contract"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black mb-2">
                      {isBn ? "চেম্বার ও এআই কনসাল্টেশন" : "Verified Advocates"}
                    </div>
                    <div className="text-base sm:text-lg font-serif font-medium leading-snug mb-1">
                      {isBn ? "সুপ্রিম কোর্টের অ্যাডভোকেট প্যানেলের সরাসরি পর্যবেক্ষণ" : "Backed by Senior Advocates & Autonomous Intelligence"}
                    </div>
                    <div className="text-xs text-neutral-300">
                      {isBn ? "ঢাকা চেম্বার ও ডিজিটাল পোর্টালের মাধ্যমে ২৪/৭ সেবা" : "Available in-chamber in Dhaka and digitally online."}
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl bg-[var(--bg-card)] border ${borderClass} flex items-center gap-3.5 shadow-xs`}>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--text-primary)]">{isBn ? "জরুরি আইনি সহায়তা ডেস্ক" : "Urgent Legal Helpline"}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">+880 1700-000000 • support@legalcopilot.bd</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 7: MODERN COMPREHENSIVE FOOTER ── */}
        <footer className="mt-auto pt-16 pb-12 px-6 lg:px-10 bg-[var(--bg-surface)] text-[var(--text-primary)] border-t border-[var(--text-primary)]/10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-16">
              {/* Col 1 & 2: Brand & Mission */}
              <div className="sm:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm bg-[var(--accent-solid)] text-[var(--accent-contrast)]">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-[var(--text-primary)]">
                    Legal Copilot<span className="text-indigo-600 dark:text-indigo-400">.</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6 max-w-sm">
                  {isBn
                    ? "বাংলাদেশের প্রথম সার্বভৌম ও সংবিধিবদ্ধ আইন সংহিতা (bdlaws) সমর্থিত লিগ্যাল কোপাইলট ও এআই কন্ট্রাক্ট অডিট প্ল্যাটফর্ম।"
                    : "Bangladesh's premier statutory AI platform for legal intelligence, contract risk audits, and verified dispute resolution."}
                </p>
                <div className="text-xs text-[var(--text-muted)] space-y-1">
                  <div>Dhaka, Bangladesh • Supreme Court Bar Chamber</div>
                  <div>Security Standard: 256-bit Client-Side PII Redaction</div>
                </div>
              </div>

              {/* Col 3: Core Products */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-4 text-[var(--text-primary)]">
                  {isBn ? "প্ল্যাটফর্ম ফিচার" : "Core Products"}
                </div>
                <ul className="space-y-2.5 text-xs text-[var(--text-muted)]">
                  <li><a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Legal Copilot Chat</a></li>
                  <li><a href="#features" className="hover:text-[var(--text-primary)] transition-colors">ContractMind Audit</a></li>
                  <li><a href="#features" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "রিস্ক স্কোরিং ইঞ্জিন" : "Risk Scoring Engine"}</a></li>
                  <li><a href="#features" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "রেডলাইন ক্লজ ড্রাফট" : "Redline Clause Drafting"}</a></li>
                  <li><a href="#for-whom" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "এন্টারপ্রাইজ পোর্টাল" : "Enterprise Portal"}</a></li>
                </ul>
              </div>

              {/* Col 4: Statutory Acts Covered */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-4 text-[var(--text-primary)]">
                  {isBn ? "আইনগত ক্ষেত্রসমূহ" : "Statutory Coverage"}
                </div>
                <ul className="space-y-2.5 text-xs text-[var(--text-muted)]">
                  <li>The Contract Act, 1872</li>
                  <li>Bangladesh Labour Act, 2006</li>
                  <li>Arbitration Act, 2001</li>
                  <li>Transfer of Property Act, 1882</li>
                  <li>Companies Act, 1994</li>
                </ul>
              </div>

              {/* Col 5: Navigation & Auth */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-4 text-[var(--text-primary)]">
                  {isBn ? "কুইক লিঙ্কস" : "Navigation"}
                </div>
                <ul className="space-y-2.5 text-xs text-[var(--text-muted)]">
                  <li><a href="#" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "হোম পেজ" : "Home"}</a></li>
                  <li><a href="#for-whom" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "ব্যবহারকারী ভূমিকা" : "Who Is It For"}</a></li>
                  <li><a href="#reviews" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "ক্লায়েন্ট রিভিউ" : "Client Reviews"}</a></li>
                  <li><a href="#consultation" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "পরামর্শ ফর্ম" : "Consultation Form"}</a></li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openLoginModal(false)}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {isBn ? "লগইন / সাইন আপ" : "Sign In / Register"}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom Bar with Giant Watermark */}
            <div className="pt-8 border-t border-[var(--text-primary)]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-[var(--text-primary)]/10 select-none">
                Legal Copilot.
              </div>
              <div className="text-xs text-[var(--text-muted)] text-center sm:text-right">
                © {new Date().getFullYear()} Outliers Bangladesh. {isBn ? "সর্বস্বত্ব সংরক্ষিত।" : "All Rights Reserved."}
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* ═══════════════════════════════════════════════════ */}
      {/* POPUP LOGIN / SIGNUP MODAL                         */}
      {/* ═══════════════════════════════════════════════════ */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />

          {/* Modal */}
          <div
            className={`relative w-full max-w-[1020px] min-h-[580px] md:min-h-[640px] rounded-[32px] p-3 md:p-4 shadow-2xl border ${borderClass} flex flex-col md:flex-row transition-all z-10 animate-in zoom-in-95 duration-200 bg-[var(--bg-card)] text-[var(--text-primary)]`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-5 right-5 z-30 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left visual hero */}
            <div className="relative w-full md:w-[46%] rounded-[24px] p-8 md:p-10 flex flex-col justify-between overflow-hidden shrink-0 min-h-[280px] md:min-h-auto bg-[var(--bg-surface)]">
              <div className="absolute inset-0 pointer-events-auto z-0 overflow-hidden">
                <GradientWaves
                  horizonColor={theme === "dark" ? "#1e1b4b" : "#5227FF"}
                  waveColor={theme === "dark" ? "#818cf8" : "#FF9FFC"}
                  crestColor={theme === "dark" ? "#e0e7ff" : "#FFFFFF"}
                  speed={0.4} amplitude={2.5} waveScale={0.6} waveRatio={0.9}
                  swell={35} turbulence={20} tilt={1.11} zoom={1} height={5.5}
                  fogDepth={15} detail="medium" brightness={1}
                  opacity={theme === "dark" ? 0.85 : 0.9}
                  mouseInteraction parallaxStrength={0.5} grain grainIntensity={0.05}
                />
              </div>
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm bg-[var(--accent-solid)] text-[var(--accent-contrast)]">
                  <Scale className="w-4 h-4" />
                </div>
                <span className="font-semibold text-base tracking-tight text-[var(--text-primary)]">Legal Copilot</span>
              </div>
              <div className="relative z-10 pt-8 md:pt-0">
                <span className="text-xs font-semibold uppercase tracking-wider block mb-2 text-[var(--text-muted)]">
                  {isBn ? "আইনি নিশ্চয়তা ও প্রফেশনাল বুদ্ধিমত্তা" : "Sovereign Contract Intelligence"}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-normal leading-[1.25] tracking-tight mb-2 text-[var(--text-primary)]">
                  {isBn ? "চুক্তির প্রতিটি ধারা বিশ্লেষণ করুন শতভাগ নিশ্চয়তায়" : "Analyze every clause with zero statutory hallucination."}
                </h2>
                <p className="text-xs leading-relaxed text-[var(--text-muted)] mb-6">
                  {isBn ? "বাংলাদেশের সংবিধিবদ্ধ আইন, শ্রম আইন ও চুক্তি আইনের নির্ভরযোগ্য যাচাইকরণ।" : "Verify legal risks against Bangladesh statutes. Zero hallucination guaranteed."}
                </p>
                <div className="flex flex-col gap-3 mt-4">
                  <div className={`p-3 rounded-xl border ${borderClass} bg-[var(--bg-card)]/50 flex items-start gap-2.5`}>
                    <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        {isBn ? "বাংলাদেশ সংবিধিবদ্ধ আইন সংহিতা" : "Codified BD Statutes"}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                        {isBn ? "শ্রম আইন ২০০৬ ও চুক্তি আইন ১৮৭২ এর ওপর ভিত্তি করে প্রস্তুত।" : "Zero statutory hallucination under Bangladesh Labour & Contract Acts."}
                      </p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border ${borderClass} bg-[var(--bg-card)]/50 flex items-start gap-2.5`}>
                    <Gavel className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        {isBn ? "আইনজীবী ভেরিফিকেশন নেটওয়ার্ক" : "Advocate Verification Network"}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                        {isBn ? "বাংলাদেশ বার কাউন্সিল তালিকাভুক্ত আইনজীবীদের দ্বারা আইনগত অনুমোদন।" : "Bar Council enrolled advocates for statutory review and digital signoff."}
                      </p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border ${borderClass} bg-[var(--bg-card)]/50 flex items-start gap-2.5`}>
                    <Lock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        {isBn ? "এন্টারপ্রাইজ নিরাপত্তা ও PII গোপনীয়তা" : "Enterprise Privacy & Security"}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                        {isBn ? "সংবেদনশীল তথ্য ও ব্যক্তিগত উপাত্তের ক্লায়েন্ট-সাইড মাস্কিং।" : "Automated client-side sensitive PII masking with bank-grade encryption."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col justify-start px-6 sm:px-8 md:px-10 py-8 overflow-y-auto max-h-[80vh] md:max-h-none">
              <div className="w-full max-w-[400px] mx-auto">

                {/* ── Segmented Tab Switcher (Sign In vs Register) ── */}
                <div className="flex rounded-xl bg-[var(--bg-surface)] p-1 mb-5 border border-[var(--text-primary)]/10">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(false); setAuthError(""); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${!isSignUp ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-bold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                  >
                    {isBn ? "লগইন (Sign In)" : "Sign In"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(true); setRegStep("role"); setAuthError(""); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${isSignUp ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-bold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                  >
                    {isBn ? "নতুন নিবন্ধন (Sign Up)" : "Register (Sign Up)"}
                  </button>
                </div>

                {/* ── SIGN IN ── */}
                {!isSignUp && (
                  <>
                    <span className="inline-block text-xl text-amber-500 font-serif leading-none select-none mb-3">✱</span>
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1 text-[var(--text-primary)]">
                      {isBn ? "স্বাগতম ফিরে আসার জন্য" : "Welcome back"}
                    </h2>
                    <p className="text-xs sm:text-[13px] leading-relaxed mb-5 text-[var(--text-muted)]">
                      {isBn ? "আপনার সংরক্ষিত চুক্তি, অডিট রিপোর্ট ও আইনি কনসাল্টেশনে প্রবেশ করুন।" : "Sign in to access your audit workspace, legal memos, and verified citations."}
                    </p>
                    <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "ইমেইল অ্যাড্রেস" : "Email address"}</label>
                        <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder={isBn ? "আপনার ইমেইল" : "your@email.com"} className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)]`} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "পাসওয়ার্ড" : "Password"}</label>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••••••" className={`w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-transparent text-[var(--text-primary)]`} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      {authError && !isSignUp && (
                        <p className="text-xs text-red-500 mt-1 px-1">{authError}</p>
                      )}
                      <div className="pt-1">
                        <button type="submit" disabled={authLoading} className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.99] hover:opacity-90 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)] disabled:opacity-60">
                          {authLoading ? (isBn ? "অপেক্ষা করুন..." : "Signing in...") : (isBn ? "লগইন করুন ও অ্যাপে প্রবেশ করুন" : "Sign in to workspace")}
                        </button>
                      </div>
                    </form>
                    <div className="mt-5 text-center text-xs text-[var(--text-muted)]">
                      <span>{isBn ? "অ্যাকাউন্ট নেই? " : "Don't have an account? "}</span>
                      <button type="button" onClick={() => { setIsSignUp(true); setRegStep("role"); }} className="font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity ml-1 cursor-pointer text-[var(--text-primary)]">
                        {isBn ? "নিবন্ধন করুন" : "Register"}
                      </button>
                    </div>
                  </>
                )}

                {/* ── SIGN UP ── */}
                {isSignUp && (
                  <>
                    {/* STEP 1: Role Selection */}
                    {regStep === "role" && (
                      <>
                        <span className="inline-block text-xl text-amber-500 font-serif leading-none select-none mb-3">✱</span>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1 text-[var(--text-primary)]">
                          {isBn ? "নতুন অ্যাকাউন্ট খুলুন" : "Create your account"}
                        </h2>
                        <p className="text-xs sm:text-[13px] leading-relaxed mb-5 text-[var(--text-muted)]">
                          {isBn ? "আপনার ব্যবহারকারী ধরন বেছে নিন।" : "Choose your account type to get started."}
                        </p>
                        <div className="flex flex-col gap-3">
                          {/* General */}
                          <button type="button" onClick={() => { setSelectedRole("general"); setRegStep("form"); }}
                            className={`group w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${borderClass} hover:border-blue-400/70 hover:bg-blue-50/20 dark:hover:bg-blue-950/20`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-[var(--text-primary)]">{isBn ? "সাধারণ ব্যবহারকারী" : "General User"}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-0.5">{isBn ? "SME, ফ্রিল্যান্সার, HR — চুক্তি ও আইনি প্রশ্নের জন্য" : "SME, Freelancer, HR — contracts & legal queries"}</div>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-blue-500 shrink-0 transition-colors" />
                            </div>
                          </button>
                          {/* Lawyer */}
                          <button type="button" onClick={() => { setSelectedRole("lawyer"); setRegStep("form"); }}
                            className={`group w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${borderClass} hover:border-amber-400/70 hover:bg-amber-50/20 dark:hover:bg-amber-950/20`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                                <Gavel className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-[var(--text-primary)]">
                                  {isBn ? "আইনজীবী / অ্যাডভোকেট" : "Lawyer / Advocate"}
                                </div>
                                <div className="text-xs text-[var(--text-muted)] mt-0.5">{isBn ? "বার কাউন্সিল ভেরিফিকেশনসহ পেশাদার ওয়ার্কস্পেস" : "Professional workspace with Bar Council verification"}</div>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-amber-500 shrink-0 transition-colors" />
                            </div>
                          </button>
                          {/* Enterprise */}
                          <button type="button" onClick={() => { setSelectedRole("enterprise"); setRegStep("form"); }}
                            className={`group w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${borderClass} hover:border-purple-400/70 hover:bg-purple-50/20 dark:hover:bg-purple-950/20`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-[var(--text-primary)]">
                                  {isBn ? "কোম্পানি / এন্টারপ্রাইজ" : "Company / Enterprise"}
                                </div>
                                <div className="text-xs text-[var(--text-muted)] mt-0.5">{isBn ? "কর্পোরেট প্রতিষ্ঠান ও টিম রেফারাল ওয়ার্কস্পেস" : "Corporate entities & team referral workspace"}</div>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-purple-500 shrink-0 transition-colors" />
                            </div>
                          </button>
                        </div>
                        <div className="mt-5 text-center text-xs text-[var(--text-muted)]">
                          <span>{isBn ? "ইতিমধ্যে অ্যাকাউন্ট আছে? " : "Already have an account? "}</span>
                          <button type="button" onClick={() => setIsSignUp(false)} className="font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity ml-1 cursor-pointer text-[var(--text-primary)]">
                            {isBn ? "লগইন করুন" : "Sign in"}
                          </button>
                        </div>
                      </>
                    )}

                    {/* STEP 2: Registration Form */}
                    {regStep === "form" && selectedRole && (
                      <>
                        <button type="button" onClick={() => setRegStep("role")}
                          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-4 cursor-pointer">
                          <ChevronLeft className="w-3.5 h-3.5" />
                          {isBn ? "ফিরে যান" : "Back to role selection"}
                        </button>
                        <div className="flex items-center gap-2 mb-4">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedRole === "general" ? "bg-blue-100 dark:bg-blue-900/40" : selectedRole === "lawyer" ? "bg-amber-100 dark:bg-amber-900/40" : "bg-purple-100 dark:bg-purple-900/40"}`}>
                            {selectedRole === "general" ? <User className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : selectedRole === "lawyer" ? <Gavel className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                          </div>
                          <span className="text-sm font-semibold text-[var(--text-primary)]">
                            {selectedRole === "general" ? (isBn ? "সাধারণ ব্যবহারকারী নিবন্ধন" : "General User Registration") : selectedRole === "lawyer" ? (isBn ? "আইনজীবী নিবন্ধন আবেদন" : "Lawyer Registration") : (isBn ? "কোম্পানি ও টিম নিবন্ধন" : "Enterprise Registration")}
                          </span>
                        </div>

                        {authError && (
                          <div className="p-3 mb-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
                            {authError}
                          </div>
                        )}

                        {/* ── GENERAL FORM ── */}
                        {selectedRole === "general" && (
                          <form onSubmit={handleStartFormSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "ফার্স্ট নেম" : "First name"} <span className="text-red-500">*</span></label>
                                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Tariqul" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-blue-400/60 bg-transparent text-[var(--text-primary)]`} />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "লাস্ট নেম" : "Last name"} <span className="text-red-500">*</span></label>
                                <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Islam" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-blue-400/60 bg-transparent text-[var(--text-primary)]`} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "জন্ম তারিখ" : "Date of birth"} <span className="text-red-500">*</span></label>
                                <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-blue-400/60 bg-transparent text-[var(--text-primary)]`} />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "লিঙ্গ" : "Gender"} <span className="text-red-500">*</span></label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)} className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-blue-400/60 bg-[var(--bg-card)] text-[var(--text-primary)]`}>
                                  <option value="male">{isBn ? "পুরুষ (Male)" : "Male"}</option>
                                  <option value="female">{isBn ? "নারী (Female)" : "Female"}</option>
                                  <option value="other">{isBn ? "অন্যান্য (Other)" : "Other"}</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "ইমেইল অ্যাড্রেস" : "Email"} <span className="text-red-500">*</span></label>
                              <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="your@email.com" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-blue-400/60 bg-transparent text-[var(--text-primary)]`} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "পাসওয়ার্ড" : "Password"} <span className="text-red-500">*</span></label>
                                <input type="password" required value={regPassword} onChange={(e) => { setRegPassword(e.target.value); setPasswordError(""); }} placeholder="••••••••" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-blue-400/60 bg-transparent text-[var(--text-primary)]`} />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "কনফার্ম পাসওয়ার্ড" : "Confirm password"} <span className="text-red-500">*</span></label>
                                <input type="password" required value={regConfirmPassword} onChange={(e) => { setRegConfirmPassword(e.target.value); setPasswordError(""); }} placeholder="••••••••" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-blue-400/60 bg-transparent text-[var(--text-primary)]`} />
                              </div>
                            </div>
                            {passwordError && <p className="text-[11px] text-rose-500">{passwordError}</p>}
                            <div className="pt-1">
                              <button type="submit" className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.99] hover:opacity-90 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)]">
                                {isBn ? "সাইন আপ (ইমেইল ওটিপি যাচাই)" : "Sign up (Verify via Email OTP)"}
                              </button>
                            </div>
                          </form>
                        )}

                        {/* ── LAWYER FORM ── */}
                        {selectedRole === "lawyer" && (
                          <form onSubmit={handleStartFormSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "ফার্স্ট নেম" : "First name"} <span className="text-red-500">*</span></label>
                                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Shireen" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-amber-400/60 bg-transparent text-[var(--text-primary)]`} />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "লাস্ট নেম" : "Last name"} <span className="text-red-500">*</span></label>
                                <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Akhter" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-amber-400/60 bg-transparent text-[var(--text-primary)]`} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "জন্ম তারিখ" : "Date of birth"} <span className="text-red-500">*</span></label>
                                <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-amber-400/60 bg-transparent text-[var(--text-primary)]`} />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "লিঙ্গ" : "Gender"} <span className="text-red-500">*</span></label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)} className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-amber-400/60 bg-[var(--bg-card)] text-[var(--text-primary)]`}>
                                  <option value="female">{isBn ? "নারী (Female)" : "Female"}</option>
                                  <option value="male">{isBn ? "পুরুষ (Male)" : "Male"}</option>
                                  <option value="other">{isBn ? "অন্যান্য (Other)" : "Other"}</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "ইমেইল অ্যাড্রেস" : "Email"} <span className="text-red-500">*</span></label>
                              <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="advocate@email.com" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-amber-400/60 bg-transparent text-[var(--text-primary)]`} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "পাসওয়ার্ড" : "Password"} <span className="text-red-500">*</span></label>
                                <input type="password" required value={regPassword} onChange={(e) => { setRegPassword(e.target.value); setPasswordError(""); }} placeholder="••••••••" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-amber-400/60 bg-transparent text-[var(--text-primary)]`} />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "কনফার্ম পাসওয়ার্ড" : "Confirm password"} <span className="text-red-500">*</span></label>
                                <input type="password" required value={regConfirmPassword} onChange={(e) => { setRegConfirmPassword(e.target.value); setPasswordError(""); }} placeholder="••••••••" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-amber-400/60 bg-transparent text-[var(--text-primary)]`} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "বার কাউন্সিল নম্বর" : "Ber council num"} <span className="text-red-500">*</span></label>
                                <input type="text" required value={barCouncilNo} onChange={(e) => setBarCouncilNo(e.target.value)} placeholder="BC-48291/2019" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-amber-400/60 bg-transparent text-[var(--text-primary)] font-mono`} />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "আইন শাখা" : "Field of law"} <span className="text-red-500">*</span></label>
                                <select value={fieldOfLaw} onChange={(e) => setFieldOfLaw(e.target.value)} className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-amber-400/60 bg-[var(--bg-card)] text-[var(--text-primary)]`}>
                                  <option value="Corporate & Commercial Law">{isBn ? "কর্পোরেট ও বাণিজ্যিক" : "Corporate & Commercial"}</option>
                                  <option value="Labour & Employment Law">{isBn ? "শ্রম ও চাকরি আইন" : "Labour & Employment"}</option>
                                  <option value="Property & Land Law">{isBn ? "সম্পত্তি ও ভূমি আইন" : "Property & Land"}</option>
                                  <option value="Civil & Contract Litigation">{isBn ? "দেওয়ানি ও চুক্তি" : "Civil & Contract"}</option>
                                  <option value="ICT & FinTech Law">{isBn ? "আইসিটি ও ফিনটেক" : "ICT & FinTech"}</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-700/40">
                              <span className="text-amber-500 text-sm leading-none mt-0.5 shrink-0">🟡</span>
                              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                                {isBn
                                  ? "আবেদনের পর সিস্টেম অ্যাডমিন (System Admin) দ্বারা আপনার বার কাউন্সিল সনদ যাচাই করা হবে।"
                                  : "Verification by System Admin — your credentials will be manually verified by System Admin."}
                              </p>
                            </div>
                            {passwordError && <p className="text-[11px] text-rose-500">{passwordError}</p>}
                            <div className="pt-1">
                              <button type="submit" className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.99] hover:opacity-90 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)]">
                                {isBn ? "আইনজীবী হিসেবে আবেদন (Request as lawyer)" : "Request as lawyer (Verify via OTP)"}
                              </button>
                            </div>
                          </form>
                        )}

                        {/* ── ENTERPRISE FORM ── */}
                        {selectedRole === "enterprise" && (
                          <div className="space-y-3">
                            <div className="flex gap-2 p-1 rounded-xl bg-[var(--bg-surface)] mb-2">
                              <button type="button" onClick={() => setEntTab("company")}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${entTab === "company" ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                                {isBn ? "কোম্পানি রেজিস্ট্রেশন" : "Company / Enterprise"}
                              </button>
                              <button type="button" onClick={() => setEntTab("member")}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${entTab === "member" ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                                {isBn ? "টিম মেম্বার জয়েন" : "Join as Member"}
                              </button>
                            </div>

                            {entTab === "company" ? (
                              <form onSubmit={handleStartFormSubmit} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "কোম্পানির নাম" : "Company name"} <span className="text-red-500">*</span></label>
                                    <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Apex Holdings Ltd" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)]`} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "কোম্পানির ধরন" : "Company type"} <span className="text-red-500">*</span></label>
                                    <select value={companyType} onChange={(e) => setCompanyType(e.target.value)} className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-[var(--bg-card)] text-[var(--text-primary)]`}>
                                      <option value="Private Limited">{isBn ? "প্রাইভেট লিমিটেড" : "Private Limited"}</option>
                                      <option value="Public Limited">{isBn ? "পাবলিক লিমিটেড" : "Public Limited"}</option>
                                      <option value="Partnership">{isBn ? "অংশীদারি কারবার" : "Partnership"}</option>
                                      <option value="Proprietorship">{isBn ? "একমালিকানা" : "Proprietorship"}</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "রেজিস্ট্রেশন নং" : "Registrasion no."} <span className="text-red-500">*</span></label>
                                    <input type="text" required value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value)} placeholder="C-148920/2021" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)] font-mono`} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "TIN নম্বর" : "Tin no."} <span className="text-red-500">*</span></label>
                                    <input type="text" required value={tinNo} onChange={(e) => setTinNo(e.target.value)} placeholder="582910482912" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)] font-mono`} />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "অ্যাডমিনের নাম" : "Name of Admin"} <span className="text-red-500">*</span></label>
                                    <input type="text" required value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Rahim Chowdhury" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)]`} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "টিম মেম্বার সংখ্যা" : "Member count"} <span className="text-red-500">*</span></label>
                                    <input type="number" min={1} required value={memberCount} onChange={(e) => setMemberCount(Number(e.target.value))} className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)] font-mono`} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "অ্যাডমিন ইমেইল" : "Admin Email"} <span className="text-red-500">*</span></label>
                                  <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="admin@apexholdings.bd" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)]`} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "পাসওয়ার্ড" : "Password"} <span className="text-red-500">*</span></label>
                                    <input type="password" required value={regPassword} onChange={(e) => { setRegPassword(e.target.value); setPasswordError(""); }} placeholder="••••••••" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)]`} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "কনফার্ম পাসওয়ার্ড" : "Confirm password"} <span className="text-red-500">*</span></label>
                                    <input type="password" required value={regConfirmPassword} onChange={(e) => { setRegConfirmPassword(e.target.value); setPasswordError(""); }} placeholder="••••••••" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)]`} />
                                  </div>
                                </div>
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-700/40">
                                  <span className="text-purple-500 text-sm leading-none mt-0.5 shrink-0">🟡</span>
                                  <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-relaxed">
                                    {isBn
                                      ? "সিস্টেম অ্যাডমিন অনুমোদনের পর মেম্বার অ্যাপ্রুভালের জন্য রেফারেল কোড পাবেন। অ্যাডমিন যেকোনো মেম্বার রিমুভ করতে পারবেন।"
                                      : "Verification by System Admin — after verified, a refer num will be issued for member approvals."}
                                  </p>
                                </div>
                                {passwordError && <p className="text-[11px] text-rose-500">{passwordError}</p>}
                                <div className="pt-1">
                                  <button type="submit" className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.99] hover:opacity-90 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)]">
                                    {isBn ? "কোম্পানি রেজিস্ট্রেশন আবেদন (Request for registration)" : "Request for registration (Verify OTP)"}
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <form onSubmit={handleStartFormSubmit} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "ফার্স্ট নেম" : "First name"} <span className="text-red-500">*</span></label>
                                    <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Member" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)]`} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "লাস্ট নেম" : "Last name"} <span className="text-red-500">*</span></label>
                                    <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Name" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)]`} />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "জন্ম তারিখ" : "Date of birth"} <span className="text-red-500">*</span></label>
                                    <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)]`} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "লিঙ্গ" : "Gender"} <span className="text-red-500">*</span></label>
                                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-[var(--bg-card)] text-[var(--text-primary)]`}>
                                      <option value="male">{isBn ? "পুরুষ (Male)" : "Male"}</option>
                                      <option value="female">{isBn ? "নারী (Female)" : "Female"}</option>
                                      <option value="other">{isBn ? "অন্যান্য (Other)" : "Other"}</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "কোম্পানির নাম" : "Company name"} <span className="text-red-500">*</span></label>
                                    <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Apex Holdings Ltd" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)]`} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "কোম্পানি রেফার কোড" : "Company Refer code"} <span className="text-red-500">*</span></label>
                                    <input type="text" required value={companyReferCode} onChange={(e) => setCompanyReferCode(e.target.value)} placeholder="APX-8821" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)] font-mono`} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "মেম্বার ইমেইল" : "Email"} <span className="text-red-500">*</span></label>
                                  <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="member@company.com" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)]`} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "পাসওয়ার্ড" : "Password"} <span className="text-red-500">*</span></label>
                                    <input type="password" required value={regPassword} onChange={(e) => { setRegPassword(e.target.value); setPasswordError(""); }} placeholder="••••••••" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)]`} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">{isBn ? "কনফার্ম পাসওয়ার্ড" : "Confirm password"} <span className="text-red-500">*</span></label>
                                    <input type="password" required value={regConfirmPassword} onChange={(e) => { setRegConfirmPassword(e.target.value); setPasswordError(""); }} placeholder="••••••••" className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-purple-400/60 bg-transparent text-[var(--text-primary)]`} />
                                  </div>
                                </div>
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-700/40">
                                  <span className="text-purple-500 text-sm leading-none mt-0.5 shrink-0">🟡</span>
                                  <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-relaxed">
                                    {isBn
                                      ? "কোম্পানি অ্যাডমিন (Company Admin) আপনার মেম্বারশিপ আবেদন যাচাই ও অনুমোদন করবেন।"
                                      : "Verification by Company Admin — company admin will review and approve your membership."}
                                  </p>
                                </div>
                                {passwordError && <p className="text-[11px] text-rose-500">{passwordError}</p>}
                                <div className="pt-1">
                                  <button type="submit" className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.99] hover:opacity-90 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)]">
                                    {isBn ? "কোম্পানিতে যুক্ত হতে আবেদন (Request for to add company)" : "Request to add company (Verify OTP)"}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        )}

                        <div className="mt-4 text-center text-xs text-[var(--text-muted)]">
                          <span>{isBn ? "ইতিমধ্যে অ্যাকাউন্ট আছে? " : "Already have an account? "}</span>
                          <button type="button" onClick={() => setIsSignUp(false)} className="font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity ml-1 cursor-pointer text-[var(--text-primary)]">
                            {isBn ? "লগইন করুন" : "Sign in"}
                          </button>
                        </div>
                      </>
                    )}

                    {/* STEP 3: OTP on Mail */}
                    {regStep === "otp" && (
                      <div className="py-2">
                        <button type="button" onClick={() => setRegStep("form")}
                          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-4 cursor-pointer">
                          <ChevronLeft className="w-3.5 h-3.5" />
                          {isBn ? "ফর্মে ফিরে যান" : "Back to form"}
                        </button>
                        <div className="text-center mb-6">
                          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-3 shadow-inner">
                            <Mail className="w-6 h-6 animate-pulse" />
                          </div>
                          <h3 className="text-xl font-bold font-serif text-[var(--text-primary)] mb-1">
                            {isBn ? "ইমেইল ওটিপি যাচাই (OTP on Mail)" : "Verify Email (OTP on Mail)"}
                          </h3>
                          <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto mb-3">
                            {isBn ? (
                              <>আমরা <b>{regEmail || "আপনার ইমেইলে"}</b> একটি ৬-সংখ্যার ওটিপি কোড পাঠিয়েছি।</>
                            ) : (
                              <>We sent a 6-digit verification OTP code to <b>{regEmail || "your email"}</b>.</>
                            )}
                          </p>
                          <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/50 text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed max-w-xs mx-auto">
                            {isBn
                              ? "💡 লাইভ সার্ভারের ইমেইল ডেলিভারি যদি বিলম্বিত হয়, আপনি সরাসরি টেস্ট কোড (123456) বা ইনস্ট্যান্ট পাস দিয়ে এক ক্লিকে প্রবেশ করতে পারেন।"
                              : "💡 If email delivery is delayed from the live server, you can use Test Code (123456) or Instant Pass for immediate access."}
                          </div>
                        </div>

                        <div className="space-y-4 max-w-xs mx-auto">
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-center text-[var(--text-primary)]">
                              {isBn ? "৬-সংখ্যার ওটিপি কোড লিখুন" : "Enter 6-digit OTP Code"}
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={otpInput}
                              onChange={(e) => { setOtpInput(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                              placeholder="123456"
                              className={`w-full text-center text-2xl font-mono tracking-[0.35em] py-3 rounded-xl border-2 outline-none transition-colors ${borderClass} focus:border-blue-500 bg-transparent text-[var(--text-primary)]`}
                            />
                            {otpError && (
                              <p className="text-[11px] text-rose-500 text-center mt-1.5">{otpError}</p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={handleVerifyOtpAndComplete}
                            className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.99] hover:opacity-90 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)] mt-2"
                          >
                            {isBn ? "যাচাই করুন ও অ্যাকাউন্ট সম্পন্ন করুন ✓" : "Verify & Complete Registration ✓"}
                          </button>

                          <div className="text-center text-xs text-[var(--text-muted)] pt-1 space-y-1">
                            <div>
                              <span>{isBn ? "কোড পাননি? " : "Didn't receive code? "}</span>
                              <button
                                type="button"
                                onClick={handleResendOtp}
                                className="font-semibold text-[var(--text-primary)] hover:underline ml-1 cursor-pointer"
                              >
                                {isBn ? "পুনরায় কোড পাঠান" : "Resend OTP"}
                              </button>
                            </div>
                            {resendStatus && (
                              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{resendStatus}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
