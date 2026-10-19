"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getContractHistory, getContractDownloadUrl, HITL_STATUS_CONFIG } from "@/lib/apiServices";
import {
  FolderClock,
  Search,
  ArrowUpRight,
  Bot,
  Printer,
  Trash2,
  FileText,
  ShieldCheck,
  Download,
  Loader2,
  RefreshCw,
  X
} from "lucide-react";
import MarkdownViewer from "@/components/markdown/MarkdownViewer";
import { generateContractAuditMarkdown } from "@/lib/markdownContractGenerator";

interface ArchivedRecord {
  id: string;
  contractId: string;
  memoId?: string | number;
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
    if (user?.role === "lawyer" || !!user?.lawyerProfile) {
      router.replace("/lawyer/archive");
    }
  }, [user, router]);

  const [records, setRecords] = useState<ArchivedRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<string>("ALL");
  const [previewRecord, setPreviewRecord] = useState<ArchivedRecord | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Fetch real contract history from backend
  const fetchHistory = async () => {
    try {
      setIsLoadingApi(true);
      const data = await getContractHistory();
      if (Array.isArray(data)) {
        const mapped: ArchivedRecord[] = data.map((item) => {
          const cid = String(item.contract_id || item.id);
          const status = item.hitl_status || item.status || "NOT_REQUESTED";
          const isVerified = status === "COMPLETED" || item.is_lawyer_verified === true;
          const title = item.title || item.file_name || "Contract Document";
          const risk = (item.overall_risk || item.risk_grade || "MODERATE").toUpperCase();
          const score = typeof item.risk_score === "number" ? item.risk_score : 50;

          const highCount = risk === "CRITICAL" || risk === "HIGH" ? 3 : 0;
          const medCount = risk === "MODERATE" || risk === "MEDIUM" ? 2 : 1;
          const compCount = risk === "LOW" || risk === "COMPLIANT" ? 4 : 1;

          return {
            id: cid,
            contractId: cid,
            memoId: item.memo_id,
            titleEn: title,
            titleBn: title,
            categoryEn: status.replace(/_/g, " "),
            categoryBn: status === "COMPLETED" ? "যাচাইকৃত" : status === "NOT_REQUESTED" ? "শুধু এআই" : "প্রক্রিয়াধীন",
            hitlStatus: status,
            isLawyerVerified: isVerified,
            firstPartyEn: "User / Organization",
            firstPartyBn: "ব্যবহারকারী / প্রতিষ্ঠান",
            secondPartyEn: isVerified ? "Verified Advocate" : "ContractMind AI",
            secondPartyBn: isVerified ? "নিবন্ধিত আইনজীবী" : "কন্ট্রাক্টমাইন্ড এআই",
            auditDateEn: new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            auditDateBn: new Date(item.created_at).toLocaleDateString("bn-BD"),
            riskScore: score,
            riskGradeEn: risk,
            riskGradeBn: risk === "CRITICAL" ? "সংকটপূর্ণ" : risk === "HIGH" ? "উচ্চ ঝুঁকি" : risk === "MODERATE" ? "মাঝারি ঝুঁকি" : "স্বল্প ঝুঁকি",
            highRiskCount: highCount,
            mediumRiskCount: medCount,
            compliantCount: compCount,
            summaryEn: `Audited on ${new Date(item.created_at).toLocaleDateString()}. Status: ${status.replace(/_/g, " ")}.`,
            summaryBn: `অডিট সম্পন্ন হয়েছে: ${new Date(item.created_at).toLocaleDateString("bn-BD")}। স্ট্যাটাস: ${status}।`,
          };
        });
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
          const mapped: ArchivedRecord[] = data.map((item) => {
            const cid = String(item.contract_id || item.id);
            const status = item.hitl_status || item.status || "NOT_REQUESTED";
            const isVerified = status === "COMPLETED" || item.is_lawyer_verified === true;
            const title = item.title || item.file_name || "Contract Document";
            const risk = (item.overall_risk || item.risk_grade || "MODERATE").toUpperCase();
            const score = typeof item.risk_score === "number" ? item.risk_score : 50;

            const highCount = risk === "CRITICAL" || risk === "HIGH" ? 3 : 0;
            const medCount = risk === "MODERATE" || risk === "MEDIUM" ? 2 : 1;
            const compCount = risk === "LOW" || risk === "COMPLIANT" ? 4 : 1;

            return {
              id: cid,
              contractId: cid,
              memoId: item.memo_id,
              titleEn: title,
              titleBn: title,
              categoryEn: status.replace(/_/g, " "),
              categoryBn: status === "COMPLETED" ? "যাচাইকৃত" : status === "NOT_REQUESTED" ? "শুধু এআই" : "প্রক্রিয়াধীন",
              hitlStatus: status,
              isLawyerVerified: isVerified,
              firstPartyEn: "User / Organization",
              firstPartyBn: "ব্যবহারকারী / প্রতিষ্ঠান",
              secondPartyEn: isVerified ? "Verified Advocate" : "ContractMind AI",
              secondPartyBn: isVerified ? "নিবন্ধিত আইনজীবী" : "কন্ট্রাক্টমাইন্ড এআই",
              auditDateEn: new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              auditDateBn: new Date(item.created_at).toLocaleDateString("bn-BD"),
              riskScore: score,
              riskGradeEn: risk,
              riskGradeBn: risk === "CRITICAL" ? "সংকটপূর্ণ" : risk === "HIGH" ? "উচ্চ ঝুঁকি" : risk === "MODERATE" ? "মাঝারি ঝুঁকি" : "স্বল্প ঝুঁকি",
              highRiskCount: highCount,
              mediumRiskCount: medCount,
              compliantCount: compCount,
              summaryEn: `Audited on ${new Date(item.created_at).toLocaleDateString()}. Status: ${status.replace(/_/g, " ")}.`,
              summaryBn: `অডিট সম্পন্ন হয়েছে: ${new Date(item.created_at).toLocaleDateString("bn-BD")}। স্ট্যাটাস: ${status}।`,
            };
          });
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

  const handleDownload = async (contractId: string) => {
    try {
      setDownloadingId(contractId);
      const res = await getContractDownloadUrl(contractId);
      if (res?.download_url) {
        window.open(res.download_url, "_blank");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to download contract file.";
      console.error("Download failed:", err);
      alert(msg);
    } finally {
      setDownloadingId(null);
    }
  };

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

  return (
    <AppShell>
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-32 font-sans print:pt-0 print:px-0 print:max-w-none ${previewRecord ? "print:hidden" : ""}`}>
        
        {/* Print-Only Official Archive Summary Header */}
        <div className="hidden print:block pb-6 mb-8 border-b-2 border-neutral-900">
          <div className="flex justify-between items-baseline mb-2 text-xs font-mono uppercase tracking-widest text-neutral-800">
            <span className="font-bold">LEGAL CONTRACT AUDIT ARCHIVE REPORT</span>
            <span>BANGLADESH JURISDICTION</span>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-500 font-sans">
            <span>Generated via Advotech Copilot Repository</span>
            <span>Statutory records verified against bdlaws (bdlaws.minlaw.gov.bd)</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="pb-8 border-b print:pb-5 print:border-neutral-200" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 8%, transparent)" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-wider font-semibold print:text-neutral-600">
              <FolderClock className="w-4 h-4" />
              <span>{language === "bn" ? "অডিট সংগ্রহশালা ও রেকর্ড" : "Audit Repository"}</span>
            </div>
            <button
              onClick={fetchHistory}
              disabled={isLoadingApi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--text-primary)]/15 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer print:hidden"
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

          <p className="text-sm text-neutral-500 font-sans leading-relaxed max-w-2xl print:text-neutral-700">
            {language === "bn"
              ? "পূর্বে বিশ্লেষিত চুক্তিপত্র, বাংলাদেশ আইনের আওতায় চিহ্নিত ঝুঁকি এবং সংবিধিবদ্ধ রেডলাইন প্রতিবেদনের পূর্ণাঙ্গ আর্কাইভ।"
              : "Repository of audited contracts, statutory compliance assessments, and legally protected redlines under Bangladesh statutes."}
          </p>

          {/* Quick Stats Strip */}
          <div className="flex flex-wrap items-center gap-6 pt-6 mt-6 border-t print:border-neutral-200 text-xs print:text-neutral-700" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 8%, transparent)", color: "var(--text-muted)" }}>
            <div>
              <span className="font-semibold text-sm mr-1.5" style={{ color: "var(--text-primary)" }}>{records.length}</span>
              <span>{language === "bn" ? "মোট অডিট" : "Total Audits"}</span>
            </div>
            <div>
              <span className="font-semibold text-sm mr-1.5" style={{ color: "var(--text-primary)" }}>
                {records.filter((r) => r.riskScore >= 75).length}
              </span>
              <span>{language === "bn" ? "উচ্চ ঝুঁকিপূর্ণ চুক্তি" : "High Risk Contracts"}</span>
            </div>
            <div>
              <span className="font-semibold text-sm mr-1.5" style={{ color: "var(--text-primary)" }}>
                {records.reduce((acc, r) => acc + r.compliantCount, 0)}
              </span>
              <span>{language === "bn" ? "যাচাইকৃত আইনসম্মত ধারা" : "Compliant Clauses"}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar (Hidden during Print) */}
        <div className="py-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b print:hidden" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 8%, transparent)" }}>
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
              className="w-full pl-10 pr-4 py-2 rounded-full text-xs outline-none transition-all border border-transparent" style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}
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
                    ? ""
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                {language === "bn" ? filter.labelBn : filter.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Archived Records List */}
        <div className="divide-y print:divide-neutral-200" style={{ borderColor: "color-mix(in srgb, var(--text-primary) 6%, transparent)" }}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="py-8 space-y-4 group transition-colors print:py-6 break-inside-avoid print-avoid-break"
              >
                {/* Item Top Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-semibold text-neutral-400 print:text-neutral-600">
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
                      backgroundColor: record.riskScore >= 75 ? "rgba(239, 68, 68, 0.15)" : record.riskScore >= 50 ? "rgba(245, 158, 11, 0.15)" : "rgba(34, 197, 94, 0.15)",
                      color: record.riskScore >= 75 ? "#ef4444" : record.riskScore >= 50 ? "#f59e0b" : "#22c55e"
                    }}>
                      {language === "bn" ? record.riskGradeBn : record.riskGradeEn}
                    </span>
                    <span className="text-xs text-neutral-400 print:text-neutral-600">
                      ({record.riskScore}/100 Risk Score)
                    </span>
                  </div>
                </div>

                {/* Contract Title */}
                <div>
                  <h2 className="text-xl font-serif font-medium transition-colors leading-snug" style={{ color: "var(--text-primary)" }}>
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
                      onClick={() => handleDownload(record.contractId)}
                      disabled={downloadingId === record.contractId}
                      className="p-1.5 rounded-full text-neutral-400 hover:text-emerald-500 transition-colors disabled:opacity-50"
                      title={language === "bn" ? "চুক্তি ডাউনলোড করুন" : "Download Contract File"}
                    >
                      {downloadingId === record.contractId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
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
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
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

        {/* Markdown Audit Modal */}
        {previewRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 print:static print:inset-auto print:bg-white print:p-0 print:m-0 print:w-full print:h-auto print:overflow-visible print:block print:z-auto">
            <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none print:max-h-none print:w-full print:bg-white">
              <div className="p-4 border-b border-[var(--text-primary)]/10 flex items-center justify-between bg-[var(--bg-surface)] print:border-b-2 print:border-neutral-900 print:bg-white print:pb-3 print:mb-4">
                <div className="min-w-0 pr-4">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--text-primary)]/10 print:border-neutral-400 print:text-neutral-700">
                    {previewRecord.id}
                  </span>
                  <h3 className="text-base font-serif font-bold text-[var(--text-primary)] truncate mt-1 print:text-neutral-900 print:text-lg">
                    {language === "bn" ? previewRecord.titleBn : previewRecord.titleEn}
                  </h3>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={() => window.print()}
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
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:overflow-visible print:p-0">
                <MarkdownViewer
                  content={generateContractAuditMarkdown(previewRecord.contractId, language as "en" | "bn")}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
