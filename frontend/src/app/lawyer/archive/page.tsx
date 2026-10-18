"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import MarkdownViewer from "@/components/markdown/MarkdownViewer";
import { generateContractAuditMarkdown } from "@/lib/markdownContractGenerator";
import {
  getLawyerEarnings,
  listWithdrawals,
  requestWithdrawal,
  EarningsDashboard,
  WithdrawalRequest,
} from "@/lib/apiServices";
import {
  Archive,
  Search,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  FileCheck,
  FileText,
  FileCode2,
  X,
  Sparkles,
  Coins,
  Wallet,
  ArrowDownRight,
  Send,
  Loader2,
} from "lucide-react";

interface ArchivedVerification {
  id: string;
  clientName: string;
  titleEn: string;
  titleBn: string;
  verifiedDateEn: string;
  verifiedDateBn: string;
  statuteEn: string;
  statuteBn: string;
  advocateName?: string;
  barCouncilNo?: string;
  notes?: string;
  contractId?: string;
  status: "verified";
}

const SAMPLE_ARCHIVE: ArchivedVerification[] = [
  {
    id: "ver-901",
    clientName: "Rahim Chowdhury",
    titleEn: "Commercial Property Lease Agreement (Gulshan-2)",
    titleBn: "বাণিজ্যিক ভবন ভাড়া চুক্তিপত্র (গুলশান-২)",
    verifiedDateEn: "Oct 12, 2026",
    verifiedDateBn: "১২ অক্টোবর ২০২৬",
    statuteEn: "Premises Rent Control Act, 1991",
    statuteBn: "বাড়ি ভাড়া নিয়ন্ত্রণ আইন, ১৯৯১",
    advocateName: "Adv. Kamal Hossain, Bangladesh Bar Council",
    barCouncilNo: "BC-REG-31045/2014",
    notes: "Reviewed against Premises Rent Control Act 1991. The security deposit cap and fair market escalation clause comply with statutory caps.",
    contractId: "commercial-lease",
    status: "verified",
  },
  {
    id: "ver-902",
    clientName: "Green Agro Biotech Ltd.",
    titleEn: "Annual Supply Agreement with Cold Storage Operators",
    titleBn: "হিমাগার পরিচালন ও বার্ষিক সরবরাহ চুক্তি",
    verifiedDateEn: "Sep 28, 2026",
    verifiedDateBn: "২৮ সেপ্টেম্বর ২০২৬",
    statuteEn: "Sale of Goods Act, 1930",
    statuteBn: "পণ্য বিক্রয় আইন, ১৯৩০",
    advocateName: "Adv. Tanvir Ahmed, Supreme Court of Bangladesh",
    barCouncilNo: "SC-DH-48912/2016",
    notes: "Delivery warranties and perishable goods damages are compliant with Section 16 of Sale of Goods Act 1930.",
    contractId: "vendor-sla",
    status: "verified",
  },
  {
    id: "ver-903",
    clientName: "Anisur Rahman",
    titleEn: "Senior Software Engineer Employment & Confidentiality",
    titleBn: "নিয়োগ ও নন-কম্পিট চুক্তিপত্র (সিনিয়র ডেভেলপার)",
    verifiedDateEn: "Sep 15, 2026",
    verifiedDateBn: "১৫ সেপ্টেম্বর ২০২৬",
    statuteEn: "Bangladesh Labour Act 2006 (Sec 26/27)",
    statuteBn: "বাংলাদেশ শ্রম আইন ২০০৬ ও চুক্তি আইন ধারা ২৭",
    advocateName: "Adv. Tanvir Ahmed, Supreme Court of Bangladesh",
    barCouncilNo: "SC-DH-48912/2016",
    notes: "Notice pay statutory requirements satisfied. Liquidated damages trimmed down to reasonable compensation.",
    contractId: "employment-agreement",
    status: "verified",
  },
];

