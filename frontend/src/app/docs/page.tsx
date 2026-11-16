"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Shield,
  Zap,
  Globe,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Award,
  Download,
  Share2,
  Search,
  Lock,
  Calendar,
  AlertCircle,
  Activity,
  BarChart3,
  Briefcase,
  Target,
  Rocket,
  RefreshCw,
  Mail,
  Check,
  Printer,
  Layers,
  Database,
  Cpu,
  Server,
  GitBranch,
  FileText,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   TYPES — mirror the backend /api/docs/content payload
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

interface FeatureRow {
  name: string;
  status: string;
  note?: string;
}

interface ApiRow {
  group: string;
  endpoints: string;
  auth?: string;
}

interface StackRow {
  layer: string;
  items: string;
}

interface DocsContent {
  pitch_deck: {
    company?: string;
    team_name?: string;
    tagline?: string;
    one_liner?: string;
    section_order?: string[];
    problem?: PitchSection;
    solution?: PitchSection;
    why_now?: PitchSection;
    product_demo?: PitchSection;
    market?: PitchSection;
    business_model?: PitchSection;
    traction?: PitchSection;
    competition?: PitchSection;
    unique_advantage?: PitchSection;
    go_to_market?: PitchSection;
    vision?: PitchSection;
    the_ask?: string;
    [key: string]: unknown;
  };
  tech_docs: {
    product_overview?: {
      what_it_does?: string;
      target_users?: string[];
      core_use_cases?: string[];
    };
    feature_matrix?: FeatureRow[];
    architecture_mermaid?: string;
    dataflow_mermaid?: string;
    tech_stack?: StackRow[];
    api_docs?: ApiRow[];
    data_layer?: { sources?: string[]; storage?: string; privacy?: string };
    ai_layer?: {
      models?: string;
      retrieval?: string;
      personalization?: string;
      explainability?: string;
    };
    performance?: { load_expectation?: string; optimization?: string };
    security?: { auth?: string; rbac?: string; data_protection?: string };
  };
  roadmap?: {
    short_term?: string[];
    mid_term?: string[];
    long_term?: string[];
  };
  changelog?: { date?: string; version?: string; changes?: string[] }[];
  updated_at?: string | null;
}

/* ────────────────────────────────────────────────────────────
   FALLBACKS — used only if the live content API is unreachable
   ──────────────────────────────────────────────────────────── */

const FALLBACK_CONTENT: DocsContent = {
  pitch_deck: {
    company: "ContractMind (Advotech)",
    team_name: "Team Advotech",
    tagline: "AI-powered Legal Intelligence for the Global South",
    one_liner:
      "30-second AI contract audits for ৳28 ($0.25) — verified by real lawyers. Legal help that 80% of South Asians can actually afford.",
    problem: {
      headline: "80% of South Asians lack access to justice",
      points: [
        "A single contract review costs ৳50,000 (~$450) and takes 7 days via a traditional lawyer.",
        "Legal language is English-heavy; most citizens think in Bengali — existing tools do not handle that.",
        "Small businesses sign contracts blind: unreliable landlords, vendors, and employers exploit the information gap.",
        "4.5M+ Bangladeshi diaspora need trustworthy legal help abroad with no local representation.",
      ],
    },
    solution: {
      headline: "An AI-native legal platform with two products: Copilot (Ask) and Audit (Verify)",
      points: [
        "Copilot Chat: grounded legal Q&A over Bangladesh statutes in Bengali, English and Banglish — every answer cites the exact act and section.",
        "Contract Audit: upload a PDF, get a 30-second clause-by-clause risk audit for ৳28.",
        "Human-in-the-loop marketplace: real, verified lawyers review and countersign AI audits.",
        "Lawyer Research Mode: deeper doctrinal retrieval + case-law synthesis for professionals.",
      ],
    },
    traction: {
      headline: "Real numbers, zero mocks",
      points: [
        "Contract Audit benchmark: 91.7% gold-set accuracy with 100% provision recall.",
        "RAG benchmark: Router 100%, Act Hit@K 93.9%, MRR 0.864.",
        "Hallucination defense: 88.9% on adversarial gold set.",
        "Backend test suite fully green, including security regressions.",
      ],
    },
  },
  tech_docs: {
    feature_matrix: [],
    tech_stack: [],
    api_docs: [],
  },
  roadmap: {},
  changelog: [],
};

