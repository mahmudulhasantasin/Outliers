"use client";

import React, { useState } from "react";
import { Fraunces, Karla } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const karla = Karla({ subsets: ["latin"], variable: "--font-karla", display: "swap" });

// ==========================================
// 📁 CONTENT PAYLOAD (Static / Mock Data)
// ==========================================
const DOCS_DATA = {
  meta: {
    company: "Advotech Copilot",
    tagline: "AI-powered Legal Intelligence for the Global South",
    one_liner: "30-second AI contract audits for ৳28 ($0.25) — verified by real lawyers.",
    version: "v1.4.0",
    last_updated: "2026-11-18",
  },
  stats: { total_users: 44, total_audits: 33, statutes_indexed: 35000, avg_turnaround: "30s" },

  // --- YC PITCH DECK ---
  pitch: {
    problem: { headline: "80% of South Asians lack access to justice", points: ["A single contract review costs ৳50,000 (~$450) and takes 7 days via a traditional lawyer.", "Legal language is English-heavy; most citizens think in Bengali (or 'Banglish').", "Small businesses sign contracts blind: landlords and vendors exploit the information gap.", "4.5M+ Bangladeshi diaspora need trustworthy legal help abroad with no local representation."] },
    solution: {
      headline: "An AI-native legal platform with two products: Copilot (Ask) and Audit (Verify)",
      // UI Data for the rich cards
      products: [
        {
          tag: "PRODUCT 1: ASK", tagColor: "green",
          title: "Advotech Copilot (Bilingual Legal Q&A)",
          desc: "Conversational legal intelligence answering in Bengali, Banglish, and English, directly grounded in 35,000+ codified sections of the Laws of Bangladesh.",
          query: { text: "“বাড়িওয়ালা ৩ মাসের অগ্রিম সিকিউরিটি দাবি করছে, আমি কি চুক্তি বাতিল করতে পারব?”", citation: "→ Cites Section 10 & 23, Premises Rent Control Act 1991 (Zero Hallucination)" },
          checks: ["35,000+ Bangladesh Code statutes indexed in GraphRAG", "Sub-second statutory grounding latency via ChromaDB + Gemini"],
          btn: "Test Grounded Copilot"
        },
        {
          tag: "PRODUCT 2: VERIFY", tagColor: "orange",
          title: "ContractMind (30s Contract Risk Audit)",
          desc: "Upload any PDF agreement. In ~30 seconds, get an executive health score (0–100), severity-ranked liability flags, and actionable statutory redlines.",
          score: { title: "Commercial Lease Audit", value: "82 / 100", badges: [{ label: "1 High Risk", type: "danger" }, { label: "2 Warnings", type: "warning" }, { label: "45 Compliant", type: "success" }] },
          checks: ["Unfair penalty & void non-compete clause auto-detection", "Client-side PII auto-redaction before cloud processing"],
          btn: "Test Contract Audit Engine"
        }
      ]
    },
    why_now: { headline: "Three curves just crossed", points: ["LLM reasoning crossed the reliability threshold for bilingual legal retrieval.", "Bangladesh digital payments (bKash/Nagad) make ৳28 micro-payments collectable.", "Legal-tech in the Global South is near-empty; global AI ignores regional common law."] },
    product_demo: { headline: "Live, judgeable, and real" },
    market: { headline: "$1-2B local → $70B+ global legal tech by 2030", points: ["Bangladesh legal services market: $1-2B annually, almost entirely offline.", "Beachhead wedge: contracts — high-frequency, high-pain, low-judgment work.", "10,000+ foreign companies operating in Bangladesh need local compliance.", "South Asia is the unclaimed chunk of the global $70B+ legal tech market."] },
    business_model: { headline: "Three revenue engines, one billing rail", points: ["B2C top-up: credit-based micro-payments via SSLCommerz.", "B2B enterprise: monthly subscriptions for corporate playbooks & quotas.", "MCP licensing: legal MCP server licensable to AI agent developers."] },
    traction: { headline: "Real numbers, zero mocks", points: ["Contract Audit benchmark: 33/36 (91.7%) with 100% provision recall.", "RAG benchmark: 46/55 effective (Act Hit@K 93.9%).", "Hallucination benchmark: 88.9% deterministic block rate.", "Full backend test suite: 73/73 passing on production CI/CD."] },
    competition: { headline: "Global tools don't read Bengali; local lawyers don't scale", points: ["Harvey / Global LLMs: Hallucinate local statutes; prohibitively expensive.", "Traditional Firms: Slow (7+ days), expensive (৳50,000+), inaccessible to 99%.", "Local Directories: Just phonebooks; no AI audits, no deterministic guards."] },
    unique_advantage: { headline: "Proprietary Data + Human Verifiers", points: ["3,547-act alias index + hybrid 2-path retrieval (reproducible accuracy).", "Deterministic safety layer explicitly blocking non-existent section hallucinations.", "HITL (Human-in-the-loop) marketplace converts AI speed into lawyer-verified trust."] },
    go_to_market: { headline: "Land on contracts, expand into conversations", points: ["Phase 1: Young professionals & SMEs (pay-per-audit, zero friction).", "Phase 2: Law students & junior lawyers via Research Mode.", "Phase 3: Enterprises with custom playbooks and shared audit workspaces."] },
    vision: { headline: "The default legal layer for the Global South", points: ["Jurisdiction-agnostic core: Bangladesh is the beachhead.", "India (Q1 2027), Pakistan (Q2 2027), UAE (Q3 2027) requiring data ingestion only.", "One AI layer humans trust enough to countersign."] },
  },

  // --- TEAM ---
  team_name: "Team Advotech",
  team: [
    { name: "Shuaib", role: "Lead Architect / Full-Stack", email: "shuaib@advotech.copilot", avatar: "/team/Mohammad_Shuaib.webp" },
    { name: "Ayesha Rahman", role: "Legal Operations / Compliance", email: "ayesha@advotech.copilot", avatar: "/team/tasin.jpg" },
    { name: "Karim Mustafa", role: "AI Systems / ML Engineer", email: "karim@advotech.copilot", avatar: "/team/sayem.webp" },
    { name: "Farhan Tariq", role: "Backend Engineer / Auth", email: "farhan@advotech.copilot", avatar: "/team/sajjad.webp" },
    { name: "Nabila Khan", role: "Product Designer / UX", email: "nabila@advotech.copilot", avatar: "/team/medha.webp" },
    { name: "Rifat Hasan", role: "Go-To-Market / Partnerships", email: "rifat@advotech.copilot", avatar: "/team/jibon.webp" }
  ],

  // --- TECH DOCS / WHITEPAPER ---
  tech: {
    product_overview: { headline: "System Overview", desc: "A robust API infrastructure providing grounded bilingual legal chat, PDF contract risk analysis, SSLCommerz-based micro-billing, and a human-in-the-loop advocate verification marketplace. Built for low-latency, scalable execution across the Global South." },
    feature_matrix: [
      { name: "AI Contract Audit (PDF)", status: "LIVE", note: "91.7% accuracy, 100% recall" },
      { name: "Grounded Legal Chat (RAG)", status: "LIVE", note: "3,547 acts, MRR 0.864" },
      { name: "Credits & Payments (SSLCommerz)", status: "LIVE", note: "Ledger + IPN Callbacks" },
      { name: "HITL Lawyer Marketplace", status: "BETA", note: "SLA cron + inquiry flow active" },
      { name: "Legal MCP Server (FastMCP)", status: "BETA", note: "3 tools active, SSE resilient" },
      { name: "Enterprise Workspaces", status: "PLANNED", note: "Q1 2027: Quotas, Playbooks" }
    ],
    tech_stack: [
      { layer: "Backend", items: "FastAPI (Async), SQLAlchemy 2, Pydantic, LangGraph" },
      { layer: "AI / Inference", items: "Groq LLM (Primary) → GLM Fallback, Local gemma3n" },
      { layer: "Database", items: "Supabase PostgreSQL, Qdrant Cloud (Vector)" },
      { layer: "Payments", items: "SSLCommerz (Cards/bKash), Internal Credit Ledger" },
      { layer: "Infrastructure", items: "Render, Coolify VPS, FastMCP Server" }
    ],
    api_docs: [
      { group: "Auth (/api/auth)", endpoints: "POST /request-otp, POST /verify-otp, POST /logout" },
      { group: "Chat (/api/chat)", endpoints: "POST /ask (Grounded Q&A), GET /history" },
      { group: "Audit (/api/contract)", endpoints: "POST /upload (PDF), GET /memos" },
      { group: "Payments (/api/payments)", endpoints: "POST /initiate, POST /callback" }
    ],
    data_layer: { headline: "Data & Privacy Architecture", points: ["Ingestion: 35,000+ codified acts mapped via custom ETL pipeline into Qdrant e5-small vectors.", "Privacy: Client-side PII scrubbing ensures names/financials never reach external LLM endpoints.", "Storage: Supabase pgvector handles relational users, memos, and metric_events."] },
    ai_layer: { headline: "AI & RAG Mechanics", points: ["Retrieval: Hybrid 2-path retriever (Act Aliases → Sections; Precedent → Case Law).", "Guards: Deterministic foreign-jurisdiction routing explicitly catches hallucinated acts.", "Explainability: Every generation carries hard-linked statutory and clause citations."] },
    roadmap: { headline: "Development Roadmap", points: ["Short-term: OCR Table-PDF fixes, RAG edge-case patching, 180s product video.", "Mid-term: Corporate playbooks, MCP public licensing, dispute-prep AI agent.", "Long-term (Q1-Q3 2027): Launch in India, Pakistan, UAE (Data ingestion only)."] },
    performance: { headline: "Performance & Scalability", points: ["Latency: ~30s E2E for 15-page PDF audits; sub-3s for RAG Chat.", "Optimization: Async FastAPI everywhere, lazy-loaded docs, connection pooling."] },
    security: { headline: "Security & RBAC", points: ["Auth: JWT with token_version revocation.", "RBAC: GENERAL vs LAWYER vs ENTERPRISE role-gating on API routers.", "Data Protection: BOLA-hardened downloads, traversal-proof temp files, injection guards."] },
    analytics: { headline: "System Analytics", points: ["Benchmarking: Native test suite streams directly into metric_events table.", "KPIs: Audit accuracy (91.7%), Hit@K (93.9%), Hallucination blocking (88.9%)."] },
    changelog: [
      { v: "v1.3", changes: "Live /docs module, MCP tool-call retry ladder, Case-law search triggers." },
      { v: "v1.2", changes: "Solve-batch guards, Injection hardening, OTP masking, BOLA checks." },
      { v: "v1.1", changes: "Rule verification layer, adaptive Qdrant threshold, Benchmark harness." }
    ]
  }
};


