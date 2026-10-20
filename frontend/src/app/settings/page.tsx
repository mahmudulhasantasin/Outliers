"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Bell,
  Globe,
  Moon,
  Sun,
  Shield,
  Trash2,
  Key,
  Check,
  Coins,
  ArrowUpRight,
  Eye,
  EyeOff,
  AlertCircle,
  Download,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Lock,
  Layers,
  FileCheck,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import {
  changePassword,
  getMySettings,
  getPaymentSummary,
  updateLawyerSettings,
  PaymentSummary,
} from "@/lib/apiServices";

interface NotificationSettings {
  auditCompleted: boolean;
  statutoryUpdates: boolean;
  lawyerReviewAlerts: boolean;
  creditReceipts: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  auditCompleted: true,
  statutoryUpdates: false,
  lawyerReviewAlerts: true,
  creditReceipts: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isBn = language === "bn";

  // Change password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // Persistent Notification Toggles
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [notificationSavedToast, setNotificationSavedToast] = useState(false);

  // Live Payment Summary
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [isRefreshingSettings, setIsRefreshingSettings] = useState(false);

  // Danger Zone confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // PII Masking preference
  const [isPiiMaskingEnabled, setIsPiiMaskingEnabled] = useState(true);

  // Lawyer settings state (Docs Section 7.4)
  const [maxActiveReviews, setMaxActiveReviews] = useState(3);
  const [autoAcceptOffers, setAutoAcceptOffers] = useState(false);
  const [isLawyerAvailable, setIsLawyerAvailable] = useState(true);
  const [preferredDomains, setPreferredDomains] = useState<string[]>([
    "Contract Law",
    "Employment Law",
  ]);
  const [lawyerSettingsLoading, setLawyerSettingsLoading] = useState(false);
  const [lawyerSettingsToast, setLawyerSettingsToast] = useState(false);

