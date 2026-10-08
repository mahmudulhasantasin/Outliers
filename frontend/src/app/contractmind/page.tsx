"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { SAMPLE_CONTRACTS, SampleContract } from "@/data/sampleContracts";
import { CONTRACT_AUDITS, ContractAudit, ClauseAudit } from "@/data/contractAudits";
import { STATUTORY_PROVISIONS } from "@/data/statutoryProvisions";
import { maskPii } from "@/lib/piiMasker";
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  ExternalLink,
  Bot,
  Upload,
  Printer,
  X,
  Search,
  Sparkles,
  BookOpen,
  Eye,
  EyeOff
} from "lucide-react";

export default function ContractMindPage() {
  const router = useRouter();
  const { language } = useLanguage();

  // State
  const [selectedContractId, setSelectedContractId] = useState<string>("employment-agreement");
  const [selectedClauseId, setSelectedClauseId] = useState<string>("emp-c3");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [piiMasked, setPiiMasked] = useState<boolean>(true);
  const [showPiiModal, setShowPiiModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Active contract & audit data
  const currentContract: SampleContract =
    SAMPLE_CONTRACTS.find((c) => c.id === selectedContractId) || SAMPLE_CONTRACTS[0];

  const currentAudit: ContractAudit =
    CONTRACT_AUDITS[selectedContractId] || CONTRACT_AUDITS["employment-agreement"];

  // PII Redaction calculation
  const piiResult = maskPii(currentContract.sampleText, piiMasked);

  // Filter clauses
  const filteredClauses = currentAudit.clauses.filter((clause) => {
    if (riskFilter !== "ALL" && clause.riskLevel !== riskFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = (clause.titleEn + clause.titleBn).toLowerCase().includes(term);
      const matchText = clause.originalText.toLowerCase().includes(term);
      const matchIssue = (clause.issueSummaryEn + clause.issueSummaryBn).toLowerCase().includes(term);
      return matchTitle || matchText || matchIssue;
    }
    return true;
  });

  // Handle switching contracts
  const handleSelectContract = (id: string) => {
    setIsScanning(true);
    setSelectedContractId(id);
    const audit = CONTRACT_AUDITS[id];
    if (audit && audit.clauses.length > 0) {
      setSelectedClauseId(audit.clauses[0].id);
    }
    setTimeout(() => {
      setIsScanning(false);
    }, 450);
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

  // Navigate to Legal Copilot with this contract context
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
    <AppShell>
      {/* Zero Aurora background - Pure minimalist clean light canvas */}
      <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6">

          {/* Top Header & Executive Control Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-black/5">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl sm:text-3xl font-serif font-normal text-neutral-950 tracking-tight">
                  {language === "bn" ? "কন্ট্রাক্টমাইন্ড" : "ContractMind"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700">
                  {language === "bn" ? "সংবিধিবদ্ধ চুক্তি অডিট" : "Statutory Risk Auditor"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 font-sans">
                {language === "bn"
                  ? "বাংলাদেশ শ্রম আইন ও চুক্তি আইনের আলোকে স্বয়ংক্রিয় ক্লজ অডিট ও নিরাপদ রেডলাইন প্রস্তাবনা"
                  : "Automated clause audit, liability capping checks, and statutory redlines for Bangladesh law"}
              </p>
            </div>

            {/* Quick Global Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* PII Masking Toggle Button */}
              <button
                onClick={() => setShowPiiModal(true)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  piiMasked
                    ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
                title="Client-Side PII Redaction Settings"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {language === "bn"
                    ? `PII মাস্কিং: ${piiMasked ? "সক্রিয়" : "বন্ধ"} (${piiResult.stats.totalRedactions})`
                    : `PII Redaction: ${piiMasked ? "Active" : "Off"} (${piiResult.stats.totalRedactions})`}
                </span>
              </button>

              {/* Upload Agreement Button */}
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-neutral-100 text-neutral-800 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-neutral-600" />
                <span>{language === "bn" ? "নতুন চুক্তি আপলোড" : "Upload Agreement"}</span>
              </button>

              {/* Open in Legal Copilot */}
              <button
                onClick={() => handleOpenInCopilot()}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-black hover:bg-neutral-800 text-white flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Bot className="w-3.5 h-3.5 text-white" />
                <span>{language === "bn" ? "কোপাইলটে উন্মুক্ত করুন" : "Open in Copilot"}</span>
              </button>

              {/* Print / Export Audit */}
              <button
                onClick={() => window.print()}
                className="p-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 transition-colors shadow-sm"
                title="Export or Print Audit Report"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sample Contracts Selector Bar */}
          <div className="py-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1">
              {language === "bn" ? "নমুনা চুক্তিপত্র:" : "Sample Contracts:"}
            </span>
            {SAMPLE_CONTRACTS.map((contract) => {
              const isSelected = contract.id === selectedContractId;
              const audit = CONTRACT_AUDITS[contract.id];
              return (
                <button
                  key={contract.id}
                  onClick={() => handleSelectContract(contract.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all shadow-sm ${
                    isSelected
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <FileText className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-neutral-400"}`} />
                  <span>{language === "bn" ? contract.titleBn : contract.titleEn}</span>
                  {audit && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : audit.riskScore > 75
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {audit.riskScore}/100
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Workspace: Split-Screen View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">

            {/* LEFT COLUMN: Document & Clause Verbatim Inspector (5 cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <div className="bg-white rounded-3xl p-5 shadow-sm flex flex-col h-[calc(100vh-230px)]">

                {/* Left Header Controls */}
                <div className="flex items-center justify-between pb-3 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-black" />
                    <span className="text-xs font-semibold text-neutral-900">
                      {language === "bn" ? "চুক্তির মূল খসড়া" : "Contract Verbatim Text"}
                    </span>
                  </div>

                  {/* Masking View Toggle */}
                  <button
                    onClick={() => setPiiMasked(!piiMasked)}
                    className="text-[11px] font-semibold text-neutral-500 hover:text-black flex items-center gap-1 transition-colors"
                  >
                    {piiMasked ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{language === "bn" ? "মাস্কিং সক্রিয়" : "PII Masked"}</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{language === "bn" ? "আসল টেক্সট" : "Raw Text"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Contract Meta Card */}
                <div className="py-3 px-3.5 mt-3 rounded-2xl bg-neutral-50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">
                      {language === "bn" ? currentContract.titleBn : currentContract.titleEn}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-medium">
                      {language === "bn" ? currentContract.categoryBn : currentContract.categoryEn}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    <span className="font-medium text-neutral-700">
                      {language === "bn" ? "পক্ষসমূহ: " : "Parties: "}
                    </span>
                    {piiMasked ? (
                      <span>[REDACTED_PARTY_A] & [REDACTED_PARTY_B]</span>
                    ) : (
                      <span>
                        {language === "bn"
                          ? `${currentContract.parties.firstPartyBn} ও ${currentContract.parties.secondPartyBn}`
                          : `${currentContract.parties.firstPartyEn} & ${currentContract.parties.secondPartyEn}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Clause Navigation Jump Pills */}
                <div className="pt-3 pb-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-semibold uppercase text-neutral-400 mr-1">
                    {language === "bn" ? "ধারা তালিকা:" : "Clauses:"}
                  </span>
                  {currentAudit.clauses.map((clause) => {
                    const isSelected = clause.id === selectedClauseId;
                    const badgeColor =
                      clause.riskLevel === "HIGH"
                        ? "bg-rose-100 text-rose-800"
                        : clause.riskLevel === "MEDIUM"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800";

                    return (
                      <button
                        key={clause.id}
                        onClick={() => setSelectedClauseId(clause.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          isSelected
                            ? "bg-black text-white shadow-sm"
                            : `${badgeColor} hover:opacity-80`
                        }`}
                      >
                        <span>Clause {clause.clauseNumber}</span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            clause.riskLevel === "HIGH"
                              ? "bg-rose-500"
                              : clause.riskLevel === "MEDIUM"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Verbatim Document Reader View */}
                <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-4 font-mono text-xs leading-relaxed text-neutral-800">
                  {currentAudit.clauses.map((clause) => {
                    const isSelected = clause.id === selectedClauseId;
                    const riskBg =
                      clause.riskLevel === "HIGH"
                        ? "bg-rose-50/70"
                        : clause.riskLevel === "MEDIUM"
                        ? "bg-amber-50/70"
                        : "bg-neutral-50/70";

                    return (
                      <div
                        key={clause.id}
                        onClick={() => setSelectedClauseId(clause.id)}
                        className={`p-3.5 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? "ring-2 ring-black bg-white shadow-md"
                            : `${riskBg} hover:bg-neutral-100/80`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-sans font-bold text-neutral-900 text-xs">
                            Clause {clause.clauseNumber}: {language === "bn" ? clause.titleBn : clause.titleEn}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              clause.riskLevel === "HIGH"
                                ? "bg-rose-100 text-rose-700"
                                : clause.riskLevel === "MEDIUM"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {clause.riskLevel}
                          </span>
                        </div>
                        <p className="font-serif text-neutral-700 text-xs leading-relaxed whitespace-pre-wrap">
                          {piiMasked
                            ? maskPii(clause.originalText, true).redactedText
                            : clause.originalText}
                        </p>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: Statutory Audit, Redline Proposal & Obligations (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-5">

              {/* Overall Executive Risk Health Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        currentAudit.riskScore > 75
                          ? "bg-rose-100 text-rose-800"
                          : currentAudit.riskScore > 50
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {language === "bn" ? currentAudit.riskGradeBn : currentAudit.riskGradeEn}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {language === "bn"
                        ? `মোট ${currentAudit.stats.totalClauses}টি ধারা পরীক্ষিত`
                        : `${currentAudit.stats.totalClauses} clauses evaluated`}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans">
                    {language === "bn" ? currentAudit.summaryBn : currentAudit.summaryEn}
                  </p>
                </div>

                {/* Risk Score Circle Gauge */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-neutral-50 shadow-inner">
                    <div className="text-center">
                      <span className="text-2xl font-bold font-serif text-neutral-950 block leading-none">
                        {currentAudit.riskScore}
                      </span>
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                        / 100
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-neutral-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>
                        {currentAudit.stats.highRiskCount} {language === "bn" ? "উচ্চ ঝুঁকি" : "High Risk"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>
                        {currentAudit.stats.mediumRiskCount} {language === "bn" ? "মাঝারি ঝুঁকি" : "Medium Risk"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>
                        {currentAudit.stats.compliantCount} {language === "bn" ? "নিরাপদ ধারা" : "Compliant"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clause Filter Pills & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setRiskFilter("ALL")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      riskFilter === "ALL"
                        ? "bg-black text-white shadow-sm"
                        : "bg-white text-neutral-600 hover:bg-neutral-100 shadow-sm"
                    }`}
                  >
                    {language === "bn" ? "সকল ধারা" : "All Clauses"} ({currentAudit.clauses.length})
                  </button>
                  <button
                    onClick={() => setRiskFilter("HIGH")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      riskFilter === "HIGH"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-white text-neutral-600 hover:bg-rose-50 shadow-sm"
                    }`}
                  >
                    {language === "bn" ? "উচ্চ ঝুঁকি" : "High Risk"} ({currentAudit.stats.highRiskCount})
                  </button>
                  <button
                    onClick={() => setRiskFilter("MEDIUM")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      riskFilter === "MEDIUM"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-white text-neutral-600 hover:bg-amber-50 shadow-sm"
                    }`}
                  >
                    {language === "bn" ? "মাঝারি ঝুঁকি" : "Medium Risk"} ({currentAudit.stats.mediumRiskCount})
                  </button>
                  <button
                    onClick={() => setRiskFilter("COMPLIANT")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      riskFilter === "COMPLIANT"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white text-neutral-600 hover:bg-emerald-50 shadow-sm"
                    }`}
                  >
                    {language === "bn" ? "নিরাপদ" : "Compliant"} ({currentAudit.stats.compliantCount})
                  </button>
                </div>

                {/* Inline Search Input */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={language === "bn" ? "ধারা অনুসন্ধান..." : "Search clauses..."}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white shadow-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-black"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Detailed Clause Audit & Redline Cards List */}
              <div className="space-y-4">
                {filteredClauses.map((clause) => {
                  const isFocused = clause.id === selectedClauseId;
                  const statProvision = clause.statutoryReferenceId
                    ? STATUTORY_PROVISIONS[clause.statutoryReferenceId]
                    : null;

                  return (
                    <div
                      key={clause.id}
                      id={`audit-card-${clause.id}`}
                      className={`p-6 rounded-3xl bg-white transition-all shadow-sm ${
                        isFocused ? "ring-2 ring-black shadow-md" : "hover:shadow-md"
                      }`}
                    >
                      {/* Card Header: Title & Risk Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                              clause.riskLevel === "HIGH"
                                ? "bg-rose-100 text-rose-700"
                                : clause.riskLevel === "MEDIUM"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            C{clause.clauseNumber}
                          </span>
                          <h3 className="text-base font-bold text-neutral-950 font-serif">
                            {language === "bn" ? clause.titleBn : clause.titleEn}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              clause.riskLevel === "HIGH"
                                ? "bg-rose-100 text-rose-800"
                                : clause.riskLevel === "MEDIUM"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {clause.riskLevel === "HIGH"
                              ? language === "bn"
                                ? "উচ্চ ঝুঁকি"
                                : "High Risk"
                              : clause.riskLevel === "MEDIUM"
                              ? language === "bn"
                                ? "মাঝারি ঝুঁকি"
                                : "Medium Risk"
                              : language === "bn"
                              ? "আইনসম্মত"
                              : "Compliant"}
                          </span>

                          <button
                            onClick={() => handleOpenInCopilot(clause)}
                            className="px-2.5 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Discuss this specific clause in Legal Copilot"
                          >
                            <Bot className="w-3.5 h-3.5 text-black" />
                            <span>{language === "bn" ? "কোপাইলট সমাধান" : "Copilot Audit"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Statutory Reference Tag (if present) */}
                      {clause.statuteCitationEn && (
                        <div className="mt-3.5 flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-neutral-500" />
                            {language === "bn" ? "সংশ্লিষ্ট সরকারি আইন:" : "Statutory Violation:"}
                          </span>
                          <span className="text-xs font-bold text-neutral-900 bg-neutral-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                            {language === "bn" ? clause.statuteCitationBn : clause.statuteCitationEn}
                            {statProvision && (
                              <a
                                href={statProvision.bdlawsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-500 hover:text-black ml-1"
                                title="View on official bdlaws website"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Issue Summary & Detailed Legal Analysis */}
                      <div className="mt-3 space-y-2 text-xs text-neutral-700 leading-relaxed font-sans">
                        <div className="p-3.5 rounded-2xl bg-neutral-50 border-l-2 border-neutral-300">
                          <span className="font-bold text-neutral-900 block mb-0.5">
                            {language === "bn" ? "আইনি ঝুঁকির সারসংক্ষেপ:" : "Statutory Finding:"}
                          </span>
                          <p>{language === "bn" ? clause.detailedAnalysisBn : clause.detailedAnalysisEn}</p>
                        </div>
                      </div>

                      {/* Obligations Summary */}
                      {clause.keyObligationsEn && clause.keyObligationsEn.length > 0 && (
                        <div className="mt-3 pt-2">
                          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                            {language === "bn" ? "প্রয়োজনীয় অবলিগেশন ও বাধ্যবাধকতা:" : "Mandatory Obligations:"}
                          </span>
                          <ul className="space-y-1 text-xs text-neutral-600">
                            {(language === "bn" ? clause.keyObligationsBn : clause.keyObligationsEn).map(
                              (item, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {/* REDLINE PROPOSAL (Side-by-side or safe rewrite block) */}
                      {(clause.redlineSuggestionEn || clause.redlineSuggestionBn) && (
                        <div className="mt-4 pt-3 border-t border-black/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              {language === "bn" ? "প্রস্তাবিত নিরাপদ ক্লজ (AI Redline):" : "Proposed Safe Redline:"}
                            </span>
                            <button
                              onClick={() => handleCopyRedline(clause)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              {copiedClauseId === clause.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-700" />
                                  <span>{language === "bn" ? "কপি হয়েছে!" : "Copied!"}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-emerald-700" />
                                  <span>{language === "bn" ? "রেডলাইন কপি" : "Copy Redline"}</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Proposed Clause Text Box */}
                          <div className="p-4 rounded-2xl bg-emerald-50/60 font-sans text-xs leading-relaxed text-emerald-950 border-l-2 border-emerald-400">
                            <p>
                              {language === "bn"
                                ? clause.redlineSuggestionBn || clause.redlineSuggestionEn
                                : clause.redlineSuggestionEn}
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* PII Redaction Settings & Audit Modal */}
      {showPiiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-neutral-950 font-serif">
                  {language === "bn" ? "সার্বভৌম PII মাস্কিং নিশ্চয়তা" : "Sovereign Client-Side PII Redaction"}
                </h3>
              </div>
              <button
                onClick={() => setShowPiiModal(false)}
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed font-sans">
              {language === "bn"
                ? "আমাদের জিরো-ট্রাস্ট আর্কিটেকচারে ক্লায়েন্টের কোনো গোপন নাম, ফোন নাম্বার বা ইমেইল ব্রাউজারের বাইরে পাঠানো হয় না। সকল সংবিধিবদ্ধ অডিট টোকেনাইজড এন্টিটিতে সম্পন্ন হয়।"
                : "Under our zero-trust data architecture, all party names, phone numbers, and emails are redacted inside your browser prior to statutory analysis. No raw PII ever touches server logs."}
            </p>

            {/* Redaction Statistics */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-neutral-50 text-center">
              <div>
                <span className="text-lg font-bold text-neutral-900 block font-serif">
                  {piiResult.stats.namesCount}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                  {language === "bn" ? "নাম/প্রতিষ্ঠান" : "Parties Redacted"}
                </span>
              </div>
              <div>
                <span className="text-lg font-bold text-neutral-900 block font-serif">
                  {piiResult.stats.phonesCount}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                  {language === "bn" ? "ফোন নাম্বার" : "Phones Masked"}
                </span>
              </div>
              <div>
                <span className="text-lg font-bold text-neutral-900 block font-serif">
                  {piiResult.stats.emailsCount}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                  {language === "bn" ? "ইমেইল অ্যাড্রেস" : "Emails Masked"}
                </span>
              </div>
            </div>

            {/* Live Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-100">
              <span className="text-xs font-semibold text-neutral-900">
                {language === "bn" ? "মাস্কিং সক্রিয় রাখুন:" : "Enforce Client-Side Redaction:"}
              </span>
              <button
                onClick={() => setPiiMasked(!piiMasked)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  piiMasked ? "bg-emerald-600 text-white" : "bg-neutral-300 text-neutral-700"
                }`}
              >
                {piiMasked ? "ACTIVE" : "DISABLED"}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPiiModal(false)}
                className="px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                {language === "bn" ? "ঠিক আছে" : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Custom Agreement Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-black" />
                <h3 className="text-base font-bold text-neutral-950 font-serif">
                  {language === "bn" ? "নতুন চুক্তিপত্র আপলোড" : "Upload Custom Contract"}
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div className="border-2 border-dashed border-neutral-200 rounded-3xl p-8 text-center space-y-3 hover:border-black transition-colors cursor-pointer bg-neutral-50/50">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-600">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-900">
                  {language === "bn"
                    ? "চুক্তির ফাইল এখানে ড্রপ করুন অথবা ব্রাউজ করুন"
                    : "Drag and drop your contract PDF, DOCX, or TXT file here"}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {language === "bn"
                    ? "সর্বোচ্চ ১৫ মেগাবাইট (লোকাল ব্রাউজারেই এনক্রিপ্ট হবে)"
                    : "Up to 15MB. Encrypted and processed client-side."}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold hover:bg-neutral-200 transition-colors"
              >
                {language === "bn" ? "বাতিল" : "Cancel"}
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  handleSelectContract("employment-agreement");
                }}
                className="px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                {language === "bn" ? "নমুনা চুক্তি দিয়ে পরীক্ষা করুন" : "Analyze Sample"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
