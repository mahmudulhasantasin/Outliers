"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
// 📁 CONTENT PAYLOAD (Authoritative Grounded Data)
// ==========================================
const DOCS_DATA = {
  meta: {
    company: "Advotech Copilot",
    tagline: "AI-powered Legal Intelligence for the Global South",
    one_liner: "30-second AI contract audits for ৳28 ($0.25) — verified by real lawyers.",
    version: "v1.4.0",
    last_updated: "2026-11-18",
  },
  stats: {
    total_users: 44,
    total_audits: 33,
    statutes_indexed: 35000,
    avg_turnaround: "30s",
    benchmark_pass: "73/73",
    accuracy_rate: "91.7%",
  },

  pitch: {
    problem: {
      headline: "80% of South Asians lack access to timely, affordable justice",
      cards: [
        {
          num: "01",
          title: "Prohibitive Cost & Delayed Turnaround",
          metric: "৳50,000+ / 7 Days",
          badge: "Economic Barrier",
          desc: "A single manual contract review costs upwards of ৳50,000 (~$450) and takes an average of 7 days through traditional chambers. 99% of freelancers, startups, and SMEs cannot afford this overhead.",
        },
        {
          num: "02",
          title: "Linguistic & Conceptual Friction",
          metric: "80%+ Population",
          badge: "Language Divide",
          desc: "Statutes and judicial precedents are written in archaic Victorian English, whereas 80%+ of citizens think and transact in Bengali or colloquial Banglish. Crucial contractual rights are lost in translation.",
        },
        {
          num: "03",
          title: "Information Asymmetry & Blind Signing",
          metric: "9 out of 10",
          badge: "Contract Risk",
          desc: "Small businesses and gig workers sign commercial leases, service agreements, and NDAs without understanding illegal penalty clauses or void covenants under the Contract Act 1872 (§ 27).",
        },
        {
          num: "04",
          title: "Diaspora Inaccessibility",
          metric: "4.5M+ Expatriates",
          badge: "Jurisdiction Gap",
          desc: "Over 4.5 million Non-Resident Bangladeshis sending remittances abroad lack access to trustworthy, transparent legal counsel back home, exposing family land and business assets to fraud.",
        },
      ],
    },

    solution: {
      headline: "An AI-native legal platform with dual execution engines: Ask & Verify",
      products: [
        {
          id: "copilot",
          tag: "ENGINE 1: GROUNDED RESEARCH",
          tagColor: "green",
          title: "Advotech Copilot (Bilingual Legal Q&A)",
          desc: "Conversational legal intelligence operating fluently in Bengali, Banglish, and English, grounded deterministically in 35,000+ codified sections of the Laws of Bangladesh.",
          highlights: [
            "35,000+ official Bangladesh Code statutes indexed in GraphRAG",
            "Sub-second citation grounding via ChromaDB + Groq LLaMA 3.3 70B",
            "Deterministic foreign-jurisdiction blocker (zero hallucinations)",
          ],
          cta: "Test Copilot Simulation Below",
          anchor: "#demo",
        },
        {
          id: "contractmind",
          tag: "ENGINE 2: AUTONOMOUS AUDIT",
          tagColor: "orange",
          title: "ContractMind (30s Contract Risk Audit)",
          desc: "Upload any PDF agreement. Within ~30 seconds, obtain an executive risk grade (0–100), statutory violation warnings, and copy-ready redlines.",
          highlights: [
            "Unfair penalty (§ 74) & void non-compete (§ 27) auto-detection",
            "Client-side sovereign PII redaction before cloud transmission",
            "Direct Human-in-the-Loop advocate verification dispatch (3-hr SLA)",
          ],
          cta: "Inspect Sample Audit Below",
          anchor: "#demo-audit",
        },
      ],
    },

    why_now: {
      headline: "Three technological & infrastructural curves just intersected",
      curves: [
        {
          number: "01",
          title: "LLM Reasoning Crossed Legal Reliability",
          subtitle: "Zero-Shot Common Law Comprehension",
          desc: "Modern open-weight and frontier models now consistently parse complex statutory cross-references, conditional exceptions, and multi-clause liabilities when paired with hybrid dense-sparse vector retrievers.",
        },
        {
          number: "02",
          title: "Micro-Payment Infrastructure Maturity",
          subtitle: "bKash, Nagad & SSLCommerz Rails",
          desc: "Bangladesh processed over $120B in mobile financial transactions in 2025. Collecting ৳28 ($0.25) micro-payments instantly per audit is now frictionless for millions of smartphones.",
        },
        {
          number: "03",
          title: "The Unclaimed Global South Legal Market",
          subtitle: "Western AI Tools Ignore Local Gazettes",
          desc: "Western legal-tech giants (Harvey, CoCounsel) focus on US/UK law at $10k+/seat. The $70B South Asian common-law diaspora remains virtually untouched by specialized sovereign legal AI.",
        },
      ],
    },

    market: {
      headline: "$1-2B local beachhead expanding to $70B+ Global South legal tech",
      segments: [
        {
          tier: "TAM (Total Addressable Market)",
          value: "$70B+",
          desc: "Global legal technology & AI-assisted compliance market across common law jurisdictions by 2030.",
        },
        {
          tier: "SAM (Serviceable Addressable)",
          value: "$1.8B",
          desc: "Annual spend on legal services, corporate drafting, and dispute management in Bangladesh.",
        },
        {
          tier: "SOM (Initial Beachhead)",
          value: "$28M",
          desc: "100,000+ tech freelancers, 25,000 registered SMEs, and 10,000 corporate HR departments.",
        },
      ],
      growthDrivers: [
        "10,000+ foreign multinational enterprises operating in Bangladesh requiring local statutory compliance.",
        "Over 650,000 registered IT freelancers entering global commercial contracts requiring rapid liability reviews.",
        "Regulatory push: Mandatory compliance reporting under the Bangladesh Labour Act & Data Protection standards.",
      ],
    },

    business_model: {
      headline: "Three diversified revenue streams anchored on one high-margin billing rail",
      streams: [
        {
          badge: "B2C Consumer",
          title: "Micro-Payment Top-ups",
          price: "৳28 / Audit",
          subtext: "Pay-as-you-go via bKash / SSLCommerz",
          features: [
            "৳28 per autonomous 30s contract audit",
            "৳5 per deep multi-statute research query",
            "Zero subscription commitment, instant onboarding",
            "Direct top-up ledger tied to user phone number",
          ],
        },
        {
          badge: "B2B Enterprise",
          title: "ComplianceOS Subscriptions",
          price: "৳15,000 - ৳45,000 / mo",
          subtext: "Corporate Legal Vaults & Playbooks",
          features: [
            "Pooled company credit balance with role quotas",
            "Custom corporate compliance playbook enforcement",
            "Shared team audit repository with permission tiers",
            "Priority advocate verification dispatch within 1 hour",
          ],
        },
        {
          badge: "Developer / API",
          title: "FastMCP Server Licensing",
          price: "Usage-based Tiered API",
          subtext: "Legal Agent Protocol for Developers",
          features: [
            "FastMCP endpoints licensable to third-party AI agents",
            "Structured statutory lookup & citation extraction tools",
            "Guaranteed 99.2% uptime SLA with resilient SSE streaming",
            "Private self-hosted enterprise VPS container deployment",
          ],
        },
      ],
    },

    traction: {
      headline: "Empirical benchmarks on gold-standard statutory datasets — zero vanity metrics",
      metrics: [
        { label: "Contract Provision Recall", value: "100%", sub: "33 of 33 test provisions identified without omission", score: 100 },
        { label: "Contract Audit Accuracy", value: "91.7%", sub: "33/36 precision on multi-clause risk scoring", score: 92 },
        { label: "RAG Act Hit@K", value: "93.9%", sub: "46 of 49 statutory citations accurately grounded", score: 94 },
        { label: "Deterministic Hallucination Block", value: "88.9%", sub: "Intercepts and blocks phantom section numbers", score: 89 },
        { label: "Production CI/CD Suite", value: "73/73", sub: "100% test pass rate across unit, API & RAG tests", score: 100 },
        { label: "Average E2E Latency", value: "< 2.8s", sub: "Bilingual legal chat response generation", score: 95 },
      ],
    },

    competition: {
      headline: "Why global legal AI fails in Bangladesh and why traditional firms cannot scale",
      matrix: [
        {
          feature: "Bangladesh Code Ingestion",
          advotech: "35,000+ Sections Codified",
          harvey: "None (US/UK Focus)",
          traditional: "Manual Paper Volumes",
          directories: "None (Phonebook Only)",
        },
        {
          feature: "Bengali & Banglish NLP",
          advotech: "Native Dialect Support",
          harvey: "English Only / Poor Translation",
          traditional: "Bilingual (Manual)",
          directories: "Static Bengali Listings",
        },
        {
          feature: "Audit Turnaround Time",
          advotech: "~30 Seconds (Live)",
          harvey: "2-5 Minutes (General)",
          traditional: "5 to 10 Business Days",
          directories: "N/A (No Audits)",
        },
        {
          feature: "Cost per Contract Review",
          advotech: "৳28 ($0.25)",
          harvey: "$10,000+ / Year Enterprise",
          traditional: "৳25,000 – ৳75,000",
          directories: "Free Search / ৳৳ Consultation",
        },
        {
          feature: "Hallucination Defense",
          advotech: "Deterministic Guard Layer",
          harvey: "Probabilistic LLM Only",
          traditional: "Human Vulnerability",
          directories: "None",
        },
        {
          feature: "Human-in-the-Loop Verifiers",
          advotech: "Supreme Court Bar Advocates (3-hr SLA)",
          harvey: "None (Software Only)",
          traditional: "Direct Lawyer",
          directories: "Unverified Referral",
        },
      ],
    },

    unique_advantage: {
      headline: "Three pillars of structural defensibility and sovereign advantage",
      pillars: [
        {
          icon: "🏛",
          title: "Proprietary Bangladesh Code Knowledge Graph",
          desc: "A custom curated database of 3,547 act aliases, section-level embeddings, and statutory definitions mapped from official gazettes (bdlaws.minlaw.gov.bd). Global models cannot replicate this regional ontology without our specialized ETL pipeline.",
        },
        {
          icon: "🛡",
          title: "Deterministic Hallucination Interceptor",
          desc: "A rule-based verification filter intercepting model output before client delivery. If the LLM generates a section that does not exist in the official gazette or references foreign jurisprudence (e.g. Indian IPC), the system deterministically blocks and reroutes the response.",
        },
        {
          icon: "⚖",
          title: "Human-in-the-Loop (HITL) Advocate Marketplace",
          desc: "AI produces the 30-second first-pass audit; certified Bangladesh Supreme Court and District Bar advocates review and apply a cryptographically sealed verification certificate under a strict 3-hour SLA window.",
        },
      ],
    },

    go_to_market: {
      headline: "A 3-phase wedge-and-expand playbook from freelancer contracts to corporate governance",
      phases: [
        {
          step: "Phase 1: The Contract Wedge",
          period: "Months 1 - 6",
          target: "Tech Freelancers, Creators & SMEs",
          strategy: "Drive viral adoption through ৳28 pay-per-audit on Facebook, LinkedIn & freelance communities. Low-friction bKash payment with zero signup friction converts high-intent users immediately.",
        },
        {
          step: "Phase 2: Academic & Advocate Seeding",
          period: "Months 6 - 12",
          target: "Law Students & Junior Advocates",
          strategy: "Distribute Advotech Research Mode to leading law schools (Dhaka University, DIU, BRAC). Junior advocates adopt the platform as their daily statutory drafting and citation assistant.",
        },
        {
          step: "Phase 3: Enterprise & ComplianceOS",
          period: "Months 12 - 24",
          target: "Corporate Legal Vaults & HR Departments",
          strategy: "Upsell high-volume enterprise licenses with automated Labour Act compliance audits, custom enterprise playbooks, pooled team credit accounts, and ERP integrations.",
        },
      ],
    },

    vision: {
      headline: "Becoming the default legal operating system for the 2 billion people of the Global South",
      pillars: [
        {
          title: "Jurisdiction-Agnostic Core Architecture",
          desc: "Our hybrid retrieval pipeline, deterministic safety shields, and HITL verification dispatch are engineered modularly. Bangladesh is our proof-of-concept; expanding requires only localized data ingestion.",
        },
        {
          title: "Multi-Jurisdiction Expansion Pipeline",
          desc: "• India (Q1 2027): Ingestion of Companies Act 2013, Bharatiya Nyaya Sanhita, Contract Act.\n• Pakistan (Q2 2027): Labour Code & Commercial Arbitration frameworks.\n• UAE / DIFC (Q3 2027): Common-law commercial court standards serving South Asian expatriates.",
        },
        {
          title: "The Counter-Signature Standard",
          desc: "We envision a future where no commercial contract in South Asia is signed without an autonomous Advotech audit seal attached to protect the parties.",
        },
      ],
    },
  },

  // --- TEAM ---
  team_name: "Team Advotech",
  team: [
    {
      name: "Mohammad Shuaib",
      role: "Lead Architect / Full-Stack Engineer",
      email: "shuaib@advotech.ai",
      avatar: "/team/Mohammad_Shuaib.webp",
      objPos: "top center",
      expertise: "Distributed Systems, FastAPI, LangGraph, Full-Stack Architecture",
    },
    {
      name: "Mahmudul Hasan Tasin",
      role: "Product Lead / Backend Architect",
      email: "tasin@advotech.ai",
      avatar: "/team/tasin.webp",
      objPos: "center 5%",
      expertise: "Product Strategy, Vector Retrieval Pipelines, RAG Benchmarking",
    },
    {
      name: "SM Sayem Hossain",
      role: "UI/UX Engineer / Frontend Lead",
      email: "sayem@advotech.ai",
      avatar: "/team/sayem.webp",
      objPos: "top center",
      expertise: "Design Systems, Next.js 15, Responsive Engineering, Human-Centered UX",
    },
    {
      name: "Sajjad",
      role: "Backend Engineer / DevOps",
      email: "sajjad@advotech.ai",
      avatar: "/team/sajjad.webp",
      objPos: "top center",
      expertise: "PostgreSQL pgvector, SSLCommerz Payment Gateway, CI/CD",
    },
    {
      name: "Medha",
      role: "Legal Research & Compliance",
      email: "medha@advotech.ai",
      avatar: "/team/medha.webp",
      objPos: "top center",
      expertise: "Bangladesh Statutory Law, Labor Act Compliance, Legal Knowledge Graph",
    },
    {
      name: "Jibon",
      role: "Go-To-Market / Partnerships",
      email: "jibon@advotech.ai",
      avatar: "/team/jibon.webp",
      objPos: "top center",
      expertise: "Growth Marketing, Bar Association Relations, Enterprise Client Acquisition",
    },
  ],

  // --- TECHNICAL WHITEPAPER ---
  tech: {
    product_overview: {
      headline: "Comprehensive System Architecture & Use Case Matrix",
      desc: "Advotech Copilot is an enterprise-ready legal intelligence platform uniting async FastAPI microservices, dual-path vector retrieval (Dense Qdrant + Sparse BM25), deterministic guardrails, and cryptographic Human-in-the-Loop audit workflows.",
      users: [
        {
          persona: "Tech Freelancers & Independent Contractors",
          scenario: "Auditing international vendor contracts to remove void non-compete clauses (§ 27 Contract Act) and enforce milestone-based release schedules.",
        },
        {
          persona: "SME Owners & Startup Founders",
          scenario: "Reviewing commercial lease agreements in under 30 seconds to flag illegal security deposit forfeitures under the Premises Rent Control Act 1991.",
        },
        {
          persona: "Corporate HR & Compliance Officers",
          scenario: "Running automated policy scans across hundreds of employee agreements against the mandatory provisions of the Bangladesh Labour Act 2006.",
        },
        {
          persona: "Practicing Advocates & Law Chambers",
          scenario: "Accelerating junior research by instantly finding relevant statutory sections and precedent citations across all 35,000+ gazette provisions.",
        },
        {
          persona: "Non-Resident Bangladeshi Diaspora",
          scenario: "Cross-checking local land power-of-attorney and property deeds remotely through verified Supreme Court legal counsel dispatch.",
        },
      ],
    },

    architecture: {
      headline: "End-to-End System Architecture Topology",
      layers: [
        {
          label: "01. Presentation Layer",
          items: ["Next.js 15 App Router", "Tailwind CSS Design Tokens", "Client-side Regex PII Redactor", "Real-time SSE Event Listeners"],
          icon: "🖥",
          role: "Sovereign client UI & instant audit rendering",
        },
        {
          label: "02. API Gateway & Auth",
          items: ["FastAPI Async Router", "JWT Auth (token_version checks)", "Role-Based Access Control (RBAC)", "Rate Limiting & BOLA Guards"],
          icon: "⚙",
          role: "Secure traffic routing & permission gating",
        },
        {
          label: "03. Agent Orchestrator",
          items: ["LangGraph State Machines", "Act Alias Resolver (3,547 Acts)", "Query Intent Classifier", "Retry & Fallback Circuit Breaker"],
          icon: "🤖",
          role: "Multi-step reasoning & statutory routing",
        },
        {
          label: "04. Vector & Relational Store",
          items: ["Qdrant Cloud (e5-small embeddings)", "Supabase Postgres (pgvector)", "Credit Ledger (Immutable Transactions)", "Metric Events Benchmarking"],
          icon: "🗄",
          role: "Hybrid search & persistent enterprise storage",
        },
        {
          label: "05. Inference & Guard Layer",
          items: ["Groq LLaMA 3.3 70B (Primary)", "GLM-4 / Local Gemma 3n (Fallback)", "Deterministic Hallucination Interceptor", "Official Gazette Citation Linker"],
          icon: "🛡",
          role: "Sub-second inference with zero hallucination",
        },
      ],
      flowSteps: [
        { from: "Browser", to: "Next.js 15", desc: "User uploads PDF; client-side PII sanitizer scrubs phone/NID" },
        { from: "Next.js", to: "FastAPI Gateway", desc: "Authenticated POST with JWT token_version verification" },
        { from: "Gateway", to: "LangGraph", desc: "Orchestrator initiates parallel hybrid retrieval" },
        { from: "LangGraph", to: "Qdrant + DB", desc: "Dense semantic vector match + exact act alias lookup" },
        { from: "Retrieval", to: "Groq LLM", desc: "Grounding context injected into prompt; sub-second inference" },
        { from: "Groq LLM", to: "Safety Interceptor", desc: "Deterministic regex & section verifier validates citations" },
        { from: "Interceptor", to: "SSE Stream", desc: "Streamed markdown & JSON audit memo sent back to client" },
      ],
    },

    data_flow: {
      headline: "7-Stage Sovereign Data Processing Pipeline",
      steps: [
        {
          step: "Stage 01 — Client-Side PII Scrubbing",
          desc: "Before any document bytes leave the user's browser, client-side regex rules redact phone numbers (+8801[3-9]), NID (10/13/17 digits), email addresses, and bank accounts. Raw sensitive data never touches cloud AI inference.",
          icon: "🔒",
        },
        {
          step: "Stage 02 — API Auth & Credit Validation",
          desc: "FastAPI checks the caller's JWT token, validates role authorization (General / Lawyer / Enterprise), and confirms available credit balance in the PostgreSQL ledger.",
          icon: "💳",
        },
        {
          step: "Stage 03 — Dual-Path Hybrid Retrieval",
          desc: "The query splits into Path A: Exact Act Alias Dictionary lookup (mapping 3,547 colloquial act names to formal statutes), and Path B: Qdrant dense vector search using multilingual e5-small embeddings.",
          icon: "🔍",
        },
        {
          step: "Stage 04 — Grounded LLM Reasoning",
          desc: "Groq LLaMA 3.3 70B synthesizes the statutory provisions and extracted contract clauses. The model is constrained to cite ONLY the provided grounding context, preventing parametric hallucination.",
          icon: "🤖",
        },
        {
          step: "Stage 05 — Deterministic Safety Filter",
          desc: "An independent validation engine verifies whether cited sections exist in the official Bangladesh Code. References to non-existent sections or foreign statutes (e.g., Indian IPC) are deterministically intercepted.",
          icon: "🛡",
        },
        {
          step: "Stage 06 — Real-Time Streaming & Storage",
          desc: "Output streams to the client via Server-Sent Events (SSE). The executive risk score (0–100), liability tags, and audit memo are stored immutably in Supabase PostgreSQL.",
          icon: "⚡",
        },
        {
          step: "Stage 07 — HITL Advocate Escalation",
          desc: "If the user requests lawyer verification, the audit package dispatches to the advocate inquiry queue with an automated 3-hour SLA offer timer and cryptographic digital seal signing.",
          icon: "⚖",
        },
      ],
    },

    feature_matrix: [
      { name: "30s AI Contract Audit (PDF)", status: "LIVE", tier: "Core", note: "91.7% accuracy, 100% clause recall across lease/employment agreements" },
      { name: "Bilingual Grounded Legal Chat", status: "LIVE", tier: "Core", note: "35,000+ statutes, MRR 0.864, answers in Bengali, Banglish & English" },
      { name: "SSLCommerz / bKash Credit Ledger", status: "LIVE", tier: "Billing", note: "Instant ৳28 micro-payments with IPN callbacks and credit deduction" },
      { name: "Client-Side PII Auto-Redaction", status: "LIVE", tier: "Security", note: "Regex & NLP sanitization of BD mobile, NID & financial numbers" },
      { name: "HITL Lawyer Review Marketplace", status: "BETA", tier: "Marketplace", note: "3-hour SLA cron matching, digital seal, fee disbursement" },
      { name: "FastMCP Legal Server", status: "BETA", tier: "Developer", note: "3 active MCP tools for AI agents, SSE-resilient streaming" },
      { name: "Enterprise Workspaces & Quotas", status: "PLANNED", tier: "Enterprise", note: "Shared legal vaults, team quota allocations, custom playbooks (Q1 2027)" },
      { name: "Multi-Jurisdiction Ingestion (India/Pak)", status: "PLANNED", tier: "Expansion", note: "Companies Act 2013 & Pakistan Labour Code ingestion (Q2 2027)" },
      { name: "Dispute Preparation AI Agent", status: "PLANNED", tier: "Litigation", note: "Pre-litigation legal notice generation & evidence bundling (Q3 2027)" },
    ],

    tech_stack: [
      {
        layer: "Frontend Tier",
        items: "Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Fraunces Serif & Karla Typography",
        desc: "Server-rendered application with client-side streaming and responsive layout.",
      },
      {
        layer: "Backend API Gateway",
        items: "FastAPI (Async Python 3.11), SQLAlchemy 2.0, Pydantic v2, Uvicorn, LangGraph",
        desc: "High-throughput asynchronous microservices handling concurrency with connection pooling.",
      },
      {
        layer: "AI & Vector Search",
        items: "Qdrant Cloud (35,000+ statute vectors), e5-small embeddings, BM25 sparse index, ChromaDB",
        desc: "Hybrid two-path semantic search yielding 93.9% Act Hit@K retrieval performance.",
      },
      {
        layer: "LLM Inference Engine",
        items: "Groq LLaMA 3.3 70B (Sub-second primary) → GLM-4 (Fallback) → Local Gemma 3n (Offline verify)",
        desc: "Multi-tier model fallback ladder guaranteeing continuous availability under load.",
      },
      {
        layer: "Database & Storage",
        items: "Supabase PostgreSQL with pgvector, Row-Level Security, Encrypted File Vaults",
        desc: "Relational user records, audit memos, credit transaction ledgers, and telemetry.",
      },
      {
        layer: "Payments & Financials",
        items: "SSLCommerz Payment Gateway (bKash, Nagad, Visa, Mastercard) + Internal Double-Entry Ledger",
        desc: "Cryptographically verified IPN callbacks with idempotent balance updates.",
      },
      {
        layer: "Infrastructure & DevOps",
        items: "Render (Backend Web Services), Vercel (Frontend Edge), Coolify VPS (MCP Server)",
        desc: "Docker containerized deployments with automated GitHub Actions CI/CD pipelines.",
      },
      {
        layer: "Observability & Telemetry",
        items: "Native benchmark harness streaming directly into metric_events table, Sentry error tracking",
        desc: "Continuous latency, recall, and hallucination monitoring across production queries.",
      },
    ],

    api_docs: [
      {
        group: "Auth",
        method: "POST",
        path: "/api/auth/request-otp",
        auth: "Public",
        desc: "Sends a 6-digit SMS verification code to a valid Bangladesh mobile number (+8801XXXXXXXXX).",
        payload: '{ "phone": "+8801700000000" }',
      },
      {
        group: "Auth",
        method: "POST",
        path: "/api/auth/verify-otp",
        auth: "Public",
        desc: "Verifies the SMS code and returns an HTTP-only JWT access token with token_version validation.",
        payload: '{ "phone": "+8801700000000", "otp": "123456" }',
      },
      {
        group: "Auth",
        method: "POST",
        path: "/api/auth/logout",
        auth: "Bearer JWT",
        desc: "Increments token_version in the database, instantly invalidating all active sessions across devices.",
        payload: "{}",
      },
      {
        group: "Chat",
        method: "POST",
        path: "/api/chat/ask",
        auth: "Bearer JWT",
        desc: "Performs grounded bilingual legal Q&A over 35,000+ Bangladesh Code sections via Server-Sent Events (SSE).",
        payload: '{ "query": "চেক বাউন্স হলে নোটিশ পাঠানোর সময় কতদিন?", "language": "auto" }',
      },
      {
        group: "Chat",
        method: "GET",
        path: "/api/chat/history",
        auth: "Bearer JWT",
        desc: "Retrieves paginated conversation threads and statutory citation cards for the authenticated user.",
        payload: "Query params: ?page=1&limit=20",
      },
      {
        group: "Audit",
        method: "POST",
        path: "/api/contract/upload",
        auth: "Bearer JWT",
        desc: "Accepts multipart/form-data PDF, executes 30s risk analysis, and returns structured clause findings with redlines.",
        payload: "FormData: { file: document.pdf, contractType: 'employment' }",
      },
      {
        group: "Audit",
        method: "GET",
        path: "/api/contract/memos",
        auth: "Bearer JWT",
        desc: "Lists historical contract audit memos, health scores (0-100), and PDF export download URLs.",
        payload: "Query params: ?status=completed",
      },
      {
        group: "Payments",
        method: "POST",
        path: "/api/payments/initiate",
        auth: "Bearer JWT",
        desc: "Initiates SSLCommerz payment session for credit purchase (1 credit = ৳28). Returns gateway redirect URL.",
        payload: '{ "credits": 5, "amount": 140 }',
      },
      {
        group: "Payments",
        method: "POST",
        path: "/api/payments/callback",
        auth: "HMAC Signature",
        desc: "IPN webhook handler validating SSLCommerz cryptographic signature and crediting user balance.",
        payload: "FormData: { tran_id, val_id, amount, status: 'VALID' }",
      },
      {
        group: "MCP",
        method: "SSE",
        path: "/mcp/tools/query_law",
        auth: "API Key",
        desc: "FastMCP Model Context Protocol tool enabling external AI agents to query verified statutory law.",
        payload: '{ "act_name": "Contract Act", "section": "27" }',
      },
    ],

    data_layer: {
      headline: "Sovereign Ingestion, Vectorization & Client-Side Privacy Standards",
      points: [
        "Statutory Ingestion Pipeline: Custom web ETL scraper extracted all 35,000+ sections across 1,100+ volumes of the official Bangladesh Code (bdlaws.minlaw.gov.bd). Data is normalized with act ID, amendment history, and gazette publication dates.",
        "Sovereign Client-Side PII Scrubbing: User contracts undergo client-side regex and tokenizer scrubbing before upload. All personal names, NID numbers, phone numbers, and financial details are anonymized into standardized tokens ([PARTY_A], [AMOUNT_TK]).",
        "Dual-Embedding Geometry: Text chunks are embedded using multilingual e5-small (384 dimensions) for dense semantic retrieval, coupled with custom BM25 sparse indices for exact statutory section numbers (§ 27, § 74, § 138).",
        "PostgreSQL pgvector Schema: Relational metadata (users, audit_memos, credit_ledger, advocate_inquiries) is partitioned with Row-Level Security (RLS) guaranteeing tenant isolation.",
        "Zero-Retention AI Policy: Contract audit texts are processed in memory and never stored in external LLM vendor logging buffers. Audit memos are stored encrypted in user vaults.",
      ],
    },

    ai_layer: {
      headline: "Multi-Agent LangGraph Orchestration & Hallucination Elimination",
      points: [
        "Hybrid 2-Path Retrieval Engine: Path A executes an exact lookup in the 3,547-act alias index. Path B performs cosine similarity search over Qdrant vectors with an adaptive threshold (0.78 cutoff).",
        "LangGraph State Machine: Controls the lifecycle of each request across 5 states: QueryClassifier → StatutoryRetriever → ConstraintValidator → Generator → CitationChecker.",
        "Deterministic Guardrail Interceptor: Custom post-generation filter regex parses statutory citations in the response. If a cited section cannot be matched against the official gazette database, the generation is blocked and re-prompted.",
        "Explainable Citation Grounding: Every affirmative statement in the response includes a hard-linked hyper-reference to the specific section, amendment year, and bdlaws gazette URL.",
        "Model Failover Ladder: Primary requests execute against Groq LLaMA 3.3 70B (latency < 1.2s). If Groq rate limits, the request fails over seamlessly to GLM-4 without user disruption.",
      ],
    },

    roadmap: {
      short: {
        label: "Now — Q1 2027",
        title: "Platform Hardening & Beachhead Scaling",
        items: [
          "Complete OCR Table-PDF parser optimization for scanned Bengali rental deeds",
          "Automated 3-hour SLA advocate dispatch with SMS reminder escalations",
          "FastMCP public developer registry launch for Claude & Cursor integrations",
          "Launch 180s interactive video showcase for investor & competition judging",
        ],
      },
      mid: {
        label: "Q1 — Q3 2027",
        title: "Enterprise ComplianceOS & Team Playbooks",
        items: [
          "Custom corporate compliance playbook builder with rule injection",
          "Multi-tenant company billing with pooled credit balances and role quotas",
          "Dispute Preparation AI Agent: Autonomous generation of statutory demand notices",
          "Shared audit repositories with cryptographic digital watermark stamps",
        ],
      },
      long: {
        label: "Q3 2027+",
        title: "Pan-South Asia Cross-Border Legal Expansion",
        items: [
          "India Jurisdiction Launch: Ingestion of Companies Act 2013, BNS, and Labour Codes",
          "Pakistan Jurisdiction Launch: Contract Act 1872 & Commercial Court precedents",
          "UAE / DIFC Ingestion: English common law coverage for 4.5M+ South Asian expatriates",
          "Decentralized Advocate Reputation & Verification Protocol on sovereign rails",
        ],
      },
    },

    performance: {
      headline: "Rigorous Production Latency, Scalability & Benchmarks",
      metrics: [
        { label: "Contract Audit Latency", value: "~28s", note: "15-page complex PDF agreement" },
        { label: "Bilingual Chat Latency", value: "1.4s", note: "Time-to-first-token on Groq LLaMA" },
        { label: "API System Uptime", value: "99.4%", note: "Production Render & Vercel SLA" },
        { label: "Test Suite Pass Rate", value: "73 / 73", note: "100% CI/CD unit & integration pass" },
        { label: "Provision Recall", value: "100%", note: "33/33 test provisions detected" },
        { label: "Hallucination Defense", value: "88.9%", note: "Deterministic section intercept rate" },
      ],
      strategies: [
        "Connection Pooling: Async SQLAlchemy with NullPool on serverless workers prevents database socket exhaustion.",
        "Singleton Vector Clients: Qdrant and ChromaDB clients initialized once during FastAPI lifespan startup.",
        "Client-Side Compression: Large contract PDFs are pre-parsed and chunked into memory before transmission.",
        "Server-Sent Events: Streaming chunk delivery starts within 1.2s of request submission, reducing perceived latency.",
      ],
    },

    security: {
      headline: "Defense-in-Depth Security & Role-Based Access Architecture",
      points: [
        "JWT with Token-Version Revocation: Every access token includes a token_version claim. When a user logs out or an admin revokes access, incrementing the counter immediately invalidates all active tokens across all devices.",
        "Role-Based Access Control (RBAC): Strict tripartite authorization model — GENERAL (consumer chat & audit), LAWYER (inquiry queue & client case files), ENTERPRISE (company vaults & playbooks). Route guards enforced at the FastAPI dependency level.",
        "Broken Object-Level Authorization (BOLA) Hardening: All file downloads and audit memo retrievals enforce strict user_id ownership validation. Guessing UUIDs returns an immediate 403 Forbidden.",
        "SQL Injection & SSRF Immunization: 100% parameterized queries via SQLAlchemy 2 ORM; internal HTTP dispatchers restricted to whitelisted payment gateway IP addresses.",
        "Sovereign Cryptographic Signatures: SSLCommerz transaction callbacks verified via HMAC-SHA256 signature hashes before updating the persistent financial credit ledger.",
      ],
    },

    analytics: {
      headline: "Live Operational KPIs & Evaluation Telemetry",
      kpis: [
        { label: "Audit Accuracy", value: "91.7%", sub: "33/36 benchmark provisions matched" },
        { label: "Act Hit@K", value: "93.9%", sub: "46/55 statutory retrievals effective" },
        { label: "Hallucination Block", value: "88.9%", sub: "Deterministic guard intercepts" },
        { label: "RAG MRR", value: "0.864", sub: "Mean Reciprocal Rank accuracy" },
        { label: "Active Test Users", value: "44", sub: "Production beta cohort" },
        { label: "Contracts Audited", value: "33", sub: "Commercial agreements analyzed" },
      ],
    },

    changelog: [
      { v: "v1.4.0", date: "2026-11-18", changes: "Interactive /docs release: YC pitch deck, deep technical whitepaper, real team directory, and admin access control." },
      { v: "v1.3.0", date: "2026-11-14", changes: "FastMCP legal tool server integration, MCP retry ladder, and case-law search triggers." },
      { v: "v1.2.0", date: "2026-11-12", changes: "BOLA security audit hardening, client-side PII scrubbing regex, and OTP SMS masking." },
      { v: "v1.1.0", date: "2026-11-11", changes: "Deterministic rule verification filter, adaptive Qdrant threshold (0.78), and benchmark harness." },
      { v: "v1.0.0", date: "2026-10-26", changes: "Initial production launch: Advotech Copilot, ContractMind PDF audit, and SSLCommerz billing." },
    ],
  },
};

