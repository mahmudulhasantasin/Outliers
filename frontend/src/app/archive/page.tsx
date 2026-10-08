"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { SAMPLE_CONTRACTS } from "@/data/sampleContracts";
import { CONTRACT_AUDITS } from "@/data/contractAudits";
import {
  FolderClock,
  Search,
  ArrowUpRight,
  Bot,
  Printer,
  Trash2,
  FileText,
  ShieldCheck,
  Filter
} from "lucide-react";

interface ArchivedRecord {
  id: string;
  contractId: string;
  titleEn: string;
  titleBn: string;
  categoryEn: string;
  categoryBn: string;
  firstPartyEn: string;
  firstPartyBn: string;
  secondPartyEn: string;
  secondPartyBn: string;
  auditDateEn: string;
  auditDateBn: string;
  riskScore: number;
  riskGradeEn: string;
  riskGradeBn: string;
  highRiskCount: number;
  mediumRiskCount: number;
  compliantCount: number;
  summaryEn: string;
  summaryBn: string;
}

const INITIAL_ARCHIVE: ArchivedRecord[] = [
  {
    id: "arch-1",
    contractId: "employment-agreement",
    titleEn: "Standard Employment & Confidentiality Agreement",
    titleBn: "চাকরি ও নিয়োগ চুক্তিপত্র (নমুনা)",
    categoryEn: "Labour Act 2006 Compliance",
    categoryBn: "বাংলাদেশ শ্রম আইন ২০০৬",
    firstPartyEn: "Nexus Technologies Ltd.",
    firstPartyBn: "নেক্সাস টেকনোলজিস লিমিটেড",
    secondPartyEn: "Mr. Shamim Ahmed",
    secondPartyBn: "জনাব শামীম আহমেদ",
    auditDateEn: "Oct 6, 2026",
    auditDateBn: "৬ অক্টোবর ২০২৬",
    riskScore: 78,
    riskGradeEn: "High Risk",
    riskGradeBn: "উচ্চ ঝুঁকি",
    highRiskCount: 2,
    mediumRiskCount: 1,
    compliantCount: 2,
    summaryEn:
      "Direct violation of Section 26 of Bangladesh Labour Act 2006 (unlawful 90-day forfeiture) and Section 27 Contract Act 1872 (void 3-year non-compete restraint).",
    summaryBn:
      "শ্রম আইন ২০০৬ এর ধারা ২৬ (বকেয়া বেতন বাজেয়াপ্তকরণ) এবং চুক্তি আইন ১৮৭২ এর ধারা ২৭ (৩ বছরের অন্যায্য ট্রেড রেস্ট্রেইন্ট) এর সুনির্দিষ্ট লঙ্ঘন।"
  },
  {
    id: "arch-2",
    contractId: "vendor-sla",
    titleEn: "Software Development & Vendor SLA Agreement",
    titleBn: "আইটি সফটওয়্যার সার্ভিস ও ভেন্ডর চুক্তি",
    categoryEn: "The Contract Act 1872",
    categoryBn: "চুক্তি আইন ১৮৭২",
    firstPartyEn: "Prime Trading Corporation",
    firstPartyBn: "প্রাইম ট্রেডিং কর্পোরেশন",
    secondPartyEn: "CloudSolve Bangladesh",
    secondPartyBn: "ক্লাউডসলভ বাংলাদেশ",
    auditDateEn: "Oct 2, 2026",
    auditDateBn: "২ অক্টোবর ২০২৬",
    riskScore: 84,
    riskGradeEn: "High Risk",
    riskGradeBn: "উচ্চ ঝুঁকি",
    highRiskCount: 2,
    mediumRiskCount: 1,
    compliantCount: 1,
    summaryEn:
      "Includes non-compensatory penal liquidated damages violating Section 74 and unreciprocated unlimited liability without dispute arbitration provisions.",
    summaryBn:
      "চুক্তি আইনের ধারা ৭৪ বিরোধী শাস্তিমূলক ক্ষতিপূরণ দাবি এবং একতরফা অসীম দায়বদ্ধতার ধারা বিদ্যমান।"
  },
  {
    id: "arch-3",
    contractId: "freelance-consulting",
    titleEn: "Freelance Consulting & Deliverables Contract",
    titleBn: "ফ্রিল্যান্স কনসালটেন্সি ও আইপি চুক্তি",
    categoryEn: "IP Transfer & Retainer",
    categoryBn: "কমন ল ও আইপি সুরক্ষা",
    firstPartyEn: "Global Creative Agency",
    firstPartyBn: "গ্লোবাল ক্রিয়েটিভ এজেন্সী",
    secondPartyEn: "Mr. Asif Iqbal",
    secondPartyBn: "জনাব আসিফ ইকবাল",
    auditDateEn: "Sep 28, 2026",
    auditDateBn: "২৮ সেপ্টেম্বর ২০২৬",
    riskScore: 65,
    riskGradeEn: "Medium Risk",
    riskGradeBn: "মাঝারি ঝুঁকি",
    highRiskCount: 1,
    mediumRiskCount: 1,
    compliantCount: 1,
    summaryEn:
      "Deferred payment schedule of 120 days with unconditioned copyright vesting prior to financial compensation clearance.",
    summaryBn:
      "মূল্য পরিশোধের আগেই সম্পূর্ণ বৌদ্ধিক সম্পত্তি স্বত্বাধিকার হস্তান্তর সংক্রান্ত আইনি জটিলতা।"
  }
];

