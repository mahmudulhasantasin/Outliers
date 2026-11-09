"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Building2,
  Clock,
  ShieldAlert,
  RefreshCw,
  LogOut,
  Mail,
} from "lucide-react";

export default function EnterprisePendingPage() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [isRefreshing, setIsRefreshing] = useState(false);

  const entProfile = user?.enterpriseProfile;
  const status = entProfile?.verificationStatus || "pending";
  const userRole = String(user?.role || "").toUpperCase();

  // Guard: if user is not logged in -> redirect /login
  // If approved as ENTERPRISE_ADMIN -> redirect to /enterprise/admin
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (userRole === "ENTERPRISE_ADMIN" || status === "verified") {
      router.replace("/enterprise/admin");
      return;
    }
    if (userRole === "LAWYER") {
      router.replace("/lawyer/pending");
      return;
    }
    if (userRole === "ADMIN") {
      router.replace("/admin");
      return;
    }
  }, [user, userRole, status, router]);

  const handleCheckStatus = async () => {
    setIsRefreshing(true);
    try {
      if (refreshUser) await refreshUser();
    } finally {
      setIsRefreshing(false);
    }
  };

  const borderClass = "border-[var(--text-primary)]/10";

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-6">
        {/* Status Header Banner */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${borderClass} bg-[var(--bg-card)] shadow-sm space-y-6 relative overflow-hidden`}>
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20 shadow-inner">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)]">
                    {entProfile?.companyName || (isBn ? "আপনার প্রতিষ্ঠান" : "Your Organization")}
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium border bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 inline-flex items-center gap-1.5">
                    <Clock className="w-3 h-3 animate-pulse text-amber-500" />
                    {isBn ? "অনুমোদন অপেক্ষমাণ" : "Pending Admin Review"}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {entProfile?.companyType || "Enterprise Application"} • {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckStatus}
              disabled={isRefreshing}
              className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--text-primary)]/15 hover:bg-[var(--bg-surface)] text-[var(--text-primary)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isBn ? "স্ট্যাটাস রিফ্রেশ করুন" : "Refresh Status"}</span>
            </button>
          </div>

          {/* Under Review Notice Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 text-xs text-[var(--text-primary)] leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-semibold text-purple-800 dark:text-purple-300">
              <ShieldAlert className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
              <span>{isBn ? "সিস্টেম অ্যাডমিন যাচাইকরণ চলমান" : "Verification by System Admin in Progress"}</span>
            </div>
            <p className="text-[var(--text-muted)] pl-6">
              {isBn
                ? "আপনার কোম্পানি রেজিস্ট্রেশন নম্বর ও TIN সংক্রান্ত তথ্য সিস্টেম অ্যাডমিন দ্বারা ম্যানুয়ালি যাচাই করা হচ্ছে। অনুমোদন সম্পন্ন হলে আপনার ইমেইলে একটি টিম রেফারেল কোড পাঠানো হবে যা দিয়ে মেম্বারদের যুক্ত করতে পারবেন।"
                : "Your company registration and TIN details have been submitted for manual review by our System Admin. Once approved, an official Team Referral Code will be sent to your email to invite and manage team members."}
            </p>
          </div>

          {/* Submitted Company Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/5">
              <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
                {isBn ? "রেজিস্ট্রেশন নম্বর" : "Registration No."}
              </p>
              <p className="text-xs font-mono font-semibold text-[var(--text-primary)] mt-1 truncate">
                {entProfile?.registrationNo || "—"}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/5">
              <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
                {isBn ? "TIN নম্বর" : "TIN No."}
              </p>
              <p className="text-xs font-mono font-semibold text-[var(--text-primary)] mt-1 truncate">
                {entProfile?.tinNo || "—"}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/5 col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
                {isBn ? "আবেদনের স্ট্যাটাস" : "Application Status"}
              </p>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1 capitalize">
                {status}
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps Card */}
        <div className={`p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)] shadow-sm space-y-4`}>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {isBn ? "পরবর্তী কী হবে? (What happens next?)" : "What happens next?"}
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-xs text-[var(--text-muted)]">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                ✓
              </div>
              <p className="leading-relaxed">
                <strong className="text-[var(--text-primary)]">{isBn ? "ইমেইল ওটিপি নিশ্চিত:" : "Email Verified:"}</strong>{" "}
                {isBn
                  ? "আপনার ইমেইল অ্যাড্রেস সফলভাবে ওটিপি দিয়ে যাচাই করা হয়েছে।"
                  : "Your email address has been successfully verified via OTP."}
              </p>
            </div>
            <div className="flex items-start gap-3 text-xs text-[var(--text-muted)]">
              <div className="w-6 h-6 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 animate-pulse">
                2
              </div>
              <p className="leading-relaxed">
                <strong className="text-[var(--text-primary)]">{isBn ? "অ্যাডমিন পর্যালোচনা (বর্তমান ধাপ):" : "Admin Review (Current):"}</strong>{" "}
                {isBn
                  ? "সিস্টেম অ্যাডমিন আপনার প্রতিষ্ঠানের আইনি ও বাণিজ্যিক তথ্য পরীক্ষা করছেন (সাধারণত ২-৪ কার্যঘণ্টা)।"
                  : "System Admin is reviewing your enterprise documentation (usually within 2-4 business hours)."}
              </p>
            </div>
            <div className="flex items-start gap-3 text-xs text-[var(--text-muted)]">
              <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                3
              </div>
              <p className="leading-relaxed">
                <strong className="text-[var(--text-primary)]">{isBn ? "রেফারেল কোড ও ড্যাশবোর্ড সক্রিয়:" : "Referral Code & Workspace Access:"}</strong>{" "}
                {isBn
                  ? "অনুমোদনের পর আপনাকে ইমেইলে রেফারেল কোড পাঠানো হবে এবং সম্পূর্ণ এন্টারপ্রাইজ ড্যাশবোর্ড আনলক হবে।"
                  : "Upon approval, your referral code will be emailed and the full Enterprise Admin workspace will unlock."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-purple-500" />
            <span>{isBn ? "কোনো প্রশ্ন থাকলে: support@contractmind.ai" : "Need help? Contact support@contractmind.ai"}</span>
          </p>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isBn ? "লগআউট" : "Sign out"}</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
