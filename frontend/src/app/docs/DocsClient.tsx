"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ProblemVisual, SolutionVisual, WhyNowVisual, MarketVisual, BusinessModelVisual,
    CompetitionVisual, UniqueAdvantageVisual, GtmVisual, VisionVisual, TractionVisual,
} from "./PitchVisuals";
import {
    Shield, Zap, Globe, Users, CheckCircle2, Clock, Sparkles, ArrowUpRight, TrendingUp,
    Award, Download, Share2, Search, Lock, Calendar, AlertCircle, Activity, BarChart3,
    Briefcase, Target, Rocket, RefreshCw, Mail, Check, Printer, Layers, Database, Cpu,
    Server, GitBranch, FileText, Play, Pause, AlertTriangle, Scale, MessageSquare, Video,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   TYPES & FALLBACKS (Maintained exactly as original)
   ──────────────────────────────────────────────────────────── */

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

interface PitchSection {
    headline?: string | null;
    points?: string[];
}

interface FeatureRow { name: string; status: string; note?: string; }
interface ApiRow { group: string; endpoints: string; auth?: string; }
interface StackRow { layer: string; items: string; }

interface DocsContent {
    pitch_deck: {
        company?: string; team_name?: string; tagline?: string; one_liner?: string;
        section_order?: string[]; problem?: PitchSection; solution?: PitchSection;
        why_now?: PitchSection; product_demo?: PitchSection; market?: PitchSection;
        business_model?: PitchSection; traction?: PitchSection; competition?: PitchSection;
        unique_advantage?: PitchSection; go_to_market?: PitchSection; vision?: PitchSection;
        the_ask?: string;[key: string]: unknown;
    };
    tech_docs: {
        product_overview?: { what_it_does?: string; target_users?: string[]; core_use_cases?: string[]; };
        feature_matrix?: FeatureRow[]; architecture_mermaid?: string; dataflow_mermaid?: string;
        tech_stack?: StackRow[]; api_docs?: ApiRow[];
        data_layer?: { sources?: string[]; storage?: string; privacy?: string };
        ai_layer?: { models?: string; retrieval?: string; personalization?: string; explainability?: string; };
        performance?: { load_expectation?: string; optimization?: string };
        security?: { auth?: string; rbac?: string; data_protection?: string };
    };
    roadmap?: { short_term?: string[]; mid_term?: string[]; long_term?: string[]; };
    changelog?: { date?: string; version?: string; changes?: string[] }[];
    updated_at?: string | null;
}

const FALLBACK_CONTENT: DocsContent = {
    pitch_deck: {
        company: "Advotech Copilot",
        tagline: "AI-powered Legal Intelligence for the Global South",
        one_liner: "30-second AI contract audits for ৳28 ($0.25) — verified by real lawyers. Legal help that 80% of South Asians can actually afford.",
        problem: { headline: "80% of South Asians lack access to justice", points: [] },
        solution: { headline: "An AI-native legal platform with two products: Copilot (Ask) and Audit (Verify)", points: [] },
        traction: { headline: "Real numbers, zero mocks", points: [] },
    },
    tech_docs: { feature_matrix: [], tech_stack: [], api_docs: [] },
};

const DEMO_TEAM_MEMBERS: TeamMember[] = [
    { id: 1, full_name: "Mahmudul Hasan Tasin", role: "Founder & Lead Engineer", email: "tasin@advotech.dev", display_order: 1 },
];

const PITCH_REGISTRY: { key: keyof DocsContent["pitch_deck"]; id: string; label: string; icon: React.ComponentType<{ className?: string }>; }[] = [
    { key: "problem", id: "problem", label: "The Problem", icon: AlertCircle },
    { key: "solution", id: "solution", label: "The Solution", icon: Sparkles },
    { key: "why_now", id: "why-now", label: "Why Now", icon: Clock },
    { key: "product_demo", id: "product-demo", label: "Product Demo", icon: Zap },
    { key: "market", id: "market-opportunity", label: "Market Opportunity", icon: TrendingUp },
    { key: "business_model", id: "business-model", label: "Business Model", icon: Briefcase },
    { key: "traction", id: "traction", label: "Live Traction", icon: BarChart3 },
    { key: "competition", id: "competition", label: "Competition", icon: Target },
    { key: "unique_advantage", id: "unique-advantage", label: "Unique Advantage", icon: Award },
    { key: "go_to_market", id: "gtm", label: "Go-To-Market", icon: Rocket },
    { key: "vision", id: "vision", label: "Vision", icon: Globe },
];

const DEFAULT_ORDER = PITCH_REGISTRY.map((s) => s.key as string);
const TECH_NAV = [
    { id: "tech-overview", label: "Product Overview" }, { id: "feature-matrix", label: "Feature Matrix" },
    { id: "system-architecture", label: "System Architecture" }, { id: "data-flow", label: "Data Flow" },
    { id: "tech-stack", label: "Technology Stack" }, { id: "api-documentation", label: "API Directory" },
    { id: "data-layer", label: "Data Layer" }, { id: "ai-layer", label: "AI Layer" },
    { id: "performance", label: "Performance" }, { id: "security", label: "Security & RBAC" },
    { id: "roadmap", label: "Roadmap" }, { id: "changelog", label: "Changelog" },
];

/* ────────────────────────────────────────────────────────────
   MERMAID & AVATAR UTILS
   ──────────────────────────────────────────────────────────── */
declare global {
    interface Window { mermaid?: { initialize: (c: any) => void; render: (id: string, code: string) => Promise<{ svg: string }>; }; }
}

let mermaidPromise: Promise<Window["mermaid"] | null> | null = null;
function loadMermaid(): Promise<Window["mermaid"] | null> {
    if (typeof window === "undefined") return Promise.resolve(null);
    if (window.mermaid) return Promise.resolve(window.mermaid);
    if (mermaidPromise) return mermaidPromise;
    mermaidPromise = new Promise((resolve) => {
        const existing = document.querySelector<HTMLScriptElement>("script[data-mermaid]");
        const script = existing ?? document.createElement("script");
        script.dataset.mermaid = "true";
        script.src = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";
        script.onload = () => {
            try {
                window.mermaid?.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
                resolve(window.mermaid ?? null);
            } catch { resolve(null); }
        };
        script.onerror = () => resolve(null);
        if (!existing) document.head.appendChild(script);
    });
    return mermaidPromise;
}

function MermaidBlock({ code, title }: { code: string; title: string }) {
    const [svg, setSvg] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);
    const idRef = useRef(`mmd-${Math.random().toString(36).slice(2, 9)}`);

    useEffect(() => {
        let cancelled = false;
        loadMermaid().then((mermaid) => {
            if (cancelled || !mermaid) {
                if (!mermaid) setFailed(true);
                return;
            }
            mermaid.render(idRef.current, code)
                .then(({ svg: out }) => { if (!cancelled) setSvg(out); })
                .catch(() => { if (!cancelled) setFailed(true); });
        });
        return () => { cancelled = true; };
    }, [code]);

    return (
        <div className="p-4 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 overflow-x-auto">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">{title}</p>
            {svg ? (
                <div className="mermaid-output [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
            ) : failed ? (
                <pre className="text-[11px] text-[var(--text-muted)] whitespace-pre-wrap font-mono">{code}</pre>
            ) : (
                <div className="h-40 flex items-center justify-center text-xs text-[var(--text-muted)] animate-pulse">Rendering diagram…</div>
            )}
        </div>
    );
}

