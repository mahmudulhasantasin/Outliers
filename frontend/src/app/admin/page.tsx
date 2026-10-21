"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // ✅ FIX: Next.js Image component
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
  getAdminUsers,
  getAdminPendingEnterprises,
  approveAdminEnterprise,
  getAdminUserDetail,
  getAdminFinancials,
  AdminDashboardStats,
  AdminPendingLawyer,
  WithdrawalRequest,
  AdminPendingPayment,
  AdminUser,
  AdminPendingEnterprise,
  AdminFinancials,
} from "@/lib/apiServices";
import {
  ShieldAlert, CheckCircle2, Wallet, RefreshCw,
  Gavel, CreditCard, BarChart3, Activity, Users, Building2, 
  X, Eye, Loader2, DollarSign, TrendingUp, TrendingDown, Banknote
} from "lucide-react";

// ✅ Type for User Profile Modal
interface UserDetailData {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  credit_balance: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  enterprise_id: number | null;
  profile_photo_url?: string | null;
  lawyer_profile: {
    bar_council_id: string;
    experience_years: number;
    specializations: string[];
    status: string;
    wallet_balance: number;
  } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, approveLawyerByAdmin, rejectLawyerByAdmin } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [activeTab, setActiveTab] = useState<"dashboard" | "payments" | "lawyers" | "enterprises" | "withdrawals" | "users">("dashboard");
  
  // Data States
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [financials, setFinancials] = useState<AdminFinancials | null>(null);
  const [lawyersList, setLawyersList] = useState<AdminPendingLawyer[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<WithdrawalRequest[]>([]);
  const [paymentsList, setPaymentsList] = useState<AdminPendingPayment[]>([]);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [enterprisesList, setEnterprisesList] = useState<AdminPendingEnterprise[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  
  // Modals
  const [rejectingLawyerId, setRejectingLawyerId] = useState<string | number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [payingWithdrawalId, setPayingWithdrawalId] = useState<string | number | null>(null);
  const [payoutTrxId, setPayoutTrxId] = useState("");

  // User Profile Modal
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetailData | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, finRes, lawyersRes, withRes, payRes, usersRes, entRes] = await Promise.allSettled([
        getAdminDashboardStats(),
        getAdminFinancials(),
        getAdminPendingLawyers(),
        getAdminPendingWithdrawals(),
        getAdminPendingPayments(),
        getAdminUsers(),
        getAdminPendingEnterprises(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value) setStats(statsRes.value);
      if (finRes.status === "fulfilled" && finRes.value) setFinancials(finRes.value);
      if (lawyersRes.status === "fulfilled" && Array.isArray(lawyersRes.value)) setLawyersList(lawyersRes.value);
      if (withRes.status === "fulfilled" && Array.isArray(withRes.value)) setWithdrawalsList(withRes.value);
      if (payRes.status === "fulfilled" && Array.isArray(payRes.value)) setPaymentsList(payRes.value);
      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) setUsersList(usersRes.value);
      if (entRes.status === "fulfilled" && Array.isArray(entRes.value)) setEnterprisesList(entRes.value);

    } catch {
      console.warn("Could not load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (String(user.role).toUpperCase() !== "ADMIN") { router.replace("/dashboard"); return; }
    loadData();
  }, [user, router]);

  const handleViewUser = async (id: number) => {
    setViewingUserId(id);
    setIsFetchingUser(true);
    setUserDetail(null);
    try {
      const detail = await getAdminUserDetail(id);
      setUserDetail(detail);
    } catch {
      alert("Failed to load user profile");
    } finally {
      setIsFetchingUser(false);
    }
  };

  const handleApproveLawyer = async (lawyer: AdminPendingLawyer) => {
    try {
      await approveLawyerByAdmin(lawyer.id);
      await approveLawyer(lawyer.id).catch(() => {});
      setLawyersList((prev) => prev.filter((l) => l.id !== lawyer.id));
      setActionMessage(`✓ Advocate ${lawyer.full_name} approved!`);
      loadData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch { alert("Approval failed"); }
  };

  const handleApprovePayment = async (id: string | number) => {
    try {
      await approveAdminPayment(id);
      setPaymentsList((prev) => prev.filter((p) => p.payment_id !== id));
      setActionMessage(isBn ? "পেমেন্ট অনুমোদিত হয়েছে এবং ক্রেডিট যুক্ত হয়েছে।" : "Payment approved and credits added.");
      loadData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch { alert("Failed to approve payment"); }
  };

  const handleApproveEnterprise = async (id: number) => {
    try {
      await approveAdminEnterprise(id);
      setEnterprisesList((prev) => prev.filter((e) => e.enterprise_id !== id));
      setActionMessage(isBn ? "এন্টারপ্রাইজ অনুমোদিত হয়েছে।" : "Enterprise approved successfully!");
      loadData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch { alert("Failed to approve enterprise"); }
  };

  // Computed Stats
  const totalUsers = stats?.users.total || 0;
  const generalUsers = stats?.users.general || 0;
  const lawyerUsers = stats?.users.lawyers || 0;
  const entUsers = (stats?.users.enterprise_admins || 0) + (stats?.users.enterprise_members || 0);

  const revBdt = financials?.aggregates.total_revenue_bdt || 0;
  const pendingPayouts = financials?.aggregates.pending_payouts_bdt || 0;
  const netPosition = financials?.aggregates.net_platform_position_bdt || 0;

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
          <button onClick={loadData} disabled={isLoading} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-(--text-primary)/15 hover:bg-(--text-primary)/5 transition-colors cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> <span>{isBn ? "সিঙ্ক ডেটা" : "Sync Data"}</span>
          </button>
        </div>

        {/* Global Feedback */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> <span>{actionMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-(--text-primary)/10 pb-3 overflow-x-auto">
          {[
            { id: "dashboard", label: isBn ? "ড্যাশবোর্ড" : "Dashboard", icon: BarChart3 },
            { id: "payments", label: isBn ? "পেমেন্টস" : "Payments", icon: CreditCard, count: paymentsList.length },
            { id: "lawyers", label: isBn ? "আইনজীবী" : "Lawyers", icon: Gavel, count: lawyersList.length },
            { id: "enterprises", label: isBn ? "এন্টারপ্রাইজ" : "Enterprises", icon: Building2, count: enterprisesList.length },
            { id: "withdrawals", label: isBn ? "পে-আউট" : "Payouts", icon: Wallet, count: withdrawalsList.length },
            { id: "users", label: isBn ? "সব ইউজার" : "All Users", icon: Users },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === tab.id ? "bg-(--accent-solid) text-(--accent-contrast)" : "text-(--text-muted) hover:bg-(--text-primary)/5"}`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              {tab.count && tab.count > 0 ? <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[9px]">{tab.count}</span> : null}
            </button>
          ))}
        </div>

        {/* ── TAB: DASHBOARD & GRAPHS ── */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Financial Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs">
                <div className="flex items-center justify-between text-(--text-muted) mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span> 
                  <Banknote className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-mono font-bold text-(--text-primary)">৳ {revBdt.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-600 mt-1 font-semibold">From bKash Top-ups</p>
              </div>
              
              <div className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs">
                <div className="flex items-center justify-between text-(--text-muted) mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Pending Payouts</span> 
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-2xl font-mono font-bold text-rose-600">৳ {pendingPayouts.toLocaleString()}</p>
                <p className="text-[10px] text-(--text-muted) mt-1">Owed to Lawyers</p>
              </div>

              <div className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs">
                <div className="flex items-center justify-between text-(--text-muted) mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Net Position</span> 
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-2xl font-mono font-bold text-indigo-600">৳ {netPosition.toLocaleString()}</p>
                <p className="text-[10px] text-(--text-muted) mt-1">Revenue - Payouts</p>
              </div>

              <div className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs">
                <div className="flex items-center justify-between text-(--text-muted) mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span> 
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-mono font-bold text-(--text-primary)">{totalUsers}</p>
                <p className="text-[10px] text-(--text-muted) mt-1">Registered accounts</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Chart 1: User Demographics */}
              <div className="p-6 rounded-3xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> User Demographics</h3>
                    <p className="text-[11px] text-(--text-muted) mt-0.5">Distribution of roles.</p>
                  </div>
                </div>
                
                {/* Pure CSS Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-32 pt-4 px-2">
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full bg-blue-500 rounded-t-md opacity-80 group-hover:opacity-100 transition-all relative" style={{ height: `${(generalUsers / totalUsers) * 100 || 5}%` }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">{generalUsers}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-(--text-muted)">General</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full bg-emerald-500 rounded-t-md opacity-80 group-hover:opacity-100 transition-all relative" style={{ height: `${(lawyerUsers / totalUsers) * 100 || 5}%` }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">{lawyerUsers}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-(--text-muted)">Lawyers</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full bg-purple-500 rounded-t-md opacity-80 group-hover:opacity-100 transition-all relative" style={{ height: `${(entUsers / totalUsers) * 100 || 5}%` }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">{entUsers}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-(--text-muted)">Enterprise</span>
                  </div>
                </div>
              </div>

              {/* Chart 2: Financial Breakdown */}
              <div className="p-6 rounded-3xl border border-(--text-primary)/10 bg-(--bg-card) shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" /> Financial Breakdown</h3>
                  <p className="text-[11px] text-(--text-muted) mt-0.5">Revenue vs Payouts (BDT).</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>Total Revenue</span> <span className="text-emerald-600">৳ {revBdt.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-(--bg-surface) h-4 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>Paid to Lawyers</span> <span className="text-rose-600">৳ {financials?.aggregates.paid_payouts_bdt.toLocaleString() || 0}</span>
                    </div>
                    <div className="w-full bg-(--bg-surface) h-4 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${((financials?.aggregates.paid_payouts_bdt || 0) / (revBdt || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>Platform Net Profit</span> <span className="text-indigo-600">৳ {netPosition.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-(--bg-surface) h-4 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(netPosition / (revBdt || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── TAB: PAYMENTS ── */}
        {activeTab === "payments" && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-base font-semibold">Pending bKash Payments</h2>
            <div className="space-y-3">
              {paymentsList.map((p) => (
                <div key={p.payment_id} className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-lg">৳{p.amount_bdt}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">{p.total_credits} Credits</span>
                    </div>
                    <p className="text-xs text-(--text-muted)">Ref: <span className="font-mono text-(--text-primary)">{p.reference_code}</span></p>
                    <p className="text-xs text-(--text-muted)">TrxID: <span className="font-mono text-emerald-600">{p.trx_id}</span> from {p.sender_number}</p>
                  </div>
                  <button onClick={() => handleApprovePayment(p.payment_id)} className="px-4 py-2 h-fit rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700">Approve Payment</button>
                </div>
              ))}
              {paymentsList.length === 0 && <p className="text-xs text-(--text-muted) py-8 text-center border border-dashed rounded-xl">No pending payments.</p>}
            </div>
          </div>
        )}

        {/* ── TAB: ENTERPRISES ── */}
        {activeTab === "enterprises" && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-base font-semibold">Pending Enterprises</h2>
            <div className="space-y-3">
              {enterprisesList.map((e) => (
                <div key={e.enterprise_id} className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="font-bold">{e.name}</h3>
                    <p className="text-xs text-(--text-muted)">Ref Code: {e.referral_code} · Limit: {e.member_limit} Members</p>
                    <p className="text-xs text-(--text-muted)">Admin: {e.requested_admin?.full_name} ({e.requested_admin?.email})</p>
                  </div>
                  <button onClick={() => handleApproveEnterprise(e.enterprise_id)} className="px-4 py-2 h-fit rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700">Approve Enterprise</button>
                </div>
              ))}
              {enterprisesList.length === 0 && <p className="text-xs text-(--text-muted) py-8 text-center border border-dashed rounded-xl">No pending enterprises.</p>}
            </div>
          </div>
        )}

        {/* ── TAB: LAWYERS ── */}
        {activeTab === "lawyers" && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-base font-semibold">Bar Council Verification Queue</h2>
            <div className="space-y-3">
              {lawyersList.map((lawyer) => (
                <div key={lawyer.id} className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="font-bold">{lawyer.full_name}</h3>
                    <p className="text-xs text-(--text-muted)">Bar ID: {lawyer.bar_council_id} · Exp: {lawyer.experience_years} Years</p>
                    <p className="text-xs text-(--text-muted)">{lawyer.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveLawyer(lawyer)} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700">Approve</button>
                    <button onClick={() => { setRejectingLawyerId(lawyer.id); setRejectReason(""); }} className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50">Reject</button>
                  </div>
                </div>
              ))}
              {lawyersList.length === 0 && <p className="text-xs text-(--text-muted) py-8 text-center border border-dashed rounded-xl">No pending lawyers.</p>}
            </div>
          </div>
        )}

        {/* ── TAB: WITHDRAWALS (PAYOUTS) ── */}
        {activeTab === "withdrawals" && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-base font-semibold">Lawyer Payout Requests</h2>
            <div className="space-y-3">
              {withdrawalsList.map((w) => (
                <div key={w.id} className="p-5 rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) flex flex-col md:flex-row justify-between gap-4 shadow-xs">
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

        {/* ── TAB: ALL USERS ── */}
        {activeTab === "users" && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-base font-semibold text-(--text-primary)">All Platform Users ({usersList.length})</h2>
            <div className="overflow-x-auto rounded-3xl border border-(--text-primary)/10 bg-(--bg-card) shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-(--bg-surface) border-b border-(--text-primary)/10 text-(--text-muted)">
                  <tr>
                    <th className="p-5 font-semibold">User Profile</th>
                    <th className="p-5 font-semibold">Contact</th>
                    <th className="p-5 font-semibold">Role</th>
                    <th className="p-5 font-semibold">Credits</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--text-primary)/5">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-(--text-primary)/5 transition-colors group">
                      
                      {/* User Avatar & Name */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold font-serif border border-indigo-200 dark:border-indigo-800 shrink-0 overflow-hidden shadow-sm">
                            {u.profile_photo_url ? (
                              <Image 
                                src={u.profile_photo_url} 
                                alt={u.full_name || "User"} 
                                width={40} 
                                height={40} 
                                className="w-full h-full object-cover" 
                                unoptimized
                              />
                            ) : (
                              u.full_name?.charAt(0) || "U"
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-(--text-primary) text-sm">{u.full_name}</p>
                            <p className="text-[10px] text-(--text-muted) font-mono">ID: #{u.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-5">
                        <p className="text-(--text-primary) font-medium">{u.email}</p>
                        <p className="text-[10px] text-(--text-muted)">{u.phone || "No phone"}</p>
                      </td>

                      {/* Role */}
                      <td className="p-5">
                        <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                          {u.role}
                        </span>
                      </td>

                      {/* Credits */}
                      <td className="p-5">
                        <p className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                          {u.credit_balance} <span className="text-[10px] text-(--text-muted)">cr</span>
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${u.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {u.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => handleViewUser(u.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold bg-(--bg-surface) border border-(--text-primary)/10 hover:border-(--text-primary)/30 text-(--text-primary) transition-all opacity-70 group-hover:opacity-100 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USER PROFILE MODAL */}
        {viewingUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl border border-(--text-primary)/10 bg-(--bg-card) shadow-2xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-(--text-primary)/10 flex items-center justify-between bg-(--bg-surface)">
                <h3 className="text-base font-serif font-bold flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" /> User Profile
                </h3>
                <button onClick={() => setViewingUserId(null)} className="p-1 rounded-lg hover:bg-(--text-primary)/10"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6">
                {isFetchingUser ? (
                  <div className="py-12 flex flex-col items-center justify-center text-(--text-muted) gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    <p className="text-xs">Loading profile details...</p>
                  </div>
                ) : userDetail ? (
                  <div className="space-y-5 text-sm">
                    {/* Basic Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold font-serif border border-indigo-200 overflow-hidden">
                        {userDetail.profile_photo_url ? (
                          <Image 
                            src={userDetail.profile_photo_url} 
                            alt={userDetail.full_name || "User"} 
                            width={56} 
                            height={56} 
                            className="w-full h-full object-cover" 
                            unoptimized
                          />
                        ) : (
                          userDetail.full_name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-(--text-primary)">{userDetail.full_name}</h4>
                        <p className="text-xs text-(--text-muted)">{userDetail.email} · {userDetail.phone || "No phone"}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                          {userDetail.role}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-(--bg-surface) border border-(--text-primary)/5">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-(--text-muted)">Credit Balance</p>
                        <p className="font-mono font-bold text-amber-600 text-lg">{userDetail.credit_balance}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-(--text-muted)">Joined</p>
                        <p className="font-semibold">{new Date(userDetail.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Lawyer Specific Info */}
                    {userDetail.role === "LAWYER" && userDetail.lawyer_profile && (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                        <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                          <Gavel className="w-3.5 h-3.5" /> Lawyer Details
                        </h5>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <span className="text-(--text-muted)">Bar Council ID:</span>
                          <span className="font-mono font-bold">{userDetail.lawyer_profile.bar_council_id}</span>
                          <span className="text-(--text-muted)">Verification:</span>
                          <span className="font-bold uppercase text-emerald-600">{userDetail.lawyer_profile.status}</span>
                          <span className="text-(--text-muted)">Wallet Balance:</span>
                          <span className="font-mono font-bold">৳{userDetail.lawyer_profile.wallet_balance}</span>
                        </div>
                      </div>
                    )}

                    {/* Enterprise Specific Info */}
                    {userDetail.enterprise_id && (
                      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                        <h5 className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" /> Enterprise Association
                        </h5>
                        <p className="text-xs text-(--text-muted)">Linked to Enterprise ID: <span className="font-mono font-bold">{userDetail.enterprise_id}</span></p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* MODALS (Reject Lawyer, Mark Paid) */}
        {rejectingLawyerId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-(--text-primary)/10 bg-(--bg-card) p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold">Reject Lawyer</h3>
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
              <h3 className="text-base font-bold">Mark Paid (bKash TrxID)</h3>
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