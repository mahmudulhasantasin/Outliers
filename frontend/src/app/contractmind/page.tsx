"use client";

import React, { useState, useRef } from "react";
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
          /* STATE 2: ACTIVE CONTRACT ANALYSIS VIEW (NATURAL FULL-PAGE FLOW)      */
          /* ==================================================================== */
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">

            {/* Top Navigation & Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-black/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsLoaded(false)}
                  className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                  title="Upload another contract"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-normal text-neutral-950">
                    {language === "bn" ? currentContract.titleBn : currentContract.titleEn}
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans mt-0.5">
                    {language === "bn" ? currentContract.categoryBn : currentContract.categoryEn}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPiiMasked(!piiMasked)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    piiMasked
                      ? "bg-neutral-100 text-neutral-800"
                      : "bg-neutral-50 text-neutral-400 hover:text-black"
                  }`}
                  title="Toggle client-side entity redaction"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{piiMasked ? "PII Masked" : "Raw Text"}</span>
                </button>

                <button
                  onClick={() => handleOpenInCopilot()}
                  className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Bot className="w-3.5 h-3.5 text-white" />
                  <span>{language === "bn" ? "কোপাইলটে উন্মুক্ত করুন" : "Open in Copilot"}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                  title="Print / Save Audit"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Executive Risk Health Summary Card */}
            <div className="p-7 rounded-3xl bg-neutral-50 space-y-4 mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                    {language === "bn" ? "সার্বিক অডিট মূল্যায়ন" : "Executive Audit Assessment"}
                  </span>
                  <h3 className="text-xl font-bold font-serif text-neutral-950">
                    {language === "bn" ? currentAudit.riskGradeBn : currentAudit.riskGradeEn}
                  </h3>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold font-serif text-neutral-950">
                    {currentAudit.riskScore}
                  </span>
                  <span className="text-sm text-neutral-400 font-medium">/ 100 Risk Score</span>
                </div>
              </div>

              <p className="text-sm text-neutral-600 leading-relaxed font-sans">
                {language === "bn" ? currentAudit.summaryBn : currentAudit.summaryEn}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-neutral-500 font-medium border-t border-black/5">
                <span>
                  {currentAudit.stats.highRiskCount} {language === "bn" ? "উচ্চ ঝুঁকিপূর্ণ ধারা" : "High Risk Clauses"}
                </span>
                <span>·</span>
                <span>
                  {currentAudit.stats.mediumRiskCount} {language === "bn" ? "পর্যালোচনা প্রয়োজন" : "Review Needed"}
                </span>
                <span>·</span>
                <span>
                  {currentAudit.stats.compliantCount} {language === "bn" ? "আইনসম্মত ধারা" : "Compliant"}
                </span>
              </div>
            </div>

            {/* Clauses Natural Document Flow (No restricted boxes or internal scrollbars!) */}
            <div className="space-y-8">
              {currentAudit.clauses.map((clause) => {
                const statProvision = clause.statutoryReferenceId
                  ? STATUTORY_PROVISIONS[clause.statutoryReferenceId]
                  : null;

                const hasIssue = clause.riskLevel === "HIGH" || clause.riskLevel === "MEDIUM";

                return (
                  <div
                    key={clause.id}
                    id={`clause-${clause.id}`}
                    className="p-8 rounded-3xl bg-neutral-50/70 transition-all hover:bg-neutral-50"
                  >
                    {/* Clause Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-black/5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold text-neutral-400">
                          Clause {clause.clauseNumber}
                        </span>
                        <h4 className="text-lg font-bold font-serif text-neutral-950">
                          {language === "bn" ? clause.titleBn : clause.titleEn}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-700 bg-white px-3 py-1 rounded-full shadow-sm">
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
                            className="p-1.5 rounded-full bg-white hover:bg-neutral-200 text-neutral-800 transition-colors shadow-sm"
                            title="Discuss in Legal Copilot"
                          >
                            <Bot className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Verbatim Contract Text */}
                    <div className="mb-6">
                      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                        {language === "bn" ? "চুক্তির মূল টেক্সট (Verbatim):" : "Contract Verbatim:"}
                      </span>
                      <p className="font-serif text-sm leading-relaxed text-neutral-800 bg-white p-5 rounded-2xl shadow-sm whitespace-pre-wrap">
                        {piiMasked
                          ? maskPii(clause.originalText, true).redactedText
                          : clause.originalText}
                      </p>
                    </div>

                    {/* Statutory Finding & Analysis (if flagged) */}
                    {hasIssue && (
                      <div className="space-y-4">
                        {/* Statutory Reference Tag */}
                        {clause.statuteCitationEn && (
                          <div className="text-xs text-neutral-800 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
                            <span className="text-neutral-400 font-medium">Statute:</span>
                            <span className="font-semibold text-neutral-950">
                              {language === "bn" ? clause.statuteCitationBn : clause.statuteCitationEn}
                            </span>
                            {statProvision && (
                              <a
                                href={statProvision.bdlawsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-black ml-1"
                                title="View on official bdlaws portal"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Legal Finding Explanation */}
                        <div className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed font-sans">
                          <p>{language === "bn" ? clause.detailedAnalysisBn : clause.detailedAnalysisEn}</p>
                        </div>

                        {/* Proposed Safe Redline Rewrite Box */}
                        {(clause.redlineSuggestionEn || clause.redlineSuggestionBn) && (
                          <div className="mt-4 p-5 rounded-2xl bg-white space-y-2.5 shadow-sm border-l-2 border-neutral-400">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-neutral-800" />
                                {language === "bn" ? "প্রস্তাবিত নিরাপদ ক্লজ (Redline):" : "Proposed Safe Redline:"}
                              </span>

                              <button
                                onClick={() => handleCopyRedline(clause)}
                                className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-neutral-100 transition-colors"
                              >
                                {copiedClauseId === clause.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-black" />
                                    <span>{language === "bn" ? "কপি হয়েছে!" : "Copied!"}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>{language === "bn" ? "কপি করুন" : "Copy Redline"}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="text-xs sm:text-[13px] leading-relaxed text-neutral-900 font-sans">
                              {language === "bn"
                                ? clause.redlineSuggestionBn || clause.redlineSuggestionEn
                                : clause.redlineSuggestionEn}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </AppShell>
  );
}