export default function ArchivePage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [records, setRecords] = useState<ArchivedRecord[]>(INITIAL_ARCHIVE);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<string>("ALL");

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        rec.titleEn.toLowerCase().includes(q) ||
        rec.titleBn.toLowerCase().includes(q) ||
        rec.firstPartyEn.toLowerCase().includes(q) ||
        rec.firstPartyBn.toLowerCase().includes(q) ||
        rec.secondPartyEn.toLowerCase().includes(q) ||
        rec.secondPartyBn.toLowerCase().includes(q) ||
        rec.categoryEn.toLowerCase().includes(q) ||
        rec.categoryBn.toLowerCase().includes(q);

      const matchesRisk =
        selectedRisk === "ALL" ||
        (selectedRisk === "HIGH" && rec.riskScore >= 75) ||
        (selectedRisk === "MEDIUM" && rec.riskScore >= 50 && rec.riskScore < 75) ||
        (selectedRisk === "COMPLIANT" && rec.riskScore < 50);

      return matchesSearch && matchesRisk;
    });
  }, [records, searchQuery, selectedRisk]);

  // Navigate to ContractMind
  const handleOpenInContractMind = (contractId: string) => {
    router.push(`/contractmind?id=${contractId}`);
  };

  // Open context in Copilot
  const handleOpenInCopilot = (record: ArchivedRecord) => {
    const contextPayload = {
      contractId: record.contractId,
      titleEn: record.titleEn,
      titleBn: record.titleBn,
      clauseFocus: null
    };
    sessionStorage.setItem("active_audit_contract", JSON.stringify(contextPayload));
    router.push("/copilot");
  };

  // Delete archive item
  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <AppShell className="bg-white" mainClassName="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-32 font-sans text-neutral-900 print:pt-0 print:px-0 print:max-w-none">
        
        {/* Print-Only Official Archive Summary Header */}
        <div className="hidden print:block pb-6 mb-8 border-b-2 border-neutral-900">
          <div className="flex justify-between items-baseline mb-2 text-xs font-mono uppercase tracking-widest text-neutral-800">
            <span className="font-bold">LEGAL CONTRACT AUDIT ARCHIVE REPORT</span>
            <span>BANGLADESH JURISDICTION</span>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-500 font-sans">
            <span>Generated via Legal Copilot Repository</span>
            <span>Statutory records verified against bdlaws (bdlaws.minlaw.gov.bd)</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="pb-8 border-b border-neutral-100 print:pb-5 print:border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-wider font-semibold mb-2 print:text-neutral-600">
            <FolderClock className="w-4 h-4" />
            <span>{language === "bn" ? "অডিট সংগ্রহশালা ও রেকর্ড" : "Audit Repository"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-neutral-950 tracking-tight leading-snug mb-3">
            {language === "bn" ? "সংরক্ষিত চুক্তি ও অডিট মেমো" : "Archived Audits & Legal Memos"}
          </h1>

          <p className="text-sm text-neutral-500 font-sans leading-relaxed max-w-2xl print:text-neutral-700">
            {language === "bn"
              ? "পূর্বে বিশ্লেষিত চুক্তিপত্র, বাংলাদেশ আইনের আওতায় চিহ্নিত ঝুঁকি এবং সংবিধিবদ্ধ রেডলাইন প্রতিবেদনের পূর্ণাঙ্গ আর্কাইভ।"
              : "Repository of audited contracts, statutory compliance assessments, and legally protected redlines under Bangladesh statutes."}
          </p>

          {/* Quick Stats Strip */}
          <div className="flex flex-wrap items-center gap-6 pt-6 mt-6 border-t border-neutral-100 print:border-neutral-200 text-xs text-neutral-500 print:text-neutral-700">
            <div>
              <span className="font-semibold text-neutral-900 text-sm mr-1.5">{records.length}</span>
              <span>{language === "bn" ? "মোট অডিট" : "Total Audits"}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-900 text-sm mr-1.5">
                {records.filter((r) => r.riskScore >= 75).length}
              </span>
              <span>{language === "bn" ? "উচ্চ ঝুঁকিপূর্ণ চুক্তি" : "High Risk Contracts"}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-900 text-sm mr-1.5">
                {records.reduce((acc, r) => acc + r.compliantCount, 0)}
              </span>
              <span>{language === "bn" ? "যাচাইকৃত আইনসম্মত ধারা" : "Compliant Clauses"}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar (Hidden during Print) */}
        <div className="py-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-neutral-100 print:hidden">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === "bn"
                  ? "চুক্তির নাম, পক্ষ বা আইন অনুযায়ী অনুসন্ধান..."
                  : "Search by title, party, or statute..."
              }
              className="w-full pl-10 pr-4 py-2 rounded-full bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white text-xs text-neutral-900 placeholder:text-neutral-400 border border-transparent focus:border-neutral-200 outline-none transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", labelEn: "All Audits", labelBn: "সকল অডিট" },
              { id: "HIGH", labelEn: "High Risk", labelBn: "উচ্চ ঝুঁকি" },
              { id: "MEDIUM", labelEn: "Review Needed", labelBn: "পর্যালোচনা প্রয়োজন" },
              { id: "COMPLIANT", labelEn: "Compliant", labelBn: "আইনসম্মত" }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedRisk(filter.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedRisk === filter.id
                    ? "bg-black text-white"
                    : "text-neutral-500 hover:text-black hover:bg-neutral-50"
                }`}
              >
                {language === "bn" ? filter.labelBn : filter.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Archived Records List */}
        <div className="divide-y divide-neutral-100 print:divide-neutral-200">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="py-8 space-y-4 group transition-colors print:py-6 break-inside-avoid print-avoid-break"
              >
                {/* Item Top Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-semibold text-neutral-400 print:text-neutral-600">
                      {language === "bn" ? record.auditDateBn : record.auditDateEn}
                    </span>
                    <span className="text-xs text-neutral-400 font-sans">·</span>
                    <span className="text-xs font-medium text-neutral-500 print:text-neutral-700">
                      {language === "bn" ? record.categoryBn : record.categoryEn}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-neutral-500 print:text-neutral-700">
                      {language === "bn" ? record.riskGradeBn : record.riskGradeEn}
                    </span>
                    <span className="text-xs text-neutral-400 print:text-neutral-600">
                      ({record.riskScore}/100 Risk Score)
                    </span>
                  </div>
                </div>

                {/* Contract Title */}
                <div>
                  <h2 className="text-xl font-serif font-medium text-neutral-950 group-hover:text-black transition-colors leading-snug">
                    {language === "bn" ? record.titleBn : record.titleEn}
                  </h2>
                  <p className="text-xs text-neutral-500 print:text-neutral-700 mt-1">
                    {language === "bn"
                      ? `পক্ষসমূহ: ${record.firstPartyBn} ও ${record.secondPartyBn}`
                      : `Parties: ${record.firstPartyEn} & ${record.secondPartyEn}`}
                  </p>
                </div>

                {/* Statutory Risk Takeaway */}
                <p className="text-xs sm:text-[13px] text-neutral-600 print:text-neutral-800 leading-relaxed font-sans max-w-3xl">
                  {language === "bn" ? record.summaryBn : record.summaryEn}
                </p>

                {/* Breakdown & Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3 text-xs text-neutral-400 print:text-neutral-600">
                    <span>
                      {record.highRiskCount} {language === "bn" ? "উচ্চ ঝুঁকি" : "High Risk"}
                    </span>
                    <span>·</span>
                    <span>
                      {record.mediumRiskCount} {language === "bn" ? "পর্যালোচনা প্রয়োজন" : "Review Needed"}
                    </span>
                    <span>·</span>
                    <span>
                      {record.compliantCount} {language === "bn" ? "আইনসম্মত ধারা" : "Compliant"}
                    </span>
                  </div>

                  {/* Actions (Hidden during Print) */}
                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      onClick={() => handleOpenInCopilot(record)}
                      className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Discuss in Legal Copilot"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>{language === "bn" ? "কোপাইলট আলোচনা" : "Copilot"}</span>
                    </button>

                    <button
                      onClick={() => handleOpenInContractMind(record.contractId)}
                      className="px-3.5 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <span>{language === "bn" ? "অডিট দেখুন" : "View Audit"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="p-1.5 rounded-full text-neutral-400 hover:text-black transition-colors"
                      title="Print Memo"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1.5 rounded-full text-neutral-400 hover:text-rose-600 transition-colors"
                      title="Remove from archive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-3">
              <FileText className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-medium text-neutral-700">
                {language === "bn" ? "কোনো সংরক্ষিত অডিট পাওয়া যায়নি" : "No archived audits found"}
              </p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                {language === "bn"
                  ? "আপনার অনুসন্ধানের সাথে মিলে এমন কোনো চুক্তিপত্র পাওয়া যায়নি। অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন।"
                  : "No contracts matched your search criteria. Try a different query or filter."}
              </p>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
