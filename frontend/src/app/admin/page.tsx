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
  getAdminPendingWithdrawals,
  markAdminWithdrawalPaid,
  getAdminPendingPayments,
  approveAdminPayment,
  AdminDashboardStats,
  AdminPendingLawyer,
  WithdrawalRequest,
  AdminPendingPayment,
} from "@/lib/apiServices";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  RefreshCw,
  Gavel,
  CreditCard,
  BarChart3,
  Activity,
  Users,
  Building2,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { user, approveLawyerByAdmin, rejectLawyerByAdmin } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [activeTab, setActiveTab] = useState<"dashboard" | "lawyers" | "withdrawals" | "payments">("dashboard");
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [lawyersList, setLawyersList] = useState<AdminPendingLawyer[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<WithdrawalRequest[]>([]);
  const [paymentsList, setPaymentsList] = useState<AdminPendingPayment[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modals
  const [rejectingLawyerId, setRejectingLawyerId] = useState<string | number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [payingWithdrawalId, setPayingWithdrawalId] = useState<string | number | null>(null);
  const [payoutTrxId, setPayoutTrxId] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, lawyersRes, withRes, payRes] = await Promise.allSettled([
        getAdminDashboardStats(),
        getAdminPendingLawyers(),
        getAdminPendingWithdrawals(),
        getAdminPendingPayments(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value) setStats(statsRes.value);
      if (lawyersRes.status === "fulfilled" && Array.isArray(lawyersRes.value)) setLawyersList(lawyersRes.value);
      if (withRes.status === "fulfilled" && Array.isArray(withRes.value)) setWithdrawalsList(withRes.value);
      if (payRes.status === "fulfilled" && Array.isArray(payRes.value)) setPaymentsList(payRes.value);

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
      await approveLawyer(lawyer.id).catch(() => {});
      setLawyersList((prev) => prev.map((l) => (l.id === lawyer.id ? { ...l, status: "verified" } : l)));
      setActionMessage(`✓ Advocate ${lawyer.full_name} approved successfully!`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Approval failed");
      setActionMessage(null);
    }
  };

  const handleApprovePayment = async (id: string | number) => {
    try {
      await approveAdminPayment(id);
      setPaymentsList((prev) => prev.filter((p) => p.payment_id !== id));
      setActionMessage(isBn ? "পেমেন্ট অনুমোদিত হয়েছে এবং ক্রেডিট যুক্ত হয়েছে।" : "Payment approved and credits granted.");
      setTimeout(() => setActionMessage(null), 4000);
      loadData(); // Refresh stats
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to approve payment");
    }
  };

  // Computed Stats
  const totalUsers = stats?.users.total || 0;
  const generalUsers = stats?.users.general || 0;
  const lawyerUsers = stats?.users.lawyers || 0;
  const entUsers = (stats?.users.enterprise_admins || 0) + (stats?.users.enterprise_members || 0);

  if (!user || String(user.role).toUpperCase() !== "ADMIN") return null;

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
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-(--text-primary)">
              {isBn ? "সেন্ট্রাল কন্ট্রোল প্যানেল" : "Central Control Panel"}
            </h1>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-(--text-primary)/15 hover:bg-(--text-primary)/5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isBn ? "সিঙ্ক ডেটা" : "Sync Data"}</span>
          </button>
        </div>

        {/* Global Feedback */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-(--text-primary)/10 pb-3 overflow-x-auto">
          <button onClick={() => setActiveTab("dashboard")} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === "dashboard" ? "bg-(--accent-solid) text-(--accent-contrast)" : "text-(--text-muted) hover:bg-(--text-primary)/5"}`}>
            <BarChart3 className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button onClick={() => setActiveTab("payments")} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === "payments" ? "bg-(--accent-solid) text-(--accent-contrast)" : "text-(--text-muted) hover:bg-(--text-primary)/5"}`}>
            <CreditCard className="w-3.5 h-3.5" /> Payments
            {paymentsList.length > 0 && <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[9px]">{paymentsList.length}</span>}
          </button>
          <button onClick={() => setActiveTab("lawyers")} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === "lawyers" ? "bg-(--accent-solid) text-(--accent-contrast)" : "text-(--text-muted) hover:bg-(--text-primary)/5"}`}>
            <Gavel className="w-3.5 h-3.5" /> Lawyers
          </button>
          <button onClick={() => setActiveTab("withdrawals")} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === "withdrawals" ? "bg-(--accent-solid) text-(--accent-contrast)" : "text-(--text-muted) hover:bg-(--text-primary)/5"}`}>
            <Wallet className="w-3.5 h-3.5" /> Payouts
          </button>
        </div>

        {/* ── TAB: DASHBOARD & GRAPHS ── */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs">
                <div className="flex items-center justify-between text-(--text-muted) mb-2"><span className="text-xs font-semibold">Total Users</span> <Users className="w-4 h-4 text-blue-500" /></div>
                <p className="text-3xl font-mono font-bold text-(--text-primary)">{totalUsers}</p>
              </div>
              <div className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs">
                <div className="flex items-center justify-between text-(--text-muted) mb-2"><span className="text-xs font-semibold">Active Lawyers</span> <ShieldCheck className="w-4 h-4 text-emerald-500" /></div>
                <p className="text-3xl font-mono font-bold text-emerald-600">{lawyerUsers}</p>
              </div>
              <div className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs">
                <div className="flex items-center justify-between text-(--text-muted) mb-2"><span className="text-xs font-semibold">Pending Approvals</span> <Activity className="w-4 h-4 text-amber-500" /></div>
                <p className="text-3xl font-mono font-bold text-amber-600">{lawyersList.length + paymentsList.length + withdrawalsList.length}</p>
              </div>
              <div className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs">
                <div className="flex items-center justify-between text-(--text-muted) mb-2"><span className="text-xs font-semibold">Enterprises</span> <Building2 className="w-4 h-4 text-purple-500" /></div>
                <p className="text-3xl font-mono font-bold text-purple-600">{entUsers}</p>
              </div>
            </div>

            {/* Platform Usage Graph (Pure CSS) */}
            <div className="p-6 rounded-3xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-(--text-primary) flex items-center gap-2"><BarChart3 className="w-4 h-4 text-indigo-500" /> User Demographics</h3>
                <p className="text-xs text-(--text-muted) mt-0.5">Distribution of accounts across the platform.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-(--text-primary)">General Users</span> <span className="font-mono">{generalUsers}</span></div>
                  <div className="w-full bg-(--bg-surface) h-3 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(generalUsers / totalUsers) * 100 || 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-(--text-primary)">Lawyers</span> <span className="font-mono">{lawyerUsers}</span></div>
                  <div className="w-full bg-(--bg-surface) h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(lawyerUsers / totalUsers) * 100 || 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-(--text-primary)">Enterprise Members</span> <span className="font-mono">{entUsers}</span></div>
                  <div className="w-full bg-(--bg-surface) h-3 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(entUsers / totalUsers) * 100 || 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: PAYMENTS ── */}
        {activeTab === "payments" && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-base font-semibold text-(--text-primary)">Pending bKash Payments</h2>
            <div className="space-y-3">
              {paymentsList.map((p) => (
                <div key={p.payment_id} className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-lg text-(--text-primary)">৳{p.amount_bdt}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">{p.total_credits} Credits</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">{p.payer_type}</span>
                    </div>
                    <p className="text-xs text-(--text-muted)">Ref: <span className="font-mono text-(--text-primary)">{p.reference_code}</span></p>
                    <p className="text-xs text-(--text-muted)">TrxID: <span className="font-mono text-emerald-600">{p.trx_id}</span> from {p.sender_number}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprovePayment(p.payment_id)} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm">
                      Approve Payment
                    </button>
                  </div>
                </div>
              ))}
              {paymentsList.length === 0 && <p className="text-xs text-(--text-muted) py-8 text-center border border-dashed rounded-xl">No pending payments.</p>}
            </div>
          </div>
        )}

        {/* ── TAB: LAWYERS ── */}
        {activeTab === "lawyers" && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-base font-semibold text-(--text-primary)">Bar Council Verification Queue</h2>
            <div className="space-y-3">
              {lawyersList.map((lawyer) => (
                <div key={lawyer.id} className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <h3 className="font-bold text-(--text-primary)">{lawyer.full_name}</h3>
                    <p className="text-xs text-(--text-muted)">Bar ID: {lawyer.bar_council_id} · Exp: {lawyer.experience_years} Years</p>
                    <p className="text-xs text-(--text-muted)">{lawyer.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveLawyer(lawyer)} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">Approve</button>
                    <button onClick={() => { setRejectingLawyerId(lawyer.id); setRejectReason(""); }} className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 cursor-pointer">Reject</button>
                  </div>
                </div>
              ))}
              {lawyersList.length === 0 && <p className="text-xs text-(--text-muted) py-8 text-center border border-dashed rounded-xl">No pending lawyers.</p>}
            </div>
          </div>
        )}

        {/* ── TAB: WITHDRAWALS ── */}
        {activeTab === "withdrawals" && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-base font-semibold text-(--text-primary)">Lawyer Payout Requests</h2>
            <div className="space-y-3">
              {withdrawalsList.map((w) => (
                <div key={w.id} className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <p className="font-bold text-(--text-primary)">৳{w.amount_bdt} · {w.account_holder_name}</p>
                    <p className="text-xs text-(--text-muted)">bKash: {w.bkash_number} · Status: {w.status}</p>
                  </div>
                  <div className="flex gap-2">
                    {w.status === "PENDING" && (
                      <button onClick={() => { setPayingWithdrawalId(w.id); setPayoutTrxId(""); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">Mark Paid</button>
                    )}
                  </div>
                </div>
              ))}
              {withdrawalsList.length === 0 && <p className="text-xs text-(--text-muted) py-8 text-center border border-dashed rounded-xl">No pending withdrawals.</p>}
            </div>
          </div>
        )}

        {/* MODALS (Reject Lawyer, Mark Paid) */}
        {rejectingLawyerId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-(--text-primary)">Reject Lawyer</h3>
              <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason..." className="w-full p-3 rounded-xl text-xs border bg-(--bg-surface) outline-none" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setRejectingLawyerId(null)} className="px-4 py-2 text-xs font-semibold text-(--text-muted)">Cancel</button>
                <button onClick={async () => { await rejectLawyerByAdmin(rejectingLawyerId, rejectReason); setLawyersList(prev => prev.filter(l => l.id !== rejectingLawyerId)); setRejectingLawyerId(null); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white">Confirm</button>
              </div>
            </div>
          </div>
        )}

        {payingWithdrawalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-(--text-primary)">Mark Paid (bKash TrxID)</h3>
              <input type="text" value={payoutTrxId} onChange={(e) => setPayoutTrxId(e.target.value)} placeholder="BK992819XX" className="w-full p-3 rounded-xl text-xs font-mono border bg-(--bg-surface) outline-none" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setPayingWithdrawalId(null)} className="px-4 py-2 text-xs font-semibold text-(--text-muted)">Cancel</button>
                <button onClick={async () => { await markAdminWithdrawalPaid(payingWithdrawalId, payoutTrxId); setWithdrawalsList(prev => prev.map(w => w.id === payingWithdrawalId ? { ...w, status: "PAID" } : w)); setPayingWithdrawalId(null); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white disabled:opacity-50" disabled={!payoutTrxId}>Confirm</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}