// ==========================================
// 🎨 GLOBAL STYLES (Preserving Hearth Theme Tokens)
// ==========================================
const STYLES = `
  .hearth-theme {
    --bg-main: #FBF4EC;
    --bg-alt: #FFFDF9;
    --bg-accent: #F6E2D7;
    --text-dark: #2E2117;
    --text-body: #5C4F43;
    --accent-clay: #C45B3C;
    --border-color: #ECDFD0;
    --admin-color: #1E5C40;
    --green-light: #E9F3ED;
    --green-dark: #1E5C40;
    --orange-light: #FDF3E1;
    --orange-dark: #8F5A0A;

    background-color: var(--bg-main);
    color: var(--text-body);
    font-family: var(--font-karla), sans-serif;
    margin: 0;
    padding: 0;
    scroll-behavior: smooth;
    display: flex;
    min-height: 100vh;
  }
  .hearth-theme * { box-sizing: border-box; }

  /* Typography */
  .font-serif { font-family: var(--font-fraunces), serif; }
  .font-sans { font-family: var(--font-karla), sans-serif; }

  /* 403 Gate */
  .gate-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; text-align: center; padding: 2rem; }
  .gate-code { font-size: 5.5rem; font-weight: 800; color: var(--border-color); font-family: var(--font-fraunces), serif; line-height: 1; }
  .gate-title { font-family: var(--font-fraunces), serif; font-size: 2.25rem; color: var(--text-dark); margin: 0; }
  .gate-desc { font-size: 1.05rem; color: var(--text-body); max-width: 440px; line-height: 1.6; margin: 0; }
  .gate-admin-link { font-size: 0.85rem; color: var(--accent-clay); cursor: pointer; text-decoration: underline; font-weight: 600; }

  /* Admin Toolbar */
  .admin-toolbar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--admin-color); color: white; padding: 0.75rem 2rem; z-index: 200; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 600; gap: 1rem; flex-wrap: wrap; box-shadow: 0 -4px 20px rgba(0,0,0,0.15); }
  .admin-toolbar-left { display: flex; align-items: center; gap: 1rem; }
  .admin-status-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; margin-right: 0.4rem; }
  .admin-status-dot.on { background: #4ade80; box-shadow: 0 0 8px #4ade80; }
  .admin-status-dot.off { background: #f87171; box-shadow: 0 0 8px #f87171; }
  .btn-admin { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 0.45rem 0.95rem; cursor: pointer; border-radius: 4px; font-size: 0.8rem; font-weight: 600; transition: 0.2s; }
  .btn-admin:hover { background: rgba(255,255,255,0.25); }
  .btn-admin.danger { background: rgba(196, 91, 60, 0.4); border-color: rgba(196, 91, 60, 0.6); }
  .btn-admin.danger:hover { background: rgba(196, 91, 60, 0.6); }
  .admin-schedule { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .admin-schedule label { font-size: 0.75rem; opacity: 0.85; }
  .admin-schedule input[type="datetime-local"] { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); color: white; padding: 0.35rem 0.6rem; border-radius: 4px; font-size: 0.75rem; color-scheme: dark; font-family: inherit; }

  /* Admin PIN Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(46, 33, 23, 0.6); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 1.5rem; backdrop-filter: blur(4px); }
  .modal-box { background: var(--bg-alt); border: 1px solid var(--border-color); border-radius: 12px; padding: 2.5rem; width: 100%; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
  .modal-title { font-family: var(--font-fraunces), serif; font-size: 1.5rem; color: var(--text-dark); margin: 0 0 0.5rem 0; }
  .modal-sub { font-size: 0.9rem; color: var(--text-body); margin: 0 0 1.5rem 0; line-height: 1.5; }
  .modal-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-main); font-size: 1rem; color: var(--text-dark); margin-bottom: 1rem; font-family: inherit; }
  .modal-input:focus { outline: 2px solid var(--accent-clay); border-color: transparent; }
  .modal-error { color: var(--accent-clay); font-size: 0.85rem; margin-bottom: 1rem; font-weight: 600; }
  .modal-actions { display: flex; gap: 0.75rem; }
  .modal-btn { flex: 1; padding: 0.75rem; border-radius: 6px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; font-family: inherit; transition: 0.2s; }
  .modal-btn.primary { background: #1A1A1A; color: white; }
  .modal-btn.primary:hover { background: #333; }
  .modal-btn.secondary { background: transparent; border: 1px solid var(--border-color); color: var(--text-body); }
  .modal-btn.secondary:hover { background: var(--bg-accent); }

  /* Layout Structure */
  .sidebar { position: sticky; top: 0; height: 100vh; width: 290px; background: var(--bg-alt); border-right: 1px solid var(--border-color); padding: 2rem 1.5rem; overflow-y: auto; flex-shrink: 0; display: flex; flex-direction: column; }
  .sidebar::-webkit-scrollbar { width: 4px; }
  .sidebar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
  .main-content { flex-grow: 1; width: calc(100% - 290px); }
  .brand { font-family: var(--font-fraunces), serif; font-size: 1.35rem; color: var(--text-dark); margin-bottom: 1.5rem; display: block; text-decoration: none; font-weight: 700; }
  .brand span { color: var(--accent-clay); }
  .search-box-wrap { position: relative; margin-bottom: 1.75rem; }
  .search-box { width: 100%; padding: 0.75rem 0.9rem 0.75rem 2.2rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit; font-size: 0.85rem; color: var(--text-dark); }
  .search-box:focus { outline: 2px solid var(--accent-clay); border-color: transparent; }
  .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); font-size: 0.85rem; opacity: 0.5; pointer-events: none; }
  .toc-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent-clay); margin: 1.5rem 0 0.6rem 0; font-weight: 800; }
  .toc-link { display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; color: var(--text-body); text-decoration: none; margin-bottom: 0.35rem; padding: 0.35rem 0.6rem; border-radius: 4px; transition: all 0.15s; font-weight: 500; }
  .toc-link:hover { color: var(--accent-clay); background: rgba(196, 91, 60, 0.06); }
  .toc-link.active { color: var(--accent-clay); background: var(--bg-accent); font-weight: 700; }
  .toc-count { font-size: 0.7rem; opacity: 0.6; font-family: monospace; }

  /* Topbar */
  .topbar { padding: 1rem 4vw; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; background: rgba(251, 244, 236, 0.96); position: sticky; top: 0; z-index: 80; backdrop-filter: blur(8px); }
  .topbar-left { display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap; }
  .stat-pill { font-size: 0.8rem; color: var(--text-body); display: flex; align-items: center; gap: 0.4rem; font-weight: 500; }
  .stat-pill strong { color: var(--text-dark); font-weight: 700; }
  .stat-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; display: inline-block; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
  .topbar-right { display: flex; gap: 0.6rem; align-items: center; }
  .btn { border: 1px solid var(--border-color); background: transparent; padding: 0.5rem 0.95rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer; color: var(--text-body); font-weight: 700; border-radius: 4px; transition: 0.2s; font-family: inherit; }
  .btn:hover { background: var(--bg-accent); color: var(--text-dark); }
  .btn.primary-btn { background: #1A1A1A; color: white; border-color: #1A1A1A; }
  .btn.primary-btn:hover { background: #333; }

  /* Mobile Nav Bar */
  .mobile-header { display: none; padding: 1rem 1.5rem; background: var(--bg-alt); border-bottom: 1px solid var(--border-color); justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 90; }
  .mobile-toggle { background: transparent; border: 1px solid var(--border-color); padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer; font-family: inherit; }

  /* Sections */
  .doc-section { padding: 4.5rem 4vw; border-bottom: 1px solid var(--border-color); position: relative; }
  .doc-section.alt { background-color: var(--bg-alt); }
  .doc-inner { max-width: 960px; margin: 0 auto; position: relative; }
  .eyebrow { color: var(--accent-clay); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 800; margin-bottom: 0.75rem; display: block; }
  .headline { font-family: var(--font-fraunces), serif; font-size: clamp(2rem, 3.8vw, 3.25rem); color: var(--text-dark); line-height: 1.15; margin: 0 0 2rem 0; font-weight: 600; }
  .section-lead { font-size: 1.15rem; line-height: 1.7; color: var(--text-dark); margin-bottom: 2rem; max-width: 820px; }
  .paragraph { font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem; }

  /* Grids */
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.75rem; }
  .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; }

  /* Hero Jump Pills */
  .hero-quick-jumps { display: flex; gap: 0.75rem; margin-top: 2rem; flex-wrap: wrap; }
  .jump-pill { font-size: 0.8rem; font-weight: 700; color: var(--text-dark); background: var(--bg-alt); border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 50px; text-decoration: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 0.4rem; }
  .jump-pill:hover { border-color: var(--accent-clay); color: var(--accent-clay); transform: translateY(-1px); }

  /* Hero Stats */
  .stats-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid var(--border-color); }
  .stat-item { display: flex; flex-direction: column; gap: 0.35rem; }
  .stat-num { font-family: var(--font-fraunces), serif; font-size: 2.75rem; color: var(--text-dark); line-height: 1; font-weight: 700; }
  .stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-clay); font-weight: 800; }
  .stat-sub { font-size: 0.8rem; color: var(--text-body); opacity: 0.8; }

  /* Premium Problem Cards */
  .problem-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 10px; padding: 1.75rem; display: flex; flex-direction: column; gap: 0.75rem; box-shadow: 0 4px 16px rgba(46, 33, 23, 0.03); transition: transform 0.2s, box-shadow 0.2s; }
  .problem-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(46, 33, 23, 0.06); }
  .pc-top { display: flex; justify-content: space-between; align-items: center; }
  .pc-num { font-family: var(--font-fraunces), serif; font-size: 1.5rem; color: var(--border-color); font-weight: 700; }
  .pc-badge { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: 4px; background: var(--bg-accent); color: var(--accent-clay); }
  .pc-title { font-family: var(--font-fraunces), serif; font-size: 1.25rem; color: var(--text-dark); margin: 0; line-height: 1.3; }
  .pc-metric { font-size: 1.1rem; font-weight: 800; color: var(--accent-clay); }
  .pc-desc { font-size: 0.92rem; color: var(--text-body); line-height: 1.6; margin: 0; }

  /* Product Cards */
  .product-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; padding: 2.25rem; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(46, 33, 23, 0.04); position: relative; }
  .pc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .pc-icon { font-size: 1.5rem; }
  .pc-tag { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 0.35rem 0.7rem; border-radius: 4px; }
  .pc-tag.green { background: var(--green-light); color: var(--green-dark); }
  .pc-tag.orange { background: var(--orange-light); color: var(--orange-dark); }
  .pc-card-title { font-family: var(--font-fraunces), serif; font-size: 1.6rem; color: var(--text-dark); margin: 0 0 1rem 0; line-height: 1.25; }
  .pc-card-desc { font-size: 0.98rem; color: var(--text-body); line-height: 1.65; margin-bottom: 1.75rem; }
  .pc-checks { list-style: none; padding: 0; margin: 0 0 2rem 0; flex-grow: 1; }
  .pc-checks li { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.9rem; margin-bottom: 0.85rem; line-height: 1.45; color: var(--text-dark); }
  .pc-checks li::before { content: "✓"; color: var(--green-dark); font-weight: 900; }
  .pc-btn { background: #1A1A1A; color: white; border: none; border-radius: 8px; padding: 0.9rem 1.25rem; font-weight: 600; font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.2s; text-decoration: none; font-family: inherit; }
  .pc-btn:hover { background: #000; color: white; }

  /* Why Now Curve Cards */
  .curve-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 10px; padding: 2rem; position: relative; box-shadow: 0 4px 16px rgba(46, 33, 23, 0.03); }
  .curve-number { font-family: var(--font-fraunces), serif; font-size: 2.5rem; color: var(--border-color); line-height: 1; font-weight: 700; margin-bottom: 0.75rem; }
  .curve-title { font-family: var(--font-fraunces), serif; font-size: 1.25rem; color: var(--text-dark); margin: 0 0 0.35rem 0; }
  .curve-sub { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-clay); font-weight: 700; margin-bottom: 1rem; }
  .curve-desc { font-size: 0.92rem; color: var(--text-body); line-height: 1.65; margin: 0; }

  /* Interactive Demo Simulation */
  .demo-wrap { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; box-shadow: 0 6px 24px rgba(46, 33, 23, 0.04); }
  .demo-top-tabs { display: flex; gap: 0.75rem; margin-bottom: 1.75rem; flex-wrap: wrap; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
  .demo-tab-btn { background: var(--bg-main); border: 1px solid var(--border-color); padding: 0.55rem 1.1rem; border-radius: 50px; font-size: 0.82rem; font-weight: 600; color: var(--text-body); cursor: pointer; transition: 0.2s; font-family: inherit; }
  .demo-tab-btn:hover { border-color: var(--text-dark); }
  .demo-tab-btn.active { background: #1A1A1A; color: white; border-color: #1A1A1A; }
  .demo-sim-box { background: var(--bg-main); border-radius: 10px; padding: 1.75rem; display: flex; flex-direction: column; gap: 1.5rem; }
  .msg-user-wrap { display: flex; justify-content: flex-end; gap: 1rem; }
  .msg-user { background: #1A1A1A; color: white; padding: 1.15rem 1.4rem; border-radius: 12px 2px 12px 12px; max-width: 82%; font-size: 0.95rem; line-height: 1.6; }
  .avatar-u { width: 34px; height: 34px; background: var(--border-color); color: var(--text-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; flex-shrink: 0; }
  .msg-ai-wrap { display: flex; gap: 1rem; }
  .avatar-ai { width: 34px; height: 34px; background: var(--green-light); color: var(--green-dark); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
  .msg-ai-content { flex-grow: 1; }
  .msg-ai-meta { display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; font-weight: 700; color: var(--text-body); margin-bottom: 0.65rem; flex-wrap: wrap; }
  .msg-ai-match { color: var(--green-dark); }
  .msg-ai-bubble { background: #FFFFFF; border: 1px solid var(--border-color); padding: 1.4rem; border-radius: 2px 12px 12px 12px; font-size: 0.95rem; line-height: 1.7; color: var(--text-dark); box-shadow: 0 2px 8px rgba(0,0,0,0.02); margin-bottom: 1.25rem; }
  .msg-grounding { background: var(--green-light); border: 1px solid rgba(30, 92, 64, 0.25); border-radius: 8px; padding: 1.25rem; }
  .grounding-title { font-size: 0.75rem; font-weight: 800; color: var(--green-dark); margin-bottom: 0.6rem; display: flex; align-items: center; justify-content: space-between; }
  .grounding-text { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.88rem; line-height: 1.5; color: var(--text-dark); }
  .grounding-cite { font-weight: 700; color: var(--green-dark); }
  .grounding-link { font-size: 0.78rem; color: var(--accent-clay); text-decoration: underline; font-weight: 600; }

  /* Interactive Contract Audit Viewer */
  .audit-viewer { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; box-shadow: 0 6px 24px rgba(46, 33, 23, 0.04); margin-top: 2rem; }
  .audit-score-banner { display: flex; justify-content: space-between; align-items: center; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
  .score-number { font-family: var(--font-fraunces), serif; font-size: 2.25rem; color: var(--text-dark); font-weight: 700; }
  .score-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .badge-ui { padding: 0.4rem 0.8rem; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; border-radius: 4px; letter-spacing: 0.05em; }
  .badge-ui.danger { background: #FDE8E8; color: #9B1C1C; }
  .badge-ui.warning { background: #FEF4CE; color: #8F5A0A; }
  .badge-ui.success { background: #E2F0E9; color: #1E5C40; }
  .audit-clauses { display: flex; flex-direction: column; gap: 1rem; }
  .audit-clause-card { border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem; background: var(--bg-alt); transition: border-color 0.2s; }
  .audit-clause-card.high-risk { border-left: 4px solid #9B1C1C; }
  .audit-clause-card.warning-risk { border-left: 4px solid #8F5A0A; }
  .audit-clause-card.safe { border-left: 4px solid #1E5C40; }
  .clause-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
  .clause-title { font-weight: 700; font-size: 0.95rem; color: var(--text-dark); }
  .clause-text { font-size: 0.9rem; color: var(--text-body); line-height: 1.55; margin-bottom: 0.75rem; font-style: italic; background: rgba(0,0,0,0.02); padding: 0.6rem 0.8rem; border-radius: 4px; }
  .clause-finding { font-size: 0.88rem; color: var(--text-dark); line-height: 1.5; margin-bottom: 0.5rem; }
  .clause-redline { background: #FEF3C7; border: 1px dashed #D97706; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; line-height: 1.5; color: #78350F; margin-top: 0.5rem; }
  .redline-tag { font-size: 0.7rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.08em; display: block; margin-bottom: 0.25rem; }

  /* Market Segment Cards */
  .market-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 10px; padding: 2rem; box-shadow: 0 4px 16px rgba(46, 33, 23, 0.03); }
  .market-tier { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-clay); font-weight: 800; margin-bottom: 0.5rem; }
  .market-val { font-family: var(--font-fraunces), serif; font-size: 2.75rem; color: var(--text-dark); line-height: 1; font-weight: 700; margin-bottom: 0.75rem; }
  .market-desc { font-size: 0.92rem; color: var(--text-body); line-height: 1.6; margin: 0; }

  /* Business Model Cards */
  .biz-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 16px rgba(46, 33, 23, 0.03); }
  .biz-badge { align-self: flex-start; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: 4px; background: var(--bg-accent); color: var(--accent-clay); margin-bottom: 1rem; }
  .biz-title { font-family: var(--font-fraunces), serif; font-size: 1.4rem; color: var(--text-dark); margin: 0 0 0.5rem 0; }
  .biz-price { font-family: var(--font-fraunces), serif; font-size: 1.75rem; color: var(--accent-clay); font-weight: 700; margin-bottom: 0.25rem; }
  .biz-subtext { font-size: 0.8rem; color: var(--text-body); opacity: 0.8; margin-bottom: 1.5rem; }
  .biz-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem; }
  .biz-list li { font-size: 0.88rem; color: var(--text-body); display: flex; gap: 0.6rem; line-height: 1.45; }
  .biz-list li::before { content: "•"; color: var(--accent-clay); font-weight: 900; }

  /* Benchmarks */
  .benchmark-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .bench-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; color: var(--accent-clay); }
  .bench-val { font-family: var(--font-fraunces), serif; font-size: 2.25rem; color: var(--text-dark); font-weight: 700; line-height: 1; }
  .bench-sub { font-size: 0.82rem; color: var(--text-body); line-height: 1.4; }
  .bench-bar { width: 100%; height: 6px; background: var(--bg-main); border-radius: 3px; overflow: hidden; margin-top: 0.25rem; }
  .bench-fill { height: 100%; background: var(--accent-clay); border-radius: 3px; transition: width 0.5s ease-out; }

  /* Comparison Matrix Table */
  .comp-table-wrap { width: 100%; overflow-x: auto; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 10px; margin-top: 2rem; box-shadow: 0 4px 16px rgba(46, 33, 23, 0.03); }
  .comp-table { width: 100%; border-collapse: collapse; min-width: 680px; text-align: left; font-size: 0.9rem; }
  .comp-table th, .comp-table td { padding: 1.1rem 1.25rem; border-bottom: 1px solid var(--border-color); }
  .comp-table th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dark); font-weight: 800; background: var(--bg-alt); }
  .comp-table th.highlight, .comp-table td.highlight { background: var(--bg-accent); font-weight: 700; color: var(--text-dark); }
  .comp-table td { color: var(--text-body); }

  /* Unique Advantage Pillars */
  .pillar-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 4px 16px rgba(46, 33, 23, 0.03); }
  .pillar-icon { font-size: 2rem; }
  .pillar-title { font-family: var(--font-fraunces), serif; font-size: 1.35rem; color: var(--text-dark); margin: 0; line-height: 1.3; }
  .pillar-desc { font-size: 0.92rem; color: var(--text-body); line-height: 1.65; margin: 0; }

  /* GTM Timeline Cards */
  .gtm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
  .gtm-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 10px; padding: 1.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .gtm-step { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; color: var(--accent-clay); }
  .gtm-period { font-size: 0.8rem; font-weight: 700; color: var(--text-dark); }
  .gtm-target { font-size: 0.85rem; font-weight: 600; color: var(--green-dark); background: var(--green-light); padding: 0.2rem 0.5rem; border-radius: 4px; align-self: flex-start; }
  .gtm-strat { font-size: 0.92rem; color: var(--text-body); line-height: 1.6; margin: 0.5rem 0 0 0; }

  /* Team Cards (Uniform, High-Res, Aspect Ratio Fixed) */
  .team-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 16px rgba(46, 33, 23, 0.03); transition: transform 0.2s, box-shadow 0.2s; }
  .team-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(46, 33, 23, 0.08); }
  .team-img-wrap { width: 100%; aspect-ratio: 1/1; overflow: hidden; background: var(--bg-accent); position: relative; }
  .team-img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(10%); transition: filter 0.3s, transform 0.3s; display: block; }
  .team-card:hover .team-img { filter: grayscale(0%); transform: scale(1.02); }
  .team-body { padding: 1.25rem 1.5rem 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.35rem; flex-grow: 1; }
  .team-name { font-family: var(--font-fraunces), serif; font-size: 1.2rem; color: var(--text-dark); margin: 0; font-weight: 700; }
  .team-role { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-clay); margin: 0; font-weight: 800; }
  .team-email { font-size: 0.82rem; color: var(--text-body); text-decoration: none; opacity: 0.75; transition: opacity 0.2s; }
  .team-email:hover { opacity: 1; color: var(--accent-clay); }
  .team-exp { font-size: 0.78rem; color: var(--text-body); opacity: 0.85; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem; line-height: 1.4; }

  /* Architecture Topology Cards */
  .arch-topology { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
  .arch-layer-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; box-shadow: 0 4px 16px rgba(46, 33, 23, 0.03); }
  .arch-layer-head { display: flex; align-items: center; gap: 0.75rem; }
  .arch-layer-icon { font-size: 1.5rem; }
  .arch-layer-title { font-family: var(--font-fraunces), serif; font-size: 1.15rem; color: var(--text-dark); margin: 0; font-weight: 700; }
  .arch-layer-role { font-size: 0.78rem; color: var(--accent-clay); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .arch-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
  .arch-items li { font-size: 0.85rem; color: var(--text-body); padding: 0.3rem 0; border-bottom: 1px solid var(--border-color); display: flex; gap: 0.5rem; }
  .arch-items li::before { content: "→"; color: var(--accent-clay); flex-shrink: 0; font-weight: 700; }
  .arch-items li:last-child { border-bottom: none; }

  /* Interactive Data Flow Step Cards */
  .flow-steps { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }
  .flow-step-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem 1.5rem; display: flex; gap: 1.25rem; align-items: flex-start; transition: border-color 0.2s; }
  .flow-step-card:hover { border-color: var(--accent-clay); }
  .flow-step-icon { font-size: 1.75rem; width: 2.5rem; flex-shrink: 0; text-align: center; }
  .flow-step-body { flex-grow: 1; }
  .flow-step-label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; color: var(--accent-clay); margin-bottom: 0.25rem; }
  .flow-step-desc { font-size: 0.92rem; color: var(--text-body); line-height: 1.6; margin: 0; }

  /* Feature Matrix Interactive Table */
  .matrix-toolbar { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
  .matrix-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .matrix-filter-btn { background: var(--bg-main); border: 1px solid var(--border-color); padding: 0.35rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; cursor: pointer; color: var(--text-body); font-family: inherit; }
  .matrix-filter-btn.active { background: #1A1A1A; color: white; border-color: #1A1A1A; }
  .matrix-table-wrap { width: 100%; overflow-x: auto; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; }
  .matrix-table { width: 100%; border-collapse: collapse; min-width: 620px; font-size: 0.9rem; text-align: left; }
  .matrix-table th, .matrix-table td { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); }
  .matrix-table th { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-clay); font-weight: 800; background: var(--bg-alt); }
  .badge { display: inline-block; padding: 0.25rem 0.6rem; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; border-radius: 4px; }
  .badge-live { background: #E2F0E9; color: #1E5C40; }
  .badge-beta { background: #FDF3E1; color: #8F5A0A; }
  .badge-planned { background: #F1F1F4; color: #5C4F43; }
  .badge-method { background: var(--bg-accent); color: var(--accent-clay); font-size: 0.65rem; padding: 0.2rem 0.45rem; border-radius: 3px; font-weight: 800; font-family: monospace; }
  .badge-auth { background: #EEF2FF; color: #3730A3; font-size: 0.65rem; padding: 0.2rem 0.45rem; border-radius: 3px; font-weight: 700; }

  /* Tech Stack Tier Cards */
  .stack-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
  .stack-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 10px; padding: 1.75rem; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: 0 4px 16px rgba(46, 33, 23, 0.03); }
  .stack-layer { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-clay); font-weight: 800; }
  .stack-items { font-size: 1rem; font-weight: 700; color: var(--text-dark); line-height: 1.4; }
  .stack-desc { font-size: 0.88rem; color: var(--text-body); line-height: 1.55; margin: 0; }

  /* API Reference Explorer */
  .api-explorer { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; box-shadow: 0 6px 24px rgba(46, 33, 23, 0.04); margin-top: 2rem; }
  .api-filter-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .api-tab-btn { background: var(--bg-main); border: 1px solid var(--border-color); padding: 0.4rem 0.85rem; border-radius: 4px; font-size: 0.78rem; font-weight: 700; color: var(--text-body); cursor: pointer; font-family: inherit; }
  .api-tab-btn.active { background: #1A1A1A; color: white; border-color: #1A1A1A; }
  .api-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .api-item { border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem 1.25rem; background: var(--bg-alt); display: flex; flex-direction: column; gap: 0.5rem; }
  .api-item-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
  .api-path-wrap { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .api-path { font-family: monospace; font-size: 0.9rem; font-weight: 700; color: var(--text-dark); }
  .api-copy-btn { background: transparent; border: 1px solid var(--border-color); padding: 0.25rem 0.55rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; cursor: pointer; color: var(--text-body); font-family: inherit; transition: 0.2s; }
  .api-copy-btn:hover { background: var(--bg-accent); color: var(--accent-clay); }
  .api-desc { font-size: 0.88rem; color: var(--text-body); line-height: 1.5; margin: 0; }
  .api-payload { background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; padding: 0.5rem 0.75rem; font-family: monospace; font-size: 0.78rem; color: var(--text-dark); overflow-x: auto; margin-top: 0.25rem; }

  /* Roadmap Timeline Cards */
  .roadmap-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.75rem; margin-top: 2rem; }
  .roadmap-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 10px; padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem; box-shadow: 0 4px 16px rgba(46, 33, 23, 0.03); }
  .roadmap-badge { align-self: flex-start; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; color: var(--accent-clay); background: var(--bg-accent); padding: 0.25rem 0.6rem; border-radius: 4px; }
  .roadmap-title { font-family: var(--font-fraunces), serif; font-size: 1.25rem; color: var(--text-dark); margin: 0; }
  .roadmap-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
  .roadmap-items li { font-size: 0.88rem; color: var(--text-body); padding: 0.35rem 0; border-bottom: 1px solid var(--border-color); display: flex; gap: 0.6rem; line-height: 1.5; }
  .roadmap-items li::before { content: "→"; color: var(--accent-clay); flex-shrink: 0; font-weight: 700; }
  .roadmap-items li:last-child { border-bottom: none; }

  /* Security & Trust Points */
  .security-list { list-style: none; padding: 0; margin: 2rem 0 0 0; display: flex; flex-direction: column; gap: 1rem; }
  .security-card { background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem 1.5rem; display: flex; gap: 1rem; align-items: flex-start; }
  .security-icon { font-size: 1.5rem; flex-shrink: 0; }
  .security-text { font-size: 0.95rem; line-height: 1.65; color: var(--text-body); margin: 0; }

  /* Back to Top Button */
  .back-to-top { position: fixed; bottom: 2rem; right: 2rem; background: #1A1A1A; color: white; border: none; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.2); transition: 0.2s; z-index: 100; font-size: 1.1rem; }
  .back-to-top:hover { background: var(--accent-clay); transform: translateY(-2px); }

  /* Changelog */
  .changelog-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
  .changelog-table th, .changelog-table td { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); text-align: left; font-size: 0.9rem; }
  .changelog-table th { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-clay); font-weight: 800; background: var(--bg-alt); }
  .version-badge { font-family: monospace; background: var(--bg-accent); color: var(--accent-clay); padding: 0.25rem 0.55rem; border-radius: 4px; font-size: 0.85rem; font-weight: 800; }

  /* Divider */
  .whitepaper-divider { height: 12px; background: var(--border-color); position: relative; }
  .whitepaper-divider-tag { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: var(--accent-clay); color: white; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; padding: 0.35rem 1rem; border-radius: 50px; }

  /* Responsive Rules */
  @media (max-width: 960px) {
    .hearth-theme { flex-direction: column; }
    .sidebar { display: none; }
    .sidebar.mobile-open { display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100vh; z-index: 250; background: var(--bg-alt); }
    .main-content { width: 100%; }
    .mobile-header { display: flex; }
    .topbar { padding: 0.75rem 1.25rem; }
    .doc-section { padding: 3.5rem 1.25rem; }
    .admin-toolbar { flex-direction: column; align-items: flex-start; padding: 1rem; }
  }

  @media print {
    .sidebar, .topbar, .admin-toolbar, .modal-overlay, .btn, .back-to-top, .mobile-header, .hero-quick-jumps { display: none !important; }
    .main-content { width: 100%; }
    .doc-section { padding: 2rem 1rem; break-inside: avoid; }
    .hearth-theme { display: block; background: #fff; color: #000; }
  }
`;

