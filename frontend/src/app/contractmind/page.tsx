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
  ShieldCheck,
  Lock,
  Search,
  Sparkles
} from "lucide-react";

export default function ContractMindPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial stage: no contract loaded by default
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [selectedContractId, setSelectedContractId] = useState<string>("employment-agreement");
  const [selectedClauseId, setSelectedClauseId] = useState<string>("emp-c3");
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [piiMasked, setPiiMasked] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Current contract & audit
  const currentContract: SampleContract =
    SAMPLE_CONTRACTS.find((c) => c.id === selectedContractId) || SAMPLE_CONTRACTS[0];
  const currentAudit: ContractAudit =
    CONTRACT_AUDITS[selectedContractId] || CONTRACT_AUDITS["employment-agreement"];

  // Load a contract (dummy data until backend is ready)
  const handleLoadContract = (contractId: string) => {
    setSelectedContractId(contractId);
    const audit = CONTRACT_AUDITS[contractId];
    if (audit && audit.clauses.length > 0) {
      setSelectedClauseId(audit.clauses[0].id);
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsLoaded(true);
    }, 600);
  };

  // Handle file drop or selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setIsLoaded(true);
      }, 800);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setIsLoaded(true);
      }, 800);
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

  // Filter clauses by search
  const displayedClauses = currentAudit.clauses.filter((clause) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      clause.titleEn.toLowerCase().includes(term) ||
      clause.titleBn.toLowerCase().includes(term) ||
      clause.originalText.toLowerCase().includes(term) ||
      clause.detailedAnalysisEn.toLowerCase().includes(term)
    );
  });

  return (
    <AppShell>
      <div className="w-full min-h-screen bg-white text-neutral-900 pb-24 font-sans">
        
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
          /* STATE 2: ACTIVE CONTRACT ANALYSIS VIEW (SHOWN AFTER FILE IS LOADED)  */
          /* ==================================================================== */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">

            {/* Top Minimal Action Header */}
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
                  <p className="text-xs text-neutral-400 font-sans">
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

            {/* Spacious Split-Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* LEFT PANE: Clean Verbatim Document Viewer (5 cols) */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    {language === "bn" ? "চুক্তির মূল খসড়া" : "Contract Verbatim Text"}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {currentAudit.clauses.length} {language === "bn" ? "টি ধারা" : "clauses"}
                  </span>
                </div>

                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {currentAudit.clauses.map((clause) => {
                    const isSelected = clause.id === selectedClauseId;

                    return (
                      <div
                        key={clause.id}
                        onClick={() => setSelectedClauseId(clause.id)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "bg-neutral-100/90 shadow-sm"
                            : "bg-neutral-50/60 hover:bg-neutral-100/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-neutral-900 font-sans">
                            Clause {clause.clauseNumber}: {language === "bn" ? clause.titleBn : clause.titleEn}
                          </span>
                          <span className="text-[11px] font-medium text-neutral-500">
                            {clause.riskLevel === "HIGH"
                              ? "High Risk"
                              : clause.riskLevel === "MEDIUM"
                              ? "Review"
                              : "Compliant"}
                          </span>
                        </div>

                        <p className="font-serif text-xs leading-relaxed text-neutral-700 whitespace-pre-wrap">
                          {piiMasked
                            ? maskPii(clause.originalText, true).redactedText
                            : clause.originalText}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT PANE: Statutory Audit & Safe Redlines (7 cols) */}
              <div className="lg:col-span-7 flex flex-col space-y-6">

                {/* Executive Risk Health Summary Banner */}
                <div className="p-6 rounded-3xl bg-neutral-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-0.5">
                        {language === "bn" ? "অডিট ফলাফল" : "Audit Finding"}
                      </span>
                      <h3 className="text-lg font-bold font-serif text-neutral-950">
                        {language === "bn" ? currentAudit.riskGradeBn : currentAudit.riskGradeEn}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-3xl font-bold font-serif text-neutral-950">
                        {currentAudit.riskScore}
                      </span>
                      <span className="text-xs text-neutral-400"> / 100</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans">
                    {language === "bn" ? currentAudit.summaryBn : currentAudit.summaryEn}
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={language === "bn" ? "ধারা ও আইনি বিষয় অনুসন্ধান..." : "Search findings & statutory clauses..."}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 outline-none focus:bg-neutral-100 transition-colors"
                  />
                </div>

                {/* Detailed Findings & Redline Proposals */}
                <div className="space-y-5">
                  {displayedClauses.map((clause) => {
                    const isSelected = clause.id === selectedClauseId;
                    const statProvision = clause.statutoryReferenceId
                      ? STATUTORY_PROVISIONS[clause.statutoryReferenceId]
                      : null;

                    return (
                      <div
                        key={clause.id}
                        onClick={() => setSelectedClauseId(clause.id)}
                        className={`p-6 rounded-3xl bg-neutral-50/70 transition-all ${
                          isSelected ? "bg-neutral-100/90 shadow-sm" : "hover:bg-neutral-100/60"
                        }`}
                      >
                        {/* Title and Action */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className="text-[11px] font-semibold text-neutral-400 block mb-0.5">
                              Clause {clause.clauseNumber}
                            </span>
                            <h4 className="text-base font-bold font-serif text-neutral-950">
                              {language === "bn" ? clause.titleBn : clause.titleEn}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-neutral-600 bg-white px-2.5 py-1 rounded-lg shadow-sm">
                              {clause.riskLevel === "HIGH"
                                ? "High Risk"
                                : clause.riskLevel === "MEDIUM"
                                ? "Review Needed"
                                : "Compliant"}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenInCopilot(clause);
                              }}
                              className="p-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-800 transition-colors shadow-sm"
                              title="Ask Copilot about this clause"
                            >
                              <Bot className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Statutory Reference Link */}
                        {clause.statuteCitationEn && (
                          <div className="mb-3 text-xs text-neutral-700 flex items-center gap-1.5">
                            <span className="text-neutral-400 font-medium">Statute:</span>
                            <span className="font-semibold text-neutral-900">
                              {language === "bn" ? clause.statuteCitationBn : clause.statuteCitationEn}
                            </span>
                            {statProvision && (
                              <a
                                href={statProvision.bdlawsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-black ml-0.5"
                                title="View bdlaws official provision"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Legal Analysis Body */}
                        <p className="text-xs text-neutral-600 leading-relaxed font-sans mb-4">
                          {language === "bn" ? clause.detailedAnalysisBn : clause.detailedAnalysisEn}
                        </p>

                        {/* Redline Suggestion Box */}
                        {(clause.redlineSuggestionEn || clause.redlineSuggestionBn) && (
                          <div className="p-4 rounded-2xl bg-white space-y-2 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-neutral-700" />
                                {language === "bn" ? "প্রস্তাবিত নিরাপদ ক্লজ" : "Proposed Safe Redline"}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyRedline(clause);
                                }}
                                className="text-[11px] font-semibold text-neutral-700 hover:text-black flex items-center gap-1"
                              >
                                {copiedClauseId === clause.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-black" />
                                    <span>{language === "bn" ? "কপি সম্পন্ন" : "Copied"}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>{language === "bn" ? "কপি করুন" : "Copy"}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="text-xs leading-relaxed text-neutral-800 font-sans">
                              {language === "bn"
                                ? clause.redlineSuggestionBn || clause.redlineSuggestionEn
                                : clause.redlineSuggestionEn}
                            </p>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </AppShell>
  );
}
