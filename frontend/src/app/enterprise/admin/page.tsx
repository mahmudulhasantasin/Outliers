/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  getCompanyDashboard,
  listMembers,
  listPendingMembers,
  approveMember,
  rejectMember,
  suspendMember,
  reactivateMember,
  adjustMemberQuota,
  uploadPlaybook,
  getCompanyAuditLogs,
  getSharedContracts,
} from "@/lib/apiServices";
import {
  Building2, Users, BookOpen, FolderLock, Coins, ShieldAlert,
  ShieldCheck, UserPlus, Lock, Copy, Check, AlertCircle,
  FileText, Search, ArrowUpRight, TrendingUp, CheckCircle2, X,
  Upload, Loader2, RefreshCw,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Local types
// ─────────────────────────────────────────────────────────────
type AdminTab = "overview" | "members" | "playbook" | "vault";
type MemberStatus = "active" | "suspended" | "pending" | "inactive";

interface EnterpriseMember {
  id: string;
  name: string;
  email: string;
  department: string;
  role: "admin" | "member";
  status: MemberStatus;
  monthlyCreditCap: number;
  creditsUsedThisMonth: number;
  joinedAt: string;
}

interface PlaybookRule {
  id: string;
  clauseTypeEn: string;
  clauseTypeBn: string;
  statute: string;
  statutoryReference: string;
  companyRequirementEn: string;
  companyRequirementBn: string;
  standardClauseTemplate: string;
  strictness: "mandatory" | "advisory";
  isActive: boolean;
}

interface PendingMember {
  user_id: number | string;
  email: string;
  full_name: string;
  phone?: string | null;
  requested_at: string;
  is_verified: boolean;
}

interface AuditLogItem {
  id: number | string;
  timestamp: string;
  member_name: string;
  department: string;
  module: string;
  category: string;
  credits_consumed: number;
}

interface SharedContractItem {
  id: number | string;
  contract_id: number | string;
  title: string;
  category: string;
  submitted_by: string;
  submitted_at: string;
  risk_score: number;
  status: string;
  advocate_verified: boolean;
}

// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────
function mapBackendStatus(m: any): MemberStatus {
  const approval = String(m.approval_status || "").toUpperCase();
  const isActive = m.is_active !== false;
  if (approval === "PENDING") return "pending";
  if (approval === "REJECTED") return "inactive";
  if (approval === "SUSPENDED") return "suspended";
  if (approval === "APPROVED") return isActive ? "active" : "inactive";
  return "active";
}

function mapBackendMember(m: any): EnterpriseMember {
  const companyRole = String(m.company_role || "").toUpperCase();
  return {
    id: String(m.user_id ?? m.id ?? ""),
    name: m.full_name || m.name || "Member",
    email: m.email || "",
    department: m.department || "—",
    role: companyRole === "ADMIN" ? "admin" : "member",
    status: mapBackendStatus(m),
    monthlyCreditCap: Number(m.quota_total ?? 0),
    creditsUsedThisMonth: Number(m.quota_used ?? 0),
    joinedAt: m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "—",
  };
}

function mapBackendRuleToFrontend(r: any): PlaybookRule {
  const sev = String(r.severity || "").toLowerCase();
  return {
    id: String(r.rule_id || `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    clauseTypeEn: r.category || "General",
    clauseTypeBn: r.category || "General",
    statute: r.violated_law || "Bangladesh Law",
    statutoryReference: r.violated_law || "",
    companyRequirementEn: r.rule_description || "",
    companyRequirementBn: r.rule_description || "",
    standardClauseTemplate: r.suggested_redline || "",
    strictness: sev === "critical" || sev === "high" ? "mandatory" : "advisory",
    isActive: true,
  };
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function EnterpriseAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const { toast, prompt: showPrompt } = useNotification();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Data States (No Mock Data)
  const [organization, setOrganization] = useState<any>(null);
  const [usedThisMonth, setUsedThisMonth] = useState<number>(0);
  const [members, setMembers] = useState<EnterpriseMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [playbookRules, setPlaybookRules] = useState<PlaybookRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [sharedContracts, setSharedContracts] = useState<SharedContractItem[]>([]);

  // Load state
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // UI state
  const [copiedReferCode, setCopiedReferCode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [editingCreditMemberId, setEditingCreditMemberId] = useState<string | null>(null);
  const [tempCreditCap, setTempCreditCap] = useState<number>(200);
  const [isUploadingPlaybook, setIsUploadingPlaybook] = useState(false);

  // Approve / Reject modals
  const [approveTarget, setApproveTarget] = useState<PendingMember | null>(null);
  const [approveRole, setApproveRole] = useState<"ADMIN" | "MANAGER" | "MEMBER">("MEMBER");
  const [approveDept, setApproveDept] = useState("");
  const [approveQuota, setApproveQuota] = useState(200);
  const [rejectTarget, setRejectTarget] = useState<PendingMember | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const openApproveModal = (pm: PendingMember) => {
    setApproveTarget(pm);
    setApproveRole("MEMBER");
    setApproveDept("");
    setApproveQuota(Math.min(200, organization?.creditPoolRemaining ?? 0));
  };

  const openRejectModal = (pm: PendingMember) => {
    setRejectTarget(pm);
    setRejectReason("");
  };

  const borderClass = "border-[var(--text-primary)]/10";
  const roleUpper = user ? String(user.role).toUpperCase() : "";
  const isAdmin = roleUpper === "ENTERPRISE_ADMIN" || roleUpper === "ADMIN";
  const isAllowed = !!user && (isAdmin || roleUpper === "ENTERPRISE");

  // Redirect guards
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (roleUpper === "LAWYER") {
      router.replace("/lawyer/pending");
      return;
    }
    if (user?.enterpriseProfile?.verificationStatus === "pending") {
      router.replace("/enterprise/pending");
      return;
    }
    if (!isAllowed) {
      router.replace("/dashboard");
    }
  }, [user, roleUpper, isAllowed, router]);

  // Refetch all data from Backend
  const refetchAll = useCallback(async () => {
    setIsLoadingBackend(true);
    setLoadError(null);
    try {
      const [dashRes, memsRes, pendingRes, logsRes, sharedRes] = await Promise.allSettled([
        getCompanyDashboard(),
        listMembers(),
        listPendingMembers(),
        getCompanyAuditLogs(),
        getSharedContracts(),
      ]);

      // 1. Dashboard
      if (dashRes.status === "fulfilled" && dashRes.value) {
        const d = dashRes.value as any;
        const ent = d.enterprise || {};
        const memb = d.members || {};
        const cred = d.credits || {};
        const poolBalance = Number(cred.pool_balance ?? ent.credit_balance ?? 0);
        const monthlyUsed = Number(cred.used_this_month ?? 0);

        setUsedThisMonth(monthlyUsed);
        setOrganization({
          id: ent.id,
          name: ent.name,
          referCode: ent.referral_code,
          usedSeats: memb.active ?? 0,
          totalSeats: ent.member_limit ?? 0,
          creditPoolRemaining: poolBalance,
          creditPoolTotal: poolBalance + monthlyUsed,
          registrationNo: ent.registration_no || "—",
          tinNo: ent.tin_no || "—",
        });
      } else if (dashRes.status === "rejected") {
        setLoadError(isBn ? "ড্যাশবোর্ড ডাটা লোড ব্যর্থ।" : "Failed to load dashboard.");
      }

      // 2. Members
      if (memsRes.status === "fulfilled" && Array.isArray(memsRes.value)) {
        setMembers((memsRes.value as any[]).map((m) => {
          const isCurrentUserAdmin = m.email === user?.email || String(m.user_id || m.id) === String(user?.id);
          const base = mapBackendMember(m);
          if (isCurrentUserAdmin || String(m.company_role || "").toUpperCase() === "ADMIN") {
            base.role = "admin";
            base.status = "active";
            if (!base.department || base.department === "—") {
              base.department = isBn ? "এক্সিকিউটিভ অ্যাডমিন" : "Executive / Admin";
            }
          }
          return base;
        }));
      }

      // 3. Pending Members (Excludes Enterprise Admin)
      if (pendingRes.status === "fulfilled" && Array.isArray(pendingRes.value)) {
        const mappedPending = (pendingRes.value as any[])
          .filter((m) => m.email !== user?.email && String(m.user_id || m.id) !== String(user?.id) && String(m.company_role || "").toUpperCase() !== "ADMIN")
          .map((m) => ({
            user_id: m.user_id || m.id,
            email: m.email,
            full_name: m.full_name,
            phone: m.phone,
            requested_at: m.requested_at || m.joined_at || new Date().toISOString(),
            is_verified: m.is_verified ?? false,
          }));
        setPendingMembers(mappedPending);
      }

      // 4. Audit Logs
      if (logsRes.status === "fulfilled" && Array.isArray(logsRes.value)) {
        setAuditLogs(logsRes.value);
      }

      // 5. Shared Contracts
      if (sharedRes.status === "fulfilled" && Array.isArray(sharedRes.value)) {
        setSharedContracts(sharedRes.value);
      }

    } catch (err) {
      console.error("[Enterprise Admin] refetch error:", err);
      setLoadError(isBn ? "সার্ভারে সংযোগ ব্যর্থ।" : "Backend connection failed.");
    } finally {
      setIsLoadingBackend(false);
    }
  }, [isBn]);

    useEffect(() => {
    if (!user || !isAllowed) return;
    refetchAll();
  }, [user, isAllowed, refetchAll]);

  // Handlers
  const copyReferCode = () => {
    if (!organization?.referCode) return;
    navigator.clipboard.writeText(organization.referCode);
    setCopiedReferCode(true);
    setTimeout(() => setCopiedReferCode(false), 2000);
  };

  const handleToggleMemberStatus = async (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    if (member.role === "admin") {
      toast.warning(isBn ? "অ্যাডমিন স্ট্যাটাস পরিবর্তন করা যাবে না।" : "Admin status cannot be modified.");
      return;
    }

    try {
      if (member.status === "active") {
        const reason = await showPrompt({
          title: isBn ? "সদস্য সাময়িক স্থগিতকরণ" : "Suspend Team Member",
          message: isBn ? "সাময়িক স্থগিত করার কারণ লিখুন (কমপক্ষে ৩ অক্ষর):" : "Enter reason for suspension (min 3 characters):",
          placeholder: isBn ? "স্থগিতের কারণ..." : "Reason for suspension...",
          confirmText: isBn ? "স্থগিত করুন" : "Suspend",
          minLength: 3,
        });
        if (!reason) return;
        await suspendMember(memberId, reason);
        toast.success(isBn ? "সদস্য সাময়িক স্থগিত করা হয়েছে।" : "Member suspended successfully.");
      } else if (member.status === "suspended") {
        await reactivateMember(memberId);
        toast.success(isBn ? "সদস্য পুনরায় সক্রিয় করা হয়েছে।" : "Member reactivated successfully.");
      } else {
        return;
      }
      await refetchAll();
    } catch (e: any) {
      toast.error(e?.message || (isBn ? "স্ট্যাটাস পরিবর্তন ব্যর্থ।" : "Failed to update status."));
    }
  };

  const handleSaveMemberCreditCap = async (memberId: string) => {
    const current = members.find((m) => m.id === memberId);
    const delta = tempCreditCap - (current?.monthlyCreditCap ?? 0);
    if (delta === 0) {
      setEditingCreditMemberId(null);
      return;
    }
    try {
      await adjustMemberQuota(memberId, delta, "Quota adjustment via Admin panel");
      await refetchAll();
      setEditingCreditMemberId(null);
    } catch (e: any) {
      toast.error(e?.message || (isBn ? "কোটা পরিবর্তন ব্যর্থ।" : "Failed to adjust quota."));
    }
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveTarget) return;
    try {
      await approveMember(String(approveTarget.user_id), {
        company_role: approveRole,
        department: approveDept.trim() || null,
        initial_quota: approveQuota,
      });
      setApproveTarget(null);
      setApproveRole("MEMBER");
      setApproveDept("");
      setApproveQuota(200);
      toast.success(isBn ? "সদস্য সফলভাবে অনুমোদিত হয়েছে!" : "Member approved successfully!");
      await refetchAll();
    } catch (e: any) {
      toast.error(e?.message || (isBn ? "অনুমোদন ব্যর্থ।" : "Failed to approve."));
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget || rejectReason.trim().length < 3) return;
    try {
      await rejectMember(String(rejectTarget.user_id), rejectReason.trim());
      setRejectTarget(null);
      setRejectReason("");
      toast.success(isBn ? "সদস্যের রিকোয়েস্ট প্রত্যাখ্যাত হয়েছে।" : "Membership request rejected.");
      await refetchAll();
    } catch (e: any) {
      toast.error(e?.message || (isBn ? "প্রত্যাখ্যান ব্যর্থ।" : "Failed to reject."));
    }
  };

  const handlePlaybookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPlaybook(true);
      const resp = (await uploadPlaybook(file, file.name.replace(/\.[^.]+$/, ""))) as any;
      const extracted = resp?.rules;
      if (Array.isArray(extracted) && extracted.length > 0) {
        setPlaybookRules(extracted.map(mapBackendRuleToFrontend));
      }
      toast.success(
        isBn
          ? `প্লেবুক সফলভাবে আপলোড হয়েছে! ${extracted?.length ?? 0} টি রুল পাওয়া গেছে।`
          : `Playbook uploaded! ${extracted?.length ?? 0} rules extracted.`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload playbook");
    } finally {
      setIsUploadingPlaybook(false);
      e.target.value = "";
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.department.toLowerCase().includes(memberSearch.toLowerCase())
  );

  if (!user || roleUpper === "LAWYER" || !isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Full Screen Loader
  if (isLoadingBackend && !organization) {
    return (
      <AppShell>
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-[var(--text-muted)]">{isBn ? "ড্যাশবোর্ড লোড হচ্ছে..." : "Loading Dashboard..."}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        
        {/* Error banner */}
        {loadError && (
          <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4" />
              <span>{loadError}</span>
            </div>
            <button
              onClick={refetchAll}
              disabled={isLoadingBackend}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1"
            >
              {isLoadingBackend ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {isBn ? "রি-ট্রাই" : "Retry"}
            </button>
          </div>
        )}

        {/* Header */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${borderClass} bg-[var(--bg-card)] shadow-sm space-y-6`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                  <Building2 className="w-3.5 h-3.5" />
                  {isBn ? "কর্পোরেট এন্টারপ্রাইজ অ্যাডমিন" : "Enterprise Admin Portal"}
                </span>
                {organization?.registrationNo !== "—" && (
                  <span className="font-mono text-xs text-[var(--text-muted)] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--text-primary)]/10">
                    RJSC: {organization.registrationNo}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                {organization?.name || "Company Name"}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                {isBn ? "প্রধান প্রশাসক:" : "Lead Administrator:"}{" "}
                <strong className="text-[var(--text-primary)]">{user.name}</strong> ({user.email})
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-3 rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-surface)] flex items-center gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                    {isBn ? "কোম্পানি ইনভাইট কোড" : "Company Invite Code"}
                  </p>
                  <p className="font-mono font-bold text-sm text-[var(--text-primary)]">
                    {organization?.referCode || "—"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyReferCode}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10 transition-colors cursor-pointer"
                >
                  {copiedReferCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="px-4 py-3 rounded-2xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 flex items-center gap-2 transition-opacity cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isBn ? "সদস্য ইনভাইট করুন" : "Invite Member"}</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-t border-[var(--text-primary)]/10 pt-4 overflow-x-auto">
            {(["overview", "members", "playbook", "vault"] as AdminTab[]).map((tab) => {
              const icons = { overview: TrendingUp, members: Users, playbook: BookOpen, vault: FolderLock };
              const Icon = icons[tab];
              const labels = {
                overview: isBn ? "ওভারভিউ ও ক্রেডিট পুল" : "Overview & Credit Pool",
                members: isBn ? "সদস্য ও পারমিশন" : "Members & Permissions",
                playbook: isBn ? "কোম্পানি প্লেবুক" : "Company Playbook",
                vault: isBn ? "কোম্পানি ভল্ট" : "Company Vault",
              };
              const showPendingBadge = tab === "members" && pendingMembers.length > 0;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{labels[tab]}</span>
                  {showPendingBadge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold">
                      {pendingMembers.length}
                    </span>
                  )}
                  {tab === "members" && !showPendingBadge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] font-mono">
                      {members.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy notice */}
        <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              {isBn ? "জিরো-নলেজ মেম্বার প্রাইভেসি সক্রিয়" : "Zero-Knowledge Member Privacy Enforced"}
            </h4>
            <p className="text-xs text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
              {isBn
                ? "এন্টারপ্রাইজ অ্যাডমিন সদস্যদের ব্যক্তিগত চ্যাট বা চুক্তিপত্র দেখতে পারেন না। সদস্য নিজে শেয়ার করলে কেবল কোম্পানি ভল্টে দৃশ্যমান হবে।"
                : "Enterprise Admins cannot inspect individual members' private chats or unshared contracts. Contracts become visible only when shared to the Company Vault."}
            </p>
          </div>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Seats */}
              <div className={`p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)] space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {isBn ? "সিট ব্যবহার" : "Seat Utilization"}
                  </span>
                  <Users className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-bold text-[var(--text-primary)]">
                      {organization?.usedSeats || 0}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      / {organization?.totalSeats || 0} {isBn ? "সিট" : "Seats"}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-surface)] h-2 rounded-full mt-3 overflow-hidden border border-[var(--text-primary)]/10">
                    <div
                      className="bg-[var(--accent-solid)] h-full rounded-full transition-all"
                      style={{
                        width: `${organization?.totalSeats > 0
                          ? Math.min(100, (organization.usedSeats / organization.totalSeats) * 100)
                          : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {Math.max(0, (organization?.totalSeats || 0) - (organization?.usedSeats || 0))}{" "}
                  {isBn ? "টি খালি সিট অবশিষ্ট।" : "available seats remaining."}
                </p>
              </div>

              {/* Credit Pool */}
              <div className={`p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)] space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {isBn ? "কোম্পানি ক্রেডিট পুল" : "Company Credit Pool"}
                  </span>
                  <Coins className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-bold text-amber-600 dark:text-amber-400">
                      {organization?.creditPoolRemaining?.toLocaleString() || 0}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {isBn ? "অবশিষ্ট ক্রেডিট" : "credits remaining"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {usedThisMonth.toLocaleString()} {isBn ? "ক্রেডিট এ মাসে ব্যবহৃত।" : "credits used this month."}
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/pricing")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer shrink-0"
                  >
                    <span>{isBn ? "পুল রিচার্জ" : "Top Up Pool"}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Playbook */}
              <div className={`p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)] space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {isBn ? "প্লেবুক কমপ্লায়েন্স" : "Playbook Compliance"}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {playbookRules.length > 0
                      ? isBn ? "সক্রিয় ও বাধ্যতামূলক" : "Active & Enforced"
                      : isBn ? "ঐচ্ছিক" : "Advisory Only"}
                  </span>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    {playbookRules.filter((r) => r.isActive).length}{" "}
                    {isBn ? "টি রুল অডিটে সক্রিয়।" : "active rules enforced."}
                  </p>
                </div>
              </div>
            </div>

            {/* REAL Audit Trail */}
            <div className={`rounded-3xl border ${borderClass} bg-[var(--bg-card)] p-6 space-y-4`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                    {isBn ? "কমপ্লায়েন্স অডিট ট্রেইল" : "Compliance Audit Trail"}
                  </h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--text-primary)]/10 text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-semibold">{isBn ? "সময়" : "Timestamp"}</th>
                      <th className="pb-3 font-semibold">{isBn ? "সদস্য" : "Member"}</th>
                      <th className="pb-3 font-semibold">{isBn ? "বিভাগ" : "Department"}</th>
                      <th className="pb-3 font-semibold">{isBn ? "মডিউল" : "Module"}</th>
                      <th className="pb-3 font-semibold">{isBn ? "আইন ক্যাটাগরি" : "Category"}</th>
                      <th className="pb-3 font-semibold text-right">{isBn ? "ক্রেডিট" : "Credits"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--text-primary)]/5">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-[var(--text-muted)]">
                          {isBn ? "কোনো লগ পাওয়া যায়নি।" : "No audit logs found."}
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[var(--text-primary)]/5 transition-colors">
                          <td className="py-3 font-mono text-[11px] text-[var(--text-muted)]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 font-semibold text-[var(--text-primary)]">{log.member_name}</td>
                          <td className="py-3 text-[var(--text-muted)]">{log.department}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-[var(--text-primary)]">
                              {log.module}
                            </span>
                          </td>
                          <td className="py-3 text-[var(--text-muted)]">{log.category}</td>
                          <td className="py-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                            -{log.credits_consumed}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── MEMBERS TAB ── */}
        {activeTab === "members" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {pendingMembers.length > 0 && (
              <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {isBn
                      ? `অপেক্ষমাণ সদস্য অনুরোধ (${pendingMembers.length})`
                      : `Pending Membership Requests (${pendingMembers.length})`}
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {pendingMembers.map((pm) => (
                    <div
                      key={String(pm.user_id)}
                      className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 flex items-center justify-between gap-3 flex-wrap"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                          {pm.full_name}
                        </p>
                        <p className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                          {pm.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openApproveModal(pm)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer"
                        >
                          {isBn ? "অনুমোদন" : "Approve"}
                        </button>
                        <button
                          onClick={() => openRejectModal(pm)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-500 text-white hover:bg-rose-600 cursor-pointer"
                        >
                          {isBn ? "প্রত্যাখ্যান" : "Reject"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isBn ? "সদস্য খুঁজুন..." : "Search members..."}
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[var(--text-primary)]/15 bg-[var(--bg-card)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)]/30"
                />
              </div>
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isBn ? "সদস্য আমন্ত্রণ" : "Invite Member"}</span>
              </button>
            </div>

            <div className={`rounded-3xl border ${borderClass} bg-[var(--bg-card)] overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--text-primary)]/10 bg-[var(--bg-surface)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                      <th className="p-4 font-semibold">{isBn ? "সদস্য" : "Member"}</th>
                      <th className="p-4 font-semibold">{isBn ? "বিভাগ" : "Department"}</th>
                      <th className="p-4 font-semibold">{isBn ? "রোল" : "Role"}</th>
                      <th className="p-4 font-semibold">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                      <th className="p-4 font-semibold">{isBn ? "কোটা" : "Quota"}</th>
                      <th className="p-4 font-semibold">{isBn ? "ব্যয়িত" : "Used"}</th>
                      <th className="p-4 font-semibold text-right">{isBn ? "অ্যাকশন" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--text-primary)]/5">
                    {filteredMembers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-xs text-[var(--text-muted)]">
                          {isBn ? "কোনো সদস্য পাওয়া যায়নি।" : "No members found."}
                        </td>
                      </tr>
                    )}
                    {filteredMembers.map((mem) => (
                      <tr key={mem.id} className="hover:bg-[var(--text-primary)]/5 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-[var(--text-primary)]">{mem.name}</p>
                          <p className="text-[11px] text-[var(--text-muted)] font-mono">{mem.email}</p>
                        </td>
                        <td className="p-4 text-[var(--text-muted)]">{mem.department}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            mem.role === "admin"
                              ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                          }`}>
                            {mem.role === "admin" ? "Admin" : "Member"}
                          </span>
                        </td>
                        <td className="p-4">
                          {mem.status === "active" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          )}
                          {mem.status === "suspended" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              Suspended
                            </span>
                          )}
                          {mem.status === "pending" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {mem.status === "pending" ? (
                            <span className="text-[11px] text-[var(--text-muted)] italic">
                              {isBn ? "অনুমোদনে ধার্য" : "Set on approval"}
                            </span>
                          ) : editingCreditMemberId === mem.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={tempCreditCap}
                                onChange={(e) => setTempCreditCap(Number(e.target.value))}
                                className="w-16 px-2 py-1 rounded-lg border border-[var(--text-primary)]/20 bg-[var(--bg-surface)] text-xs font-mono"
                              />
                              <button
                                onClick={() => handleSaveMemberCreditCap(mem.id)}
                                className="p-1 rounded-md bg-emerald-500 text-white hover:bg-emerald-600"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingCreditMemberId(null)}
                                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-[var(--text-primary)]">
                                {mem.role === "admin" ? (isBn ? "পুল কন্ট্রোলার" : "Pool Admin") : mem.monthlyCreditCap}
                              </span>
                              {mem.role !== "admin" && mem.status === "active" && (
                                <button
                                  onClick={() => {
                                    setEditingCreditMemberId(mem.id);
                                    setTempCreditCap(mem.monthlyCreditCap);
                                  }}
                                  className="text-[10px] text-[var(--accent-solid)] hover:underline cursor-pointer"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-mono text-[var(--text-muted)]">
                          {mem.creditsUsedThisMonth} / {mem.monthlyCreditCap}
                        </td>
                        <td className="p-4 text-right">
                          {mem.status === "pending" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openApproveModal({
                                  user_id: mem.id,
                                  full_name: mem.name,
                                  email: mem.email,
                                  requested_at: mem.joinedAt,
                                  is_verified: true,
                                })}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
                                title={isBn ? "অনুমোদন করুন" : "Approve Member"}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{isBn ? "অনুমোদন" : "Approve"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openRejectModal({
                                  user_id: mem.id,
                                  full_name: mem.name,
                                  email: mem.email,
                                  requested_at: mem.joinedAt,
                                  is_verified: true,
                                })}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500 text-white hover:bg-rose-600 cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
                                title={isBn ? "প্রত্যাখ্যান করুন" : "Reject Member"}
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>{isBn ? "প্রত্যাখ্যান" : "Reject"}</span>
                              </button>
                            </div>
                          ) : (
                            mem.role !== "admin" && (mem.status === "active" || mem.status === "suspended") && (
                              <button
                                onClick={() => handleToggleMemberStatus(mem.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                                  mem.status === "active"
                                    ? "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                                    : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                }`}
                              >
                                {mem.status === "active"
                                  ? isBn ? "স্থগিত" : "Suspend"
                                  : isBn ? "পুনরায় চালু" : "Activate"}
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── PLAYBOOK TAB ── */}
        {activeTab === "playbook" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className={`p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)] flex flex-col md:flex-row md:items-center justify-between gap-5`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                    {isBn ? "কোম্পানি প্লেবুক" : "Company Playbook"}
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">
                  {isBn
                    ? "প্লেবুক ফাইল আপলোড করলে AI স্বয়ংক্রিয়ভাবে রুল এক্সট্রাক্ট করবে।"
                    : "Upload a playbook file to auto-extract compliance rules via AI."}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <label className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-colors cursor-pointer flex items-center gap-2 shadow-sm">
                  {isUploadingPlaybook ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>
                    {isUploadingPlaybook
                      ? isBn ? "আপলোড হচ্ছে..." : "Uploading..."
                      : isBn ? "প্লেবুক ফাইল আপলোড" : "Upload Playbook"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={handlePlaybookUpload}
                    disabled={isUploadingPlaybook}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {playbookRules.length === 0 && (
                <div className="p-8 rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] text-center text-xs text-[var(--text-muted)]">
                  {isBn
                    ? "কোনো রুল নেই। একটি প্লেবুক ফাইল আপলোড করুন।"
                    : "No rules yet. Upload a playbook file to extract rules."}
                </div>
              )}
              {playbookRules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className={`p-5 rounded-2xl border ${borderClass} bg-[var(--bg-card)] transition-all ${
                    !rule.isActive ? "opacity-60 bg-[var(--bg-surface)]" : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--text-primary)]/10 font-bold">
                          #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                          {isBn ? rule.clauseTypeBn : rule.clauseTypeEn}
                        </h4>
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 font-mono">
                          {rule.statute} {rule.statutoryReference ? `(${rule.statutoryReference})` : ""}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                          rule.strictness === "mandatory"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                            : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                        }`}>
                          {rule.strictness}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-primary)]/90 leading-relaxed">
                        {isBn ? rule.companyRequirementBn : rule.companyRequirementEn}
                      </p>
                      {rule.standardClauseTemplate && (
                        <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] mb-1">
                            {isBn ? "স্ট্যান্ডার্ড ক্লজ টেমপ্লেট:" : "Standard Clause:"}
                          </p>
                          <p className="text-xs font-mono text-[var(--text-muted)] leading-relaxed italic">
                            "{rule.standardClauseTemplate}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── VAULT TAB ── */}
        {activeTab === "vault" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className={`p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)]`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FolderLock className="w-4 h-4 text-purple-500" />
                  <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                    {isBn ? "অনুমোদিত ও শেয়ার্ড কর্পোরেট কন্ট্রাক্ট ভল্ট" : "Company Shared Contract Vault"}
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">
                  {isBn
                    ? "এই চুক্তিগুলো টিম মেম্বাররা স্বেচ্ছায় কোম্পানির সেন্ট্রাল ভল্টে জমা দিয়েছেন।"
                    : "Repository of contracts voluntarily deposited by team members."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sharedContracts.length === 0 && (
                <div className="p-8 rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] text-center text-xs text-[var(--text-muted)]">
                  {isBn ? "কোনো শেয়ার্ড চুক্তি নেই।" : "No shared contracts yet."}
                </div>
              )}
              {sharedContracts.map((cnt) => (
                <div
                  key={cnt.id}
                  className={`p-5 rounded-2xl border ${borderClass} bg-[var(--bg-card)] hover:border-[var(--text-primary)]/20 transition-colors space-y-4`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--text-primary)]/10">
                          {cnt.id}
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                          {cnt.category}
                        </span>
                        {cnt.advocate_verified && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Advocate Sealed
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            cnt.status === "approved"
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {cnt.status === "approved" ? "Approved" : "Pending Review"}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-serif font-bold text-[var(--text-primary)]">
                        {cnt.title}
                      </h4>

                      <p className="text-xs text-[var(--text-muted)]">
                        {isBn ? "জমা দিয়েছেন:" : "Submitted by:"} <strong className="text-[var(--text-primary)]">{cnt.submitted_by}</strong> · {new Date(cnt.submitted_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                          Risk Score
                        </p>
                        <p className={`font-mono font-bold text-sm ${cnt.risk_score > 70 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {cnt.risk_score}/100
                        </p>
                      </div>

                      <button
                        onClick={() => router.push(`/contractmind?id=${cnt.contract_id}`)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/15 text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{isBn ? "অডিট রিপোর্ট দেখুন" : "View Audit Memo"}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SHARE INVITE MODAL ── */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-3xl border ${borderClass} bg-[var(--bg-card)] p-6 shadow-2xl space-y-5`}>
              <div className="flex items-center justify-between border-b border-[var(--text-primary)]/10 pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-purple-500" />
                  <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                    {isBn ? "সদস্য আমন্ত্রণ জানান" : "Invite Enterprise Member"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-[var(--text-muted)] leading-relaxed">
                  {isBn
                    ? "আপনার কোম্পানির সদস্যদের এই ইনভাইট কোডটি দিন। তারা রেজিস্ট্রেশন পেজে এই কোডটি ব্যবহার করে রেজিস্ট্রেশন করবেন। এরপর তারা পেন্ডিং লিস্টে আসবে, সেখান থেকে আপনি অনুমোদন করতে পারবেন।"
                    : "Share this invite code with your team members. They will use it during registration. Once registered, they'll appear in the Pending Approvals section for your review."}
                </p>

                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                      {isBn ? "ইনভাইট কোড" : "Invite Code"}
                    </p>
                    <p className="font-mono font-bold text-lg text-[var(--text-primary)]">
                      {organization?.referCode || "—"}
                    </p>
                  </div>
                  <button
                    onClick={copyReferCode}
                    className="p-3 rounded-xl bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity"
                  >
                    {copiedReferCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="px-5 py-2.5 rounded-xl font-bold bg-[var(--text-primary)]/10 text-[var(--text-primary)] hover:bg-[var(--text-primary)]/15 cursor-pointer"
                  >
                    {isBn ? "বন্ধ করুন" : "Close"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── APPROVE MEMBER MODAL ── */}
        {approveTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-3xl border ${borderClass} bg-[var(--bg-card)] p-6 shadow-2xl space-y-5`}>
              <div className="flex items-center justify-between border-b border-[var(--text-primary)]/10 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                    {isBn ? "সদস্য অনুমোদন" : "Approve Member"}
                  </h3>
                </div>
                <button onClick={() => setApproveTarget(null)} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10">
                  <p className="font-bold text-[var(--text-primary)]">{approveTarget.full_name}</p>
                  <p className="font-mono text-[var(--text-muted)]">{approveTarget.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                      {isBn ? "রোল" : "Role"}
                    </label>
                    <select
                      value={approveRole}
                      onChange={(e) => setApproveRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                      {isBn ? "প্রাথমিক কোটা" : "Initial Quota"}
                      <span className="ml-1 text-[10px] text-[var(--text-muted)] font-normal">
                        ({isBn ? "সর্বোচ্চ পুল ক্রেডিট: " : "Pool balance: "}{organization?.creditPoolRemaining ?? 0})
                      </span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={organization?.creditPoolRemaining ?? 0}
                      value={approveQuota}
                      onChange={(e) => setApproveQuota(Math.max(0, Math.min(Number(e.target.value), organization?.creditPoolRemaining ?? 0)))}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono"
                    />
                    {(organization?.creditPoolRemaining ?? 0) === 0 && (
                      <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                        {isBn
                          ? "কোম্পানি পুলে ক্রেডিট শূন্য। সদস্যকে ০ কোটায় অনুমোদন দিয়ে পরবর্তীতে টপ-আপ করে ক্রেডিট বরাদ্দ দিতে পারবেন।"
                          : "Company pool has 0 credits. You can approve with 0 quota and allocate credits later after top-up."}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                    {isBn ? "বিভাগ (ঐচ্ছিক)" : "Department (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={approveDept}
                    onChange={(e) => setApproveDept(e.target.value)}
                    placeholder="e.g. Legal, HR, Procurement"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button type="button" onClick={() => setApproveTarget(null)} className="px-4 py-2 rounded-xl border border-[var(--text-primary)]/15 text-[var(--text-muted)] cursor-pointer">
                    {isBn ? "বাতিল" : "Cancel"}
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">
                    {isBn ? "অনুমোদন করুন" : "Approve"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── REJECT MEMBER MODAL ── */}
        {rejectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-3xl border ${borderClass} bg-[var(--bg-card)] p-6 shadow-2xl space-y-5`}>
              <div className="flex items-center justify-between border-b border-[var(--text-primary)]/10 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                    {isBn ? "সদস্য প্রত্যাখ্যান" : "Reject Member"}
                  </h3>
                </div>
                <button onClick={() => setRejectTarget(null)} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10">
                  <p className="font-bold text-[var(--text-primary)]">{rejectTarget.full_name}</p>
                  <p className="font-mono text-[var(--text-muted)]">{rejectTarget.email}</p>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                    {isBn ? "প্রত্যাখ্যানের কারণ" : "Rejection Reason"} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    minLength={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    placeholder="Provide a clear reason..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button type="button" onClick={() => setRejectTarget(null)} className="px-4 py-2 rounded-xl border border-[var(--text-primary)]/15 text-[var(--text-muted)] cursor-pointer">
                    {isBn ? "বাতিল" : "Cancel"}
                  </button>
                  <button type="submit" disabled={rejectReason.trim().length < 3} className="px-5 py-2 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer">
                    {isBn ? "প্রত্যাখ্যান করুন" : "Reject"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}