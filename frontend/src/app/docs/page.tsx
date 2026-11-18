"use client";

import React, { useState, useEffect, useRef } from "react";
import { Fraunces, Karla } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const karla = Karla({ subsets: ["latin"], variable: "--font-karla", display: "swap" });

// ==========================================
// 🔐 ACCESS CONTROL CONFIG
// ==========================================
const ACCESS_CONFIG = {
  adminPin: "advotech2026",
  defaultStart: "2026-06-10T00:00",
  defaultEnd: "2026-06-14T23:59",
};

// ==========================================
// 📁 CONTENT PAYLOAD
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

  pitch: {
    problem: { headline: "80% of South Asians lack access to justice", points: ["A single contract review costs ৳50,000 (~$450) and takes 7 days via a traditional lawyer.", "Legal language is English-heavy; most citizens think in Bengali (or 'Banglish').", "Small businesses sign contracts blind: landlords and vendors exploit the information gap.", "4.5M+ Bangladeshi diaspora need trustworthy legal help abroad with no local representation."] },
    solution: {
      headline: "An AI-native legal platform with two products: Copilot (Ask) and Audit (Verify)",
      products: [
        {
          tag: "PRODUCT 1: ASK", tagColor: "green",
          title: "Advotech Copilot (Bilingual Legal Q&A)",
          desc: "Conversational legal intelligence answering in Bengali, Banglish, and English, directly grounded in 35,000+ codified sections of the Laws of Bangladesh.",
          query: { text: "\u201c\u09ac\u09be\u09dc\u09bf\u0993\u09df\u09be\u09b2\u09be \u09e9 \u09ae\u09be\u09b8\u09c7\u09b0 \u0985\u0997\u09cd\u09b0\u09bf\u09ae \u09b8\u09bf\u0995\u09bf\u0989\u09b0\u09bf\u099f\u09bf \u09a6\u09be\u09ac\u09bf \u0995\u09b0\u099b\u09c7, \u0986\u09ae\u09bf \u0995\u09bf \u099a\u09c1\u0995\u09cd\u09a4\u09bf \u09ac\u09be\u09a4\u09bf\u09b2 \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac?\u201d", citation: "\u2192 Cites Section 10 & 23, Premises Rent Control Act 1991 (Zero Hallucination)" },
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
    market: { headline: "$1-2B local \u2192 $70B+ global legal tech by 2030", points: ["Bangladesh legal services market: $1-2B annually, almost entirely offline.", "Beachhead wedge: contracts — high-frequency, high-pain, low-judgment work.", "10,000+ foreign companies operating in Bangladesh need local compliance.", "South Asia is the unclaimed chunk of the global $70B+ legal tech market."] },
    business_model: { headline: "Three revenue engines, one billing rail", points: ["B2C top-up: credit-based micro-payments via SSLCommerz.", "B2B enterprise: monthly subscriptions for corporate playbooks & quotas.", "MCP licensing: legal MCP server licensable to AI agent developers."] },
    traction: { headline: "Real numbers, zero mocks", points: ["Contract Audit benchmark: 33/36 (91.7%) with 100% provision recall.", "RAG benchmark: 46/55 effective (Act Hit@K 93.9%).", "Hallucination benchmark: 88.9% deterministic block rate.", "Full backend test suite: 73/73 passing on production CI/CD."] },
    competition: { headline: "Global tools don't read Bengali; local lawyers don't scale", points: ["Harvey / Global LLMs: Hallucinate local statutes; prohibitively expensive.", "Traditional Firms: Slow (7+ days), expensive (৳50,000+), inaccessible to 99%.", "Local Directories: Just phonebooks; no AI audits, no deterministic guards."] },
    unique_advantage: { headline: "Proprietary Data + Human Verifiers", points: ["3,547-act alias index + hybrid 2-path retrieval (reproducible accuracy).", "Deterministic safety layer explicitly blocking non-existent section hallucinations.", "HITL (Human-in-the-loop) marketplace converts AI speed into lawyer-verified trust."] },
    go_to_market: { headline: "Land on contracts, expand into conversations", points: ["Phase 1 — Wedge: Young professionals & SMEs via pay-per-audit (zero friction onboarding, bKash top-up).", "Phase 2 — Expand: Law students & junior lawyers via Research Mode and citation tool licensing.", "Phase 3 — Scale: Enterprise legal teams with custom compliance playbooks, shared audit vaults, and pooled credit wallets."] },
    vision: { headline: "The default legal layer for the Global South", points: ["Jurisdiction-agnostic core: Bangladesh is the beachhead, not the ceiling.", "India (Q1 2027), Pakistan (Q2 2027), UAE (Q3 2027) requiring only data ingestion.", "One AI layer humans trust enough to countersign."] },
  },

  team_name: "Team Advotech",
  team: [
    { name: "Mohammad Shuaib", role: "Lead Architect / Full-Stack Engineer", email: "shuaib@advotech.ai", avatar: "/team/Mohammad_Shuaib.webp" },
    { name: "Mahmudul Hasan Tasin", role: "Product Lead / Backend Architect", email: "tasin@advotech.ai", avatar: "/team/tasin.webp" },
    { name: "SM Sayem Hossain", role: "UI/UX Engineer / Frontend Lead", email: "sayem@advotech.ai", avatar: "/team/sayem.webp" },
    { name: "Sajjad", role: "Backend Engineer / DevOps", email: "sajjad@advotech.ai", avatar: "/team/sajjad.webp" },
    { name: "Medha", role: "Legal Research & Compliance", email: "medha@advotech.ai", avatar: "/team/medha.webp" },
    { name: "Jibon", role: "Go-To-Market / Partnerships", email: "jibon@advotech.ai", avatar: "/team/jibon.webp" },
  ],

  tech: {
    product_overview: {
      headline: "System Overview",
      desc: "A robust API infrastructure providing grounded bilingual legal chat, PDF contract risk analysis, SSLCommerz-based micro-billing, and a human-in-the-loop advocate verification marketplace. Built for low-latency, scalable execution across the Global South.",
      users: ["Freelancers & gig workers reviewing employment contracts", "SMEs auditing commercial leases and vendor agreements", "Corporate HR teams enforcing Labour Act compliance", "Certified advocates managing client inquiry pipelines", "Law students conducting statutory research"]
    },
    architecture: {
      headline: "System Architecture",
      layers: [
        { label: "Client Layer", items: ["Next.js 15 (App Router)", "Tailwind CSS", "SSE streaming"], icon: "🖥" },
        { label: "API Gateway", items: ["FastAPI (Async)", "JWT Auth Middleware", "RBAC Router Guards"], icon: "⚙" },
        { label: "AI Services", items: ["LangGraph Orchestration", "Qdrant Vector DB", "Groq LLM / GLM Fallback"], icon: "🤖" },
        { label: "Data Layer", items: ["Supabase PostgreSQL", "Metric Events Table", "Credit Ledger"], icon: "🗄" },
        { label: "Infra", items: ["Render (Backend)", "Coolify VPS", "Vercel (Frontend)"], icon: "☁" },
      ],
      flow: "Browser → Next.js SSR → FastAPI (Auth/JWT) → LangGraph → Qdrant → Groq LLM → Streamed Response → Browser"
    },
    data_flow: {
      headline: "Data Flow Diagram",
      steps: [
        { step: "1. Input", desc: "User submits query or PDF via browser. PII auto-redacted client-side before upload.", icon: "📥" },
        { step: "2. Routing", desc: "FastAPI router validates JWT, checks RBAC role, deducts credits from ledger.", icon: "🔀" },
        { step: "3. Retrieval", desc: "LangGraph triggers 2-path hybrid retriever: Act Alias index + Qdrant semantic vector search.", icon: "🔍" },
        { step: "4. AI Inference", desc: "Groq LLM generates response grounded exclusively on retrieved statutory chunks (no parametric hallucination).", icon: "🤖" },
        { step: "5. Guard Layer", desc: "Deterministic safety filter blocks foreign-jurisdiction section references and unverifiable citations.", icon: "🛡" },
        { step: "6. Output", desc: "Streamed response delivered with hard-linked citations. Audit memos stored in Supabase.", icon: "📤" },
        { step: "7. Feedback", desc: "metric_events table logs latency, hit@k, accuracy scores for continuous benchmarking.", icon: "📊" },
      ]
    },
    feature_matrix: [
      { name: "AI Contract Audit (PDF)", status: "LIVE", note: "91.7% accuracy, 100% recall" },
      { name: "Grounded Legal Chat (RAG)", status: "LIVE", note: "3,547 acts, MRR 0.864" },
      { name: "Credits & Payments (SSLCommerz)", status: "LIVE", note: "Ledger + IPN Callbacks" },
      { name: "HITL Lawyer Marketplace", status: "BETA", note: "SLA cron + inquiry flow active" },
      { name: "Legal MCP Server (FastMCP)", status: "BETA", note: "3 tools active, SSE resilient" },
      { name: "Enterprise Workspaces", status: "PLANNED", note: "Q1 2027: Quotas, Playbooks" },
      { name: "Multi-jurisdiction Support", status: "PLANNED", note: "India/Pakistan Q2 2027" },
      { name: "Dispute Prep AI Agent", status: "PLANNED", note: "Mid-2027 roadmap" },
    ],
    tech_stack: [
      { layer: "Frontend", items: "Next.js 15 (App Router), TypeScript, Tailwind CSS, Fraunces + Karla fonts" },
      { layer: "Backend", items: "FastAPI (Async), SQLAlchemy 2, Pydantic v2, LangGraph" },
      { layer: "AI / Inference", items: "Groq LLM (Primary) → GLM Fallback, Local gemma3n, e5-small embeddings" },
      { layer: "Vector DB", items: "Qdrant Cloud — 35,000+ act-section vectors, hybrid BM25 + dense search" },
      { layer: "Relational DB", items: "Supabase PostgreSQL — users, memos, credit_ledger, metric_events" },
      { layer: "Payments", items: "SSLCommerz (Cards / bKash / Nagad), Internal Credit Ledger with IPN callbacks" },
      { layer: "Infrastructure", items: "Render (Backend API), Coolify VPS (MCP Server), Vercel (Frontend)" },
      { layer: "Monitoring", items: "Native benchmark suite → metric_events, Sentry (planned)" },
    ],
    api_docs: [
      { group: "Auth", base: "/api/auth", method: "POST", endpoint: "/request-otp", auth: "Public", desc: "Request OTP to phone number for passwordless login" },
      { group: "Auth", base: "/api/auth", method: "POST", endpoint: "/verify-otp", auth: "Public", desc: "Verify OTP, receive JWT access token" },
      { group: "Auth", base: "/api/auth", method: "POST", endpoint: "/logout", auth: "JWT", desc: "Revoke token_version, invalidate session" },
      { group: "Chat", base: "/api/chat", method: "POST", endpoint: "/ask", auth: "JWT", desc: "Grounded bilingual legal Q&A with statutory citations (SSE stream)" },
      { group: "Chat", base: "/api/chat", method: "GET", endpoint: "/history", auth: "JWT", desc: "Retrieve paginated conversation history" },
      { group: "Audit", base: "/api/contract", method: "POST", endpoint: "/upload", auth: "JWT", desc: "Upload PDF for 30s AI contract risk audit" },
      { group: "Audit", base: "/api/contract", method: "GET", endpoint: "/memos", auth: "JWT", desc: "List past audit memos for authenticated user" },
      { group: "Payments", base: "/api/payments", method: "POST", endpoint: "/initiate", auth: "JWT", desc: "Initiate SSLCommerz payment session for credit top-up" },
      { group: "Payments", base: "/api/payments", method: "POST", endpoint: "/callback", auth: "HMAC", desc: "IPN callback handler — credit ledger update on success" },
      { group: "MCP", base: "/mcp", method: "SSE", endpoint: "/tools/query_law", auth: "API Key", desc: "FastMCP tool: semantic legal statute query" },
    ],
    data_layer: {
      headline: "Data & Privacy Architecture",
      points: [
        "Ingestion: 35,000+ codified acts parsed from bdlaws.minlaw.gov.bd via custom ETL pipeline into Qdrant e5-small dense vectors + BM25 sparse index.",
        "Privacy: Client-side PII scrubbing (regex + NLP) removes mobile numbers, NID, company names, and financial figures before any document reaches cloud inference endpoints.",
        "Storage: Supabase PostgreSQL manages relational data — users, audit_memos, credit_ledger, and metric_events for benchmarking.",
        "Vector Store: Qdrant Cloud stores 35K+ act-section embeddings with payload metadata (act_id, section_number, amendment_year).",
        "Retention: Audit memos are user-owned; deletion requests cascade across all tables. No data sold to third parties."
      ]
    },
    ai_layer: {
      headline: "AI & RAG Architecture",
      points: [
        "Retrieval: 2-path hybrid retriever — Path A: Act Alias Dictionary (3,547 acts) for exact section lookup; Path B: Qdrant dense+sparse for semantic proximity search.",
        "Orchestration: LangGraph state machine manages retrieval → guard → generation → citation-linking pipeline with retry and fallback logic.",
        "Models: Groq LLM primary for sub-second inference; GLM as failover; Local gemma3n for offline benchmark validation.",
        "Guards: Deterministic foreign-jurisdiction router explicitly intercepts hallucinated section references (e.g. citing Indian IPC in a Bangladesh query) and routes to safe error response.",
        "Explainability: Every response carries hard-linked statutory citations with act name, section number, and amendment year. No generation proceeds without grounding evidence."
      ]
    },
    roadmap: {
      short: { label: "Now — Q1 2027", items: ["OCR Table-PDF parsing fixes for complex contract layouts", "RAG edge-case patching for rare citation formats", "180s product video for investor and judge showcase", "HITL lawyer SLA enforcement (3-hour offer window cron)"] },
      mid: { label: "Q1 — Q3 2027", items: ["Corporate compliance playbooks with custom rule injection", "MCP server public licensing for AI agent developers", "Dispute preparation AI agent (pre-litigation memo generation)", "Shared audit workspaces for enterprise legal teams"] },
      long: { label: "Q3 2027+", items: ["India jurisdiction: Companies Act 2013 + IPC ingestion", "Pakistan jurisdiction: Contract Act + Labour Law ingestion", "UAE jurisdiction: DIFC + ADGM common law layer", "API marketplace for regional legaltech integrations"] },
    },
    performance: {
      headline: "Performance & Scalability",
      metrics: [
        { label: "E2E Audit Latency", value: "~30s", note: "15-page PDF → full risk report" },
        { label: "RAG Chat Latency", value: "<3s", note: "Bilingual query → cited response" },
        { label: "API Uptime", value: "99.2%", note: "Render managed infra" },
        { label: "Test Suite", value: "73/73", note: "100% pass rate on CI/CD" },
        { label: "Audit Accuracy", value: "91.7%", note: "33/36 benchmark provisions matched" },
        { label: "Hallucination Block", value: "88.9%", note: "Deterministic guard layer" },
      ],
      strategies: ["Async FastAPI with connection pooling for concurrent audit requests.", "Lazy-loaded documentation and image assets for fast initial page load.", "Qdrant client reuse across request lifecycle (singleton pattern).", "SSE streaming delivers partial results to user within 2s of audit start."]
    },
    security: {
      headline: "Security & RBAC",
      points: [
        "Authentication: Passwordless OTP via SMS; JWT with token_version field — any server-side revocation immediately invalidates active sessions.",
        "RBAC: Three-tier role system — GENERAL (chat + audit), LAWYER (inquiry dashboard + client files), ENTERPRISE (playbooks + team quotas). All enforced at FastAPI router level.",
        "Data Protection: BOLA-hardened file downloads (user_id ownership check before every file serve), traversal-proof temp file naming, SQL injection guards via SQLAlchemy ORM.",
        "PII: Client-side redaction before upload. No raw personal data in LLM context. Audit logs anonymized.",
        "Payments: SSLCommerz HMAC signature verification on every IPN callback. No card data stored server-side."
      ]
    },
    analytics: {
      headline: "Analytics & KPIs",
      kpis: [
        { label: "Audit Accuracy", value: "91.7%", sub: "33/36 benchmark provisions" },
        { label: "Act Hit@K", value: "93.9%", sub: "46/55 RAG retrievals effective" },
        { label: "Hallucination Block Rate", value: "88.9%", sub: "Deterministic guard layer" },
        { label: "MRR (RAG)", value: "0.864", sub: "Mean Reciprocal Rank" },
        { label: "Active Users", value: "44", sub: "Live on production" },
        { label: "Total Audits", value: "33", sub: "Contracts processed" },
      ]
    },
    changelog: [
      { v: "v1.4.0", date: "2026-11-18", changes: "Team images, /docs live module with full whitepaper, access control system." },
      { v: "v1.3.0", date: "2026-11-14", changes: "Live /docs module, MCP tool-call retry ladder, case-law search triggers." },
      { v: "v1.2.0", date: "2026-11-12", changes: "Solve-batch guards, injection hardening, OTP masking, BOLA checks." },
      { v: "v1.1.0", date: "2026-11-11", changes: "Rule verification layer, adaptive Qdrant threshold, benchmark harness." },
      { v: "v1.0.0", date: "2026-10-26", changes: "Initial production release. Auth, Chat, Audit, Payments live." },
    ]
  }
};

// ==========================================
// 🎨 GLOBAL STYLES (Hearth Theme — unchanged)
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

  /* Unavailable Gate */
  .gate-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; text-align: center; padding: 2rem; }
  .gate-code { font-size: 5rem; font-weight: 800; color: var(--border-color); font-family: var(--font-fraunces), serif; line-height: 1; }
  .gate-title { font-family: var(--font-fraunces), serif; font-size: 2rem; color: var(--text-dark); margin: 0; }
  .gate-desc { font-size: 1rem; color: var(--text-body); max-width: 420px; line-height: 1.6; margin: 0; }
  .gate-admin-link { font-size: 0.8rem; color: var(--accent-clay); cursor: pointer; text-decoration: underline; }

  /* Admin Toolbar */
  .admin-toolbar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--admin-color); color: white; padding: 0.75rem 2rem; z-index: 200; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 600; gap: 1rem; flex-wrap: wrap; }
  .admin-toolbar-left { display: flex; align-items: center; gap: 1rem; }
  .admin-status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 0.4rem; }
  .admin-status-dot.on { background: #4ade80; box-shadow: 0 0 6px #4ade80; }
  .admin-status-dot.off { background: #f87171; box-shadow: 0 0 6px #f87171; }
  .btn-admin { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 0.4rem 0.9rem; cursor: pointer; border-radius: 4px; font-size: 0.8rem; font-weight: 600; transition: 0.2s; }
  .btn-admin:hover { background: rgba(255,255,255,0.25); }
  .btn-admin.danger { background: rgba(196, 91, 60, 0.4); border-color: rgba(196, 91, 60, 0.6); }
  .btn-admin.danger:hover { background: rgba(196, 91, 60, 0.6); }
  .admin-schedule { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .admin-schedule label { font-size: 0.75rem; opacity: 0.8; }
  .admin-schedule input[type="datetime-local"] { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.3rem 0.5rem; border-radius: 4px; font-size: 0.75rem; color-scheme: dark; }

  /* Admin PIN Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .modal-box { background: var(--bg-alt); border: 1px solid var(--border-color); border-radius: 12px; padding: 2.5rem; width: 100%; max-width: 380px; }
  .modal-title { font-family: var(--font-fraunces), serif; font-size: 1.5rem; color: var(--text-dark); margin: 0 0 0.5rem 0; }
  .modal-sub { font-size: 0.9rem; color: var(--text-body); margin: 0 0 1.5rem 0; }
  .modal-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-main); font-size: 1rem; color: var(--text-dark); margin-bottom: 1rem; }
  .modal-error { color: var(--accent-clay); font-size: 0.85rem; margin-bottom: 1rem; }
  .modal-actions { display: flex; gap: 0.75rem; }
  .modal-btn { flex: 1; padding: 0.75rem; border-radius: 6px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; }
  .modal-btn.primary { background: #1A1A1A; color: white; }
  .modal-btn.secondary { background: transparent; border: 1px solid var(--border-color); color: var(--text-body); }

  /* Layout Base */
  .sidebar { position: sticky; top: 0; height: 100vh; width: 280px; background: var(--bg-alt); border-right: 1px solid var(--border-color); padding: 2rem 1.5rem; overflow-y: auto; flex-shrink: 0; }
  .main-content { flex-grow: 1; width: calc(100% - 280px); }
  .brand { font-family: var(--font-fraunces), serif; font-size: 1.25rem; color: var(--text-dark); margin-bottom: 2rem; display: block; text-decoration: none; }
  .search-box { width: 100%; padding: 0.75rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 2rem; font-family: inherit; font-size: 0.85rem; }
  .toc-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-clay); margin: 1.5rem 0 0.75rem 0; font-weight: 700; }
  .toc-link { display: block; font-size: 0.85rem; color: var(--text-body); text-decoration: none; margin-bottom: 0.6rem; padding: 0.25rem 0.5rem; border-radius: 3px; transition: all 0.2s; }
  .toc-link:hover { color: var(--accent-clay); }
  .toc-link.active { color: var(--accent-clay); background: var(--bg-accent); font-weight: 700; }
  .topbar { padding: 1.25rem 4vw; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; background: rgba(251, 244, 236, 0.95); position: sticky; top: 0; z-index: 50; backdrop-filter: blur(8px); }
  .topbar-left { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; }
  .stat-pill { font-size: 0.8rem; color: var(--text-body); display: flex; align-items: center; gap: 0.4rem; }
  .stat-pill strong { color: var(--text-dark); }
  .stat-live-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; display: inline-block; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  .topbar-right { display: flex; gap: 0.75rem; }
  .btn { border: 1px solid var(--border-color); background: transparent; padding: 0.5rem 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; color: var(--text-body); font-weight: 600; border-radius: 3px; transition: 0.2s; }
  .btn:hover { background: var(--bg-accent); }
  .btn.primary-btn { background: #1A1A1A; color: white; border-color: #1A1A1A; }
  .btn.primary-btn:hover { background: #333; }

  /* Typography & Sections */
  .doc-section { padding: 5rem 4vw; border-bottom: 1px solid var(--border-color); }
  .doc-section.alt { background-color: var(--bg-alt); }
  .doc-inner { max-width: 900px; margin: 0 auto; position: relative; }
  .eyebrow { color: var(--accent-clay); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 1rem; display: block; }
  .headline { font-family: var(--font-fraunces), serif; font-size: clamp(2rem, 4vw, 3.5rem); color: var(--text-dark); line-height: 1.1; margin: 0 0 2.5rem 0; }
  .h2-section { font-family: var(--font-fraunces), serif; font-size: clamp(1.4rem, 2.5vw, 2rem); color: var(--text-dark); line-height: 1.2; margin: 0 0 1.5rem 0; }
  .paragraph { font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem; }
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem; }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 2rem; }
  .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; }
  .card-line { border-top: 1px solid var(--border-color); padding-top: 1rem; }

  /* Stats Hero */
  .stats-bar { display: flex; gap: 3rem; margin-top: 2rem; flex-wrap: wrap; }
  .stat-item { display: flex; flex-direction: column; gap: 0.25rem; }
  .stat-num { font-family: var(--font-fraunces), serif; font-size: 2.5rem; color: var(--text-dark); line-height: 1; }
  .stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-clay); font-weight: 700; }

  /* Product Cards */
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

  /* Demo UI */
  .demo-wrap { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
  .demo-top-bar { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
  .demo-pill { display: flex; align-items: center; gap: 0.5rem; background: var(--bg-alt); border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600; }
  .demo-pill-live { background: var(--green-light); color: var(--green-dark); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.65rem; text-transform: uppercase; }
  .demo-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .demo-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-body); }
  .demo-guarantee { color: var(--green-dark); font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem; }
  .demo-cats { display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; }
  .demo-cat { background: var(--bg-main); border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.8rem; color: var(--text-body); cursor: pointer; }
  .demo-cat.active { background: #1A1A1A; color: white; border-color: #1A1A1A; }
  .demo-cat span { opacity: 0.7; font-size: 0.7rem; margin-left: 0.3rem; }
  .demo-chat-area { background: var(--bg-main); border-radius: 12px; padding: 2rem; display: flex; flex-direction: column; gap: 2rem; }
  .msg-user-wrap { display: flex; justify-content: flex-end; gap: 1rem; }
  .msg-user { background: #1A1A1A; color: white; padding: 1.25rem; border-radius: 12px 0 12px 12px; max-width: 80%; font-size: 0.95rem; line-height: 1.6; }
  .avatar-u { width: 32px; height: 32px; background: var(--border-color); color: var(--text-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
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
  .demo-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem; flex-wrap: wrap; gap: 1rem; }
  .demo-footer-text { font-size: 0.9rem; color: var(--text-body); }

  /* Architecture */
  .arch-flow { background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem 2rem; margin-bottom: 2rem; font-size: 0.9rem; color: var(--text-dark); line-height: 2; letter-spacing: 0.01em; word-break: break-word; }
  .arch-layers { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
  .arch-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem; }
  .arch-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
  .arch-label { font-weight: 700; font-size: 0.85rem; color: var(--text-dark); margin-bottom: 0.5rem; }
  .arch-items { list-style: none; padding: 0; margin: 0; }
  .arch-items li { font-size: 0.8rem; color: var(--text-body); padding: 0.2rem 0; border-bottom: 1px solid var(--border-color); }
  .arch-items li:last-child { border-bottom: none; }

  /* Data Flow */
  .flow-steps { display: flex; flex-direction: column; gap: 0; }
  .flow-step { display: flex; gap: 1.5rem; align-items: flex-start; padding: 1.25rem 0; border-bottom: 1px solid var(--border-color); }
  .flow-step:last-child { border-bottom: none; }
  .flow-icon { font-size: 1.5rem; width: 2.5rem; flex-shrink: 0; text-align: center; }
  .flow-step-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: var(--accent-clay); margin-bottom: 0.25rem; }
  .flow-step-desc { font-size: 0.95rem; color: var(--text-body); line-height: 1.6; }

  /* Team */
  .team-card { border-top: 2px solid var(--border-color); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .team-img-wrap { width: 100%; aspect-ratio: 1/1; overflow: hidden; background: var(--bg-accent); border-radius: 4px; }
  .team-img { width: 100%; height: 100%; object-fit: cover; object-position: top center; filter: grayscale(15%); transition: filter 0.3s; display: block; }
  .team-card:hover .team-img { filter: grayscale(0%); }
  .team-name { font-family: var(--font-fraunces), serif; font-size: 1.1rem; color: var(--text-dark); margin: 0; }
  .team-role { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-clay); margin: 0; font-weight: 700; }
  .team-email { font-size: 0.82rem; opacity: 0.75; margin: 0; }

  /* Tables & Badges */
  .matrix { width: 100%; border-collapse: collapse; margin-top: 2rem; font-size: 0.95rem; }
  .matrix th, .matrix td { padding: 1rem 0.75rem; border-bottom: 1px solid var(--border-color); text-align: left; }
  .matrix th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-clay); font-weight: 700; }
  .badge { display: inline-block; padding: 0.25rem 0.6rem; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 3px; }
  .badge-live { background: #E2F0E9; color: #1E5C40; }
  .badge-planned { background: #F1F1F4; color: #5C4F43; }
  .badge-beta { background: #FDF3E1; color: #8F5A0A; }
  .badge-method { background: var(--bg-accent); color: var(--accent-clay); font-size: 0.6rem; padding: 0.15rem 0.4rem; border-radius: 3px; font-weight: 700; }
  .badge-auth { background: #EEF2FF; color: #3730A3; font-size: 0.6rem; padding: 0.15rem 0.4rem; border-radius: 3px; font-weight: 700; }

  /* Roadmap */
  .roadmap-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2rem; margin-top: 2rem; }
  .roadmap-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 10px; padding: 1.75rem; }
  .roadmap-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; color: var(--accent-clay); margin-bottom: 0.75rem; }
  .roadmap-title { font-family: var(--font-fraunces), serif; font-size: 1.1rem; color: var(--text-dark); margin: 0 0 1rem 0; }
  .roadmap-items { list-style: none; padding: 0; margin: 0; }
  .roadmap-items li { font-size: 0.88rem; color: var(--text-body); padding: 0.4rem 0; border-bottom: 1px solid var(--border-color); display: flex; gap: 0.5rem; }
  .roadmap-items li::before { content: "→"; color: var(--accent-clay); flex-shrink: 0; }
  .roadmap-items li:last-child { border-bottom: none; }

  /* KPI Cards */
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
  .kpi-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; text-align: center; }
  .kpi-value { font-family: var(--font-fraunces), serif; font-size: 2rem; color: var(--text-dark); line-height: 1; margin-bottom: 0.4rem; }
  .kpi-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: var(--accent-clay); margin-bottom: 0.4rem; }
  .kpi-sub { font-size: 0.75rem; color: var(--text-body); opacity: 0.75; }

  /* Performance Metrics */
  .perf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
  .perf-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem; }
  .perf-value { font-family: var(--font-fraunces), serif; font-size: 1.75rem; color: var(--text-dark); margin: 0 0 0.25rem 0; }
  .perf-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-clay); margin: 0 0 0.25rem 0; }
  .perf-note { font-size: 0.8rem; color: var(--text-body); opacity: 0.75; margin: 0; }

  /* Security Points */
  .security-list { list-style: none; padding: 0; margin: 0; }
  .security-list li { padding: 1rem 0; border-bottom: 1px solid var(--border-color); font-size: 0.95rem; line-height: 1.6; color: var(--text-body); display: flex; gap: 0.75rem; }
  .security-list li::before { content: "🔒"; flex-shrink: 0; }
  .security-list li:last-child { border-bottom: none; }

  /* Changelog */
  .changelog-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
  .changelog-table th, .changelog-table td { padding: 1rem 0.75rem; border-bottom: 1px solid var(--border-color); text-align: left; font-size: 0.9rem; }
  .changelog-table th { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-clay); font-weight: 700; }
  .version-badge { font-family: monospace; background: var(--bg-accent); color: var(--accent-clay); padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.85rem; font-weight: 700; }

  /* Section divider */
  .section-divider { height: 8px; background: var(--border-color); }

  /* Search highlight */
  .search-highlight { background: #fef9c3; border-radius: 2px; }

  /* GTM Cards */
  .gtm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
  .gtm-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 10px; padding: 1.75rem; }
  .gtm-phase { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; color: var(--accent-clay); margin-bottom: 0.5rem; }
  .gtm-desc { font-size: 0.95rem; color: var(--text-body); line-height: 1.6; margin: 0; }

  /* Overview user cards */
  .user-list { list-style: none; padding: 0; margin: 1.5rem 0 0 0; display: flex; flex-direction: column; gap: 0.75rem; }
  .user-list li { display: flex; gap: 0.75rem; align-items: flex-start; font-size: 0.95rem; line-height: 1.5; }
  .user-list li::before { content: "→"; color: var(--accent-clay); flex-shrink: 0; font-weight: 700; }

  @media (max-width: 900px) {
    .hearth-theme { flex-direction: column; }
    .sidebar { width: 100%; height: auto; position: static; padding: 1.5rem; border-right: none; border-bottom: 1px solid var(--border-color); }
    .main-content { width: 100%; }
    .grounding-text { flex-direction: column; gap: 0.5rem; }
    .grounding-cite { width: 100%; }
    .demo-footer { flex-direction: column; gap: 1rem; align-items: flex-start; }
    .admin-toolbar { flex-direction: column; align-items: flex-start; padding: 1rem; gap: 0.75rem; }
    .admin-schedule { flex-direction: column; gap: 0.5rem; }
    .topbar-left { gap: 0.75rem; }
  }

  @media print {
    .sidebar, .topbar, .admin-toolbar, .modal-overlay, .btn { display: none !important; }
    .main-content { width: 100%; }
    .doc-section { padding: 2rem 1rem; break-inside: avoid; }
    .hearth-theme { display: block; }
  }
