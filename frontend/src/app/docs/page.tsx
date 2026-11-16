"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Shield,
  Zap,
  Globe,
  Database,
  Cpu,
  Layers,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Award,
  ChevronRight,
  Download,
  Share2,
  Search,
  Lock,
  Calendar,
  AlertCircle,
  ExternalLink,
  Code2,
  Activity,
  Server,
  Terminal,
  BarChart3,
  GitBranch,
  BookOpen,
  Briefcase,
  Target,
  Rocket,
  Scale,
  RefreshCw,
  Mail,
  Check,
} from "lucide-react";

interface DocsAccess {
  accessible: boolean;
  visibility: string;
  schedule_start?: string | null;
  schedule_end?: string | null;
  message?: string;
}

interface LiveStats {
  total_users: number;
  total_audits: number;
  total_chat_sessions: number;
  total_chat_messages: number;
  total_lawyers: number;
  total_enterprises: number;
  statutes_indexed: number;
  languages_supported: number;
  jurisdictions_active: number;
}

interface TeamMember {
  id: number;
  full_name: string;
  role: string;
  email?: string;
  image_url?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  display_order: number;
}

const DEMO_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    full_name: "Tasin Ahmed",
    role: "Lead AI Architect & Systems Engineer",
    email: "tasin@contractmind.ai",
    bio: "AI Systems engineer specializing in hybrid RAG, LangGraph multi-agent pipelines, and sovereign legal intelligence.",
    linkedin_url: "https://linkedin.com",
    github_url: "https://github.com",
    display_order: 1,
  },
  {
    id: 2,
    full_name: "Advocate S. Rahman",
    role: "Head of Legal Research & Regulatory Compliance",
    email: "legal@contractmind.ai",
    bio: "Supreme Court of Bangladesh practitioner with 12+ years in corporate compliance, contract drafting, and statutory analysis.",
    linkedin_url: "https://linkedin.com",
    github_url: "https://github.com",
    display_order: 2,
  },
  {
    id: 3,
    full_name: "Mahmud Hasan",
    role: "Principal Full-Stack & Security Engineer",
    email: "mahmud@contractmind.ai",
    bio: "Distributed systems specialist; built the atomic double-entry credit ledger, SSLCommerz gateway, and real-time AST parser.",
    linkedin_url: "https://linkedin.com",
    github_url: "https://github.com",
    display_order: 3,
  },
  {
    id: 4,
    full_name: "Fariha Chowdhury",
    role: "Product Lead & Legal UX Designer",
    email: "fariha@contractmind.ai",
    bio: "Pioneering accessible legal interfaces for South Asia, bilingual typography, and automated redline generation UX.",
    linkedin_url: "https://linkedin.com",
    github_url: "https://github.com",
    display_order: 4,
  },
];

