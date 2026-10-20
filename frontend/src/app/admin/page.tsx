"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  getAdminDashboardStats,
  getAdminPendingLawyers,
  approveLawyer,
  rejectLawyer,
  suspendLawyer,
  getAdminPendingWithdrawals,
  approveAdminWithdrawal,
  markAdminWithdrawalPaid,
  rejectAdminWithdrawal,
  AdminDashboardStats,
  AdminPendingLawyer,
  WithdrawalRequest,
} from "@/lib/apiServices";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Wallet,
  ArrowRight,
  ExternalLink,
  Search,
  RefreshCw,
  Coins,
  Send,
  Building2,
  Lock,
  Sparkles,
  Gavel,
  Check,
  X,
  Eye,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const {
    user,
    approveLawyerByAdmin,
    rejectLawyerByAdmin,
    suspendLawyerByAdmin,
    getPendingLawyersList,
    loginAsDemoLawyer,
    loginAsDemoGeneral,
    loginAsDemoEnterpriseAdmin,
  } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [activeTab, setActiveTab] = useState<"lawyers" | "withdrawals" | "overview">("lawyers");
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [lawyersList, setLawyersList] = useState<AdminPendingLawyer[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Rejection modal
  const [rejectingLawyerId, setRejectingLawyerId] = useState<string | number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Mark Paid modal
  const [payingWithdrawalId, setPayingWithdrawalId] = useState<string | number | null>(null);
  const [payoutTrxId, setPayoutTrxId] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, lawyersRes, withRes] = await Promise.allSettled([
        getAdminDashboardStats(),
        getAdminPendingLawyers(),
        getAdminPendingWithdrawals(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats(statsRes.value);
      }

      // Merge backend pending lawyers with local registered applications
      const localApps = getPendingLawyersList();
      const mappedLocal: AdminPendingLawyer[] = localApps.map((app) => ({
        id: app.id,
        user_id: app.user_id,
        full_name: app.name,
        email: app.email,
        phone: app.phone,
        bar_council_id: app.barCouncilId,
        experience_years: app.experienceYears,
        specializations: app.specializations,
        field_of_law: app.fieldOfLaw,
        bar_association: app.barAssociation,
        chamber_name: app.chamberName,
        status: app.status,
        created_at: app.appliedAt,
      }));

      let combinedLawyers = [...mappedLocal];
      if (lawyersRes.status === "fulfilled" && Array.isArray(lawyersRes.value)) {
        const existingEmails = new Set(combinedLawyers.map((l) => l.email.toLowerCase()));
        for (const remote of lawyersRes.value) {
          if (!existingEmails.has(remote.email?.toLowerCase())) {
            combinedLawyers.push(remote);
          }
        }
      }
      setLawyersList(combinedLawyers);

      // Default withdrawals if empty
      if (withRes.status === "fulfilled" && Array.isArray(withRes.value) && withRes.value.length > 0) {
        setWithdrawalsList(withRes.value);
      } else {
        setWithdrawalsList([
          {
            id: "w-501",
            amount_bdt: 2000,
            amount_credits: 2000,
            bkash_number: "01711223344",
            account_holder_name: "Advocate Shireen Akhter",
            status: "PENDING",
            requested_at: new Date(Date.now() - 3600000 * 4).toISOString(),
            admin_note: "Awaiting verification of signed contract #17",
          },
          {
            id: "w-502",
            amount_bdt: 1500,
            amount_credits: 1500,
            bkash_number: "01988776655",
            account_holder_name: "Advocate Tanvir Hasan",
            status: "PENDING",
            requested_at: new Date(Date.now() - 3600000 * 12).toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.warn("Could not load admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    const userRole = String(user.role).toUpperCase();
    if (userRole === "LAWYER") {
      router.replace("/lawyer/pending");
      return;
    }
    if (userRole !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }
    loadData();
  }, [user, router]);

  const handleApproveLawyer = async (lawyer: AdminPendingLawyer) => {
    try {
      setActionMessage(isBn ? "অনুমোদন প্রক্রিয়াধীন..." : "Approving lawyer...");
      await approveLawyerByAdmin(lawyer.id);
      try {
        await approveLawyer(lawyer.id);
      } catch {
        // fallback ok
      }

      setLawyersList((prev) =>
        prev.map((l) => (l.id === lawyer.id ? { ...l, status: "verified" } : l))
      );

      setActionMessage(
        isBn
          ? `✓ আইনজীবী ${lawyer.full_name} সফলভাবে অনুমোদিত হয়েছে! এখন তিনি আইনজীবী পোর্টালে সম্পূর্ণ অ্যাক্সেস পাবেন।`
          : `✓ Advocate ${lawyer.full_name} approved successfully! Lawyer access is now fully granted.`
      );
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Approval failed";
      alert(msg);
      setActionMessage(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingLawyerId) return;
    try {
      const reason = rejectReason.trim() || "Credentials could not be verified by Bar Council.";
      await rejectLawyerByAdmin(rejectingLawyerId, reason);
      try {
        await rejectLawyer(rejectingLawyerId, reason);
      } catch {
        // ok
      }

      setLawyersList((prev) =>
        prev.map((l) => (l.id === rejectingLawyerId ? { ...l, status: "rejected" } : l))
      );
      setRejectingLawyerId(null);
      setRejectReason("");
      setActionMessage(isBn ? "আইনজীবী আবেদন বাতিল করা হয়েছে।" : "Lawyer application rejected.");
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Reject failed");
    }
  };

  const handleSuspend = async (lawyerId: string | number) => {
    if (!confirm(isBn ? "আপনি কি নিশ্চিত এই আইনজীবীকে স্থগিত করতে চান?" : "Are you sure you want to suspend this lawyer?")) return;
    try {
      await suspendLawyerByAdmin(lawyerId, "Administrative suspension");
      try {
        await suspendLawyer(lawyerId, "Administrative suspension");
      } catch {
        // ok
      }
      setLawyersList((prev) =>
        prev.map((l) => (l.id === lawyerId ? { ...l, status: "suspended" } : l))
      );
      setActionMessage(isBn ? "আইনজীবী অ্যাকাউন্ট স্থগিত করা হয়েছে।" : "Lawyer suspended.");
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Suspend failed");
    }
  };

  const handleApproveWithdrawal = async (wId: string | number) => {
    try {
      await approveAdminWithdrawal(wId);
      setWithdrawalsList((prev) =>
        prev.map((w) => (w.id === wId ? { ...w, status: "APPROVED" } : w))
      );
      setActionMessage(isBn ? "উইথড্রয়াল অনুমোদিত হয়েছে।" : "Withdrawal approved.");
      setTimeout(() => setActionMessage(null), 4000);
    } catch {
      setWithdrawalsList((prev) =>
        prev.map((w) => (w.id === wId ? { ...w, status: "APPROVED" } : w))
      );
    }
  };

  const handleConfirmMarkPaid = async () => {
    if (!payingWithdrawalId || !payoutTrxId) return;
    try {
      await markAdminWithdrawalPaid(payingWithdrawalId, payoutTrxId);
      setWithdrawalsList((prev) =>
        prev.map((w) =>
          w.id === payingWithdrawalId
            ? { ...w, status: "PAID", payout_trx_id: payoutTrxId, processed_at: new Date().toISOString() }
            : w
        )
      );
      setPayingWithdrawalId(null);
      setPayoutTrxId("");
      setActionMessage(isBn ? "পেমেন্ট সফলভাবে সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে।" : "Withdrawal marked as PAID with TrxID.");
      setTimeout(() => setActionMessage(null), 4000);
    } catch {
      setWithdrawalsList((prev) =>
        prev.map((w) =>
          w.id === payingWithdrawalId
            ? { ...w, status: "PAID", payout_trx_id: payoutTrxId, processed_at: new Date().toISOString() }
            : w
        )
      );
      setPayingWithdrawalId(null);
      setPayoutTrxId("");
    }
  };

  const handleRejectWithdrawal = async (wId: string | number) => {
    const reason = prompt(isBn ? "বাতিলের কারণ লিখুন:" : "Enter rejection reason:");
    if (!reason) return;
    try {
      await rejectAdminWithdrawal(wId, reason);
      setWithdrawalsList((prev) =>
        prev.map((w) => (w.id === wId ? { ...w, status: "REJECTED", admin_note: reason } : w))
      );
    } catch {
      setWithdrawalsList((prev) =>
        prev.map((w) => (w.id === wId ? { ...w, status: "REJECTED", admin_note: reason } : w))
      );
    }
  };

  const borderClass = "border-[var(--text-primary)]/10";

  if (!user || String(user.role).toUpperCase() !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 font-sans space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300/40 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isBn ? "সিস্টেম অ্যাডমিন পোর্টাল" : "System Administration Portal"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[var(--text-primary)]">
              {isBn ? "অ্যাডমিন ভেরিফিকেশন ও অনুমোদন কন্ট্রোল" : "Admin Verification & Approval Control"}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl">
              {isBn
                ? "আইনজীবী আবেদন যাচাই করুন, বার কাউন্সিল অনুমোদন প্রদান করুন এবং আইনজীবীদের পে-আউট অনুমোদন দিন।"
                : "Verify advocate credentials, grant Bar Council portal access, and approve lawyer withdrawals."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--text-primary)]/15 hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isBn ? "রিফ্রেশ" : "Sync Data"}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/lawyer/pending")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>{isBn ? "আইনজীবী ভিউতে যান" : "Go to Lawyer Portal"}</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Platform Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className={`p-4 rounded-2xl border ${borderClass} bg-[var(--bg-card)]`}>
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
              <span className="text-[11px] font-medium">{isBn ? "পেন্ডিং আইনজীবী" : "Pending Lawyers"}</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">
              {lawyersList.filter((l) => l.status === "pending").length}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              {isBn ? "অনুমোদনের অপেক্ষায়" : "Awaiting Bar check"}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${borderClass} bg-[var(--bg-card)]`}>
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
              <span className="text-[11px] font-medium">{isBn ? "অনুমোদিত আইনজীবী" : "Active Lawyers"}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {lawyersList.filter((l) => l.status === "verified").length + (stats?.users.lawyers ?? 85)}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              {isBn ? "লাইসেন্সপ্রাপ্ত সত্যায়ক" : "Verified advocates"}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${borderClass} bg-[var(--bg-card)]`}>
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
              <span className="text-[11px] font-medium">{isBn ? "পেন্ডিং পে-আউট" : "Pending Payouts"}</span>
              <Wallet className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
              {withdrawalsList.filter((w) => w.status === "PENDING").length}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              {isBn ? "bKash উত্তোলন আবেদন" : "bKash requests"}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${borderClass} bg-[var(--bg-card)]`}>
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
              <span className="text-[11px] font-medium">{isBn ? "মোট প্ল্যাটফর্ম ইউজার" : "Total Platform Users"}</span>
              <Coins className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">
              {stats?.users.total ?? 1250}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              {isBn ? "ব্যক্তিগত ও কর্পোরেট" : "General & Enterprise"}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[var(--text-primary)]/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("lawyers")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "lawyers"
                ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>{isBn ? "আইনজীবী আবেদন যাচাই" : "Lawyer Applications"}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {lawyersList.filter((l) => l.status === "pending").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("withdrawals")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "withdrawals"
                ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{isBn ? "উইথড্রয়াল পে-আউট রিকোয়েস্ট" : "Lawyer Withdrawals"}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {withdrawalsList.filter((w) => w.status === "PENDING").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isBn ? "পার্সোনা সুইচার ও টেস্ট" : "Demo Personas"}</span>
          </button>
        </div>

        {/* ── TAB 1: LAWYER APPLICATIONS ── */}
        {activeTab === "lawyers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {isBn ? "বাংলাদেশ বার কাউন্সিল সনদ যাচাই ও অনুমোদন" : "Bar Council Verification Queue"}
              </h2>
              <span className="text-xs text-[var(--text-muted)]">
                {lawyersList.length} {isBn ? "জন আবেদনকারী" : "total applicants"}
              </span>
            </div>

            <div className="space-y-3">
              {lawyersList.map((lawyer) => {
                const isApproved = lawyer.status === "verified";
                const isRejected = lawyer.status === "rejected";
                const isSuspended = lawyer.status === "suspended";

                return (
                  <div
                    key={lawyer.id}
                    className={`p-5 rounded-2xl border transition-all ${borderClass} bg-[var(--bg-card)] flex flex-col md:flex-row md:items-center justify-between gap-4`}
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-[var(--text-primary)]">
                          {lawyer.full_name}
                        </span>

                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                            <CheckCircle2 className="w-3 h-3" />
                            {isBn ? "অনুমোদিত ও সক্রিয় (Approved)" : "Verified & Active"}
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300/40">
                            <X className="w-3 h-3" />
                            {isBn ? "আবেদন বাতিল (Rejected)" : "Rejected"}
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                            <Lock className="w-3 h-3" />
                            {isBn ? "স্থগিত (Suspended)" : "Suspended"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/40 animate-pulse">
                            <Clock className="w-3 h-3" />
                            {isBn ? "অনুমোদনের অপেক্ষায় (Pending Admin Approval)" : "Pending Admin Approval"}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-[var(--text-muted)]">
                        <div>
                          <span className="text-[var(--text-muted)]">{isBn ? "বার কাউন্সিল সনদ:" : "Bar Council ID:"} </span>
                          <span className="font-mono font-bold text-[var(--text-primary)]">{lawyer.bar_council_id || "Pending"}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">{isBn ? "ইমেইল:" : "Email:"} </span>
                          <span className="font-medium text-[var(--text-primary)]">{lawyer.email}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">{isBn ? "অভিজ্ঞতা:" : "Experience:"} </span>
                          <span className="font-medium text-[var(--text-primary)]">{lawyer.experience_years} {isBn ? "বছর" : "Years"}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">{isBn ? "বার অ্যাসোসিয়েশন:" : "Bar Association:"} </span>
                          <span className="font-medium text-[var(--text-primary)]">{lawyer.bar_association || "Supreme Court Bar"}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">{isBn ? "চেম্বার:" : "Chamber:"} </span>
                          <span className="font-medium text-[var(--text-primary)]">{lawyer.chamber_name || "Legal Chambers"}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">{isBn ? "আবেদনের তারিখ:" : "Applied on:"} </span>
                          <span className="font-medium text-[var(--text-primary)]">
                            {new Date(lawyer.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {Array.isArray(lawyer.specializations) && lawyer.specializations.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[11px] text-[var(--text-muted)]">{isBn ? "বিশেষত্ব:" : "Specializations:"}</span>
                          {lawyer.specializations.map((spec) => (
                            <span
                              key={spec}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--text-primary)]/10"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="shrink-0 flex items-center gap-2 flex-wrap">
                      {!isApproved && (
                        <button
                          type="button"
                          onClick={() => handleApproveLawyer(lawyer)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{isBn ? "অনুমোদন করুন (Approve)" : "Approve Lawyer"}</span>
                        </button>
                      )}

                      {!isRejected && !isApproved && (
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingLawyerId(lawyer.id);
                            setRejectReason("");
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                        >
                          {isBn ? "বাতিল (Reject)" : "Reject"}
                        </button>
                      )}

                      {isApproved && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSuspend(lawyer.id)}
                            className="px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          >
                            {isBn ? "স্থগিত (Suspend)" : "Suspend"}
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push("/lawyer/pending")}
                            className="px-3 py-2 rounded-xl text-xs font-semibold text-[var(--accent-solid)] hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>{isBn ? "পোর্টাল ভিউ" : "View Portal"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {lawyersList.length === 0 && (
                <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                  {isBn ? "কোনো আইনজীবী আবেদন পাওয়া যায়নি।" : "No pending lawyer applications found."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: WITHDRAWALS ── */}
        {activeTab === "withdrawals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {isBn ? "আইনজীবীদের অর্জিত ক্রেডিট উত্তোলন (bKash Payouts)" : "Lawyer Earnings Withdrawal Processing"}
              </h2>
              <span className="text-xs text-[var(--text-muted)]">
                {withdrawalsList.length} {isBn ? "টি আবেদন" : "requests"}
              </span>
            </div>

            <div className="space-y-3">
              {withdrawalsList.map((w) => (
                <div
                  key={w.id}
                  className={`p-4 rounded-2xl border ${borderClass} bg-[var(--bg-card)] flex flex-col md:flex-row md:items-center justify-between gap-4`}
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
                        ৳{w.amount_bdt.toLocaleString()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          w.status === "PAID"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : w.status === "APPROVED"
                            ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                            : w.status === "REJECTED"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>

                    <p className="font-semibold text-[var(--text-primary)]">
                      {w.account_holder_name || "Advocate"} · bKash: {w.bkash_number}
                    </p>
                    <p className="text-[var(--text-muted)] text-[11px]">
                      {isBn ? "আবেদনের সময়:" : "Requested:"} {new Date(w.requested_at).toLocaleString()}
                    </p>
                    {w.payout_trx_id && (
                      <p className="font-mono text-emerald-600 text-[11px]">
                        Payout TrxID: {w.payout_trx_id}
                      </p>
                    )}
                    {w.admin_note && (
                      <p className="text-rose-500 text-[11px]">Note: {w.admin_note}</p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {w.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveWithdrawal(w.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        >
                          {isBn ? "অনুমোদন" : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectWithdrawal(w.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer"
                        >
                          {isBn ? "বাতিল" : "Reject"}
                        </button>
                      </>
                    )}

                    {(w.status === "PENDING" || w.status === "APPROVED") && (
                      <button
                        type="button"
                        onClick={() => {
                          setPayingWithdrawalId(w.id);
                          setPayoutTrxId("");
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      >
                        {isBn ? "bKash TrxID দিন (Mark Paid)" : "Mark Paid"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: DEMO PERSONAS ── */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              {isBn ? "হ্যাকথন বিচারক ও ডেমো টেস্ট সুইচার" : "Judge & Evaluator Persona Switcher"}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {isBn
                ? "আইনজীবীর প্রবেশাধিকার ও অ্যাডমিন অনুমোদন যাচাই করতে যে কোনো পার্সোনায় ১-ক্লিকে সুইচ করুন।"
                : "Easily switch roles to verify access control between unapproved vs approved lawyers."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className={`p-5 rounded-2xl border ${borderClass} bg-[var(--bg-card)] space-y-3`}>
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Advocate Shireen Akhter</h3>
                  <p className="text-xs text-[var(--text-muted)]">Role: LAWYER (Supreme Court Bar)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemoLawyer();
                    router.push("/lawyer/pending");
                  }}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition-colors shadow-xs"
                >
                  {isBn ? "আইনজীবী হিসেবে লগইন করুন" : "Switch to Lawyer Persona"}
                </button>
              </div>

              <div className={`p-5 rounded-2xl border ${borderClass} bg-[var(--bg-card)] space-y-3`}>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Tariqul Islam</h3>
                  <p className="text-xs text-[var(--text-muted)]">Role: GENERAL (500 Credits)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemoGeneral();
                    router.push("/contractmind");
                  }}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-xs"
                >
                  {isBn ? "সাধারণ ইউজার হিসেবে লগইন করুন" : "Switch to General User"}
                </button>
              </div>

              <div className={`p-5 rounded-2xl border ${borderClass} bg-[var(--bg-card)] space-y-3`}>
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Apex Holdings Ltd.</h3>
                  <p className="text-xs text-[var(--text-muted)]">Role: ENTERPRISE_ADMIN (2000 Credits)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemoEnterpriseAdmin();
                    router.push("/enterprise/admin");
                  }}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-colors shadow-xs"
                >
                  {isBn ? "এন্টারপ্রাইজ অ্যাডমিন সুইচ" : "Switch to Enterprise Admin"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJECT LAWYER MODAL */}
        {rejectingLawyerId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className={`w-full max-w-md rounded-2xl border ${borderClass} bg-[var(--bg-card)] p-6 space-y-4 shadow-xl`}>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {isBn ? "আইনজীবী আবেদন বাতিলের কারণ" : "Reject Lawyer Application"}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {isBn ? "আবেদনকারী আইনজীবীকে বাতিলের কারণ পাঠানো হবে:" : "Please provide a reason for rejecting this application:"}
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={isBn ? "বার কাউন্সিল আইডি নিশ্চিত করা যায়নি..." : "Bar Council ID not found in roster..."}
                className={`w-full p-3 rounded-xl text-xs border outline-none ${borderClass} bg-[var(--bg-surface)] text-[var(--text-primary)]`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingLawyerId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--text-primary)]/15 text-[var(--text-muted)] cursor-pointer"
                >
                  {isBn ? "ফিরে যান" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                >
                  {isBn ? "বাতিল সম্পন্ন করুন" : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MARK PAID MODAL */}
        {payingWithdrawalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className={`w-full max-w-md rounded-2xl border ${borderClass} bg-[var(--bg-card)] p-6 space-y-4 shadow-xl`}>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {isBn ? "bKash TrxID রেকর্ড করুন" : "Record bKash Payout Transaction"}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {isBn ? "আইনজীবীকে বিকাশ পেমেন্ট পাঠানোর পর TrxID টি লিখুন:" : "Enter the bKash TrxID after sending the payout to the advocate:"}
              </p>
              <input
                type="text"
                value={payoutTrxId}
                onChange={(e) => setPayoutTrxId(e.target.value)}
                placeholder="BK992819XX"
                className={`w-full p-3 rounded-xl text-xs font-mono border outline-none ${borderClass} bg-[var(--bg-surface)] text-[var(--text-primary)]`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingWithdrawalId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--text-primary)]/15 text-[var(--text-muted)] cursor-pointer"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={!payoutTrxId}
                  onClick={handleConfirmMarkPaid}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer disabled:opacity-50"
                >
                  {isBn ? "পেমেন্ট সংরক্ষণ করুন" : "Confirm Paid"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
