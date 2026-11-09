"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  getAdminDashboardStats,
  getAdminPendingLawyers,
  getAdminPendingWithdrawals,
  markAdminWithdrawalPaid,
  approveAdminWithdrawal, // ✅ Added for 2-step withdrawal flow
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
  X, Eye, Loader2, DollarSign, TrendingUp, TrendingDown, Banknote,
  Search, ChevronRight, AlertCircle, ArrowUpRight, ArrowDownRight,
  LayoutDashboard, UserCheck, Building, CircleDollarSign, LogOut,
  Clock, CheckCheck, XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserDetailData {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  credit_balance: number;
  member_credit_quota?: number;
  member_credit_used?: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  enterprise_id: number | null;
  enterprise_details?: {
    id: number;
    name: string;
    pool_balance: number;
    member_limit: number;
  } | null;
  profile_photo_url?: string | null;
  lawyer_profile: {
    bar_council_id: string;
    experience_years: number;
    specializations: string[];
    status: string;
    wallet_balance: number;
  } | null;
}

type TabId = "dashboard" | "payments" | "lawyers" | "enterprises" | "withdrawals" | "users";

// ─── Animated Counter Hook ─────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setValue(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color, trend, prefix = ""
}: {
  label: string; value: number; sub: string; icon: React.ElementType;
  color: "emerald" | "rose" | "indigo" | "amber" | "blue" | "purple";
  trend?: "up" | "down" | "neutral"; prefix?: string;
}) {
  const animated = useCountUp(value);
  const colorMap = {
    emerald: { bg: "from-emerald-500/10 to-emerald-400/5", icon: "text-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300", border: "border-emerald-200/50 dark:border-emerald-800/50" },
    rose:    { bg: "from-rose-500/10 to-rose-400/5",    icon: "text-rose-500",    text: "text-rose-600 dark:text-rose-400",    badge: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300",    border: "border-rose-200/50 dark:border-rose-800/50"    },
    indigo:  { bg: "from-indigo-500/10 to-indigo-400/5", icon: "text-indigo-500", text: "text-indigo-600 dark:text-indigo-400", badge: "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300", border: "border-indigo-200/50 dark:border-indigo-800/50" },
    amber:   { bg: "from-amber-500/10 to-amber-400/5",   icon: "text-amber-500",  text: "text-amber-600 dark:text-amber-400",  badge: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300",  border: "border-amber-200/50 dark:border-amber-800/50"  },
    blue:    { bg: "from-blue-500/10 to-blue-400/5",     icon: "text-blue-500",   text: "text-blue-600 dark:text-blue-400",   badge: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300",   border: "border-blue-200/50 dark:border-blue-800/50"   },
    purple:  { bg: "from-purple-500/10 to-purple-400/5", icon: "text-purple-500", text: "text-purple-600 dark:text-purple-400", badge: "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300", border: "border-purple-200/50 dark:border-purple-800/50" },
  };
  const c = colorMap[color];
  return (
    <div className={`relative overflow-hidden p-5 rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} backdrop-blur-sm group hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-white/60 dark:bg-black/20 ${c.icon} shadow-sm`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.badge}`}>
            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : trend === "down" ? <ArrowDownRight className="w-3 h-3" /> : null}
          </div>
        )}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted) mb-1">{label}</p>
      <p className={`text-2xl font-mono font-bold ${c.text} tabular-nums`}>
        {prefix}{animated.toLocaleString()}
      </p>
      <p className="text-[10px] text-(--text-muted) mt-1 font-medium">{sub}</p>
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-br ${c.bg} opacity-60 blur-2xl pointer-events-none`} />
    </div>
  );
}

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = 52; const cx = 64; const cy = 64;
  const circ = 2 * Math.PI * r;
  let cumulative = 0;
  return (
    <div className="flex items-center gap-6">
      <svg width="128" height="128" viewBox="0 0 128 128" className="shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="16" className="text-(--bg-surface)" opacity="0.5" />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circ;
          const offset = -cumulative * circ;
          cumulative += pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth="16"
              strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={offset}
              strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "all 0.8s ease" }}
            />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-current text-(--text-primary)" fontSize="18" fontWeight="bold" fontFamily="monospace">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="9" fontWeight="600">TOTAL</text>
      </svg>
      <div className="space-y-2.5 flex-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[11px] text-(--text-muted) flex-1">{seg.label}</span>
            <span className="text-[11px] font-mono font-bold text-(--text-primary)">{seg.value}</span>
            <span className="text-[10px] text-(--text-muted)">({((seg.value / total) * 100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ label, value, max, color, amount }: { label: string; value: number; max: number; color: string; amount: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-semibold text-(--text-muted)">{label}</span>
        <span className="text-[11px] font-mono font-bold text-(--text-primary)">{amount}</span>
      </div>
      <div className="h-2 rounded-full bg-(--bg-surface) overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-end">
        <span className="text-[9px] text-(--text-muted)">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-3 text-(--text-muted) border border-dashed border-(--text-primary)/10 rounded-2xl">
      <CheckCheck className="w-10 h-10 opacity-30" />
      <p className="text-sm font-medium opacity-60">{message}</p>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, variant = "neutral" }: { children: React.ReactNode; variant?: "success" | "danger" | "warning" | "info" | "neutral" | "purple" }) {
  const v = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60",
    danger:  "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60",
    info:    "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60",
    neutral: "bg-(--bg-surface) text-(--text-muted) border-(--text-primary)/10",
    purple:  "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${v[variant]}`}>
      {children}
    </span>
  );
}

// ─── Role Badge Helper ────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const r = role?.toUpperCase();
  if (r === "ADMIN")            return <Badge variant="danger">ADMIN</Badge>;
  if (r === "LAWYER")           return <Badge variant="success">LAWYER</Badge>;
  if (r === "ENTERPRISE_ADMIN") return <Badge variant="purple">ENT. ADMIN</Badge>;
  if (r === "ENTERPRISE_MEMBER") return <Badge variant="info">ENT. MEMBER</Badge>;
  return <Badge variant="neutral">{role}</Badge>;
}

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionBtn({ onClick, variant = "success", children, disabled }: {
  onClick: () => void; variant?: "success" | "danger"; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95
        ${variant === "success" ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20" : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 dark:border-rose-800"}`}
    >
      {children}
    </button>
  );
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-(--text-primary)/8 bg-(--bg-card) shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, sub, count }: { icon: React.ElementType; title: string; sub?: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-(--bg-surface) border border-(--text-primary)/8">
          <Icon className="w-4 h-4 text-(--text-muted)" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-(--text-primary) flex items-center gap-2">
            {title}
            {count !== undefined && count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500 text-white">{count}</span>
            )}
          </h2>
          {sub && <p className="text-[10px] text-(--text-muted) mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const router = useRouter();
  const { user, approveLawyerByAdmin, rejectLawyerByAdmin } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  // Data States
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [financials, setFinancials] = useState<AdminFinancials | null>(null);
  const [lawyersList, setLawyersList] = useState<AdminPendingLawyer[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<WithdrawalRequest[]>([]);
  const [paymentsList, setPaymentsList] = useState<AdminPendingPayment[]>([]);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [enterprisesList, setEnterprisesList] = useState<AdminPendingEnterprise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modals
  const [rejectingLawyerId, setRejectingLawyerId] = useState<string | number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [payingWithdrawalId, setPayingWithdrawalId] = useState<string | number | null>(null);
  const [payoutTrxId, setPayoutTrxId] = useState("");
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetailData | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  // Search
  const [userSearch, setUserSearch] = useState("");

  const showMessage = useCallback((text: string, type: "success" | "error" = "success") => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4500);
  }, []);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (String(user.role).toUpperCase() !== "ADMIN") { router.replace("/dashboard"); return; }
    loadData();
  }, [user, router, loadData]);

  const handleViewUser = async (id: number) => {
    setViewingUserId(id); setIsFetchingUser(true); setUserDetail(null);
    try { setUserDetail(await getAdminUserDetail(id)); }
    catch { showMessage("Failed to load user profile", "error"); }
    finally { setIsFetchingUser(false); }
  };

  const handleApproveLawyer = async (lawyer: AdminPendingLawyer) => {
    try {
      // ✅ Only call the Context API once, using the correct lawyer_id
      await approveLawyerByAdmin(lawyer.lawyer_id);
      setLawyersList((prev) => prev.filter((l) => l.lawyer_id !== lawyer.lawyer_id));
      showMessage(`✓ Advocate ${lawyer.full_name} approved successfully!`);
      loadData(true);
    } catch { showMessage("Approval failed. Please try again.", "error"); }
  };

  const handleApprovePayment = async (id: string | number) => {
    try {
      await approveAdminPayment(id);
      setPaymentsList((prev) => prev.filter((p) => p.payment_id !== id));
      showMessage(isBn ? "পেমেন্ট অনুমোদিত হয়েছে এবং ক্রেডিট যুক্ত হয়েছে।" : "Payment approved & credits added.");
      loadData(true);
    } catch { showMessage("Failed to approve payment.", "error"); }
  };

  // ✅ NEW: Fix withdrawal flow (2-step process)
  const handleMarkWithdrawalPaid = async (id: string | number, trxId: string) => {
    try {
      await approveAdminWithdrawal(id);
      await markAdminWithdrawalPaid(id, trxId);
      setWithdrawalsList((prev) => prev.map(w => w.id === id ? { ...w, status: "PAID" } : w));
      showMessage(isBn ? "উইথড্রয়াল সফলভাবে পরিশোধিত হয়েছে।" : "Withdrawal approved and marked as paid.");
      loadData(true);
    } catch {
      showMessage(isBn ? "উইথড্রয়াল প্রসেস করতে ব্যর্থ হয়েছে।" : "Failed to process withdrawal payout.", "error");
    }
  };

  const handleApproveEnterprise = async (id: number) => {
    try {
      await approveAdminEnterprise(id);
      setEnterprisesList((prev) => prev.filter((e) => e.enterprise_id !== id));
      showMessage(isBn ? "এন্টারপ্রাইজ অনুমোদিত হয়েছে।" : "Enterprise approved successfully!");
      loadData(true);
    } catch { showMessage("Failed to approve enterprise.", "error"); }
  };

  // Computed
  const totalUsers   = stats?.users.total || 0;
  const generalUsers = stats?.users.general || 0;
  const lawyerUsers  = stats?.users.lawyers || 0;
  const entUsers     = (stats?.users.enterprise_admins || 0) + (stats?.users.enterprise_members || 0);
  const revBdt         = financials?.aggregates.total_revenue_bdt || 0;
  const pendingPayouts = financials?.aggregates.pending_payouts_bdt || 0;
  const netPosition    = financials?.aggregates.net_platform_position_bdt || 0;
  const paidPayouts    = financials?.aggregates.paid_payouts_bdt || 0;

  const filteredUsers = usersList.filter(u =>
    userSearch === "" ||
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    String(u.id).includes(userSearch)
  );

  const totalPendingActions = paymentsList.length + lawyersList.length + enterprisesList.length + withdrawalsList.length;

  const tabs = [
    { id: "dashboard"    as TabId, label: isBn ? "ড্যাশবোর্ড" : "Dashboard",    icon: LayoutDashboard,     count: 0 },
    { id: "payments"     as TabId, label: isBn ? "পেমেন্টস"  : "Payments",      icon: CreditCard,          count: paymentsList.length },
    { id: "lawyers"      as TabId, label: isBn ? "আইনজীবী"   : "Lawyers",       icon: Gavel,               count: lawyersList.length },
    { id: "enterprises"  as TabId, label: isBn ? "এন্টারপ্রাইজ" : "Enterprises", icon: Building,           count: enterprisesList.length },
    { id: "withdrawals"  as TabId, label: isBn ? "পে-আউট"    : "Payouts",       icon: CircleDollarSign,    count: withdrawalsList.length },
    { id: "users"        as TabId, label: isBn ? "সব ইউজার"  : "All Users",     icon: Users,               count: 0 },
  ];

  if (!user || String(user.role).toUpperCase() !== "ADMIN") return null;

  // ─── Loading Screen ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-(--bg-surface)" />
            <div className="absolute inset-0 rounded-full border-4 border-t-rose-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-(--text-primary)">{isBn ? "লোড হচ্ছে..." : "Loading Admin Panel"}</p>
            <p className="text-[11px] text-(--text-muted) mt-1">Fetching platform data...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-2 py-6 md:py-10 space-y-6">

        {/* ── TOP HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300/40 mb-2.5 uppercase tracking-widest">
              <ShieldAlert className="w-3 h-3" />
              <span>{isBn ? "সিস্টেম অ্যাডমিন" : "System Admin"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-(--text-primary)">
              {isBn ? "কন্ট্রোল প্যানেল" : "Control Panel"}
            </h1>
            <p className="text-xs text-(--text-muted) mt-1">
              {isBn ? "সব প্ল্যাটফর্ম অ্যাক্টিভিটি মনিটর করুন" : "Monitor all platform activity"}
              {totalPendingActions > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                  <AlertCircle className="w-3 h-3" />
                  {totalPendingActions} pending actions
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold border border-(--text-primary)/12 bg-(--bg-card) hover:bg-(--bg-surface) transition-all cursor-pointer shadow-xs disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* ── TOAST MESSAGE ──────────────────────────────────────────────────── */}
        {actionMessage && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-semibold border animate-in slide-in-from-top-2 fade-in duration-300
            ${actionMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
            }`}>
            {actionMessage.type === "success"
              ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span className="flex-1">{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="opacity-60 hover:opacity-100 ml-auto cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── NAV TABS ────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap
                ${activeTab === tab.id
                  ? "bg-(--text-primary) text-(--bg-primary) shadow-md"
                  : "text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-card) border border-transparent hover:border-(--text-primary)/10"
                }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none
                  ${activeTab === tab.id ? "bg-rose-500 text-white" : "bg-rose-500/90 text-white"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB: DASHBOARD                                                      */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in duration-300">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Total Revenue" value={revBdt} sub="From bKash Top-ups" icon={Banknote} color="emerald" trend="up" prefix="৳" />
              <StatCard label="Pending Payouts" value={pendingPayouts} sub="Owed to Lawyers" icon={TrendingDown} color="rose" trend="down" prefix="৳" />
              <StatCard label="Net Position" value={netPosition} sub="Revenue minus Payouts" icon={TrendingUp} color="indigo" trend="up" prefix="৳" />
              <StatCard label="Total Users" value={totalUsers} sub="Registered accounts" icon={Users} color="blue" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* User Demographics */}
              <Card className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-(--text-primary) flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      {isBn ? "ইউজার ডেমোগ্রাফিক্স" : "User Demographics"}
                    </h3>
                    <p className="text-[10px] text-(--text-muted) mt-0.5">{isBn ? "রোল অনুযায়ী বিতরণ" : "Distribution by role"}</p>
                  </div>
                  <Badge variant="info">{totalUsers} total</Badge>
                </div>
                <DonutChart segments={[
                  { value: generalUsers, color: "#3B82F6", label: "General Users" },
                  { value: lawyerUsers,  color: "#10B981", label: "Lawyers" },
                  { value: entUsers,     color: "#8B5CF6", label: "Enterprise" },
                ]} />
              </Card>

              {/* Financial Breakdown */}
              <Card className="p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-(--text-primary) flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    {isBn ? "আর্থিক বিবরণ" : "Financial Breakdown"}
                  </h3>
                  <p className="text-[10px] text-(--text-muted) mt-0.5">{isBn ? "রেভিনিউ বনাম পেআউট (BDT)" : "Revenue vs Payouts (BDT)"}</p>
                </div>
                <div className="space-y-5 pt-1">
                  <ProgressBar label="Total Revenue" value={revBdt} max={revBdt} color="#10B981" amount={`৳${revBdt.toLocaleString()}`} />
                  <ProgressBar label="Paid to Lawyers" value={paidPayouts} max={revBdt} color="#EF4444" amount={`৳${paidPayouts.toLocaleString()}`} />
                  <ProgressBar label="Pending Payouts" value={pendingPayouts} max={revBdt} color="#F59E0B" amount={`৳${pendingPayouts.toLocaleString()}`} />
                  <ProgressBar label="Platform Net Profit" value={netPosition} max={revBdt} color="#6366F1" amount={`৳${netPosition.toLocaleString()}`} />
                </div>
              </Card>
            </div>

            {/* Quick Overview Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: isBn ? "অপেক্ষমান পেমেন্ট" : "Pending Payments", value: paymentsList.length, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
                { label: isBn ? "আইনজীবী যাচাই" : "Lawyer Reviews", value: lawyersList.length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
                { label: isBn ? "এন্টারপ্রাইজ" : "Enterprises", value: enterprisesList.length, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" },
                { label: isBn ? "উইথড্রয়াল" : "Withdrawals", value: withdrawalsList.length, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30" },
              ].map((item, i) => (
                <div key={i} className={`${item.bg} rounded-2xl p-4 border border-(--text-primary)/5`}>
                  <p className="text-[10px] text-(--text-muted) font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                  <p className={`text-3xl font-mono font-black ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] text-(--text-muted) mt-1 font-medium">
                    {item.value > 0 ? "⚠ Needs attention" : "✓ All clear"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB: PAYMENTS                                                       */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "payments" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <SectionHeader icon={CreditCard} title={isBn ? "অপেক্ষমান bKash পেমেন্ট" : "Pending bKash Payments"} sub={isBn ? "ম্যানুয়াল ট্রানজেকশন যাচাই করুন" : "Verify manual transactions"} count={paymentsList.length} />
            <div className="space-y-3">
              {paymentsList.map((p) => (
                <Card key={p.payment_id} className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-xl text-(--text-primary)">৳{p.amount_bdt}</span>
                        <Badge variant="info">{p.total_credits} Credits</Badge>
                        <Badge variant="warning"><Clock className="w-2.5 h-2.5" /> Pending</Badge>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-(--text-muted)">
                          Ref: <span className="font-mono font-bold text-(--text-primary)">{p.reference_code}</span>
                        </p>
                        <p className="text-xs text-(--text-muted)">
                          TrxID: <span className="font-mono font-bold text-emerald-600">{p.trx_id}</span>
                          <span className="ml-2">from <span className="font-mono text-(--text-primary)">{p.sender_number}</span></span>
                        </p>
                      </div>
                    </div>
                    <ActionBtn onClick={() => handleApprovePayment(p.payment_id)} variant="success">
                      <CheckCheck className="w-3.5 h-3.5" /> Approve Payment
                    </ActionBtn>
                  </div>
                </Card>
              ))}
              {paymentsList.length === 0 && <EmptyState message={isBn ? "কোনো অপেক্ষমান পেমেন্ট নেই।" : "No pending payments."} />}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB: ENTERPRISES                                                    */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "enterprises" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <SectionHeader icon={Building} title={isBn ? "অপেক্ষমান এন্টারপ্রাইজ" : "Pending Enterprises"} sub={isBn ? "নতুন এন্টারপ্রাইজ অনুমোদন করুন" : "Review and approve new enterprises"} count={enterprisesList.length} />
            <div className="space-y-3">
              {enterprisesList.map((e) => (
                <Card key={e.enterprise_id} className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold">
                          {e.name?.charAt(0) || "E"}
                        </div>
                        <div>
                          <h3 className="font-bold text-(--text-primary)">{e.name}</h3>
                          <p className="text-[10px] text-(--text-muted) font-mono">Ref: {e.referral_code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap mt-1">
                        <Badge variant="purple">{e.member_limit} Members</Badge>
                        <span className="text-[11px] text-(--text-muted)">
                          Admin: <span className="font-semibold text-(--text-primary)">{e.requested_admin?.full_name}</span>
                          <span className="ml-1 opacity-60">({e.requested_admin?.email})</span>
                        </span>
                      </div>
                    </div>
                    <ActionBtn onClick={() => handleApproveEnterprise(e.enterprise_id)} variant="success">
                      <CheckCheck className="w-3.5 h-3.5" /> Approve
                    </ActionBtn>
                  </div>
                </Card>
              ))}
              {enterprisesList.length === 0 && <EmptyState message={isBn ? "কোনো অপেক্ষমান এন্টারপ্রাইজ নেই।" : "No pending enterprises."} />}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB: LAWYERS                                                        */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "lawyers" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <SectionHeader icon={Gavel} title={isBn ? "বার কাউন্সিল যাচাই কিউ" : "Bar Council Verification Queue"} sub={isBn ? "আইনজীবী প্রোফাইল পর্যালোচনা করুন" : "Review pending lawyer profiles"} count={lawyersList.length} />
            <div className="space-y-3">
              {lawyersList.map((lawyer) => (
                <Card key={lawyer.lawyer_id} className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {lawyer.full_name?.charAt(0) || "A"}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-(--text-primary)">{lawyer.full_name}</h3>
                        <p className="text-xs text-(--text-muted)">{lawyer.email}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="neutral">Bar ID: {lawyer.bar_council_id}</Badge>
                          <Badge variant="info">{lawyer.experience_years}y exp.</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 items-start">
                      <ActionBtn onClick={() => handleApproveLawyer(lawyer)} variant="success">
                        <UserCheck className="w-3.5 h-3.5" /> Approve
                      </ActionBtn>
                      <ActionBtn onClick={() => { setRejectingLawyerId(lawyer.lawyer_id); setRejectReason(""); }} variant="danger">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </ActionBtn>
                    </div>
                  </div>
                </Card>
              ))}
              {lawyersList.length === 0 && <EmptyState message={isBn ? "কোনো অপেক্ষমান আইনজীবী নেই।" : "No pending lawyer verifications."} />}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB: WITHDRAWALS                                                    */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "withdrawals" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <SectionHeader icon={Wallet} title={isBn ? "আইনজীবী পেআউট রিকোয়েস্ট" : "Lawyer Payout Requests"} sub={isBn ? "bKash পেআউট প্রসেস করুন" : "Process bKash payouts"} count={withdrawalsList.filter(w => w.status === "PENDING").length} />
            <div className="space-y-3">
              {withdrawalsList.map((w) => (
                <Card key={w.id} className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-xl text-(--text-primary)">৳{w.amount_bdt}</span>
                        {w.status === "PENDING"
                          ? <Badge variant="warning"><Clock className="w-2.5 h-2.5" /> Pending</Badge>
                          : <Badge variant="success"><CheckCheck className="w-2.5 h-2.5" /> Paid</Badge>
                        }
                      </div>
                      <p className="text-xs text-(--text-muted)">
                        <span className="font-semibold text-(--text-primary)">{w.account_holder_name}</span>
                        {" · bKash: "}<span className="font-mono text-emerald-600">{w.bkash_number}</span>
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 items-start">
                      {w.status === "PENDING" && (
                        <ActionBtn onClick={() => { setPayingWithdrawalId(w.id); setPayoutTrxId(""); }} variant="success">
                          <CheckCheck className="w-3.5 h-3.5" /> Mark Paid
                        </ActionBtn>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {withdrawalsList.length === 0 && <EmptyState message={isBn ? "কোনো পেআউট রিকোয়েস্ট নেই।" : "No pending withdrawals."} />}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB: ALL USERS                                                      */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <SectionHeader icon={Users} title={isBn ? `সব প্ল্যাটফর্ম ইউজার (${usersList.length})` : `All Platform Users (${usersList.length})`} sub={isBn ? "সম্পূর্ণ ইউজার ডিরেক্টরি" : "Complete user directory"} />
              {/* Search */}
              <div className="relative flex-shrink-0 w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--text-muted)" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={isBn ? "নাম, ইমেইল বা ID..." : "Search by name, email, ID..."}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-(--text-primary)/10 bg-(--bg-card) text-(--text-primary) placeholder:text-(--text-muted) outline-none focus:border-(--text-primary)/30 focus:ring-1 focus:ring-(--text-primary)/10 transition-all"
                />
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-(--bg-surface) border-b border-(--text-primary)/8">
                      <th className="px-5 py-3.5 font-bold text-(--text-muted) text-[10px] uppercase tracking-wider">User</th>
                      <th className="px-5 py-3.5 font-bold text-(--text-muted) text-[10px] uppercase tracking-wider">Contact</th>
                      <th className="px-5 py-3.5 font-bold text-(--text-muted) text-[10px] uppercase tracking-wider">Role</th>
                      <th className="px-5 py-3.5 font-bold text-(--text-muted) text-[10px] uppercase tracking-wider">Credits</th>
                      <th className="px-5 py-3.5 font-bold text-(--text-muted) text-[10px] uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3.5 font-bold text-(--text-muted) text-[10px] uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--text-primary)/5">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-(--bg-surface)/60 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold border border-indigo-200/50 dark:border-indigo-800/50 shrink-0 overflow-hidden">
                              {u.profile_photo_url ? (
                                <Image src={u.profile_photo_url} alt={u.full_name || "User"} width={36} height={36} className="w-full h-full object-cover" unoptimized />
                              ) : (
                                u.full_name?.charAt(0) || "U"
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-(--text-primary)">{u.full_name}</p>
                              <p className="text-[10px] text-(--text-muted) font-mono">#{u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-(--text-primary) font-medium truncate max-w-[180px]">{u.email}</p>
                          <p className="text-[10px] text-(--text-muted)">{u.phone || "—"}</p>
                        </td>
                        <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{u.credit_balance}</span>
                              <span className="text-[10px] text-(--text-muted)">cr</span>
                            </div>
                            {u.enterprise_id && (
                              <span className="text-[9px] text-(--text-muted) italic">
                                {isBn ? "ব্যক্তিগত ওয়ালেট" : "Personal Wallet"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold
                            ${u.is_active
                              ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                              : "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                            {u.is_active ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleViewUser(u.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-(--text-primary)/10 bg-(--bg-surface) hover:border-(--text-primary)/25 hover:bg-(--bg-card) text-(--text-primary) transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={6} className="py-12 text-center text-xs text-(--text-muted)">
                        {userSearch ? "No users match your search." : "No users found."}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length > 0 && (
                <div className="px-5 py-3 bg-(--bg-surface)/50 border-t border-(--text-primary)/5 text-[10px] text-(--text-muted) font-medium">
                  Showing {filteredUsers.length} of {usersList.length} users
                </div>
              )}
            </Card>
          </div>
        )}

      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: USER PROFILE                                                     */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {viewingUserId && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setViewingUserId(null); }}
        >
          <div className="w-full max-w-lg bg-(--bg-card) rounded-t-3xl sm:rounded-3xl border border-(--text-primary)/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-(--text-primary)/8 bg-(--bg-surface)/60">
              <h3 className="text-sm font-bold text-(--text-primary) flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" /> User Profile
              </h3>
              <button onClick={() => setViewingUserId(null)} className="p-1.5 rounded-xl hover:bg-(--text-primary)/10 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {isFetchingUser ? (
                <div className="py-16 flex flex-col items-center gap-3 text-(--text-muted)">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <p className="text-xs">Loading profile...</p>
                </div>
              ) : userDetail ? (
                <div className="space-y-5">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold font-serif border border-indigo-200/50 dark:border-indigo-800/50 overflow-hidden shadow-md shrink-0">
                      {userDetail.profile_photo_url ? (
                        <Image src={userDetail.profile_photo_url} alt={userDetail.full_name || "User"} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                      ) : (userDetail.full_name?.charAt(0) || "U")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-(--text-primary) truncate">{userDetail.full_name}</h4>
                      <p className="text-xs text-(--text-muted) truncate">{userDetail.email}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <RoleBadge role={userDetail.role} />
                        <Badge variant={userDetail.is_active ? "success" : "danger"}>
                          {userDetail.is_active ? "Active" : "Suspended"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-(--bg-surface) border border-(--text-primary)/5 text-center">
                      <p className="text-[9px] uppercase font-bold text-(--text-muted) mb-1">Credits</p>
                      <p className="text-lg font-mono font-black text-amber-600 dark:text-amber-400">{userDetail.credit_balance}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-(--bg-surface) border border-(--text-primary)/5 text-center">
                      <p className="text-[9px] uppercase font-bold text-(--text-muted) mb-1">Joined</p>
                      <p className="text-xs font-bold text-(--text-primary)">{new Date(userDetail.created_at).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"2-digit" })}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-(--bg-surface) border border-(--text-primary)/5 text-center">
                      <p className="text-[9px] uppercase font-bold text-(--text-muted) mb-1">Phone</p>
                      <p className="text-xs font-bold text-(--text-primary) truncate">{userDetail.phone || "—"}</p>
                    </div>
                  </div>

                  {/* Lawyer Info */}
                  {userDetail.role === "LAWYER" && userDetail.lawyer_profile && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60">
                      <h5 className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                        <Gavel className="w-3.5 h-3.5" /> Lawyer Details
                      </h5>
                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                        <span className="text-(--text-muted)">Bar Council ID</span>
                        <span className="font-mono font-bold text-(--text-primary)">{userDetail.lawyer_profile.bar_council_id}</span>
                        <span className="text-(--text-muted)">Experience</span>
                        <span className="font-bold text-(--text-primary)">{userDetail.lawyer_profile.experience_years} years</span>
                        <span className="text-(--text-muted)">Verification</span>
                        <Badge variant={userDetail.lawyer_profile.status === "APPROVED" ? "success" : "warning"}>
                          {userDetail.lawyer_profile.status}
                        </Badge>
                        <span className="text-(--text-muted)">Wallet Balance</span>
                        <span className="font-mono font-bold text-emerald-600">৳{userDetail.lawyer_profile.wallet_balance}</span>
                      </div>
                    </div>
                  )}

                  {/* Enterprise Info */}
                  {userDetail.enterprise_id && (
                    <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/60 space-y-2">
                      <h5 className="text-[11px] font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
                        <Building2 className="w-3.5 h-3.5" /> Enterprise Association
                      </h5>
                      <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                        <span className="text-(--text-muted)">Organization</span>
                        <span className="font-bold text-(--text-primary)">
                          {userDetail.enterprise_details?.name || `Enterprise #${userDetail.enterprise_id}`}
                        </span>
                        <span className="text-(--text-muted)">Company Pool Balance</span>
                        <span className="font-mono font-bold text-emerald-600">
                          {userDetail.enterprise_details?.pool_balance ?? "—"} credits
                        </span>
                        <span className="text-(--text-muted)">Assigned Quota</span>
                        <span className="font-mono font-semibold text-(--text-primary)">
                          {userDetail.member_credit_quota ?? 0} credits (Used: {userDetail.member_credit_used ?? 0})
                        </span>
                        <span className="text-(--text-muted)">Personal Wallet</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400">
                          {userDetail.credit_balance} cr (Signup Bonus)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: REJECT LAWYER                                                    */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {rejectingLawyerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-(--bg-card) rounded-2xl border border-(--text-primary)/10 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-(--text-primary)">Reject Lawyer Application</h3>
                <p className="text-[10px] text-(--text-muted)">Provide a reason for rejection</p>
              </div>
            </div>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Invalid Bar Council ID, incomplete documentation..."
              className="w-full p-3 rounded-xl text-xs border border-(--text-primary)/10 bg-(--bg-surface) text-(--text-primary) placeholder:text-(--text-muted) outline-none focus:border-rose-300 transition-colors resize-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setRejectingLawyerId(null)} className="px-4 py-2 text-xs font-semibold text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer">
                Cancel
              </button>
              <ActionBtn
                variant="danger"
                onClick={async () => {
                  await rejectLawyerByAdmin(rejectingLawyerId, rejectReason);
                  setLawyersList(prev => prev.filter(l => l.lawyer_id !== rejectingLawyerId));
                  setRejectingLawyerId(null);
                  showMessage("Lawyer application rejected.");
                }}
              >
                <XCircle className="w-3.5 h-3.5" /> Confirm Rejection
              </ActionBtn>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: MARK WITHDRAWAL PAID                                             */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {payingWithdrawalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-(--bg-card) rounded-2xl border border-(--text-primary)/10 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-(--text-primary)">Mark as Paid (bKash)</h3>
                <p className="text-[10px] text-(--text-muted)">Enter the bKash transaction ID</p>
              </div>
            </div>
            <input
              type="text"
              value={payoutTrxId}
              onChange={(e) => setPayoutTrxId(e.target.value)}
              placeholder="e.g. BK99281937XY"
              className="w-full p-3 rounded-xl text-xs font-mono border border-(--text-primary)/10 bg-(--bg-surface) text-(--text-primary) placeholder:text-(--text-muted) outline-none focus:border-emerald-300 transition-colors"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setPayingWithdrawalId(null)} className="px-4 py-2 text-xs font-semibold text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer">
                Cancel
              </button>
              <ActionBtn
                variant="success"
                disabled={!payoutTrxId}
                onClick={async () => {
                  await handleMarkWithdrawalPaid(payingWithdrawalId, payoutTrxId);
                  setPayingWithdrawalId(null);
                }}
              >
                <CheckCheck className="w-3.5 h-3.5" /> Confirm Payment
              </ActionBtn>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}