const DEMO_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    full_name: "Mahmudul Hasan Tasin",
    role: "Founder & Lead Engineer",
    email: "tasin@contractmind.ai",
    display_order: 1,
  },
];

/* ────────────────────────────────────────────────────────────
   PITCH SECTION REGISTRY (order, labels, icons)
   ──────────────────────────────────────────────────────────── */

const PITCH_REGISTRY: {
  key: keyof DocsContent["pitch_deck"];
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
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
  { id: "tech-overview", label: "Product Overview" },
  { id: "feature-matrix", label: "Feature Matrix" },
  { id: "system-architecture", label: "System Architecture" },
  { id: "data-flow", label: "Data Flow" },
  { id: "tech-stack", label: "Technology Stack" },
  { id: "api-documentation", label: "API Directory" },
  { id: "data-layer", label: "Data Layer" },
  { id: "ai-layer", label: "AI Layer" },
  { id: "performance", label: "Performance" },
  { id: "security", label: "Security & RBAC" },
  { id: "roadmap", label: "Roadmap" },
  { id: "changelog", label: "Changelog" },
];

/* ────────────────────────────────────────────────────────────
   MERMAID — lazy CDN load, graceful <pre> fallback
   ──────────────────────────────────────────────────────────── */

declare global {
  interface Window {
    mermaid?: {
      initialize: (cfg: Record<string, unknown>) => void;
      render: (id: string, code: string) => Promise<{ svg: string }>;
    };
  }
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
      } catch {
        resolve(null);
      }
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
      mermaid
        .render(idRef.current, code)
        .then(({ svg: out }) => {
          if (!cancelled) setSvg(out);
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 overflow-x-auto">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
        {title}
      </p>
      {svg ? (
        <div className="mermaid-output [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : failed ? (
        <pre className="text-[11px] leading-relaxed text-[var(--text-muted)] whitespace-pre-wrap font-mono">
          {code}
        </pre>
      ) : (
        <div className="h-40 flex items-center justify-center text-xs text-[var(--text-muted)] animate-pulse">
          Rendering diagram…
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────── */

export default function DocsPage() {
  const [access, setAccess] = useState<DocsAccess | null>(null);
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pitch" | "tech" | "team">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEMO_TEAM_MEMBERS);
  const [content, setContent] = useState<DocsContent>(FALLBACK_CONTENT);
  const [liveContentLoaded, setLiveContentLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState("problem");
  const [copiedLink, setCopiedLink] = useState(false);

  const API_BASE = useMemo(() => {
    if (typeof window !== "undefined") {
      return process.env.NEXT_PUBLIC_API_URL || "https://legal-copilot-backend-npq7.onrender.com";
    }
    return "https://legal-copilot-backend-npq7.onrender.com";
  }, []);

  const authHeaders = useMemo((): Record<string, string> => {
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  }, [authToken]);

  useEffect(() => {
    // Detect admin (role + token) so previews bypass a closed window
    try {
      const stored = localStorage.getItem("app_auth_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed.token || parsed.access_token || null;
        if (parsed?.user?.role === "ADMIN" || parsed?.role === "ADMIN") {
          setIsAdminPreview(true);
          if (token) setAuthToken(token);
        } else if (token) {
          setAuthToken(token); // still send: backend only grants ADMIN bypass
        }
      }
    } catch {
      // ignore
    }

    const headers = authHeaders;

    // Access state
    fetch(`${API_BASE}/api/docs/access`)
      .then((r) => r.json())
      .then((data: DocsAccess) => setAccess(data))
      .catch(() => setAccess({ accessible: true, visibility: "ON" }))
      .finally(() => setLoading(false));

    // Live content (pitch + tech docs + roadmap + changelog)
    fetch(`${API_BASE}/api/docs/content`, { headers })
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error("content unavailable");
      })
      .then((data: DocsContent) => {
        if (data?.pitch_deck) {
          setContent(data);
          setLiveContentLoaded(true);
        }
      })
      .catch(() => {
        // keep bundled fallback content
      });

    // Live stats
    fetch(`${API_BASE}/api/docs/live-stats`, { headers })
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error("stats unavailable");
      })
      .then((data: LiveStats) => {
        if (data && typeof data.total_users === "number") setStats(data);
      })
      .catch(() => undefined);

    // Team roster
    fetch(`${API_BASE}/api/docs/team`, { headers })
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error("team unavailable");
      })
      .then((data: TeamMember[]) => {
        if (Array.isArray(data) && data.length > 0) setTeamMembers(data);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]);

  // Scrollspy for the sidebar
  useEffect(() => {
    const onScroll = () => {
      const ids = [
        ...PITCH_REGISTRY.map((s) => s.id),
        "team",
        ...TECH_NAV.map((s) => s.id),
      ];
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
  const pitchOrder = useMemo(() => {
    const stored = Array.isArray(pitch.section_order) ? pitch.section_order : null;
    const valid = (stored ?? DEFAULT_ORDER).filter((k) =>
      PITCH_REGISTRY.some((s) => s.key === k)
    );
    const missing = PITCH_REGISTRY.filter((s) => !valid.includes(s.key as string)).map(
      (s) => s.key as string
    );
    return [...valid, ...missing];
  }, [pitch.section_order]);

  const navMatches = useCallback(
    (label: string) =>
      !searchQuery || label.toLowerCase().includes(searchQuery.toLowerCase()),
    [searchQuery]
  );

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadMarkdown = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/docs/export.md`, { headers: authHeaders });
      if (!res.ok) throw new Error("export failed");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ContractMind_Docs_PitchDeck.md");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Minimal offline fallback export
      const lines = [
        `# ${pitch.company ?? "ContractMind"}`,
        ``,
        `> ${pitch.tagline ?? ""}`,
        ``,
        ...PITCH_REGISTRY.map((s) => {
          const sec = pitch[s.key] as PitchSection | undefined;
          return `## ${s.label}\n${sec?.headline ?? ""}\n${(sec?.points ?? [])
            .map((p) => `- ${p}`)
            .join("\n")}`;
        }),
      ];
      const blob = new Blob([lines.join("\n\n")], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ContractMind_Docs_PitchDeck.md");
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg-primary)]">
        <div className="w-10 h-10 border-[3px] border-[var(--text-primary)]/20 border-t-[var(--text-primary)] rounded-full animate-spin mb-4" />
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
              Documentation Not Available
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              This live pitch deck and technical whitepaper is scheduled for access during specific
              investor and judging windows.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-left space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Official Availability Window:</span>
            </div>
            <div className="text-sm font-mono text-[var(--text-muted)] pl-6">
              <div>
                Starts:{" "}
                {access?.schedule_start
                  ? new Date(access.schedule_start).toLocaleString()
                  : "Not announced"}
              </div>
              <div>
                Ends:{" "}
                {access?.schedule_end
                  ? new Date(access.schedule_end).toLocaleString()
                  : "Not announced"}
              </div>
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
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold text-xs shadow-sm">
            {numbered(idx)}
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {meta.label}
          </h2>
        </div>

        {sec.headline && (
          <p className="text-base sm:text-lg font-semibold text-[var(--text-primary)] leading-snug pl-12 sm:pl-[52px]">
            {sec.headline}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 sm:pl-2">
          {(sec.points ?? []).map((point, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Admin Preview Floating Banner */}
      {isAdminPreview && !isPubliclyAllowed && (
        <aside
          aria-label="Admin Override"
          className="sticky top-0 z-50 bg-amber-600 text-white text-xs font-medium px-4 py-2 flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>
              <strong>Admin Override Active:</strong> Public access is currently{" "}
              {access?.visibility || "SCHEDULED/OFF"}. You are viewing with Admin privileges.
            </span>
          </div>
          <Link href="/admin/docs" className="underline hover:text-amber-100 flex items-center gap-1 font-semibold">
            Manage Visibility in Admin Panel &rarr;
          </Link>
        </aside>
      )}

      {/* Top Header & Sticky Navigation */}
      <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--text-primary)]/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-bold text-base shadow-sm">
                CM
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
                  {pitch.company ?? "ContractMind"}
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-[var(--text-primary)]/10 text-[var(--text-primary)]">
                  YC Pitch + Whitepaper
                </span>
              </div>
            </Link>
          </div>

          <nav
            aria-label="Documentation Section Filter"
            className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-xs font-medium"
          >
            {(
              [
                ["all", "All Modules"],
                ["pitch", "YC Pitch Deck"],
                ["tech", "Technical Docs"],
                ["team", "Team Showcase"],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === tab
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--text-primary)]/15 text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              title="Download docs as Markdown (live from backend)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--text-primary)]/15 text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              title="Save as PDF (print)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">PDF</span>
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
          {/* Sticky Sidebar */}
          <aside
            aria-label="Documentation Table of Contents"
            className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6 print:hidden"
          >
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
                {(activeTab === "all" || activeTab === "pitch") &&
                  pitchNav.some((s) => navMatches(s.label)) && (
                    <div className="pt-1 pb-2">
                      <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        YC Pitch Deck
                      </p>
                      {pitchNav
                        .filter((s) => navMatches(s.label))
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
                      <a
                        href="#team"
                        onClick={() => setActiveSection("team")}
                        className={`block px-2.5 py-1.5 rounded-lg transition-colors ${
                          activeSection === "team"
                            ? "bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold"
                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                        }`}
                      >
                        Team
                      </a>
                    </div>
                  )}

                {(activeTab === "all" || activeTab === "tech") &&
                  TECH_NAV.some((s) => navMatches(s.label)) && (
                    <div className="pt-2 pb-2 border-t border-[var(--text-primary)]/10">
                      <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Technical Architecture
                      </p>
                      {TECH_NAV.filter((s) => navMatches(s.label)).map((item) => (
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
                <button
                  onClick={() => window.location.reload()}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  title="Refresh live data"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <span>Laws Indexed:</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {(stats?.statutes_indexed ?? 35000).toLocaleString()}+
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Registered Users:</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {(stats?.total_users ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Contract Audits:</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {(stats?.total_audits ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chat Sessions:</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {(stats?.total_chat_sessions ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lawyers Onboard:</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {(stats?.total_lawyers ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-snug pt-1 border-t border-[var(--text-primary)]/10">
                {liveContentLoaded
                  ? "Synced live from the production database."
                  : "Showing bundled snapshot (live sync unavailable)."}
              </p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-16">
            {/* HERO */}
            <section className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--text-primary)]/10 shadow-lg space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Builders Congress 2026 Showcase Edition</span>
              </div>

              <div className="space-y-3 max-w-3xl">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15]">
                  {pitch.company ?? "ContractMind"}
                </h1>
                <p className="text-lg sm:text-xl font-medium text-[var(--text-muted)] leading-relaxed">
                  {pitch.tagline}
                </p>
              </div>

              {pitch.one_liner && (
                <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
                  {pitch.one_liner}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--text-primary)]/10">
                {[
                  {
                    value: `${(stats?.statutes_indexed ?? 35000).toLocaleString()}+`,
                    label: "Bangladesh Statutes Ingested",
                  },
                  {
                    value: (stats?.total_users ?? 0).toLocaleString(),
                    label: "Registered Users (live)",
                  },
                  {
                    value: (stats?.total_audits ?? 0).toLocaleString(),
                    label: "Contract Audits Run (live)",
                  },
                  {
                    value: "30s",
                    label: "Average Audit Turnaround",
                  },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                      {s.value}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* PART 1: PITCH DECK */}
            {(activeTab === "all" || activeTab === "pitch") && (
              <div className="space-y-16">
                {pitchOrder.map((key, idx) => renderPitchSection(key, idx))}

                {pitch.the_ask && (
                  <section id="ask" className="scroll-mt-24">
                    <div className="p-8 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                        The Ask
                      </p>
                      <p className="text-lg sm:text-xl font-bold leading-snug">{pitch.the_ask}</p>
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* TEAM */}
            {(activeTab === "all" || activeTab === "pitch" || activeTab === "team") && (
              <section id="team" className="scroll-mt-24 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)]">
                    <Users className="w-4.5 h-4.5" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                    Team{pitch.team_name ? ` — ${pitch.team_name}` : ""}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 text-center space-y-3"
                    >
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-[3px] border-[var(--bg-surface)] bg-[var(--bg-surface)] flex items-center justify-center">
                        {member.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.image_url}
                            alt={member.full_name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : null}
                        {!member.image_url && (
                          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            {member.full_name
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((w) => w[0]?.toUpperCase())
                              .join("")}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[var(--text-primary)]">
                          {member.full_name}
                        </div>
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {member.role}
                        </div>
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] mt-1"
                          >
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </a>
                        )}
                      </div>
                      {(member.linkedin_url || member.github_url) && (
                        <div className="flex items-center justify-center gap-2 pt-1">
                          {member.linkedin_url && (
                            <a
                              href={member.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[10px]"
                            >
                              LinkedIn
                            </a>
                          )}
                          {member.github_url && (
                            <a
                              href={member.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[10px]"
                            >
                              GitHub
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* PART 2: TECHNICAL DOCUMENTATION */}
            {(activeTab === "all" || activeTab === "tech") && (
              <div className="space-y-16">
                {/* Product Overview */}
                <section id="tech-overview" className="scroll-mt-24 space-y-5">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Product Overview
                  </h2>
                  <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-4">
                    {tech.product_overview?.what_it_does && (
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                        {tech.product_overview.what_it_does}
                      </p>
                    )}
                    {tech.product_overview?.target_users && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                          Target Users
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tech.product_overview.target_users.map((u) => (
                            <span
                              key={u}
                              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-[var(--text-primary)]"
                            >
                              {u}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {tech.product_overview?.core_use_cases && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                          Core Use Cases
                        </p>
                        <ul className="space-y-1.5">
                          {tech.product_overview.core_use_cases.map((c) => (
                            <li key={c} className="text-sm text-[var(--text-muted)] flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 mt-1 shrink-0 text-emerald-500" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>

                {/* Feature Matrix */}
                {(tech.feature_matrix ?? []).length > 0 && (
                  <section id="feature-matrix" className="scroll-mt-24 space-y-5">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
                      <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Feature Matrix
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        live-synced
                      </span>
                    </h2>
                    <div className="overflow-x-auto rounded-2xl border border-[var(--text-primary)]/10">
                      <table className="w-full text-sm">
                        <thead className="bg-[var(--bg-card)]">
                          <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                            <th className="px-4 py-3 font-bold">Feature</th>
                            <th className="px-4 py-3 font-bold">Status</th>
                            <th className="px-4 py-3 font-bold">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(tech.feature_matrix ?? []).map((f) => {
                            const tone =
                              f.status === "LIVE"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : f.status === "BETA"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
                            return (
                              <tr key={f.name} className="border-t border-[var(--text-primary)]/10 bg-[var(--bg-primary)]">
                                <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                                  {f.name}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tone}`}>
                                    {f.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[var(--text-muted)]">{f.note}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* Architecture + Data Flow diagrams */}
                <section id="system-architecture" className="scroll-mt-24 space-y-5">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
                    <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    System Architecture &amp; Data Flow
                  </h2>
                  {tech.architecture_mermaid && (
                    <MermaidBlock code={tech.architecture_mermaid} title="Architecture — UI → API → Services → DB" />
                  )}
                  {tech.dataflow_mermaid && (
                    <div id="data-flow" className="scroll-mt-24">
                      <MermaidBlock code={tech.dataflow_mermaid} title="Data Flow — Input → Processing → AI → Output → Feedback" />
                    </div>
                  )}
                </section>

                {/* Tech Stack */}
                {(tech.tech_stack ?? []).length > 0 && (
                  <section id="tech-stack" className="scroll-mt-24 space-y-5">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
                      <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Technology Stack
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(tech.tech_stack ?? []).map((s) => (
                        <div
                          key={s.layer}
                          className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-1.5"
                        >
                          <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-primary)]">
                            {s.layer}
                          </p>
                          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{s.items}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* API Directory */}
                {(tech.api_docs ?? []).length > 0 && (
                  <section id="api-documentation" className="scroll-mt-24 space-y-5">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
                      <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      API Directory
                    </h2>
                    <div className="overflow-x-auto rounded-2xl border border-[var(--text-primary)]/10">
                      <table className="w-full text-sm">
                        <thead className="bg-[var(--bg-card)]">
                          <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                            <th className="px-4 py-3 font-bold">Group</th>
                            <th className="px-4 py-3 font-bold">Endpoints</th>
                            <th className="px-4 py-3 font-bold">Auth</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(tech.api_docs ?? []).map((a) => (
                            <tr key={a.group} className="border-t border-[var(--text-primary)]/10 bg-[var(--bg-primary)]">
                              <td className="px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                                {a.group}
                              </td>
                              <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-xs leading-relaxed">
                                {a.endpoints}
                              </td>
                              <td className="px-4 py-3 text-[var(--text-muted)] text-xs whitespace-nowrap">
                                {a.auth}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* Data Layer + AI Layer */}
                <section id="data-layer" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-4">
                    <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Data Layer
                    </h3>
                    {(tech.data_layer?.sources ?? []).length > 0 && (
                      <ul className="space-y-1.5">
                        {(tech.data_layer?.sources ?? []).map((s) => (
                          <li key={s} className="text-sm text-[var(--text-muted)] flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 mt-1 shrink-0 text-emerald-500" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                    {tech.data_layer?.storage && (
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        <strong className="text-[var(--text-primary)]">Storage:</strong>{" "}
                        {tech.data_layer.storage}
                      </p>
                    )}
                    {tech.data_layer?.privacy && (
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        <strong className="text-[var(--text-primary)]">Privacy:</strong>{" "}
                        {tech.data_layer.privacy}
                      </p>
                    )}
                  </div>

                  <div id="ai-layer" className="scroll-mt-24 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-4">
                    <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      AI Layer
                    </h3>
                    {(
                      [
                        ["Models", tech.ai_layer?.models],
                        ["Retrieval", tech.ai_layer?.retrieval],
                        ["Personalization", tech.ai_layer?.personalization],
                        ["Explainability", tech.ai_layer?.explainability],
                      ] as const
                    )
                      .filter(([, v]) => !!v)
                      .map(([label, v]) => (
                        <p key={label} className="text-xs text-[var(--text-muted)] leading-relaxed">
                          <strong className="text-[var(--text-primary)]">{label}:</strong> {v}
                        </p>
                      ))}
                  </div>
                </section>

                {/* Performance + Security */}
                <section id="performance" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                    <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Performance &amp; Scalability
                    </h3>
                    {tech.performance?.load_expectation && (
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        <strong className="text-[var(--text-primary)]">Load expectation:</strong>{" "}
                        {tech.performance.load_expectation}
                      </p>
                    )}
                    {tech.performance?.optimization && (
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        <strong className="text-[var(--text-primary)]">Optimization:</strong>{" "}
                        {tech.performance.optimization}
                      </p>
                    )}
                  </div>

                  <div id="security" className="scroll-mt-24 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3">
                    <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Security
                    </h3>
                    {(
                      [
                        ["Auth", tech.security?.auth],
                        ["RBAC", tech.security?.rbac],
                        ["Data protection", tech.security?.data_protection],
                      ] as const
                    )
                      .filter(([, v]) => !!v)
                      .map(([label, v]) => (
                        <p key={label} className="text-xs text-[var(--text-muted)] leading-relaxed">
                          <strong className="text-[var(--text-primary)]">{label}:</strong> {v}
                        </p>
                      ))}
                  </div>
                </section>

                {/* Roadmap */}
                <section id="roadmap" className="scroll-mt-24 space-y-5">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
                    <GitBranch className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Product Roadmap
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(
                      [
                        ["Short Term", content.roadmap?.short_term, "Now"],
                        ["Mid Term", content.roadmap?.mid_term, "Next"],
                        ["Long Term", content.roadmap?.long_term, "2027+"],
                      ] as const
                    ).map(([label, items, badge]) => (
                      <div
                        key={label}
                        className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-primary)]">
                            {label}
                          </p>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--text-primary)]/10 text-[var(--text-muted)]">
                            {badge}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {(items ?? []).map((item) => (
                            <li key={item} className="text-sm text-[var(--text-muted)] flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 mt-1 shrink-0 text-emerald-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Changelog */}
                {(content.changelog ?? []).length > 0 && (
                  <section id="changelog" className="scroll-mt-24 space-y-5">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
                      <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Changelog
                    </h2>
                    <div className="space-y-3">
                      {(content.changelog ?? []).map((entry) => (
                        <div
                          key={`${entry.version}-${entry.date}`}
                          className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 space-y-2.5"
                        >
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
                              {entry.version}
                            </span>
                            {entry.date && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--text-primary)]/10 text-[var(--text-muted)]">
                                {entry.date}
                              </span>
                            )}
                          </div>
                          <ul className="space-y-1">
                            {(entry.changes ?? []).map((c) => (
                              <li key={c} className="text-sm text-[var(--text-muted)] flex items-start gap-2">
                                <span className="mt-[7px] w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Footer */}
            <footer className="pt-8 border-t border-[var(--text-primary)]/10 text-xs text-[var(--text-muted)] space-y-1">
              <p>
                {pitch.company ?? "ContractMind"} — live documentation, auto-synced with the running
                system.
              </p>
              {content.updated_at && (
                <p className="opacity-70">
                  Content last updated: {new Date(content.updated_at).toLocaleString()}
                </p>
              )}
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