// ==========================================
// 🎨 GLOBAL STYLES (Hearth Theme + Rich UI)
// ==========================================
const STYLES = `
  .hearth-theme {
    --bg-main: #FBF4EC; --bg-alt: #FFFDF9; --bg-accent: #F6E2D7;
    --text-dark: #2E2117; --text-body: #5C4F43;
    --accent-clay: #C45B3C; --border-color: #ECDFD0;
    --admin-color: #1E5C40; --green-light: #E9F3ED; --green-dark: #1E5C40;
    --orange-light: #FDF3E1; --orange-dark: #8F5A0A;

    background-color: var(--bg-main); color: var(--text-body);
    font-family: var(--font-karla), sans-serif;
    margin: 0; padding: 0; scroll-behavior: smooth; display: flex;
  }
  .hearth-theme * { box-sizing: border-box; }

  /* Admin Toolbar */
  .admin-toolbar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--admin-color); color: white; padding: 0.75rem 2rem; z-index: 100; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
  .btn-admin { background: rgba(255,255,255,0.2); border: none; color: white; padding: 0.5rem 1rem; cursor: pointer; border-radius: 4px; transition: 0.2s;}

  /* Layout Base */
  .sidebar { position: sticky; top: 0; height: 100vh; width: 280px; background: var(--bg-alt); border-right: 1px solid var(--border-color); padding: 2rem 1.5rem; overflow-y: auto; flex-shrink: 0; }
  .main-content { flex-grow: 1; width: calc(100% - 280px); }
  .brand { font-family: var(--font-fraunces), serif; font-size: 1.25rem; color: var(--text-dark); margin-bottom: 2rem; display: block; text-decoration: none;}
  .search-box { width: 100%; padding: 0.75rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 2rem; font-family: inherit; font-size: 0.85rem;}
  .toc-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-clay); margin: 1.5rem 0 0.75rem 0; font-weight: 700; }
  .toc-link { display: block; font-size: 0.9rem; color: var(--text-body); text-decoration: none; margin-bottom: 0.75rem; transition: color 0.2s; }
  .toc-link:hover { color: var(--accent-clay); }
  .topbar { padding: 1.5rem 4vw; border-bottom: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 1rem; background: rgba(251, 244, 236, 0.95); position: sticky; top: 0; z-index: 50; backdrop-filter: blur(8px); }
  .btn { border: 1px solid var(--border-color); background: transparent; padding: 0.5rem 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; color: var(--text-body); font-weight: 600; }

  /* Typography & Sections */
  .doc-section { padding: 5rem 4vw; border-bottom: 1px solid var(--border-color); }
  .doc-section.alt { background-color: var(--bg-alt); }
  .doc-inner { max-width: 900px; margin: 0 auto; position: relative; }
  .eyebrow { color: var(--accent-clay); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 1rem; display: block; }
  .headline { font-family: var(--font-fraunces), serif; font-size: clamp(2rem, 4vw, 3.5rem); color: var(--text-dark); line-height: 1.1; margin: 0 0 2.5rem 0; }
  .paragraph { font-size: 1.1rem; line-height: 1.7; margin-bottom: 1.5rem; }
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem; }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
  .card-line { border-top: 1px solid var(--border-color); padding-top: 1rem; }

  /* -------------------------------------- */
  /* RICH UI: Product Cards (Section 02)    */
  /* -------------------------------------- */
  .product-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
  .pc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .pc-icon { font-size: 1.5rem; }
  .pc-tag { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 0.3rem 0.6rem; border-radius: 4px; }
  .pc-tag.green { background: var(--green-light); color: var(--green-dark); }
  .pc-tag.orange { background: var(--orange-light); color: var(--orange-dark); }
  .pc-title { font-family: var(--font-fraunces), serif; font-size: 1.5rem; color: var(--text-dark); margin: 0 0 1rem 0; line-height: 1.2; }
  .pc-desc { font-size: 0.95rem; color: var(--text-body); line-height: 1.6; margin-bottom: 1.5rem; }
  .pc-box { background: var(--bg-main); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem; }
  .pc-box.green-box { background: var(--green-light); }
  .pc-box-title { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700; color: var(--green-dark); margin-bottom: 0.75rem; }
  .pc-box-text { font-size: 0.9rem; font-style: italic; color: var(--text-dark); margin-bottom: 0.5rem; }
  .pc-box-cite { font-size: 0.75rem; color: var(--green-dark); }
  .pc-score-head { display: flex; justify-content: space-between; font-weight: 700; font-size: 0.85rem; color: var(--text-dark); margin-bottom: 1rem; }
  .pc-badges { display: flex; gap: 0.5rem; }
  .badge-ui { flex: 1; text-align: center; padding: 0.4rem; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; border-radius: 4px; }
  .badge-ui.danger { background: #FDE8E8; color: #9B1C1C; }
  .badge-ui.warning { background: #FEF4CE; color: #8F5A0A; }
  .badge-ui.success { background: #E2F0E9; color: #1E5C40; }
  .pc-checks { list-style: none; padding: 0; margin: 0 0 2rem 0; flex-grow: 1; }
  .pc-checks li { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.9rem; margin-bottom: 0.75rem; line-height: 1.4; color: var(--text-dark); }
  .pc-checks li::before { content: "✓"; color: var(--green-dark); font-weight: bold; }
  .pc-btn { background: #1A1A1A; color: white; border: none; border-radius: 8px; padding: 1rem; font-weight: 600; font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.2s; }
  .pc-btn:hover { background: #000; }

  /* -------------------------------------- */
  /* RICH UI: Demo Chat Simulation          */
  /* -------------------------------------- */
  .demo-wrap { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
  .demo-top-bar { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
  .demo-pill { display: flex; align-items: center; gap: 0.5rem; background: var(--bg-alt); border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600; }
  .demo-pill-live { background: var(--green-light); color: var(--green-dark); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.65rem; text-transform: uppercase; }

  .demo-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .demo-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-body); }
  .demo-guarantee { color: var(--green-dark); font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem; }

  .demo-cats { display: flex; gap: 0.75rem; margin-bottom: 2rem; }
  .demo-cat { background: var(--bg-main); border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.8rem; color: var(--text-body); cursor: pointer; }
  .demo-cat.active { background: #1A1A1A; color: white; border-color: #1A1A1A; }
  .demo-cat span { opacity: 0.7; font-size: 0.7rem; margin-left: 0.3rem; }

  .demo-chat-area { background: var(--bg-main); border-radius: 12px; padding: 2rem; display: flex; flex-direction: column; gap: 2rem; }

  .msg-user-wrap { display: flex; justify-content: flex-end; gap: 1rem; }
  .msg-user { background: #1A1A1A; color: white; padding: 1.25rem; border-radius: 12px 0 12px 12px; max-width: 80%; font-size: 0.95rem; line-height: 1.6; }
  .avatar-u { width: 32px; height: 32px; background: var(--border-color); color: var(--text-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; }

  .msg-ai-wrap { display: flex; gap: 1rem; }
  .avatar-ai { width: 32px; height: 32px; background: var(--green-light); color: var(--green-dark); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
  .msg-ai-content { flex-grow: 1; }
  .msg-ai-meta { display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; font-weight: 700; color: var(--text-body); margin-bottom: 0.75rem; }
  .msg-ai-match { color: var(--green-dark); }
  .msg-ai-bubble { background: #FFFFFF; border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 0 12px 12px 12px; font-size: 0.95rem; line-height: 1.7; color: var(--text-dark); box-shadow: 0 2px 8px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }

  .msg-grounding { background: var(--green-light); border: 1px solid rgba(30, 92, 64, 0.2); border-radius: 8px; padding: 1.25rem; }
  .grounding-title { font-size: 0.75rem; font-weight: 800; color: var(--green-dark); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
  .grounding-text { display: flex; gap: 1rem; font-size: 0.85rem; line-height: 1.5; color: var(--text-dark); }
  .grounding-cite { font-weight: 700; width: 40%; }

  .demo-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem; }
  .demo-footer-text { font-size: 0.9rem; color: var(--text-body); }

  /* -------------------------------------- */
  /* General Tech / Tables                  */
  /* -------------------------------------- */
  .team-card { border-top: 2px solid var(--border-color); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .team-img { width: 100%; aspect-ratio: 1/1; object-fit: cover; background: var(--bg-accent); border-radius: 4px; filter: grayscale(15%); transition: filter 0.3s; }
  .team-card:hover .team-img { filter: grayscale(0%); }
  .team-name { font-family: var(--font-fraunces), serif; font-size: 1.25rem; color: var(--text-dark); margin: 0; }
  .team-role { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-clay); margin: 0; font-weight: 700; }
  .team-email { font-size: 0.85rem; opacity: 0.8; margin: 0; }
  .matrix { width: 100%; border-collapse: collapse; margin-top: 2rem; font-size: 0.95rem; }
  .matrix th, .matrix td { padding: 1.25rem 0; border-bottom: 1px solid var(--border-color); text-align: left; }
  .badge { display: inline-block; padding: 0.25rem 0.6rem; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 3px; }
  .badge-live { background: #E2F0E9; color: #1E5C40; }
  .badge-planned { background: #F1F1F4; color: #5C4F43; }
  .badge-beta { background: #FDF3E1; color: #8F5A0A; }

  @media (max-width: 900px) {
    .hearth-theme { flex-direction: column; }
    .sidebar { width: 100%; height: auto; position: static; padding: 1.5rem; border-right: none; border-bottom: 1px solid var(--border-color); }
    .main-content { width: 100%; }
    .grounding-text { flex-direction: column; gap: 0.5rem; }
    .grounding-cite { width: 100%; }
    .demo-footer { flex-direction: column; gap: 1rem; align-items: flex-start; }
  }
`;

