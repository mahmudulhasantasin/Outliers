"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  INITIAL_ORGANIZATION,
  INITIAL_ENTERPRISE_MEMBERS,
  INITIAL_COMPANY_PLAYBOOK,
  INITIAL_SHARED_CONTRACTS,
  INITIAL_AUDIT_LOGS,
  EnterpriseMember,
  PlaybookRule,
  SharedCompanyContract,
  EnterpriseOrganization,
} from "@/data/enterpriseData";
import {
  getCompanyDashboard,
  listMembers,
  listPendingMembers,
  approveMember,
  rejectMember,
  suspendMember,
  adjustMemberQuota,
  uploadPlaybook,
  listPlaybooks,
  deletePlaybook,
  activatePlaybook,
} from "@/lib/apiServices";
import {
  Building2,
  Users,
  BookOpen,
  FolderLock,
  Coins,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Lock,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  FileText,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  X,
  Plus,
  Sparkles,
  Upload,
  Loader2,
} from "lucide-react";

type AdminTab = "overview" | "members" | "playbook" | "vault";

export default function EnterpriseAdminPage() {
  const router = useRouter();
  const { user, loginAsDemoEnterpriseAdmin } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [organization, setOrganization] = useState<EnterpriseOrganization>(INITIAL_ORGANIZATION);
  const [members, setMembers] = useState<EnterpriseMember[]>(INITIAL_ENTERPRISE_MEMBERS);
  const [playbookRules, setPlaybookRules] = useState<PlaybookRule[]>(INITIAL_COMPANY_PLAYBOOK.rules);
  const [sharedContracts, setSharedContracts] = useState<SharedCompanyContract[]>(INITIAL_SHARED_CONTRACTS);
  
  // UI States
  const [copiedReferCode, setCopiedReferCode] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [editingCreditMemberId, setEditingCreditMemberId] = useState<string | null>(null);
  const [tempCreditCap, setTempCreditCap] = useState<number>(200);

  // Invite Form State
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDept, setInviteDept] = useState("Human Resources");
  const [inviteCap, setInviteCap] = useState(250);

  // New Rule Form State
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleStatute, setNewRuleStatute] = useState("Bangladesh Labour Act 2006");
  const [newRuleRef, setNewRuleRef] = useState("");
  const [newRuleReq, setNewRuleReq] = useState("");
  const [newRuleTemplate, setNewRuleTemplate] = useState("");

  const [isUploadingPlaybook, setIsUploadingPlaybook] = useState(false);

  // Fetch real Enterprise dashboard and members from backend
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [dash, mems] = await Promise.allSettled([
          getCompanyDashboard(),
          listMembers(),
        ]);
        if (!isMounted) return;
        if (dash.status === "fulfilled" && dash.value) {
          setOrganization((prev) => ({
            ...prev,
            name: dash.value.company_name || prev.name,
            referCode: dash.value.refer_code || prev.referCode,
            usedSeats: dash.value.active_member_count ?? prev.usedSeats,
            creditPoolTotal: dash.value.quota_summary?.total_allocated ?? prev.creditPoolTotal,
            creditPoolRemaining: dash.value.quota_summary?.total_allocated
              ? dash.value.quota_summary.total_allocated - (dash.value.total_credits_used ?? 0)
              : prev.creditPoolRemaining,
          }));
        }
        if (mems.status === "fulfilled" && Array.isArray(mems.value) && mems.value.length > 0) {
          const mapped: EnterpriseMember[] = mems.value.map((m: any) => ({
            id: m.user_id || m.id,
            name: m.full_name || m.name || "Member",
            email: m.email,
            department: m.department || "Operations",
            role: m.role === "admin" ? "admin" : "member",
            status: m.status === "suspended" ? "suspended" : "active",
            monthlyCreditCap: m.credits_cap ?? m.monthly_credit_cap ?? 200,
            creditsUsedThisMonth: m.credits_used ?? m.credits_used_this_month ?? 0,
            joinedAt: m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "Active",
          }));
          setMembers(mapped);
        }
      } catch (err) {
        console.warn("Could not load company dashboard:", err);
      }
    }
    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  const borderClass = "border-[var(--text-primary)]/10";
  const isAdmin =
    user?.role === "enterprise_admin" ||
    (user?.role === "enterprise" && !user?.enterpriseProfile?.isTeamMember);

  const copyReferCode = () => {
    navigator.clipboard.writeText(organization.referCode);
    setCopiedReferCode(true);
    setTimeout(() => setCopiedReferCode(false), 2000);
  };

  const handleTogglePlaybookEnforce = () => {
    setOrganization((prev) => ({
      ...prev,
      playbookEnforced: !prev.playbookEnforced,
    }));
  };

  const handleToggleRuleActive = (ruleId: string) => {
    setPlaybookRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleToggleMemberStatus = async (memberId: string) => {
    try {
      await suspendMember(memberId);
    } catch (e) {
      console.warn("Backend suspend error:", e);
    }
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const nextStatus = m.status === "active" ? "suspended" : "active";
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleSaveMemberCreditCap = async (memberId: string) => {
    const currentMember = members.find((m) => m.id === memberId);
    const delta = tempCreditCap - (currentMember?.monthlyCreditCap ?? 200);
    try {
      await adjustMemberQuota(memberId, delta, "Quota adjustment via Admin panel");
    } catch (e) {
      console.warn("Backend quota update error:", e);
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, monthlyCreditCap: tempCreditCap } : m))
    );
    setEditingCreditMemberId(null);
  };

  const handlePlaybookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPlaybook(true);
      await uploadPlaybook(file);
      alert(isBn ? "প্লেবুক সফলভাবে আপলোড হয়েছে!" : "Playbook uploaded successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to upload playbook");
    } finally {
      setIsUploadingPlaybook(false);
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    const newMem: EnterpriseMember = {
      id: `mem-${Date.now().toString().slice(-4)}`,
      name: inviteName,
      email: inviteEmail,
      department: inviteDept,
      role: "member",
      status: "active",
      monthlyCreditCap: inviteCap,
      creditsUsedThisMonth: 0,
      joinedAt: "Just now",
    };
    setMembers((prev) => [newMem, ...prev]);
    setOrganization((prev) => ({ ...prev, usedSeats: prev.usedSeats + 1 }));
    setShowInviteModal(false);
    setInviteName("");
    setInviteEmail("");
  };

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle || !newRuleReq) return;
    const newRule: PlaybookRule = {
      id: `rule-${Date.now().toString().slice(-4)}`,
      clauseTypeEn: newRuleTitle,
      clauseTypeBn: newRuleTitle,
      statute: newRuleStatute,
      statutoryReference: newRuleRef || "General Bangladesh Law",
      companyRequirementEn: newRuleReq,
      companyRequirementBn: newRuleReq,
      standardClauseTemplate: newRuleTemplate || newRuleReq,
      strictness: "mandatory",
      isActive: true,
    };
    setPlaybookRules((prev) => [newRule, ...prev]);
    setShowAddRuleModal(false);
    setNewRuleTitle("");
    setNewRuleRef("");
    setNewRuleReq("");
    setNewRuleTemplate("");
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.department.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        
        {/* If user is not Enterprise Admin, show quick switch card */}
        {!isAdmin && (
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {isBn ? "আপনি বর্তমানে এন্টারপ্রাইজ অ্যাডমিন হিসেবে লগইন করেননি" : "You are not logged in as Enterprise Admin"}
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  {isBn ? "এই ড্যাশবোর্ড ও মেম্বার কন্ট্রোল পরীক্ষা করতে ১-ক্লিকে ডেমো এন্টারপ্রাইজ অ্যাডমিনে স্যুইচ করুন।" : "Switch to Demo Enterprise Admin in 1-click to test controls."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={loginAsDemoEnterpriseAdmin}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
            >
              {isBn ? "ডেমো অ্যাডমিন হিসেবে প্রবেশ করুন" : "Switch to Demo Admin"}
            </button>
          </div>
        )}

        {/* ── Enterprise Header ── */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${borderClass} bg-[var(--bg-card)] shadow-sm space-y-6`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                  <Building2 className="w-3.5 h-3.5" />
                  {isBn ? "কর্পোরেট এন্টারপ্রাইজ অ্যাডমিন" : "Enterprise Admin Portal"}
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--text-primary)]/10">
                  RJSC: {organization.registrationNo}
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--text-primary)]/10">
                  TIN: {organization.tinNo}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                {organization.name}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                {isBn ? "প্রধান প্রশাসক:" : "Lead Administrator:"} <strong className="text-[var(--text-primary)]">{organization.adminName}</strong> ({organization.adminEmail})
              </p>
            </div>

            {/* Refer Code & Quick Invite */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-3 rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-surface)] flex items-center gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                    {isBn ? "কোম্পানি রেফারেল / ইনভাইট কোড" : "Company Invite Code"}
                  </p>
                  <p className="font-mono font-bold text-sm text-[var(--text-primary)]">{organization.referCode}</p>
                </div>
                <button
                  type="button"
                  onClick={copyReferCode}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10 transition-colors cursor-pointer"
                  title="Copy Invite Code"
                >
                  {copiedReferCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-3 rounded-2xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 flex items-center gap-2 transition-opacity cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isBn ? "সদস্য যুক্ত করুন" : "Invite Member"}</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-t border-[var(--text-primary)]/10 pt-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{isBn ? "ওভারভিউ ও ক্রেডিট পুল" : "Overview & Credit Pool"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("members")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "members"
                  ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{isBn ? "সদস্য ও পারমিশন" : "Members & Permissions"}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] font-mono">
                {members.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("playbook")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "playbook"
                  ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{isBn ? "কোম্পানি লিগ্যাল প্লেবুক" : "Company Playbook"}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono">
                Active
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("vault")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "vault"
                  ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
              }`}
            >
              <FolderLock className="w-4 h-4" />
              <span>{isBn ? "কোম্পানি শেয়ার্ড ভল্ট" : "Company Shared Vault"}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] font-mono">
                {sharedContracts.length}
              </span>
            </button>
          </div>
        </div>

        {/* ── ZERO-KNOWLEDGE PRIVACY SAFEGUARD NOTICE ── */}
        <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                {isBn ? "জিরো-নলেজ মেম্বার প্রাইভেসি পলিসি সক্রিয়" : "Zero-Knowledge Member Privacy Enforced"}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 font-semibold">
                Protected by Design
              </span>
            </div>
            <p className="text-xs text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
              {isBn
                ? "কোম্পানি পলিসি অনুযায়ী এন্টারপ্রাইজ অ্যাডমিন কোনো সদস্যের ব্যক্তিগত চ্যাট বা ড্রাফট চুক্তিপত্র সরাসরি দেখতে বা পড়তে পারবেন না। সদস্য নিজে যখন 'Share to Company Vault' বাটনে ক্লিক করবেন, কেবল তখনই তা পুরো কোম্পানির ভল্টে দৃশ্যমান হবে। অ্যাডমিন কেবল ক্রেডিট ব্যবহার এবং মেটাডেটা লগ নিরীক্ষণ করতে পারেন।"
                : "Enterprise Admins cannot inspect individual members' private chat sessions or unshared contract drafts. Contracts only become visible when explicitly shared to the Company Vault by the member. Admins can monitor aggregate credit usage and compliance metadata logs."}
            </p>
          </div>
        </div>

        {/* ── TAB 1: OVERVIEW & CREDIT POOL ── */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top 3 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Seats Card */}
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
                      {organization.usedSeats}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      / {organization.totalSeats} {isBn ? "সিট" : "Seats"}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-surface)] h-2 rounded-full mt-3 overflow-hidden border border-[var(--text-primary)]/10">
                    <div
                      className="bg-[var(--accent-solid)] h-full rounded-full transition-all"
                      style={{ width: `${(organization.usedSeats / organization.totalSeats) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {organization.totalSeats - organization.usedSeats} {isBn ? "টি খালি সিট অবশিষ্ট রয়েছে।" : "available seats remaining."}
                </p>
              </div>

              {/* Credit Pool Card */}
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
                      {organization.creditPoolRemaining.toLocaleString()}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      / {organization.creditPoolTotal.toLocaleString()} {isBn ? "ক্রেডিট" : "Credits"}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-surface)] h-2 rounded-full mt-3 overflow-hidden border border-[var(--text-primary)]/10">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${(organization.creditPoolRemaining / organization.creditPoolTotal) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {isBn ? "নবায়ন তারিখ: ১ নভেম্বর ২০২৬" : "Renews on: 01 November 2026"}
                </p>
              </div>

              {/* Playbook Status Card */}
              <div className={`p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)] space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {isBn ? "প্লেবুক কমপ্লায়েন্স" : "Playbook Compliance"}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {organization.playbookEnforced ? (isBn ? "সক্রিয় ও বাধ্যতামূলক" : "Active & Enforced") : (isBn ? "ঐচ্ছিক" : "Advisory Only")}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    {playbookRules.filter((r) => r.isActive).length} {isBn ? "টি সংবিধিবদ্ধ রুল টিমের অডিটে যুক্ত আছে।" : "statutory rules enforced across team audits."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePlaybookEnforce}
                  className="text-xs font-bold text-[var(--accent-solid)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {organization.playbookEnforced ? (isBn ? "নীতি পরিবর্তন করুন →" : "Configure Rules →") : (isBn ? "বাধ্যতামূলক করুন →" : "Make Mandatory →")}
                </button>
              </div>
            </div>

            {/* Privacy-Safe Metadata Audit Log */}
            <div className={`rounded-3xl border ${borderClass} bg-[var(--bg-card)] p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>{isBn ? "কমপ্লায়েন্স অডিট ট্রেইল (প্রাইভেসি-সেইফ মেটাডেটা)" : "Compliance Audit Trail (Privacy-Safe Metadata)"}</span>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {isBn
                      ? "কোন সদস্য কত ক্রেডিট ব্যবহার করেছেন তার রেকর্ড। চুক্তির ভেতরের লেখা সম্পূর্ণভাবে কর্মচারীর কাছে সুরক্ষিত।"
                      : "Shows credit consumption events without exposing member private contract bodies or chat text."}
                  </p>
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
                      <th className="pb-3 font-semibold">{isBn ? "আইন ক্যাটাগরি" : "Statute Category"}</th>
                      <th className="pb-3 font-semibold text-right">{isBn ? "ব্যয়িত ক্রেডিট" : "Credits"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--text-primary)]/5">
                    {INITIAL_AUDIT_LOGS.map((log) => (
                      <tr key={log.id} className="hover:bg-[var(--text-primary)]/5 transition-colors">
                        <td className="py-3 font-mono text-[11px] text-[var(--text-muted)]">
                          {isBn ? log.timestampBn : log.timestampEn}
                        </td>
                        <td className="py-3 font-semibold text-[var(--text-primary)]">
                          {log.memberName}
                        </td>
                        <td className="py-3 text-[var(--text-muted)]">{log.department}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-[var(--text-primary)]">
                            {log.module}
                          </span>
                        </td>
                        <td className="py-3 text-[var(--text-muted)]">{log.category}</td>
                        <td className="py-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                          -{log.creditsConsumed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MEMBER MANAGEMENT ── */}
        {activeTab === "members" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Search and Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isBn ? "সদস্যের নাম, ইমেইল বা বিভাগ দিয়ে খুঁজুন..." : "Search members by name, email, department..."}
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[var(--text-primary)]/15 bg-[var(--bg-card)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)]/30"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isBn ? "নতুন সদস্য যুক্ত করুন" : "Add Member"}</span>
              </button>
            </div>

            {/* Member Table */}
            <div className={`rounded-3xl border ${borderClass} bg-[var(--bg-card)] overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--text-primary)]/10 bg-[var(--bg-surface)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                      <th className="p-4 font-semibold">{isBn ? "সদস্য" : "Member"}</th>
                      <th className="p-4 font-semibold">{isBn ? "বিভাগ" : "Department"}</th>
                      <th className="p-4 font-semibold">{isBn ? "রোল" : "Role"}</th>
                      <th className="p-4 font-semibold">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                      <th className="p-4 font-semibold">{isBn ? "মাসিক কোটা" : "Monthly Cap"}</th>
                      <th className="p-4 font-semibold">{isBn ? "ব্যয়িত ক্রেডিট" : "Credits Used"}</th>
                      <th className="p-4 font-semibold text-right">{isBn ? "অ্যাকশন" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--text-primary)]/5">
                    {filteredMembers.map((mem) => (
                      <tr key={mem.id} className="hover:bg-[var(--text-primary)]/5 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-[var(--text-primary)]">{mem.name}</p>
                          <p className="text-[11px] text-[var(--text-muted)] font-mono">{mem.email}</p>
                        </td>
                        <td className="p-4 text-[var(--text-muted)]">{mem.department}</td>
                        <td className="p-4">
                          {mem.role === "admin" ? (
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                              Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                              Member
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {mem.status === "active" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {editingCreditMemberId === mem.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={tempCreditCap}
                                onChange={(e) => setTempCreditCap(Number(e.target.value))}
                                className="w-16 px-2 py-1 rounded-lg border border-[var(--text-primary)]/20 bg-[var(--bg-surface)] text-xs font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveMemberCreditCap(mem.id)}
                                className="p-1 rounded-md bg-emerald-500 text-white hover:bg-emerald-600"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCreditMemberId(null)}
                                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-[var(--text-primary)]">
                                {mem.monthlyCreditCap}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCreditMemberId(mem.id);
                                  setTempCreditCap(mem.monthlyCreditCap);
                                }}
                                className="text-[10px] text-[var(--accent-solid)] hover:underline cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-mono text-[var(--text-muted)]">
                          {mem.creditsUsedThisMonth} / {mem.monthlyCreditCap}
                        </td>
                        <td className="p-4 text-right">
                          {mem.role !== "admin" && (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleMemberStatus(mem.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                                  mem.status === "active"
                                    ? "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                                    : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                }`}
                              >
                                {mem.status === "active" ? (isBn ? "সাময়িক স্থগিত" : "Suspend") : (isBn ? "পুনরায় চালু" : "Activate")}
                              </button>
                            </div>
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

        {/* ── TAB 3: COMPANY LEGAL PLAYBOOK ENGINE ── */}
        {activeTab === "playbook" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Playbook Header & Add Rule Action */}
            <div className={`p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)] flex flex-col md:flex-row md:items-center justify-between gap-5`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                    {INITIAL_COMPANY_PLAYBOOK.title}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    {INITIAL_COMPANY_PLAYBOOK.version}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">
                  {isBn
                    ? "কোম্পানির নিজস্ব আইনি বিধিমালা ও রিস্ক লিমিট। আপনার টিমের সদস্যরা যখন কোনো চুক্তি অডিট করবেন, এআই ইঞ্জিন এই রুলগুলো বাধ্যতামূলকভাবে চেক করবে এবং কোনো ব্যত্যয় ঘটলে রেডলাইন পরামর্শ দেবে।"
                    : "Corporate compliance guidelines and risk tolerances. When members audit contracts in ContractMind, the AI engine verifies both Bangladesh statutes and these corporate playbook rules."}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <label className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--text-primary)]/15 text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer flex items-center gap-1.5">
                  {isUploadingPlaybook ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-sky-500" />
                  )}
                  <span>{isUploadingPlaybook ? (isBn ? "আপলোড হচ্ছে..." : "Uploading...") : (isBn ? "প্লেবুক ফাইল আপলোড" : "Upload Playbook")}</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={handlePlaybookUpload}
                    disabled={isUploadingPlaybook}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleTogglePlaybookEnforce}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    organization.playbookEnforced
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-[var(--text-primary)]/15 text-[var(--text-muted)]"
                  }`}
                >
                  {organization.playbookEnforced
                    ? isBn ? "✓ অডিটে বাধ্যতামূলক" : "✓ Mandatory in Audits"
                    : isBn ? "ঐচ্ছিক মোড" : "Advisory Mode"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 flex items-center gap-1.5 transition-opacity cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isBn ? "নতুন রুল যুক্ত করুন" : "Add Playbook Rule"}</span>
                </button>
              </div>
            </div>

            {/* List of Playbook Rules */}
            <div className="grid grid-cols-1 gap-4">
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
                          {rule.statute} ({rule.statutoryReference})
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                            rule.strictness === "mandatory"
                              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                              : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {rule.strictness}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-primary)]/90 leading-relaxed">
                        {isBn ? rule.companyRequirementBn : rule.companyRequirementEn}
                      </p>

                      <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] mb-1">
                          {isBn ? "অনুমোদিত স্ট্যান্ডার্ড ক্লজ টেমপ্লেট:" : "Approved Boilerplate Clause:"}
                        </p>
                        <p className="text-xs font-mono text-[var(--text-muted)] leading-relaxed italic">
                          "{rule.standardClauseTemplate}"
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center sm:flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleRuleActive(rule.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          rule.isActive
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25"
                            : "bg-[var(--text-primary)]/10 text-[var(--text-muted)] hover:bg-[var(--text-primary)]/20"
                        }`}
                      >
                        {rule.isActive ? (isBn ? "সক্রিয়" : "Active") : (isBn ? "নিষ্ক্রিয়" : "Disabled")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: COMPANY SHARED VAULT ── */}
        {activeTab === "vault" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className={`p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)]`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FolderLock className="w-4 h-4 text-purple-500" />
                  <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                    {isBn ? "অনুমোদিত ও শেয়ার্ড করপোরেট কন্ট্রাক্ট ভল্ট" : "Company Shared Contract Vault"}
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">
                  {isBn
                    ? "এই চুক্তিগুলো টিম মেম্বাররা স্বেচ্ছায় কোম্পানির সেন্ট্রাল ভল্টে জমা দিয়েছেন বা আইনি মতামতের জন্য সাবমিট করেছেন। কোনো সদস্যের অপ্রকাশিত ব্যক্তিগত ড্রাফট এখানে সংরক্ষিত হয় না।"
                    : "Repository of contracts voluntarily deposited by team members or submitted for legal review. Unshared employee drafts are strictly excluded."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
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
                          {isBn ? cnt.categoryBn : cnt.categoryEn}
                        </span>
                        {cnt.advocateVerified && (
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
                        {isBn ? cnt.titleBn : cnt.titleEn}
                      </h4>

                      <p className="text-xs text-[var(--text-muted)]">
                        {isBn ? "জমা দিয়েছেন:" : "Submitted by:"} <strong className="text-[var(--text-primary)]">{cnt.submittedByName}</strong> · {isBn ? cnt.submittedAtBn : cnt.submittedAtEn}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                          Risk Score
                        </p>
                        <p className={`font-mono font-bold text-sm ${cnt.riskScore > 70 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {cnt.riskScore}/100
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push(`/contractmind?id=${cnt.contractId}`)}
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

        {/* ── INVITE MEMBER MODAL ── */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-3xl border ${borderClass} bg-[var(--bg-card)] p-6 shadow-2xl space-y-5`}>
              <div className="flex items-center justify-between border-b border-[var(--text-primary)]/10 pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-purple-500" />
                  <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                    {isBn ? "কোম্পানিতে নতুন সদস্য যুক্ত করুন" : "Invite Enterprise Member"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                    {isBn ? "সদস্যের পুরো নাম" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahfuzur Rahman"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                    {isBn ? "কর্পোরেট ইমেইল ঠিকানা" : "Work Email"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="mahfuz@apexholdings.bd"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                      {isBn ? "বিভাগ" : "Department"}
                    </label>
                    <select
                      value={inviteDept}
                      onChange={(e) => setInviteDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    >
                      <option value="Human Resources">Human Resources</option>
                      <option value="Procurement">Procurement</option>
                      <option value="Corporate Legal">Corporate Legal</option>
                      <option value="Finance & Accounts">Finance & Accounts</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                      {isBn ? "মাসিক ক্রেডিট কোটা" : "Monthly Credit Cap"}
                    </label>
                    <input
                      type="number"
                      value={inviteCap}
                      onChange={(e) => setInviteCap(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-900 dark:text-purple-300">
                  {isBn
                    ? `সদস্যকে স্বয়ংক্রিয়ভাবে কোম্পানি রেফারেল কোড (${organization.referCode}) সহ আমন্ত্রণ পাঠানো হবে।`
                    : `The invite will include company code (${organization.referCode}) and allocate ${inviteCap} credits/month.`}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--text-primary)]/15 text-[var(--text-muted)] cursor-pointer"
                  >
                    {isBn ? "বাতিল" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 cursor-pointer"
                  >
                    {isBn ? "ইনভাইট পাঠান" : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── ADD RULE MODAL ── */}
        {showAddRuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-lg rounded-3xl border ${borderClass} bg-[var(--bg-card)] p-6 shadow-2xl space-y-5`}>
              <div className="flex items-center justify-between border-b border-[var(--text-primary)]/10 pb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                    {isBn ? "প্লেবুকে নতুন সংবিধিবদ্ধ রুল যুক্ত করুন" : "Add Statutory Playbook Rule"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddRuleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                    {isBn ? "ক্লজ বা রুলের শিরোনাম" : "Clause / Rule Title"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mandatory Indemnity Cap for IT Vendors"
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                      {isBn ? "প্রযোজ্য আইন" : "Governing Statute"}
                    </label>
                    <select
                      value={newRuleStatute}
                      onChange={(e) => setNewRuleStatute(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    >
                      <option value="Bangladesh Labour Act 2006">Bangladesh Labour Act 2006</option>
                      <option value="The Contract Act 1872">The Contract Act 1872</option>
                      <option value="The Copyright Act 2000">The Copyright Act 2000</option>
                      <option value="The Arbitration Act 2001">The Arbitration Act 2001</option>
                      <option value="Corporate Governance Code 2018">Corporate Governance Code 2018</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                      {isBn ? "ধারা রেফারেন্স" : "Section Reference"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Section 73 / 74"
                      value={newRuleRef}
                      onChange={(e) => setNewRuleRef(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                    {isBn ? "কোম্পানির কমপ্লায়েন্স নির্দেশনা" : "Company Compliance Requirement"}
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the exact statutory risk threshold and requirement..."
                    value={newRuleReq}
                    onChange={(e) => setNewRuleReq(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                    {isBn ? "অনুমোদিত স্ট্যান্ডার্ড ক্লজ টেমপ্লেট" : "Standard Approved Clause Template"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Standard boilerplate clause text to recommend during AI audit..."
                    value={newRuleTemplate}
                    onChange={(e) => setNewRuleTemplate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddRuleModal(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--text-primary)]/15 text-[var(--text-muted)] cursor-pointer"
                  >
                    {isBn ? "বাতিল" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 cursor-pointer"
                  >
                    {isBn ? "রুল সক্রিয় করুন" : "Activate Rule"}
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