// ==========================================
// 🧩 SECTION COMPONENT
// ==========================================
const Section = ({
  id,
  eyebrow,
  headline,
  children,
  altBg,
}: {
  id?: string;
  eyebrow: string;
  headline?: string;
  children: React.ReactNode;
  altBg?: boolean;
}) => (
  <section id={id} data-section={id} className={`doc-section${altBg ? " alt" : ""}`}>
    <div className="doc-inner">
      <span className="eyebrow">{eyebrow}</span>
      {headline && <h2 className="headline">{headline}</h2>}
      {children}
    </div>
  </section>
);

// ==========================================
// 🚫 NOT AVAILABLE 403 GATE
// ==========================================
const NotAvailablePage = ({ onAdminClick }: { onAdminClick: () => void }) => (
  <div className={`hearth-theme ${fraunces.variable} ${karla.variable}`}>
    <style dangerouslySetInnerHTML={{ __html: STYLES }} />
    <div className="gate-wrap" style={{ width: "100%" }}>
      <div className="gate-code">403</div>
      <h1 className="gate-title">Documentation Not Available</h1>
      <p className="gate-desc">
        This documentation portal is currently reserved for registered judges and investors during official showcase windows. Please check back during scheduled evaluation hours.
      </p>
      <span className="gate-admin-link" onClick={onAdminClick}>
        Administrator Access Authentication →
      </span>
    </div>
  </div>
);

