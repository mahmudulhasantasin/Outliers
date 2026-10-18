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
    loginWithGoogle,
    login,
    registerEmail,
    verifyOtp,
    resendOtp,
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
      await login({ email: loginEmail, password: loginPassword });
      closeModal();
      // Route by role
      const role = user?.role;
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
      setAuthError(msg);
      if (
        msg.toLowerCase().includes("exists") ||
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("registered")
      ) {
        setPendingOtpEmail(regEmail);
        setOtpInput("");
        setOtpError("");
        setRegStep("otp");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // OTP verify — real API with graceful fallback
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
      await verifyOtp({ email: pendingOtpEmail || regEmail, otp: otpInput.trim() });
      closeModal();
      if (selectedRole === "lawyer") router.push("/lawyer/pending");
      else if (selectedRole === "enterprise") router.push("/enterprise/admin");
      else router.push("/copilot");
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

  // ── Google Account Chooser System ──
  interface GoogleAccountItem {
    email: string;
    name: string;
    avatarUrl?: string;
  }

  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleChooserMode, setGoogleChooserMode] = useState<"login" | "register">("login");
  const [googleAccounts, setGoogleAccounts] = useState<GoogleAccountItem[]>([
    {
      email: "cybocronnoreply@gmail.com",
      name: "Cybocron Noreply",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=CybocronNoreply",
    },
    {
      email: "smsayemhossain1@gmail.com",
      name: "SM SAYEM HOSSAIN",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sayem",
    },
    {
      email: "hossainsmsayem@gmail.com",
      name: "SM Sayem Hossain",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=HossainSMSayem",
    },
    {
      email: "cybocron@gmail.com",
      name: "Cybocron",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cybocron",
    },
    {
      email: "sm.sayem.hossain.extra@gmail.com",
      name: "SM Sayem Hossain (Extra)",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SayemExtra",
    },
    {
      email: "hossainsmsayem2@gmail.com",
      name: "SM Sayem Hossain 2",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sayem2",
    },
    {
      email: "saakaza3@gmail.com",
      name: "Saakaza User",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Saakaza",
    },
  ]);
  const [googleNotice, setGoogleNotice] = useState<{
    type: "info" | "warning" | "error";
    message: string;
    actionType?: "switch_to_login" | "switch_to_register";
    targetEmail?: string;
  } | null>(null);
  const [isAddingNewGoogleAccount, setIsAddingNewGoogleAccount] = useState(false);
  const [newGoogleEmail, setNewGoogleEmail] = useState("");
  const [newGoogleName, setNewGoogleName] = useState("");

  const isAccountRegistered = (email: string): boolean => {
    const known = ["smsayemhossain1@gmail.com", "cybocronnoreply@gmail.com", "saakaza3@gmail.com"];
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("contractmind_known_registered") || "[]");
        if (Array.isArray(stored)) {
          known.push(...stored);
        }
      } catch {
        /* noop */
      }
    }
    return known.some((e) => e.toLowerCase() === email.trim().toLowerCase());
  };

  const markAccountAsRegistered = (email: string) => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("contractmind_known_registered") || "[]");
        const set = new Set([...stored, email.trim().toLowerCase()]);
        localStorage.setItem("contractmind_known_registered", JSON.stringify(Array.from(set)));
      } catch {
        /* noop */
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("contractmind_google_accounts") || "[]");
        if (Array.isArray(stored) && stored.length > 0) {
          const defaultList = [
            {
              email: "smsayemhossain1@gmail.com",
              name: "Sayem Hossain",
              avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sayem",
            },
            {
              email: "saakaza3@gmail.com",
              name: "Saakaza User",
              avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Saakaza",
            },
          ];
          const emails = new Set(stored.map((a: GoogleAccountItem) => a.email.toLowerCase()));
          const combined = [...stored];
          for (const d of defaultList) {
            if (!emails.has(d.email.toLowerCase())) {
              combined.push(d);
            }
          }
          setGoogleAccounts(combined);
        }
      } catch {
        /* noop */
      }
    }
  }, []);

  const openGoogleChooser = (mode: "login" | "register") => {
    setGoogleChooserMode(mode);
    setGoogleNotice(null);
    setIsAddingNewGoogleAccount(false);
    setNewGoogleEmail("");
    setNewGoogleName("");
    setShowGoogleChooser(true);
  };

  const handleSelectGoogleAccount = async (acc: GoogleAccountItem) => {
    const email = acc.email.trim();
    const name = acc.name.trim();

    if (googleChooserMode === "register") {
      // User is trying to REGISTER with this Google account:
      // If already registered, notify them and offer to switch to Login!
      if (isAccountRegistered(email)) {
        setGoogleNotice({
          type: "warning",
          message:
            language === "bn"
              ? `⚠️ "${email}" অ্যাকাউন্টটি ইতিমধ্যে নিবন্ধিত রয়েছে! দয়া করে এই অ্যাকাউন্ট দিয়ে লগইন করুন।`
              : `⚠️ "${email}" is already registered! Please sign in with this account instead.`,
          actionType: "switch_to_login",
          targetEmail: email,
        });
        return;
      }

      // Not registered yet -> Proceed with registration
      markAccountAsRegistered(email);
      setAuthLoading(true);
      try {
        await loginWithGoogle(selectedRole || "general", email, name);
        setShowGoogleChooser(false);
        closeModal();
        if (selectedRole === "lawyer") router.push("/lawyer/pending");
        else if (selectedRole === "enterprise") router.push("/enterprise/admin");
        else router.push("/copilot");
      } finally {
        setAuthLoading(false);
      }
    } else {
      // User is trying to LOGIN with this Google account:
      if (!isAccountRegistered(email)) {
        setGoogleNotice({
          type: "info",
          message:
            language === "bn"
              ? `ℹ️ "${email}" অ্যাকাউন্টটি এখনো নিবন্ধিত হয়নি। অনুগ্রহ করে প্রথমে নিবন্ধন সম্পন্ন করুন।`
              : `ℹ️ "${email}" is not registered yet. Please create an account first.`,
          actionType: "switch_to_register",
          targetEmail: email,
        });
        return;
      }

      setAuthLoading(true);
      try {
        await loginWithGoogle(selectedRole || "general", email, name);
        setShowGoogleChooser(false);
        closeModal();
        if (selectedRole === "lawyer") router.push("/lawyer/pending");
        else if (selectedRole === "enterprise") router.push("/enterprise/admin");
        else router.push("/copilot");
      } finally {
        setAuthLoading(false);
      }
    }
  };

  const handleSwitchFromGoogleToLogin = (targetEmail?: string) => {
    setShowGoogleChooser(false);
    setIsSignUp(false);
    setRegStep("role");
    if (targetEmail) {
      setLoginEmail(targetEmail);
    }
  };

  const handleSwitchFromGoogleToRegister = (targetEmail?: string) => {
    setShowGoogleChooser(false);
    setIsSignUp(true);
    setRegStep("role");
    if (targetEmail) {
      setRegEmail(targetEmail);
    }
  };

  const handleAddNewGoogleAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoogleEmail.trim() || !newGoogleEmail.includes("@")) return;
    const email = newGoogleEmail.trim();
    const name = newGoogleName.trim() || email.split("@")[0];
    const newAcc: GoogleAccountItem = {
      email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    };
    const updated = [newAcc, ...googleAccounts.filter((a) => a.email.toLowerCase() !== email.toLowerCase())];
    setGoogleAccounts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("contractmind_google_accounts", JSON.stringify(updated));
    }
    setIsAddingNewGoogleAccount(false);
    handleSelectGoogleAccount(newAcc);
  };

  const handleOpenNativeGoogleAccountPicker = () => {
    const width = 500;
    const height = 620;
    const left = typeof window !== "undefined" ? window.screenX + (window.outerWidth - width) / 2 : 100;
    const top = typeof window !== "undefined" ? window.screenY + (window.outerHeight - height) / 2 : 100;

    try {
      window.open(
        "https://accounts.google.com/AccountChooser?service=lso&continue=https://accounts.google.com",
        "google_browser_accounts",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
      );
    } catch (e) {
      console.warn("Popup blocked:", e);
    }

    setIsAddingNewGoogleAccount(true);
  };

  const handleGoogleDirectAuth = () => {
    openGoogleChooser(isSignUp ? "register" : "login");
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
            <a href="#about" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "পরিচিতি" : "About"}</a>
            <a href="#success-stories" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "সাফল্যের গল্প" : "Case Study"}</a>
            <a href="#services" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "সেবাসমূহ" : "Services"}</a>
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
      {/* MAIN CONTENT                                       */}
      {/* ═══════════════════════════════════════════════════ */}
      <main className="relative z-10 flex-1 flex flex-col">

        {/* SECTION 1 – HERO */}
        <section className="pt-16 sm:pt-24 pb-8 px-6 lg:px-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium uppercase tracking-tight leading-[1.15] mb-5 text-[var(--text-primary)]">
            {isBn ? (
              <>প্রতিটি আইনি পরিস্থিতিতে <br className="hidden sm:block" />আপনার নির্ভরযোগ্য সঙ্গী</>
            ) : (
              <>Your Legal Partner In <br className="hidden sm:block" />Every Situation</>
            )}
          </h1>
          <p className="text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed text-[var(--text-muted)] mb-8">
            {isBn
              ? "জটিল চুক্তি বিরোধ থেকে শুরু করে নিয়মিত করপোরেট ও বাণিজ্যিক পর্যালোচনা—বাংলাদেশের সংবিধিবদ্ধ আইনের শতভাগ নিশ্চয়তায় আমরা আপনার পাশে।"
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

        {/* SECTION 2 – STATUE HERO */}
        <section className="relative w-full max-w-6xl mx-auto px-6 py-4 flex flex-col items-center justify-center overflow-hidden">
          {/* JUSTICE watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.04] dark:opacity-[0.04] tracking-widest font-serif font-black text-[120px] sm:text-[220px] md:text-[280px] text-[var(--text-primary)]"
            aria-hidden="true"
          >
            JUSTICE
          </div>

          <div className="relative w-full flex flex-col lg:flex-row items-center justify-between gap-8 z-10">
            {/* Left copy */}
            <div className="w-full lg:w-1/4 text-center lg:text-left order-2 lg:order-1">
              <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
                {isBn ? (
                  <>আমাদের লিগ্যাল ইন্টেলিজেন্স সিস্টেম{" "}
                    <strong className="text-[var(--text-primary)] font-semibold">bdlaws এর সংবিধিবদ্ধ আইনের ধারা</strong>{" "}
                    এবং সুপ্রিম কোর্টের হাজারো নজিরের ভিত্তিতে নির্ভুল সিদ্ধান্ত প্রদান করে।</>
                ) : (
                  <>Our contract intelligence draws upon{" "}
                    <strong className="text-[var(--text-primary)] font-semibold">gazetted Bangladesh statutes</strong>{" "}
                    with zero hallucination and verifiable legal grounding.</>
                )}
              </p>
            </div>

            {/* Center: Statue */}
            <div className="relative w-72 sm:w-96 md:w-[420px] h-[380px] sm:h-[480px] md:h-[540px] flex items-center justify-center order-1 lg:order-2">
              <div className={`relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border ${borderClass} group`}>
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

            {/* Right badges */}
            <div className="w-full lg:w-1/4 flex flex-row lg:flex-col items-center lg:items-end justify-center gap-6 order-3">
              <div className="flex items-center gap-3 text-right">
                <div className="text-right">
                  <div className="text-xs font-serif font-bold uppercase tracking-wider text-[var(--text-primary)]">Top Advocate</div>
                  <div className="text-[10px] text-[var(--text-muted)]">bdlaws Verified 2026</div>
                </div>
                <div className={`w-10 h-10 rounded-full border ${borderClass} bg-[var(--bg-card)] flex items-center justify-center text-amber-500 font-serif text-sm shadow-sm`}>★</div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div className="text-right">
                  <div className="text-xs font-serif font-bold uppercase tracking-wider text-[var(--text-primary)]">Trusted AI</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Zero Hallucination</div>
                </div>
                <div className={`w-10 h-10 rounded-full border ${borderClass} bg-[var(--bg-card)] flex items-center justify-center text-amber-500 font-serif text-sm shadow-sm`}>★</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 – MISSION & STATS */}
        <section id="about" className="py-20 px-6 lg:px-10 max-w-5xl mx-auto text-center">
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal leading-[1.35] tracking-tight mb-16 max-w-4xl mx-auto text-[var(--text-primary)]">
            {isBn ? (
              <>Legal Copilot-এ আমরা বুদ্ধিমত্তা, নিখুঁত ধারা যাচাইকরণ এবং{" "}
                <span className="font-semibold underline decoration-indigo-500/50 underline-offset-4">ক্লায়েন্ট-কেন্দ্রিক বিশ্বস্ততার</span>{" "}
                সমন্বয়ে আইনি সেবা প্রদান করি। প্রতিটি পদক্ষেপে আইনি নিশ্চয়তায় আমরা আপনার পাশে।</>
            ) : (
              <>At Legal Copilot, We Deliver Smart Legal Solutions Through Expertise, Precision, And A{" "}
                <span className="font-semibold underline decoration-indigo-500/50 underline-offset-4">Client Focused Mindset</span>
                . Backed By Integrity And Results, We Support You Every Step Of The Way.</>
            )}
          </p>

          {/* Stats with scroll button */}
          <div className={`relative pt-10 border-t ${borderClass}`}>
            {/* Scroll down circular button */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
              <button
                type="button"
                onClick={() => document.getElementById("success-stories")?.scrollIntoView({ behavior: "smooth" })}
                className={`group relative w-12 h-12 rounded-full border ${borderClass} bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-primary)] shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer`}
                aria-label="Scroll down"
              >
                <ChevronDown className="w-5 h-5 text-[var(--text-muted)] group-hover:text-indigo-500 transition-colors animate-bounce" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
              {[
                { val: "99.4%", label: isBn ? "আইনি ধারা নিশ্চয়তা" : "Statutory Accuracy" },
                { val: "1,200+", label: isBn ? "চুক্তি সফলভাবে অডিট" : "Contracts Audited" },
                { val: "98%", label: isBn ? "আইনজীবী সন্তুষ্টি" : "Counsel Approval" },
                { val: "100%", label: isBn ? "সার্বভৌম ডেটা গোপনীয়তা" : "PII Redaction" },
              ].map((s) => (
                <div key={s.val}>
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-1 text-[var(--text-primary)]">{s.val}</div>
                  <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 – TESTIMONIALS */}
        <section id="success-stories" className="py-20 px-6 lg:px-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                {isBn ? "সাফল্যের গল্প ও রিভিউ" : "Client Success Stories"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-normal tracking-tight text-[var(--text-primary)]">
                {isBn ? "অভিজ্ঞতা ও কৌশলের মাধ্যমে সফল সমাধান" : "Powerful Success Stories Driven By Strategy And Experience"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => openLoginModal(false)}
              className={`self-start md:self-auto px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border ${borderClass} hover:border-[var(--text-primary)]/40 flex items-center gap-1.5 transition-all bg-[var(--bg-card)] text-[var(--text-primary)] cursor-pointer`}
            >
              <span>{isBn ? "সব রিভিউ দেখুন" : "View Success Stories"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left selectors */}
            <div className="lg:col-span-4 flex lg:flex-col gap-4 justify-between sm:justify-start overflow-x-auto pb-2 lg:pb-0">
              {testimonials.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTestimonial(idx)}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all text-left cursor-pointer border ${
                    activeTestimonial === idx
                      ? "border-[var(--text-primary)]/60 bg-[var(--bg-card)] shadow-sm"
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

            {/* Right featured testimonial – fixed dark card intentionally for contrast */}
            <div
              className="lg:col-span-8 rounded-3xl p-8 sm:p-12 border border-[#333] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]"
              style={{ backgroundColor: "#1e1713" }}
            >
              <div className="relative z-10">
                <Quote className="w-8 h-8 text-amber-500/50 mb-4" />
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
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 – CONSULTATION */}
        <section id="consultation" className="py-20 px-6 lg:px-10 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left form */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                {isBn ? "সরাসরি আইনি পরামর্শ" : "Schedule A Consultation"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-normal tracking-tight mb-4 text-[var(--text-primary)]">
                {isBn ? "আমাদের বিশেষজ্ঞদের সাথে অ্যাপয়েন্টমেন্ট বুক করুন" : "Schedule A Consultation With Our Legal Experts"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
                {isBn
                  ? "আপনার চুক্তি অথবা যেকোনো আইনি জটিলতায় আমাদের সুপ্রিম কোর্ট আইনজীবী প্যানেল ও এআই কোপাইলট প্রস্তুত।"
                  : "Take the first step toward resolving your legal matters with confidence. Our team provides clear guidance tailored to your needs."}
              </p>

              <form onSubmit={(e) => { e.preventDefault(); openLoginModal(false); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder={isBn ? "প্রথম নাম" : "First Name"} className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]`} />
                  <input type="text" placeholder={isBn ? "শেষ নাম" : "Last Name"} className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="email" placeholder={isBn ? "ইমেইল অ্যাড্রেস" : "Email Address"} className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]`} />
                  <input type="tel" placeholder={isBn ? "ফোন নম্বর" : "Phone Number"} className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]`} />
                </div>
                <select className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)]`}>
                  <option value="">{isBn ? "সেবা নির্বাচন করুন..." : "Select Legal Service..."}</option>
                  <option value="contract">{isBn ? "বাণিজ্যিক চুক্তি অডিট" : "Commercial Contract Audit"}</option>
                  <option value="labor">{isBn ? "শ্রম আইন ২০০৬ সম্মতি" : "Labor Law 2006 Compliance"}</option>
                  <option value="arbitration">{isBn ? "আরবিট্রেশন ও বিরোধ নিষ্পত্তি" : "Arbitration & Dispute"}</option>
                </select>
                <textarea rows={3} placeholder={isBn ? "আপনার চুক্তি বা বিরোধের সংক্ষেপ..." : "Message or specific contract details..."} className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]`} />
                <button type="submit" className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 hover:opacity-90 flex items-center gap-2 cursor-pointer bg-[var(--accent-solid)] text-[var(--accent-contrast)]">
                  <span>{isBn ? "অ্যাপয়েন্টমেন্ট নিশ্চিত করুন" : "Confirm Your Appointment"}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right image */}
            <div className={`relative w-full h-[360px] sm:h-[440px] rounded-3xl overflow-hidden border ${borderClass} shadow-xl group`}>
              <Image src="/consultation.jpg" alt="Lawyer and client discussing legal contract" fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">{isBn ? "চেম্বার কনসাল্টেশন" : "In-Chamber & AI Review"}</div>
                <div className="text-sm font-serif">{isBn ? "আইনি নিশ্চয়তা এবং পেশাদারিত্বের সমন্বয়ে সেবা" : "Backed by seasoned advocates & autonomous contract intelligence"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6 – FOOTER */}
        <footer className="mt-auto pt-16 pb-12 px-6 lg:px-10 bg-[var(--bg-surface)] text-[var(--text-primary)]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
              {/* Col 1 */}
              <div>
                <div className="font-serif font-bold text-2xl tracking-tight mb-3 text-[var(--text-primary)]">
                  Legal Copilot<span className="text-indigo-600 dark:text-indigo-400">.</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                  {isBn ? "বাংলাদেশের প্রথম সার্বভৌম ও সংবিধিবদ্ধ আইন সমর্থিত লিগ্যাল কোপাইলট।" : "Reliable Legal Solutions Focused On Protecting Your Rights With Clarity, Integrity, And Results."}
                </p>
                <div className="text-xs text-[var(--text-muted)]">Dhaka, Bangladesh • Supreme Court Chamber</div>
              </div>

              {/* Col 2 */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-4 text-[var(--text-primary)]">{isBn ? "কুইক লিংকস" : "Quick Links"}</div>
                <ul className="space-y-2 text-xs text-[var(--text-muted)]">
                  <li><a href="#" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "হোম" : "Home"}</a></li>
                  <li><a href="#about" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "আমাদের সম্পর্কে" : "About"}</a></li>
                  <li><a href="#services" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "সেবাসমূহ" : "Services"}</a></li>
                  <li><a href="#success-stories" className="hover:text-[var(--text-primary)] transition-colors">{isBn ? "সাফল্যের গল্প" : "Case Study"}</a></li>
                </ul>
              </div>

              {/* Col 3 */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-4 text-[var(--text-primary)]">{isBn ? "আইনি সেবা" : "Services"}</div>
                <ul className="space-y-2 text-xs text-[var(--text-muted)]">
                  <li>{isBn ? "বাণিজ্যিক চুক্তি অডিট" : "Commercial Contract Audit"}</li>
                  <li>{isBn ? "দ্য কন্ট্রাক্ট অ্যাক্ট ১৮৭২ রিভিউ" : "Contract Act 1872 Review"}</li>
                  <li>{isBn ? "শ্রম আইন ২০০৬ সম্মতি" : "Labor Act Compliance"}</li>
                  <li>{isBn ? "আরবিট্রেশন ধারা যাচাই" : "Arbitration Clause Check"}</li>
                </ul>
              </div>

              {/* Col 4 */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-4 text-[var(--text-primary)]">{isBn ? "যোগাযোগ" : "Contact Info"}</div>
                <div className="text-xs text-[var(--text-muted)] space-y-1.5">
                  <div>info@legalcopilot.bd</div>
                  <div>Dhaka Chamber, Bangladesh</div>
                </div>
              </div>
            </div>

            {/* Footer bottom – oversized brand watermark */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-3xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight text-[var(--text-primary)]/10 select-none">
                Legal Copilot.
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                © 2026 Outliers. {isBn ? "সর্বস্বত্ব সংরক্ষিত।" : "All Rights Reserved."}
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
                    <div className={`relative my-5 flex items-center justify-center`}>
                      <div className={`w-full border-t ${borderClass}`} />
                      <span className={`absolute px-3 text-[11px] uppercase tracking-wider font-semibold bg-[var(--bg-card)] text-[var(--text-muted)]`}>{isBn ? "অথবা" : "or continue with"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { label: "Google", icon: (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" /></svg>) },
                        { label: "GitHub", icon: (<svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>) },
                        { label: "Apple", icon: (<svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8.92-2.85-.9.04-1.97.6-2.61 1.35-.57.65-1.06 1.71-.93 2.73.99.08 2.01-.5 2.62-1.23z" /></svg>) },
                      ].map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => {
                            if (s.label === "Google") openGoogleChooser("login");
                            else handleGoogleDirectAuth();
                          }}
                          className={`py-2 px-3 rounded-xl border ${borderClass} flex items-center justify-center transition-all hover:bg-[var(--bg-surface)] active:scale-95 cursor-pointer text-[var(--text-primary)]`}
                          aria-label={`Continue with ${s.label}`}
                        >
                          {s.icon}
                        </button>
                      ))}
                    </div>
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

                        {/* Direct Google Signup (No OTP) */}
                        <button type="button" onClick={() => openGoogleChooser("register")} className={`w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border-2 ${borderClass} hover:border-[var(--accent-solid)]/60 hover:bg-[var(--bg-surface)] transition-all text-sm font-semibold text-[var(--text-primary)] mb-3 cursor-pointer`}>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" /></svg>
                          {isBn ? "Google দিয়ে সরাসরি নিবন্ধন (অ্যাকাউন্ট চয়ন)" : "Continue with Google (Choose Account)"}
                        </button>

                        <div className={`relative my-3 flex items-center justify-center`}>
                          <div className={`w-full border-t ${borderClass}`} />
                          <span className={`absolute px-3 text-[11px] uppercase tracking-wider font-semibold bg-[var(--bg-card)] text-[var(--text-muted)]`}>
                            {isBn ? "অথবা ইমেইল দিয়ে (ওটিপি লাগবে)" : "or with email (requires OTP)"}
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

      {/* ═══════════════════════════════════════════════════ */}
      {/* GOOGLE ACCOUNT CHOOSER MODAL                        */}
      {/* ═══════════════════════════════════════════════════ */}
      {showGoogleChooser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
            onClick={() => setShowGoogleChooser(false)}
          />

          {/* Dialog Card */}
          <div
            className={`relative w-full max-w-[460px] rounded-3xl p-6 sm:p-7 shadow-2xl border ${borderClass} bg-[var(--bg-card)] text-[var(--text-primary)] z-10 animate-in zoom-in-95 duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowGoogleChooser(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              aria-label="Close Google Chooser"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Google G Logo */}
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Google Identity
              </span>
            </div>

            {/* Header Titles */}
            <h3 className="text-xl font-bold tracking-tight mb-1">
              {googleChooserMode === "register"
                ? (isBn ? "Google দিয়ে নিবন্ধন করুন" : "Sign up with Google")
                : (isBn ? "Google দিয়ে সাইন ইন করুন" : "Sign in with Google")}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              {googleChooserMode === "register"
                ? (isBn
                    ? "ContractMind Legal Copilot-এ অ্যাকাউন্ট তৈরি করতে একটি Google অ্যাকাউন্ট নির্বাচন করুন।"
                    : "Choose an account to create your account on ContractMind Legal Copilot.")
                : (isBn
                    ? "ContractMind Legal Copilot-এ চালিয়ে যেতে আপনার Google অ্যাকাউন্ট নির্বাচন করুন।"
                    : "Choose an account to continue to ContractMind Legal Copilot.")}
            </p>

            {/* Notice / Warning Banner (e.g. Account Already Registered) */}
            {googleNotice && (
              <div
                className={`mb-4 p-3.5 rounded-2xl border text-xs flex flex-col gap-2.5 transition-all animate-in slide-in-from-top-2 duration-150 ${
                  googleNotice.type === "warning"
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200"
                    : googleNotice.type === "error"
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/60 text-rose-900 dark:text-rose-200"
                    : "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/60 text-blue-900 dark:text-blue-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span className="font-semibold leading-relaxed">{googleNotice.message}</span>
                </div>
                {googleNotice.actionType === "switch_to_login" && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleSwitchFromGoogleToLogin(googleNotice.targetEmail)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{isBn ? "লগইন স্ক্রিনে যান" : "Go to Sign In"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {googleNotice.actionType === "switch_to_register" && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleSwitchFromGoogleToRegister(googleNotice.targetEmail)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{isBn ? "নিবন্ধন স্ক্রিনে যান" : "Go to Register"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* List of Accounts */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {googleAccounts.map((acc) => {
                const registered = isAccountRegistered(acc.email);
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectGoogleAccount(acc)}
                    className={`w-full p-3 rounded-2xl border ${borderClass} hover:border-[var(--accent-solid)]/60 hover:bg-[var(--bg-surface)] transition-all flex items-center justify-between text-left group cursor-pointer active:scale-[0.99]`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-white/20 shadow-sm">
                        {acc.avatarUrl ? (
                          <img src={acc.avatarUrl} alt={acc.name} className="w-full h-full object-cover" />
                        ) : (
                          acc.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate text-[var(--text-primary)] group-hover:text-[var(--accent-solid)] transition-colors">
                          {acc.name}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] truncate">
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      {registered && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {isBn ? "নিবন্ধিত" : "Registered"}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Add / Choose Another Google Account Section */}
            <div className="mt-3 pt-3 border-t border-[var(--text-primary)]/10 space-y-2.5">
              <button
                type="button"
                onClick={handleOpenNativeGoogleAccountPicker}
                className="w-full py-2.5 px-3 rounded-2xl hover:bg-[var(--bg-surface)] border-2 border-dashed border-blue-400/40 hover:border-blue-500 transition-all flex items-center justify-between text-xs font-semibold text-[var(--text-primary)] cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[var(--text-primary)]">
                      {isBn ? "ব্রাউজারের সকল Google অ্যাকাউন্ট দেখুন" : "View all browser Google accounts"}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] font-normal">
                      {isBn ? "Chrome / ব্রাউজারের সাইন-ইন উইন্ডো খুলবে" : "Opens native Chrome / browser Google selector"}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              {isAddingNewGoogleAccount && (
                <form onSubmit={handleAddNewGoogleAccount} className="space-y-2.5 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      {isBn ? "ব্রাউজার থেকে যে অ্যাকাউন্টটি বেছে নিয়েছেন তার ইমেইল দিন:" : "Enter your selected Google account email:"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewGoogleAccount(false)}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      {isBn ? "লুকান" : "Close"}
                    </button>
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="your.email@gmail.com"
                    value={newGoogleEmail}
                    onChange={(e) => setNewGoogleEmail(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none bg-[var(--bg-card)] ${borderClass} focus:border-blue-500 text-[var(--text-primary)]`}
                  />
                  <input
                    type="text"
                    placeholder={isBn ? "আপনার নাম (ঐচ্ছিক)" : "Full name (optional)"}
                    value={newGoogleName}
                    onChange={(e) => setNewGoogleName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none bg-[var(--bg-card)] ${borderClass} focus:border-blue-500 text-[var(--text-primary)]`}
                  />
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewGoogleAccount(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-card)] cursor-pointer"
                    >
                      {isBn ? "বাতিল" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--accent-solid)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 shadow-sm cursor-pointer"
                    >
                      {isBn ? "এই অ্যাকাউন্ট দিয়ে চালিয়ে যান" : "Proceed with this Account"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Google privacy note */}
            <p className="mt-4 text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
              {isBn
                ? "ContractMind এর সাথে আপনার নাম, ইমেইল ও ছবি সুরক্ষিতভাবে আদান-প্রদান করা হবে।"
                : "Google will securely share your name, email, and photo with ContractMind Legal Copilot."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
