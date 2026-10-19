"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  INITIAL_ORGANIZATION,
  INITIAL_COMPANY_PLAYBOOK,
  INITIAL_SHARED_CONTRACTS,
  PlaybookRule,
  SharedCompanyContract,
} from "@/data/enterpriseData";
import {
  Building2,
  FileText,
  Bot,
  Coins,
  Shield,
  ShieldCheck,
  Lock,
  Share2,
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  FolderLock,
  Plus,
  AlertTriangle,
} from "lucide-react";

interface MemberPrivateContract {
  id: string;
  titleEn: string;
  titleBn: string;
  categoryEn: string;
  categoryBn: string;
  riskScore: number;
  isSharedToVault: boolean;
  contractId: string;
  updatedAt: string;
}

const INITIAL_PRIVATE_CONTRACTS: MemberPrivateContract[] = [
  {
    id: "pvt-01",
    titleEn: "Senior Software Engineer Employment & Confidentiality Agreement",
    titleBn: "সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার নিয়োগ ও গোপনীয়তা চুক্তি",
    categoryEn: "Labour & Employment",
    categoryBn: "শ্রম ও কর্মসংস্থান আইন",
    riskScore: 78,
    isSharedToVault: true,
    contractId: "employment-agreement",
    updatedAt: "16 Oct 2026",
  },
  {
    id: "pvt-02",
    titleEn: "HR Management Consultant Work-for-Hire Agreement",
    titleBn: "এইচআর ম্যানেজমেন্ট কনসালট্যান্ট চুক্তিপত্র",
    categoryEn: "Consultancy & Service Agreement",
    categoryBn: "পরামর্শক ও সার্ভিস চুক্তি",
    riskScore: 35,
    isSharedToVault: false,
    contractId: "vendor-sla",
    updatedAt: "17 Oct 2026",
  },
  {
    id: "pvt-03",
    titleEn: "Dhaka Warehouse Logistics & Fleet Sublease Draft",
    titleBn: "ঢাকা ওয়্যারহাউজ লজিস্টিকস ও ফ্লিট সাব-লিজ খসড়া",
    categoryEn: "Real Estate & Commercial Lease",
    categoryBn: "বাণিজ্যিক লিজ ও স্থাবর সম্পত্তি",
    riskScore: 68,
    isSharedToVault: false,
    contractId: "commercial-lease",
    updatedAt: "18 Oct 2026",
  },
];