export default function LawyerArchivePage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [activeTab, setActiveTab] = useState<"archive" | "earnings">("archive");
  const [search, setSearch] = useState("");
  const [archiveList, setArchiveList] = useState<ArchivedVerification[]>(SAMPLE_ARCHIVE);
  const [selectedPreview, setSelectedPreview] = useState<ArchivedVerification | null>(null);

  // Earnings & Withdrawal state
  const [earnings, setEarnings] = useState<EarningsDashboard | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [bkashNumber, setBkashNumber] = useState<string>("01700000000");
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<string | null>(null);

  const fetchEarningsData = async () => {
    try {
      const [earnRes, withRes] = await Promise.allSettled([
        getLawyerEarnings(),
        listWithdrawals(),
      ]);
      if (earnRes.status === "fulfilled" && earnRes.value) {
        setEarnings(earnRes.value);
      }
      if (withRes.status === "fulfilled" && Array.isArray(withRes.value)) {
        setWithdrawals(withRes.value);
      }
    } catch (err) {
      console.warn("Could not load earnings/withdrawals:", err);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  // Load dynamically verified contracts from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(
          localStorage.getItem("verified_contracts_archive") || "[]"
        );
        if (Array.isArray(stored) && stored.length > 0) {
          const existingIds = new Set(SAMPLE_ARCHIVE.map((a) => a.id));
          const newEntries = stored.filter(
            (s: ArchivedVerification) => !existingIds.has(s.id)
          );
          setArchiveList([...newEntries, ...SAMPLE_ARCHIVE]);
        }
      } catch (err) {
        console.error("Error reading verified archive:", err);
      }
    }
  }, []);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bkashNumber || withdrawAmount <= 0) return;
    try {
      setIsSubmittingWithdrawal(true);
      setWithdrawalSuccess(null);
      const res = await requestWithdrawal(withdrawAmount, bkashNumber);
      setWithdrawalSuccess(
        isBn
          ? `উইথড্রয়াল রিকোয়েস্ট সফল হয়েছে! রেফারেন্স আইডি: ${res.id}`
          : `Withdrawal request submitted successfully! Ref: ${res.id}`
      );
      fetchEarningsData();
    } catch (err: any) {
      alert(err.message || "Failed to submit withdrawal request.");
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  const borderClass = "border-[var(--text-primary)]/10";

  const filtered = archiveList.filter(
    (item) =>
      item.clientName.toLowerCase().includes(search.toLowerCase()) ||
      item.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      item.titleBn.includes(search)
  );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 mb-3">
              <Archive className="w-3.5 h-3.5" />
              {isBn ? "ভেরিফাইড ও পে-আউট ড্যাশবোর্ড" : "Verification & Payout Hub"}
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)]">
              {activeTab === "archive"
                ? isBn ? "আর্কাইভকৃত চুক্তিপত্র ও সিলমোহর" : "Archived & Sealed Contracts"
                : isBn ? "উপার্জন ও bKash পে-আউট" : "Earnings & bKash Payouts"}
            </h1>
            <p className="text-xs md:text-sm text-[var(--text-muted)] mt-1">
              {activeTab === "archive"
                ? isBn
                  ? "আপনার দ্বারা পূর্বে যাচাই ও আইনগতভাবে সিলমোহর দেওয়া সম্পন্ন চুক্তিপত্রের রেকর্ড ও মার্কডাউন অডিট।"
                  : "Completed records of contracts vetted, redlined, and digitally sealed under Bangladesh Law."
                : isBn
                  ? "আইনি পর্যালোচনার বিপরীতে অর্জিত ক্রেডিট ও বিকাশ অ্যাকাউন্টে সরাসরি উত্তোলনের আবেদন।"
                  : "Track review earnings, pending balances, and request instant bKash withdrawals."}
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("archive")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "archive"
                  ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{isBn ? "সিলমোহরকৃত আর্কাইভ" : "Sealed Archive"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("earnings")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "earnings"
                  ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{isBn ? "উপার্জন ও পে-আউট" : "Earnings & Payout"}</span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: ARCHIVE ── */}
        {activeTab === "archive" && (
          <div>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isBn ? "আর্কাইভ চুক্তি খুঁজুন..." : "Search archived contracts..."}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)]`}
              />
            </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border ${borderClass} bg-[var(--bg-card)] flex flex-col md:flex-row md:items-center justify-between gap-4`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-muted)]">
                    {item.id}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3" />
                    {isBn ? "ভেরিফাইড ও সিলমোহরকৃত" : "Verified & Sealed"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                    <Calendar className="w-3 h-3" />
                    {isBn ? item.verifiedDateBn : item.verifiedDateEn}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  {isBn ? item.titleBn : item.titleEn}
                </h3>

                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {item.clientName}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {isBn ? item.statuteBn : item.statuteEn}
                  </span>
                  {item.advocateName && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <Sparkles className="w-3 h-3" />
                      {item.advocateName.split(",")[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPreview(item)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>{isBn ? "সিলমোহরকৃত রিপোর্ট দেখুন" : "View Sealed Report"}</span>
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className={`p-12 text-center rounded-2xl border ${borderClass} bg-[var(--bg-card)]`}>
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {isBn ? "কোনো আর্কাইভ রেকর্ড পাওয়া যায়নি" : "No archived contracts found"}
              </p>
            </div>
          )}
          </div>
        </div>
      )}

        {/* ── TAB 2: EARNINGS & BKASH PAYOUT ── */}
        {activeTab === "earnings" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl border ${borderClass} bg-[var(--bg-card)]`}>
                <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  {isBn ? "মোট অর্জিত ক্রেডিট" : "Total Earned"}
                </p>
                <p className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">
                  ৳{earnings?.total_earned_credits ?? 1450}
                </p>
                <span className="text-[10px] text-emerald-500 font-semibold">
                  {isBn ? "ভেরিফিকেশন ফি থেকে" : "From statutory reviews"}
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${borderClass} bg-[var(--bg-card)]`}>
                <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  {isBn ? "পেন্ডিং পে-আউট" : "Pending Payout"}
                </p>
                <p className="text-xl sm:text-2xl font-bold font-mono text-amber-500 mt-1">
                  ৳{earnings?.pending_payout_credits ?? 350}
                </p>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {isBn ? "উত্তোলনযোগ্য ব্যালেন্স" : "Available to withdraw"}
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${borderClass} bg-[var(--bg-card)]`}>
                <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  {isBn ? "সম্পন্ন অডিট" : "Reviews Sealed"}
                </p>
                <p className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">
                  {earnings?.completed_reviews ?? 4}
                </p>
                <span className="text-[10px] text-sky-500 font-semibold">
                  {isBn ? "আইনগত সিলমোহরকৃত" : "Digitally sealed"}
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${borderClass} bg-[var(--bg-card)]`}>
                <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  {isBn ? "রেটিং ও বিশ্বাসযোগ্যতা" : "Advocate Rating"}
                </p>
                <p className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">
                  {earnings?.avg_rating ?? "5.0"} ★
                </p>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {isBn ? "ক্লায়েন্ট সন্তুষ্টি" : "Client feedback"}
                </span>
              </div>
            </div>

            {/* bKash Withdrawal Box */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${borderClass} bg-[var(--bg-card)] shadow-sm space-y-6`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[var(--text-primary)]">
                    {isBn ? "বিকাশ (bKash) অ্যাকাউন্টে টাকা উত্তোলন" : "Request Payout via bKash"}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {isBn
                      ? "আপনার অর্জিত ব্যালেন্স সরাসরি আপনার বিকাশ পার্সোনাল অ্যাকাউন্টে গ্রহণ করুন (১ ক্রেডিট = ১ টাকা)।"
                      : "Directly transfer your review fees to your bKash personal wallet (1 credit = 1 BDT)."}
                  </p>
                </div>
              </div>

              {withdrawalSuccess && (
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{withdrawalSuccess}</span>
                </div>
              )}

              <form onSubmit={handleWithdrawalSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                    {isBn ? "উত্তোলনের পরিমাণ (টাকা / ক্রেডিট)" : "Withdrawal Amount (BDT / Credits)"}
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none font-mono ${borderClass} bg-[var(--bg-surface)] text-[var(--text-primary)]`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                    {isBn ? "বিকাশ মোবাইল নম্বর" : "bKash Mobile Account"}
                  </label>
                  <input
                    type="text"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    placeholder="017XXXXXXXX"
                    required
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none font-mono ${borderClass} bg-[var(--bg-surface)] text-[var(--text-primary)]`}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmittingWithdrawal}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#E2136E] text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {isSubmittingWithdrawal ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{isBn ? "বিকাশ রিকোয়েস্ট পাঠান" : "Submit bKash Request"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Withdrawal History Table */}
            <div className={`p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)] space-y-4`}>
              <h4 className="text-sm font-serif font-bold text-[var(--text-primary)]">
                {isBn ? "সাম্প্রতিক উত্তোলনের ইতিহাস" : "Recent Payout Requests"}
              </h4>

              {withdrawals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--text-primary)]/10 text-[var(--text-muted)] uppercase text-[10px]">
                        <th className="py-2.5">{isBn ? "আইডি" : "Ref ID"}</th>
                        <th className="py-2.5">{isBn ? "তারিখ" : "Date"}</th>
                        <th className="py-2.5">{isBn ? "পরিমাণ" : "Amount"}</th>
                        <th className="py-2.5">{isBn ? "বিকাশ নম্বর" : "bKash No"}</th>
                        <th className="py-2.5 text-right">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--text-primary)]/5 font-mono">
                      {withdrawals.map((w) => (
                        <tr key={w.id}>
                          <td className="py-2.5 text-[var(--text-primary)] font-bold">{w.id.slice(0, 8)}</td>
                          <td className="py-2.5 text-[var(--text-muted)]">
                            {new Date(w.requested_at).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 font-bold text-emerald-500">৳{w.amount_credits}</td>
                          <td className="py-2.5 text-[var(--text-muted)]">{w.bkash_number}</td>
                          <td className="py-2.5 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                w.status === "paid" || w.status === "approved"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {w.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                  {isBn ? "এখনও কোনো উত্তোলন আবেদন করা হয়নি।" : "No withdrawal requests made yet."}
                </p>
              )}
            </div>
          </div>
        )}
        {selectedPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border ${borderClass} bg-[var(--bg-card)] shadow-2xl overflow-hidden`}>
              <div className="p-4 sm:p-5 border-b border-[var(--text-primary)]/10 flex items-center justify-between bg-[var(--bg-surface)]">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--text-primary)]/10">
                      {selectedPreview.id}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isBn ? "সংবিধিবদ্ধ সিলমোহরকৃত অডিট" : "Statutory Sealed Audit"}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[var(--text-primary)] truncate">
                    {isBn ? selectedPreview.titleBn : selectedPreview.titleEn}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {isBn ? "ক্লায়েন্ট:" : "Client:"} {selectedPreview.clientName} · {isBn ? selectedPreview.verifiedDateBn : selectedPreview.verifiedDateEn}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPreview(null)}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <MarkdownViewer
                  content={generateContractAuditMarkdown(
                    selectedPreview.contractId || "employment-agreement",
                    isBn ? "bn" : "en",
                    {
                      advocateName: selectedPreview.advocateName || "Adv. Tanvir Ahmed, Supreme Court of Bangladesh",
                      barCouncilNo: selectedPreview.barCouncilNo || "SC-DH-48912/2016",
                      verifiedAt: isBn ? selectedPreview.verifiedDateBn : selectedPreview.verifiedDateEn,
                      sealApplied: true,
                      advocateNotes: selectedPreview.notes,
                    }
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