  // Load notification preferences from localStorage
  useEffect(() => {
    try {
      const savedNotifs = localStorage.getItem("contractmind_notifications");
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }
      const savedPii = localStorage.getItem("contractmind_pii_masking");
      if (savedPii !== null) {
        setIsPiiMaskingEnabled(savedPii === "true");
      }
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

  // Fetch live settings and payment summary on mount
  const loadLiveSettings = async () => {
    setIsRefreshingSettings(true);
    try {
      const [settingsData, payData] = await Promise.allSettled([
        getMySettings(),
        getPaymentSummary(),
      ]);
      if (settingsData.status === "fulfilled" && settingsData.value?.lawyer_profile) {
        const lp = settingsData.value.lawyer_profile;
        if (typeof lp.max_active_reviews === "number") setMaxActiveReviews(lp.max_active_reviews);
        if (typeof lp.auto_accept_offers === "boolean") setAutoAcceptOffers(lp.auto_accept_offers);
        if (typeof lp.is_available === "boolean") setIsLawyerAvailable(lp.is_available);
        if (Array.isArray(lp.preferred_domains)) setPreferredDomains(lp.preferred_domains);
      }
      if (payData.status === "fulfilled" && payData.value) {
        setPaymentSummary(payData.value);
      }
      if (refreshUser) {
        await refreshUser();
      }
    } catch (e) {
      console.warn("Could not load live settings:", e);
    } finally {
      setIsRefreshingSettings(false);
    }
  };

  const handleSaveLawyerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLawyerSettingsLoading(true);
    try {
      await updateLawyerSettings({
        max_active_reviews: maxActiveReviews,
        auto_accept_offers: autoAcceptOffers,
        is_available: isLawyerAvailable,
        preferred_domains: preferredDomains,
      });
      localStorage.setItem(
        "contractmind_lawyer_prefs",
        JSON.stringify({
          max_active_reviews: maxActiveReviews,
          auto_accept_offers: autoAcceptOffers,
          is_available: isLawyerAvailable,
          preferred_domains: preferredDomains,
        })
      );
      setLawyerSettingsToast(true);
      setTimeout(() => setLawyerSettingsToast(false), 3000);
    } catch (err) {
      console.warn("Could not save lawyer settings via API:", err);
      localStorage.setItem(
        "contractmind_lawyer_prefs",
        JSON.stringify({
          max_active_reviews: maxActiveReviews,
          auto_accept_offers: autoAcceptOffers,
          is_available: isLawyerAvailable,
          preferred_domains: preferredDomains,
        })
      );
      setLawyerSettingsToast(true);
      setTimeout(() => setLawyerSettingsToast(false), 3000);
    } finally {
      setLawyerSettingsLoading(false);
    }
  };

  useEffect(() => {
    loadLiveSettings();
  }, []);

  // Update notification toggle
  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("contractmind_notifications", JSON.stringify(updated));
      return updated;
    });
    setNotificationSavedToast(true);
    setTimeout(() => setNotificationSavedToast(false), 2000);
  };

  // Toggle PII masking
  const togglePiiMasking = () => {
    setIsPiiMaskingEnabled((prev) => {
      const updated = !prev;
      localStorage.setItem("contractmind_pii_masking", String(updated));
      return updated;
    });
  };

  // Export User Data
  const handleExportData = () => {
    const dataToExport = {
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        mobile: user?.mobile,
        role: user?.role,
        creditBalance: user?.creditBalance,
      },
      preferences: {
        language,
        theme,
        notifications,
        isPiiMaskingEnabled,
      },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contractmind_profile_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Password strength calculation
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

  const Section = ({
    title,
    badge,
    children,
  }: {
    title: string;
    badge?: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-4 p-6 rounded-3xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-xs">
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 8%, transparent)" }}>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)]">
          {title}
        </h3>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--text-primary)]/5 text-[var(--text-muted)]">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );

  const Toggle = ({
    label,
    desc,
    checked,
    onChange,
  }: {
    label: string;
    desc?: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0 pr-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        {desc && <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
          checked ? "bg-[var(--accent-solid)]" : "bg-neutral-300 dark:bg-neutral-700"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-[var(--bg-primary)] shadow-sm transition-transform ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto py-10 px-4 sm:px-8 space-y-8 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1">
              {isBn ? "অ্যাপ সেটিংস ও পছন্দসমূহ" : "System Preferences & Security"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[var(--text-primary)]">
              {isBn ? "সেটিংস" : "Settings"}
            </h1>
          </div>
          <button
            type="button"
            onClick={loadLiveSettings}
            disabled={isRefreshingSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Reload settings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingSettings ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isBn ? "রিফ্রেশ" : "Sync"}</span>
          </button>
        </div>

        {/* ── 1. LANGUAGE & THEME ── */}
        <Section title={isBn ? "ভাষা ও ইন্টারফেস থিম" : "Language & Theme"}>
          <div className="space-y-4">
            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 opacity-70" />
                <span>{isBn ? "ইন্টারফেস ভাষা (Interface Language)" : "Interface Language"}</span>
              </label>
              <div className="flex gap-2">
                {(["bn", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      language === lang
                        ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-xs"
                        : "border border-[var(--text-primary)]/15 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
                    }`}
                  >
                    {lang === "bn" ? "বাংলা (Bengali)" : "English (Codified BD Law)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                {theme === "dark" ? <Moon className="w-3.5 h-3.5 opacity-70" /> : <Sun className="w-3.5 h-3.5 opacity-70" />}
                <span>{isBn ? "থিম মোড (Appearance)" : "Appearance Theme"}</span>
              </label>
              <div className="flex gap-2">
                {(["light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      theme === t
                        ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-xs"
                        : "border border-[var(--text-primary)]/15 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
                    }`}
                  >
                    {t === "light" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    <span>{t === "light" ? (isBn ? "লাইট মোড" : "Light Mode") : (isBn ? "ডার্ক মোড" : "Dark Mode")}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── 2. NOTIFICATIONS ── */}
        <Section
          title={isBn ? "নোটিফিকেশন ও অ্যালার্ট" : "Notifications & Alerts"}
          badge={notificationSavedToast ? (isBn ? "সংরক্ষিত ✓" : "Saved ✓") : undefined}
        >
          <div className="divide-y" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 6%, transparent)" }}>
            <Toggle
              label={isBn ? "চুক্তি অডিট সম্পন্ন নোটিফিকেশন" : "Contract audit completed"}
              desc={isBn ? "এআই ঝুঁকি বিশ্লেষণ এবং ধারার নিরীক্ষা সম্পন্ন হলে নোটিফিকেশন পাবেন" : "Get notified when statutory clause analysis & memo generation is complete"}
              checked={notifications.auditCompleted}
              onChange={() => toggleNotification("auditCompleted")}
            />
            <Toggle
              label={isBn ? "আইন ও প্রবিধান আপডেট" : "Statutory & Gazette updates"}
              desc={isBn ? "bdlaws-এ নতুন আইন, গেজেট বা শ্রম আইনের সংশোধনী প্রকাশিত হলে সতর্কবার্তা" : "Alerts when relevant Bangladesh statutes or gazettes are updated on bdlaws"}
              checked={notifications.statutoryUpdates}
              onChange={() => toggleNotification("statutoryUpdates")}
            />
            <Toggle
              label={isBn ? "আইনজীবী পর্যালোচনা অ্যালার্ট" : "Advocate review & signoff"}
              desc={isBn ? "সুপ্রিম কোর্টের নিবন্ধিত আইনজীবী দ্বারা অডিট সত্যায়িত হলে সরাসরি নোটিফিকেশন" : "Receive instant alerts when a verified lawyer signs off your contract audit"}
              checked={notifications.lawyerReviewAlerts}
              onChange={() => toggleNotification("lawyerReviewAlerts")}
            />
            <Toggle
              label={isBn ? "ক্রেডিট ও পেমেন্ট রিসিপ্ট" : "Credit & top-up receipts"}
              desc={isBn ? "বিকাশ পেমেন্ট অনুমোদন এবং ক্রেডিট যোগ হলে ইনভয়েস গ্রহণ করুন" : "Get email confirmation & transaction receipt when bKash credits are approved"}
              checked={notifications.creditReceipts}
              onChange={() => toggleNotification("creditReceipts")}
            />
          </div>
        </Section>

        {/* ── 3. CHANGE PASSWORD ── */}
        <Section title={isBn ? "পাসওয়ার্ড পরিবর্তন ও অ্যাকাউন্ট সুরক্ষা" : "Account Password & Security"}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (newPw.length < 6) {
                setPwError(isBn ? "নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters");
                return;
              }
              if (newPw !== confirmPw) {
                setPwError(isBn ? "নতুন পাসওয়ার্ডের দুটি ঘর মিলছে না" : "Passwords do not match");
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
              } catch (err: unknown) {
                setPwError(err instanceof Error ? err.message : "Failed to change password. Please verify current password.");
              } finally {
                setPwLoading(false);
              }
            }}
            className="space-y-3.5"
          >
            {/* Current Password */}
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
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]/40 pr-10 font-mono"
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

            {/* New Password */}
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
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]/40 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {newPw.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>{isBn ? "পাসওয়ার্ড নির্ভরযোগ্যতা:" : "Password strength:"}</span>
                    <span className="font-semibold">{pwdStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                      style={{ width: `${(pwdStrength.score / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                {isBn ? "নতুন পাসওয়ার্ড পুনরায় লিখুন" : "Confirm New Password"}
              </label>
              <input
                type="password"
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]/40 font-mono"
              />
              {confirmPw.length > 0 && newPw !== confirmPw && (
                <p className="text-xs text-rose-500 mt-1">
                  {isBn ? "পাসওয়ার্ড দুটি মিলছে না" : "Passwords do not match"}
                </p>
              )}
            </div>

            {pwError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            {pwSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{isBn ? "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।" : "Password changed successfully."}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Key className="w-3.5 h-3.5 inline mr-1.5" />
              {pwLoading
                ? isBn
                  ? "আপডেট হচ্ছে..."
                  : "Updating Password..."
                : isBn
                ? "পাসওয়ার্ড পরিবর্তন করুন"
                : "Change Password"}
            </button>
          </form>
        </Section>

        {/* ── LAWYER PREFERENCES (Docs Section 7.4) ── */}
        {(user?.role === "lawyer" || !!user?.lawyerProfile) && (
          <Section
            title={isBn ? "আইনজীবী কর্মদক্ষতা ও অগ্রাধিকার সেটিংস" : "Advocate Preferences & Workload"}
            badge={lawyerSettingsToast ? (isBn ? "সংরক্ষিত ✓" : "Saved ✓") : undefined}
          >
            <form onSubmit={handleSaveLawyerSettings} className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    {isBn ? "নতুন পর্যালোচনার জন্য প্রস্তুত (Availability)" : "Accepting New Review Offers"}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {isBn
                      ? "চালু থাকলে নতুন ক্লায়েন্ট চুক্তির নোটিফিকেশন ও অফার কিউতে পাঠানো হবে"
                      : "When active, eligible client contracts will be dispatched to your offer queue"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLawyerAvailable(!isLawyerAvailable)}
                  className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                    isLawyerAvailable ? "bg-[var(--accent-solid)]" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-[var(--bg-primary)] shadow-sm transition-transform ${
                      isLawyerAvailable ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    {isBn ? "সর্বোচ্চ সক্রিয় চুক্তি রিভিউ সীমা" : "Max Active Reviews Limit"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={maxActiveReviews}
                    onChange={(e) => setMaxActiveReviews(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]/40 font-mono"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                    {isBn ? "একসাথে সর্বোচ্চ কয়টি চুক্তি হাতে রাখবেন (SLA: ৩ ঘণ্টা)" : "Max contracts at one time (3h submit SLA)"}
                  </span>
                </div>

                <div className="flex flex-col justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10">
                  <div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] block">
                      {isBn ? "স্বয়ংক্রিয় অফার গ্রহণ (Auto Accept)" : "Auto Accept Offers"}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {isBn ? "কিউতে আসা অফার সরাসরি একসেপ্ট হবে" : "Automatically accept matching high-priority contracts"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoAcceptOffers(!autoAcceptOffers)}
                    className={`self-start mt-2 relative w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      autoAcceptOffers ? "bg-[var(--accent-solid)]" : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-[var(--bg-primary)] shadow-sm transition-transform ${
                        autoAcceptOffers ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                  {isBn ? "পছন্দের আইনি ক্ষেত্রসমূহ (Preferred Legal Domains)" : "Preferred Legal Specializations"}
                </label>
                <div className="flex flex-wrap gap-2">
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] border-[var(--accent-solid)]"
                            : "border-[var(--text-primary)]/15 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
                        }`}
                      >
                        {dom}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={lawyerSettingsLoading}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                {lawyerSettingsLoading
                  ? isBn
                    ? "সংরক্ষণ করা হচ্ছে..."
                    : "Saving Preferences..."
                  : isBn
                  ? "আইনজীবী পছন্দসমূহ সংরক্ষণ করুন (Save)"
                  : "Save Advocate Preferences"}
              </button>
            </form>
          </Section>
        )}

        {/* ── 4. CREDITS & BILLING HUB ── */}
        <Section title={isBn ? "ক্রেডিট ও পেমেন্ট ম্যানেজমেন্ট" : "Credits & Billing Hub"}>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/5">
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1 font-medium">
                  {isBn ? "উপলব্ধ অ্যাকাউন্ট ক্রেডিট ব্যালেন্স:" : "Available Credit Balance:"}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-mono font-bold text-[var(--text-primary)]">
                    {user?.creditBalance ?? 0}
                  </p>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {isBn ? "ক্রেডিট" : "Credits"}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  {isBn ? "৫০ ক্রেডিট = ১টি সম্পূর্ণ চুক্তি অডিট" : "50 credits = 1 full contract statutory audit"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/pricing")}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 shadow-xs"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{isBn ? "প্যাকেজ কিনুন (bKash)" : "Buy Packages"}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Payment Summary Info if available */}
            {paymentSummary && paymentSummary.total_topup_bdt > 0 && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/5">
                  <span className="text-[var(--text-muted)] block mb-0.5">{isBn ? "মোট টপ-আপ" : "Total Top-up"}</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">৳{paymentSummary.total_topup_bdt} BDT</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/5">
                  <span className="text-[var(--text-muted)] block mb-0.5">{isBn ? "অনুমোদিত পেমেন্ট" : "Approved Orders"}</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{paymentSummary.approved} Completed</span>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* ── 5. PRIVACY & DATA PROTECTION ── */}
        <Section title={isBn ? "গোপনীয়তা ও ডেটা সুরক্ষা (PII Protection)" : "Privacy & Data Protection"}>
          <div className="space-y-3">
            <Toggle
              label={isBn ? "ক্লায়েন্ট-সাইড PII মাস্কিং সক্রিয়" : "Client-side PII Masking"}
              desc={isBn ? "এনআইডি, মোবাইল নম্বর ও পক্ষসমূহের তথ্য ব্রাউজারে মাস্ক করে এআই প্রসেস করা হয়" : "Bangladeshi NID, phone numbers & corporate identities are redacted client-side before sending"}
              checked={isPiiMaskingEnabled}
              onChange={togglePiiMasking}
            />

            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/5 flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {isBn
                  ? "তথ্য ও যোগাযোগ প্রযুক্তি আইন ২০০৬ এবং সাইবার নিরাপত্তা বিধিমালার অধীনে আপনার কোনো সংবেদনশীল চুক্তিপত্র পাবলিক মডেলে প্রশিক্ষণ (train) করা হয় না।"
                  : "Under the Information and Communication Technology Act 2006, all legal audits are strictly confidential and never used to train public models."}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleExportData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--text-primary)]/15 hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isBn ? "অ্যাকাউন্ট ডেটা ব্যাকআপ ডাউনলোড (JSON)" : "Export Account Data (JSON)"}</span>
              </button>
            </div>
          </div>
        </Section>

        {/* ── 6. DANGER ZONE ── */}
        <div className="p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 shadow-xs space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" />
            <span>{isBn ? "বিপজ্জনক অঞ্চল (Danger Zone)" : "Danger Zone"}</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {isBn
              ? "অ্যাকাউন্ট মুছলে সংরক্ষিত চুক্তি অডিট, ক্রেডিট ব্যালেন্স এবং হিস্ট্রি স্থায়ীভাবে মুছে যাবে। এই ক্রিয়াটি অপরিবর্তনীয়।"
              : "Deleting your account will permanently remove all archived contract memos, credit balance, and consultation history."}
          </p>
          <button
            type="button"
            onClick={() => {
              setDeleteConfirmText("");
              setIsDeleteModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
          >
            {isBn ? "অ্যাকাউন্ট ডিলিট করুন" : "Delete Account"}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CONFIRM ACCOUNT DELETION MODAL                                       */}
      {/* ==================================================================== */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-[var(--bg-card)] shadow-2xl p-6 sm:p-7 space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {isBn ? "অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলতে চান?" : "Delete Account Permanently?"}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {isBn ? "এই কাজটি আর ফেরানো যাবে না।" : "This action cannot be undone."}
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {isBn
                ? "নিশ্চিত করতে নিচে DELETE শব্দটি টাইপ করুন:"
                : "To confirm deletion, please type DELETE below:"}
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2 rounded-xl text-sm font-mono border border-rose-500/30 bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== "DELETE"}
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-40 cursor-pointer"
              >
                {isBn ? "স্থায়ীভাবে মুছুন" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
