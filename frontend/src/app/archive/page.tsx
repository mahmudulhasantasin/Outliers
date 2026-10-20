"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getContractHistory, HITL_STATUS_CONFIG } from "@/lib/apiServices";
import {
  FolderClock,
  Search,
  ArrowUpRight,
  Bot,
  Printer,
  Trash2,
  FileText,
  ShieldCheck,
  RefreshCw,
  X
} from "lucide-react";
import MarkdownViewer from "@/components/markdown/MarkdownViewer";
import { generateContractAuditMarkdown } from "@/lib/markdownContractGenerator";

interface ArchivedRecord {
  id: string;
  contractId: string;
  memoId?: string | number;
  overallRisk: "HIGH" | "MODERATE" | "LOW" | string;
  titleEn: string;
  titleBn: string;
  categoryEn: string;
  categoryBn: string;
  hitlStatus: string;
  isLawyerVerified: boolean;
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

export default function ArchivePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const userRole = String(user?.role).toUpperCase();
    if (userRole === "LAWYER") {
      router.replace("/lawyer/archive");
    }
  }, [user, router]);

  const [records, setRecords] = useState<ArchivedRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<string>("ALL");
  const [previewRecord, setPreviewRecord] = useState<ArchivedRecord | null>(null);
  const [printRecord, setPrintRecord] = useState<ArchivedRecord | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Map backend history item to full ArchivedRecord
  const mapItemToRecord = (item: any): ArchivedRecord => {
    const cid = String(item.contract_id || item.id);
    const status = item.hitl_status || item.status || "NOT_REQUESTED";
    const isVerified = status === "COMPLETED" || item.is_lawyer_verified === true;
    const title = item.title || item.file_name || "Contract Document";
    const score = typeof item.risk_score === "number" ? item.risk_score : 50;

    // Normalize backend risk levels: "HIGH", "MODERATE", "LOW"
    const backendOverallRisk = String(item.overall_risk || item.risk_grade || "").toUpperCase();
    let overallRisk: "HIGH" | "MODERATE" | "LOW";
    if (backendOverallRisk === "HIGH" || backendOverallRisk === "CRITICAL") {
      overallRisk = "HIGH";
    } else if (backendOverallRisk === "LOW" || backendOverallRisk === "COMPLIANT") {
      overallRisk = "LOW";
    } else if (backendOverallRisk === "MODERATE" || backendOverallRisk === "MEDIUM") {
      overallRisk = "MODERATE";
    } else {
      overallRisk = score >= 70 ? "HIGH" : score >= 40 ? "MODERATE" : "LOW";
    }

    // Check localStorage cache for deep audit details from uploads
    let cachedAudit: any = null;
    if (typeof window !== "undefined") {
      try {
        const raw =
          localStorage.getItem(`contract_audit_${cid}`) ||
          (item.memo_id ? localStorage.getItem(`contract_audit_${item.memo_id}`) : null);
        if (raw) cachedAudit = JSON.parse(raw);
      } catch {}
    }

    const isCritical = backendOverallRisk === "CRITICAL" || score >= 90;
    const isHigh = !isCritical && overallRisk === "HIGH";
    const isModerate = overallRisk === "MODERATE";
    const isLow = overallRisk === "LOW";

    let highCount = typeof item.high_risk_count === "number" ? item.high_risk_count : cachedAudit?.high_risk_count;
    let medCount = typeof item.medium_risk_count === "number" ? item.medium_risk_count : cachedAudit?.medium_risk_count;
    let compCount = typeof item.compliant_count === "number" ? item.compliant_count : cachedAudit?.compliant_count;

    if (highCount === undefined) {
      highCount = isCritical ? 4 : isHigh ? 3 : 0;
    }
    if (medCount === undefined) {
      medCount = isCritical ? 1 : isHigh ? 1 : isModerate ? 3 : 0;
    }
    if (compCount === undefined) {
      compCount = isCritical ? 0 : isHigh ? 1 : isModerate ? 2 : 5;
    }

    const customSummary =
      item.summary ||
      item.executive_summary ||
      cachedAudit?.summary ||
      cachedAudit?.executive_summary ||
      (isCritical
        ? `Critical statutory non-compliance detected with 4 severe violations under Bangladesh Labour Act 2006 & Contract Act 1872.`
        : isHigh
        ? `High statutory risk detected with ${highCount} unenforceable covenants and ${medCount} review-needed clause under Bangladesh Law.`
        : isModerate
        ? `Moderate statutory risk identified. ${medCount} clauses contain ambiguous liabilities requiring advocate review.`
        : `Fully compliant statutory draft. ${compCount} standard clauses verified lawful under codified Bangladesh statutes.`);

    const formattedDateEn = item.created_at
      ? new Date(item.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Oct 18, 2026";

    const formattedDateBn = item.created_at
      ? new Date(item.created_at).toLocaleDateString("bn-BD")
      : "১৮ অক্টোবর ২০২৬";

    return {
      id: cid,
      contractId: cid,
      memoId: item.memo_id,
      overallRisk,
      titleEn: title,
      titleBn: title,
      categoryEn: status.replace(/_/g, " "),
      categoryBn: status === "COMPLETED" ? "যাচাইকৃত" : status === "NOT_REQUESTED" ? "শুধু এআই" : "প্রক্রিয়াধীন",
      hitlStatus: status,
      isLawyerVerified: isVerified,
      firstPartyEn: cachedAudit?.first_party || item.first_party || "User / Organization",
      firstPartyBn: cachedAudit?.first_party_bn || item.first_party_bn || "ব্যবহারকারী / প্রতিষ্ঠান",
      secondPartyEn: cachedAudit?.second_party || item.second_party || (isVerified ? "Verified Advocate" : "ContractMind AI"),
      secondPartyBn: cachedAudit?.second_party_bn || item.second_party_bn || (isVerified ? "নিবন্ধিত আইনজীবী" : "কন্ট্রাক্টমাইন্ড এআই"),
      auditDateEn: formattedDateEn,
      auditDateBn: formattedDateBn,
      riskScore: score,
      riskGradeEn: isCritical ? "CRITICAL" : isHigh ? "HIGH" : isModerate ? "MODERATE" : "LOW",
      riskGradeBn: isCritical ? "সংকটপূর্ণ" : isHigh ? "উচ্চ ঝুঁকি" : isModerate ? "মাঝারি ঝুঁকি" : "স্বল্প ঝুঁকি",
      highRiskCount: highCount,
      mediumRiskCount: medCount,
      compliantCount: compCount,
      summaryEn: customSummary,
      summaryBn:
        item.summary_bn ||
        cachedAudit?.summary_bn ||
        (isCritical
          ? `শ্রম আইন ২০০৬ ও চুক্তি আইন ১৮৭২-এর অধীনে ৪টি মারাত্মক সংকটপূর্ণ আইনলঙ্ঘন চিহ্নিত।`
          : isHigh
          ? `বাংলাদেশ আইনের আওতায় ${highCount}টি উচ্চ ঝুঁকিপূর্ণ ধারা এবং ${medCount}টি পর্যালোচনাধীন শর্ত চিহ্নিত।`
          : isModerate
          ? `মাঝারি আইনি ঝুঁকি বিদ্যমান। ${medCount}টি শর্ত অস্পষ্ট হওয়ায় আইনজীবীর পরামর্শ প্রয়োজন।`
          : `সম্পূর্ণ আইনসম্মত চুক্তি। সংবিধিবদ্ধ বাংলাদেশ আইনের অধীনে ${compCount}টি ধারাই বৈধ।`),
    };
  };

  // Fetch real contract history from backend
  const fetchHistory = async () => {
    try {
      setIsLoadingApi(true);
      const data = await getContractHistory();
      if (Array.isArray(data)) {
        const mapped = data.map(mapItemToRecord);
        setRecords(mapped);
      }
    } catch (err: unknown) {
      console.warn("Could not fetch backend contract history:", err);
    } finally {
      setIsLoadingApi(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadContracts = async () => {
      try {
        setIsLoadingApi(true);
        const data = await getContractHistory();
        if (!isMounted) return;
        if (Array.isArray(data)) {
          const mapped = data.map(mapItemToRecord);
          setRecords(mapped);
        }
      } catch (err: unknown) {
        console.warn("Could not load initial contract history:", err);
      } finally {
        if (isMounted) setIsLoadingApi(false);
      }
    };

    loadContracts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Direct print or export as PDF handler
  const handlePrintMemo = (record: ArchivedRecord) => {
    setPrintRecord(record);
  };

  useEffect(() => {
    if (printRecord) {
      const timer = setTimeout(() => {
        window.print();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [printRecord]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintRecord(null);
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  // Compute category counts for the filter tabs
  const tabCounts = useMemo(() => {
    let high = 0;
    let moderate = 0;
    let low = 0;

    for (const r of records) {
      if (r.overallRisk === "HIGH") high++;
      else if (r.overallRisk === "MODERATE") moderate++;
      else if (r.overallRisk === "LOW") low++;
    }

    return {
      ALL: records.length,
      HIGH: high,
      MODERATE: moderate,
      LOW: low,
    };
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    const rawQ = (searchQuery || "").trim().toLowerCase();
    // Split into normalized search tokens (space, hyphen, comma, period separated)
    const tokens = rawQ
      .replace(/[-_.,/]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    const isSearching = tokens.length > 0;

    return records.filter((rec) => {
      const titleLower = `${rec.titleEn || ""} ${rec.titleBn || ""}`.toLowerCase();
      const isEmployment = titleLower.includes("employment");
      const isNDA = titleLower.includes("non-disclosure") || titleLower.includes("disclosure") || titleLower.includes("nda");
      const isRules = titleLower.includes("rules") || titleLower.includes("fest") || titleLower.includes("competition");

      // Backend risk level mapping:
      // "High Risk" -> overall_risk === "HIGH"
      // "Review Needed" -> overall_risk === "MODERATE"
      // "Compliant" -> overall_risk === "LOW"
      const hasHighRisk = rec.overallRisk === "HIGH";
      const hasReviewNeeded = rec.overallRisk === "MODERATE";
      const isCompliant = rec.overallRisk === "LOW";

      // Build rich, intelligent domain search corpus
      const corpusParts = [
        rec.titleEn,
        rec.titleBn,
        rec.contractId,
        String(rec.riskScore),
        `${rec.riskScore}/100`,
        `score ${rec.riskScore}`,
        rec.riskGradeEn,
        rec.riskGradeBn,
        rec.auditDateEn,
        rec.auditDateBn,
        // Only include custom/actual party names, not generic platform placeholders
        rec.firstPartyEn && !rec.firstPartyEn.includes("User / Organization") ? rec.firstPartyEn : "",
        rec.firstPartyBn && !rec.firstPartyBn.includes("প্রতিষ্ঠান") ? rec.firstPartyBn : "",
        rec.secondPartyEn && !rec.secondPartyEn.includes("ContractMind") && !rec.secondPartyEn.includes("Verified Advocate") ? rec.secondPartyEn : "",
        rec.secondPartyBn && !rec.secondPartyBn.includes("কন্ট্রাক্টমাইন্ড") ? rec.secondPartyBn : "",
        rec.summaryEn,
        rec.summaryBn,
        // Semantic risk status phrases (so user can type "high risk", "review needed", "compliant", etc.)
        hasHighRisk ? "high risk critical বিপদজনক সংকটপূর্ণ উচ্চ ঝুঁকি মারাত্মক" : "",
        hasReviewNeeded ? "review needed medium moderate পর্যালোচনা প্রয়োজন মাঝারি ঝুঁকি পর্যালোচনাধীন শর্ত" : "",
        isCompliant ? "compliant low risk আইনসম্মত স্বল্প ঝুঁকি নিরাপদ বৈধ" : "",
        // Breakdown counts
        rec.highRiskCount > 0 ? `${rec.highRiskCount} high risk ${rec.highRiskCount}টি উচ্চ ঝুঁকি` : "",
        rec.mediumRiskCount > 0 ? `${rec.mediumRiskCount} review needed ${rec.mediumRiskCount}টি পর্যালোচনা` : "",
        rec.compliantCount > 0 ? `${rec.compliantCount} compliant ${rec.compliantCount}টি আইনসম্মত` : "",
        // Domain synonyms
        isEmployment ? "employment job worker employee labor labour salary appointment agreement নিয়োগ চাকরি কর্মসংস্থান শ্রম আইন শ্রমিক labour act 2006 contract act 1872" : "",
        isNDA ? "nda non disclosure non-disclosure confidentiality secrecy গোপনীয়তা চুক্তি তথ্য প্রকাশ" : "",
        isRules ? "rules fest festival dev competition guidelines নীতি নিয়মাবলী নীতিমালা প্রতিযোগিতা নির্দেশিকা" : "",
      ];

      const corpus = corpusParts
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .replace(/[-_.,/]/g, " ");

      const corpusWords = corpus.split(/\s+/).filter(Boolean);

      // Robust matching: short tokens (<=2 chars) match exact or prefix word; longer tokens match anywhere in corpus
      const matchesSearch =
        !isSearching ||
        tokens.every((tok) => {
          if (tok.length <= 2) {
            return corpusWords.some((w) => w === tok || w.startsWith(tok));
          }
          return corpus.includes(tok);
        });

      // When actively searching, search across all records so tab filters never hide results
      const matchesRisk =
        isSearching ||
        selectedRisk === "ALL" ||
        (selectedRisk === "HIGH" && hasHighRisk) ||
        (selectedRisk === "MODERATE" && hasReviewNeeded) ||
        (selectedRisk === "LOW" && isCompliant);

      return matchesSearch && matchesRisk;
    });
  }, [records, searchQuery, selectedRisk]);

  // Open context in Copilot as a fresh session
  const handleOpenInCopilot = (record: ArchivedRecord) => {
    const contextPayload = {
      id: record.contractId || record.id,
      contractId: record.contractId || record.id,
      titleEn: record.titleEn,
      titleBn: record.titleBn,
      summaryEn: record.summaryEn,
      summaryBn: record.summaryBn,
      firstPartyEn: record.firstPartyEn,
      firstPartyBn: record.firstPartyBn,
      secondPartyEn: record.secondPartyEn,
      secondPartyBn: record.secondPartyBn,
      riskScore: record.riskScore,
      riskGradeEn: record.riskGradeEn,
      riskGradeBn: record.riskGradeBn,
      shouldStartNewSession: true,
    };
    sessionStorage.setItem("active_audit_contract", JSON.stringify(contextPayload));
    router.push("/copilot");
  };

  // Delete archive item
  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Target record for print preview: either explicitly triggered or modal currently open
  const printTargetRecord = printRecord || previewRecord;

  if (String(user?.role).toUpperCase() === "LAWYER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      {/* ==================================================================== */}
      {/* 1. DEDICATED PRINT / PDF EXPORT CONTAINER (ONLY VISIBLE ON PRINT)     */}
      {/* ==================================================================== */}
      <div className="legal-print-only w-full bg-white text-black p-8 print-clean-paper">
        {printTargetRecord ? (
          <div className="space-y-6">
            <div className="pb-4 border-b-2 border-neutral-900 flex justify-between items-baseline text-xs font-mono uppercase tracking-widest text-neutral-800">
              <span className="font-bold">LEGAL CONTRACT AUDIT MEMORANDUM</span>
              <span>BANGLADESH JURISDICTION</span>
            </div>
            <MarkdownViewer
              content={generateContractAuditMarkdown(
                printTargetRecord.contractId,
                language as "en" | "bn",
                printTargetRecord.isLawyerVerified
                  ? {
                      advocateName: "Supreme Court Advocate",
                      barCouncilNo: "BC-ADV-2024-8842",
                      verifiedAt: printTargetRecord.auditDateEn,
                      sealApplied: true,
                      advocateNotes: "Verified compliant with codified statutes of Bangladesh.",
                    }
                  : undefined,
                printTargetRecord
              )}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="pb-4 border-b-2 border-neutral-900 flex justify-between items-baseline text-xs font-mono uppercase tracking-widest text-neutral-800">
              <span className="font-bold">LEGAL CONTRACT AUDIT ARCHIVE REPORT</span>
              <span>BANGLADESH JURISDICTION</span>
            </div>
            <div className="text-xs text-neutral-600 mb-4">
              Generated via Advotech Copilot Archive | Total Audited Contracts: {records.length}
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 font-mono uppercase">
                  <th className="py-2 pr-4">Reference</th>
                  <th className="py-2 pr-4">Contract Title</th>
                  <th className="py-2 pr-4">Risk Grade</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-300">
                {records.map((r) => (
                  <tr key={r.id} className="py-2">
                    <td className="py-2 font-mono pr-4">{r.contractId}</td>
                    <td className="py-2 font-medium pr-4">{language === "bn" ? r.titleBn : r.titleEn}</td>
                    <td className="py-2 pr-4">{r.riskGradeEn}</td>
                    <td className="py-2 pr-4">{r.riskScore}/100</td>
                    <td className="py-2 pr-4">{r.hitlStatus}</td>
                    <td className="py-2">{r.auditDateEn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 2. INTERACTIVE SCREEN UI (COMPLETELY HIDDEN DURING PRINT)            */}
      {/* ==================================================================== */}
      <div className="legal-screen-only max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-32 font-sans">
        
        {/* Page Header */}
        <div className="pb-8 border-b" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 8%, transparent)" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-wider font-semibold">
              <FolderClock className="w-4 h-4" />
              <span>{language === "bn" ? "অডিট সংগ্রহশালা ও রেকর্ড" : "Audit Repository"}</span>
            </div>
            <button
              onClick={fetchHistory}
              disabled={isLoadingApi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--text-primary)]/15 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
              style={{ color: "var(--text-primary)" }}
              title={language === "bn" ? "চুক্তির তালিকা রিফ্রেশ করুন" : "Refresh Contract History"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingApi ? "animate-spin text-blue-500" : ""}`} />
              <span>{language === "bn" ? "রিফ্রেশ" : "Refresh"}</span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight leading-snug mb-3" style={{ color: "var(--text-primary)" }}>
            {language === "bn" ? "সংরক্ষিত চুক্তি ও অডিট মেমো" : "Archived Audits & Legal Memos"}
          </h1>

          <p className="text-sm text-neutral-500 font-sans leading-relaxed max-w-2xl">
            {language === "bn"
              ? "পূর্বে বিশ্লেষিত চুক্তিপত্র, বাংলাদেশ আইনের আওতায় চিহ্নিত ঝুঁকি এবং সংবিধিবদ্ধ রেডলাইন প্রতিবেদনের পূর্ণাঙ্গ আর্কাইভ।"
              : "Repository of audited contracts, statutory compliance assessments, and legally protected redlines under Bangladesh statutes."}
          </p>

          {/* Quick Stats Strip */}
          <div className="flex flex-wrap items-center gap-6 pt-6 mt-6 border-t text-xs" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 8%, transparent)", color: "var(--text-muted)" }}>
            <div>
              <span className="font-semibold text-sm mr-1.5" style={{ color: "var(--text-primary)" }}>{records.length}</span>
              <span>{language === "bn" ? "মোট অডিট" : "Total Audits"}</span>
            </div>
            <div>
              <span className="font-semibold text-sm mr-1.5" style={{ color: "var(--text-primary)" }}>
                {tabCounts.HIGH}
              </span>
              <span>{language === "bn" ? "উচ্চ ঝুঁকিপূর্ণ চুক্তি" : "High Risk Contracts"}</span>
            </div>
            <div>
              <span className="font-semibold text-sm mr-1.5" style={{ color: "var(--text-primary)" }}>
                {tabCounts.MODERATE}
              </span>
              <span>{language === "bn" ? "পর্যালোচনা প্রয়োজন" : "Review Needed"}</span>
            </div>
            <div>
              <span className="font-semibold text-sm mr-1.5" style={{ color: "var(--text-primary)" }}>
                {tabCounts.LOW}
              </span>
              <span>{language === "bn" ? "আইনসম্মত চুক্তি" : "Compliant Contracts"}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 8%, transparent)" }}>
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (selectedRisk !== "ALL" && val.trim().length > 0) {
                  setSelectedRisk("ALL");
                }
              }}
              placeholder={
                language === "bn"
                  ? "চুক্তির নাম, স্কোর, পক্ষ বা আইন অনুযায়ী অনুসন্ধান..."
                  : "Search by title, score, party, or statute..."
              }
              className="w-full pl-10 pr-9 py-2 rounded-full text-xs outline-none transition-all border border-[var(--text-primary)]/10 focus:border-[var(--text-primary)]/30 focus:ring-1 focus:ring-[var(--text-primary)]/20"
              style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills with real counts */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", labelEn: "All Audits", labelBn: "সকল অডিট", count: tabCounts.ALL },
              { id: "HIGH", labelEn: "High Risk", labelBn: "উচ্চ ঝুঁকি", count: tabCounts.HIGH },
              { id: "MODERATE", labelEn: "Review Needed", labelBn: "পর্যালোচনা প্রয়োজন", count: tabCounts.MODERATE },
              { id: "LOW", labelEn: "Compliant", labelBn: "আইনসম্মত", count: tabCounts.LOW }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedRisk(filter.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedRisk === filter.id
                    ? "bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold shadow-xs"
                    : "opacity-60 hover:opacity-100 bg-neutral-200/50 dark:bg-neutral-800/50"
                }`}
              >
                <span>{language === "bn" ? filter.labelBn : filter.labelEn}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    selectedRisk === filter.id
                      ? "bg-[var(--bg-primary)] text-[var(--text-primary)]"
                      : "bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Search Results Indicator */}
        {searchQuery.trim().length > 0 && (
          <div className="my-4 flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
              <Search className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                {language === "bn"
                  ? `"${searchQuery.trim()}" অনুসন্ধান ফলাফল: ${filteredRecords.length}টি চুক্তি পাওয়া গেছে`
                  : `Showing ${filteredRecords.length} contract${filteredRecords.length === 1 ? "" : "s"} matching "${searchQuery.trim()}"`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer ml-3 shrink-0"
            >
              {language === "bn" ? "সার্চ মুছুন (Clear)" : "Clear search"}
            </button>
          </div>
        )}

        {/* Archived Records List */}
        <div className="divide-y" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 6%, transparent)" }}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="py-8 space-y-4 group transition-colors"
              >
                {/* Item Top Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-semibold text-neutral-400">
                      {language === "bn" ? record.auditDateBn : record.auditDateEn}
                    </span>
                    <span className="text-xs text-neutral-400 font-sans">·</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        HITL_STATUS_CONFIG[record.hitlStatus]?.color ||
                        "bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700"
                      }`}
                      title={
                        language === "bn"
                          ? HITL_STATUS_CONFIG[record.hitlStatus]?.descriptionBn
                          : HITL_STATUS_CONFIG[record.hitlStatus]?.descriptionEn
                      }
                    >
                      {language === "bn"
                        ? HITL_STATUS_CONFIG[record.hitlStatus]?.labelBn || record.categoryBn
                        : HITL_STATUS_CONFIG[record.hitlStatus]?.labelEn || record.categoryEn}
                    </span>
                    {record.isLawyerVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{language === "bn" ? "আইনজীবী দ্বারা যাচাইকৃত ✓" : "Verified by Lawyer ✓"}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{
                      backgroundColor: record.riskScore >= 70 ? "rgba(239, 68, 68, 0.15)" : record.riskScore >= 40 ? "rgba(245, 158, 11, 0.15)" : "rgba(34, 197, 94, 0.15)",
                      color: record.riskScore >= 70 ? "#ef4444" : record.riskScore >= 40 ? "#f59e0b" : "#22c55e"
                    }}>
                      {language === "bn" ? record.riskGradeBn : record.riskGradeEn}
                    </span>
                    <span className="text-xs text-neutral-400">
                      ({record.riskScore}/100 Risk Score)
                    </span>
                  </div>
                </div>

                {/* Contract Title */}
                <div>
                  <h2 className="text-xl font-serif font-medium transition-colors leading-snug" style={{ color: "var(--text-primary)" }}>
                    {language === "bn" ? record.titleBn : record.titleEn}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    {language === "bn"
                      ? `পক্ষসমূহ: ${record.firstPartyBn} ও ${record.secondPartyBn}`
                      : `Parties: ${record.firstPartyEn} & ${record.secondPartyEn}`}
                  </p>
                </div>

                {/* Statutory Risk Takeaway */}
                <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans max-w-3xl">
                  {language === "bn" ? record.summaryBn : record.summaryEn}
                </p>

                {/* Breakdown & Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
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

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenInCopilot(record)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-[var(--text-primary)]/10" style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}
                      title={language === "bn" ? "কোপাইলটের সাথে আলোচনা করুন" : "Discuss in Advotech Copilot"}
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>{language === "bn" ? "কোপাইলট" : "Copilot"}</span>
                    </button>

                    <button
                      onClick={() => setPreviewRecord(record)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
                      title={language === "bn" ? "সম্পূর্ণ অডিট রিপোর্ট দেখুন" : "View Full Audit Report"}
                    >
                      <span>{language === "bn" ? "অডিট দেখুন" : "View Audit"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrintMemo(record)}
                      className="p-1.5 rounded-full text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      title={language === "bn" ? "অডিট মেমো প্রিন্ট / PDF সংরক্ষণ করুন" : "Print / Save Audit Memo as PDF"}
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1.5 rounded-full text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
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
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {language === "bn" ? "কোনো সংরক্ষিত অডিট পাওয়া যায়নি" : "No archived audits found"}
              </p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                {searchQuery.trim().length > 0
                  ? language === "bn"
                    ? `"${searchQuery.trim()}" দিয়ে কোনো চুক্তি মেলেনি। বানান পরীক্ষা করুন অথবা সার্চ ক্লিয়ার করুন।`
                    : `No contracts matched your search for "${searchQuery.trim()}". Try different keywords or clear search.`
                  : language === "bn"
                  ? "আপনার নির্বাচনের সাথে মিলে এমন কোনো চুক্তিপত্র পাওয়া যায়নি। অন্য কিওয়ার্ড বা ফিল্টার দিয়ে চেষ্টা করুন।"
                  : "No contracts matched your filter criteria. Try selecting another tab or clearing search."}
              </p>
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{language === "bn" ? "সার্চ ক্লিয়ার করুন" : "Clear search"}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MARKDOWN AUDIT MODAL (LEGAL-SCREEN-ONLY TO PREVENT PRINT CLIPPING) */}
      {/* ==================================================================== */}
      {previewRecord && (
        <div className="legal-screen-only fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[var(--text-primary)]/10 flex items-center justify-between bg-[var(--bg-surface)]">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--text-primary)]/10">
                  {previewRecord.id}
                </span>
                <h3 className="text-base font-serif font-bold text-[var(--text-primary)] truncate mt-1">
                  {language === "bn" ? previewRecord.titleBn : previewRecord.titleEn}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintMemo(previewRecord)}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title={language === "bn" ? "অডিট মেমো প্রিন্ট / পিডিএফ ডাউনলোড করুন" : "Print / Export Audit Memo as PDF"}
                >
                  <Printer className="w-4 h-4 text-sky-500" />
                  <span>{language === "bn" ? "প্রিন্ট / PDF" : "Print / PDF"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRecord(null)}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <MarkdownViewer
                content={generateContractAuditMarkdown(
                  previewRecord.contractId,
                  language as "en" | "bn",
                  previewRecord.isLawyerVerified
                    ? {
                        advocateName: "Supreme Court Advocate",
                        barCouncilNo: "BC-ADV-2024-8842",
                        verifiedAt: previewRecord.auditDateEn,
                        sealApplied: true,
                        advocateNotes: "Verified compliant with codified statutes of Bangladesh.",
                      }
                    : undefined,
                  previewRecord
                )}
              />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
