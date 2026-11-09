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
  Check,
  CheckCircle2,
  FileCheck2,
  KeyRound,
  Sparkles,
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
    if (!entProfile && (userRole === "GENERAL" || !userRole)) {
      router.replace("/dashboard");
      return;
    }
  }, [user, userRole, status, entProfile, router]);

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
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
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

        {/* Modern Enterprise Verification Timeline */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${borderClass} bg-[var(--bg-card)] shadow-sm space-y-6`}>
          <div className="flex items-center justify-between border-b border-[var(--text-primary)]/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {isBn ? "অনবোর্ডিং ও ভেরিফিকেশন টাইমলাইন" : "Verification & Activation Timeline"}
                </h2>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {isBn
                  ? "আপনার প্রতিষ্ঠানের যাচাইকরণ প্রক্রিয়ার বর্তমান অবস্থা ও পরবর্তী ধাপসমূহ"
                  : "Track the real-time review progress of your corporate enterprise application"}
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              {isBn ? "ধাপ ২ চলমান (৩টির মধ্যে)" : "Step 2 of 3 in Progress"}
            </span>
          </div>

          <div className="relative pl-1 sm:pl-2 space-y-8">
            {/* Step 1: Email OTP Verified */}
            <div className="relative flex items-start gap-4">
              {/* Vertical connector line */}
              <div className="absolute left-4 top-8 -bottom-8 w-0.5 bg-gradient-to-b from-emerald-500 to-amber-500" />
              
              {/* Icon Marker */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 ring-4 ring-emerald-500/10">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {isBn ? "১. ইমেইল ওটিপি নিশ্চিতকরণ" : "1. Email OTP Verification"}
                  </h3>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {isBn ? "যাচাই সম্পন্ন" : "Completed"}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {isBn
                    ? "আপনার অ্যাডমিন ইমেইল সফলভাবে ওটিপি দ্বারা যাচাই করা হয়েছে এবং কর্পোরেট অ্যাকাউন্টের সাথে সুরক্ষিতভাবে যুক্ত হয়েছে।"
                    : "Your enterprise administrator email was authenticated via one-time passcode and linked to your corporate account."}
                </p>
              </div>
            </div>

            {/* Step 2: System Admin Review (Current Step - Clean, Modern, No Jittering) */}
            <div className="relative flex items-start gap-4">
              {/* Vertical connector line to Step 3 */}
              <div className="absolute left-4 top-8 -bottom-8 w-0.5 border-l-2 border-dashed border-[var(--text-primary)]/15" />

              {/* Icon Marker - Stable, elegant amber with soft accent ring */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25 ring-4 ring-amber-500/20">
                <Clock className="w-4 h-4 stroke-[2.5]" />
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {isBn ? "২. সিস্টেম অ্যাডমিন পর্যালোচনা" : "2. System Admin Verification"}
                  </h3>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {isBn ? "বর্তমানে পর্যালোচনায় (২-৪ ঘণ্টা)" : "Under Review (2-4 hrs SLA)"}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
                  {isBn
                    ? "আমাদের কমপ্লায়েন্স টিম আপনার কোম্পানির ট্রেড লাইসেন্স, রেজিস্ট্রেশন ও TIN সংক্রান্ত তথ্যাদি ম্যানুয়ালি নিরীক্ষা করছেন।"
                    : "Compliance officers are verifying your trade registration, TIN records, and enterprise authorization credentials."}
                </p>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-between gap-3 text-[11px] text-amber-800 dark:text-amber-300">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      {isBn
                        ? "আপনার দিক থেকে কোনো অতিরিক্ত ডকুমেন্টের প্রয়োজন নেই।"
                        : "No further action is required from you at this time."}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold opacity-75 shrink-0">
                    SLA: 2-4 Hours
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Referral Code & Workspace Access */}
            <div className="relative flex items-start gap-4">
              {/* Icon Marker */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--text-primary)]/20 text-[var(--text-muted)] flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-semibold text-[var(--text-muted)]">
                    {isBn ? "৩. রেফারেল কোড ও ড্যাশবোর্ড সক্রিয়করণ" : "3. Referral Code & Full Workspace Access"}
                  </h3>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--text-primary)]/10">
                    {isBn ? "আসন্ন ধাপ" : "Upcoming"}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]/80 leading-relaxed">
                  {isBn
                    ? "অনুমোদন সম্পন্ন হলে আপনার ইমেইলে রেফারেল কোড পাঠানো হবে এবং সম্পূর্ণ এন্টারপ্রাইজ ড্যাশবোর্ড, মেম্বার ইনভাইট ও ক্রেডিট কোটা সুবিধা আনলক হবে।"
                    : "Upon admin sign-off, an official company referral code will be dispatched to your inbox, unlocking member management, playbooks, and contract review desks."}
                </p>
              </div>
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
