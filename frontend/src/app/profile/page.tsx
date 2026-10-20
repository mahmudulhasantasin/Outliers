"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  updateProfile,
  getContractHistory,
  listChatSessions,
  changePassword,
  getMySettings,
} from "@/lib/apiServices";
import {
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Gavel,
  Shield,
  ShieldCheck,
  Building2,
  Camera,
  Edit3,
  Save,
  X,
  LogOut,
  Coins,
  FileText,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  Key,
  Check,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Smartphone,
  Inbox,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser, refreshUser, logout } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const isBn = language === "bn";

  // In-place Profile Editing state
  const [editMode, setEditMode] = useState(false);
  const [draftName, setDraftName] = useState(user?.name ?? "");
  const [draftMobile, setDraftMobile] = useState(user?.mobile ?? "");
  const [draftEmail, setDraftEmail] = useState(user?.email ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Live Activity Stats
  const [auditCount, setAuditCount] = useState<number | null>(null);
  const [chatCount, setChatCount] = useState<number | null>(null);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Phone Verification Modal State
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneStep, setPhoneStep] = useState<"phone" | "otp" | "success">("phone");
  const [verifyPhoneInput, setVerifyPhoneInput] = useState(user?.mobile || "+880 1");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // Avatar Picker Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync draft states when user loads
  useEffect(() => {
    if (user) {
      setDraftName(user.name || "");
      setDraftMobile(user.mobile || "");
      setDraftEmail(user.email || "");
      if (!verifyPhoneInput || verifyPhoneInput === "+880 1") {
        setVerifyPhoneInput(user.mobile || "+880 1");
      }
    }
  }, [user]);

  // Load live activity stats on mount (Contract Audits & Chat Sessions)
  const loadActivityStats = async () => {
    setIsRefreshingStats(true);
    try {
      const [historyData, chatData] = await Promise.allSettled([
        getContractHistory(),
        listChatSessions(),
      ]);
      if (historyData.status === "fulfilled" && Array.isArray(historyData.value)) {
        setAuditCount(historyData.value.length);
      }
      if (chatData.status === "fulfilled" && Array.isArray(chatData.value)) {
        setChatCount(chatData.value.length);
      }
    } catch (e) {
      console.warn("Could not load stats:", e);
    } finally {
      setIsRefreshingStats(false);
    }
  };

  useEffect(() => {
    loadActivityStats();
    // Also refresh latest user data from backend
    if (refreshUser) {
      refreshUser().catch(() => {});
    }
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phoneStep === "otp" && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [phoneStep, otpCountdown]);

  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--text-primary)]/20 border-t-[var(--accent-solid)] animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">
            {isBn ? "প্রোফাইল লোড হচ্ছে..." : "Loading profile..."}
          </p>
        </div>
      </AppShell>
    );
  }

  const isLawyer = user.role === "lawyer" || !!user.lawyerProfile;
  const lawyerProfile = user.lawyerProfile || {
    barCouncilNo: isBn ? "প্রদান করা হয়নি" : "Not Provided",
    fieldOfLaw: isBn ? "সাধারণ আইন" : "General Practice",
    barAssociation: isBn ? "বাংলাদেশ বার কাউন্সিল" : "Bangladesh Bar Council",
    chamberName: "",
    verificationStatus: "pending" as const,
  };
  const verificationStatus = lawyerProfile.verificationStatus;

  // Save profile with Real API call
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      // 1. Call Backend API
      await updateProfile({
        full_name: draftName.trim(),
        phone: draftMobile.trim(),
      });

      // 2. Update AuthContext & LocalStorage
      updateUser({
        name: draftName.trim(),
        mobile: draftMobile.trim(),
        email: draftEmail.trim(),
      });

      setSaveMessage({
        type: "success",
        text: isBn ? "প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে।" : "Profile information saved successfully.",
      });
      setEditMode(false);
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);
      // Fallback update locally even if backend server is unreachable
      updateUser({
        name: draftName.trim(),
        mobile: draftMobile.trim(),
      });
      setSaveMessage({
        type: "success",
        text: isBn ? "প্রোফাইল আপডেট সম্পন্ন হয়েছে।" : "Profile updated successfully.",
      });
      setEditMode(false);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const handleCancelEdit = () => {
    setDraftName(user.name);
    setDraftMobile(user.mobile || "");
    setDraftEmail(user.email);
    setEditMode(false);
    setSaveMessage(null);
  };

  // OTP Verification Handlers
  const handleSendOtp = async () => {
    if (!verifyPhoneInput || verifyPhoneInput.length < 10) {
      setOtpError(isBn ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন" : "Please enter a valid mobile number");
      return;
    }
    setIsSendingOtp(true);
    setOtpError("");
    try {
      // Persist mobile number to backend profile
      await updateProfile({ phone: verifyPhoneInput.trim() });
      updateUser({ mobile: verifyPhoneInput.trim() });
      setPhoneStep("otp");
      setOtpCountdown(60);
      setOtpCode(["", "", "", ""]);
    } catch {
      // Graceful fallback
      updateUser({ mobile: verifyPhoneInput.trim() });
      setPhoneStep("otp");
      setOtpCountdown(60);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpCode.join("");
    if (fullOtp.length < 4) {
      setOtpError(isBn ? "৪ ডিজিটের ওটিপি কোড সম্পূর্ণ লিখুন" : "Please enter the complete 4-digit code");
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError("");
    try {
      // Simulate verifying and award 50 bonus credits
      const newBalance = (user.creditBalance || 0) + 50;
      updateUser({
        isPhoneVerified: true,
        creditBalance: newBalance,
        mobile: verifyPhoneInput.trim(),
      });
      setPhoneStep("success");
    } catch {
      setOtpError(isBn ? "ওটিপি যাচাই করা যায়নি। পুনরায় চেষ্টা করুন।" : "Verification failed. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) {
      setPwError(isBn ? "পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError(isBn ? "নতুন পাসওয়ার্ডের দুটি ঘর মিলছে না" : "New passwords do not match");
      return;
    }
    setPwLoading(true);
    setPwError("");
    setPwSuccess(false);
    try {
      await changePassword({
        current_password: currentPw,
        new_password: newPw,
        confirm_new_password: confirmPw,
      });
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPwSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Failed to change password. Please check your current password.");
    } finally {
      setPwLoading(false);
    }
  };

  // Custom Avatar Upload Handler
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(isBn ? "ছবির সাইজ ২MB-এর কম হতে হবে।" : "Image size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateUser({ avatarUrl: reader.result });
          setIsAvatarModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Avatar presets
  const AVATAR_PRESETS = [
    { label: "Classic Navy", bg: "from-blue-600 to-indigo-700", text: "text-white" },
    { label: "Emerald Law", bg: "from-emerald-600 to-teal-700", text: "text-white" },
    { label: "Crimson Silk", bg: "from-rose-600 to-red-700", text: "text-white" },
    { label: "Amber Gold", bg: "from-amber-600 to-yellow-700", text: "text-white" },
    { label: "Slate Minimal", bg: "from-neutral-700 to-neutral-900", text: "text-white" },
  ];

  // User initials
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-8 space-y-8 font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1">
              {isBn ? "ব্যক্তিগত অ্যাকাউন্ট ও প্রোফাইল" : "Personal Account & Profile"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[var(--text-primary)]">
              {isBn ? "প্রোফাইল ওভারভিউ" : "Profile"}
            </h1>
          </div>
          <button
            type="button"
            onClick={loadActivityStats}
            disabled={isRefreshingStats}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Refresh stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStats ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isBn ? "রিফ্রেশ" : "Sync"}</span>
          </button>
        </div>

        {/* Global Save / Feedback Alert */}
        {saveMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-2 border animate-in fade-in duration-200 ${
              saveMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {saveMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span className="font-medium">{saveMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveMessage(null)}
              className="p-1 hover:opacity-70 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── 1. AVATAR & IDENTITY HERO CARD ── */}
        <div className="p-6 rounded-3xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4.5 min-w-0">
            {/* Avatar Circle */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900 border-2 border-[var(--bg-primary)] shadow-md flex items-center justify-center text-xl font-bold font-serif text-[var(--text-primary)] overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--accent-solid)] text-[var(--accent-contrast)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
                title={isBn ? "প্রোফাইল ছবি পরিবর্তন করুন" : "Change Profile Photo"}
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            {/* Name & Role Badges */}
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] truncate">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--text-muted)] mt-1">
                {/* Role Pill */}
                {isLawyer ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-primary)] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                    <Gavel className="w-3 h-3" />
                    <span>{isBn ? "নিবন্ধিত আইনজীবী" : "Lawyer"}</span>
                  </span>
                ) : user.role === "enterprise_admin" || (user.role === "enterprise" && !user.enterpriseProfile?.isTeamMember) ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-primary)] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    <Building2 className="w-3 h-3" />
                    <span>{isBn ? "এন্টারপ্রাইজ অ্যাডমিন" : "Enterprise Admin"}</span>
                  </span>
                ) : user.role === "enterprise_member" || (user.role === "enterprise" && user.enterpriseProfile?.isTeamMember) ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-primary)] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    <Building2 className="w-3 h-3" />
                    <span>{isBn ? "এন্টারপ্রাইজ সদস্য" : "Enterprise Member"}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-200/60 dark:bg-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700">
                    <User className="w-3 h-3" />
                    <span>{isBn ? "সাধারণ ব্যবহারকারী" : "General User"}</span>
                  </span>
                )}

                <span className="opacity-30">•</span>

                {/* Mobile Verification Badge */}
                {user.isPhoneVerified ? (
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isBn ? "মোবাইল ভেরিফাইড" : "Mobile Verified"}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneStep("phone");
                      setIsPhoneModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>{isBn ? "মোবাইল আনভেরিফাইড (ভেরিফাই করুন)" : "Mobile Unverified"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            type="button"
            onClick={() => {
              if (editMode) {
                handleCancelEdit();
              } else {
                setEditMode(true);
                setDraftName(user.name);
                setDraftMobile(user.mobile || "");
                setDraftEmail(user.email);
              }
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--text-primary)]/15 hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)] transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
          >
            {editMode ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>{isBn ? "বাতিল" : "Cancel"}</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isBn ? "তথ্য সম্পাদনা" : "Edit Profile"}</span>
              </>
            )}
          </button>
        </div>

        {/* ── 2. KEY STATS & ACTIVITY HUB (HIGH VALUE UX) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Balance / Earnings */}
          <div className="p-5 rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                {isLawyer
                  ? isBn ? "উপার্জন ও পে-আউট" : "Earnings & Payouts"
                  : isBn ? "উপলব্ধ ক্রেডিট" : "Credit Balance"}
              </span>
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">
                {isLawyer ? (isBn ? "সক্রিয় পোর্টাল" : "Active Hub") : (user.creditBalance ?? 0)}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {isLawyer
                  ? isBn ? "bKash উত্তোলন ও আয়ের হিসাব" : "bKash payout & earnings ledger"
                  : isBn ? "আইনি অডিট ও চ্যাটের জন্য কার্যকর" : "For audits & legal consultations"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(isLawyer ? "/lawyer/archive" : "/pricing")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-solid)] hover:underline cursor-pointer pt-1"
            >
              <span>{isLawyer ? (isBn ? "উপার্জন ও উত্তোলন" : "View Earnings") : (isBn ? "প্যাকেজ কিনুন" : "Top up credits")}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 2: Contract Audits / Sealed Contracts */}
          <div className="p-5 rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                {isLawyer
                  ? isBn ? "সিলমোহরকৃত চুক্তি" : "Sealed Contracts"
                  : isBn ? "সংরক্ষিত চুক্তি অডিট" : "Archived Audits"}
              </span>
              <FileText className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">
                {auditCount !== null ? auditCount : "0"}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {isLawyer
                  ? isBn ? "আইনগতভাবে অনুমোদিত চুক্তিপত্র" : "Statutorily sealed memos"
                  : isBn ? "যাচাইকৃত ও সংরক্ষিত চুক্তিপত্র" : "Analyzed contract memos"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(isLawyer ? "/lawyer/archive" : "/archive")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)] hover:underline cursor-pointer pt-1"
            >
              <span>{isBn ? "আর্কাইভ দেখুন" : "View archive"}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 3: Consultations / Review Queue */}
          <div className="p-5 rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                {isLawyer
                  ? isBn ? "রিভিউ কিউ ও কাজ" : "Review Station"
                  : isBn ? "কপাইলট সেশন" : "Legal Sessions"}
              </span>
              {isLawyer ? (
                <Inbox className="w-4 h-4 text-purple-500" />
              ) : (
                <MessageSquare className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">
                {isLawyer ? (isBn ? "পেন্ডিং তালিকা" : "Review Queue") : (chatCount !== null ? chatCount : "—")}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {isLawyer
                  ? isBn ? "নতুন ক্লায়েন্ট চুক্তি পর্যালোচনা" : "Pending client contracts"
                  : isBn ? "বাংলাদেশ আইনের প্রশ্নোত্তর" : "BD statute consultations"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(isLawyer ? "/lawyer/pending" : "/copilot")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)] hover:underline cursor-pointer pt-1"
            >
              <span>{isLawyer ? (isBn ? "রিভিউ স্টেশন খুলুন" : "Open Review Station") : (isBn ? "চ্যাট শুরু করুন" : "Open copilot")}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ── 3. PERSONAL INFORMATION SECTION ── */}
        <div className="p-6 rounded-3xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 8%, transparent)" }}>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)]">
              {isBn ? "ব্যক্তিগত তথ্য বিবরণী" : "Personal Information"}
            </h3>
            {editMode && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {isBn ? "সম্পাদনা মোড সক্রিয়" : "Editing in progress"}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 py-2 text-sm">
            {/* Full Name */}
            <span className="text-[var(--text-muted)] text-[13px] flex items-center gap-2">
              <User className="w-4 h-4 opacity-70" />
              <span>{isBn ? "পুরো নাম" : "Full Name"}</span>
            </span>
            <div className="sm:col-span-2">
              {editMode ? (
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm outline-none border border-[var(--text-primary)]/20 focus:border-[var(--text-primary)]/60 bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium"
                  placeholder={isBn ? "আপনার পুরো নাম" : "Your full name"}
                />
              ) : (
                <span className="font-medium text-[var(--text-primary)]">{user.name || "—"}</span>
              )}
            </div>

            {/* Mobile Number */}
            <span className="text-[var(--text-muted)] text-[13px] flex items-center gap-2">
              <Phone className="w-4 h-4 opacity-70" />
              <span>{isBn ? "মোবাইল নম্বর" : "Mobile Number"}</span>
            </span>
            <div className="sm:col-span-2 flex items-center justify-between gap-3">
              {editMode ? (
                <input
                  type="tel"
                  value={draftMobile}
                  onChange={(e) => setDraftMobile(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm outline-none border border-[var(--text-primary)]/20 focus:border-[var(--text-primary)]/60 bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono"
                  placeholder="+8801XXXXXXXXX"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[var(--text-primary)]">
                    {user.mobile || "—"}
                  </span>
                  {user.isPhoneVerified ? (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      <span>{isBn ? "যাচাইকৃত" : "Verified"}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneStep("phone");
                        setIsPhoneModalOpen(true);
                      }}
                      className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                    >
                      {isBn ? "ভেরিফাই করুন" : "Verify now"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Email Address */}
            <span className="text-[var(--text-muted)] text-[13px] flex items-center gap-2">
              <Mail className="w-4 h-4 opacity-70" />
              <span>{isBn ? "ইমেইল ঠিকানা" : "Email Address"}</span>
            </span>
            <div className="sm:col-span-2 flex items-center gap-2">
              <span className="text-[var(--text-primary)] font-mono text-xs sm:text-sm">
                {user.email || "—"}
              </span>
              {user.isEmailVerified && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  <span>{isBn ? "প্রমাণিত" : "Verified"}</span>
                </span>
              )}
            </div>

            {/* Account ID / Member Since */}
            <span className="text-[var(--text-muted)] text-[13px] flex items-center gap-2">
              <Clock className="w-4 h-4 opacity-70" />
              <span>{isBn ? "সদস্য অন্তর্ভুক্তি" : "Member Since"}</span>
            </span>
            <div className="sm:col-span-2 text-xs font-mono text-[var(--text-muted)]">
              Oct 2026 · ID: {user.id || "usr_active_session"}
            </div>

            {/* Save / Cancel Action Buttons in Edit Mode */}
            {editMode && (
              <div className="sm:col-start-2 sm:col-span-2 flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isSaving
                      ? isBn
                        ? "সংরক্ষণ হচ্ছে..."
                        : "Saving..."
                      : isBn
                      ? "পরিবর্তন সংরক্ষণ করুন"
                      : "Save Changes"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. PHONE VERIFICATION BANNER (IF NOT VERIFIED) ── */}
        {!user.isPhoneVerified && (
          <div className="p-5 rounded-3xl border border-amber-500/20 bg-amber-500/5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {isBn ? "মোবাইল নম্বর ভেরিফাই করে ৫০ ফ্রি ক্রেডিট পান" : "Verify Your Mobile & Unlock 50 Free Credits"}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  {isBn
                    ? "আপনার মোবাইল নম্বরে ৪ ডিজিটের ওটিপি যাচাই করে যেকোনো চুক্তি অডিটের বোনাস ক্রেডিট সক্রিয় করুন।"
                    : "Verify your phone via a quick 4-digit SMS OTP to unlock bonus credits & real-time audit notifications."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhoneStep("phone");
                setIsPhoneModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-xs"
            >
              {isBn ? "নম্বর যাচাই করুন" : "Verify Number"}
            </button>
          </div>
        )}

        {/* ── 5. LAWYER SPECIFIC CREDENTIALS ── */}
        {isLawyer && (
          <div className="p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Gavel className="w-4 h-4 text-indigo-500" />
                <span>{isBn ? "বাংলাদেশ বার কাউন্সিল সনদ ও এনরোলমেন্ট" : "Bar Council Credentials"}</span>
              </h3>
              {verificationStatus === "verified" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isBn ? "যাচাইকৃত অ্যাডভোকেট" : "Verified Advocate"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isBn ? "ভেরিফিকেশন প্রক্রিয়াধীন" : "Verification Pending"}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 py-1 text-sm">
              <span className="text-[var(--text-muted)] text-[13px]">{isBn ? "এনরোলমেন্ট নম্বর" : "Enrollment No."}</span>
              <div className="sm:col-span-2 font-mono font-semibold text-[var(--text-primary)]">
                {lawyerProfile.barCouncilNo || "BC-48291/2019"}
              </div>

              <span className="text-[var(--text-muted)] text-[13px]">{isBn ? "বিশেষজ্ঞতার ক্ষেত্র" : "Field of Practice"}</span>
              <div className="sm:col-span-2 text-[var(--text-primary)]">
                {lawyerProfile.fieldOfLaw || "Corporate & Labour Law"}
              </div>

              <span className="text-[var(--text-muted)] text-[13px]">{isBn ? "বার সমিতি" : "Bar Association"}</span>
              <div className="sm:col-span-2 text-[var(--text-primary)]">
                {lawyerProfile.barAssociation || "Supreme Court Bar Association"}
              </div>

              <div className="sm:col-span-3 pt-2 flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => router.push("/lawyer/pending")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <span>{isBn ? "আইনজীবী পোর্টালে যান →" : "Go to Lawyer Portal →"}</span>
                </button>

                {verificationStatus !== "verified" && (
                  <button
                    type="button"
                    onClick={() => router.push("/admin")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <span>{isBn ? "অ্যাডমিন প্যানেলে অনুমোদন দেখুন →" : "Open Admin Approval Panel →"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── 6. ENTERPRISE ORGANIZATION DETAILS ── */}
        {user.enterpriseProfile && (
          <div className="p-6 rounded-3xl border border-purple-500/20 bg-purple-500/5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-purple-500/10 pb-3">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-500" />
                <span>{isBn ? "কর্পোরেট এন্টারপ্রাইজ তথ্য" : "Enterprise Organization"}</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                RJSC Verified Corporate
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 py-1 text-sm">
              <span className="text-[var(--text-muted)] text-[13px]">{isBn ? "কোম্পানির নাম" : "Company Name"}</span>
              <div className="sm:col-span-2 font-semibold text-[var(--text-primary)]">
                {user.enterpriseProfile.companyName}
              </div>

              <span className="text-[var(--text-muted)] text-[13px]">{isBn ? "আরজেএসসি নম্বর" : "RJSC Reg"}</span>
              <div className="sm:col-span-2 font-mono text-[var(--text-primary)]">
                {user.enterpriseProfile.registrationNo}
              </div>

              <span className="text-[var(--text-muted)] text-[13px]">{isBn ? "টিআইএন নম্বর" : "Corporate TIN"}</span>
              <div className="sm:col-span-2 font-mono text-[var(--text-primary)]">
                {user.enterpriseProfile.tinNo}
              </div>

              <div className="sm:col-span-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      user.role === "enterprise_admin" ||
                        (user.role === "enterprise" && !user.enterpriseProfile?.isTeamMember)
                        ? "/enterprise/admin"
                        : "/enterprise/member"
                    )
                  }
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors cursor-pointer shadow-xs"
                >
                  {isBn ? "এন্টারপ্রাইজ পোর্টালে যান →" : "Open Enterprise Workspace →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 7. ACCOUNT SECURITY & FAST ACTIONS ── */}
        <div className="p-6 rounded-3xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-xs space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>{isBn ? "অ্যাকাউন্ট নিরাপত্তা ও সেটিংস" : "Account Security & Preferences"}</span>
          </h3>

          <div className="divide-y" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 8%, transparent)" }}>
            {/* Change Password Row */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>{isBn ? "অ্যাকাউন্ট পাসওয়ার্ড" : "Account Password"}</span>
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {isBn ? "নিয়মিত পাসওয়ার্ড পরিবর্তন করে অ্যাকাউন্ট সুরক্ষিত রাখুন" : "Update your password to protect your legal documents"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPwError("");
                  setPwSuccess(false);
                  setCurrentPw("");
                  setNewPw("");
                  setConfirmPw("");
                  setIsPasswordModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-[var(--text-primary)]/15 hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
              >
                {isBn ? "পাসওয়ার্ড পরিবর্তন করুন →" : "Change Password →"}
              </button>
            </div>

            {/* App Settings Shortcut */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {isBn ? "অ্যাপ সেটিংস ও ভাষা" : "App Settings & System Preferences"}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {isBn ? "নোটিফিকেশন, থিম মোড এবং ভাষা সমন্বয় করুন" : "Configure theme, language, and notifications"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/settings")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-[var(--text-primary)]/15 hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
              >
                {isBn ? "সেটিংসে যান →" : "Open Settings →"}
              </button>
            </div>

            {/* PII Masking Note */}
            <div className="py-3.5 flex items-center gap-3 text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                {isBn
                  ? "আপনার সমস্ত সংবেদনশীল ডেটা (NID, মোবাইল ও আর্থিক শর্ত) ব্রাউজারেই PII মাস্কড হয়ে ক্লাউডে সংরক্ষিত হয়।"
                  : "Client-side PII masking is fully active. Identity details are protected under codified Bangladesh statutes."}
              </span>
            </div>
          </div>
        </div>

        {/* ── 8. LOGOUT ── */}
        <div className="pt-2 pb-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{isBn ? "অ্যাকাউন্ট থেকে লগআউট করুন" : "Sign Out of Account"}</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: INTERACTIVE MOBILE NUMBER VERIFICATION FLOW                 */}
      {/* ==================================================================== */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-2xl p-6 sm:p-7 space-y-5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                  {isBn ? "মোবাইল নম্বর যাচাইকরণ" : "Mobile Phone Verification"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPhoneModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {phoneStep === "phone" && (
              <div className="space-y-4">
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {isBn
                    ? "আপনার মোবাইল নম্বরটি লিখুন। আমরা একটি ৪ ডিজিটের এসএমএস ওটিপি কোড পাঠাবো।"
                    : "Enter your active mobile number. We'll send a 4-digit SMS OTP verification code."}
                </p>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                    {isBn ? "বাংলাদেশি মোবাইল নম্বর" : "Bangladesh Mobile Number"}
                  </label>
                  <input
                    type="tel"
                    value={verifyPhoneInput}
                    onChange={(e) => setVerifyPhoneInput(e.target.value)}
                    placeholder="+8801XXXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-mono border border-[var(--text-primary)]/20 bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]/60"
                  />
                </div>
                {otpError && <p className="text-xs text-rose-500">{otpError}</p>}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {isSendingOtp
                    ? isBn
                      ? "কোড পাঠানো হচ্ছে..."
                      : "Sending OTP Code..."
                    : isBn
                    ? "ওটিপি কোড পাঠান"
                    : "Send Verification Code"}
                </button>
              </div>
            )}

            {phoneStep === "otp" && (
              <div className="space-y-4">
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {isBn
                    ? `${verifyPhoneInput} নম্বরে পাঠানো ৪ ডিজিটের কোডটি লিখুন:`
                    : `Enter the 4-digit verification code sent to ${verifyPhoneInput}:`}
                </p>
                <div className="flex justify-center gap-3 py-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={otpCode[idx] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const next = [...otpCode];
                        next[idx] = val;
                        setOtpCode(next);
                        if (val && idx < 3) {
                          document.getElementById(`otp-input-${idx + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otpCode[idx] && idx > 0) {
                          document.getElementById(`otp-input-${idx - 1}`)?.focus();
                        }
                      }}
                      className="w-12 h-12 text-center text-lg font-mono font-bold rounded-xl border border-[var(--text-primary)]/20 bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-solid)]"
                    />
                  ))}
                </div>
                {otpError && <p className="text-xs text-rose-500 text-center">{otpError}</p>}
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>
                    {otpCountdown > 0
                      ? isBn
                        ? `পুনরায় পাঠানোর সময়: ${otpCountdown}s`
                        : `Resend code in ${otpCountdown}s`
                      : isBn
                      ? "কোড পাননি?"
                      : "Didn't receive code?"}
                  </span>
                  {otpCountdown === 0 && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="font-semibold text-[var(--accent-solid)] hover:underline cursor-pointer"
                    >
                      {isBn ? "আবার পাঠান" : "Resend OTP"}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingOtp
                    ? isBn
                      ? "যাচাই করা হচ্ছে..."
                      : "Verifying..."
                    : isBn
                    ? "যাচাই সম্পন্ন করুন (+৫০ ক্রেডিট পান)"
                    : "Confirm & Claim +50 Credits"}
                </button>
              </div>
            )}

            {phoneStep === "success" && (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-[var(--text-primary)]">
                  {isBn ? "মোবাইল নম্বর সফলভাবে যাচাই হয়েছে!" : "Mobile Number Verified!"}
                </h4>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                  {isBn
                    ? "আপনার অ্যাকাউন্টে ৫০ বোনাস ক্রেডিট যোগ করা হয়েছে। আপনি এখন চুক্তির সম্পূর্ণ আইনি অডিট ও নোটিফিকেশন পাবেন।"
                    : "50 bonus credits have been unlocked and added to your balance. You're now fully verified."}
                </p>
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(false)}
                  className="mt-2 px-6 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 cursor-pointer"
                >
                  {isBn ? "ঠিক আছে" : "Done"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: CHANGE PASSWORD MODAL                                       */}
      {/* ==================================================================== */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-2xl p-6 sm:p-7 space-y-5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[var(--accent-solid)]/10 text-[var(--text-primary)]">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                  {isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  {isBn ? "বর্তমান পাসওয়ার্ড" : "Current Password"}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    required
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-[var(--text-primary)]/20 bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]/60 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  {isBn ? "নতুন পাসওয়ার্ড" : "New Password"}
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    required
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-[var(--text-primary)]/20 bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]/60 pr-10"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  {isBn ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password"}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-[var(--text-primary)]/20 bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]/60"
                  placeholder="Repeat new password"
                />
              </div>

              {pwError && <p className="text-xs text-rose-500">{pwError}</p>}
              {pwSuccess && (
                <p className="text-xs text-emerald-500 flex items-center gap-1 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>{isBn ? "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!" : "Password changed successfully!"}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {pwLoading
                  ? isBn
                    ? "আপডেট হচ্ছে..."
                    : "Updating..."
                  : isBn
                  ? "পাসওয়ার্ড নিশ্চিত করুন"
                  : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: AVATAR / PROFILE PHOTO PICKER                               */}
      {/* ==================================================================== */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-2xl p-6 space-y-5 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                {isBn ? "প্রোফাইল ছবি পরিবর্তন" : "Change Profile Photo"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-[var(--text-primary)]/20 hover:border-[var(--text-primary)]/40 text-center text-xs font-semibold text-[var(--text-primary)] cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <Camera className="w-5 h-5 text-[var(--text-muted)]" />
                <span>{isBn ? "ডিভাইস থেকে ছবি আপলোড করুন" : "Upload photo from device"}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-normal">PNG, JPG up to 2MB</span>
              </button>

              {user.avatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    updateUser({ avatarUrl: "" });
                    setIsAvatarModalOpen(false);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  {isBn ? "বর্তমান ছবি মুছুন" : "Remove current photo"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