// ==========================================
// 🧩 COMPONENTS
// ==========================================
const Section = ({ id, eyebrow, headline, children, altBg }: any) => (
  <section id={id} className={`doc-section ${altBg ? 'alt' : ''}`}>
    <div className="doc-inner">
      <span className="eyebrow">{eyebrow}</span>
      {headline && <h3 className="headline">{headline}</h3>}
      {children}
    </div>
  </section>
);

const PointsGrid = ({ points }: { points: string[] }) => (
  <div className="grid-2">
    {points.map((p, i) => <div key={i} className="card-line paragraph">{p}</div>)}
  </div>
);

// ==========================================
// 🚀 MAIN PAGE COMPONENT
// ==========================================
export default function DocsSystem() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const d = DOCS_DATA;

  return (
    <div className={`hearth-theme ${fraunces.variable} ${karla.variable} ${isAdminMode ? 'is-admin' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* 🛠 ADMIN TOOLBAR */}
      {isAdminMode && (
        <div className="admin-toolbar">
          <div>Editing Docs (v1.4.0)</div>
          <div>
            <button className="btn-admin" onClick={() => setIsAdminMode(false)} style={{ background: '#c45b3c' }}>Exit Admin</button>
          </div>
        </div>
      )}

      {/* 🧭 SIDEBAR / TOC */}
      <aside className="sidebar">
        <a href="#top" className="brand">{d.meta.company} Docs</a>
        <input type="text" className="search-box" placeholder="Search documentation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

        <div className="toc-title">Pitch Deck</div>
        <a href="#problem" className="toc-link">Problem & Solution</a>
        <a href="#demo" className="toc-link">Product Demo</a>
        <a href="#market" className="toc-link">Market & Business Model</a>
        <a href="#traction" className="toc-link">Traction & Competition</a>
        <a href="#vision" className="toc-link">Vision & Go-To-Market</a>
        <a href="#team" className="toc-link">The Team</a>

        <div className="toc-title">Whitepaper</div>
        <a href="#overview" className="toc-link">System Overview</a>
        <a href="#features" className="toc-link">Feature Matrix</a>
        <a href="#tech-stack" className="toc-link">Tech Stack & API</a>
      </aside>

      {/* 📄 MAIN CONTENT */}
      <main className="main-content">
        <div className="topbar">
          <button className="btn" onClick={() => setIsAdminMode(!isAdminMode)}>{isAdminMode ? 'View Public' : 'Enter Admin Mode'}</button>
          <button className="btn">Export PDF</button>
        </div>

        <div id="top">
          <Section eyebrow="Live System Documentation" headline={d.meta.tagline} altBg={true}>
            <p className="paragraph" style={{ borderLeft: '2px solid var(--accent-clay)', paddingLeft: '1.5rem' }}>{d.meta.one_liner}</p>
          </Section>
        </div>

        {/* --- 01. PROBLEM --- */}
        <Section id="problem" eyebrow="01. The Problem" headline={d.pitch.problem.headline}>
          <PointsGrid points={d.pitch.problem.points} />
        </Section>

        {/* --- 02. SOLUTION (RICH UI CARDS) --- */}
        <Section eyebrow="02. The Solution" headline={d.pitch.solution.headline} altBg={true}>
          <div className="grid-2">
            {d.pitch.solution.products.map((p, i) => (
              <div key={i} className="product-card">
                <div className="pc-head">
                  <div className="pc-icon">✨</div>
                  <div className={`pc-tag ${p.tagColor}`}>{p.tag}</div>
                </div>
                <h4 className="pc-title">{p.title}</h4>
                <p className="pc-desc">{p.desc}</p>

                {/* Conditional UI block for Ask vs Verify */}
                {p.query && (
                  <div className="pc-box green-box">
                    <div className="pc-box-title">✨ Sample Live Query</div>
                    <div className="pc-box-text">{p.query.text}</div>
                    <div className="pc-box-cite">{p.query.citation}</div>
                  </div>
                )}
                {p.score && (
                  <div className="pc-box">
                    <div className="pc-score-head">
                      <span>⚡ {p.score.title}</span>
                      <span>Score: {p.score.value}</span>
                    </div>
                    <div className="pc-badges">
                      {p.score.badges.map((b, idx) => (
                        <div key={idx} className={`badge-ui ${b.type}`}>{b.label}</div>
                      ))}
                    </div>
                  </div>
                )}

                <ul className="pc-checks">
                  {p.checks.map((chk, idx) => <li key={idx}>{chk}</li>)}
                </ul>
                <button className="pc-btn">{p.btn} <span>↗</span></button>
              </div>
            ))}
          </div>
        </Section>

        {/* --- 03. WHY NOW --- */}
        <Section id="why-now" eyebrow="03. Why Now" headline={d.pitch.why_now.headline}>
          <PointsGrid points={d.pitch.why_now.points} />
        </Section>

        {/* --- 04. PRODUCT DEMO (RICH CHAT UI) --- */}
        <Section id="demo" eyebrow="04. Product Demo" headline={d.pitch.product_demo.headline} altBg={true}>
          <div className="demo-wrap">
            {/* Top feature pills */}
            <div className="demo-top-bar">
              <div className="demo-pill">⚡ 30s Contract Audit <span className="demo-pill-live">Live</span></div>
              <div className="demo-pill" style={{ background: '#1A1A1A', color: 'white' }}>💬 Bilingual Copilot <span className="demo-pill-live" style={{ background: '#2d4bf5', color: 'white' }}>বাং+EN</span></div>
              <div className="demo-pill">👥 1-Click Test Drives <span className="demo-pill-live" style={{ background: '#f3e8ff', color: '#7e22ce' }}>4 Roles</span></div>
              <div className="demo-pill">📹 Video Showcase <span className="demo-pill-live" style={{ background: '#fee2e2', color: '#b91c1c' }}>180s</span></div>
            </div>

            {/* Chat Sim Header */}
            <div className="demo-header-row">
              <div className="demo-title">Select a Live Query Simulation:</div>
              <div className="demo-guarantee">✓ Zero Hallucination Guarantee</div>
            </div>
            <div className="demo-cats">
              <div className="demo-cat">Tenant Rights <span>(Banglish / Bangla)</span></div>
              <div className="demo-cat">Employment & Tech <span>(English)</span></div>
              <div className="demo-cat active">Commercial Law <span>(Bangla & English)</span></div>
            </div>

            {/* Chat Area */}
            <div className="demo-chat-area">
              {/* User Msg */}
              <div className="msg-user-wrap">
                <div className="msg-user">চেক বাউন্স (Dishonour) হলে নেগোশিয়েবল ইনস্ট্রুমেন্টস অ্যাক্টের ১৩৮ ধারায় নোটিশ পাঠানোর নির্দিষ্ট সময়সীমা কতদিন?</div>
                <div className="avatar-u">U</div>
              </div>

              {/* AI Msg */}
              <div className="msg-ai-wrap">
                <div className="avatar-ai">✨</div>
                <div className="msg-ai-content">
                  <div className="msg-ai-meta">
                    <span>Advotech Copilot</span> •
                    <span className="msg-ai-match">99.8% Statutory Match</span> •
                    <span style={{ opacity: 0.6 }}>Latency: 0.9s</span>
                  </div>
                  <div className="msg-ai-bubble">
                    The Negotiable Instruments Act, 1881-এর ধারা ১৩৮(১)(খ) অনুযায়ী চেক ডিজঅনারের জন্য কঠোর সময়সীমা রয়েছে:<br /><br />
                    ১. ব্যাংক থেকে 'Dishonour Memo' পাওয়ার তারিখ থেকে ঠিক ৩০ দিনের মধ্যে ড্রয়ারকে লিখিত সংবিধিবদ্ধ নোটিশ (Statutory Notice of Demand) পাঠাতে হবে।<br />
                    ২. নোটিশ প্রাপক নোটিশ প্রাপ্তির তারিখ থেকে ৩০ দিন সময় পাবেন টাকা পরিশোধ করার জন্য (Cure Period)।<br />
                    ৩. এই ৩০ দিনেও টাকা পরিশোধ না হলে, পরবর্তী ৩০ দিনের মধ্যে উপযুক্ত ম্যাজিস্ট্রেট আদালতে ফৌজদারি নালিশ (Complaint) দাখিল করতে হবে।<br /><br />
                    সতর্কতা: প্রথম ৩০ দিনের মধ্যে নোটিশ না পাঠালে এনআই অ্যাক্টের ১৩৮ ধারার অধীন ফৌজদারি প্রতিকার সম্পূর্ণ তামাদি (Barred by Limitation) হয়ে যায়।
                  </div>

                  {/* Grounding Box */}
                  <div className="msg-grounding">
                    <div className="grounding-title">⚖ VERIFIED STATUTORY GROUNDING (LAWS OF BANGLADESH):</div>
                    <div className="grounding-text">
                      <div className="grounding-cite">The Negotiable Instruments Act, 1881 (Section 138 & Section 141)</div>
                      <div>Mandatory 30-day notice requirement and 30-day limitation window for filing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="demo-footer">
              <div className="demo-footer-text">Ask legal questions in Banglish, Bengali, or English with instant citation verification.</div>
              <button className="pc-btn" style={{ padding: '0.75rem 1.5rem' }}>Launch Live Bilingual Copilot <span>↗</span></button>
            </div>
          </div>
        </Section>

        {/* --- STANDARD SECTIONS (Market, Business, etc) --- */}
        <Section id="market" eyebrow="05. Market Opportunity" headline={d.pitch.market.headline}>
          <PointsGrid points={d.pitch.market.points} />
        </Section>

        <Section eyebrow="06. Business Model" headline={d.pitch.business_model.headline} altBg={true}>
          <PointsGrid points={d.pitch.business_model.points} />
        </Section>

        <Section id="traction" eyebrow="07. Traction & Benchmarks" headline={d.pitch.traction.headline}>
          <PointsGrid points={d.pitch.traction.points} />
        </Section>

        <Section eyebrow="08. Competition" headline={d.pitch.competition.headline} altBg={true}>
          <PointsGrid points={d.pitch.competition.points} />
        </Section>

        <Section eyebrow="09. Unique Advantage" headline={d.pitch.unique_advantage.headline}>
          <PointsGrid points={d.pitch.unique_advantage.points} />
        </Section>

        <Section id="vision" eyebrow="10. Go-To-Market & Vision" headline={d.pitch.vision.headline} altBg={true}>
          <PointsGrid points={d.pitch.vision.points} />
        </Section>

        {/* --- 11. TEAM --- */}
        <Section id="team" eyebrow="11. The Team" headline={d.team_name}>
          <div className="grid-3">
            {d.team.map((member, i) => (
              <div key={i} className="team-card">
                <img src={member.avatar} alt={member.name} className="team-img" loading="lazy" />
                <div>
                  <h4 className="team-name">{member.name}</h4>
                  <p className="team-role">{member.role}</p>
                  <p className="team-email">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* --- TECH DOCS --- */}
        <div style={{ borderTop: '8px solid var(--border-color)' }}></div>

        <Section id="overview" eyebrow="A. Product Overview" headline={d.tech.product_overview.headline} altBg={true}>
          <p className="paragraph">{d.tech.product_overview.desc}</p>
        </Section>

        <Section id="features" eyebrow="B. Feature Matrix" headline="Live Synchronized Capabilities">
          <table className="matrix">
            <thead><tr><th>Capability</th><th>Status</th><th>System Notes</th></tr></thead>
            <tbody>
              {d.tech.feature_matrix.map((f, i) => (
                <tr key={i}>
                  <td><strong>{f.name}</strong></td>
                  <td><span className={`badge badge-${f.status.toLowerCase()}`}>{f.status}</span></td>
                  <td>{f.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section id="tech-stack" eyebrow="C. Technology Stack" altBg={true}>
          <div className="grid-2">
            {d.tech.tech_stack.map((stack, i) => (
              <div key={i} className="card-line">
                <span className="eyebrow" style={{ marginBottom: '0.2rem' }}>{stack.layer}</span>
                <p className="paragraph">{stack.items}</p>
              </div>
            ))}
          </div>
        </Section>

      </main>
    </div>
  );
}