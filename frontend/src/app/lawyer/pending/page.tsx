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
  getActiveTasks,
  submitReview,
  startContractReviewChat,
  ActiveTask,
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
    if (!user) {
      router.replace("/login");
      return;
    }
    const userRole = String(user.role).toUpperCase();
    if (userRole !== "LAWYER" && userRole !== "ADMIN") {
      router.replace("/dashboard"); // Kick GENERAL users to their dashboard
    }
  }, [user, router]);

  const [pendingList, setPendingList] = useState<PendingContract[]>([]);
  const [activeTasks, setActiveTasks] = useState<PendingContract[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"queue" | "active">("queue");
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
      setActiveTasks([]);
      return;
    }
    async function loadQueueAndTasks() {
      if (!user || user.role !== "lawyer" || !isVerified) return;
      try {
        const [queueRes, activeRes] = await Promise.allSettled([
          getLawyerQueue(),
          getActiveTasks(),
        ]);

        if (isMounted && queueRes.status === "fulfilled" && Array.isArray(queueRes.value) && queueRes.value.length > 0) {
          const mappedQueue: PendingContract[] = queueRes.value.map((item) => ({
            id: String(item.memo_id),
            clientName: "Enterprise Client",
            clientPhone: "+880 1700-000000",
            titleEn: item.contract_title || item.file_name || "Commercial Contract",
            titleBn: item.contract_title || item.file_name || "বাণিজ্যিক চুক্তিপত্র",
            submittedAtEn: item.offered_at ? new Date(item.offered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
            submittedAtBn: item.offered_at ? new Date(item.offered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "এইমাত্র",
            statuteEn: "Bangladesh Law Audit Queue · ৳1,000 Payout",
            statuteBn: "বাংলাদেশ আইন অডিট কিউ · ৳১,০০০ ফি",
            riskCount: item.risk_score ? Math.round(item.risk_score / 25) : 3,
            priority: item.priority === "URGENT" || item.priority === "HIGH" ? "high" : "normal",
            contractId: String(item.memo_id),
          }));
          setPendingList(mappedQueue);
        }

        if (isMounted && activeRes.status === "fulfilled" && Array.isArray(activeRes.value) && activeRes.value.length > 0) {
          const mappedActive: PendingContract[] = activeRes.value.map((item) => ({
            id: String(item.memo_id),
            clientName: "Enterprise Client",
            clientPhone: "+880 1700-000000",
            titleEn: item.contract_title || item.file_name || "Active Contract Under Review",
            titleBn: item.contract_title || item.file_name || "পর্যালোচনাধীন সক্রিয় চুক্তিপত্র",
            submittedAtEn: item.accepted_at ? new Date(item.accepted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active",
            submittedAtBn: item.accepted_at ? new Date(item.accepted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "সক্রিয়",
            statuteEn: "Active SLA: 3 Hours Submit Window",
            statuteBn: "সক্রিয় এসএলএ: ৩ ঘণ্টা সময়সীমা",
            riskCount: 3,
            priority: "high",
            contractId: String(item.memo_id),
          }));
          setActiveTasks(mappedActive);
        }
      } catch (err) {
        console.warn("Could not fetch lawyer queue from backend:", err);
      }
    }
    loadQueueAndTasks();

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

  const currentList = activeSubTab === "queue" ? pendingList : activeTasks;

  const filtered = currentList.filter(
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
      alert(
        isBn
          ? "চুক্তি সফলভাবে গ্রহণ করা হয়েছে! এটি আপনার সক্রিয় পর্যালোচনা টাস্কে যুক্ত হয়েছে (সময়সীমা: ৩ ঘণ্টা)।"
          : "Contract offer accepted! Moved to Active Review Tasks (3-hour SLA window)."
      );
      const acceptedItem = pendingList.find((p) => p.id === id);
      if (acceptedItem) {
        setPendingList((prev) => prev.filter((p) => p.id !== id));
        setActiveTasks((prev) => [acceptedItem, ...prev]);
        setActiveSubTab("active");
      }
    } catch (err: any) {
      alert(err.message || (isBn ? "চুক্তি গ্রহণ ব্যর্থ হয়েছে।" : "Failed to accept offer"));
    }
  };

  const handleDecline = async (id: string) => {
    const reason = prompt(isBn ? "বাতিলের কারণ লিখুন:" : "Enter reason for declining:") || "Outside my specialization area.";
    try {
      await declineOffer(id, reason);
      setPendingList((prev) => prev.filter((p) => p.id !== id));
      alert(isBn ? "অফার প্রত্যাখ্যান করা হয়েছে।" : "Offer declined and re-queued.");
    } catch {
      setPendingList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleStartAiChat = async (id: string) => {
    try {
      const res = await startContractReviewChat(id);
      alert(
        isBn
          ? `এআই আইনি গবেষণা সেশন #${res.session_id} সক্রিয় করা হয়েছে! (আইনজীবীদের জন্য বিনামূল্যে ১০ মেসেজ)`
          : `AI Legal Research Chat Session #${res.session_id} initiated! (Free for lawyers, limit 10 msgs)`
      );
    } catch (err: any) {
      alert(err.message || "Failed to start AI chat session");
    }
  };

  const handleApproveAndSeal = async () => {
    if (!selectedContract) return;
    setIsSealing(true);

    try {
      await submitReview(selectedContract.id, {
        notes: advocateNotes,
        lawyer_notes: advocateNotes,
        verified: true,
        updated_clauses: [
          {
            clause_number: "§ 1",
            clause_title: "Non-Compete & Restraint of Trade",
            risk_level: "Compliant with Amendment",
            legal_explanation: advocateNotes || "Statutory audit completed under Bangladesh Labour Act 2006 & Contract Act 1872 Section 27.",
            proposed_safe_redline: "Non-compete term reduced to 12 months maximum within Dhaka Division.",
            is_compliant: true,
          },
        ],
        signature_url: `signatures/lawyer_${user?.id || "42"}.png`,
        signed_pdf_url: `signed_contracts/memo_${selectedContract.id}_final.pdf`,
      });
    } catch (err: any) {
      console.warn("Submit review note:", err);
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

  const userRole = user ? String(user.role).toUpperCase() : "";
  if (!user || (userRole !== "LAWYER" && userRole !== "ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
                onClick={() => router.push("/admin")}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{isBn ? "অ্যাডমিন অনুমোদন প্যানেল খুলুন" : "Open Admin Approval Panel"}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Sub-tabs: Offer Queue vs Active Tasks */}
            <div className="flex items-center gap-2 mb-6 border-b border-[var(--text-primary)]/10 pb-3">
              <button
                type="button"
                onClick={() => setActiveSubTab("queue")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === "queue"
                    ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>{isBn ? "পেন্ডিং অফার কিউ (Offer Queue)" : "Offer Queue"}</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
                  {pendingList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab("active")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === "active"
                    ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isBn ? "সক্রিয় পর্যালোচনা (Active Review Tasks)" : "Active Review Tasks"}</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
                  {activeTasks.length}
                </span>
              </button>
            </div>

            {/* Search & Filter */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  activeSubTab === "queue"
                    ? isBn
                      ? "অফার কিউ থেকে চুক্তি খুঁজুন..."
                      : "Search offer queue..."
                    : isBn
                    ? "সক্রিয় টাস্ক থেকে চুক্তি খুঁজুন..."
                    : "Search active review tasks..."
                }
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)]`}
              />
            </div>

            {/* Pending / Active List */}
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

                  {/* Action Buttons based on Queue vs Active */}
                  <div className="shrink-0 flex items-center gap-2 flex-wrap">
                    {activeSubTab === "queue" ? (
                      <>
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
                          onClick={() => handleAccept(contract.id)}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isBn ? "অফার গ্রহণ করুন (৳১,০০০)" : "Accept Offer (৳1,000)"}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartAiChat(contract.id)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1"
                          title={isBn ? "এআই লিগ্যাল রিসার্চ" : "AI Legal Research"}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isBn ? "এআই রিসার্চ" : "AI Research"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenReview(contract)}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          {isBn ? "রিভিউ ও সিলমোহর" : "Review & Seal"}
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {activeSubTab === "queue"
                      ? isBn
                        ? "কোনো পেন্ডিং অফার নেই"
                        : "No pending contract offers in queue"
                      : isBn
                      ? "কোনো সক্রিয় পর্যালোচনা টাস্ক নেই"
                      : "No active review tasks"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {activeSubTab === "queue"
                      ? isBn
                        ? "নতুন কোনো ক্লায়েন্ট চুক্তি জমা হলে এখানে প্রদর্শিত হবে।"
                        : "New client contracts dispatched for review will appear here."
                      : isBn
                      ? "অফার কিউ থেকে চুক্তি গ্রহণ করলে এখানে দেখতে পাবেন।"
                      : "Accept offers from the Offer Queue to work on them here."}
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
