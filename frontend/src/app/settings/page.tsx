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
} from "lucide-react";
import {
  changePassword,
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

  // ✅ FIX: Separate Admin and Member logic
  const isEnterpriseAdmin = String(user?.role).toLowerCase() === "enterprise_admin";
  const isEnterpriseMember = String(user?.role).toLowerCase() === "enterprise_member";
  const isEnterprise = isEnterpriseAdmin || isEnterpriseMember;

  // ✅ FIX: Dynamic Balance Logic
  let displayBalance = user?.creditBalance ?? 0;
  let balanceLabel = isBn ? "উপলব্ধ অ্যাকাউন্ট ক্রেডিট ব্যালেন্স:" : "Available Credit Balance:";
  let balanceDesc = isBn ? "৫০ ক্রেডিট = ১টি সম্পূর্ণ চুক্তি অডিট" : "50 credits = 1 full contract statutory audit";

  if (isEnterpriseAdmin) {
    displayBalance = user?.enterprise_credit_balance ?? 0;
    balanceLabel = isBn ? "কোম্পানি পুল ক্রেডিট ব্যালেন্স:" : "Company Pool Credit Balance:";
    balanceDesc = isBn ? "কোম্পানির শেয়ার্ড পুল থেকে ক্রেডিট কাটা হবে" : "Deducted from company shared credit pool";
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
  const [isPiiMaskingEnabled, setIsPiiMaskingEnabled] = useState(true);

  const [maxActiveReviews, setMaxActiveReviews] = useState(3);
  const [autoAcceptOffers, setAutoAcceptOffers] = useState(false);
  const [isLawyerAvailable, setIsLawyerAvailable] = useState(true);
  const [preferredDomains, setPreferredDomains] = useState<string[]>(["Contract Law", "Employment Law"]);
  const [lawyerSettingsLoading, setLawyerSettingsLoading] = useState(false);
  const [lawyerSettingsToast, setLawyerSettingsToast] = useState(false);

  useEffect(() => {
    try {
      const savedPii = localStorage.getItem("contractmind_pii_masking");
      if (savedPii !== null) setIsPiiMaskingEnabled(savedPii === "true");
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
      
      // ✅ FIX: Read from `.lawyer` and map updated backend keys
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
      // ✅ FIX: Send updated payload keys that match the backend
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

  const togglePiiMasking = () => {
    setIsPiiMaskingEnabled((prev) => {
      const updated = !prev;
      localStorage.setItem("contractmind_pii_masking", String(updated));
      return updated;
    });
  };

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
    <div className="space-y-4 p-6 rounded-3xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs">
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 8%, transparent)" }}>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-(--text-muted)">{title}</h3>
        {badge && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-(--text-primary)/5 text-(--text-muted)">{badge}</span>}
      </div>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0 pr-4">
        <p className="text-sm font-semibold text-(--text-primary)">{label}</p>
        {desc && <p className="text-xs text-(--text-muted) mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <button type="button" onClick={onChange} className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${checked ? "bg-(--accent-solid)" : "bg-neutral-300 dark:bg-neutral-700"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-(--bg-primary) shadow-sm transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
      </button>
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
        <div className="p-6 rounded-3xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
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
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-(--accent-solid)/10 text-(--accent-solid) border border-(--accent-solid)/20">
                  {String(user?.role).toUpperCase() === "LAWYER" ? (isBn ? "নিবন্ধিত আইনজীবী" : "Lawyer") : String(user?.role).toUpperCase() === "ADMIN" ? (isBn ? "সিস্টেম অ্যাডমিন" : "System Admin") : isEnterprise ? (isBn ? "এন্টারপ্রাইজ ব্যবহারকারী" : "Enterprise") : (isBn ? "সাধারণ ব্যবহারকারী" : "General User")}
                </span>
                {photoSuccess && <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">{isBn ? "ছবি সফলভাবে আপলোড হয়েছে ✓" : "Photo uploaded successfully ✓"}</span>}
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
                    {lang === "bn" ? "বাংলা (Bengali)" : "English (Codified BD Law)"}
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
              <p className="text-sm font-semibold text-(--text-primary)">{isBn ? "অ্যাকাউন্ট পাসওয়ার্ড" : "Account Password"}</p>
              <p className="text-xs text-(--text-muted) mt-0.5 leading-relaxed">{isBn ? "আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে নিয়মিত শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।" : "Ensure your account is protected with a strong, confidential password."}</p>
            </div>
            <button type="button" onClick={() => { setPwError(""); setPwSuccess(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); setIsPasswordModalOpen(true); }} className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-(--accent-solid) text-(--accent-contrast) hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>{isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}</span>
            </button>
          </div>
        </Section>

        {String(user?.role).toUpperCase() === "LAWYER" && (
          <Section title={isBn ? "আইনজীবী কর্মদক্ষতা ও অগ্রাধিকার সেটিংস" : "Advocate Preferences & Workload"} badge={lawyerSettingsToast ? (isBn ? "সংরক্ষিত ✓" : "Saved ✓") : undefined}>
            <form onSubmit={handleSaveLawyerSettings} className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10">
                <div>
                  <p className="text-xs font-semibold text-(--text-primary)">{isBn ? "নতুন পর্যালোচনার জন্য প্রস্তুত (Availability)" : "Accepting New Review Offers"}</p>
                  <p className="text-[11px] text-(--text-muted) mt-0.5">{isBn ? "চালু থাকলে নতুন ক্লায়েন্ট চুক্তির নোটিফিকেশন ও অফার কিউতে পাঠানো হবে" : "When active, eligible client contracts will be dispatched to your offer queue"}</p>
                </div>
                <button type="button" onClick={() => setIsLawyerAvailable(!isLawyerAvailable)} className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${isLawyerAvailable ? "bg-(--accent-solid)" : "bg-neutral-300 dark:bg-neutral-700"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-(--bg-primary) shadow-sm transition-transform ${isLawyerAvailable ? "translate-x-4.5" : "translate-x-0.5"}`} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-(--text-muted) mb-1">{isBn ? "সর্বোচ্চ সক্রিয় চুক্তি রিভিউ সীমা" : "Max Active Reviews Limit"}</label>
                  <input type="number" min={1} max={10} value={maxActiveReviews} onChange={(e) => setMaxActiveReviews(parseInt(e.target.value, 10) || 1)} className="w-full px-3.5 py-2 rounded-xl text-sm border border-(--text-primary)/15 bg-(--bg-surface) text-(--text-primary) outline-none focus:border-(--text-primary)/40 font-mono" />
                  <span className="text-[10px] text-(--text-muted) mt-1 block">{isBn ? "একসাথে সর্বোচ্চ কয়টি চুক্তি হাতে রাখবেন (SLA: ৩ ঘণ্টা)" : "Max contracts at one time (3h submit SLA)"}</span>
                </div>
                <div className="flex flex-col justify-between p-3 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10">
                  <div>
                    <span className="text-xs font-semibold text-(--text-primary) block">{isBn ? "স্বয়ংক্রিয় অফার গ্রহণ (Auto Accept)" : "Auto Accept Offers"}</span>
                    <span className="text-[10px] text-(--text-muted)">{isBn ? "কিউতে আসা অফার সরাসরি একসেপ্ট হবে" : "Automatically accept matching high-priority contracts"}</span>
                  </div>
                  <button type="button" onClick={() => setAutoAcceptOffers(!autoAcceptOffers)} className={`self-start mt-2 relative w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${autoAcceptOffers ? "bg-(--accent-solid)" : "bg-neutral-300 dark:bg-neutral-700"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-(--bg-primary) shadow-sm transition-transform ${autoAcceptOffers ? "translate-x-4.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-(--text-muted) mb-1.5">{isBn ? "পছন্দের আইনি ক্ষেত্রসমূহ (Preferred Legal Domains)" : "Preferred Legal Specializations"}</label>
                <div className="flex flex-wrap gap-2">
                  {["Contract Law", "Employment Law", "Corporate Law", "Real Estate", "Banking & IP", "Commercial Arbitration"].map((dom) => {
                    const isSelected = preferredDomains.includes(dom);
                    return (
                      <button key={dom} type="button" onClick={() => { setPreferredDomains((prev) => isSelected ? prev.filter((d) => d !== dom) : [...prev, dom]); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${isSelected ? "bg-(--accent-solid) text-(--accent-contrast) border-(--accent-solid)" : "border-(--text-primary)/15 text-(--text-muted) hover:text-(--text-primary) hover:bg-(--text-primary)/5"}`}>
                        {dom}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button type="submit" disabled={lawyerSettingsLoading} className="w-full py-2.5 rounded-xl text-xs font-semibold bg-(--accent-solid) text-(--accent-contrast) hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {lawyerSettingsLoading ? (isBn ? "সংরক্ষণ করা হচ্ছে..." : "Saving Preferences...") : (isBn ? "আইনজীবী পছন্দসমূহ সংরক্ষণ করুন (Save)" : "Save Advocate Preferences")}
              </button>
            </form>
          </Section>
        )}

        {/* ✅ FIX: Credits & Billing Hub Update */}
        <Section title={isBn ? "ক্রেডিট ও পেমেন্ট ম্যানেজমেন্ট" : "Credits & Billing Hub"}>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-(--bg-surface) border border-(--text-primary)/5">
              <div>
                <p className="text-xs text-(--text-muted) mb-1 font-medium">{balanceLabel}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-mono font-bold text-(--text-primary)">{displayBalance}</p>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{isBn ? "ক্রেডিট" : "Credits"}</span>
                </div>
                <p className="text-[11px] text-(--text-muted) mt-1">{balanceDesc}</p>
              </div>
              
              {/* ✅ MEMBER er jonno Buy button hide koro */}
              {!isEnterpriseMember && (
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
                <div className="p-3 rounded-xl bg-(--bg-surface) border border-(--text-primary)/5">
                  <span className="text-(--text-muted) block mb-0.5">{isBn ? "মোট টপ-আপ" : "Total Top-up"}</span>
                  <span className="font-mono font-bold text-(--text-primary)">৳{paymentSummary.total_topup_bdt} BDT</span>
                </div>
                <div className="p-3 rounded-xl bg-(--bg-surface) border border-(--text-primary)/5">
                  <span className="text-(--text-muted) block mb-0.5">{isBn ? "অনুমোদিত পেমেন্ট" : "Approved Orders"}</span>
                  <span className="font-mono font-bold text-(--text-primary)">{paymentSummary.approved} Completed</span>
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section title={isBn ? "গোপনীয়তা ও ডেটা সুরক্ষা (PII Protection)" : "Privacy & Data Protection"}>
          <div className="space-y-3">
            <Toggle label={isBn ? "ক্লায়েন্ট-সাইড PII মাস্কিং সক্রিয়" : "Client-side PII Masking"} desc={isBn ? "এনআইডি, মোবাইল নম্বর ও পক্ষসমূহের তথ্য ব্রাউজারে মাস্ক করে এআই প্রসেস করা হয়" : "Bangladeshi NID, phone numbers & corporate identities are redacted client-side before sending"} checked={isPiiMaskingEnabled} onChange={togglePiiMasking} />
            <div className="p-3.5 rounded-2xl bg-(--bg-surface) border border-(--text-primary)/5 flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-(--text-muted) leading-relaxed">{isBn ? "তথ্য ও যোগাযোগ প্রযুক্তি আইন ২০০৬ এবং সাইবার নিরাপত্তা বিধিমালার অধীনে আপনার কোনো সংবেদনশীল চুক্তিপত্র পাবলিক মডেলে প্রশিক্ষণ (train) করা হয় না।" : "Under the Information and Communication Technology Act 2006, all legal audits are strictly confidential and never used to train public models."}</p>
            </div>
          </div>
        </Section>

        <div className="mt-12 p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 space-y-4">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">{isBn ? "ডেঞ্জার জোন" : "Danger Zone"}</h3>
          </div>
          <p className="text-xs text-rose-800/70 dark:text-rose-200/70">{isBn ? "আপনার অ্যাকাউন্ট ডিলিট করলে আপনার সমস্ত সংরক্ষিত চুক্তি, অডিট মেমো এবং চ্যাট হিস্ট্রি স্থায়ীভাবে মুছে যাবে।" : "Deleting your account will permanently remove all archived contract memos, credit balance, and consultation history."}</p>
          <button type="button" onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(""); setDeleteError(""); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer">{isBn ? "অ্যাকাউন্ট ডিলিট করুন" : "Delete Account"}</button>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-(--text-primary)/15 bg-(--bg-card) shadow-2xl p-6 sm:p-7 space-y-5 text-left">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 8%, transparent)" }}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-(--accent-solid)/10 text-(--accent-solid)"><Key className="w-4 h-4" /></div>
                <h3 className="text-base font-bold text-(--text-primary)">{isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}</h3>
              </div>
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="p-1 text-(--text-muted) hover:text-(--text-primary) rounded-lg hover:bg-(--text-primary)/5 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (newPw.length < 6) { setPwError(isBn ? "নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters"); return; }
              if (newPw !== confirmPw) { setPwError(isBn ? "নতুন পাসওয়ার্ডের দুটি ঘর মিলছে না" : "Passwords do not match"); return; }
              setPwLoading(true); setPwError(""); setPwSuccess(false);
              try {
                await changePassword({ current_password: currentPw, new_password: newPw, confirm_new_password: confirmPw });
                setPwSuccess(true); setCurrentPw(""); setNewPw(""); setConfirmPw("");
                setTimeout(() => { setIsPasswordModalOpen(false); setPwSuccess(false); }, 2000);
              } catch (err: unknown) {
                setPwError(err instanceof Error ? err.message : "Failed to change password. Please verify current password.");
              } finally { setPwLoading(false); }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-(--text-muted) mb-1">{isBn ? "বর্তমান পাসওয়ার্ড" : "Current Password"}</label>
                <div className="relative">
                  <input type={showCurrentPw ? "text" : "password"} required value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-(--text-primary)/15 bg-(--bg-surface) text-(--text-primary) outline-none focus:border-(--text-primary)/40 pr-10 font-mono" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer">{showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
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
                <button type="submit" disabled={pwLoading} className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-(--accent-solid) text-(--accent-contrast) hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs">{pwLoading ? isBn ? "আপডেট হচ্ছে..." : "Updating..." : isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}</button>
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