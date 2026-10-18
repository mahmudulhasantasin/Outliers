"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Bell, Globe, Moon, Sun, Shield, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isBn = language === "bn";

  const borderClass = "border-[var(--text-primary)]/10";

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className={`rounded-2xl p-6 border ${borderClass} bg-[var(--bg-card)] mb-5`}>
      <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--text-muted)] mb-4">{title}</h3>
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
        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${checked ? "bg-[var(--accent-solid)]" : "bg-[var(--text-primary)]/20"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-xl mx-auto py-8 px-2">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest font-semibold text-[var(--text-muted)] mb-1">
            {isBn ? "অ্যাপ সেটিংস" : "App Settings"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[var(--text-primary)]">
            {isBn ? "সেটিংস" : "Settings"}
          </h1>
        </div>

        {/* ── Language & Theme ── */}
        <Section title={isBn ? "ভাষা ও থিম" : "Language & Theme"}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 text-[var(--text-primary)] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {isBn ? "ইন্টারফেস ভাষা" : "Interface Language"}
              </label>
              <div className="flex gap-2">
                {(["bn", "en"] as const).map((lang) => (
                  <button key={lang} type="button" onClick={() => setLanguage(lang)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all cursor-pointer ${language === lang ? "border-[var(--accent-solid)] bg-[var(--accent-solid)] text-[var(--accent-contrast)]" : `${borderClass} text-[var(--text-muted)] hover:border-[var(--text-primary)]/30`}`}>
                    {lang === "bn" ? "বাংলা" : "English"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 text-[var(--text-primary)] flex items-center gap-1.5">
                {theme === "dark" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                {isBn ? "থিম মোড" : "Theme Mode"}
              </label>
              <div className="flex gap-2">
                {(["light", "dark"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTheme(t)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${theme === t ? "border-[var(--accent-solid)] bg-[var(--accent-solid)] text-[var(--accent-contrast)]" : `${borderClass} text-[var(--text-muted)] hover:border-[var(--text-primary)]/30`}`}>
                    {t === "light" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    {t === "light" ? (isBn ? "লাইট" : "Light") : (isBn ? "ডার্ক" : "Dark")}
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

        {/* ── Privacy & Data ── */}
        <Section title={isBn ? "গোপনীয়তা ও ডেটা" : "Privacy & Data"}>
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
              {isBn
                ? "আপনার চুক্তিপত্রের ব্যক্তিগত তথ্য (PII) ব্রাউজারেই মাস্ক হয়ে যায়। কোনো সংবেদনশীল ডেটা সার্ভারে পাঠানো হয় না।"
                : "Your contract's personally identifiable information (PII) is masked client-side. No sensitive data is sent to the server."}
            </p>
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${borderClass} bg-[var(--bg-surface)]`}>
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-xs text-[var(--text-primary)] font-medium">
                {isBn ? "ক্লায়েন্ট-সাইড PII মাস্কিং সক্রিয়" : "Client-side PII masking: Active"}
              </p>
            </div>
          </div>
        </Section>

        {/* ── Danger Zone ── */}
        <div className={`rounded-2xl p-5 border border-rose-200/60 dark:border-rose-800/40 bg-rose-50/30 dark:bg-rose-950/20`}>
          <h3 className="text-xs uppercase tracking-widest font-bold text-rose-500 mb-3 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            {isBn ? "বিপজ্জনক অঞ্চল" : "Danger Zone"}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            {isBn ? "অ্যাকাউন্ট মুছলে সমস্ত ডেটা স্থায়ীভাবে হারিয়ে যাবে।" : "Deleting your account will permanently remove all data."}
          </p>
          <button type="button"
            className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer">
            {isBn ? "অ্যাকাউন্ট মুছুন" : "Delete Account"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