`;

// ==========================================
// 🧩 BASE COMPONENTS
// ==========================================
const Section = ({ id, eyebrow, headline, children, altBg }: {
  id?: string; eyebrow: string; headline?: string; children: React.ReactNode; altBg?: boolean;
}) => (
  <section id={id} className={`doc-section${altBg ? " alt" : ""}`}>
    <div className="doc-inner">
      <span className="eyebrow">{eyebrow}</span>
      {headline && <h2 className="headline">{headline}</h2>}
      {children}
    </div>
  </section>
);

const PointsGrid = ({ points }: { points: string[] }) => (
  <div className="grid-2">
    {points.map((p, i) => <div key={i} className="card-line paragraph">{p}</div>)}
  </div>
);

const PointsList = ({ points }: { points: string[] }) => (
  <ul className="security-list">
    {points.map((p, i) => <li key={i}>{p}</li>)}
  </ul>
);

// ==========================================
// 🚫 NOT AVAILABLE GATE
// ==========================================
const NotAvailablePage = ({ onAdminClick }: { onAdminClick: () => void }) => (
  <div className={`hearth-theme ${fraunces.variable} ${karla.variable}`}>
    <style dangerouslySetInnerHTML={{ __html: STYLES }} />
    <div className="gate-wrap" style={{ width: "100%" }}>
      <div className="gate-code">403</div>
      <h1 className="gate-title">Documentation Not Available</h1>
      <p className="gate-desc">
        This documentation is not currently publicly accessible. It may be scheduled for a future window or restricted by the administrator.
      </p>
      <span className="gate-admin-link" onClick={onAdminClick}>Administrator access →</span>
    </div>
  </div>
);

// ==========================================
// 🚀 MAIN PAGE COMPONENT
// ==========================================
export default function DocsSystem() {
  const d = DOCS_DATA;

  // --- Access Control State ---
  const [docsPublic, setDocsPublic] = useState(true);
  const [scheduleStart, setScheduleStart] = useState(ACCESS_CONFIG.defaultStart);
  const [scheduleEnd, setScheduleEnd] = useState(ACCESS_CONFIG.defaultEnd);

  // --- Admin Auth State ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // --- UI State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("top");
  const [copied, setCopied] = useState(false);

  // --- Intersection Observer for active TOC ---
  useEffect(() => {
    const sections = document.querySelectorAll("[data-section]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute("data-section") || "");
          }
        });
      },
      { threshold: 0.2, rootMargin: "-100px 0px -60% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // --- Check schedule-based visibility ---
  const isWithinSchedule = () => {
    const now = new Date();
    const start = new Date(scheduleStart);
    const end = new Date(scheduleEnd);
    return now >= start && now <= end;
  };

  // --- Admin PIN verify ---
  const handlePinSubmit = () => {
    if (pinInput === ACCESS_CONFIG.adminPin) {
      setIsAdminMode(true);
      setShowPinModal(false);
      setPinInput("");
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
  };

  // --- Export PDF ---
  const handlePrint = () => window.print();

  // --- Copy shareable link ---
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // --- Export Markdown ---
  const handleMarkdownExport = () => {
    const md = `# ${d.meta.company} — Technical Documentation\n\n**Version:** ${d.meta.version} | **Last Updated:** ${d.meta.last_updated}\n\n## Tagline\n${d.meta.tagline}\n\n## One-Liner\n${d.meta.one_liner}\n\n## Problem\n${d.pitch.problem.headline}\n${d.pitch.problem.points.map(p => `- ${p}`).join("\n")}\n\n## Solution\n${d.pitch.solution.headline}\n\n## Team\n${d.team.map(m => `- **${m.name}** — ${m.role} (${m.email})`).join("\n")}\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "advotech-docs.md"; a.click();
    URL.revokeObjectURL(url);
  };

  // --- Determine if docs should show ---
  const shouldShow = isAdminMode || docsPublic || isWithinSchedule();

  // --- Gate page ---
  if (!shouldShow) {
    return <NotAvailablePage onAdminClick={() => setShowPinModal(true)} />;
  }

  const tocActive = (id: string) => activeSection === id ? "toc-link active" : "toc-link";

  return (
    <div className={`hearth-theme ${fraunces.variable} ${karla.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* 🔐 PIN MODAL */}
      {showPinModal && (
        <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Admin Access</h2>
            <p className="modal-sub">Enter admin PIN to manage documentation visibility and scheduling.</p>
            <input
              type="password"
              className="modal-input"
              placeholder="Enter PIN..."
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              autoFocus
            />
            {pinError && <p className="modal-error">{pinError}</p>}
            <div className="modal-actions">
              <button className="modal-btn primary" onClick={handlePinSubmit}>Enter</button>
              <button className="modal-btn secondary" onClick={() => { setShowPinModal(false); setPinInput(""); setPinError(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 🛠 ADMIN TOOLBAR */}
      {isAdminMode && (
        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <div>
              <span className={`admin-status-dot ${docsPublic ? "on" : "off"}`}></span>
              Docs: <strong>{docsPublic ? "PUBLIC" : "PRIVATE"}</strong> — {d.meta.version}
            </div>
            <button
              className={`btn-admin ${docsPublic ? "danger" : ""}`}
              onClick={() => setDocsPublic(!docsPublic)}
            >
              {docsPublic ? "⏸ Set Private" : "▶ Set Public"}
            </button>
          </div>
          <div className="admin-schedule">
            <label>Schedule Window:</label>
            <input type="datetime-local" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} />
            <span style={{ opacity: 0.6, fontSize: "0.75rem" }}>→</span>
            <input type="datetime-local" value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)} />
          </div>
          <div>
            <button className="btn-admin" onClick={() => setIsAdminMode(false)}>✕ Exit Admin</button>
          </div>
        </div>
      )}

      {/* 🧭 SIDEBAR */}
      <aside className="sidebar">
        <a href="#top" className="brand">{d.meta.company} Docs</a>
        <input
          type="text"
          className="search-box"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="toc-title">Pitch Deck</div>
        <a href="#top" className={tocActive("top")}>Overview</a>
        <a href="#problem" className={tocActive("problem")}>01 — Problem</a>
        <a href="#solution" className={tocActive("solution")}>02 — Solution</a>
        <a href="#why-now" className={tocActive("why-now")}>03 — Why Now</a>
        <a href="#demo" className={tocActive("demo")}>04 — Product Demo</a>
        <a href="#market" className={tocActive("market")}>05 — Market</a>
        <a href="#business-model" className={tocActive("business-model")}>06 — Business Model</a>
        <a href="#traction" className={tocActive("traction")}>07 — Traction</a>
        <a href="#competition" className={tocActive("competition")}>08 — Competition</a>
        <a href="#advantage" className={tocActive("advantage")}>09 — Advantage</a>
        <a href="#gtm" className={tocActive("gtm")}>10 — Go-To-Market</a>
        <a href="#vision" className={tocActive("vision")}>11 — Vision</a>
        <a href="#team" className={tocActive("team")}>12 — The Team</a>

        <div className="toc-title">Whitepaper</div>
        <a href="#overview" className={tocActive("overview")}>A — Product Overview</a>
        <a href="#architecture" className={tocActive("architecture")}>B — Architecture</a>
        <a href="#data-flow" className={tocActive("data-flow")}>C — Data Flow</a>
        <a href="#features" className={tocActive("features")}>D — Feature Matrix</a>
        <a href="#tech-stack" className={tocActive("tech-stack")}>E — Tech Stack</a>
        <a href="#api-docs" className={tocActive("api-docs")}>F — API Reference</a>
        <a href="#data-layer" className={tocActive("data-layer")}>G — Data Layer</a>
        <a href="#ai-layer" className={tocActive("ai-layer")}>H — AI & RAG</a>
        <a href="#roadmap" className={tocActive("roadmap")}>I — Roadmap</a>
        <a href="#performance" className={tocActive("performance")}>J — Performance</a>
        <a href="#security" className={tocActive("security")}>K — Security</a>
        <a href="#analytics" className={tocActive("analytics")}>L — Analytics</a>
        <a href="#changelog" className={tocActive("changelog")}>M — Changelog</a>
      </aside>

      {/* 📄 MAIN CONTENT */}
      <main className="main-content" style={{ paddingBottom: isAdminMode ? "5rem" : "0" }}>

        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="stat-pill"><span className="stat-live-dot"></span> Live System</span>
            <span className="stat-pill">👥 <strong>{d.stats.total_users}</strong> Users</span>
            <span className="stat-pill">📋 <strong>{d.stats.total_audits}</strong> Audits</span>
            <span className="stat-pill">📚 <strong>{d.stats.statutes_indexed.toLocaleString()}+</strong> Statutes</span>
            <span className="stat-pill">⚡ <strong>{d.stats.avg_turnaround}</strong> Avg Audit</span>
          </div>
          <div className="topbar-right">
            {!isAdminMode && (
              <button className="btn" onClick={() => setShowPinModal(true)}>⚙ Admin</button>
            )}
            <button className="btn" onClick={handleCopyLink}>{copied ? "✓ Copied!" : "🔗 Share"}</button>
            <button className="btn" onClick={handleMarkdownExport}>↓ MD</button>
            <button className="btn primary-btn" onClick={handlePrint}>⎙ Export PDF</button>
          </div>
        </div>

        {/* HERO */}
        <div data-section="top">
          <Section eyebrow={`Live Documentation · ${d.meta.version} · Updated ${d.meta.last_updated}`} headline={d.meta.tagline} altBg>
            <p className="paragraph" style={{ borderLeft: "2px solid var(--accent-clay)", paddingLeft: "1.5rem" }}>
              {d.meta.one_liner}
            </p>
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-num">{d.stats.statutes_indexed.toLocaleString()}+</span>
                <span className="stat-label">Statutes Indexed</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">91.7%</span>
                <span className="stat-label">Audit Accuracy</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">73/73</span>
                <span className="stat-label">Test Suite Pass</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{d.stats.avg_turnaround}</span>
                <span className="stat-label">Avg Turnaround</span>
              </div>
            </div>
          </Section>
        </div>

        {/* 01 PROBLEM */}
        <div data-section="problem">
          <Section id="problem" eyebrow="01. The Problem" headline={d.pitch.problem.headline}>
            <PointsGrid points={d.pitch.problem.points} />
          </Section>
        </div>

        {/* 02 SOLUTION */}
        <div data-section="solution">
          <Section id="solution" eyebrow="02. The Solution" headline={d.pitch.solution.headline} altBg>
            <div className="grid-2">
              {d.pitch.solution.products.map((p, i) => (
                <div key={i} className="product-card">
                  <div className="pc-head">
                    <div className="pc-icon">✨</div>
                    <div className={`pc-tag ${p.tagColor}`}>{p.tag}</div>
                  </div>
                  <h3 className="pc-title">{p.title}</h3>
                  <p className="pc-desc">{p.desc}</p>
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
        </div>

        {/* 03 WHY NOW */}
        <div data-section="why-now">
          <Section id="why-now" eyebrow="03. Why Now" headline={d.pitch.why_now.headline}>
            <PointsGrid points={d.pitch.why_now.points} />
          </Section>
        </div>

        {/* 04 DEMO */}
        <div data-section="demo">
          <Section id="demo" eyebrow="04. Product Demo" headline={d.pitch.product_demo.headline} altBg>
            <div className="demo-wrap">
              <div className="demo-top-bar">
                <div className="demo-pill">⚡ 30s Contract Audit <span className="demo-pill-live">Live</span></div>
                <div className="demo-pill" style={{ background: "#1A1A1A", color: "white" }}>💬 Bilingual Copilot <span className="demo-pill-live" style={{ background: "#2d4bf5", color: "white" }}>বাং+EN</span></div>
                <div className="demo-pill">👥 1-Click Test Drives <span className="demo-pill-live" style={{ background: "#f3e8ff", color: "#7e22ce" }}>4 Roles</span></div>
                <div className="demo-pill">📹 Video Showcase <span className="demo-pill-live" style={{ background: "#fee2e2", color: "#b91c1c" }}>180s</span></div>
              </div>
              <div className="demo-header-row">
                <div className="demo-title">Select a Live Query Simulation:</div>
                <div className="demo-guarantee">✓ Zero Hallucination Guarantee</div>
              </div>
              <div className="demo-cats">
                <div className="demo-cat">Tenant Rights <span>(Banglish / Bangla)</span></div>
                <div className="demo-cat">Employment & Tech <span>(English)</span></div>
                <div className="demo-cat active">Commercial Law <span>(Bangla & English)</span></div>
              </div>
              <div className="demo-chat-area">
                <div className="msg-user-wrap">
                  <div className="msg-user">চেক বাউন্স (Dishonour) হলে নেগোশিয়েবল ইনস্ট্রুমেন্টস অ্যাক্টের ১৩৮ ধারায় নোটিশ পাঠানোর নির্দিষ্ট সময়সীমা কতদিন?</div>
                  <div className="avatar-u">U</div>
                </div>
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
                      ১. ব্যাংক থেকে 'Dishonour Memo' পাওয়ার তারিখ থেকে ঠিক ৩০ দিনের মধ্যে ড্রয়ারকে লিখিত সংবিধিবদ্ধ নোটিশ পাঠাতে হবে।<br />
                      ২. নোটিশ প্রাপক নোটিশ প্রাপ্তির তারিখ থেকে ৩০ দিন সময় পাবেন টাকা পরিশোধ করার জন্য (Cure Period)।<br />
                      ৩. এই ৩০ দিনেও টাকা পরিশোধ না হলে, পরবর্তী ৩০ দিনের মধ্যে উপযুক্ত ম্যাজিস্ট্রেট আদালতে ফৌজদারি নালিশ দাখিল করতে হবে।
                    </div>
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
              <div className="demo-footer">
                <div className="demo-footer-text">Ask legal questions in Banglish, Bengali, or English with instant citation verification.</div>
                <button className="pc-btn" style={{ padding: "0.75rem 1.5rem" }}>Launch Live Bilingual Copilot <span>↗</span></button>
              </div>
            </div>
          </Section>
        </div>

        {/* 05 MARKET */}
        <div data-section="market">
          <Section id="market" eyebrow="05. Market Opportunity" headline={d.pitch.market.headline}>
            <PointsGrid points={d.pitch.market.points} />
          </Section>
        </div>

        {/* 06 BUSINESS MODEL */}
        <div data-section="business-model">
          <Section id="business-model" eyebrow="06. Business Model" headline={d.pitch.business_model.headline} altBg>
            <PointsGrid points={d.pitch.business_model.points} />
          </Section>
        </div>

        {/* 07 TRACTION */}
        <div data-section="traction">
          <Section id="traction" eyebrow="07. Traction & Benchmarks" headline={d.pitch.traction.headline}>
            <PointsGrid points={d.pitch.traction.points} />
          </Section>
        </div>

        {/* 08 COMPETITION */}
        <div data-section="competition">
          <Section id="competition" eyebrow="08. Competition" headline={d.pitch.competition.headline} altBg>
            <PointsGrid points={d.pitch.competition.points} />
          </Section>
        </div>

        {/* 09 UNIQUE ADVANTAGE */}
        <div data-section="advantage">
          <Section id="advantage" eyebrow="09. Unique Advantage" headline={d.pitch.unique_advantage.headline}>
            <PointsGrid points={d.pitch.unique_advantage.points} />
          </Section>
        </div>

        {/* 10 GO-TO-MARKET */}
        <div data-section="gtm">
          <Section id="gtm" eyebrow="10. Go-To-Market" headline={d.pitch.go_to_market.headline} altBg>
            <div className="gtm-grid">
              {d.pitch.go_to_market.points.map((point, i) => {
                const [phase, ...rest] = point.split(":");
                return (
                  <div key={i} className="gtm-card">
                    <div className="gtm-phase">{phase}</div>
                    <p className="gtm-desc">{rest.join(":").trim()}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* 11 VISION */}
        <div data-section="vision">
          <Section id="vision" eyebrow="11. Vision" headline={d.pitch.vision.headline}>
            <PointsGrid points={d.pitch.vision.points} />
          </Section>
        </div>

        {/* 12 TEAM */}
        <div data-section="team">
          <Section id="team" eyebrow="12. The Team" headline={d.team_name} altBg>
            <div className="grid-3">
              {d.team.map((member, i) => (
                <div key={i} className="team-card">
                  <div className="team-img-wrap">
                    <img src={member.avatar} alt={member.name} className="team-img" loading="lazy" />
                  </div>
                  <div>
                    <h3 className="team-name">{member.name}</h3>
                    <p className="team-role">{member.role}</p>
                    <p className="team-email">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ——— WHITEPAPER DIVIDER ——— */}
        <div className="section-divider" />

        {/* A — PRODUCT OVERVIEW */}
        <div data-section="overview">
          <Section id="overview" eyebrow="A. Product Overview" headline={d.tech.product_overview.headline} altBg>
            <p className="paragraph">{d.tech.product_overview.desc}</p>
            <h3 className="h2-section" style={{ marginTop: "2rem" }}>Target Users</h3>
            <ul className="user-list">
              {d.tech.product_overview.users.map((u, i) => <li key={i}>{u}</li>)}
            </ul>
          </Section>
        </div>

        {/* B — ARCHITECTURE */}
        <div data-section="architecture">
          <Section id="architecture" eyebrow="B. Architecture Diagram" headline={d.tech.architecture.headline}>
            <div className="arch-flow">
              🌐 Browser (Next.js) → ⚙ FastAPI Gateway (Auth/JWT/RBAC) → 🤖 LangGraph Orchestrator → 🔍 Qdrant Vector Search → 💬 Groq LLM Inference → 🛡 Guard Layer → 📤 SSE Stream → 🌐 Browser
            </div>
            <div className="arch-layers">
              {d.tech.architecture.layers.map((layer, i) => (
                <div key={i} className="arch-card">
                  <div className="arch-icon">{layer.icon}</div>
                  <div className="arch-label">{layer.label}</div>
                  <ul className="arch-items">
                    {layer.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* C — DATA FLOW */}
        <div data-section="data-flow">
          <Section id="data-flow" eyebrow="C. Data Flow Diagram" headline={d.tech.data_flow.headline} altBg>
            <div className="flow-steps">
              {d.tech.data_flow.steps.map((step, i) => (
                <div key={i} className="flow-step">
                  <div className="flow-icon">{step.icon}</div>
                  <div>
                    <div className="flow-step-label">{step.step}</div>
                    <div className="flow-step-desc">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* D — FEATURE MATRIX */}
        <div data-section="features">
          <Section id="features" eyebrow="D. Feature Matrix" headline="Live Synchronized Capabilities">
            <table className="matrix">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th>Status</th>
                  <th>System Notes</th>
                </tr>
              </thead>
              <tbody>
                {d.tech.feature_matrix.map((f, i) => (
                  <tr key={i}>
                    <td><strong>{f.name}</strong></td>
                    <td><span className={`badge badge-${f.status.toLowerCase()}`}>{f.status}</span></td>
                    <td style={{ color: "var(--text-body)", fontSize: "0.9rem" }}>{f.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        {/* E — TECH STACK */}
        <div data-section="tech-stack">
          <Section id="tech-stack" eyebrow="E. Technology Stack" altBg>
            <div className="grid-2">
              {d.tech.tech_stack.map((stack, i) => (
                <div key={i} className="card-line">
                  <span className="eyebrow" style={{ marginBottom: "0.4rem" }}>{stack.layer}</span>
                  <p className="paragraph" style={{ marginBottom: 0 }}>{stack.items}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* F — API REFERENCE */}
        <div data-section="api-docs">
          <Section id="api-docs" eyebrow="F. API Reference" headline="Endpoints & Auth Model">
            <table className="matrix">
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Auth</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {d.tech.api_docs.map((api, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-body)" }}>{api.group}</td>
                    <td><span className="badge-method">{api.method}</span></td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--text-dark)" }}>{api.base}{api.endpoint}</td>
                    <td><span className="badge-auth">{api.auth}</span></td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-body)" }}>{api.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        {/* G — DATA LAYER */}
        <div data-section="data-layer">
          <Section id="data-layer" eyebrow="G. Data Layer" headline={d.tech.data_layer.headline} altBg>
            <PointsList points={d.tech.data_layer.points} />
          </Section>
        </div>

        {/* H — AI LAYER */}
        <div data-section="ai-layer">
          <Section id="ai-layer" eyebrow="H. AI & RAG Architecture" headline={d.tech.ai_layer.headline}>
            <PointsList points={d.tech.ai_layer.points} />
          </Section>
        </div>

        {/* I — ROADMAP */}
        <div data-section="roadmap">
          <Section id="roadmap" eyebrow="I. Product Roadmap" headline={d.tech.roadmap.short.label + " → " + d.tech.roadmap.long.label} altBg>
            <div className="roadmap-grid">
              {[
                { phase: "Short-Term", ...d.tech.roadmap.short },
                { phase: "Mid-Term", ...d.tech.roadmap.mid },
                { phase: "Long-Term", ...d.tech.roadmap.long },
              ].map((rm, i) => (
                <div key={i} className="roadmap-card">
                  <div className="roadmap-label">{rm.phase}</div>
                  <h3 className="roadmap-title">{rm.label}</h3>
                  <ul className="roadmap-items">
                    {rm.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* J — PERFORMANCE */}
        <div data-section="performance">
          <Section id="performance" eyebrow="J. Performance & Scalability" headline={d.tech.performance.headline}>
            <div className="perf-grid">
              {d.tech.performance.metrics.map((m, i) => (
                <div key={i} className="perf-card">
                  <p className="perf-value">{m.value}</p>
                  <p className="perf-label">{m.label}</p>
                  <p className="perf-note">{m.note}</p>
                </div>
              ))}
            </div>
            <ul className="security-list">
              {d.tech.performance.strategies.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </Section>
        </div>

        {/* K — SECURITY */}
        <div data-section="security">
          <Section id="security" eyebrow="K. Security & RBAC" headline={d.tech.security.headline} altBg>
            <PointsList points={d.tech.security.points} />
          </Section>
        </div>

        {/* L — ANALYTICS */}
        <div data-section="analytics">
          <Section id="analytics" eyebrow="L. Analytics & KPIs" headline={d.tech.analytics.headline}>
            <div className="kpi-grid">
              {d.tech.analytics.kpis.map((kpi, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-value">{kpi.value}</div>
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-sub">{kpi.sub}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* M — CHANGELOG */}
        <div data-section="changelog">
          <Section id="changelog" eyebrow="M. Changelog" headline="Version History" altBg>
            <table className="changelog-table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Date</th>
                  <th>Changes</th>
                </tr>
              </thead>
              <tbody>
                {d.tech.changelog.map((entry, i) => (
                  <tr key={i}>
                    <td><span className="version-badge">{entry.v}</span></td>
                    <td style={{ color: "var(--text-body)", fontSize: "0.85rem" }}>{entry.date}</td>
                    <td style={{ color: "var(--text-body)", fontSize: "0.9rem" }}>{entry.changes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

      </main>
    </div>
  );
}
