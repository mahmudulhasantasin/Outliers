"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { SAMPLE_CONTRACTS, SampleContract } from "@/data/sampleContracts";
import { CONTRACT_AUDITS, ContractAudit, ClauseAudit } from "@/data/contractAudits";
import { STATUTORY_PROVISIONS } from "@/data/statutoryProvisions";
import { maskPii } from "@/lib/piiMasker";
import MarkdownViewer from "@/components/markdown/MarkdownViewer";
import { generateContractAuditMarkdown } from "@/lib/markdownContractGenerator";
import { runDispatchAlgorithm, INITIAL_DEMO_LAWYERS, DispatchDecision } from "@/lib/dispatcher";
import {
  FileText,
  Upload,
  ArrowLeft,
  Bot,
  Copy,
  Check,
  Printer,
  ExternalLink,
  Lock,
  Sparkles,
  BookOpen,
  Send,
  CheckCircle2,
  Shield,
  Download,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function ContractMindPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial stage: no contract loaded by default
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [selectedContractId, setSelectedContractId] = useState<string>("employment-agreement");
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [piiMasked, setPiiMasked] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchedDecision, setDispatchedDecision] = useState<DispatchDecision | null>(null);
  const [lawyerSealApplied, setLawyerSealApplied] = useState<boolean>(false);

  // Check URL query parameter (e.g. ?id=vendor-sla)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const contractId = params.get("id");
      if (contractId && CONTRACT_AUDITS[contractId]) {
        setSelectedContractId(contractId);
        setIsLoaded(true);
      }
    }
  }, []);

  // Current contract & audit
  const currentContract: SampleContract =
    SAMPLE_CONTRACTS.find((c) => c.id === selectedContractId) || SAMPLE_CONTRACTS[0];
  const currentAudit: ContractAudit =
    CONTRACT_AUDITS[selectedContractId] || CONTRACT_AUDITS["employment-agreement"];

  // Load a contract (dummy data until backend is ready)
  const handleLoadContract = (contractId: string) => {
    setSelectedContractId(contractId);
    setDispatchedDecision(null);
    setLawyerSealApplied(false);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsLoaded(true);
    }, 500);
  };

  // Handle file drop or selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDispatchedDecision(null);
      setLawyerSealApplied(false);
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setIsLoaded(true);
      }, 700);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDispatchedDecision(null);
      setLawyerSealApplied(false);
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setIsLoaded(true);
      }, 700);
    }
  };

  // Dispatch to advocate via matching algorithm
  const handleSendToAdvocate = () => {
    setIsDispatching(true);
    setTimeout(() => {
      const domainMap: Record<string, string> = {
        "employment-agreement": "LABOUR_EMPLOYMENT",
        "vendor-sla": "IP_ICT",
        "commercial-lease": "REAL_ESTATE_PROPERTY",
      };
      const domain = domainMap[selectedContractId] || "CORPORATE_COMMERCIAL";

      const decision = runDispatchAlgorithm(
        {
          id: currentContract.id,
          userId: "u1",
          title: currentContract.titleEn,
          domain: domain,
          statuteReference: currentContract.categoryEn,
          riskCount: currentAudit.stats.highRiskCount,
          priority: currentAudit.stats.highRiskCount > 2 ? "HIGH" : "NORMAL",
        },
        INITIAL_DEMO_LAWYERS
      );

      setDispatchedDecision(decision);
      setIsDispatching(false);

      // Persist to local lawyer pending queue for demo inspection
      if (typeof window !== "undefined") {
        const existing = JSON.parse(
          localStorage.getItem("dispatched_pending_contracts") || "[]"
        );
        const newEntry = {
          id: `cnt-${Date.now().toString().slice(-4)}`,
          clientName: "Mahmud Hasan (Client)",
          clientPhone: "+880 1712-345678",
          titleEn: currentContract.titleEn,
          titleBn: currentContract.titleBn,
          submittedAtEn: "Just now",
          submittedAtBn: "মাত্র এখন",
          statuteEn: currentContract.categoryEn,
          statuteBn: currentContract.categoryBn,
          riskCount: currentAudit.stats.highRiskCount,
          priority: currentAudit.stats.highRiskCount > 2 ? "high" : "normal",
          contractId: currentContract.id,
        };
        localStorage.setItem(
          "dispatched_pending_contracts",
          JSON.stringify([newEntry, ...existing])
        );
      }
    }, 600);
  };

  // Download full contract audit report
  const handleDownloadReport = () => {
    const blob = new Blob([markdownAuditContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${currentContract.id}-statutory-audit.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy redline text
  const handleCopyRedline = (clause: ClauseAudit) => {
    const textToCopy =
      language === "bn"
        ? clause.redlineSuggestionBn || clause.redlineSuggestionEn || ""
        : clause.redlineSuggestionEn || "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedClauseId(clause.id);
      setTimeout(() => setCopiedClauseId(null), 2000);
    }
  };

  // Open contract in Legal Copilot
  const handleOpenInCopilot = (clause?: ClauseAudit) => {
    const contextPayload = {
      contractId: currentContract.id,
      titleEn: currentContract.titleEn,
      titleBn: currentContract.titleBn,
      clauseFocus: clause
        ? {
            id: clause.id,
            title: language === "bn" ? clause.titleBn : clause.titleEn,
            text: clause.originalText,
            citation: clause.statuteCitationEn || "",
          }
        : null,
    };

    sessionStorage.setItem("active_audit_contract", JSON.stringify(contextPayload));
    router.push("/copilot");
  };

  // Generate markdown audit representation
  const markdownAuditContent = generateContractAuditMarkdown(
    currentContract.id,
    language as "en" | "bn",
    dispatchedDecision
      ? {
          advocateName: dispatchedDecision.lawyer.name,
          barCouncilNo: dispatchedDecision.lawyer.barCouncilNo,
          verifiedAt: "18 Oct 2026, 4:52 PM",
          sealApplied: lawyerSealApplied,
          advocateNotes: lawyerSealApplied
            ? "Reviewed and cross-examined against relevant Bangladesh Statutes. Redlines confirmed lawful."
            : undefined,
        }
      : undefined
  );

  return (
    <AppShell>
      <div className="w-full min-h-screen pb-32 font-sans" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* ==================================================================== */}
        {/* STATE 1: INITIAL UPLOAD STAGE (DEFAULT BEFORE ANY CONTRACT IS LOADED) */}
        {/* ==================================================================== */}
        {!isLoaded ? (
          <div className="max-w-3xl mx-auto pt-16 sm:pt-24 px-4 flex flex-col items-center text-center">
            
            {/* Header */}
            <h1 className="text-4xl sm:text-5xl font-serif font-normal text-black tracking-tight mb-3">
              {language === "bn" ? "কন্ট্রাক্টমাইন্ড" : "ContractMind"}
            </h1>
            <p className="text-base sm:text-lg text-neutral-500 max-w-xl mx-auto font-sans leading-relaxed mb-12">
              {language === "bn"
                ? "চুক্তিপত্র আপলোড করে বাংলাদেশ শ্রম ও চুক্তি আইনের আলোকে স্বয়ংক্রিয় অডিট ও নিরাপদ রেডলাইন প্রস্তুত করুন।"
                : "Upload any contract to audit statutory violations and generate compliant redlines under Bangladesh law."}
            </p>

            {/* Expansive Clean Drag & Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full transition-all duration-200 rounded-3xl p-12 sm:p-16 flex flex-col items-center justify-center cursor-pointer group shadow-sm mb-12" style={{ backgroundColor: "var(--bg-surface)" }}
            >
              <div className="w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform mb-4" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}>
                <Upload className="w-6 h-6 stroke-[2]" />
              </div>

              {isAnalyzing ? (
                <div className="space-y-2 text-center py-2">
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-300 border-t-black animate-spin mx-auto" />
                  <p className="text-sm font-medium text-neutral-800">
                    {language === "bn"
                      ? "চুক্তি বিশ্লেষণ ও ধারা পরীক্ষা করা হচ্ছে..."
                      : "Evaluating clauses against statutory provisions..."}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    {language === "bn"
                      ? "চুক্তির ফাইল এখানে ড্রপ করুন অথবা ব্রাউজ করুন"
                      : "Drop contract PDF or DOCX here, or browse"}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {language === "bn"
                      ? "সর্বোচ্চ ১৫ মেগাবাইট · ক্লায়েন্ট-সাইড PII প্রটেকশন"
                      : "Supports PDF, DOCX, TXT · Client-side PII privacy"}
                  </p>
                  <button
                    type="button"
                    className="mt-6 px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    {language === "bn" ? "ফাইল নির্বাচন করুন" : "Browse Files"}
                  </button>
                </>
              )}
            </div>

            {/* Sample Contract Test Cards */}
            <div className="w-full max-w-2xl text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-3 text-center sm:text-left">
                {language === "bn"
                  ? "অথবা একটি নমুনা চুক্তিপত্র নির্বাচন করুন:"
                  : "Or test with a sample Bangladesh agreement:"}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_CONTRACTS.map((contract) => (
                  <button
                    key={contract.id}
                    onClick={() => handleLoadContract(contract.id)}
                    className="p-4 rounded-2xl transition-colors text-left flex flex-col justify-between h-28 group" style={{ backgroundColor: "var(--bg-surface)" }}
                  >
                    <div>
                      <p className="text-xs font-bold leading-snug line-clamp-2" style={{ color: "var(--text-primary)" }}>
                        {language === "bn" ? contract.titleBn : contract.titleEn}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                        {language === "bn" ? contract.categoryBn : contract.categoryEn}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-600 group-hover:text-black transition-colors flex items-center gap-1">
                      {language === "bn" ? "অডিট শুরু করুন →" : "Run audit →"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* ==================================================================== */
          /* STATE 2: ACTIVE CONTRACT ANALYSIS VIEW (BORDERLESS NATURAL READING)  */
          /* ==================================================================== */
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 print:pt-0 print:px-0 print:max-w-none">

            {/* Print-Only Official Legal Audit Memo Header */}
            <div className="hidden print:block pb-6 mb-8 border-b-2 border-neutral-900">
              <div className="flex justify-between items-baseline mb-2 text-xs font-mono uppercase tracking-widest text-neutral-800">
                <span className="font-bold">CONFIDENTIAL ATTORNEY-CLIENT AUDIT MEMORANDUM</span>
                <span>BANGLADESH LAW STATUTORY JURISDICTION</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500 font-sans">
                <span>Audited via ContractMind · Automated Statutory Risk Engine</span>
                <span>Statutes verified against Laws of Bangladesh (bdlaws.minlaw.gov.bd)</span>
              </div>
            </div>

            {/* Back & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
              <button
                onClick={() => setIsLoaded(false)}
                className="text-xs font-medium flex items-center gap-1.5 transition-colors opacity-60 hover:opacity-100 cursor-pointer" style={{ color: "var(--text-primary)" }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "অন্য চুক্তিপত্র আপলোড করুন" : "Upload another agreement"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-[var(--text-primary)]/10 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === "bn" ? "প্রিন্ট" : "Print"}</span>
                </button>

                <button
                  onClick={() => handleOpenInCopilot()}
                  className="px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{language === "bn" ? "কোপাইলট আলোচনা" : "Open in Copilot"}</span>
                </button>
              </div>
            </div>

            {/* Sovereign Contract Statutory Audit Document */}
            <div className="space-y-6">
              <MarkdownViewer content={markdownAuditContent} />
            </div>

            {/* Bottom Actions: Download & Verify by Lawyer */}
            <div className="mt-8 p-6 rounded-3xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-sm print:hidden">
              {!dispatchedDecision ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm sm:text-base font-serif font-bold text-[var(--text-primary)]">
                        {language === "bn" ? "সংবিধিবদ্ধ আইনি যাচাইকরণ ও সিলমোহর" : "Statutory Verification & Advocate Seal"}
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] max-w-xl leading-relaxed">
                      {language === "bn"
                        ? "রিপোর্টটি ডাউনলোড করুন অথবা বাংলাদেশ সুপ্রিম কোর্টের আইনজীবীর কাছে পাঠিয়ে আইনগত মতামত ও অফিসিয়াল সিলমোহর গ্রহণ করুন।"
                        : "Download your contract audit report or dispatch it to an advocate for statutory review and Bar Council seal."}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={handleDownloadReport}
                      className="px-4 py-2.5 rounded-xl border border-[var(--text-primary)]/15 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>{language === "bn" ? "ডাউনলোড রিপোর্ট" : "Download Report"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendToAdvocate}
                      disabled={isDispatching}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 flex items-center gap-2 transition-opacity cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {isDispatching ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          <span>{language === "bn" ? "আইনজীবী নির্বাচন হচ্ছে..." : "Assigning Lawyer..."}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>{language === "bn" ? "লইয়ার দ্বারা ভেরিফাই করুন" : "Verify by Lawyer"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                            {language === "bn"
                              ? "চুক্তিপত্রটি সফলভাবে আইনজীবীর কাছে পাঠানো হয়েছে"
                              : "Contract Dispatched to Advocate"}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                            Assigned: {dispatchedDecision.lawyer.id}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-primary)] mt-1 font-semibold">
                          {dispatchedDecision.lawyer.name} ({dispatchedDecision.lawyer.barCouncilNo})
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {language === "bn"
                            ? "আইনজীবী তার ওয়ার্কস্পেস থেকে চুক্তিটি পর্যালোচনা করে সংবিধিবদ্ধ সিলমোহর প্রদান করবেন।"
                            : "The advocate has received your contract in their pending queue for verification."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleDownloadReport}
                        className="px-3.5 py-2 rounded-xl border border-[var(--text-primary)]/15 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>{language === "bn" ? "ডাউনলোড" : "Download"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/lawyer/pending")}
                        className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{language === "bn" ? "আইনজীবী কিউতে দেখুন →" : "View in Lawyer Queue →"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Official Legal Print Footer */}
            <div className="hidden print:block pt-8 mt-12 border-t border-neutral-300 text-xs text-neutral-500 space-y-1.5 font-sans break-inside-avoid print-avoid-break">
              <div className="flex justify-between items-baseline text-[11px] font-medium text-neutral-700">
                <span>ContractMind · Autonomous Statutory Contract Auditor</span>
                <span>Verified against bdlaws (Government of Bangladesh)</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-normal">
                Notice: This legal audit report is computer-generated based on statutory rules under the Bangladesh Labour Act 2006, The Contract Act 1872, and relevant codified legislation. For formal legal representation or litigation proceedings, consultation with a Supreme Court Advocate is recommended.
              </p>
            </div>

          </div>
        )}

      </div>
    </AppShell>
  );
}

