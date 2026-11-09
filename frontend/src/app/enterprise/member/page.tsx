/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  getContractHistory,
  listPlaybooks,
  ContractHistoryItem,
  Playbook,
} from "@/lib/apiServices";
import {
  Building2, FileText, Bot, Coins, ShieldCheck, 
  ArrowUpRight, BookOpen, Plus, Loader2, RefreshCw, Clock
} from "lucide-react";

export default function EnterpriseMemberPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [isLoading, setIsLoading] = useState(true);
  const [myContracts, setMyContracts] = useState<ContractHistoryItem[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);

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
    if (userRole !== "ENTERPRISE_MEMBER" && userRole !== "ENTERPRISE_ADMIN" && userRole !== "ENTERPRISE" && userRole !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [contractsRes, playbooksRes] = await Promise.allSettled([
        getContractHistory(), // Fetch member's own contracts
        listPlaybooks(),      // Fetch company playbooks
      ]);

      if (contractsRes.status === "fulfilled") {
        setMyContracts(contractsRes.value);
      }
      if (playbooksRes.status === "fulfilled") {
        setPlaybooks(playbooksRes.value.filter((p) => p.is_active)); 
      }
      
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error("Failed to load member data", err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const borderClass = "border-[var(--text-primary)]/10";

  // User profile data mapping
  const memberName = user?.name || "Member";
  const companyName = user?.enterpriseProfile?.companyName || "Company";
  const memberDept = user?.enterpriseProfile?.companyType || "Employee";

  // Quota mapping from AuthContext
  const monthlyCap = (user as any)?.member_credit_quota ?? 0;
  const creditsUsed = (user as any)?.member_credit_used ?? 0;
  const creditsRemaining = Math.max(0, monthlyCap - creditsUsed);
  const approvalStatus = (user as any)?.member_approval_status || user?.enterpriseProfile?.memberApprovalStatus || "APPROVED";
  const isPendingApproval = String(approvalStatus).toUpperCase() === "PENDING";

  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-(--text-muted)">{isBn ? "ওয়ার্কস্পেস লোড হচ্ছে..." : "Loading workspace..."}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">

        {/* Pending Approval Notice Banner */}
        {isPendingApproval && (
          <div className="p-6 rounded-3xl border border-amber-300/40 dark:border-amber-700/50 bg-amber-500/5 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/40">
              <Clock className="w-3.5 h-3.5" />
              {isBn ? "কোম্পানি অ্যাডমিন অনুমোদন অপেক্ষমাণ" : "Pending Company Admin Approval"}
            </div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-[var(--text-primary)]">
              {isBn ? "আপনার মেম্বারশিপ আবেদন প্রক্রিয়াধীন রয়েছে" : "Your Membership is Pending Admin Approval"}
            </h2>
            <p className="text-xs text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
              {isBn
                ? `আপনি সফলভাবে ${companyName} এ যোগদানের আবেদন করেছেন। আপনার কোম্পানি অ্যাডমিন এটি অনুমোদন করে ক্রেডিট বরাদ্দ দিলে আপনি চুক্তি অডিট ও টিম ওয়ার্কস্পেস ব্যবহার করতে পারবেন।`
                : `You have submitted a request to join ${companyName}. Once your Company Administrator approves your account and assigns a credit quota, all enterprise features will be unlocked.`}
            </p>
            <div className="pt-1 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={loadData}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--text-primary)]/15 hover:bg-[var(--bg-surface)] text-[var(--text-primary)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isBn ? "স্ট্যাটাস রিফ্রেশ করুন" : "Refresh Status"}</span>
              </button>
            </div>
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
                  {companyName}
                </span>
                {playbooks.length > 0 && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Corporate Playbook Active
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                {memberName}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                {isBn ? "বিভাগ:" : "Department:"} <strong className="text-[var(--text-primary)]">{memberDept}</strong> · {user?.email}
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
                  style={{ width: `${monthlyCap > 0 ? (creditsUsed / monthlyCap) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">
                {creditsUsed} / {monthlyCap} Credits used · {companyName} Pool
              </p>
            </div>
          </div>

          {/* Action Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/contractmind")}
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
                  {isBn ? "বাংলাদেশ আইন ও কোম্পানি স্ট্যান্ডার্ডে যাচাই" : "Verify against statutes & corporate policy"}
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
                  {isBn ? "কোম্পানির ক্রেডিট কোটায় আইনি গবেষণা" : "Statutory Q&A powered by corporate credits"}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ── CORPORATE TRANSPARENCY NOTICE ── */}
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              {isBn ? "কর্পোরেট ট্রান্সপারেন্সি পলিসি" : "Corporate Transparency Policy"}
            </h4>
            <p className="text-xs text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
              {isBn
                ? "যেহেতু আপনি কোম্পানির ক্রেডিট ব্যবহার করছেন, তাই আপনার অডিট করা সকল চুক্তিপত্র কোম্পানির সেন্ট্রাল ভল্টে স্বয়ংক্রিয়ভাবে জমা হবে এবং কোম্পানি অ্যাডমিন তা দেখতে পারবেন।"
                : "Because you are using company credits, all contracts you audit are automatically deposited into the Company Vault and are visible to your Organization Administrator."}
            </p>
          </div>
        </div>

        {/* ── MY AUDITS (MEMBER'S OWN HISTORY) ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>{isBn ? "আমার অডিট করা চুক্তিসমূহ" : "My Audited Contracts"}</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isBn ? "আপনার অডিট করা চুক্তিগুলোর তালিকা।" : "List of contracts you have audited."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadData} className="p-2 rounded-xl border border-(--text-primary)/10 hover:bg-(--text-primary)/5">
                <RefreshCw className="w-3.5 h-3.5 text-(--text-muted)" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/contractmind")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/15 text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isBn ? "নতুন চুক্তি অডিট" : "New Audit"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {myContracts.length === 0 && (
              <p className="text-sm text-(--text-muted) p-4 text-center">{isBn ? "কোনো চুক্তি পাওয়া যায়নি।" : "No contracts found."}</p>
            )}
            {myContracts.map((cnt) => (
              <div key={cnt.id} className={`p-5 rounded-2xl border ${borderClass} bg-[var(--bg-card)] space-y-4 hover:border-(--text-primary)/20 transition-colors`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--text-primary)]/10">
                        {cnt.id}
                      </span>
                      <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                        {cnt.overall_risk || "UNKNOWN"} RISK
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Visible to Admin
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-serif font-bold text-[var(--text-primary)]">
                      {cnt.title}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Updated: {new Date(cnt.created_at).toLocaleDateString()} · Score: {cnt.risk_score ?? 0}/100
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2.5">
                    <button
                      onClick={() => router.push(`/contractmind?id=${cnt.contract_id}`)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] flex items-center gap-1 cursor-pointer hover:opacity-90 shadow-sm"
                    >
                      <span>{isBn ? "মেমো দেখুন" : "View Memo"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── COMPANY PLAYBOOK ── */}
        {playbooks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span>{isBn ? "কোম্পানি প্লেবুক ও টেমপ্লেট" : "Company Approved Boilerplate"}</span>
            </h3>

            {playbooks.map((pb) => (
              <div key={pb.id} className={`p-5 rounded-2xl border ${borderClass} bg-[var(--bg-card)]`}>
                <h4 className="font-bold text-sm mb-2">{pb.title}</h4>
                <p className="text-xs text-(--text-muted)">Total Rules: {pb.rule_count}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </AppShell>
  );
}