export default function EnterpriseMemberPage() {
  const router = useRouter();
  const { user, loginAsDemoEnterpriseMember } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [privateContracts, setPrivateContracts] = useState<MemberPrivateContract[]>(INITIAL_PRIVATE_CONTRACTS);
  const [copiedRuleId, setCopiedRuleId] = useState<string | null>(null);

  const borderClass = "border-[var(--text-primary)]/10";
  const isMember =
    user?.role === "enterprise_member" ||
    (user?.role === "enterprise" && user?.enterpriseProfile?.isTeamMember);

  const memberName = user?.name || "Nusrat Jahan";
  const memberDept = "Human Resources Lead";
  const monthlyCap = 250;
  const creditsUsed = 120;
  const creditsRemaining = monthlyCap - creditsUsed;

  const handleToggleShare = (id: string) => {
    setPrivateContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isSharedToVault: !c.isSharedToVault } : c))
    );
  };

  const handleCopyClause = (ruleId: string, template: string) => {
    navigator.clipboard.writeText(template);
    setCopiedRuleId(ruleId);
    setTimeout(() => setCopiedRuleId(null), 2000);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">

        {/* Switcher if not member */}
        {!isMember && (
          <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                  {isBn ? "আপনি বর্তমানে এন্টারপ্রাইজ সদস্য হিসেবে লগইন করেননি" : "You are currently not logged in as Enterprise Member"}
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400">
                  {isBn ? "এইচআর মেম্বার ওয়ার্কস্পেস ও প্লেবুক পরীক্ষা করতে ১-ক্লিকে ডেমো মেম্বারে স্যুইচ করুন।" : "Switch to Demo Enterprise Member (Nusrat Jahan, HR Lead) in 1-click."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={loginAsDemoEnterpriseMember}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {isBn ? "ডেমো মেম্বার হিসেবে প্রবেশ করুন" : "Switch to Demo Member"}
            </button>
          </div>
        )}

        {/* ── Enterprise Member Header ── */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${borderClass} bg-[var(--bg-card)] shadow-sm space-y-6`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  <Building2 className="w-3.5 h-3.5" />
                  {isBn ? "এন্টারপ্রাইজ টিম মেম্বার" : "Enterprise Member Workspace"}
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 font-bold">
                  Apex Holdings Ltd.
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Corporate Playbook Active (v2.4)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                {memberName}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                {isBn ? "বিভাগ:" : "Department:"} <strong className="text-[var(--text-primary)]">{memberDept}</strong> · {user?.email || "nusrat.hr@apexholdings.bd"}
              </p>
            </div>

            {/* Member Credit Quota Pill */}
            <div className="p-4 rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-surface)] space-y-2 min-w-[240px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  {isBn ? "আপনার মাসিক কোটা" : "Monthly Credit Quota"}
                </span>
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  {creditsRemaining} {isBn ? "অবশিষ্ট" : "left"}
                </span>
              </div>
              <div className="w-full bg-[var(--text-primary)]/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${(creditsUsed / monthlyCap) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">
                {creditsUsed} / {monthlyCap} Credits used · Apex Holdings Pool
              </p>
            </div>
          </div>

          {/* Action Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/contractmind?id=employment-agreement")}
              className="p-4 rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-surface)] hover:border-[var(--text-primary)]/20 transition-all flex items-center gap-4 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                  <span>{isBn ? "কর্পোরেট প্লেবুক সহ অডিট শুরু করুন" : "Audit with Company Playbook"}</span>
                  <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)]" />
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                  {isBn ? "বাংলাদেশ আইন ও Apex Holdings স্ট্যান্ডার্ডে যাচাই" : "Verify against Bangladesh statutes & corporate policy"}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => router.push("/copilot")}
              className="p-4 rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-surface)] hover:border-[var(--text-primary)]/20 transition-all flex items-center gap-4 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                  <span>{isBn ? "এডভোটেক কোপাইলট আলোচনা" : "Advotech Copilot Chat"}</span>
                  <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)]" />
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                  {isBn ? "কোম্পানির ক্রেডিট কোটায় আইনি গবেষণা ও উত্তর" : "Statutory Q&A powered by corporate credits"}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ── ZERO-KNOWLEDGE PRIVACY NOTICE FOR MEMBER ── */}
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              {isBn ? "আপনার ব্যক্তিগত ড্রাফট ও চ্যাট সম্পূর্ণ গোপনীয়" : "Your Drafts & Chats Are 100% Confidential"}
            </h4>
            <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
              {isBn
                ? "কোম্পানি অ্যাডমিন আপনার ব্যক্তিগত চ্যাট বা ড্রাফট কন্ট্রাক্টের ভেতরের লেখা পড়তে পারবেন না। আপনি নিজে যখন 'Share to Company Vault' বাটনে চাপবেন, শুধুমাত্র সেই ডকুমেন্টটি অ্যাডমিন ও সহকর্মীদের সাথে শেয়ার হবে।"
                : "Your organization administrator cannot inspect your private chat threads or draft contract bodies. Files are only accessible to leadership when you explicitly click 'Share to Company Vault'."}
            </p>
          </div>
        </div>

        {/* ── MY PRIVATE DRAFTS & AUDITS ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>{isBn ? "আমার ড্রাফট ও অডিট রেকর্ডস" : "My Private Drafts & Audits"}</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isBn
                  ? "শুধুমাত্র আপনার দৃশ্যমান। প্রয়োজন অনুযায়ী কোম্পানির সেন্ট্রাল ভল্টে শেয়ার করতে পারেন।"
                  : "Encrypted and visible only to you. Share to the company vault when ready for team review."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/contractmind")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/15 text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isBn ? "নতুন চুক্তি অডিট" : "New Audit"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {privateContracts.map((cnt) => (
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
                      {cnt.isSharedToVault ? (
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <FolderLock className="w-3 h-3" />
                          {isBn ? "কোম্পানি ভল্টে শেয়ার্ড" : "Shared to Company Vault"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {isBn ? "প্রাইভেট (শুধুমাত্র আপনার)" : "Private to You"}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-serif font-bold text-[var(--text-primary)]">
                      {isBn ? cnt.titleBn : cnt.titleEn}
                    </h4>

                    <p className="text-xs text-[var(--text-muted)]">
                      {isBn ? "সর্বশেষ আপডেট:" : "Last updated:"} {cnt.updatedAt} · Risk Score:{" "}
                      <strong className={cnt.riskScore > 70 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>
                        {cnt.riskScore}/100
                      </strong>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleShare(cnt.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        cnt.isSharedToVault
                          ? "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20"
                          : "border-[var(--text-primary)]/15 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{cnt.isSharedToVault ? (isBn ? "ভল্ট থেকে প্রত্যাহার" : "Unshare") : (isBn ? "ভল্টে শেয়ার করুন" : "Share to Vault")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push(`/contractmind?id=${cnt.contractId}`)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 flex items-center gap-1 transition-opacity cursor-pointer shadow-sm"
                    >
                      <span>{isBn ? "অডিট মেমো" : "View Memo"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── COMPANY APPROVED PLAYBOOK & BOILERPLATE TEMPLATES ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span>{isBn ? "কোম্পানি অনুমোদিত স্ট্যান্ডার্ড শর্তাবলি ও টেমপ্লেট" : "Company Approved Boilerplate & Templates"}</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isBn
                  ? "অ্যাডমিন কর্তৃক অনুমোদিত স্ট্যান্ডার্ড ক্লজ যা আপনি আপনার খসড়া চুক্তিতে সরাসরি ব্যবহার করতে পারেন।"
                  : "Pre-approved corporate boilerplate clauses ready to paste into your contracts."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {INITIAL_COMPANY_PLAYBOOK.rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-5 rounded-2xl border ${borderClass} bg-[var(--bg-card)] space-y-3`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">
                        {isBn ? rule.clauseTypeBn : rule.clauseTypeEn}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold">
                        {rule.statute} ({rule.statutoryReference})
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {isBn ? rule.companyRequirementBn : rule.companyRequirementEn}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyClause(rule.id, rule.standardClauseTemplate)}
                    className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10 transition-colors cursor-pointer shrink-0"
                    title="Copy Clause Template"
                  >
                    {copiedRuleId === rule.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10">
                  <p className="text-xs font-mono text-[var(--text-primary)]/90 leading-relaxed italic">
                    "{rule.standardClauseTemplate}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
