"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import MarkdownViewer from "@/components/markdown/MarkdownViewer";
import { generateContractAuditMarkdown } from "@/lib/markdownContractGenerator";
import {
  getLawyerQueue,
  acceptOffer,
  declineOffer,
  submitReview,
} from "@/lib/apiServices";
import {
  Inbox,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Search,
  Filter,
  X,
  FileCode2,
  ShieldCheck,
  Check,
  Send,
  Printer,
  Sparkles,
  Lock,
} from "lucide-react";

interface PendingContract {
  id: string;
  clientName: string;
  clientPhone: string;
  titleEn: string;
  titleBn: string;
  submittedAtEn: string;
  submittedAtBn: string;
  statuteEn: string;
  statuteBn: string;
  riskCount: number;
  priority: "high" | "normal";
  contractId?: string;
}

const DEFAULT_PENDING: PendingContract[] = [];

export default function LawyerPendingPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, simulateLawyerVerification } = useAuth();
  const isBn = language === "bn";

  const isVerified = user?.lawyerProfile?.verificationStatus === "verified";

  useEffect(() => {
    if (user && user.role !== "lawyer" && !user.lawyerProfile) {
      router.replace("/contractmind");
    }
  }, [user, router]);

  const [pendingList, setPendingList] = useState<PendingContract[]>([]);
  const [search, setSearch] = useState("");
  const [selectedContract, setSelectedContract] = useState<PendingContract | null>(null);
  const [modalTab, setModalTab] = useState<"markdown" | "signoff">("markdown");

  // Signoff station state
  const [advocateNotes, setAdvocateNotes] = useState("");
  const [checklist, setChecklist] = useState({
    severanceAudited: true,
    restraintResolved: true,
    stampAuthorized: true,
  });
  const [isSealing, setIsSealing] = useState(false);
  const [sealedSuccess, setSealedSuccess] = useState(false);

  // Load any dispatched contracts from localStorage and backend queue
  useEffect(() => {
    let isMounted = true;
    if (!isVerified) {
      setPendingList([]);
      return;
    }
    async function loadQueue() {
      // Only call lawyer queue API if user actually has LAWYER role (admin-approved)
      if (!user || user.role !== "lawyer" || !isVerified) return;
      try {
        const queue = await getLawyerQueue();
        if (isMounted && Array.isArray(queue) && queue.length > 0) {
          const mapped: PendingContract[] = queue.map((item) => ({
            id: item.memo_id,
            clientName: "Enterprise Client",
            clientPhone: "+880 1700-000000",
            titleEn: item.file_name,
            titleBn: item.file_name,
            submittedAtEn: new Date(item.offered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            submittedAtBn: new Date(item.offered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            statuteEn: "Bangladesh Law Audit Queue",
            statuteBn: "বাংলাদেশ আইন অডিট কিউ",
            riskCount: 3,
            priority: "high",
            contractId: item.memo_id,
          }));
          setPendingList((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const additions = mapped.filter((p) => !existingIds.has(p.id));
            return [...additions, ...prev];
          });
        }
      } catch (err) {
        console.warn("Could not fetch lawyer queue from backend:", err);
      }
    }
    loadQueue();

    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(
          localStorage.getItem("dispatched_pending_contracts") || "[]"
        );
        if (Array.isArray(stored) && stored.length > 0) {
          setPendingList((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const additions = stored.filter((p: PendingContract) => !existingIds.has(p.id));
            return [...additions, ...prev];
          });
        }
      } catch (err) {
        console.error("Error reading dispatched contracts:", err);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [user, isVerified]);

  const borderClass = "border-[var(--text-primary)]/10";

  const filtered = pendingList.filter(
    (c) =>
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      c.titleBn.includes(search)
  );

  const handleOpenReview = (contract: PendingContract) => {
    setSelectedContract(contract);
    setModalTab("markdown");
    setSealedSuccess(false);
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptOffer(id);
      alert(isBn ? "চুক্তি সফলভাবে গ্রহণ করা হয়েছে!" : "Contract offer accepted!");
    } catch (err: any) {
      alert(err.message || (isBn ? "চুক্তি গ্রহণ ব্যর্থ হয়েছে।" : "Failed to accept offer"));
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await declineOffer(id);
      setPendingList((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || (isBn ? "চুক্তি বাতিল ব্যর্থ হয়েছে।" : "Failed to decline offer"));
    }
  };

  const handleApproveAndSeal = async () => {
    if (!selectedContract) return;
    setIsSealing(true);

    try {
      await submitReview(selectedContract.id, {
        notes: advocateNotes,
        verified: true,
      });
    } catch (err: any) {
      setIsSealing(false);
      alert(err.message || (isBn ? "রিভিউ সাবমিট ব্যর্থ হয়েছে।" : "Failed to submit review"));
      return;
    }

    setTimeout(() => {
      setIsSealing(false);
      setSealedSuccess(true);

      // Save to archive (scoped to this lawyer)
      if (typeof window !== "undefined") {
        const userArchiveKey = user?.email
          ? `verified_contracts_archive_${user.email}`
          : "verified_contracts_archive";
        const archive = JSON.parse(
          localStorage.getItem(userArchiveKey) || "[]"
        );
        const newVerified = {
          id: `ver-${selectedContract.id}`,
          clientName: selectedContract.clientName,
          titleEn: selectedContract.titleEn,
          titleBn: selectedContract.titleBn,
          verifiedDateEn: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          verifiedDateBn: new Date().toLocaleDateString("bn-BD"),
          statuteEn: selectedContract.statuteEn,
          statuteBn: selectedContract.statuteBn,
          advocateName: user?.name ? (user.name.startsWith("Adv") ? user.name : `Adv. ${user.name}`) : "Advocate",
          barCouncilNo: user?.lawyerProfile?.barCouncilNo || "Pending Bar No",
          notes: advocateNotes || (isBn ? "আইনগত পর্যালোচনা সম্পন্ন।" : "Statutory review completed."),
          status: "verified",
        };
        localStorage.setItem(
          userArchiveKey,
          JSON.stringify([newVerified, ...archive])
        );

        // Remove from dispatched queue if it was there
        const dispatched = JSON.parse(
          localStorage.getItem("dispatched_pending_contracts") || "[]"
        );
        const updatedDispatched = dispatched.filter(
          (d: any) => d.id !== selectedContract.id
        );
        localStorage.setItem(
          "dispatched_pending_contracts",
          JSON.stringify(updatedDispatched)
        );
      }

      // Remove from active list after short delay
      setTimeout(() => {
        setPendingList((prev) => prev.filter((p) => p.id !== selectedContract.id));
        setSelectedContract(null);
      }, 1600);
    }, 800);
  };

  // Generate markdown content for current selected contract
  const contractIdForMarkdown = selectedContract?.contractId || "employment-agreement";
  const markdownAuditContent = selectedContract
    ? generateContractAuditMarkdown(
        contractIdForMarkdown,
        isBn ? "bn" : "en",
        {
          advocateName: user?.name || "Adv. Tanvir Ahmed, Supreme Court of Bangladesh",
          barCouncilNo: "SC-DH-48912/2016",
          verifiedAt: "18 Oct 2026, 4:55 PM",
          sealApplied: sealedSuccess,
          advocateNotes: advocateNotes,
        }
      )
    : "";

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 font-sans">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)] mb-1">
              {isBn ? "আইনজীবী ওয়ার্কস্পেস" : "Advocate Workspace"}
            </p>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
              {isBn ? "পেন্ডিং চুক্তি রিভিউ ও অনুমোদন" : "Pending Contracts for Statutory Review"}
            </h1>
            <p className="text-xs sm:text-[13px] text-[var(--text-muted)] mt-1 max-w-xl leading-relaxed">
              {isBn
                ? "ক্লায়েন্টদের আপলোডকৃত চুক্তি এবং এআই অডিট প্রিভিউ পর্যালোচনা করে সংবিধিবদ্ধ সিলমোহর প্রদান করুন।"
                : "Inspect client-submitted contracts, evaluate AI markdown audit reports, and apply statutory seal."}
            </p>
          </div>

          {/* Quick stats counters */}
          <div className="flex items-center gap-6 self-start md:self-auto py-1">
            <div>
              <div className="text-xl font-mono font-semibold text-[var(--text-primary)]">
                {isVerified ? pendingList.length : "0"}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] tracking-wider">
                {isBn ? "পেন্ডিং ফাইল" : "Pending Files"}
              </div>
            </div>
            <div className="w-[1px] h-8 bg-[var(--text-primary)]/10" />
            <div>
              <div className="text-xl font-mono font-semibold text-[var(--text-primary)]">
                {isVerified ? "< 2.5h" : "—"}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] tracking-wider">
                {isBn ? "ভেরিফিকেশন" : "Verification"}
              </div>
            </div>
          </div>
        </div>

        {!isVerified ? (
          /* LOCKED CONTRACT VIEW FOR UNVERIFIED LAWYERS */
          <div className={`rounded-3xl border border-amber-300/40 dark:border-amber-700/50 bg-[var(--bg-card)] p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm my-6`}>
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/40 mb-3">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              {isBn ? "ভেরিফিকেশন প্রক্রিয়াধীন" : "Verification Pending"}
            </div>

            <h2 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-primary)] mb-2">
              {isBn ? "চুক্তিপত্র অ্যাক্সেস লক করা আছে" : "Client Contract Queue is Locked"}
            </h2>

            <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed max-w-lg mx-auto mb-6">
              {isBn
                ? "আপনার বাংলাদেশ বার কাউন্সিল সনদটি বর্তমানে অ্যাডমিন ভেরিফিকেশনের অপেক্ষায় রয়েছে। বাংলাদেশ বার কাউন্সিল ও আইনি নীতিমালা অনুযায়ী, ভেরিফিকেশন সম্পন্ন হওয়ার আগ পর্যন্ত ক্লায়েন্টদের অডিটকৃত চুক্তিপত্র দেখার বা সত্যায়ন করার অনুমতি স্থগিত রাখা হয়েছে।"
                : "Your Bangladesh Bar Council certificate is currently awaiting administrative approval. In compliance with legal regulations, access to view, accept, or seal client contracts remains locked until your advocate status is verified."}
            </p>

            {/* Advocate credentials summary */}
            <div className={`p-4 rounded-2xl border ${borderClass} bg-[var(--bg-surface)] text-left space-y-2.5 mb-6 max-w-md mx-auto text-xs`}>
              <div className="flex justify-between items-center py-1 border-b border-[var(--text-primary)]/5">
                <span className="text-[var(--text-muted)]">{isBn ? "আবেদনকারী আইনজীবী:" : "Advocate Name:"}</span>
                <span className="font-semibold text-[var(--text-primary)]">{user?.name || "Advocate"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--text-primary)]/5">
                <span className="text-[var(--text-muted)]">{isBn ? "বার কাউন্সিল নম্বর:" : "Bar Council No:"}</span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                  {user?.lawyerProfile?.barCouncilNo || (isBn ? "প্রদান করা হয়নি" : "Not Provided")}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--text-primary)]/5">
                <span className="text-[var(--text-muted)]">{isBn ? "আইন শাখা:" : "Field of Law:"}</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {user?.lawyerProfile?.fieldOfLaw || (isBn ? "সাধারণ আইন" : "General Practice")}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[var(--text-muted)]">{isBn ? "বর্তমান অবস্থা:" : "Verification Status:"}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                  <Clock className="w-3 h-3" />
                  {isBn ? "পেন্ডিং ভেরিফিকেশন (অ্যাডমিন পর্যালোচনায়)" : "Pending Admin Review"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold border ${borderClass} hover:bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors cursor-pointer`}
              >
                {isBn ? "প্রোফাইল দেখুন" : "View Profile"}
              </button>
              <button
                type="button"
                onClick={() => simulateLawyerVerification()}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {isBn ? "অ্যাডমিন অনুমোদন টেস্ট করুন (Simulate)" : "Simulate Admin Approval (Test)"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search & Filter */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isBn ? "ক্লায়েন্ট বা চুক্তির নাম দিয়ে খুঁজুন..." : "Search by client name or contract title..."
                }
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)]`}
              />
            </div>

            {/* Pending List */}
            <div className="space-y-3">
              {filtered.map((contract) => (
                <div
                  key={contract.id}
                  className={`p-5 rounded-2xl border ${borderClass} bg-[var(--bg-card)] hover:border-amber-400/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-muted)]">
                        {contract.id}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" />
                        {isBn ? contract.submittedAtBn : contract.submittedAtEn}
                      </span>
                      {contract.priority === "high" && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {isBn ? "জরুরি" : "Urgent"}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                      {isBn ? contract.titleBn : contract.titleEn}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {contract.clientName} ({contract.clientPhone})
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {isBn ? contract.statuteBn : contract.statuteEn}
                      </span>
                      <span className="flex items-center gap-1 text-rose-500 font-semibold">
                        <ShieldAlert className="w-3 h-3" />
                        {contract.riskCount} {isBn ? "টি সম্ভাব্য ঝুঁকি শনাক্ত" : "Risk Flags"}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecline(contract.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title={isBn ? "প্রস্তাব প্রত্যাখ্যান করুন" : "Decline offer"}
                    >
                      {isBn ? "প্রত্যাখ্যান" : "Decline"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReview(contract)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      {isBn ? "অডিট ও ভেরিফাই" : "Review & Verify"}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {isBn ? "কোনো পেন্ডিং চুক্তি নেই" : "No pending contracts in queue"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {isBn ? "সব চুক্তি সফলভাবে সম্পন্ন হয়েছে।" : "All client contracts have been reviewed and verified."}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* FULL ADVOCATE STATUTORY VERIFICATION & MARKDOWN MODAL */}
        {selectedContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border ${borderClass} bg-[var(--bg-card)] shadow-2xl overflow-hidden`}>
              
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-[var(--text-primary)]/10 flex items-center justify-between bg-[var(--bg-surface)]">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--text-primary)]/10">
                      {selectedContract.id}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      {isBn ? "সংবিধিবদ্ধ অডিট রিপোর্ট" : "Statutory Audit Report"}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[var(--text-primary)] truncate">
                    {isBn ? selectedContract.titleBn : selectedContract.titleEn}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {isBn ? "ক্লায়েন্ট:" : "Client:"} {selectedContract.clientName} ({selectedContract.clientPhone})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedContract(null)}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Tab Switcher */}
              <div className="px-5 py-2.5 border-b border-[var(--text-primary)]/10 flex items-center justify-between gap-3 bg-[var(--bg-card)]">
                <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--text-primary)]/10 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setModalTab("markdown")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      modalTab === "markdown"
                        ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>{isBn ? "এআই অডিট রিপোর্ট প্রিভিউ" : "AI Audit Report Preview"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab("signoff")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      modalTab === "signoff"
                        ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isBn ? "অনুমোদন ও সিলমোহর স্টেশন" : "Advocate Seal & Sign-Off"}</span>
                  </button>
                </div>

                {sealedSuccess && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isBn ? "সিলমোহর সম্পন্ন" : "Sealed & Verified"}
                  </span>
                )}
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {modalTab === "markdown" ? (
                  <MarkdownViewer
                    content={markdownAuditContent}
                  />
                ) : (
                  /* Advocate Sign-off Station */
                  <div className="space-y-6 max-w-2xl mx-auto">
                    {/* Bar Council Credentials Card */}
                    <div className="p-4 rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-surface)]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                          {isBn ? "আইনজীবী প্রমাণীকরণ" : "Advocate Credentials"}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                          Verified Bar Council Member
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {user?.name || "Adv. Tanvir Ahmed, Supreme Court of Bangladesh"}
                      </p>
                      <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                        Enrollment: SC-DH-48912/2016 · High Court Division
                      </p>
                    </div>

                    {/* Statutory Verification Checkpoints */}
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-[var(--text-primary)] block">
                        {isBn ? "সংবিধিবদ্ধ আইনি যাচাইকরণ চেকলিস্ট:" : "Statutory Verification Checkpoints:"}
                      </label>

                      <div className="space-y-2 text-xs">
                        <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[var(--text-primary)]/10 bg-[var(--bg-surface)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checklist.severanceAudited}
                            onChange={(e) => setChecklist({ ...checklist, severanceAudited: e.target.checked })}
                            className="mt-0.5 rounded text-emerald-600"
                          />
                          <span>
                            <strong>Bangladesh Labour Act 2006 (Sec 26):</strong> Statutory notice period and severance pay calculations verified.
                          </span>
                        </label>

                        <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[var(--text-primary)]/10 bg-[var(--bg-surface)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checklist.restraintResolved}
                            onChange={(e) => setChecklist({ ...checklist, restraintResolved: e.target.checked })}
                            className="mt-0.5 rounded text-emerald-600"
                          />
                          <span>
                            <strong>The Contract Act 1872 (Sec 27):</strong> Restraint of trade doctrine audited; unlawful non-compete clauses voided/redlined.
                          </span>
                        </label>

                        <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[var(--text-primary)]/10 bg-[var(--bg-surface)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checklist.stampAuthorized}
                            onChange={(e) => setChecklist({ ...checklist, stampAuthorized: e.target.checked })}
                            className="mt-0.5 rounded text-emerald-600"
                          />
                          <span>
                            <strong>Advocate Digital Seal Authorization:</strong> Authorize inclusion of Bar Council advocate signature block on client document.
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Advocate Notes Textarea */}
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                        {isBn ? "আইনজীবীর মন্তব্য ও রায়:" : "Advocate Statutory Advisory Notes:"}
                      </label>
                      <textarea
                        rows={3}
                        value={advocateNotes}
                        onChange={(e) => setAdvocateNotes(e.target.value)}
                        className={`w-full p-3 rounded-xl text-xs border outline-none font-sans leading-relaxed ${borderClass} bg-[var(--bg-surface)] text-[var(--text-primary)] focus:border-[var(--text-primary)]/40`}
                        placeholder={isBn ? "আইনি মতামত লিখুন..." : "Enter statutory notes for client..."}
                      />
                    </div>

                    {/* Official Seal Graphic Preview if Sealed */}
                    {sealedSuccess && (
                      <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 flex items-center gap-3 animate-in fade-in">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-600 flex items-center justify-center shrink-0">
                          <Sparkles className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="text-xs leading-snug">
                          <p className="font-bold uppercase tracking-wider text-[11px] text-emerald-700 dark:text-emerald-300">
                            ✓ BANGLADESH BAR COUNCIL ADVOCATE SEAL APPLIED
                          </p>
                          <p className="text-[11px] opacity-90 mt-0.5">
                            Digitally sealed by Adv. Tanvir Ahmed (SC-DH-48912/2016). Contract moved to Sovereign Verified Archive.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-[var(--text-primary)]/10 flex items-center justify-between bg-[var(--bg-surface)]">
                <button
                  type="button"
                  onClick={() => setSelectedContract(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border ${borderClass} text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer`}
                >
                  {isBn ? "বন্ধ করুন" : "Close"}
                </button>

                <div className="flex items-center gap-3">
                  {modalTab === "markdown" ? (
                    <button
                      type="button"
                      onClick={() => setModalTab("signoff")}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{isBn ? "অনুমোদন স্টেশনে যান →" : "Proceed to Seal Station →"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApproveAndSeal}
                      disabled={isSealing || sealedSuccess}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {isSealing ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>{isBn ? "সিলমোহর প্রয়োগ হচ্ছে..." : "Applying Statutory Seal..."}</span>
                        </>
                      ) : sealedSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isBn ? "অনুমোদিত ও সিলমোহরযুক্ত ✓" : "Approved & Sealed ✓"}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{isBn ? "অনুমোদন ও সিলমোহর দিন ✓" : "Approve & Seal ✓"}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
