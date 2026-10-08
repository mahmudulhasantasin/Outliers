"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { SAMPLE_CONTRACTS, SampleContract } from "@/data/sampleContracts";
import { CONTRACT_AUDITS, ContractAudit, ClauseAudit } from "@/data/contractAudits";
import { STATUTORY_PROVISIONS } from "@/data/statutoryProvisions";
import { maskPii } from "@/lib/piiMasker";
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
  BookOpen
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
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setIsLoaded(true);
      }, 700);
    }
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
            citation: clause.statuteCitationEn || ""
          }
        : null
    };

    sessionStorage.setItem("active_audit_contract", JSON.stringify(contextPayload));
    router.push("/copilot");
  };

  return (
    <AppShell className="bg-white" mainClassName="bg-white">
      <div className="w-full min-h-screen bg-white text-neutral-900 pb-32 font-sans">
        
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
              className="w-full bg-neutral-50 hover:bg-neutral-100/80 transition-all duration-200 rounded-3xl p-12 sm:p-16 flex flex-col items-center justify-center cursor-pointer group shadow-sm mb-12"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-neutral-700 group-hover:scale-105 transition-transform mb-4">
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
                  <p className="text-base font-semibold text-neutral-900 mb-1">
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
                    className="p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-left flex flex-col justify-between h-28 group"
                  >
                    <div>
                      <p className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2">
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

            {/* Back to Upload Bar (Hidden during Print) */}
            <div className="flex items-center justify-between mb-8 print:hidden">
              <button
                onClick={() => setIsLoaded(false)}
                className="text-xs font-medium text-neutral-500 hover:text-black flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "অন্য চুক্তিপত্র আপলোড করুন" : "Upload another agreement"}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPiiMasked(!piiMasked)}
                  className="text-xs font-medium text-neutral-500 hover:text-black flex items-center gap-1 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>{piiMasked ? "PII Masked" : "Raw Text"}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="text-xs font-medium text-neutral-500 hover:text-black flex items-center gap-1 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === "bn" ? "প্রিন্ট / PDF" : "Print / PDF"}</span>
                </button>

                <button
                  onClick={() => handleOpenInCopilot()}
                  className="px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{language === "bn" ? "কোপাইলটে উন্মুক্ত করুন" : "Open in Copilot"}</span>
                </button>
              </div>
            </div>

            {/* Contract Title & Meta (Clean Editorial Header) */}
            <div className="pb-8 border-b border-neutral-100 print:pb-5 print:border-neutral-200">
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mb-2 print:text-neutral-600">
                {language === "bn" ? currentContract.categoryBn : currentContract.categoryEn}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-neutral-950 tracking-tight leading-snug mb-3">
                {language === "bn" ? currentContract.titleBn : currentContract.titleEn}
              </h2>
              <p className="text-xs text-neutral-500 print:text-neutral-700">
                {language === "bn"
                  ? `পক্ষসমূহ: ${piiMasked ? "[REDACTED_PARTY_A] ও [REDACTED_PARTY_B]" : `${currentContract.parties.firstPartyBn} ও ${currentContract.parties.secondPartyBn}`}`
                  : `Parties: ${piiMasked ? "[REDACTED_PARTY_A] & [REDACTED_PARTY_B]" : `${currentContract.parties.firstPartyEn} & ${currentContract.parties.secondPartyEn}`}`}
              </p>
            </div>

            {/* Executive Legal Audit Summary (Borderless Minimal Section) */}
            <div className="py-8 border-b border-neutral-100 print:py-5 print:border-neutral-200 space-y-4 break-inside-avoid print-avoid-break">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-lg font-serif font-semibold text-neutral-950">
                    {language === "bn" ? currentAudit.riskGradeBn : currentAudit.riskGradeEn}
                  </h3>
                  <span className="text-xs text-neutral-400 print:text-neutral-600 font-sans font-medium">
                    ({currentAudit.riskScore}/100 Risk Score)
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-500 print:text-neutral-700 font-medium">
                  <span>{currentAudit.stats.highRiskCount} {language === "bn" ? "উচ্চ ঝুঁকি" : "High Risk"}</span>
                  <span>·</span>
                  <span>{currentAudit.stats.mediumRiskCount} {language === "bn" ? "পর্যালোচনা প্রয়োজন" : "Review Needed"}</span>
                  <span>·</span>
                  <span>{currentAudit.stats.compliantCount} {language === "bn" ? "আইনসম্মত" : "Compliant"}</span>
                </div>
              </div>

              <p className="text-sm text-neutral-600 print:text-neutral-800 leading-relaxed font-sans">
                {language === "bn" ? currentAudit.summaryBn : currentAudit.summaryEn}
              </p>
            </div>

            {/* Clauses List (Pure Natural Document Flow - Zero Page Breaks Mid-Clause) */}
            <div className="divide-y divide-neutral-100 print:divide-neutral-200">
              {currentAudit.clauses.map((clause) => {
                const statProvision = clause.statutoryReferenceId
                  ? STATUTORY_PROVISIONS[clause.statutoryReferenceId]
                  : null;

                const hasIssue = clause.riskLevel === "HIGH" || clause.riskLevel === "MEDIUM";

                return (
                  <div
                    key={clause.id}
                    id={`clause-${clause.id}`}
                    className="py-10 space-y-5 print:py-6 print:space-y-3 break-inside-avoid print-avoid-break"
                  >
                    {/* Clause Header: Title & Status */}
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-neutral-400 print:text-neutral-600">
                          § {clause.clauseNumber}
                        </span>
                        <h4 className="text-base sm:text-lg font-serif font-medium text-neutral-950">
                          {language === "bn" ? clause.titleBn : clause.titleEn}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-neutral-500 print:text-neutral-700">
                          {clause.riskLevel === "HIGH"
                            ? language === "bn"
                              ? "উচ্চ ঝুঁকি"
                              : "High Risk"
                            : clause.riskLevel === "MEDIUM"
                            ? language === "bn"
                              ? "পর্যালোচনা প্রয়োজন"
                              : "Review Needed"
                            : language === "bn"
                            ? "আইনসম্মত"
                            : "Compliant"}
                        </span>

                        {hasIssue && (
                          <button
                            onClick={() => handleOpenInCopilot(clause)}
                            className="text-neutral-400 hover:text-black transition-colors print:hidden"
                            title="Discuss in Legal Copilot"
                          >
                            <Bot className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Original Contract Verbatim (Styled as a clean legal quote) */}
                    <div className="pl-4 border-l-2 border-neutral-200 print:border-neutral-400">
                      <p className="font-serif text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap">
                        {piiMasked
                          ? maskPii(clause.originalText, true).redactedText
                          : clause.originalText}
                      </p>
                    </div>

                    {/* Legal Finding & Redline (Only for clauses with issues) */}
                    {hasIssue ? (
                      <div className="space-y-4 print:space-y-2.5 pt-1">
                        {/* Statute Citation */}
                        {clause.statuteCitationEn && (
                          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-neutral-400 print:text-neutral-700" />
                            <span className="font-medium text-neutral-400 print:text-neutral-600">Statute:</span>
                            <span className="text-neutral-800 font-semibold">
                              {language === "bn" ? clause.statuteCitationBn : clause.statuteCitationEn}
                            </span>
                            {statProvision && (
                              <a
                                href={statProvision.bdlawsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-black ml-1 inline-flex items-center print:hidden"
                                title="View on official bdlaws portal"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Analysis Body */}
                        <p className="text-xs sm:text-[13px] text-neutral-600 print:text-neutral-800 leading-relaxed font-sans">
                          {language === "bn" ? clause.detailedAnalysisBn : clause.detailedAnalysisEn}
                        </p>

                        {/* Proposed Safe Redline */}
                        {(clause.redlineSuggestionEn || clause.redlineSuggestionBn) && (
                          <div className="p-4 rounded-xl bg-neutral-50 print:bg-neutral-50 print:border print:border-neutral-300 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 print:text-neutral-700 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-neutral-600" />
                                {language === "bn" ? "প্রস্তাবিত নিরাপদ ক্লজ (Redline):" : "Proposed Safe Redline:"}
                              </span>

                              <button
                                onClick={() => handleCopyRedline(clause)}
                                className="text-xs font-medium text-neutral-500 hover:text-black flex items-center gap-1 transition-colors print:hidden"
                              >
                                {copiedClauseId === clause.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-black" />
                                    <span>{language === "bn" ? "কপি হয়েছে" : "Copied"}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>{language === "bn" ? "কপি করুন" : "Copy"}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="text-xs sm:text-[13px] leading-relaxed text-neutral-800 font-sans font-medium">
                              {language === "bn"
                                ? clause.redlineSuggestionBn || clause.redlineSuggestionEn
                                : clause.redlineSuggestionEn}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 print:text-neutral-600 font-sans">
                        {language === "bn"
                          ? "✓ প্রাসঙ্গিক আইনের মানদণ্ডের সাথে সঙ্গতিপূর্ণ।"
                          : "✓ Fully compliant with statutory standards."}
                      </p>
                    )}

                  </div>
                );
              })}
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