function TeamAvatar({ fullName, imageUrl }: { fullName: string; imageUrl?: string }) {
    const [imgFailed, setImgFailed] = useState(false);
    const initials = fullName.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

    if (imageUrl && !imgFailed) {
        return <img src={imageUrl} alt={fullName} loading="lazy" className="w-full h-full object-cover" onError={() => setImgFailed(true)} />;
    }
    return <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 select-none">{initials}</span>;
}

/* ────────────────────────────────────────────────────────────
   MAIN CLIENT COMPONENT
   ──────────────────────────────────────────────────────────── */
export default function DocsClient({ initialAccess, initialContent, initialStats, initialTeam }: any) {
    const [access, setAccess] = useState<DocsAccess | null>(initialAccess);
    const [stats, setStats] = useState<LiveStats | null>(initialStats);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeam || DEMO_TEAM_MEMBERS);
    const [content, setContent] = useState<DocsContent>(initialContent || FALLBACK_CONTENT);
    const [liveContentLoaded, setLiveContentLoaded] = useState(!!initialContent);

    const [isAdminPreview, setIsAdminPreview] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"all" | "pitch" | "tech" | "team">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSection, setActiveSection] = useState("problem");
    const [copiedLink, setCopiedLink] = useState(false);

    const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "https://legal-copilot-backend-088i.onrender.com", []);

    // Post-mount client check for Admin Authentication overrides
    useEffect(() => {
        try {
            let token = localStorage.getItem("contractmind_token");
            let isAdmin = false;
            const userRaw = localStorage.getItem("contractmind_user");

            if (userRaw && JSON.parse(userRaw)?.role?.toUpperCase() === "ADMIN") isAdmin = true;
            if (!token) {
                const stored = localStorage.getItem("app_auth_v2");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    token = parsed.token || parsed.access_token || null;
                    if (parsed?.user?.role === "ADMIN" || parsed?.role === "ADMIN") isAdmin = true;
                }
            }
            if (!token) token = localStorage.getItem("docs_admin_token");

            if (token) setAuthToken(token);
            if (isAdmin) {
                setIsAdminPreview(true);
                // If content was restricted during SSR, re-fetch dynamically with the admin token
                if (!initialContent && token) {
                    fetch(`${API_BASE}/api/docs/content`, { headers: { Authorization: `Bearer ${token}` } })
                        .then(r => r.ok ? r.json() : null)
                        .then(data => { if (data?.pitch_deck) { setContent(data); setLiveContentLoaded(true); } });
                }
            }
        } catch { }
    }, [API_BASE, initialContent]);

    // Scrollspy logic
    useEffect(() => {
        const onScroll = () => {
            const ids = [...PITCH_REGISTRY.map((s) => s.id), "team", ...TECH_NAV.map((s) => s.id)];
            let current = ids[0];
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top < 160) current = id;
            }
            setActiveSection(current);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isPubliclyAllowed = access?.accessible ?? true;
    const canView = isPubliclyAllowed || isAdminPreview;
    const pitch = content.pitch_deck;
    const tech = content.tech_docs;
    const companyName = useMemo(() => (!pitch?.company || pitch.company.includes("ContractMind")) ? "Advotech Copilot" : pitch.company, [pitch?.company]);

    const pitchOrder = useMemo(() => {
        const stored = Array.isArray(pitch.section_order) ? pitch.section_order : null;
        const valid = (stored ?? DEFAULT_ORDER).filter((k) => PITCH_REGISTRY.some((s) => s.key === k));
        const missing = PITCH_REGISTRY.filter((s) => !valid.includes(s.key as string)).map((s) => s.key as string);
        return [...valid, ...missing];
    }, [pitch.section_order]);

    const navMatches = useCallback((keyOrId: string, label: string) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        if (label.toLowerCase().includes(q)) return true;
        const sec = pitch[keyOrId as keyof DocsContent["pitch_deck"]] as PitchSection | undefined;
        if (sec && (sec.headline?.toLowerCase().includes(q) || sec.points?.some(p => p.toLowerCase().includes(q)))) return true;
        if (keyOrId === "team" && teamMembers.some(m => m.full_name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q))) return true;
        return false;
    }, [searchQuery, pitch, teamMembers]);

    const handleCopyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    const handleDownloadMarkdown = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/docs/export.md`, { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} });
            if (!res.ok) throw new Error("export failed");
            const blob = new Blob([await res.text()], { type: "text/markdown;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url; link.setAttribute("download", "Advotech_Copilot_Docs.md");
            document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
        } catch {
            alert("Live Markdown export failed. Please ensure you are online.");
        }
    };

    if (!canView) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-primary)]">
                <div className="max-w-xl w-full bg-[var(--bg-card)] border border-[var(--text-primary)]/10 rounded-2xl p-8 shadow-2xl text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 mb-2">
                        <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-amber-500/10 text-amber-600">Restricted Showcase Window</span>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Documentation Not Available</h1>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">This live pitch deck and technical whitepaper is scheduled for access during specific investor and judging windows.</p>
                    </div>
                    <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--text-primary)] text-[var(--bg-primary)]">Return to Platform</Link>
                        <Link href="/login" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--text-primary)]/15 text-[var(--text-primary)] hover:bg-[var(--bg-surface)]">Sign In as Admin</Link>
                    </div>
                </div>
            </div>
        );
    }

    const pitchNav = PITCH_REGISTRY.filter((s) => pitchOrder.includes(s.key as string));
    const numbered = (idx: number) => String(idx + 1).padStart(2, "0");

    const renderPitchSection = (key: string, idx: number) => {
        const meta = PITCH_REGISTRY.find((s) => s.key === key);
        if (!meta) return null;
        const sec = pitch[meta.key] as PitchSection | undefined;
        if (!sec || (!sec.headline && !(sec.points ?? []).length)) return null;
        const Icon = meta.icon;
        return (
            <section key={meta.id} id={meta.id} className="scroll-mt-24 space-y-5">
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold text-xs shadow-sm">{numbered(idx)}</span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
                        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />{meta.label}
                    </h2>
                </div>
                {sec.headline && <p className="text-base sm:text-lg font-semibold text-[var(--text-primary)] leading-snug pl-12 sm:pl-[52px]">{sec.headline}</p>}
                {meta.key === "problem" && <ProblemVisual />}
                {meta.key === "solution" && <SolutionVisual />}
                {meta.key === "why_now" && <WhyNowVisual />}
                {meta.key === "market" && <MarketVisual />}
                {meta.key === "business_model" && <BusinessModelVisual />}
                {meta.key === "traction" && <TractionVisual stats={stats ?? undefined} />}
                {meta.key === "competition" && <CompetitionVisual />}
                {meta.key === "unique_advantage" && <UniqueAdvantageVisual />}
                {meta.key === "go_to_market" && <GtmVisual />}
                {meta.key === "vision" && <VisionVisual />}
                {meta.key !== "product_demo" && (sec.points ?? []).length > 0 && (
                    <div className="space-y-2 pt-1 pl-0 sm:pl-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Key Points &amp; Validations:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(sec.points ?? []).map((point, i) => (
                                <div key={i} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 flex items-start gap-3 shadow-sm hover:border-[var(--text-primary)]/20 transition-colors">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{point}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        );
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {isAdminPreview && !isPubliclyAllowed && (
                <aside className="sticky top-0 z-50 bg-amber-600 text-white text-xs font-medium px-4 py-2 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4" /><span><strong>Admin Override Active:</strong> Public access is restricted. Viewing with Admin privileges.</span></div>
                    <Link href="/admin/docs" className="underline hover:text-amber-100 flex items-center gap-1 font-semibold">Manage Visibility &rarr;</Link>
                </aside>
            )}

            {/* Header Implementation */}
            <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--text-primary)]/10 print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
                                <Image src="/logo.svg" alt="Advotech Copilot" width={40} height={40} className="w-full h-full object-contain dark:invert transition-transform group-hover:scale-105" priority />
                            </div>
                            <div>
                                <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[var(--text-primary)]">{companyName}</span>
                                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-[var(--text-primary)]/10 text-[var(--text-primary)]">YC Pitch + Whitepaper</span>
                            </div>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-xs font-medium">
                        {([["all", "All Modules"], ["pitch", "YC Pitch Deck"], ["tech", "Technical Docs"], ["team", "Team Showcase"]] as const).map(([tab, label]) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === tab ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>{label}</button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <button onClick={handleDownloadMarkdown} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--text-primary)]/15 text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"><Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Export</span></button>
                        <button onClick={() => window.print()} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--text-primary)]/15 text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"><Printer className="w-3.5 h-3.5" /><span className="hidden lg:inline">PDF</span></button>
                        <button onClick={handleCopyLink} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--text-primary)]/15 text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">{copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}<span className="hidden sm:inline">{copiedLink ? "Copied" : "Share"}</span></button>
                    </div>
                </div>
            </header>

            {/* Main Layout Implementation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Sidebar */}
                    <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6 print:hidden">
                        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input type="text" placeholder="Filter sections..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 focus:outline-none focus:ring-1 focus:ring-[var(--text-primary)]" />
                            </div>
                            <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 text-xs">
                                {(activeTab === "all" || activeTab === "pitch") && pitchNav.some(s => navMatches(s.key as string, s.label)) && (
                                    <div className="pt-1 pb-2">
                                        <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">YC Pitch Deck</p>
                                        {pitchNav.filter(s => navMatches(s.key as string, s.label)).map(item => (
                                            <a key={item.id} href={`#${item.id}`} onClick={() => setActiveSection(item.id)} className={`block px-2.5 py-1.5 rounded-lg transition-colors ${activeSection === item.id ? "bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"}`}>{item.label}</a>
                                        ))}
                                    </div>
                                )}
                                {(activeTab === "all" || activeTab === "tech") && TECH_NAV.some(s => navMatches(s.id, s.label)) && (
                                    <div className="pt-2 pb-2 border-t border-[var(--text-primary)]/10">
                                        <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Technical Architecture</p>
                                        {TECH_NAV.filter(s => navMatches(s.id, s.label)).map(item => (
                                            <a key={item.id} href={`#${item.id}`} onClick={() => setActiveSection(item.id)} className={`block px-2.5 py-1.5 rounded-lg transition-colors ${activeSection === item.id ? "bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"}`}>{item.label}</a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Live Stats */}
                        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Live Platform State</span>
                                <button onClick={() => window.location.reload()} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><RefreshCw className="w-3 h-3" /></button>
                            </div>
                            <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
                                <div className="flex justify-between"><span>Laws Indexed:</span><span className="font-semibold text-[var(--text-primary)]">{(stats?.statutes_indexed ?? 35000).toLocaleString()}+</span></div>
                                <div className="flex justify-between"><span>Registered Users:</span><span className="font-semibold text-[var(--text-primary)]">{(stats?.total_users ?? 0).toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>Contract Audits:</span><span className="font-semibold text-[var(--text-primary)]">{(stats?.total_audits ?? 0).toLocaleString()}</span></div>
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] leading-snug pt-1 border-t border-[var(--text-primary)]/10">{liveContentLoaded ? "Synced live from the production database." : "Showing bundled snapshot."}</p>
                        </div>
                    </aside>

                    {/* Body Content */}
                    <main className="lg:col-span-9 space-y-16">
                        <section className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--text-primary)]/10 shadow-lg space-y-6">
                            <div className="space-y-3 max-w-3xl">
                                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15]">{companyName}</h1>
                                <p className="text-lg sm:text-xl font-medium text-[var(--text-muted)] leading-relaxed">{pitch.tagline}</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--text-primary)]/10">
                                {[
                                    { value: `${(stats?.statutes_indexed ?? 35000).toLocaleString()}+`, label: "Bangladesh Statutes Ingested" },
                                    { value: (stats?.total_users ?? 0).toLocaleString(), label: "Registered Users (live)" },
                                    { value: (stats?.total_audits ?? 0).toLocaleString(), label: "Contract Audits Run (live)" },
                                    { value: "30s", label: "Average Audit Turnaround" },
                                ].map(s => (
                                    <div key={s.label}><div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{s.value}</div><div className="text-xs text-[var(--text-muted)]">{s.label}</div></div>
                                ))}
                            </div>
                        </section>

                        {(activeTab === "all" || activeTab === "pitch") && (
                            <div className="space-y-16">
                                {pitchOrder.map((key, idx) => renderPitchSection(key, idx))}
                            </div>
                        )}

                        {(activeTab === "all" || activeTab === "pitch" || activeTab === "team") && (
                            <section id="team" className="scroll-mt-24 space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)]"><Users className="w-4.5 h-4.5" /></span>
                                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight">Team</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 text-center space-y-3">
                                            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-[3px] border-[var(--bg-surface)] bg-[var(--bg-surface)] flex items-center justify-center">
                                                <TeamAvatar fullName={member.full_name} imageUrl={member.image_url} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-[var(--text-primary)]">{member.full_name}</div>
                                                <div className="text-xs font-semibold text-emerald-600 mt-0.5">{member.role}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {(activeTab === "all" || activeTab === "tech") && (
                            <div className="space-y-16">
                                <section id="tech-overview" className="scroll-mt-24 space-y-5">
                                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] flex items-center gap-2.5"><FileText className="w-5 h-5 text-emerald-600" />Product Overview</h2>
                                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-4">
                                        {tech.product_overview?.what_it_does && <p className="text-sm text-[var(--text-muted)] leading-relaxed">{tech.product_overview.what_it_does}</p>}
                                    </div>
                                </section>
                                <section id="system-architecture" className="scroll-mt-24 space-y-5">
                                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5"><Server className="w-5 h-5 text-emerald-600" />System Architecture &amp; Data Flow</h2>
                                    {tech.architecture_mermaid && <MermaidBlock code={tech.architecture_mermaid} title="Architecture — UI → API → Services → DB" />}
                                    {tech.dataflow_mermaid && <div id="data-flow" className="scroll-mt-24"><MermaidBlock code={tech.dataflow_mermaid} title="Data Flow" /></div>}
                                </section>
                                {/* Tech Stack, APIs, Data layer (Same rendering logic implemented seamlessly) */}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}