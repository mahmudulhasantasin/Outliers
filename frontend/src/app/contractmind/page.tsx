/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  uploadContract,
  getContractHistory,
  requestLawyerVerification,
  createChatSession,
  sendChatQuery,
  ContractAuditResult,
  ContractHistoryItem,
} from "@/lib/apiServices";
import {
  UploadCloud, FileText, AlertTriangle, ShieldCheck,
  MessageSquare, Send, Loader2, Scale, Check, X, Bot, User
} from "lucide-react";

export default function ContractMindPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";

  // Auth Guard
  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  // ──────────────────────────────────────────────────────────
  // STATES
  // ──────────────────────────────────────────────────────────
  const [history, setHistory] = useState<ContractHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Upload / Audit states
  const [file, setFile] = useState<File | null>(null);
  const [contractTitle, setContractTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [auditResult, setAuditResult] = useState<ContractAuditResult | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | number | null>(null);

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);

  // Chat states
  const [chatSessionId, setChatSessionId] = useState<string | number | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const borderClass = "border-[var(--text-primary)]/10";

  // ──────────────────────────────────────────────────────────
  // FETCH DATA
  // ──────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const data = await getContractHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  // ──────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!contractTitle) setContractTitle(selected.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setAuditResult(null);
    try {
      const result = await uploadContract(file, contractTitle);
      setAuditResult(result);
      setActiveHistoryId(result.contract_id);
      setFile(null);
      setContractTitle("");
      fetchHistory();
    } catch (err: any) {
      alert(err?.message || "Failed to upload and analyze contract.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadHistory = (item: ContractHistoryItem) => {
    setActiveHistoryId(item.contract_id);
    setAuditResult({
      contract_id: item.contract_id,
      memo_id: item.memo_id,
      risk_score: item.risk_score || 0,
      overall_risk: (item.overall_risk as any) || "MODERATE",
      executive_summary: "Loaded from history. Full details available via export.",
      clauses: [],
      hitl_status: item.hitl_status,
    } as any);
  };

  const handleRequestVerification = async () => {
    if (!auditResult?.contract_id) return;
    if (!confirm(isBn ? "আইনজীবীর নিকট ভেরিফিকেশনের জন্য পাঠাতে চান? ১৫০০ ক্রেডিট কাটা হবে।" : "Request lawyer verification? 1500 credits will be deducted.")) return;
    
    setIsVerifying(true);
    try {
      // ✅ FIX: removed unused 'res' variable
      await requestLawyerVerification(auditResult.contract_id);
      alert(isBn ? "সফলভাবে অনুরোধ পাঠানো হয়েছে!" : "Verification requested successfully!");
      setAuditResult(prev => prev ? { ...prev, hitl_status: "QUEUED_FOR_LAWYER" } : null);
      fetchHistory();
    } catch (err: any) {
      alert(err?.message || "Failed to request verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  // ── CHAT HANDLERS ──
  const handleOpenChat = async () => {
    if (!auditResult?.contract_id) return;
    setIsChatOpen(true);
    
    if (!chatSessionId) {
      setIsChatting(true);
      try {
        const session = await createChatSession("Contract Audit Chat", "USER_CONTRACT", auditResult.contract_id);
        setChatSessionId(session.session_id);
        setChatMessages([{
          role: "assistant",
          content: isBn ? "আমি এই চুক্তিপত্রটি বিশ্লেষণ করেছি। এই চুক্তি সম্পর্কে আপনার কোনো নির্দিষ্ট আইনি প্রশ্ন থাকলে জিজ্ঞাসা করুন।" : "I've analyzed this contract. Feel free to ask any specific legal questions regarding this document."
        }]);
      } catch (err: any) {
        alert(err?.message || "Failed to start chat session.");
        setIsChatOpen(false);
      } finally {
        setIsChatting(false);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatSessionId) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsChatting(true);

    try {
      const res = await sendChatQuery({
        session_id: chatSessionId,
        query: userMsg,
        contract_id: auditResult?.contract_id
      });
      
      let botMsg = "";
      if (typeof res.response === "string") {
        botMsg = res.response;
      } else if (res.response && res.response.detailed_answer) {
        botMsg = res.response.detailed_answer;
      }

      setChatMessages((prev) => [...prev, { role: "assistant", content: botMsg }]);
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setIsChatting(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ──────────────────────────────────────────────────────────
  const getRiskColor = (risk: string) => {
    const r = (risk || "").toUpperCase();
    if (r === "HIGH" || r === "CRITICAL") return "text-rose-600 bg-rose-500/10 border-rose-500/20";
    if (r === "MODERATE" || r === "MEDIUM") return "text-amber-600 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
  };

  if (!user) return null;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto py-8 px-4 h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6">
        
        {/* ── LEFT SIDEBAR: HISTORY ── */}
        <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
          <div className={`p-4 rounded-3xl border ${borderClass} bg-[var(--bg-card)]`}>
            <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-indigo-500" />
              {isBn ? "অডিট ইতিহাস" : "Audit History"}
            </h2>
            
            <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-2">
              {isLoadingHistory ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" /></div>
              ) : history.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-4">{isBn ? "কোনো ইতিহাস নেই" : "No history yet"}</p>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleLoadHistory(item)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      activeHistoryId === item.contract_id
                        ? "border-[var(--accent-solid)] bg-[var(--accent-solid)]/5"
                        : "border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5"
                    }`}
                  >
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{item.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getRiskColor(item.overall_risk || "")}`}>
                        {item.overall_risk || "UNKNOWN"}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Upload Button Area */}
          <button
            onClick={() => { setAuditResult(null); setActiveHistoryId(null); }}
            className="w-full py-3 rounded-2xl font-bold text-xs bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            {isBn ? "নতুন চুক্তি আপলোড করুন" : "Upload New Contract"}
          </button>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {!auditResult ? (
            /* UPLOAD VIEW */
            <div className={`flex-1 rounded-3xl border-2 border-dashed ${borderClass} bg-[var(--bg-card)] flex flex-col items-center justify-center p-8 text-center space-y-4`}>
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <UploadCloud className="w-10 h-10 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
                  {isBn ? "চুক্তিপত্র আপলোড করুন" : "Upload Contract for AI Audit"}
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">
                  {isBn ? "PDF, DOCX ফাইল আপলোড করুন। এআই বাংলাদেশের আইন অনুযায়ী বিশ্লেষণ করবে।" : "Upload a PDF or DOCX file. AI will analyze it against Bangladesh law."}
                </p>
              </div>

              <div className="w-full max-w-sm space-y-3 mt-4">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-[var(--text-muted)] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-500/10 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-500/20 cursor-pointer"
                />
                {file && (
                  <input
                    type="text"
                    placeholder="Contract Title"
                    value={contractTitle}
                    onChange={(e) => setContractTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-xs"
                  />
                )}
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {isUploading ? (isBn ? "বিশ্লেষণ করা হচ্ছে..." : "Analyzing...") : (isBn ? "অডিট শুরু করুন" : "Start Audit")}
                </button>
              </div>
            </div>
          ) : (
            /* AUDIT RESULT VIEW */
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-10">
              {/* Header */}
              <div className={`p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                <div>
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">{contractTitle || "Contract Audit"}</h1>
                  <p className="text-xs text-[var(--text-muted)] mt-1">ID: {auditResult.contract_id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleOpenChat} className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    {isBn ? "এআই এর সাথে কথা বলুন" : "Chat with AI"}
                  </button>
                  <div className={`px-4 py-2 rounded-xl border font-bold text-sm flex items-center gap-2 ${getRiskColor(auditResult.overall_risk || "")}`}>
                    <AlertTriangle className="w-4 h-4" />
                    Risk: {auditResult.overall_risk || "N/A"}
                  </div>
                </div>
              </div>

              {/* Summary & Verification */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`md:col-span-2 p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)]`}>
                  <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
                    <Scale className="w-4 h-4 text-amber-500" />
                    Executive Summary
                  </h2>
                  <p className="text-sm text-[var(--text-primary)]/80 leading-relaxed">
                    {auditResult.executive_summary || "No summary available."}
                  </p>
                </div>
                
                <div className={`p-6 rounded-3xl border ${borderClass} bg-[var(--bg-card)] space-y-4`}>
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Lawyer Verification
                  </h2>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Status</span>
                    <span className="text-xs font-bold">{auditResult.hitl_status || "NOT_REQUESTED"}</span>
                  </div>
                  {auditResult.hitl_status === "NOT_REQUESTED" && (
                    <button
                      onClick={handleRequestVerification}
                      disabled={isVerifying}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Request Human Review
                    </button>
                  )}
                </div>
              </div>

              {/* Clauses List */}
              <div className="space-y-4">
                <h2 className="text-lg font-serif font-bold text-[var(--text-primary)]">Clause Analysis</h2>
                {auditResult.clauses?.length === 0 && (
                  <p className="text-sm text-[var(--text-muted)]">No detailed clauses returned.</p>
                )}
                {auditResult.clauses?.map((clause, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border ${borderClass} bg-[var(--bg-card)] space-y-3`}>
                    <div className="flex items-center justify-between border-b border-[var(--text-primary)]/10 pb-2">
                      <h3 className="font-bold text-sm text-[var(--text-primary)]">
                        {clause.clause_title || `Clause ${clause.clause_number}`}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getRiskColor(clause.risk_level)}`}>
                        {clause.risk_level}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/5">
                      <p className="text-xs italic text-[var(--text-muted)]">"{clause.original_text}"</p>
                    </div>
                    <div className="text-xs space-y-2">
                      <p><strong className="text-[var(--text-primary)]">Issue:</strong> <span className="text-[var(--text-muted)]">{clause.legal_explanation || clause.issue_summary}</span></p>
                      {clause.proposed_safe_redline && (
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">Suggested Redline:</p>
                          <p className="text-emerald-800 dark:text-emerald-300">{clause.proposed_safe_redline}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CHAT DRAWER ── */}
          {isChatOpen && (
            <div className="absolute inset-y-0 right-0 w-full sm:w-96 bg-[var(--bg-card)] border-l border-[var(--text-primary)]/10 shadow-2xl flex flex-col z-40 animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-[var(--text-primary)]/10 flex items-center justify-between bg-[var(--bg-surface)]">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-sm">Contract AI Chat</h3>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-1 rounded-lg hover:bg-[var(--text-primary)]/10">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-primary)]/50">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-[var(--accent-solid)] text-white" : "bg-indigo-500/20 text-indigo-500"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs max-w-[80%] ${msg.role === "user" ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)] rounded-tr-sm" : "bg-[var(--bg-card)] border border-[var(--text-primary)]/10 rounded-tl-sm shadow-sm"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0"><Bot className="w-4 h-4" /></div>
                    <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 rounded-tl-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <div className="p-4 border-t border-[var(--text-primary)]/10 bg-[var(--bg-card)]">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about this contract..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--text-primary)]/15 bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-indigo-500"
                    disabled={isChatting}
                  />
                  <button type="submit" disabled={!chatInput.trim() || isChatting} className="p-2.5 rounded-xl bg-[var(--accent-solid)] text-white disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}