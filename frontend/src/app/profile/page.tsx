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
  const { user, simulatePhoneVerification, simulateLawyerVerification, updateUser, logout } = useAuth();
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

  const isLawyer = user.role === "lawyer" || !!user.lawyerProfile;
  const lawyerProfile = user.lawyerProfile || {
    barCouncilNo: isBn ? "প্রদান করা হয়নি" : "Not Provided",
    fieldOfLaw: isBn ? "সাধারণ আইন" : "General Practice",
    barAssociation: isBn ? "বাংলাদেশ বার কাউন্সিল" : "Bangladesh Bar Council",
    chamberName: "",
    verificationStatus: "pending" as const,
  };
  const verificationStatus = lawyerProfile.verificationStatus;
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
      <div className="max-w-2xl mx-auto py-12 px-6 sm:px-8 space-y-10 font-sans">
        {/* Header */}
        <div>
          <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)] mb-1">
            {isBn ? "ব্যক্তিগত অ্যাকাউন্ট" : "Personal Account"}
          </p>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
            {isBn ? "প্রোফাইল" : "Profile"}
          </h1>
        </div>

        {/* ── Avatar & Identity ── */}
        <div className="flex items-center justify-between gap-5 py-2">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-xl font-medium text-[var(--text-muted)] overflow-hidden">
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt="DP" className="w-full h-full object-cover" />
                  : <User className="w-6 h-6 text-[var(--text-muted)]" />
                }
              </div>
              <button
                type="button"
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[var(--accent-solid)] text-[var(--accent-contrast)] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Camera className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1 truncate">{user.name}</h2>
              <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--text-muted)]">
                {/* Role label */}
                {isLawyer ? (
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--text-primary)]">
                    <Gavel className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{isBn ? "আইনজীবী" : "Lawyer"}</span>
                  </span>
                ) : user.role === "enterprise_admin" || (user.role === "enterprise" && !user.enterpriseProfile?.isTeamMember) ? (
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--text-primary)]">
                    <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{isBn ? "এন্টারপ্রাইজ অ্যাডমিন" : "Enterprise Admin"}</span>
                  </span>
                ) : user.role === "enterprise_member" || (user.role === "enterprise" && user.enterpriseProfile?.isTeamMember) ? (
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--text-primary)]">
                    <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{isBn ? "এন্টারপ্রাইজ সদস্য" : "Enterprise Member"}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--text-primary)]">
                    <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{isBn ? "সাধারণ ব্যবহারকারী" : "General User"}</span>
                  </span>
                )}

                <span className="opacity-30">•</span>

                {/* Lawyer verification status */}
                {isLawyer && verificationStatus === "pending" && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80"></span>
                    <span>{isBn ? "ভেরিফিকেশন প্রক্রিয়াধীন" : "Verification Pending"}</span>
                  </span>
                )}
                {isLawyer && verificationStatus === "verified" && (
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--text-primary)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isBn ? "যাচাইকৃত অ্যাডভোকেট" : "Verified Advocate"}</span>
                  </span>
                )}

                <span className="opacity-30">•</span>

                {/* Phone verification status */}
                {user.isPhoneVerified ? (
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--text-muted)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isBn ? "মোবাইল ভেরিফাইড" : "Mobile Verified"}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--text-muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                    <span>{isBn ? "মোবাইল ভেরিফাই বাকি" : "Mobile Unverified"}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setEditMode(!editMode); setDraftName(user.name); setDraftMobile(user.mobile || ""); setDraftEmail(user.email); }}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer shrink-0"
            aria-label="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* ── Personal Info ── */}
        <div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-4">
            {isBn ? "ব্যক্তিগত তথ্য" : "Personal Information"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3.5 sm:gap-y-4 py-1 text-sm">
            {/* Name */}
            <span className="text-[var(--text-muted)] text-[13px]">
              {isBn ? "পুরো নাম" : "Full Name"}
            </span>
            <div className="sm:col-span-2">
              {editMode ? (
                <input type="text" value={draftName} onChange={(e) => setDraftName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md text-sm outline-none border border-[var(--text-primary)]/20 focus:border-[var(--text-primary)]/50 bg-transparent text-[var(--text-primary)]" />
              ) : (
                <span className="font-normal text-[var(--text-primary)]">{user.name}</span>
              )}
            </div>

            {/* Mobile */}
            <span className="text-[var(--text-muted)] text-[13px]">
              {isBn ? "মোবাইল নম্বর" : "Mobile Number"}
            </span>
            <div className="sm:col-span-2">
              {editMode ? (
                <input type="tel" value={draftMobile} onChange={(e) => setDraftMobile(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md text-sm outline-none border border-[var(--text-primary)]/20 focus:border-[var(--text-primary)]/50 bg-transparent text-[var(--text-primary)] font-mono" />
              ) : (
                <span className="font-normal font-mono text-[var(--text-primary)]">{user.mobile || "—"}</span>
              )}
            </div>

            {/* Email */}
            <span className="text-[var(--text-muted)] text-[13px]">
              {isBn ? "ইমেইল" : "Email"}
            </span>
            <div className="sm:col-span-2">
              {editMode ? (
                <input type="email" value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md text-sm outline-none border border-[var(--text-primary)]/20 focus:border-[var(--text-primary)]/50 bg-transparent text-[var(--text-primary)]" />
              ) : (
                <span className="font-normal text-[var(--text-primary)]">{user.email || "—"}</span>
              )}
            </div>

            {editMode && (
              <div className="sm:col-start-2 sm:col-span-2 flex items-center gap-2 pt-1">
                <button type="button" onClick={handleSave}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer">
                  <Save className="w-3.5 h-3.5" />
                  {isBn ? "সংরক্ষণ করুন" : "Save changes"}
                </button>
                <button type="button" onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── OTP Phone Verification Action ── */}
        {!user.isPhoneVerified && (
          <div className="flex items-center justify-between gap-6 py-1">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2 mb-0.5">
                <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>{isBn ? "মোবাইল নম্বর ভেরিফাই করুন" : "Verify Your Mobile Number"}</span>
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {isBn ? "ক্রেডিট পেতে মোবাইল নম্বরে OTP পাঠিয়ে ভেরিফাই করুন।" : "Verify your number via OTP to unlock your free credits."}
              </p>
            </div>
            <button
              type="button"
              onClick={simulatePhoneVerification}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            >
              {isBn ? "নম্বর যাচাই করুন" : "Verify Number"}
            </button>
          </div>
        )}

        {/* ── Lawyer-specific: Bar Council & Verification ── */}
        {isLawyer && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>{isBn ? "বার কাউন্সিল তথ্য ও ভেরিফিকেশন" : "Bar Council & Verification"}</span>
              </h3>
              {verificationStatus === "pending" ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>{isBn ? "পেন্ডিং ভেরিফিকেশন" : "Pending Verification"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-primary)] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isBn ? "যাচাইকৃত অ্যাডভোকেট" : "Verified Advocate"}</span>
                </span>
              )}
            </div>

            {/* Verification Status Banner */}
            {verificationStatus === "pending" ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] mb-4">
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)] mb-0.5">
                      {isBn ? "ভেরিফিকেশন প্রক্রিয়াধীন (অ্যাডমিন পর্যালোচনায়)" : "Verification Pending (Admin Review)"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {isBn
                        ? "আমাদের কমপ্লায়েন্স টিম আপনার বার কাউন্সিল সনদপত্র যাচাই করছে। অনুমোদিত হলে ক্লায়েন্ট চুক্তি যাচাই ও সিলমোহর প্রদানের পূর্ণ অ্যাক্সেস পাবেন।"
                        : "Our compliance team is verifying your Bangladesh Bar Council credentials. Once verified, client contract review and signoff will be unlocked."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => simulateLawyerVerification()}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer shrink-0 flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isBn ? "অনুমোদন টেস্ট করুন" : "Simulate Approval"}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-surface)] mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-[var(--text-muted)]">
                  {isBn ? "বাংলাদেশ বার কাউন্সিল যাচাইকৃত অ্যাডভোকেট। আপনি ক্লায়েন্ট চুক্তি সত্যায়ন করতে পারবেন।" : "Bangladesh Bar Council Verified Advocate. You are authorized to review and sign off contracts."}
                </p>
              </div>
            )}

            {/* Bar Council Fields in clean Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3.5 py-1 text-sm">
              <span className="text-[var(--text-muted)] text-[13px]">
                {isBn ? "এনরোলমেন্ট নম্বর" : "Enrollment No."}
              </span>
              <div className="sm:col-span-2 font-mono text-[var(--text-primary)]">
                {lawyerProfile.barCouncilNo || (isBn ? "প্রদান করা হয়নি" : "Not Provided")}
              </div>

              <span className="text-[var(--text-muted)] text-[13px]">
                {isBn ? "বিশেষজ্ঞতা" : "Specialization"}
              </span>
              <div className="sm:col-span-2 text-[var(--text-primary)]">
                {lawyerProfile.fieldOfLaw || (isBn ? "সাধারণ আইন" : "General Practice")}
              </div>

              <span className="text-[var(--text-muted)] text-[13px]">
                {isBn ? "বার সমিতি" : "Bar Association"}
              </span>
              <div className="sm:col-span-2 text-[var(--text-primary)]">
                {lawyerProfile.barAssociation || (isBn ? "বাংলাদেশ বার কাউন্সিল" : "Bangladesh Bar Council")}
              </div>

              {lawyerProfile.chamberName && (
                <>
                  <span className="text-[var(--text-muted)] text-[13px]">
                    {isBn ? "চেম্বার / অফিস" : "Chamber / Office"}
                  </span>
                  <div className="sm:col-span-2 text-[var(--text-primary)]">
                    {lawyerProfile.chamberName}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Enterprise Organization Details ── */}
        {user.enterpriseProfile && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>{isBn ? "কর্পোরেট এন্টারপ্রাইজ তথ্য" : "Enterprise Organization"}</span>
              </h3>
              <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Verified RJSC Corporate</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3.5 py-1 text-sm">
              <span className="text-[var(--text-muted)] text-[13px]">
                {isBn ? "কোম্পানির নাম" : "Company Name"}
              </span>
              <div className="sm:col-span-2 font-medium text-[var(--text-primary)]">
                {user.enterpriseProfile.companyName}
              </div>

              <span className="text-[var(--text-muted)] text-[13px]">
                {isBn ? "আরজেএসসি নম্বর" : "RJSC Registration"}
              </span>
              <div className="sm:col-span-2 font-mono text-[var(--text-primary)]">
                {user.enterpriseProfile.registrationNo}
              </div>

              <span className="text-[var(--text-muted)] text-[13px]">
                {isBn ? "টিআইএন নম্বর" : "Corporate TIN"}
              </span>
              <div className="sm:col-span-2 font-mono text-[var(--text-primary)]">
                {user.enterpriseProfile.tinNo}
              </div>

              {user.enterpriseProfile.referCode && (
                <>
                  <span className="text-[var(--text-muted)] text-[13px]">
                    {isBn ? "ইনভাইট কোড" : "Invite Code"}
                  </span>
                  <div className="sm:col-span-2 font-mono font-medium text-[var(--text-primary)]">
                    {user.enterpriseProfile.referCode}
                  </div>
                </>
              )}

              <div className="sm:col-start-2 sm:col-span-2 pt-1">
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
                  className="py-1.5 px-3.5 rounded-md text-xs font-medium bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {user.role === "enterprise_admin" ||
                  (user.role === "enterprise" && !user.enterpriseProfile?.isTeamMember)
                    ? isBn
                      ? "অ্যাডমিন পোর্টালে যান →"
                      : "Open Admin Portal →"
                    : isBn
                    ? "মেম্বার ওয়ার্কস্পেসে যান →"
                    : "Open Workspace →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Account Security ── */}
        <div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>{isBn ? "অ্যাকাউন্ট সুরক্ষা" : "Account Security"}</span>
          </h3>
          <button type="button"
            className="flex items-center gap-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
            <span>{isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}</span>
            <span className="text-xs">→</span>
          </button>
        </div>

        {/* ── Sign Out ── */}
        <div className="pt-2 pb-12">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-2 py-1 text-sm text-[var(--text-muted)] hover:text-rose-500 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{isBn ? "অ্যাকাউন্ট থেকে লগআউট করুন" : "Sign Out"}</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
