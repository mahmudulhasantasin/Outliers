"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
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
} from "lucide-react";

export default function ProfilePage() {
  const { user, simulatePhoneVerification, updateUser, logout } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const isBn = language === "bn";

  const [editMode, setEditMode] = useState(false);
  const [draftName, setDraftName] = useState(user?.name ?? "");
  const [draftMobile, setDraftMobile] = useState(user?.mobile ?? "");
  const [draftEmail, setDraftEmail] = useState(user?.email ?? "");

  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <p className="text-sm text-[var(--text-muted)]">
            {isBn ? "প্রোফাইল লোড হচ্ছে..." : "Loading profile..."}
          </p>
        </div>
      </AppShell>
    );
  }

  const isLawyer = user.role === "lawyer";
  const verificationStatus = user.lawyerProfile?.verificationStatus ?? null;
  const borderClass = "border-[var(--text-primary)]/10";

  const handleSave = () => {
    updateUser({ name: draftName, mobile: draftMobile, email: draftEmail });
    setEditMode(false);
  };

  const handleCancel = () => {
    setDraftName(user.name);
    setDraftMobile(user.mobile || "");
    setDraftEmail(user.email);
    setEditMode(false);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto py-8 px-2">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest font-semibold text-[var(--text-muted)] mb-1">
            {isBn ? "ব্যক্তিগত অ্যাকাউন্ট" : "Personal Account"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[var(--text-primary)]">
            {isBn ? "প্রোফাইল" : "Profile"}
          </h1>
        </div>

        {/* ── Avatar & Role Badge ── */}
        <div className={`rounded-2xl p-6 border ${borderClass} bg-[var(--bg-card)] mb-5 flex items-center gap-5`}>
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center text-3xl font-bold text-[var(--text-muted)] overflow-hidden">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt="DP" className="w-full h-full object-cover" />
                : <User className="w-10 h-10 text-[var(--text-muted)]" />
              }
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-[var(--accent-solid)] text-[var(--accent-contrast)] flex items-center justify-center shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{user.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Role badge */}
              {isLawyer ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  <Gavel className="w-3 h-3" />
                  {isBn ? "আইনজীবী" : "Lawyer"}
                </span>
              ) : user.role === "enterprise_admin" || (user.role === "enterprise" && !user.enterpriseProfile?.isTeamMember) ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  <Building2 className="w-3 h-3" />
                  {isBn ? "এন্টারপ্রাইজ অ্যাডমিন" : "Enterprise Admin"}
                </span>
              ) : user.role === "enterprise_member" || (user.role === "enterprise" && user.enterpriseProfile?.isTeamMember) ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  <Building2 className="w-3 h-3" />
                  {isBn ? "এন্টারপ্রাইজ সদস্য" : "Enterprise Member"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <User className="w-3 h-3" />
                  {isBn ? "সাধারণ ব্যবহারকারী" : "General User"}
                </span>
              )}
              {/* Lawyer verification status */}
              {isLawyer && verificationStatus === "pending" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300">
                  <Clock className="w-3 h-3" />
                  {isBn ? "ভেরিফিকেশন প্রক্রিয়াধীন" : "Verification Pending"}
                </span>
              )}
              {isLawyer && verificationStatus === "verified" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  {isBn ? "যাচাইকৃত অ্যাডভোকেট ✓" : "Verified Advocate ✓"}
                </span>
              )}
              {/* Phone verification status */}
              {user.isPhoneVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  {isBn ? "মোবাইল ভেরিফাইড" : "Mobile Verified"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                  <Clock className="w-3 h-3" />
                  {isBn ? "মোবাইল ভেরিফাই বাকি" : "Mobile Unverified"}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setEditMode(!editMode); setDraftName(user.name); setDraftMobile(user.mobile || ""); setDraftEmail(user.email); }}
            className={`shrink-0 p-2 rounded-xl border ${borderClass} hover:bg-[var(--bg-surface)] transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* ── Personal Info ── */}
        <div className={`rounded-2xl p-6 border ${borderClass} bg-[var(--bg-card)] mb-5`}>
          <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--text-muted)] mb-4">
            {isBn ? "ব্যক্তিগত তথ্য" : "Personal Information"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                {isBn ? "পুরো নাম" : "Full Name"}
              </label>
              {editMode ? (
                <input type="text" value={draftName} onChange={(e) => setDraftName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-transparent text-[var(--text-primary)]`} />
              ) : (
                <p className="text-sm text-[var(--text-primary)] px-1">{user.name}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)] flex items-center gap-1.5">
                <Phone className="w-3 h-3" />
                {isBn ? "মোবাইল নম্বর" : "Mobile Number"}
              </label>
              {editMode ? (
                <input type="tel" value={draftMobile} onChange={(e) => setDraftMobile(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-transparent text-[var(--text-primary)] font-mono`} />
              ) : (
                <p className="text-sm text-[var(--text-primary)] px-1 font-mono">{user.mobile}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)] flex items-center gap-1.5">
                <Mail className="w-3 h-3" />
                {isBn ? "ইমেইল" : "Email"}
                <span className="text-[10px] text-[var(--text-muted)] font-normal">{isBn ? "(ঐচ্ছিক)" : "(optional)"}</span>
              </label>
              {editMode ? (
                <input type="email" value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-transparent text-[var(--text-primary)]`} />
              ) : (
                <p className="text-sm text-[var(--text-primary)] px-1">{user.email || (isBn ? "—" : "—")}</p>
              )}
            </div>
            {editMode && (
              <div className="flex items-center gap-2 pt-1">
                <button type="button" onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer">
                  <Save className="w-3.5 h-3.5" />
                  {isBn ? "সংরক্ষণ করুন" : "Save changes"}
                </button>
                <button type="button" onClick={handleCancel}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border ${borderClass} hover:bg-[var(--bg-surface)] transition-colors cursor-pointer text-[var(--text-muted)]`}>
                  <X className="w-3.5 h-3.5" />
                  {isBn ? "বাতিল করুন" : "Cancel"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── OTP Phone Verification ── */}
        {!user.isPhoneVerified && (
          <div className={`rounded-2xl p-5 border border-orange-200/60 dark:border-orange-700/40 bg-orange-50 dark:bg-orange-950/30 mb-5`}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4" />
                  {isBn ? "মোবাইল নম্বর ভেরিফাই করুন" : "Verify Your Mobile Number"}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-500">
                  {isBn ? "ক্রেডিট পেতে মোবাইল নম্বরে OTP পাঠিয়ে ভেরিফাই করুন।" : "Verify your number via OTP to unlock your free credits."}
                </p>
              </div>
              {/* Demo button — simulates OTP success */}
              <button type="button" onClick={simulatePhoneVerification}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition-colors cursor-pointer shrink-0">
                {isBn ? "OTP পাঠান (ডেমো)" : "Send OTP (Demo)"}
              </button>
            </div>
          </div>
        )}

        {/* ── Lawyer-specific: Bar Council & Verification ── */}
        {isLawyer && user.lawyerProfile && (
          <div className={`rounded-2xl p-6 border ${borderClass} bg-[var(--bg-card)] mb-5`}>
            <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
              <Gavel className="w-3.5 h-3.5 text-amber-500" />
              {isBn ? "বার কাউন্সিল তথ্য ও ভেরিফিকেশন" : "Bar Council & Verification"}
            </h3>

            {/* Verification Status Banner */}
            {verificationStatus === "pending" ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200/60 dark:border-yellow-700/40 mb-5">
                <span className="text-xl leading-none mt-0.5">🟡</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300 mb-1">
                    {isBn ? "ভেরিফিকেশন প্রক্রিয়াধীন" : "Verification Pending"}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 leading-relaxed">
                    {isBn
                      ? "আমাদের টিম আপনার বার কাউন্সিল এনরোলমেন্ট নম্বর যাচাই করছে। সাধারণত ২৪–৪৮ ঘণ্টার মধ্যে সম্পন্ন হয়।"
                      : "Our team is verifying your Bar Council enrollment number. This usually takes 24–48 hours."}
                  </p>
                </div>
              </div>
            ) : verificationStatus === "verified" ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-700/40 mb-5">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {isBn ? "🟢 যাচাইকৃত অ্যাডভোকেট" : "🟢 Verified Advocate"}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">
                    {isBn ? "আপনার বার কাউন্সিল সনদ সফলভাবে যাচাই হয়েছে।" : "Your Bar Council credentials have been successfully verified."}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Bar Council Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                  {isBn ? "বার কাউন্সিল এনরোলমেন্ট নম্বর" : "Bar Council Enrollment No."}
                </label>
                <p className="text-sm font-mono text-[var(--text-primary)] px-1">{user.lawyerProfile.barCouncilNo}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                  {isBn ? "বার সমিতি" : "Bar Association"}
                </label>
                <p className="text-sm text-[var(--text-primary)] px-1">{user.lawyerProfile.barAssociation}</p>
              </div>
              {user.lawyerProfile.chamberName && (
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                    {isBn ? "চেম্বার / অফিস" : "Chamber / Office"}
                  </label>
                  <p className="text-sm text-[var(--text-primary)] px-1">{user.lawyerProfile.chamberName}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Enterprise Organization Details ── */}
        {user.enterpriseProfile && (
          <div className={`rounded-2xl p-6 border ${borderClass} bg-[var(--bg-card)] mb-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-500" />
                {isBn ? "কর্পোরেট এন্টারপ্রাইজ তথ্য" : "Enterprise Organization"}
              </h3>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                Verified RJSC Corporate
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                  {isBn ? "কোম্পানির নাম" : "Company Name"}
                </label>
                <p className="text-sm font-semibold text-[var(--text-primary)] px-1">{user.enterpriseProfile.companyName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                    {isBn ? "আরজেএসসি নিবন্ধন" : "RJSC Registration"}
                  </label>
                  <p className="text-xs font-mono text-[var(--text-primary)] px-1">{user.enterpriseProfile.registrationNo}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                    {isBn ? "করপোরেট টিআইএন" : "Corporate TIN"}
                  </label>
                  <p className="text-xs font-mono text-[var(--text-primary)] px-1">{user.enterpriseProfile.tinNo}</p>
                </div>
              </div>

              {user.enterpriseProfile.referCode && (
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                    {isBn ? "কোম্পানি রেফারেল / ইনভাইট কোড" : "Company Invite Code"}
                  </label>
                  <p className="text-xs font-mono font-bold text-[var(--text-primary)] px-1">{user.enterpriseProfile.referCode}</p>
                </div>
              )}

              <div className="pt-2">
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
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>
                    {user.role === "enterprise_admin" ||
                    (user.role === "enterprise" && !user.enterpriseProfile?.isTeamMember)
                      ? isBn
                        ? "এন্টারপ্রাইজ অ্যাডমিন পোর্টালে যান →"
                        : "Open Enterprise Admin Portal →"
                      : isBn
                      ? "এন্টারপ্রাইজ মেম্বার ওয়ার্কস্পেসে যান →"
                      : "Open Enterprise Workspace →"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Account Security ── */}
        <div className={`rounded-2xl p-6 border ${borderClass} bg-[var(--bg-card)] mb-5`}>
          <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            {isBn ? "অ্যাকাউন্ট সুরক্ষা" : "Account Security"}
          </h3>
          <button type="button"
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${borderClass} hover:bg-[var(--bg-surface)] transition-colors cursor-pointer text-sm text-[var(--text-primary)]`}>
            <span>{isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}</span>
            <span className="text-[var(--text-muted)] text-xs">→</span>
          </button>
        </div>

        {/* ── Sign Out ── */}
        <div className="pt-1 pb-6">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-all font-semibold text-sm cursor-pointer shadow-sm active:scale-[0.99]`}
          >
            <LogOut className="w-4 h-4" />
            <span>{isBn ? "অ্যাকাউন্ট থেকে লগআউট করুন" : "Sign Out of Account"}</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
