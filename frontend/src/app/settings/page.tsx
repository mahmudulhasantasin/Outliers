"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Bell, Globe, Moon, Sun, Shield, Trash2, Key, Check, Coins, ArrowUpRight } from "lucide-react";
import { changePassword, updateProfile } from "@/lib/apiServices";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isBn = language === "bn";

  // Change password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const borderClass = "border-[var(--text-primary)]/10";

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-4">
      <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)]">{title}</h3>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {desc && <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>}
      </div>
      <button type="button" onClick={onChange}
        className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${checked ? "bg-[var(--accent-solid)]" : "bg-[var(--text-primary)]/20"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--bg-primary)] shadow transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-xl mx-auto py-12 px-6 sm:px-8 space-y-10 font-sans">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)] mb-1">
            {isBn ? "অ্যাপ সেটিংস" : "App Settings"}
          </p>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
            {isBn ? "সেটিংস" : "Settings"}
          </h1>
        </div>

        {/* ── Language & Theme ── */}
        <Section title={isBn ? "ভাষা ও থিম" : "Language & Theme"}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-normal text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 opacity-70" />
                <span>{isBn ? "ইন্টারফেস ভাষা" : "Interface Language"}</span>
              </label>
              <div className="flex gap-2">
                {(["bn", "en"] as const).map((lang) => (
                  <button key={lang} type="button" onClick={() => setLanguage(lang)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${language === lang ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)]" : `border border-[var(--text-primary)]/15 text-[var(--text-muted)] hover:text-[var(--text-primary)]`}`}>
                    {lang === "bn" ? "বাংলা" : "English"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-normal text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                {theme === "dark" ? <Moon className="w-3.5 h-3.5 opacity-70" /> : <Sun className="w-3.5 h-3.5 opacity-70" />}
                <span>{isBn ? "থিম মোড" : "Theme Mode"}</span>
              </label>
              <div className="flex gap-2">
                {(["light", "dark"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTheme(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${theme === t ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)]" : `border border-[var(--text-primary)]/15 text-[var(--text-muted)] hover:text-[var(--text-primary)]`}`}>
                    {t === "light" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    <span>{t === "light" ? (isBn ? "লাইট" : "Light") : (isBn ? "ডার্ক" : "Dark")}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Notifications ── */}
        <Section title={isBn ? "নোটিফিকেশন" : "Notifications"}>
          <div className="divide-y divide-[var(--text-primary)]/5">
            <Toggle
              label={isBn ? "চুক্তি অডিট সম্পন্ন" : "Contract audit completed"}
              desc={isBn ? "বিশ্লেষণ সম্পন্ন হলে বিজ্ঞপ্তি পান" : "Get notified when analysis is done"}
              checked={true}
              onChange={() => {}}
            />
            <Toggle
              label={isBn ? "আইন আপডেট" : "Statutory updates"}
              desc={isBn ? "bdlaws-এ নতুন আইন বা সংশোধনী" : "New laws or amendments on bdlaws"}
              checked={false}
              onChange={() => {}}
            />
          </div>
        </Section>

        {/* ── Change Password ── */}
        <Section title={isBn ? "পাসওয়ার্ড পরিবর্তন" : "Change Password"}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (newPw !== confirmPw) { setPwError(isBn ? "নতুন পাসওয়ার্ড মিলছে না" : "Passwords do not match"); return; }
            setPwLoading(true); setPwError(""); setPwSuccess(false);
            try {
              await changePassword({ current_password: currentPw, new_password: newPw, confirm_new_password: confirmPw });
              setPwSuccess(true); setCurrentPw(""); setNewPw(""); setConfirmPw("");
            } catch (err: unknown) {
              setPwError(err instanceof Error ? err.message : "Failed to change password");
            } finally { setPwLoading(false); }
          }} className="space-y-3">
            <input type="password" required value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
              placeholder={isBn ? "বর্তমান পাসওয়ার্ড" : "Current password"}
              className="w-full px-3.5 py-2 rounded-lg text-sm border border-[var(--text-primary)]/15 bg-transparent text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]/40" />
            <input type="password" required value={newPw} onChange={(e) => setNewPw(e.target.value)}
              placeholder={isBn ? "নতুন পাসওয়ার্ড" : "New password"}
              className="w-full px-3.5 py-2 rounded-lg text-sm border border-[var(--text-primary)]/15 bg-transparent text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]/40" />
            <input type="password" required value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
              placeholder={isBn ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm new password"}
              className="w-full px-3.5 py-2 rounded-lg text-sm border border-[var(--text-primary)]/15 bg-transparent text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]/40" />
            {pwError && <p className="text-xs text-rose-500">{pwError}</p>}
            {pwSuccess && <p className="text-xs text-emerald-500 flex items-center gap-1"><Check className="w-3 h-3" />{isBn ? "পাসওয়ার্ড পরিবর্তন সফল" : "Password changed successfully"}</p>}
            <button type="submit" disabled={pwLoading}
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer">
              <Key className="w-3.5 h-3.5 inline mr-1.5" />
              {pwLoading ? (isBn ? "অপেক্ষা..." : "Updating...") : (isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password")}
            </button>
          </form>
        </Section>

        {/* ── Credits & Billing ── */}
        <Section title={isBn ? "ক্রেডিট ও বিলিং" : "Credits & Billing"}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">
                {isBn ? "উপলব্ধ ক্রেডিট ব্যালেন্স:" : "Available Credit Balance:"}
              </p>
              <p className="text-xl font-mono font-semibold text-[var(--text-primary)]">
                {user?.creditBalance ?? 0} {isBn ? "ক্রেডিট" : "Credits"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/pricing")}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{isBn ? "প্যাকেজ কিনুন" : "Buy Packages"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Section>

        {/* ── Privacy & Data ── */}
        <Section title={isBn ? "গোপনীয়তা ও ডেটা" : "Privacy & Data"}>
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {isBn
                ? "আপনার চুক্তিপত্রের ব্যক্তিগত তথ্য (PII) ব্রাউজারেই মাস্ক হয়ে যায়। কোনো সংবেদনশীল ডেটা সার্ভারে পাঠানো হয় না।"
                : "Your contract's personally identifiable information (PII) is masked client-side. No sensitive data is sent to the server."}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-xs text-[var(--text-muted)]">
                {isBn ? "ক্লায়েন্ট-সাইড PII মাস্কিং সক্রিয়" : "Client-side PII masking active"}
              </p>
            </div>
          </div>
        </Section>

        {/* ── Danger Zone ── */}
        <div className="pt-2 pb-12">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isBn ? "বিপজ্জনক অঞ্চল" : "Danger Zone"}</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            {isBn ? "অ্যাকাউন্ট মুছলে সমস্ত ডেটা স্থায়ীভাবে হারিয়ে যাবে।" : "Deleting your account will permanently remove all data."}
          </p>
          <button type="button"
            className="flex items-center gap-2 py-1 text-sm text-[var(--text-muted)] hover:text-rose-500 transition-colors cursor-pointer">
            <span>{isBn ? "অ্যাকাউন্ট মুছুন" : "Delete Account"}</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
