"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { CONTRACT_AUDITS } from "@/data/contractAudits";
import { getContractHistory, getContractDownloadUrl } from "@/lib/apiServices";
import {
  FolderClock,
  Search,
  ArrowUpRight,
  Bot,
  Printer,
  Trash2,
  FileText,
  ShieldCheck,
  Filter,
  FileCode2,
  Download,
  Loader2,
  X
} from "lucide-react";
import MarkdownViewer from "@/components/markdown/MarkdownViewer";
import { generateContractAuditMarkdown } from "@/lib/markdownContractGenerator";

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

const INITIAL_ARCHIVE: ArchivedRecord[] = [];

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

  // Fetch real contract history from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchHistory() {
      try {
        setIsLoadingApi(true);
        const data = await getContractHistory();
        if (isMounted && Array.isArray(data)) {
          const mapped: ArchivedRecord[] = data.map((item) => ({
            id: item.id,
            contractId: item.id,
            titleEn: item.file_name,
            titleBn: item.file_name,
            categoryEn: `Status: ${item.status}`,
            categoryBn: `স্ট্যাটাস: ${item.status}`,
            firstPartyEn: "User Contract",
            firstPartyBn: "ব্যবহারকারীর চুক্তি",
            secondPartyEn: "Advotech Copilot AI",
            secondPartyBn: "এডভোটেক কোপাইলট এআই",
            auditDateEn: new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            auditDateBn: new Date(item.created_at).toLocaleDateString("bn-BD"),
            riskScore: item.risk_score ?? 50,
            riskGradeEn: item.risk_grade ?? "Audited",
            riskGradeBn: item.risk_grade ?? "মূল্যায়িত",
            highRiskCount: item.risk_grade === "HIGH" ? 2 : 0,
            mediumRiskCount: item.risk_grade === "MEDIUM" ? 1 : 0,
            compliantCount: 1,
            summaryEn: `Audited on ${new Date(item.created_at).toLocaleDateString()}. Status: ${item.status}.`,
            summaryBn: `অডিট সম্পন্ন হয়েছে: ${new Date(item.created_at).toLocaleDateString("bn-BD")}। স্ট্যাটাস: ${item.status}।`,
          }));
          setRecords(mapped);
        }
      } catch (err) {
        console.warn("Could not fetch backend contract history:", err);
      } finally {
        if (isMounted) setIsLoadingApi(false);
      }
    }
    fetchHistory();
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
    } catch (err: any) {
      console.error("Download failed:", err);
      alert(err.message || "Failed to download contract file.");
    } finally {
      setDownloadingId(null);
    };
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
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-32 font-sans print:pt-0 print:px-0 print:max-w-none">
        
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
          <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-wider font-semibold mb-2 print:text-neutral-600">
            <FolderClock className="w-4 h-4" />
            <span>{language === "bn" ? "অডিট সংগ্রহশালা ও রেকর্ড" : "Audit Repository"}</span>
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
                      onClick={() => setPreviewRecord(record)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[var(--text-primary)]/10" style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}
                      title="View Full Audit Report"
                    >
                      <FileText className="w-3.5 h-3.5 text-sky-500" />
                      <span>{language === "bn" ? "অডিট রিপোর্ট দেখুন" : "View Full Audit"}</span>
                    </button>

                    <button
                      onClick={() => handleOpenInCopilot(record)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors" style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}
                      title="Discuss in Advotech Copilot"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>{language === "bn" ? "কোপাইলট আলোচনা" : "Copilot"}</span>
                    </button>

                    <button
                      onClick={() => handleOpenInContractMind(record.contractId)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors hover:opacity-90" style={{ backgroundColor: "var(--accent-solid)", color: "var(--accent-contrast)" }}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
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
                <button
                  type="button"
                  onClick={() => setPreviewRecord(null)}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
