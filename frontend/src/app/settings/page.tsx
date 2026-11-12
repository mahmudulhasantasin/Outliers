"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Globe,
  Moon,
  Sun,
  Shield,
  ShieldCheck,
  Key,
  Coins,
  ArrowUpRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Briefcase,
  Camera,
  X,
  AlertTriangle,
  Check,
  Zap,
  Layers,
  Sparkles,
  Minus,
  Plus,
  Clock,
  Radio,
} from "lucide-react";
import {
  changePassword,
  setPassword,
  uploadProfilePhoto,
  getMySettings,
  getPaymentSummary,
  updateLawyerSettings,
  deleteAccount,
  PaymentSummary,
} from "@/lib/apiServices";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, refreshUser, updateUser } = useAuth();
  const isGoogleNoPw = user?.has_usable_password === false;
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isBn = language === "bn";

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoSuccess, setPhotoSuccess] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [imgError, setImgError] = useState(false);

  const avatarUrl = user?.profile_photo_url || user?.avatarUrl || "";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  // [UPDATED] FIX: Separate Admin and Member logic
  const isEnterpriseAdmin =
    String(user?.role).toLowerCase() === "enterprise_admin" ||
    Boolean(user?.enterpriseProfile && !user?.enterpriseProfile?.isTeamMember);
  const isEnterpriseMember =
    String(user?.role).toLowerCase() === "enterprise_member" ||
    Boolean(user?.enterpriseProfile?.isTeamMember);
  const isEnterprise = isEnterpriseAdmin || isEnterpriseMember;
  const entStatus = String(user?.enterpriseProfile?.verificationStatus || "").toLowerCase();
  const isPendingEnterpriseAdmin = isEnterpriseAdmin && entStatus !== "verified";
  const lawyerStatus = String(user?.lawyerProfile?.verificationStatus || "").toLowerCase();
  const isPendingLawyer = Boolean(user?.lawyerProfile && lawyerStatus !== "verified");

  // [UPDATED] FIX: Dynamic Balance Logic
  let displayBalance = user?.creditBalance ?? 0;
  let balanceLabel = isBn ? "উপলব্ধ অ্যাকাউন্ট ক্রেডিট ব্যালেন্স:" : "Available Credit Balance:";
  let balanceDesc = isBn ? "৫০ ক্রেডিট = ১টি সম্পূর্ণ চুক্তি অডিট" : "50 credits = 1 full contract statutory audit";

  if (isEnterpriseAdmin) {
    displayBalance = user?.enterprise_credit_balance ?? 0;
    balanceLabel = isPendingEnterpriseAdmin
      ? (isBn ? "কোম্পানি পুল ক্রেডিট (অনুমোদন অপেক্ষমাণ):" : "Company Pool (Pending Approval):")
      : (isBn ? "কোম্পানি পুল ক্রেডিট ব্যালেন্স:" : "Company Pool Credit Balance:");
    balanceDesc = isPendingEnterpriseAdmin
      ? (isBn ? "সিস্টেম অ্যাডমিন কর্তৃক অনুমোদন সম্পন্ন হওয়ার পর কোম্পানি পুল কার্যকর হবে।" : "Shared credit pool activates once approved by system admin.")
      : (isBn ? "কোম্পানির শেয়ার্ড পুল থেকে ক্রেডিট কাটা হবে" : "Deducted from company shared credit pool");
  } else if (isEnterpriseMember) {
    const quota = user?.member_credit_quota ?? 0;
    const used = user?.member_credit_used ?? 0;
    displayBalance = Math.max(0, quota - used);
    balanceLabel = isBn ? "আপনার অবশিষ্ট কোটা:" : "Your Remaining Quota:";
    balanceDesc = isBn ? "পুল টপ-আপ করতে আপনার কোম্পানি অ্যাডমিনের সাথে যোগাযোগ করুন।" : "Contact your company admin to top up the pool.";
  }

  const handleProfilePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError(isBn ? "ছবির সাইজ ৫MB-এর কম হতে হবে।" : "File size must be less than 5MB.");
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoError("");
    setPhotoSuccess(false);
    setImgError(false);

    try {
      const res = await uploadProfilePhoto(file);
      const newUrl = res.profile_photo_url || res.url || res.avatar_url;
      if (newUrl) {
        updateUser?.({ avatarUrl: newUrl, profile_photo_url: newUrl });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            updateUser?.({ avatarUrl: reader.result, profile_photo_url: reader.result });
          }
        };
        reader.readAsDataURL(file);
      }
      setPhotoSuccess(true);
      setTimeout(() => setPhotoSuccess(false), 3000);
    } catch (err: unknown) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateUser?.({ avatarUrl: reader.result, profile_photo_url: reader.result });
          setPhotoSuccess(true);
          setTimeout(() => setPhotoSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
      console.warn("Upload photo API note:", err);
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = "";
    }
  };

  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [isRefreshingSettings, setIsRefreshingSettings] = useState(false);

  const [maxActiveReviews, setMaxActiveReviews] = useState(3);
  const [autoAcceptOffers, setAutoAcceptOffers] = useState(false);
  const [isLawyerAvailable, setIsLawyerAvailable] = useState(true);
  const [preferredDomains, setPreferredDomains] = useState<string[]>(["Contract Law", "Employment Law"]);
  const [lawyerSettingsLoading, setLawyerSettingsLoading] = useState(false);
  const [lawyerSettingsToast, setLawyerSettingsToast] = useState(false);

  useEffect(() => {
    try {
      const savedLawyerPrefs = localStorage.getItem("contractmind_lawyer_prefs");
      if (savedLawyerPrefs) {
        const parsed = JSON.parse(savedLawyerPrefs);
        if (typeof parsed.max_active_reviews === "number") setMaxActiveReviews(parsed.max_active_reviews);
        if (typeof parsed.auto_accept_offers === "boolean") setAutoAcceptOffers(parsed.auto_accept_offers);
        if (typeof parsed.is_available === "boolean") setIsLawyerAvailable(parsed.is_available);
        if (Array.isArray(parsed.preferred_domains)) setPreferredDomains(parsed.preferred_domains);
      }
    } catch {}
  }, []);

  const loadLiveSettings = useCallback(async () => {
    setIsRefreshingSettings(true);
    try {
      const [settingsData, payData] = await Promise.allSettled([getMySettings(), getPaymentSummary()]);
      
      // [UPDATED] FIX: Read from `.lawyer` and map updated backend keys
      if (settingsData.status === "fulfilled" && settingsData.value?.lawyer) {
        const lp = settingsData.value.lawyer;
        if (typeof lp.max_concurrent_tasks === "number") setMaxActiveReviews(lp.max_concurrent_tasks);
        if (typeof lp.auto_accept_offers === "boolean") setAutoAcceptOffers(lp.auto_accept_offers);
        if (lp.availability) setIsLawyerAvailable(lp.availability === "AVAILABLE");
        if (Array.isArray(lp.specializations)) setPreferredDomains(lp.specializations);
      }
      
      if (payData.status === "fulfilled" && payData.value) setPaymentSummary(payData.value);
      if (refreshUser) await refreshUser();
    } catch (e) {
      console.warn("Could not load live settings:", e);
    } finally {
      setIsRefreshingSettings(false);
    }
  }, [refreshUser]);

  const handleSaveLawyerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLawyerSettingsLoading(true);
    try {
      // [UPDATED] FIX: Send updated payload keys that match the backend
      await updateLawyerSettings({
        max_concurrent_tasks: maxActiveReviews,
        auto_accept_offers: autoAcceptOffers,
        availability: isLawyerAvailable ? "AVAILABLE" : "UNAVAILABLE",
        specializations: preferredDomains,
      });
      
      localStorage.setItem("contractmind_lawyer_prefs", JSON.stringify({
        max_active_reviews: maxActiveReviews,
        auto_accept_offers: autoAcceptOffers,
        is_available: isLawyerAvailable,
        preferred_domains: preferredDomains,
      }));
      setLawyerSettingsToast(true);
      setTimeout(() => setLawyerSettingsToast(false), 3000);
    } catch (err) {
      console.warn("Could not save lawyer settings via API:", err);
    } finally {
      setLawyerSettingsLoading(false);
    }
  };

  useEffect(() => {
    loadLiveSettings();
  }, [loadLiveSettings]);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError(isBn ? 'অনুগ্রহ করে "DELETE" লিখুন' : 'Please type "DELETE" to confirm.');
      return;
    }
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount();
      logout();
      router.push("/");
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: "", score: 0, color: "" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { label: isBn ? "দুর্বল" : "Weak", score: 1, color: "bg-rose-500" };
    if (score <= 3) return { label: isBn ? "মাঝারি" : "Medium", score: 2, color: "bg-amber-500" };
    return { label: isBn ? "শক্তিশালী" : "Strong", score: 3, color: "bg-emerald-500" };
  };

  const pwdStrength = getPasswordStrength(newPw);

  const Section = ({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) => (
    <div className="space-y-4 p-5 sm:p-6 rounded-3xl bg-(--bg-card) shadow-xs">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-(--text-muted)">{title}</h3>
        {badge && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-(--text-primary)/5 text-(--text-muted)">{badge}</span>}
      </div>
      {children}
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto py-10 px-4 sm:px-8 space-y-8 font-sans">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-(--text-muted) mb-1">
              {isBn ? "অ্যাপ সেটিংস ও পছন্দসমূহ" : "System Preferences & Security"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-(--text-primary)">
              {isBn ? "সেটিংস" : "Settings"}
            </h1>
          </div>
          <button type="button" onClick={loadLiveSettings} disabled={isRefreshingSettings} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-(--text-primary)/10 hover:bg-(--text-primary)/5 transition-colors cursor-pointer text-(--text-muted) hover:text-(--text-primary)">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingSettings ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isBn ? "রিফ্রেশ" : "Sync"}</span>
          </button>
        </div>

        {/* PROFILE CARD */}
        <div className="p-5 sm:p-6 rounded-3xl bg-(--bg-card) shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900 border-2 border-(--bg-primary) shadow-sm flex items-center justify-center text-xl font-bold font-serif text-(--text-primary) overflow-hidden relative">
                {(!imgError && avatarUrl) ? (
                  <Image
                    src={avatarUrl}
                    alt={user?.name || "Profile"}
                    fill
                    className="object-cover"
                    unoptimized 
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span>{initials}</span>
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingPhoto} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-(--accent-solid) text-(--accent-contrast) flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xs disabled:opacity-50" title={isBn ? "প্রোফাইল ছবি পরিবর্তন করুন" : "Upload Profile Photo"}>
                <Camera className="w-3 h-3" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePhotoSelect} className="hidden" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-(--text-primary) truncate">{user?.name || (isBn ? "ব্যবহারকারী" : "User")}</h2>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingPhoto} className="p-1 rounded-lg hover:bg-(--text-primary)/5 text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer" title={isBn ? "প্রোফাইল ছবি পরিবর্তন করুন" : "Change Profile Photo"}>
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-(--text-muted) truncate mt-0.5">{user?.email || "user@example.com"}</p>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-(--accent-solid)/10 text-(--accent-solid)">
                  {String(user?.role).toUpperCase() === "LAWYER" ? (isBn ? "নিবন্ধিত আইনজীবী" : "Lawyer") : String(user?.role).toUpperCase() === "ADMIN" ? (isBn ? "সিস্টেম অ্যাডমিন" : "System Admin") : isEnterprise ? (isBn ? "এন্টারপ্রাইজ ব্যবহারকারী" : "Enterprise") : (isBn ? "সাধারণ ব্যবহারকারী" : "General User")}
                </span>
                {photoSuccess && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                    <Check className="w-3 h-3" />
                    <span>{isBn ? "ছবি সফলভাবে আপলোড হয়েছে" : "Photo uploaded successfully"}</span>
                  </span>
                )}
                {photoError && <span className="text-[11px] text-rose-500 font-medium">{photoError}</span>}
              </div>
            </div>
          </div>
          <button type="button" onClick={() => router.push("/profile")} className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-(--text-primary)/15 hover:bg-(--text-primary)/5 text-(--text-primary) transition-colors cursor-pointer self-start sm:self-auto shrink-0">
            {isBn ? "সম্পূর্ণ প্রোফাইল দেখুন" : "View Full Profile"}
          </button>
        </div>

        <Section title={isBn ? "ভাষা ও ইন্টারফেস থিম" : "Language & Theme"}>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-(--text-muted) mb-2">
                <Globe className="w-3.5 h-3.5 opacity-70" />
                <span>{isBn ? "ইন্টারফেস ভাষা" : "Interface Language"}</span>
              </label>
              <div className="flex gap-2">
                {(["bn", "en"] as const).map((lang) => (
                  <button key={lang} type="button" onClick={() => setLanguage(lang)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${language === lang ? "bg-(--accent-solid) text-(--accent-contrast) shadow-xs" : "border border-(--text-primary)/15 text-(--text-muted) hover:text-(--text-primary) hover:bg-(--text-primary)/5"}`}>
                    {lang === "bn" ? "বাংলা (Bengali)" : "English"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-(--text-muted) mb-2">
                {theme === "dark" ? <Moon className="w-3.5 h-3.5 opacity-70" /> : <Sun className="w-3.5 h-3.5 opacity-70" />}
                <span>{isBn ? "থিম মোড" : "Appearance Theme"}</span>
              </label>
              <div className="flex gap-2">
                {(["light", "dark"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTheme(t)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${theme === t ? "bg-(--accent-solid) text-(--accent-contrast) shadow-xs" : "border border-(--text-primary)/15 text-(--text-muted) hover:text-(--text-primary) hover:bg-(--text-primary)/5"}`}>
                    {t === "light" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    <span>{t === "light" ? (isBn ? "লাইট মোড" : "Light Mode") : (isBn ? "ডার্ক মোড" : "Dark Mode")}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title={isBn ? "পাসওয়ার্ড পরিবর্তন ও অ্যাকাউন্ট সুরক্ষা" : "Account Password & Security"}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-(--text-primary)">
                  {isGoogleNoPw
                    ? (isBn ? "ইমেইল লগইনের জন্য পাসওয়ার্ড সেট করুন" : "Set Password for Email Login")
                    : (isBn ? "অ্যাকাউন্ট পাসওয়ার্ড" : "Account Password")}
                </p>
                {isGoogleNoPw && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {isBn ? "Google একাউন্ট" : "Google Account"}
                  </span>
                )}
              </div>
              <p className="text-xs text-(--text-muted) mt-0.5 leading-relaxed">
                {isGoogleNoPw
                  ? (isBn ? "আপনি বর্তমানে Google দিয়ে লগইন করছেন। ইমেইল ও পাসওয়ার্ড দিয়েও সরাসরি লগইন চালু করতে একটি পাসওয়ার্ড সেট করুন।" : "You currently sign in using Google. Set a password to also enable direct email & password login alongside Google.")
                  : (isBn ? "আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে নিয়মিত শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।" : "Ensure your account is protected with a strong, confidential password.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setPwError(""); setPwSuccess(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); setIsPasswordModalOpen(true); }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-(--accent-solid) text-(--accent-contrast) hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>
                {isGoogleNoPw
                  ? (isBn ? "পাসওয়ার্ড সেট করুন" : "Set Password")
                  : (isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password")}
              </span>
            </button>
          </div>
        </Section>

        {String(user?.role).toUpperCase() === "LAWYER" && (
          <Section
            title={isBn ? "আইনজীবী কর্মদক্ষতা ও অগ্রাধিকার সেটিংস" : "Advocate Preferences & Workload"}
            badge={lawyerSettingsToast ? (isBn ? "সংরক্ষিত" : "Saved") : undefined}
          >
            <form onSubmit={handleSaveLawyerSettings} className="space-y-4">
              {/* Availability Hero Switch */}
              <div className="p-4 sm:p-5 rounded-2xl bg-(--bg-surface) border border-(--text-primary)/10 shadow-xs transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                        isLawyerAvailable
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-neutral-500/10 text-neutral-400 dark:text-neutral-500"
                      }`}
                    >
                      <Radio className={`w-5 h-5 ${isLawyerAvailable ? "animate-pulse" : ""}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="text-sm font-semibold text-(--text-primary)">
                          {isBn ? "নতুন পর্যালোচনার জন্য প্রস্তুত (Availability)" : "Accepting New Review Offers"}
                        </p>
                        {isLawyerAvailable ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {isBn ? "সক্রিয় ও প্রস্তুত" : "Live & Accepting"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-400/15 text-neutral-600 dark:text-neutral-400 border border-neutral-400/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            {isBn ? "বিরতিতে আছেন" : "Queue Paused"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-(--text-muted) mt-1 leading-relaxed">
                        {isBn
                          ? "চালু থাকলে নতুন ক্লায়েন্ট চুক্তির নোটিফিকেশন ও অফার সরাসরি আপনার রিভিউ কিউতে পাঠানো হবে।"
                          : "When active, incoming eligible client contracts will be dispatched to your review queue."}
                      </p>
                    </div>
                  </div>

                  {/* Standard bounded toggle switch */}
                  <div className="flex items-center self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isLawyerAvailable}
                      onClick={() => setIsLawyerAvailable(!isLawyerAvailable)}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-(--text-primary)/20 ${
                        isLawyerAvailable ? "bg-emerald-600 dark:bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"
                      }`}
                    >
                      <span className="sr-only">Toggle availability</span>
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isLawyerAvailable ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Symmetrical 2-Column Workload & Auto-Accept Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Left Card: Review Limit with Stepper */}
                <div className="p-4 sm:p-5 rounded-2xl bg-(--bg-surface) border border-(--text-primary)/10 shadow-xs flex flex-col justify-between gap-3.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded-lg bg-(--text-primary)/5 text-(--text-primary)">
                        <Layers className="w-4 h-4" />
                      </div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-(--text-primary)">
                        {isBn ? "সর্বোচ্চ সক্রিয় রিভিউ সীমা" : "Max Active Reviews Limit"}
                      </label>
                    </div>
                    <p className="text-xs text-(--text-muted) leading-relaxed">
                      {isBn
                        ? "একসাথে সর্বোচ্চ কয়টি চুক্তি হাতে রাখবেন (SLA রক্ষা করতে)"
                        : "Maximum concurrent active contracts in review desk"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-(--bg-card) border border-(--text-primary)/10">
                      <button
                        type="button"
                        onClick={() => setMaxActiveReviews(Math.max(1, maxActiveReviews - 1))}
                        disabled={maxActiveReviews <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-(--text-primary) hover:bg-(--text-primary)/10 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title={isBn ? "কমান" : "Decrease"}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold font-mono text-(--text-primary)">
                          {maxActiveReviews}
                        </span>
                        <span className="text-xs font-medium text-(--text-muted)">
                          {isBn ? "টি চুক্তি" : "contracts"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMaxActiveReviews(Math.min(10, maxActiveReviews + 1))}
                        disabled={maxActiveReviews >= 10}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-(--text-primary) hover:bg-(--text-primary)/10 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title={isBn ? "বাড়ান" : "Increase"}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-(--text-muted) px-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{isBn ? "৩ ঘণ্টার টার্নঅ্যারাউন্ড SLA প্রযোজ্য" : "Max contracts at one time (3h submit SLA)"}</span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Auto Accept Offers */}
                <div className="p-4 sm:p-5 rounded-2xl bg-(--bg-surface) border border-(--text-primary)/10 shadow-xs flex flex-col justify-between gap-3.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-(--text-primary)">
                        {isBn ? "স্বয়ংক্রিয় অফার গ্রহণ" : "Auto Accept Offers"}
                      </span>
                    </div>
                    <p className="text-xs text-(--text-muted) leading-relaxed">
                      {isBn
                        ? "উচ্চ-অগ্রাধিকার চুক্তিগুলো কিউ থেকে সরাসরি গ্রহণ হবে"
                        : "Automatically accept matching high-priority contracts"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--bg-card) border border-(--text-primary)/10">
                      <span className="text-xs font-medium text-(--text-primary)">
                        {autoAcceptOffers
                          ? (isBn ? "স্বয়ংক্রিয় গ্রহণ চালু" : "Auto-Accept Active")
                          : (isBn ? "ম্যানুয়াল অনুমোদন" : "Manual Preview Only")}
                      </span>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={autoAcceptOffers}
                        onClick={() => setAutoAcceptOffers(!autoAcceptOffers)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-(--text-primary)/20 ${
                          autoAcceptOffers ? "bg-(--accent-solid)" : "bg-neutral-300 dark:bg-neutral-700"
                        }`}
                      >
                        <span className="sr-only">Toggle auto accept</span>
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            autoAcceptOffers ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-(--text-muted) px-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>
                        {autoAcceptOffers
                          ? (isBn ? "উপযুক্ত কাজ সরাসরি ডেস্ক এ যুক্ত হবে" : "Dispatched directly into active queue")
                          : (isBn ? "ম্যানুয়ালি অফার রিভিউ করে একসেপ্ট করুন" : "Review contract details before taking")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specializations Domain Badges */}
              <div className="p-4 sm:p-5 rounded-2xl bg-(--bg-surface) border border-(--text-primary)/10 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-(--text-primary)">
                      {isBn ? "পছন্দের আইনি ক্ষেত্রসমূহ (Preferred Legal Domains)" : "Preferred Legal Specializations"}
                    </label>
                    <p className="text-[11px] text-(--text-muted) mt-0.5">
                      {isBn ? "আপনার দক্ষতার ক্ষেত্রসমূহ চিহ্নিত করুন" : "Select domains matching your legal expertise"}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-(--text-primary)/10 text-(--text-primary)">
                    {preferredDomains.length} {isBn ? "টি নির্বাচিত" : "Selected"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    "Contract Law",
                    "Employment Law",
                    "Corporate Law",
                    "Real Estate",
                    "Banking & IP",
                    "Commercial Arbitration",
                  ].map((dom) => {
                    const isSelected = preferredDomains.includes(dom);
                    return (
                      <button
                        key={dom}
                        type="button"
                        onClick={() => {
                          setPreferredDomains((prev) =>
                            isSelected ? prev.filter((d) => d !== dom) : [...prev, dom]
                          );
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? "bg-(--accent-solid) text-(--accent-contrast) shadow-xs ring-1 ring-(--accent-solid)"
                            : "bg-(--bg-card) border border-(--text-primary)/15 text-(--text-muted) hover:text-(--text-primary) hover:border-(--text-primary)/35 hover:bg-(--text-primary)/5"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />}
                        <span>{dom}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toast confirmation if recently saved */}
              {lawyerSettingsToast && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {isBn
                      ? "আইনজীবী পছন্দসমূহ সফলভাবে সংরক্ষিত হয়েছে!"
                      : "Advocate preferences saved successfully!"}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={lawyerSettingsLoading}
                className="w-full py-3 rounded-xl text-xs font-semibold bg-(--accent-solid) text-(--accent-contrast) hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                {lawyerSettingsLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isBn ? "সংরক্ষণ করা হচ্ছে..." : "Saving Preferences..."}</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4" />
                    <span>{isBn ? "আইনজীবী পছন্দসমূহ সংরক্ষণ করুন (Save)" : "Save Advocate Preferences"}</span>
                  </>
                )}
              </button>
            </form>
          </Section>
        )}

        {/* [UPDATED] FIX: Credits & Billing Hub Update */}
        <Section title={isBn ? "ক্রেডিট ও পেমেন্ট ম্যানেজমেন্ট" : "Credits & Billing Hub"}>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-(--bg-surface)">
              <div>
                <p className="text-xs text-(--text-muted) mb-1 font-medium">{balanceLabel}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-mono font-bold text-(--text-primary)">{displayBalance}</p>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{isBn ? "ক্রেডিট" : "Credits"}</span>
                </div>
                <p className="text-[11px] text-(--text-muted) mt-1">{balanceDesc}</p>
              </div>
              
              {/* [UPDATED] MEMBER or PENDING roles jonno Buy button hide koro */}
              {!isEnterpriseMember && !isPendingEnterpriseAdmin && !isPendingLawyer && (
                <button type="button" onClick={() => router.push("/pricing")} className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-(--accent-solid) text-(--accent-contrast) hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 shadow-xs">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{isEnterpriseAdmin ? (isBn ? "পুল রিচার্জ করুন" : "Top up Pool") : (isBn ? "প্যাকেজ কিনুন" : "Buy Packages")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {/* History show only for non-members (since members don't top up) */}
            {paymentSummary && paymentSummary.total_topup_bdt > 0 && !isEnterpriseMember && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-(--bg-surface)">
                  <span className="text-(--text-muted) block mb-0.5">{isBn ? "মোট টপ-আপ" : "Total Top-up"}</span>
                  <span className="font-mono font-bold text-(--text-primary)">৳{paymentSummary.total_topup_bdt} BDT</span>
                </div>
                <div className="p-3 rounded-xl bg-(--bg-surface)">
                  <span className="text-(--text-muted) block mb-0.5">{isBn ? "অনুমোদিত পেমেন্ট" : "Approved Orders"}</span>
                  <span className="font-mono font-bold text-(--text-primary)">{paymentSummary.approved} Completed</span>
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section title={isBn ? "গোপনীয়তা ও ডেটা সুরক্ষা (PII Protection)" : "Privacy & Data Protection"}>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-semibold text-(--text-primary)">
                  {isBn ? "ক্লায়েন্ট-সাইড PII মাস্কিং" : "Client-side PII Masking"}
                </p>
                <p className="text-xs text-(--text-muted) mt-0.5 leading-relaxed">
                  {isBn
                    ? "এনআইডি, মোবাইল নম্বর ও ব্যক্তিগত তথ্য ব্রাউজারে স্বয়ংক্রিয়ভাবে মাস্ক করে এআই প্রসেস করা হয়"
                    : "Bangladeshi NID, phone numbers & corporate identities are redacted client-side before sending"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap shrink-0">
                <ShieldCheck className="w-4 h-4" />
                <span>{isBn ? "সর্বদা সক্রিয়" : "Always Active"}</span>
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-(--bg-surface) flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-(--text-muted) leading-relaxed">{isBn ? "তথ্য ও যোগাযোগ প্রযুক্তি আইন ২০০৬ এবং সাইবার নিরাপত্তা বিধিমালার অধীনে আপনার কোনো সংবেদনশীল চুক্তিপত্র পাবলিক মডেলে প্রশিক্ষণ (train) করা হয় না।" : "Under the Information and Communication Technology Act 2006, all legal audits are strictly confidential and never used to train public models."}</p>
            </div>
          </div>
        </Section>

        <div className="mt-8 p-6 rounded-3xl bg-rose-500/5 space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">{isBn ? "ডেঞ্জার জোন" : "Danger Zone"}</h3>
          </div>
          <p className="text-xs text-rose-800/70 dark:text-rose-200/70 leading-relaxed">{isBn ? "আপনার অ্যাকাউন্ট ডিলিট করলে আপনার সমস্ত সংরক্ষিত চুক্তি, অডিট মেমো এবং চ্যাট হিস্ট্রি স্থায়ীভাবে মুছে যাবে।" : "Deleting your account will permanently remove all archived contract memos, credit balance, and consultation history."}</p>
          <div className="pt-1">
            <button type="button" onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(""); setDeleteError(""); }} className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer">{isBn ? "অ্যাকাউন্ট ডিলিট করুন" : "Delete Account"}</button>
          </div>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-(--text-primary)/15 bg-(--bg-card) shadow-2xl p-6 sm:p-7 space-y-5 text-left">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 8%, transparent)" }}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-(--accent-solid)/10 text-(--accent-solid)"><Key className="w-4 h-4" /></div>
                <h3 className="text-base font-bold text-(--text-primary)">
                  {isGoogleNoPw
                    ? (isBn ? "নতুন পাসওয়ার্ড সেট করুন" : "Set Account Password")
                    : (isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password")}
                </h3>
              </div>
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="p-1 text-(--text-muted) hover:text-(--text-primary) rounded-lg hover:bg-(--text-primary)/5 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            {isGoogleNoPw && (
              <p className="text-xs text-(--text-muted) leading-relaxed">
                {isBn 
                  ? "আপনার পছন্দের একটি পাসওয়ার্ড লিখুন। এটি সেট করার পর আপনি Google অথবা ইমেইল+পাসওয়ার্ড উভয়ভাবেই লগইন করতে পারবেন।" 
                  : "Enter a password for your account. Once set, you can log in using either Google or your email & password."}
              </p>
            )}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (newPw.length < 6) { setPwError(isBn ? "নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters"); return; }
              if (newPw !== confirmPw) { setPwError(isBn ? "নতুন পাসওয়ার্ডের দুটি ঘর মিলছে না" : "Passwords do not match"); return; }
              setPwLoading(true); setPwError(""); setPwSuccess(false);
              try {
                if (isGoogleNoPw) {
                  await setPassword(newPw);
                  if (user) user.has_usable_password = true;
                  await refreshUser();
                } else {
                  await changePassword({ current_password: currentPw, new_password: newPw, confirm_new_password: confirmPw });
                }
                setPwSuccess(true); setCurrentPw(""); setNewPw(""); setConfirmPw("");
                setTimeout(() => { setIsPasswordModalOpen(false); setPwSuccess(false); }, 2000);
              } catch (err: unknown) {
                setPwError(err instanceof Error ? err.message : "Failed to update password.");
              } finally { setPwLoading(false); }
            }} className="space-y-4">
              {!isGoogleNoPw && (
                <div>
                  <label className="block text-xs font-semibold text-(--text-muted) mb-1">{isBn ? "বর্তমান পাসওয়ার্ড" : "Current Password"}</label>
                  <div className="relative">
                    <input type={showCurrentPw ? "text" : "password"} required value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-(--text-primary)/15 bg-(--bg-surface) text-(--text-primary) outline-none focus:border-(--text-primary)/40 pr-10 font-mono" />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer">{showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-(--text-muted) mb-1">{isBn ? "নতুন পাসওয়ার্ড" : "New Password"}</label>
                <div className="relative">
                  <input type={showNewPw ? "text" : "password"} required value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-(--text-primary)/15 bg-(--bg-surface) text-(--text-primary) outline-none focus:border-(--text-primary)/40 pr-10 font-mono" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer">{showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                {newPw.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-(--text-muted)">
                      <span>{isBn ? "পাসওয়ার্ড নির্ভরযোগ্যতা:" : "Password strength:"}</span>
                      <span className="font-semibold">{pwdStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                      <div className={`h-full transition-all duration-300 ${pwdStrength.color}`} style={{ width: `${(pwdStrength.score / 3) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-(--text-muted) mb-1">{isBn ? "নতুন পাসওয়ার্ড পুনরায় লিখুন" : "Confirm New Password"}</label>
                <input type="password" required value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-(--text-primary)/15 bg-(--bg-surface) text-(--text-primary) outline-none focus:border-(--text-primary)/40 font-mono" />
                {confirmPw.length > 0 && newPw !== confirmPw && <p className="text-xs text-rose-500 mt-1">{isBn ? "পাসওয়ার্ড দুটি মিলছে না" : "Passwords do not match"}</p>}
              </div>
              {pwError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{pwError}</span></div>}
              {pwSuccess && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>{isBn ? "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।" : "Password changed successfully."}</span></div>}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-(--text-muted) hover:text-(--text-primary) cursor-pointer">{isBn ? "বাতিল" : "Cancel"}</button>
                <button type="submit" disabled={pwLoading} className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-(--accent-solid) text-(--accent-contrast) hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs">{pwLoading ? (isBn ? "আপডেট হচ্ছে..." : "Updating...") : (isGoogleNoPw ? (isBn ? "পাসওয়ার্ড সেট করুন" : "Set Password") : (isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"))}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/20 bg-(--bg-card) p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-rose-500/10 pb-4">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600"><AlertTriangle className="w-5 h-5" /></div>
              <div>
                <h3 className="text-base font-bold text-(--text-primary)">{isBn ? "অ্যাকাউন্ট ডিলিট নিশ্চিত করুন" : "Confirm Account Deletion"}</h3>
                <p className="text-[11px] text-(--text-muted)">{isBn ? "এই কাজটি আর ফিরিয়ে আনা সম্ভব নয়।" : "This action cannot be undone."}</p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-(--text-muted)">{isBn ? 'নিশ্চিত করতে নিচের ঘরে "DELETE" লিখুন:' : 'To confirm, type "DELETE" in the box below:'}</p>
              <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" className="w-full px-4 py-2.5 rounded-xl text-sm border border-rose-500/30 bg-(--bg-surface) text-(--text-primary) outline-none focus:border-rose-500 font-mono uppercase" />
              {deleteError && <p className="text-xs text-rose-500 font-semibold">{deleteError}</p>}
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-(--text-muted) hover:text-(--text-primary) cursor-pointer">{isBn ? "বাতিল" : "Cancel"}</button>
              <button type="button" onClick={handleDeleteAccount} disabled={isDeleting || deleteConfirmText !== "DELETE"} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
                {isDeleting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> {isBn ? "মুছে ফেলা হচ্ছে..." : "Deleting..."}</> : <>{isBn ? "স্থায়ীভাবে ডিলিট করুন" : "Permanently Delete"}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}