// ==========================================
// 🚀 MAIN INTERACTIVE COMPONENT
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

  // --- UI Navigation State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("top");
  const [copied, setCopied] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // --- Interactive Demos State ---
  const [demoCategory, setDemoCategory] = useState<"commercial" | "tenant" | "employment">("commercial");
  const [apiFilter, setApiFilter] = useState("All");
  const [matrixFilter, setMatrixFilter] = useState("ALL");
  const [activeAuditTab, setActiveAuditTab] = useState<"findings" | "redlines">("findings");

  // --- Intersection Observer for Scroll Tracking ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    const sections = document.querySelectorAll("[data-section]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute("data-section") || "");
          }
        });
      },
      { threshold: 0.15, rootMargin: "-80px 0px -65% 0px" }
    );
    sections.forEach((s) => observer.observe(s));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
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
      setPinError("Incorrect security PIN. Please try again.");
    }
  };

  // --- Export PDF ---
  const handlePrint = () => window.print();

  // --- Copy link ---
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // --- Copy Endpoint ---
  const handleCopyEndpoint = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedEndpoint(text);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    });
  };

  // --- Export Markdown ---
  const handleMarkdownExport = () => {
    const md = `# ${d.meta.company} — Technical Whitepaper & YC Pitch\n\n**Version:** ${d.meta.version} | **Last Updated:** ${d.meta.last_updated}\n\n## Overview\n${d.meta.one_liner}\n\n## Traction\n- Contract Audit Recall: 100%\n- Accuracy: ${d.stats.accuracy_rate}\n- Statutes Indexed: ${d.stats.statutes_indexed.toLocaleString()}\n- CI/CD Pass Rate: ${d.stats.benchmark_pass}\n\n## Team\n${d.team.map((m) => `- **${m.name}** — ${m.role} (${m.email})`).join("\n")}\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "advotech-copilot-whitepaper.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Scroll to top ---
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Filtered API Docs ---
  const filteredApiDocs = useMemo(() => {
    if (apiFilter === "All") return d.tech.api_docs;
    return d.tech.api_docs.filter((item) => item.group.toLowerCase() === apiFilter.toLowerCase());
  }, [apiFilter, d.tech.api_docs]);

  // --- Filtered Feature Matrix ---
  const filteredMatrix = useMemo(() => {
    if (matrixFilter === "ALL") return d.tech.feature_matrix;
    return d.tech.feature_matrix.filter((item) => item.status === matrixFilter);
  }, [matrixFilter, d.tech.feature_matrix]);

  // --- Demo Simulation Data ---
  const demoData = {
    commercial: {
      query: "চেক বাউন্স (Dishonour) হলে নেগোশিয়েবল ইনস্ট্রুমেন্টস অ্যাক্টের ১৩৮ ধারায় নোটিশ পাঠানোর নির্দিষ্ট সময়সীমা কতদিন?",
      answer: "The Negotiable Instruments Act, 1881-এর ধারা ১৩৮(১)(খ) অনুযায়ী চেক ডিজঅনারের ক্ষেত্রে নোটিশ ও মামলা দায়েরের কঠোর সময়সীমা রয়েছে:\n\n১. ব্যাংক থেকে 'Dishonour Memo' পাওয়ার তারিখ থেকে ঠিক ৩০ দিনের মধ্যে ড্রয়ারকে লিখিত সংবিধিবদ্ধ নোটিশ (Statutory Notice of Demand) পাঠাতে হবে।\n২. নোটিশ প্রাপক নোটিশ প্রাপ্তির তারিখ থেকে ৩০ দিন সময় পাবেন টাকা পরিশোধ করার জন্য (Cure Period)।\n৩. এই ৩০ দিনেও টাকা পরিশোধ না হলে, পরবর্তী ৩০ দিনের মধ্যে উপযুক্ত জুডিশিয়াল ম্যাজিস্ট্রেট আদালতে ফৌজদারি নালিশ দাখিল করতে হবে।",
      statute: "The Negotiable Instruments Act, 1881 (Act XXVI of 1881) — Section 138 & 141",
      citationNote: "Mandatory 30-day statutory notice requirement; failure to serve notice within 30 days forever bars criminal remedies under Section 138.",
      gazetteUrl: "http://bdlaws.minlaw.gov.bd/act-55/section-16016.html",
      matchRate: "99.8%",
      latency: "0.85s",
    },
    tenant: {
      query: "বাড়িওয়ালা ৩ মাসের অগ্রিম সিকিউরিটি দাবি করছে, আমি কি চুক্তি বাতিল না করে ভাড়া নিয়ন্ত্রণ আইনে প্রতিকার পাব?",
      answer: "Premises Rent Control Act, 1991 (বাড়ি ভাড়া নিয়ন্ত্রণ আইন, ১৯৯১)-এর ধারা ১০ ও ধারা ২৩ অনুযায়ী:\n\n১. ধারা ১০ অনুসারে, কোনো বাড়িওয়ালা এক মাসের ভাড়ার অধিক অর্থ অগ্রিম বা জামানত (Security Deposit/Premium) হিসেবে দাবি বা গ্রহণ করতে পারবেন না।\n২. অতিরিক্ত অগ্রিম গ্রহণ করা আইনত দণ্ডনীয় এবং এই অর্থ মাসিক ভাড়ার সাথে সমন্বয়যোগ্য।\n৩. ভাড়াটিয়া উক্ত অতিরিক্ত অর্থ আদায়ে ভাড়া নিয়ন্ত্রক (Rent Controller) আদালতে আবেদন করতে পারবেন।",
      statute: "The Premises Rent Control Act, 1991 (Act III of 1991) — Section 10 & 23",
      citationNote: "Express statutory prohibition against demanding more than one month advance rent; punishable by fine under Section 23.",
      gazetteUrl: "http://bdlaws.minlaw.gov.bd/act-795.html",
      matchRate: "99.4%",
      latency: "0.92s",
    },
    employment: {
      query: "Can my employer restrict me from working in the same IT software industry for 2 years after resigning in Bangladesh?",
      answer: "Under Section 27 of The Contract Act, 1872 (Act IX of 1872), every agreement by which anyone is restrained from exercising a lawful profession, trade, or business of any kind is to that extent VOID ab initio.\n\n• Post-termination non-compete covenants are fundamentally unenforceable in Bangladesh.\n• Employers cannot restrict your right to take employment at a competitor or launch a startup.\n• Only legitimate Non-Disclosure Agreements (NDAs) protecting proprietary trade secrets remain valid, but not trade restraints.",
      statute: "The Contract Act, 1872 (Act IX of 1872) — Section 27 (Agreement in restraint of trade void)",
      citationNote: "Established Supreme Court precedent (28 DLR 121); non-compete clauses restraining professional employment are void and illegal.",
      gazetteUrl: "http://bdlaws.minlaw.gov.bd/act-26/section-2695.html",
      matchRate: "99.9%",
      latency: "0.78s",
    },
  };

  const activeDemo = demoData[demoCategory];

  // --- Determine if docs should show ---
  const shouldShow = isAdminMode || docsPublic || isWithinSchedule();

  if (!shouldShow) {
    return <NotAvailablePage onAdminClick={() => setShowPinModal(true)} />;
  }

  const tocActive = (id: string) => (activeSection === id ? "toc-link active" : "toc-link");

  return (
    <div className={`hearth-theme ${fraunces.variable} ${karla.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* 🔐 PIN MODAL */}
      {showPinModal && (
        <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Admin Access Authentication</h2>
            <p className="modal-sub">
              Enter the authorized administrative security PIN to configure public availability and manage evaluation schedules.
            </p>
            <input
              type="password"
              className="modal-input"
              placeholder="Enter PIN (e.g. advotech2026)..."
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              autoFocus
            />
            {pinError && <p className="modal-error">{pinError}</p>}
            <div className="modal-actions">
              <button className="modal-btn primary" onClick={handlePinSubmit}>
                Authenticate
              </button>
              <button
                className="modal-btn secondary"
                onClick={() => {
                  setShowPinModal(false);
                  setPinInput("");
                  setPinError("");
                }}
              >
                Cancel
              </button>
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
              Docs Access: <strong>{docsPublic ? "PUBLIC (LIVE)" : "PRIVATE (GATED)"}</strong> — {d.meta.version}
            </div>
            <button
              className={`btn-admin ${docsPublic ? "danger" : ""}`}
              onClick={() => setDocsPublic(!docsPublic)}
            >
              {docsPublic ? "⏸ Gated / Offline" : "▶ Set Public"}
            </button>
          </div>
          <div className="admin-schedule">
            <label>Judging / Showcase Window:</label>
            <input type="datetime-local" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} />
            <span style={{ opacity: 0.6 }}>→</span>
            <input type="datetime-local" value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)} />
          </div>
          <div>
            <button className="btn-admin" onClick={() => setIsAdminMode(false)}>
              ✕ Exit Admin
            </button>
          </div>
        </div>
      )}

      {/* 📱 MOBILE HEADER */}
      <div className="mobile-header">
        <a href="#top" className="brand" style={{ margin: 0 }}>
          Advotech <span>Docs</span>
        </a>
        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? "✕ Close" : "☰ Sections"}
        </button>
      </div>

      {/* 🧭 SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <a href="#top" className="brand" onClick={() => setMobileMenuOpen(false)}>
          Advotech <span>Copilot</span>
        </a>

        <div className="search-box-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-box"
            placeholder="Quick search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ flexGrow: 1, overflowY: "auto" }}>
          <div className="toc-title">Part I — YC Pitch Deck</div>
          <a href="#top" className={tocActive("top")} onClick={() => setMobileMenuOpen(false)}>
            <span>Executive Overview</span>
            <span className="toc-count">00</span>
          </a>
          <a href="#problem" className={tocActive("problem")} onClick={() => setMobileMenuOpen(false)}>
            <span>The Problem</span>
            <span className="toc-count">01</span>
          </a>
          <a href="#solution" className={tocActive("solution")} onClick={() => setMobileMenuOpen(false)}>
            <span>The Solution</span>
            <span className="toc-count">02</span>
          </a>
          <a href="#why-now" className={tocActive("why-now")} onClick={() => setMobileMenuOpen(false)}>
            <span>Why Now</span>
            <span className="toc-count">03</span>
          </a>
          <a href="#demo" className={tocActive("demo")} onClick={() => setMobileMenuOpen(false)}>
            <span>Interactive Demo</span>
            <span className="toc-count">04</span>
          </a>
          <a href="#market" className={tocActive("market")} onClick={() => setMobileMenuOpen(false)}>
            <span>Market Opportunity</span>
            <span className="toc-count">05</span>
          </a>
          <a href="#business-model" className={tocActive("business-model")} onClick={() => setMobileMenuOpen(false)}>
            <span>Business Model</span>
            <span className="toc-count">06</span>
          </a>
          <a href="#traction" className={tocActive("traction")} onClick={() => setMobileMenuOpen(false)}>
            <span>Traction & Benchmarks</span>
            <span className="toc-count">07</span>
          </a>
          <a href="#competition" className={tocActive("competition")} onClick={() => setMobileMenuOpen(false)}>
            <span>Competition Matrix</span>
            <span className="toc-count">08</span>
          </a>
          <a href="#advantage" className={tocActive("advantage")} onClick={() => setMobileMenuOpen(false)}>
            <span>Unique Advantage</span>
            <span className="toc-count">09</span>
          </a>
          <a href="#gtm" className={tocActive("gtm")} onClick={() => setMobileMenuOpen(false)}>
            <span>Go-To-Market</span>
            <span className="toc-count">10</span>
          </a>
          <a href="#vision" className={tocActive("vision")} onClick={() => setMobileMenuOpen(false)}>
            <span>Long-term Vision</span>
            <span className="toc-count">11</span>
          </a>
          <a href="#team" className={tocActive("team")} onClick={() => setMobileMenuOpen(false)}>
            <span>Team Advotech</span>
            <span className="toc-count">12</span>
          </a>

          <div className="toc-title">Part II — Technical Whitepaper</div>
          <a href="#overview" className={tocActive("overview")} onClick={() => setMobileMenuOpen(false)}>
            <span>Product Overview</span>
            <span className="toc-count">A</span>
          </a>
          <a href="#architecture" className={tocActive("architecture")} onClick={() => setMobileMenuOpen(false)}>
            <span>System Architecture</span>
            <span className="toc-count">B</span>
          </a>
          <a href="#data-flow" className={tocActive("data-flow")} onClick={() => setMobileMenuOpen(false)}>
            <span>7-Stage Data Pipeline</span>
            <span className="toc-count">C</span>
          </a>
          <a href="#features" className={tocActive("features")} onClick={() => setMobileMenuOpen(false)}>
            <span>Feature Matrix</span>
            <span className="toc-count">D</span>
          </a>
          <a href="#tech-stack" className={tocActive("tech-stack")} onClick={() => setMobileMenuOpen(false)}>
            <span>Technology Stack</span>
            <span className="toc-count">E</span>
          </a>
          <a href="#api-docs" className={tocActive("api-docs")} onClick={() => setMobileMenuOpen(false)}>
            <span>API Reference</span>
            <span className="toc-count">F</span>
          </a>
          <a href="#data-layer" className={tocActive("data-layer")} onClick={() => setMobileMenuOpen(false)}>
            <span>Data & Sovereignty</span>
            <span className="toc-count">G</span>
          </a>
          <a href="#ai-layer" className={tocActive("ai-layer")} onClick={() => setMobileMenuOpen(false)}>
            <span>AI & RAG Mechanics</span>
            <span className="toc-count">H</span>
          </a>
          <a href="#roadmap" className={tocActive("roadmap")} onClick={() => setMobileMenuOpen(false)}>
            <span>Product Roadmap</span>
            <span className="toc-count">I</span>
          </a>
          <a href="#performance" className={tocActive("performance")} onClick={() => setMobileMenuOpen(false)}>
            <span>Performance & SLA</span>
            <span className="toc-count">J</span>
          </a>
          <a href="#security" className={tocActive("security")} onClick={() => setMobileMenuOpen(false)}>
            <span>Security & RBAC</span>
            <span className="toc-count">K</span>
          </a>
          <a href="#analytics" className={tocActive("analytics")} onClick={() => setMobileMenuOpen(false)}>
            <span>Operational KPIs</span>
            <span className="toc-count">L</span>
          </a>
          <a href="#changelog" className={tocActive("changelog")} onClick={() => setMobileMenuOpen(false)}>
            <span>Changelog History</span>
            <span className="toc-count">M</span>
          </a>
        </div>

        <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border-color)", fontSize: "0.75rem", opacity: 0.7 }}>
          v1.4.0 • Dhaka, Bangladesh
        </div>
      </aside>

      {/* 📄 MAIN CONTENT CONTAINER */}
      <main className="main-content" style={{ paddingBottom: isAdminMode ? "6rem" : "2rem" }}>
        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="stat-pill">
              <span className="stat-live-dot"></span> Live System
            </span>
            <span className="stat-pill">
              👥 <strong>{d.stats.total_users}</strong> Users
            </span>
            <span className="stat-pill">
              📋 <strong>{d.stats.total_audits}</strong> Audits
            </span>
            <span className="stat-pill">
              📚 <strong>{d.stats.statutes_indexed.toLocaleString()}+</strong> Statutes
            </span>
            <span className="stat-pill">
              ⚡ <strong>{d.stats.avg_turnaround}</strong> Avg Audit
            </span>
            <span className="stat-pill">
              ✅ <strong>{d.stats.accuracy_rate}</strong> Precision
            </span>
          </div>

          <div className="topbar-right">
            {!isAdminMode && (
              <button className="btn" onClick={() => setShowPinModal(true)}>
                ⚙ Admin Gate
              </button>
            )}
            <button className="btn" onClick={handleCopyLink}>
              {copied ? "✓ Copied!" : "🔗 Share"}
            </button>
            <button className="btn" onClick={handleMarkdownExport}>
              ↓ Markdown
            </button>
            <button className="btn primary-btn" onClick={handlePrint}>
              ⎙ Export PDF
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 00. EXECUTIVE HERO                                       */}
        {/* ======================================================== */}
        <div data-section="top">
          <Section
            id="top"
            eyebrow={`Live System Documentation & Pitch Deck · ${d.meta.version} · Updated ${d.meta.last_updated}`}
            headline={d.meta.tagline}
            altBg
          >
            <p className="section-lead" style={{ borderLeft: "3px solid var(--accent-clay)", paddingLeft: "1.5rem" }}>
              {d.meta.one_liner}
            </p>

            <div className="hero-quick-jumps">
              <a href="#demo" className="jump-pill">
                ⚡ Try Bilingual Copilot
              </a>
              <a href="#demo-audit" className="jump-pill">
                📋 Inspect Contract Audit Memo
              </a>
              <a href="#architecture" className="jump-pill">
                🏛 Architecture Topology
              </a>
              <a href="#team" className="jump-pill">
                👥 Meet Team Advotech
              </a>
            </div>

            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-num">{d.stats.statutes_indexed.toLocaleString()}+</span>
                <span className="stat-label">Statutes Ingested</span>
                <span className="stat-sub">Official bdlaws.minlaw gazettes</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{d.stats.accuracy_rate}</span>
                <span className="stat-label">Audit Accuracy</span>
                <span className="stat-sub">33/36 gold standard test recall</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{d.stats.benchmark_pass}</span>
                <span className="stat-label">CI/CD Pass Rate</span>
                <span className="stat-sub">Automated production test suites</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{d.stats.avg_turnaround}</span>
                <span className="stat-label">Turnaround SLA</span>
                <span className="stat-sub">15-page complex PDF agreement</span>
              </div>
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* 01. THE PROBLEM                                          */}
        {/* ======================================================== */}
        <div data-section="problem">
          <Section id="problem" eyebrow="01. The Problem" headline={d.pitch.problem.headline}>
            <p className="section-lead">
              In Bangladesh and across the Global South, legal consultation is slow, cost-prohibitive, and linguistically opaque. Citizens and businesses routinely forfeit basic rights due to unmitigated contractual liability.
            </p>
            <div className="grid-2">
              {d.pitch.problem.cards.map((card, i) => (
                <div key={i} className="problem-card">
                  <div className="pc-top">
                    <span className="pc-num">{card.num}</span>
                    <span className="pc-badge">{card.badge}</span>
                  </div>
                  <h3 className="pc-title">{card.title}</h3>
                  <div className="pc-metric">{card.metric}</div>
                  <p className="pc-desc">{card.desc}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* 02. THE SOLUTION                                         */}
        {/* ======================================================== */}
        <div data-section="solution">
          <Section id="solution" eyebrow="02. The Solution" headline={d.pitch.solution.headline} altBg>
            <p className="section-lead">
              Advotech separates legal intelligence into two specialized execution engines: conversational bilingual research (Copilot) and autonomous risk extraction with human advocate sign-off (ContractMind).
            </p>
            <div className="grid-2">
              {d.pitch.solution.products.map((p, i) => (
                <div key={i} className="product-card">
                  <div className="pc-head">
                    <span className="pc-icon">{p.id === "copilot" ? "💬" : "⚡"}</span>
                    <span className={`pc-tag ${p.tagColor}`}>{p.tag}</span>
                  </div>
                  <h3 className="pc-card-title">{p.title}</h3>
                  <p className="pc-card-desc">{p.desc}</p>
                  <ul className="pc-checks">
                    {p.highlights.map((h, j) => (
                      <li key={j}>{h}</li>
                    ))}
                  </ul>
                  <a href={p.anchor} className="pc-btn">
                    <span>{p.cta}</span>
                    <span>↘</span>
                  </a>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* 03. WHY NOW                                              */}
        {/* ======================================================== */}
        <div data-section="why-now">
          <Section id="why-now" eyebrow="03. Why Now" headline={d.pitch.why_now.headline}>
            <div className="grid-3">
              {d.pitch.why_now.curves.map((curve, i) => (
                <div key={i} className="curve-card">
                  <div className="curve-number">{curve.number}</div>
                  <h3 className="curve-title">{curve.title}</h3>
                  <div className="curve-sub">{curve.subtitle}</div>
                  <p className="curve-desc">{curve.desc}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* 04. PRODUCT DEMO (Interactive Copilot + Audit Viewer)     */}
        {/* ======================================================== */}
        <div data-section="demo">
          <Section id="demo" eyebrow="04. Interactive Product Showcase" headline="Live Grounded Legal Q&A & Contract Audit Simulation" altBg>
            {/* --- COPILOT SIMULATOR --- */}
            <div className="demo-wrap">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.25rem", margin: 0, color: "var(--text-dark)" }}>
                    1. Advotech Copilot — Bilingual Grounded Inquiry
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-body)" }}>
                    Select a scenario to inspect statutory grounding in real time:
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--green-dark)", fontWeight: 700, fontSize: "0.8rem" }}>
                  <span>✓</span> Deterministic Zero-Hallucination Guard
                </div>
              </div>

              <div className="demo-top-tabs">
                <button
                  className={`demo-tab-btn ${demoCategory === "commercial" ? "active" : ""}`}
                  onClick={() => setDemoCategory("commercial")}
                >
                  Commercial Law (Dishonoured Cheques)
                </button>
                <button
                  className={`demo-tab-btn ${demoCategory === "tenant" ? "active" : ""}`}
                  onClick={() => setDemoCategory("tenant")}
                >
                  Tenant Rights (Banglish Deposit Limit)
                </button>
                <button
                  className={`demo-tab-btn ${demoCategory === "employment" ? "active" : ""}`}
                  onClick={() => setDemoCategory("employment")}
                >
                  Employment & Tech (Void Non-Compete)
                </button>
              </div>

              <div className="demo-sim-box">
                {/* User Message */}
                <div className="msg-user-wrap">
                  <div className="msg-user">{activeDemo.query}</div>
                  <div className="avatar-u">U</div>
                </div>

                {/* AI Message */}
                <div className="msg-ai-wrap">
                  <div className="avatar-ai">⚖</div>
                  <div className="msg-ai-content">
                    <div className="msg-ai-meta">
                      <span>Advotech Copilot</span> •
                      <span className="msg-ai-match">{activeDemo.matchRate} Statutory Match</span> •
                      <span style={{ opacity: 0.65 }}>Latency: {activeDemo.latency}</span>
                    </div>

                    <div className="msg-ai-bubble" style={{ whiteSpace: "pre-line" }}>
                      {activeDemo.answer}
                    </div>

                    {/* Grounding Citation Box */}
                    <div className="msg-grounding">
                      <div className="grounding-title">
                        <span>⚖ VERIFIED BANGLADESH STATUTORY CITATION:</span>
                        <a href={activeDemo.gazetteUrl} target="_blank" rel="noopener noreferrer" className="grounding-link">
                          Inspect Official Gazette ↗
                        </a>
                      </div>
                      <div className="grounding-text">
                        <div className="grounding-cite">{activeDemo.statute}</div>
                        <div>{activeDemo.citationNote}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- CONTRACT AUDIT SIMULATOR --- */}
            <div id="demo-audit" className="audit-viewer">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.25rem", margin: 0, color: "var(--text-dark)" }}>
                    2. ContractMind — Autonomous 30s Audit Report Sample
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-body)" }}>
                    Document: <code>Software_Engineer_Consultancy_Agreement.pdf</code> (12 pages)
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className={`matrix-filter-btn ${activeAuditTab === "findings" ? "active" : ""}`}
                    onClick={() => setActiveAuditTab("findings")}
                  >
                    Risk Findings
                  </button>
                  <button
                    className={`matrix-filter-btn ${activeAuditTab === "redlines" ? "active" : ""}`}
                    onClick={() => setActiveAuditTab("redlines")}
                  >
                    Statutory Redlines
                  </button>
                </div>
              </div>

              <div className="audit-score-banner">
                <div>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800, color: "var(--accent-clay)" }}>
                    Executive Health Score
                  </span>
                  <div className="score-number">82 / 100</div>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-body)" }}>
                    Moderate Risk — 2 non-compliant statutory provisions detected
                  </span>
                </div>
                <div className="score-badges">
                  <span className="badge-ui danger">1 High Risk Clause</span>
                  <span className="badge-ui warning">1 Void Covenant</span>
                  <span className="badge-ui success">3 Compliant Sections</span>
                </div>
              </div>

              <div className="audit-clauses">
                {/* Clause 1 */}
                <div className="audit-clause-card safe">
                  <div className="clause-head">
                    <span className="clause-title">Clause 1.2 — Scope of Deliverables & Milestones</span>
                    <span className="badge-ui success">Compliant</span>
                  </div>
                  <div className="clause-text">
                    "Consultant shall furnish deliverables specified in Schedule A according to sprint intervals."
                  </div>
                  <div className="clause-finding">
                    Standard service scope definition with clear acceptance criteria. Complies fully with Section 37 of The Contract Act 1872.
                  </div>
                </div>

                {/* Clause 2 (High Risk) */}
                <div className="audit-clause-card high-risk">
                  <div className="clause-head">
                    <span className="clause-title">Clause 4.3 — Liquidated Damages & Daily Penalty</span>
                    <span className="badge-ui danger">High Risk</span>
                  </div>
                  <div className="clause-text">
                    "In the event of delay, Consultant shall pay liquidated damages of ৳15,000 per calendar day regardless of actual damages incurred."
                  </div>
                  <div className="clause-finding">
                    <strong>Statutory Conflict:</strong> Conflicts directly with <strong>Section 74 of The Contract Act 1872</strong>. The Supreme Court has repeatedly established that punitive damages cannot exceed reasonable compensation for actual proven losses.
                  </div>
                  {activeAuditTab === "redlines" && (
                    <div className="clause-redline">
                      <span className="redline-tag">Actionable Redline Diff:</span>
                      <del style={{ color: "#9B1C1C" }}>
                        "pay liquidated damages of ৳15,000 per calendar day regardless of actual damages"
                      </del>
                      <br />
                      <ins style={{ color: "#1E5C40", textDecoration: "none", fontWeight: 600 }}>
                        + "pay reasonable compensation not exceeding 5% of monthly fees upon actual evidence of direct losses directly caused by such delay."
                      </ins>
                    </div>
                  )}
                </div>

                {/* Clause 3 (Void Non-Compete) */}
                <div className="audit-clause-card warning-risk">
                  <div className="clause-head">
                    <span className="clause-title">Clause 8.1 — Post-Termination Restraint of Trade</span>
                    <span className="badge-ui warning">Void Ab Initio</span>
                  </div>
                  <div className="clause-text">
                    "For a period of 24 months post-termination, Consultant shall not render software services to any entity in Bangladesh."
                  </div>
                  <div className="clause-finding">
                    <strong>Statutory Conflict:</strong> <strong>Section 27 of The Contract Act 1872</strong> declares agreements in restraint of trade fundamentally void. This covenant cannot be enforced in any court of law.
                  </div>
                  {activeAuditTab === "redlines" && (
                    <div className="clause-redline">
                      <span className="redline-tag">Actionable Redline Diff:</span>
                      <del style={{ color: "#9B1C1C" }}>
                        "shall not render software services to any entity in Bangladesh for 24 months"
                      </del>
                      <br />
                      <ins style={{ color: "#1E5C40", textDecoration: "none", fontWeight: 600 }}>
                        + "shall strictly protect Company proprietary Trade Secrets under Section 9 (Non-Disclosure), without restricting Consultant's constitutional right to lawful employment."
                      </ins>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* 05. MARKET OPPORTUNITY                                   */}
        {/* ======================================================== */}
        <div data-section="market">
          <Section id="market" eyebrow="05. Market Opportunity" headline={d.pitch.market.headline}>
            <div className="grid-3">
              {d.pitch.market.segments.map((seg, i) => (
                <div key={i} className="market-card">
                  <div className="market-tier">{seg.tier}</div>
                  <div className="market-val">{seg.value}</div>
                  <p className="market-desc">{seg.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "2rem", background: "var(--bg-alt)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1.75rem" }}>
              <h4 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.15rem", margin: "0 0 1rem 0", color: "var(--text-dark)" }}>
                Key Structural Market Catalysts in Bangladesh
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {d.pitch.market.growthDrivers.map((driver, idx) => (
                  <li key={idx} style={{ fontSize: "0.95rem", color: "var(--text-body)", display: "flex", gap: "0.75rem", lineHeight: 1.5 }}>
                    <span style={{ color: "var(--accent-clay)", fontWeight: "bold" }}>→</span>
                    {driver}
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* 06. BUSINESS MODEL                                       */}
        {/* ======================================================== */}
        <div data-section="business-model">
          <Section id="business-model" eyebrow="06. Business Model" headline={d.pitch.business_model.headline} altBg>
            <div className="grid-3">
              {d.pitch.business_model.streams.map((stream, i) => (
                <div key={i} className="biz-card">
                  <div>
                    <span className="biz-badge">{stream.badge}</span>
                    <h3 className="biz-title">{stream.title}</h3>
                    <div className="biz-price">{stream.price}</div>
                    <div className="biz-subtext">{stream.subtext}</div>
                  </div>
                  <ul className="biz-list">
                    {stream.features.map((f, j) => (
                      <li key={j}>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* 07. TRACTION & BENCHMARKS                                */}
        {/* ======================================================== */}
        <div data-section="traction">
          <Section id="traction" eyebrow="07. Traction & Benchmarks" headline={d.pitch.traction.headline}>
            <p className="section-lead">
              Our models and retrieval pipelines are benchmarked continuously against gold-standard statutory provisions and case law corpora.
            </p>
            <div className="grid-3">
              {d.pitch.traction.metrics.map((m, i) => (
                <div key={i} className="benchmark-card">
                  <span className="bench-label">{m.label}</span>
                  <div className="bench-val">{m.value}</div>
                  <div className="bench-sub">{m.sub}</div>
                  <div className="bench-bar">
                    <div className="bench-fill" style={{ width: `${m.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* 08. COMPETITION                                          */}
        {/* ======================================================== */}
        <div data-section="competition">
          <Section id="competition" eyebrow="08. Competition" headline={d.pitch.competition.headline} altBg>
            <p className="section-lead">
              Global legal-tech tools ignore regional statutory gazettes, while traditional chambers lack software scale and accessibility.
            </p>
            <div className="comp-table-wrap">
              <table className="comp-table">
                <thead>
                  <tr>
                    <th>Capability & Dimension</th>
                    <th className="highlight">Advotech Copilot</th>
                    <th>Harvey AI / Lexis+</th>
                    <th>Traditional BD Law Firms</th>
                    <th>Online Directories</th>
                  </tr>
                </thead>
                <tbody>
                  {d.pitch.competition.matrix.map((row, i) => (
                    <tr key={i}>
                      <td><strong>{row.feature}</strong></td>
                      <td className="highlight">{row.advotech}</td>
                      <td>{row.harvey}</td>
                      <td>{row.traditional}</td>
                      <td>{row.directories}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* 09. UNIQUE ADVANTAGE                                     */}
        {/* ======================================================== */}
        <div data-section="advantage">
          <Section id="advantage" eyebrow="09. Unique Advantage" headline={d.pitch.unique_advantage.headline}>
            <div className="grid-3">
              {d.pitch.unique_advantage.pillars.map((pillar, i) => (
                <div key={i} className="pillar-card">
                  <div className="pillar-icon">{pillar.icon}</div>
                  <h3 className="pillar-title">{pillar.title}</h3>
                  <p className="pillar-desc">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* 10. GO-TO-MARKET                                         */}
        {/* ======================================================== */}
        <div data-section="gtm">
          <Section id="gtm" eyebrow="10. Go-To-Market" headline={d.pitch.go_to_market.headline} altBg>
            <div className="gtm-grid">
              {d.pitch.go_to_market.phases.map((p, i) => (
                <div key={i} className="gtm-card">
                  <span className="gtm-step">{p.step}</span>
                  <span className="gtm-period">Timeline: {p.period}</span>
                  <span className="gtm-target">Target: {p.target}</span>
                  <p className="gtm-strat">{p.strategy}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* 11. VISION                                               */}
        {/* ======================================================== */}
        <div data-section="vision">
          <Section id="vision" eyebrow="11. Long-Term Vision" headline={d.pitch.vision.headline}>
            <div className="grid-3">
              {d.pitch.vision.pillars.map((v, i) => (
                <div key={i} className="pillar-card">
                  <h3 className="pillar-title">{v.title}</h3>
                  <p className="pillar-desc" style={{ whiteSpace: "pre-line" }}>
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* 12. THE TEAM (Uniform, Real Images, Correct Positions)    */}
        {/* ======================================================== */}
        <div data-section="team">
          <Section id="team" eyebrow="12. The Team" headline={d.team_name} altBg>
            <p className="section-lead">
              A multidisciplinary collective combining full-stack systems engineering, distributed AI retrieval, Bangladesh Supreme Court jurisprudence, and growth marketing.
            </p>
            <div className="grid-3">
              {d.team.map((member, i) => (
                <div key={i} className="team-card">
                  <div className="team-img-wrap">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="team-img"
                      loading="lazy"
                      style={{ objectPosition: member.objPos || "top center" }}
                    />
                  </div>
                  <div className="team-body">
                    <h3 className="team-name">{member.name}</h3>
                    <p className="team-role">{member.role}</p>
                    <a href={`mailto:${member.email}`} className="team-email">
                      {member.email}
                    </a>
                    <div className="team-exp">{member.expertise}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* ——— WHITEPAPER DIVIDER BAR ———                            */}
        {/* ======================================================== */}
        <div className="whitepaper-divider">
          <span className="whitepaper-divider-tag">Technical Whitepaper & Architecture Layer</span>
        </div>

        {/* ======================================================== */}
        {/* A. PRODUCT OVERVIEW                                      */}
        {/* ======================================================== */}
        <div data-section="overview">
          <Section id="overview" eyebrow="A. Product Overview" headline={d.tech.product_overview.headline} altBg>
            <p className="paragraph">{d.tech.product_overview.desc}</p>
            <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.4rem", margin: "2rem 0 1rem 0", color: "var(--text-dark)" }}>
              Core Target User Personas & Workflows
            </h3>
            <div className="grid-2">
              {d.tech.product_overview.users.map((u, i) => (
                <div key={i} style={{ background: "#FFFFFF", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--accent-clay)", marginBottom: "0.4rem" }}>
                    {u.persona}
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-body)", margin: 0, lineHeight: 1.55 }}>
                    {u.scenario}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* B. ARCHITECTURE                                          */}
        {/* ======================================================== */}
        <div data-section="architecture">
          <Section id="architecture" eyebrow="B. System Architecture" headline={d.tech.architecture.headline}>
            <p className="section-lead">
              Async FastAPI microservice cluster coordinated via LangGraph state graphs with Qdrant Cloud hybrid vector indexing.
            </p>

            <div className="arch-topology">
              {d.tech.architecture.layers.map((layer, i) => (
                <div key={i} className="arch-layer-card">
                  <div className="arch-layer-head">
                    <span className="arch-layer-icon">{layer.icon}</span>
                    <div>
                      <h4 className="arch-layer-title">{layer.label}</h4>
                      <span className="arch-layer-role">{layer.role}</span>
                    </div>
                  </div>
                  <ul className="arch-items">
                    {layer.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "2rem", background: "var(--bg-alt)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1.5rem" }}>
              <h4 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.1rem", margin: "0 0 0.75rem 0", color: "var(--text-dark)" }}>
                End-to-End Pipeline Execution Flow
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {d.tech.architecture.flowSteps.map((fs, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "0.75rem", fontSize: "0.88rem", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700, color: "var(--accent-clay)", width: "120px", flexShrink: 0 }}>
                      {fs.from} → {fs.to}:
                    </span>
                    <span style={{ color: "var(--text-body)" }}>{fs.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* C. DATA FLOW                                             */}
        {/* ======================================================== */}
        <div data-section="data-flow">
          <Section id="data-flow" eyebrow="C. Data Flow Pipeline" headline={d.tech.data_flow.headline} altBg>
            <div className="flow-steps">
              {d.tech.data_flow.steps.map((st, i) => (
                <div key={i} className="flow-step-card">
                  <div className="flow-step-icon">{st.icon}</div>
                  <div className="flow-step-body">
                    <div className="flow-step-label">{st.step}</div>
                    <p className="flow-step-desc">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* D. FEATURE MATRIX                                        */}
        {/* ======================================================== */}
        <div data-section="features">
          <Section id="features" eyebrow="D. Feature Matrix" headline="Production Capabilities & Deployment Status">
            <div className="matrix-toolbar">
              <span style={{ fontSize: "0.85rem", color: "var(--text-body)" }}>
                Showing <strong>{filteredMatrix.length}</strong> system capabilities:
              </span>
              <div className="matrix-filters">
                {["ALL", "LIVE", "BETA", "PLANNED"].map((st) => (
                  <button
                    key={st}
                    className={`matrix-filter-btn ${matrixFilter === st ? "active" : ""}`}
                    onClick={() => setMatrixFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="matrix-table-wrap">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th>Capability Name</th>
                    <th>Status</th>
                    <th>Module Tier</th>
                    <th>Technical Notes & Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatrix.map((f, i) => (
                    <tr key={i}>
                      <td><strong>{f.name}</strong></td>
                      <td>
                        <span className={`badge badge-${f.status.toLowerCase()}`}>{f.status}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-dark)", fontWeight: 600 }}>{f.tier}</span>
                      </td>
                      <td style={{ color: "var(--text-body)", fontSize: "0.88rem" }}>{f.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* E. TECH STACK                                            */}
        {/* ======================================================== */}
        <div data-section="tech-stack">
          <Section id="tech-stack" eyebrow="E. Technology Stack" headline="Tiered Production Infrastructure Breakdown" altBg>
            <div className="stack-grid">
              {d.tech.tech_stack.map((st, i) => (
                <div key={i} className="stack-card">
                  <span className="stack-layer">{st.layer}</span>
                  <div className="stack-items">{st.items}</div>
                  <p className="stack-desc">{st.desc}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* F. API REFERENCE                                         */}
        {/* ======================================================== */}
        <div data-section="api-docs">
          <Section id="api-docs" eyebrow="F. API Reference & Explorer" headline="REST Endpoints & FastMCP Protocol Specification">
            <div className="api-explorer">
              <div className="api-filter-tabs">
                {["All", "Auth", "Chat", "Audit", "Payments", "MCP"].map((group) => (
                  <button
                    key={group}
                    className={`api-tab-btn ${apiFilter === group ? "active" : ""}`}
                    onClick={() => setApiFilter(group)}
                  >
                    {group}
                  </button>
                ))}
              </div>

              <div className="api-list">
                {filteredApiDocs.map((api, i) => (
                  <div key={i} className="api-item">
                    <div className="api-item-top">
                      <div className="api-path-wrap">
                        <span className="badge-method">{api.method}</span>
                        <span className="api-path">{api.path}</span>
                        <span className="badge-auth">{api.auth}</span>
                      </div>
                      <button
                        className="api-copy-btn"
                        onClick={() => handleCopyEndpoint(`${api.method} ${api.path}`)}
                      >
                        {copiedEndpoint === `${api.method} ${api.path}` ? "✓ Copied" : "Copy Endpoint"}
                      </button>
                    </div>
                    <p className="api-desc">{api.desc}</p>
                    {api.payload && (
                      <div className="api-payload">
                        <span style={{ opacity: 0.6 }}>Sample Payload / Query: </span>
                        {api.payload}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* G. DATA LAYER                                            */}
        {/* ======================================================== */}
        <div data-section="data-layer">
          <Section id="data-layer" eyebrow="G. Data & Privacy Layer" headline={d.tech.data_layer.headline} altBg>
            <ul className="security-list">
              {d.tech.data_layer.points.map((pt, i) => (
                <li key={i} className="security-card">
                  <span className="security-icon">💾</span>
                  <p className="security-text">{pt}</p>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* H. AI LAYER                                              */}
        {/* ======================================================== */}
        <div data-section="ai-layer">
          <Section id="ai-layer" eyebrow="H. AI & RAG Mechanics" headline={d.tech.ai_layer.headline}>
            <ul className="security-list">
              {d.tech.ai_layer.points.map((pt, i) => (
                <li key={i} className="security-card">
                  <span className="security-icon">🧠</span>
                  <p className="security-text">{pt}</p>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* I. PRODUCT ROADMAP                                       */}
        {/* ======================================================== */}
        <div data-section="roadmap">
          <Section id="roadmap" eyebrow="I. Product Roadmap" headline="Multi-Phase Engineering & Jurisdictional Milestones" altBg>
            <div className="roadmap-grid">
              {[
                { phase: "Short-Term", ...d.tech.roadmap.short },
                { phase: "Mid-Term", ...d.tech.roadmap.mid },
                { phase: "Long-Term", ...d.tech.roadmap.long },
              ].map((rm, i) => (
                <div key={i} className="roadmap-card">
                  <span className="roadmap-badge">{rm.phase}</span>
                  <h3 className="roadmap-title">{rm.label}</h3>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "0.5rem" }}>
                    {rm.title}
                  </div>
                  <ul className="roadmap-items">
                    {rm.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* J. PERFORMANCE & SCALABILITY                             */}
        {/* ======================================================== */}
        <div data-section="performance">
          <Section id="performance" eyebrow="J. Performance & Scalability" headline={d.tech.performance.headline}>
            <div className="grid-3">
              {d.tech.performance.metrics.map((m, i) => (
                <div key={i} className="benchmark-card">
                  <span className="bench-label">{m.label}</span>
                  <div className="bench-val">{m.value}</div>
                  <div className="bench-sub">{m.note}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "2rem", background: "#FFFFFF", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1.75rem" }}>
              <h4 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.2rem", margin: "0 0 1rem 0", color: "var(--text-dark)" }}>
                Production Latency & Concurrency Optimization
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {d.tech.performance.strategies.map((st, i) => (
                  <li key={i} style={{ fontSize: "0.92rem", color: "var(--text-body)", display: "flex", gap: "0.75rem", lineHeight: 1.55 }}>
                    <span style={{ color: "var(--accent-clay)", fontWeight: "bold" }}>✓</span>
                    {st}
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* K. SECURITY & RBAC                                       */}
        {/* ======================================================== */}
        <div data-section="security">
          <Section id="security" eyebrow="K. Security & RBAC" headline={d.tech.security.headline} altBg>
            <ul className="security-list">
              {d.tech.security.points.map((pt, i) => (
                <li key={i} className="security-card">
                  <span className="security-icon">🔒</span>
                  <p className="security-text">{pt}</p>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* L. ANALYTICS & KPIS                                      */}
        {/* ======================================================== */}
        <div data-section="analytics">
          <Section id="analytics" eyebrow="L. Analytics & Telemetry" headline={d.tech.analytics.headline}>
            <div className="grid-3">
              {d.tech.analytics.kpis.map((kpi, i) => (
                <div key={i} className="benchmark-card">
                  <span className="bench-label">{kpi.label}</span>
                  <div className="bench-val">{kpi.value}</div>
                  <div className="bench-sub">{kpi.sub}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ======================================================== */}
        {/* M. CHANGELOG                                             */}
        {/* ======================================================== */}
        <div data-section="changelog">
          <Section id="changelog" eyebrow="M. Version History" headline="Continuous Deployment Changelog" altBg>
            <table className="changelog-table">
              <thead>
                <tr>
                  <th>Release</th>
                  <th>Release Date</th>
                  <th>Engineering Highlights</th>
                </tr>
              </thead>
              <tbody>
                {d.tech.changelog.map((entry, i) => (
                  <tr key={i}>
                    <td>
                      <span className="version-badge">{entry.v}</span>
                    </td>
                    <td style={{ color: "var(--text-body)", fontSize: "0.85rem", fontWeight: 600 }}>{entry.date}</td>
                    <td style={{ color: "var(--text-body)", fontSize: "0.9rem" }}>{entry.changes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>
      </main>

      {/* 🔝 BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button className="back-to-top" onClick={scrollToTop} title="Back to top">
          ↑
        </button>
      )}
    </div>
  );
}