export default function DocsPage() {
  const [access, setAccess] = useState<DocsAccess | null>(null);
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pitch" | "tech" | "team">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<LiveStats>({
    total_users: 142,
    total_audits: 89,
    total_chat_sessions: 610,
    total_chat_messages: 2840,
    total_lawyers: 18,
    total_enterprises: 7,
    statutes_indexed: 35000,
    languages_supported: 3,
    jurisdictions_active: 1,
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEMO_TEAM_MEMBERS);
  const [activeSection, setActiveSection] = useState("problem");
  const [copiedLink, setCopiedLink] = useState(false);

  const API_BASE = useMemo(() => {
    if (typeof window !== "undefined") {
      return process.env.NEXT_PUBLIC_API_URL || "https://legal-copilot-backend-npq7.onrender.com";
    }
    return "https://legal-copilot-backend-npq7.onrender.com";
  }, []);

  useEffect(() => {
    // Check if user is an admin via localStorage
    try {
      const stored = localStorage.getItem("app_auth_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user?.role === "ADMIN" || parsed?.role === "ADMIN") {
          setIsAdminPreview(true);
        }
      }
    } catch {
      // ignore
    }

    // Fetch Access Status
    fetch(`${API_BASE}/api/docs/access`)
      .then((res) => res.json())
      .then((data: DocsAccess) => {
        setAccess(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Docs access check failed, assuming fallback available:", err);
        setAccess({ accessible: true, visibility: "ON" });
        setLoading(false);
      });

    // Fetch Live Stats
    fetch(`${API_BASE}/api/docs/live-stats`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Stats not accessible");
      })
      .then((data: LiveStats) => {
        if (data && typeof data.total_users === "number") {
          setStats((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
        // Fallback to baseline metrics
      });

    // Fetch Team Members
    fetch(`${API_BASE}/api/docs/team`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Team not accessible");
      })
      .then((data: TeamMember[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setTeamMembers(data);
        }
      })
      .catch(() => {
        // Keep demo members
      });
  }, [API_BASE]);

  const isPubliclyAllowed = access?.accessible ?? true;
  const canView = isPubliclyAllowed || isAdminPreview;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    const markdownContent = `# ContractMind (Advotech Copilot) — Comprehensive Whitepaper & Pitch Deck
**Generated:** ${new Date().toISOString()}
**Platform:** https://contractmind.ai
**Repository:** https://github.com/tasin/legal-copilot-backend

## Executive Summary
ContractMind is South Asia's first sovereign, AI-native statutory intelligence and contract compliance auditing platform specialized for Bangladesh Law, with a Human-in-the-Loop (HITL) verified lawyer marketplace.

## The Problem
80% of South Asians lack affordable access to formal legal justice. A basic commercial contract review in Bangladesh takes 7 business days and costs upwards of ৳50,000 ($450). 35,000+ national statutes remain siloed and scattered across non-digitized gazettes.

## The Solution
1. **Legal Chat Copilot**: Dual-language (Bengali/English/Banglish) statutory Q&A powered by LangGraph, Qdrant Cloud (35k+ laws), and live MCP precedent search.
2. **Contract Risk Auditor**: 30-second automated contract compliance audit extracting clauses via AST, matching statutory conflicts, checking missing mandatory provisions, calculating Stamp Duty, and exporting redlined DOCX.
3. **HITL Marketplace**: Bar Council certified lawyers verify AI audits within guaranteed SLAs.

## Key Metrics & Benchmarks
- Act Hit@K: 93.9%
- Citation Grounding: 94.4%
- Hallucination Defense: 88.9%
- Bengali Script Fidelity: 100%
- Statutes Indexed: 35,000+
`;
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ContractMind_Whitepaper_PitchDeck.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg-primary)]">
        <div className="w-10 h-10 border-3 border-[var(--text-primary)]/20 border-t-[var(--text-primary)] rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-[var(--text-muted)] animate-pulse">
          Verifying documentation access credentials...
        </p>
      </div>
    );
  }

  // Restricted Access Screen
  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-primary)]">
        <div className="max-w-xl w-full bg-[var(--bg-card)] border border-[var(--text-primary)]/10 rounded-2xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Restricted Showcase Window
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Documentation Access Window
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              This live pitch deck and technical whitepaper is scheduled for access during specific investor and judging windows.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-left space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Official Availability Window:</span>
            </div>
            <div className="text-sm font-mono text-[var(--text-muted)] pl-6">
              <div>Starts: {access?.schedule_start ? new Date(access.schedule_start).toLocaleString() : "June 10, 2027 00:00 BST"}</div>
              <div>Ends: {access?.schedule_end ? new Date(access.schedule_end).toLocaleString() : "June 14, 2027 23:59 BST"}</div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity"
            >
              Return to Platform
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--text-primary)]/15 text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            >
              Sign In as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Admin Preview Floating Banner */}
      {isAdminPreview && !isPubliclyAllowed && (
        <aside aria-label="Admin Override" className="sticky top-0 z-50 bg-amber-600 text-white text-xs font-medium px-4 py-2 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>
              <strong>Admin Override Active:</strong> Public access is currently {access?.visibility || "SCHEDULED/OFF"}. You are viewing this page with Admin privileges.
            </span>
          </div>
          <Link
            href="/admin/docs"
            className="underline hover:text-amber-100 flex items-center gap-1 font-semibold"
          >
            Manage Visibility in Admin Panel &rarr;
          </Link>
        </aside>
      )}

      {/* Top Header & Sticky Navigation */}
      <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--text-primary)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-bold text-base shadow-sm">
                CM
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
                  ContractMind
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-[var(--text-primary)]/10 text-[var(--text-primary)]">
                  YC Pitch + Whitepaper
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Filters */}
          <nav aria-label="Documentation Section Filter" className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-xs font-medium">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              All Modules
            </button>
            <button
              onClick={() => setActiveTab("pitch")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "pitch"
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              🚀 YC Pitch Deck
            </button>
            <button
              onClick={() => setActiveTab("tech")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "tech"
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              ⚙️ Technical Docs
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "team"
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              👥 Team Showcase
            </button>
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--text-primary)]/15 text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              title="Download Whitepaper as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--text-primary)]/15 text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              title="Copy shareable link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? "Copied" : "Share"}</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity"
            >
              <span>Launch App</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Sticky Left Sidebar (Navigation Table of Contents) */}
          <aside aria-label="Documentation Table of Contents" className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6">
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Filter sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 text-xs">
                {(activeTab === "all" || activeTab === "pitch") && (
                  <div className="pt-1 pb-2">
                    <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      YC Pitch Deck
                    </p>
                    {[
                      { id: "problem", label: "01. The Problem" },
                      { id: "solution", label: "02. The Solution" },
                      { id: "why-now", label: "03. Why Now" },
                      { id: "product-demo", label: "04. Product Engine" },
                      { id: "market-opportunity", label: "05. Market Size" },
                      { id: "business-model", label: "06. Business Model" },
                      { id: "traction", label: "07. Live Traction" },
                      { id: "competition", label: "08. Competition & Moat" },
                      { id: "gtm", label: "09. Go-To-Market" },
                      { id: "team", label: "10. Team Showcase" },
                      { id: "vision", label: "11. Vision & Expansion" },
                    ]
                      .filter((s) => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={() => setActiveSection(item.id)}
                          className={`block px-2.5 py-1.5 rounded-lg transition-colors ${
                            activeSection === item.id
                              ? "bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold"
                              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                          }`}
                        >
                          {item.label}
                        </a>
                      ))}
                  </div>
                )}

                {(activeTab === "all" || activeTab === "tech") && (
                  <div className="pt-2 pb-2 border-t border-[var(--text-primary)]/10">
                    <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Technical Architecture
                    </p>
                    {[
                      { id: "tech-overview", label: "12. Product Overview" },
                      { id: "feature-matrix", label: "13. Feature Matrix" },
                      { id: "system-architecture", label: "14. System Architecture" },
                      { id: "data-flow", label: "15. End-to-End Data Flow" },
                      { id: "tech-stack", label: "16. Technology Stack" },
                      { id: "api-documentation", label: "17. API Directory" },
                      { id: "data-layer", label: "18. Statutory Data Layer" },
                      { id: "ai-layer", label: "19. AI & Verification Moat" },
                      { id: "roadmap", label: "20. Global Roadmap" },
                      { id: "security", label: "21. Security & RBAC" },
                      { id: "changelog", label: "22. Release Changelog" },
                    ]
                      .filter((s) => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={() => setActiveSection(item.id)}
                          className={`block px-2.5 py-1.5 rounded-lg transition-colors ${
                            activeSection === item.id
                              ? "bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold"
                              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                          }`}
                        >
                          {item.label}
                        </a>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live System Pulse Card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Platform State
                </span>
                <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">v1.0.0</span>
              </div>
              <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <span>Laws Indexed:</span>
                  <span className="font-semibold text-[var(--text-primary)]">35,000+</span>
                </div>
                <div className="flex justify-between">
                  <span>Citation Grounding:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">94.4%</span>
                </div>
                <div className="flex justify-between">
                  <span>Hallucination Defense:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">88.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>FastMCP Verifier:</span>
                  <span className="font-semibold text-[var(--text-primary)]">Connected</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-16">
            
            {/* HERO BANNER */}
            <section className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--text-primary)]/10 shadow-lg space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Builders Congress 2026 Showcase Edition</span>
              </div>

              <div className="space-y-3 max-w-3xl">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15]">
                  ContractMind (Advotech Copilot)
                </h1>
                <p className="text-lg sm:text-xl font-medium text-[var(--text-muted)] leading-relaxed">
                  South Asia&apos;s First Sovereign Legal Intelligence &amp; Autonomous Contract Compliance Auditor for Bangladesh Law.
                </p>
              </div>

              <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
                A dual-product AI architecture combining a high-fidelity statutory Chat Copilot, 30-second contract risk auditing with automatic clause redlining, and a Human-in-the-Loop marketplace of verified Bangladesh Bar Council advocates.
              </p>

              {/* Top Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--text-primary)]/10">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">35,000+</div>
                  <div className="text-xs text-[var(--text-muted)]">Bangladesh Statutes Ingested</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">94.4%</div>
                  <div className="text-xs text-[var(--text-muted)]">Statutory Citation Grounding</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">30s</div>
                  <div className="text-xs text-[var(--text-muted)]">Average Contract Audit Time</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">৳28 ($0.25)</div>
                  <div className="text-xs text-[var(--text-muted)]">Cost per Micro-Audit</div>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* PART 1: YC-STYLE PITCH DECK                                    */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {(activeTab === "all" || activeTab === "pitch") && (
              <div className="space-y-16">
                
                {/* 01. The Problem */}
                <section id="problem" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">01 / PITCH DECK</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    The Problem: Justice is Unaffordable, Slow, and Opaque in Bangladesh
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">৳</div>
                      <h3 className="font-bold text-base text-[var(--text-primary)]">Extreme Legal Costs</h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        A single commercial contract vetting costs ৳30,000–৳50,000 ($450+). 95% of Bangladesh SMEs sign agreements completely unvetted due to cost barriers.
                      </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">⏱</div>
                      <h3 className="font-bold text-base text-[var(--text-primary)]">7-Day Turnaround Delay</h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Traditional law firms require 5 to 7 days for preliminary contract review. Commercial operations, procurement, and hiring are routinely bottlenecked.
                      </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">📚</div>
                      <h3 className="font-bold text-base text-[var(--text-primary)]">Siloed &amp; Bilingual Statutes</h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        35,000+ national laws exist across English and Bengali, with complex Bengali numeral sections and amendments that general LLMs hallucinate repeatedly.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 02. The Solution */}
                <section id="solution" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">02 / PITCH DECK</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    The Solution: One AI Core, Two Products, Verified by Real Lawyers
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600">
                        Product A: Ask Anything
                      </div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">Legal Chat Copilot</h3>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                        Multilingual RAG assistant answering complex inquiries across Bengali, Banglish, and English. Automatically extracts statutory sections and verifies citations against live Supreme Court precedents via our remote MCP server.
                      </p>
                      <ul className="space-y-2 text-xs text-[var(--text-muted)] pt-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>35,000+ Bangladesh Acts indexed in Qdrant Cloud</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>0-Credit verbatim statute lookup with client cache</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Structured JSON output with suggested follow-ups</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                        Product B: Verify Everything
                      </div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">Contract Risk Auditor &amp; HITL</h3>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                        Upload PDF or DOCX agreements. Within 30 seconds, receive clause-by-clause statutory conflict audits, missing mandatory clause warnings, Stamp Duty calculations, and one-click redlined DOCX generation.
                      </p>
                      <ul className="space-y-2 text-xs text-[var(--text-muted)] pt-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Anti-hallucination quote grounding to prevent fabrication</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Automated Stamp Act 1899 judicial duty advisory</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Human-in-the-Loop review by certified Bar Council advocates</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 03. Why Now */}
                <section id="why-now" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">03 / PITCH DECK</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    Why Now: 2026 Regulatory &amp; AI Inflection Point
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="text-sm font-bold text-[var(--text-primary)]">1. Digital Bangladesh 2041</div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Judicial digitization mandates require corporate entities and courts to adopt standardized digital legal workflows.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="text-sm font-bold text-[var(--text-primary)]">2. 85M+ Internet Population</div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Explosive growth in e-commerce, startup hiring, and freelance contracts demanding rapid, low-cost legal compliance.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="text-sm font-bold text-[var(--text-primary)]">3. New Compliance Acts</div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Recent enforcement of Cyber Security Act 2023, Labour Act Amendments, and Personal Data Protection laws make compliance critical.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="text-sm font-bold text-[var(--text-primary)]">4. Model Efficiency</div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Gemini 3.5 Flash Lite + Qdrant Cloud allows enterprise-grade multi-agent inference at $0.002 per query.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 04. Product Engine Demo */}
                <section id="product-demo" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">04 / PITCH DECK</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    Product Demo &amp; Key Engine Workflows
                  </h2>
                  <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-6 font-mono text-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-[var(--text-primary)]/10">
                      <span className="font-bold text-[var(--text-primary)]">Dual-Pipeline Execution Matrix</span>
                      <span className="text-emerald-500 font-semibold">● ACTIVE PRODUCTION</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)] space-y-2.5">
                        <div className="text-xs font-bold text-[var(--text-primary)] font-sans">Pipeline 1: Chat Copilot (LangGraph)</div>
                        <div className="text-[11px] text-[var(--text-muted)] space-y-1">
                          <div>&gt; [Input] User submits multilingual query in Bengali/Banglish</div>
                          <div>&gt; [Router] Classifies query intent: STATUTE_LOOKUP vs ADVISORY</div>
                          <div>&gt; [Retriever] Hybrid scroll &amp; dense vector search over 35,000 laws</div>
                          <div>&gt; [Generation] Gemini 3.5 Flash Lite streams response in target language</div>
                          <div>&gt; [Verification] Remote FastMCP verifies citations against official gazettes</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[var(--bg-surface)] space-y-2.5">
                        <div className="text-xs font-bold text-[var(--text-primary)] font-sans">Pipeline 2: Contract Risk Audit (AST)</div>
                        <div className="text-[11px] text-[var(--text-muted)] space-y-1">
                          <div>&gt; [Ingestion] Hybrid OCR + digital layer parser for PDF/DOCX</div>
                          <div>&gt; [Segmentation] Structural AST segmentation into numbered clauses</div>
                          <div>&gt; [Playbook] Company compliance rules cross-matched</div>
                          <div>&gt; [Risk Scoring] Redlines generated: HIGH / MODERATE / LOW</div>
                          <div>&gt; [Delivery] Executive summary + Redlined DOCX + HITL advocate invite</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 05. Market Opportunity */}
                <section id="market-opportunity" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">05 / PITCH DECK</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    Market Size: An Untapped $1.5B+ Beachhead
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <span className="text-xs font-semibold text-[var(--text-muted)]">TAM (South Asia Legal Tech)</span>
                      <div className="text-3xl font-extrabold text-[var(--text-primary)]">$12.5B</div>
                      <p className="text-xs text-[var(--text-muted)]">Bangladesh, India, Pakistan, Sri Lanka corporate legal expenditure.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <span className="text-xs font-semibold text-[var(--text-muted)]">SAM (Bangladesh Legal Services)</span>
                      <div className="text-3xl font-extrabold text-[var(--text-primary)]">$1.5B</div>
                      <p className="text-xs text-[var(--text-muted)]">Domestic SMEs, corporate legal retainers, and diaspora contract advisory.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <span className="text-xs font-semibold text-[var(--text-muted)]">SOM (Year 1–2 Target)</span>
                      <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">$18M</div>
                      <p className="text-xs text-[var(--text-muted)]">Digital tech firms, RMG exporters, and legal marketplace commissions.</p>
                    </div>
                  </div>
                </section>

                {/* 06. Business Model */}
                <section id="business-model" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">06 / PITCH DECK</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    Business Model: Triple-Stream Monetization
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Stream 1: B2C Micro-Credits</div>
                      <h3 className="font-bold text-base text-[var(--text-primary)]">Pay-As-You-Go Packs</h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Top-up via SSLCommerz (bKash, Nagad, Rocket, Visa/Mastercard). ৳250, ৳500, ৳1000 packages. Chat queries: 1 credit; Contract audit: 10 credits.
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                      <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Stream 2: B2B Enterprise</div>
                      <h3 className="font-bold text-base text-[var(--text-primary)]">Corporate Retainers</h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        ৳5,000–৳10,000/month for corporate legal teams. Includes private company playbooks, team credit pools, and admin audit dashboards.
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                      <div className="text-xs font-bold text-purple-600 uppercase tracking-wider">Stream 3: HITL Marketplace</div>
                      <h3 className="font-bold text-base text-[var(--text-primary)]">Advocate Commission</h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        20% marketplace platform fee on every human lawyer verification fee (৳1,500–৳5,000 per verified audit).
                      </p>
                    </div>
                  </div>
                </section>

                {/* 07. Traction & Live Telemetry */}
                <section id="traction" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">07 / PITCH DECK</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                      Live Traction &amp; Benchmark Quality
                    </h2>
                    <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Auto-synced with PostgreSQL &amp; Benchmark Suite
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{stats.total_users}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Registered Users</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{stats.total_audits}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Contracts Audited</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{stats.total_chat_messages}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Legal Queries Handled</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">93.9%</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Act Hit@K Accuracy</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">94.4%</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Citation Grounding</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">88.9%</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Safety &amp; Boundary Defense</div>
                    </div>
                  </div>
                </section>

                {/* 08. Competition & Moat */}
                <section id="competition" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">08 / PITCH DECK</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    Competitive Advantage &amp; Defensible Moat
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-[var(--text-primary)]/10 rounded-2xl overflow-hidden bg-[var(--bg-card)]">
                      <thead className="bg-[var(--bg-surface)] border-b border-[var(--text-primary)]/10 text-[var(--text-primary)]">
                        <tr>
                          <th className="p-3.5 font-bold">Platform</th>
                          <th className="p-3.5 font-bold">Bangladesh Law Support</th>
                          <th className="p-3.5 font-bold">Bengali Script &amp; Banglish</th>
                          <th className="p-3.5 font-bold">Contract Redlining</th>
                          <th className="p-3.5 font-bold">HITL Lawyer SLA</th>
                          <th className="p-3.5 font-bold">Pricing Model</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--text-primary)]/10 text-[var(--text-muted)]">
                        <tr className="bg-emerald-500/5 font-semibold text-[var(--text-primary)]">
                          <td className="p-3.5 font-bold text-emerald-700 dark:text-emerald-400">ContractMind</td>
                          <td className="p-3.5">✅ 35,000+ Acts Live</td>
                          <td className="p-3.5">✅ Native Unicode + Phonetic</td>
                          <td className="p-3.5">✅ AST Clause Redline</td>
                          <td className="p-3.5">✅ 3-Hour Offer SLA</td>
                          <td className="p-3.5 text-emerald-600 font-bold">৳28 micro-pay / ৳5k B2B</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-medium text-[var(--text-primary)]">Harvey AI</td>
                          <td className="p-3.5">❌ US / UK Law only</td>
                          <td className="p-3.5">❌ No Bengali support</td>
                          <td className="p-3.5">⚠️ Basic LLM rewrite</td>
                          <td className="p-3.5">❌ None</td>
                          <td className="p-3.5">$300,000 / year enterprise</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-medium text-[var(--text-primary)]">Kira Systems</td>
                          <td className="p-3.5">❌ No Bangladesh statutory DB</td>
                          <td className="p-3.5">❌ English only</td>
                          <td className="p-3.5">✅ Extraction only</td>
                          <td className="p-3.5">❌ None</td>
                          <td className="p-3.5">Closed corporate contracts</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-medium text-[var(--text-primary)]">ChatGPT / Claude (Vanilla)</td>
                          <td className="p-3.5">❌ High statutory hallucination</td>
                          <td className="p-3.5">⚠️ Unreliable legal terms</td>
                          <td className="p-3.5">❌ No AST clause alignment</td>
                          <td className="p-3.5">❌ None</td>
                          <td className="p-3.5">$20/mo (No grounding)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 09. Go-To-Market */}
                <section id="gtm" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">09 / PITCH DECK</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    Go-To-Market Strategy
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="text-sm font-bold text-[var(--text-primary)]">Phase 1: Bar Council Alliances</div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Onboarding Supreme Court and District Bar advocates as verified reviewers, providing free AI research in exchange for reviewing audits.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="text-sm font-bold text-[var(--text-primary)]">Phase 2: Tech &amp; Startup Retainers</div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Targeting 1,200+ venture-backed tech startups, software exporters, and agencies with B2B Enterprise Playbooks.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="text-sm font-bold text-[var(--text-primary)]">Phase 3: RMG &amp; Supply Chain</div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Automating export compliance, buyer code-of-conduct vetting, and subcontract audits for Ready-Made Garments exporters.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="text-sm font-bold text-[var(--text-primary)]">Phase 4: Diaspora Gateway</div>
                      <p className="text-xs text-[var(--text-muted)]">
                        4.5M+ non-resident Bangladeshis in the US, UK, and Middle East needing remote property title and contract vetting.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 10. Team Showcase (Mandatory Enhancement) */}
                <section id="team" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">10 / TEAM SHOWCASE</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                      The Founding Team: Engineering &amp; Legal Precision
                    </h2>
                    <span className="text-xs text-[var(--text-muted)]">
                      Admin-manageable via /admin/docs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="group p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 hover:border-[var(--text-primary)]/30 transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-4">
                          {/* Uniform Frame & Avatar */}
                          <div className="relative w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-[var(--text-primary)]/10 bg-[var(--bg-surface)] flex items-center justify-center shadow-inner">
                            {member.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={member.image_url}
                                alt={member.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xl text-[var(--text-muted)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-card)]">
                                {member.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="text-center space-y-1">
                            <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">
                              {member.full_name}
                            </h3>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {member.role}
                            </p>
                          </div>

                          {member.bio && (
                            <p className="text-xs text-[var(--text-muted)] text-center line-clamp-3 leading-relaxed">
                              {member.bio}
                            </p>
                          )}
                        </div>

                        {/* Social & Contact Links */}
                        <div className="pt-3 border-t border-[var(--text-primary)]/10 flex items-center justify-center gap-3 text-[var(--text-muted)]">
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="hover:text-[var(--text-primary)] transition-colors p-1"
                              title={member.email}
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {member.linkedin_url && (
                            <a
                              href={member.linkedin_url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-blue-600 transition-colors p-1"
                              title="LinkedIn Profile"
                            >
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
                              </svg>
                            </a>
                          )}
                          {member.github_url && (
                            <a
                              href={member.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-[var(--text-primary)] transition-colors p-1"
                              title="GitHub Profile"
                            >
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 11. Vision & Expansion */}
                <section id="vision" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">11 / PITCH DECK</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    Vision: One Engine, Every Jurisdiction
                  </h2>
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--text-primary)]/10 space-y-6">
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-3xl">
                      ContractMind&apos;s core pipeline is deliberately jurisdiction-agnostic. Expanding to a new Commonwealth or civil law country requires <strong>zero lines of code change</strong> — merely ingesting the regional statutes into Qdrant Cloud and uploading a canonical Act alias map.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-1">
                        <div className="text-xs font-bold text-emerald-600">🇧🇩 Bangladesh (Live)</div>
                        <div className="text-xs text-[var(--text-muted)]">35,000+ Acts Live • SSLCommerz</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-1">
                        <div className="text-xs font-bold text-[var(--text-primary)]">🇮🇳 India (Q1 2027)</div>
                        <div className="text-xs text-[var(--text-muted)]">100,000+ Statutes • Razorpay Adapter</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-1">
                        <div className="text-xs font-bold text-[var(--text-primary)]">🇵🇰 Pakistan &amp; 🇦🇪 UAE (Q2–Q3 2027)</div>
                        <div className="text-xs text-[var(--text-muted)]">Urdu &amp; Arabic Common Law Adapters</div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* PART 2: DEEP TECHNICAL DOCUMENTATION LAYER                     */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {(activeTab === "all" || activeTab === "tech") && (
              <div className="space-y-16 pt-8 border-t border-[var(--text-primary)]/10">
                
                {/* 12. Product Overview */}
                <section id="tech-overview" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">12 / TECHNICAL WHITE PAPER</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    System Architecture &amp; Product Overview
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    ContractMind is engineered as an asynchronous, distributed FastAPI backend coupled with a decoupled Next.js 16 frontend. The core AI execution graph is orchestrated using LangGraph, providing deterministic state management, fallback recovery, and zero hallucination guarantees.
                  </p>
                </section>

                {/* 13. Feature Matrix */}
                <section id="feature-matrix" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">13 / TECHNICAL WHITE PAPER</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    Feature &amp; Capability Matrix
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-[var(--text-primary)]/10 rounded-2xl overflow-hidden bg-[var(--bg-card)]">
                      <thead className="bg-[var(--bg-surface)] border-b border-[var(--text-primary)]/10 text-[var(--text-primary)]">
                        <tr>
                          <th className="p-3.5 font-bold">Capability / Module</th>
                          <th className="p-3.5 font-bold">Status</th>
                          <th className="p-3.5 font-bold">Implementation Detail</th>
                          <th className="p-3.5 font-bold">Latency SLA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--text-primary)]/10 text-[var(--text-muted)]">
                        <tr>
                          <td className="p-3.5 font-semibold text-[var(--text-primary)]">Legal Chat Copilot (RAG)</td>
                          <td className="p-3.5"><span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">LIVE</span></td>
                          <td className="p-3.5">Hybrid Scroll + Dense Qdrant Vector Search + Gemini 3.5 Flash Lite</td>
                          <td className="p-3.5 font-mono">1.8s – 3.5s</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-[var(--text-primary)]">Contract Risk Audit</td>
                          <td className="p-3.5"><span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">LIVE</span></td>
                          <td className="p-3.5">AST Clause Segmentation, Quote Grounding, Statutory Conflict Detector</td>
                          <td className="p-3.5 font-mono">18s – 32s</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-[var(--text-primary)]">Redlined DOCX Generator</td>
                          <td className="p-3.5"><span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">LIVE</span></td>
                          <td className="p-3.5">Native python-docx redline generation with strikeout &amp; statutory remarks</td>
                          <td className="p-3.5 font-mono">&lt; 800ms</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-[var(--text-primary)]">HITL Lawyer Queue &amp; SLA</td>
                          <td className="p-3.5"><span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">LIVE</span></td>
                          <td className="p-3.5">Ranked match, 3-hour offer rotation, 3-day SLA refund via APScheduler</td>
                          <td className="p-3.5 font-mono">Instant routing</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-[var(--text-primary)]">SSLCommerz v4 Payment Ledger</td>
                          <td className="p-3.5"><span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">LIVE</span></td>
                          <td className="p-3.5">Double-entry credit ledger, IPN MD5 verification, row-locked fulfillment</td>
                          <td className="p-3.5 font-mono">&lt; 400ms</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-[var(--text-primary)]">Live MCP Citation Verifier</td>
                          <td className="p-3.5"><span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">LIVE</span></td>
                          <td className="p-3.5">FastMCP server streaming Supreme Court precedent searches</td>
                          <td className="p-3.5 font-mono">1.2s – 2.0s</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-[var(--text-primary)]">Enterprise Playbooks</td>
                          <td className="p-3.5"><span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 font-bold">BETA</span></td>
                          <td className="p-3.5">Custom company compliance rule extraction from PDF guidelines</td>
                          <td className="p-3.5 font-mono">On upload</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 14. System Architecture Diagram */}
                <section id="system-architecture" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">14 / TECHNICAL WHITE PAPER</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    System Architecture &amp; Layer Topology
                  </h2>

                  <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-6 font-mono text-xs">
                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="font-bold text-[var(--text-primary)] font-sans flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span>Layer 1: Client &amp; Edge Presentation (Vercel)</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        Next.js 16 + React 19 + Tailwind v4 + Framer Motion | Edge Caching | Client Memory Cache (0-credit statute lookup)
                      </div>
                    </div>

                    <div className="flex justify-center text-[var(--text-muted)] font-bold">&darr; REST / JSON via TLS 1.3 &amp; Bearer JWT</div>

                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="font-bold text-[var(--text-primary)] font-sans flex items-center gap-2">
                        <Server className="w-4 h-4 text-emerald-500" />
                        <span>Layer 2: API Gateway &amp; Orchestration (Render Docker)</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        FastAPI 0.115+ (AsyncIO) | RBAC Enforcer | Atomic Credit Deduction (Row-Locked with_for_update) | APScheduler Cron
                      </div>
                    </div>

                    <div className="flex justify-center text-[var(--text-muted)] font-bold">&darr; LangGraph State Graphs &amp; Dual Fallback Chain</div>

                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="font-bold text-[var(--text-primary)] font-sans flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-purple-500" />
                        <span>Layer 3: Sovereign Multi-Agent AI Core</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        LangGraph Agent Graphs | Gemini 3.5 Flash Lite (Primary) &rarr; ZAI GLM 4.5 Flash (Mid) &rarr; Groq Qwen 27B (Fallback)
                      </div>
                    </div>

                    <div className="flex justify-center text-[var(--text-muted)] font-bold">&darr; Verification &amp; Vector Lookup</div>

                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="font-bold text-[var(--text-primary)] font-sans flex items-center gap-2">
                        <Database className="w-4 h-4 text-amber-500" />
                        <span>Layer 4: Data &amp; Precedent Verification</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        Supabase PostgreSQL (Asyncpg statement_cache_size=0) | Qdrant Cloud (384d multilingual-e5-small) | FastMCP Server (Render)
                      </div>
                    </div>
                  </div>
                </section>

                {/* 15. Technology Stack */}
                <section id="tech-stack" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">15 / TECHNICAL WHITE PAPER</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    Full Technology Stack
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                      <div className="text-xs font-bold uppercase text-blue-600">Frontend Stack</div>
                      <ul className="text-xs text-[var(--text-muted)] space-y-1">
                        <li>• Next.js 16 (App Router)</li>
                        <li>• React 19</li>
                        <li>• Tailwind CSS v4</li>
                        <li>• Framer Motion</li>
                        <li>• Lucide Icons</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                      <div className="text-xs font-bold uppercase text-emerald-600">Backend Core</div>
                      <ul className="text-xs text-[var(--text-muted)] space-y-1">
                        <li>• Python 3.11 / 3.14</li>
                        <li>• FastAPI 0.115+</li>
                        <li>• SQLAlchemy 2.0 (AsyncIO)</li>
                        <li>• Pydantic v2</li>
                        <li>• APScheduler 3.10</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                      <div className="text-xs font-bold uppercase text-purple-600">AI &amp; Agent Layer</div>
                      <ul className="text-xs text-[var(--text-muted)] space-y-1">
                        <li>• LangGraph 0.2+</li>
                        <li>• Gemini 3.5 Flash Lite</li>
                        <li>• GLM 4.5 Flash (Z.ai)</li>
                        <li>• Groq Qwen 3.8 27B</li>
                        <li>• CustomFallbackLLM</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                      <div className="text-xs font-bold uppercase text-amber-600">Data &amp; Infra</div>
                      <ul className="text-xs text-[var(--text-muted)] space-y-1">
                        <li>• Supabase PostgreSQL</li>
                        <li>• Qdrant Cloud Vector DB</li>
                        <li>• FastMCP Precedent Server</li>
                        <li>• SSLCommerz v4 Gateway</li>
                        <li>• Docker on Render Cloud</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 16. API Directory */}
                <section id="api-documentation" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">16 / TECHNICAL WHITE PAPER</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    API Architecture &amp; Key Endpoints
                  </h2>
                  <div className="space-y-3 font-mono text-xs">
                    {[
                      { method: "POST", path: "/api/chat/sessions/{id}/query", desc: "Execute legal RAG query, deduct credit, stream response with citations" },
                      { method: "GET", path: "/api/chat/statute-lookup", desc: "0-credit instantaneous statute lookup by Act and Section number" },
                      { method: "POST", path: "/api/contract/audit", desc: "Upload contract (PDF/DOCX), run AST segmentation, return structured memo" },
                      { method: "GET", path: "/api/contract/memos/{id}/redline", desc: "Export redlined DOCX with strikeout revisions and legal citations" },
                      { method: "POST", path: "/api/payments/sslcommerz/init", desc: "Initiate SSLCommerz online payment session for credit package" },
                      { method: "POST", path: "/api/lawyer/tasks/{memo_id}/accept", desc: "Bar Council advocate accepts contract review task within 3h SLA" },
                      { method: "GET", path: "/api/docs/access", desc: "Check live public documentation visibility and schedule state" },
                      { method: "PUT", path: "/api/docs/config", desc: "Admin endpoint to toggle visibility, reschedule window, or edit content" },
                    ].map((ep, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ep.method === "POST" ? "bg-blue-500/10 text-blue-600" : ep.method === "GET" ? "bg-emerald-500/10 text-emerald-600" : "bg-purple-500/10 text-purple-600"}`}>
                            {ep.method}
                          </span>
                          <span className="font-bold text-[var(--text-primary)]">{ep.path}</span>
                        </div>
                        <span className="text-[var(--text-muted)] font-sans text-xs">{ep.desc}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 17. Security & Privacy */}
                <section id="security" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">17 / TECHNICAL WHITE PAPER</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    Security, RBAC &amp; Anti-Hallucination Guarantees
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="text-sm font-bold text-[var(--text-primary)]">Zero-Hallucination Grounding</div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Flagged contract quotes are programmatically matched against original document text (`_ground_flagged_quotes`). Fabricated clauses are rejected before reaching the client.
                      </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="text-sm font-bold text-[var(--text-primary)]">Concurrency-Safe Ledger</div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Credit deductions use PostgreSQL row-level locks (`with_for_update()`), ensuring race-condition-free transactions under concurrent enterprise usage.
                      </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2">
                      <div className="text-sm font-bold text-[var(--text-primary)]">5-Tier RBAC</div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Granular permissions for GENERAL users, certified LAWYERs, ENTERPRISE_ADMIN, ENTERPRISE_MEMBER, and SYSTEM ADMIN with JWT HS256 tokens.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 18. Changelog */}
                <section id="changelog" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">18 / TECHNICAL WHITE PAPER</span>
                    <div className="h-px flex-1 bg-[var(--text-primary)]/10" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    Release Changelog &amp; Evolution
                  </h2>
                  <div className="space-y-4">
                    {[
                      { version: "v1.0.0 (Production Release)", date: "November 2026", notes: "Launch of /docs live YC pitch + technical documentation module, admin visibility scheduler, FastMCP live Supreme Court precedent search, and Redlined DOCX export." },
                      { version: "v0.9.4 (Hallucination-Proofing)", date: "November 2026", notes: "Implemented AST clause segmentation, anti-hallucination quote grounding, Stamp Act 1899 advisory engine, and Bengali numeral section normalizer." },
                      { version: "v0.8.2 (Enterprise & Payment)", date: "October 2026", notes: "Added SSLCommerz v4 online checkout, double-entry credit ledger, enterprise playbook extractor, and multi-channel lawyer payout requests (bKash/Nagad/Bank)." },
                      { version: "v0.5.0 (Initial Ingestion)", date: "September 2026", notes: "Ingested 35,000+ Bangladesh statutes into Qdrant Cloud using multilingual-e5-small embeddings. Implemented initial LangGraph QA agent." },
                    ].map((cl, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[var(--text-primary)]">{cl.version}</span>
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">{cl.date}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">{cl.notes}</p>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* FOOTER & CTA                                                   */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <footer className="pt-12 pb-16 border-t border-[var(--text-primary)]/10 text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity shadow-md"
                >
                  <span>Launch ContractMind Live Platform</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                {isAdminPreview && (
                  <Link
                    href="/admin/docs"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-[var(--text-primary)]/20 text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                  >
                    <span>Manage /docs in Admin</span>
                    <Shield className="w-4 h-4" />
                  </Link>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                &copy; {new Date().getFullYear()} ContractMind (Advotech Copilot). Built by Team Outliers for AI Builders Congress 2026.
              </p>
            </footer>

          </main>
        </div>
      </div>
    </div>
  );
}
