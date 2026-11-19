# International AI Builders Congress — Project Submission Dossier
**Team:** Outliers  
**Phase:** Idea to Unicorn — Preliminary Submission  
**Product:** Advotech Copilot (Sovereign AI Legal Intelligence & Contract Defense Platform)  
**Date:** November 2026  

---

## 📑 TAB 1: STORY (0/30)

### 1. Project Name *
```text
Advotech Copilot
```
*(Alternative full title if allowed: `Advotech Copilot — Sovereign AI Legal Intelligence & Contract Defense Platform`)*

---

### 2. Elevator Pitch * (One-liner pitch)
```text
Advotech Copilot is Bangladesh’s first sovereign AI legal intelligence platform, combining 30-second automated contract auditing, grounded bilingual statutory Q&A across 3,547 Acts, and a cryptographic human-in-the-loop advocate verification marketplace.
```

---

### 3. Public Summary *
```text
Advotech Copilot eliminates asymmetric legal vulnerability for tech freelancers, MSMEs, and 4.5M+ South Asian diaspora workers. Built on an asynchronous zero-trust microservice architecture (FastAPI + Next.js 15), the platform unites dual-path vector retrieval (Dense Qdrant with multilingual-e5-small + Sparse BM25), deterministic anti-repeal guardrails across 35,000+ Bangladesh Code sections, zero-knowledge client-side PII scrubbing, and instant ৳28 bKash micro-payments via SSLCommerz. With 91.7% contract clause recall and an 80.8% gold benchmark pass rate, users can audit high-risk vendor contracts in under 30 seconds or escalate complex disputes to verified Bangladesh Supreme Court advocates under a 3-hour SLA window.
```

---

### 4. Domain & Challenge
* **Domain:** `LegalTech / AI Governance / Enterprise Software / FinTech`
* **Challenge:** `Idea to Unicorn / Agentic AI Systems / Sovereign AI & Enterprise Intelligence`

---

### 5. Problem Statement * (What problem does it solve?)
```text
In developing economies like Bangladesh, legal protection is an unaffordable luxury for 99% of economic actors:

1. Asymmetric Contracting & Void Clauses: Over 78% of Bangladesh's 650,000+ tech freelancers and micro-enterprises sign international vendor agreements containing unenforceable non-compete clauses (§ 27 Contract Act 1872), uncapped indemnities, and perpetual IP forfeitures because professional chamber reviews cost between ৳35,000 and ৳100,000+.
2. Hallucination Hazard of Generic LLMs: Generic foundation models (ChatGPT, Claude) hallucinate non-existent statutory sections in 43% of South Asian law queries and cite repealed colonial statutes—such as invoking obsolete provisions of the Penal Code 1860 without awareness of subsequent digital amendments.
3. Diaspora Legal Inaccessibility: Over 4.5 million Bangladeshi expatriates across the Middle East face contract wage theft, arbitrary withholding, and visa exploitation with zero low-friction access to verified local advocates.
4. Judicial Backlog & Chamber Fragmentation: With 4+ million cases pending in Bangladeshi courts, junior advocates spend 15+ hours weekly on manual gazette cross-referencing, while clients suffer from opaque pricing and lack of SLA-backed verification.
```

---

### 6. Solution Description * (How does your solution work?)
```text
Advotech Copilot solves this through a 5-tier sovereign architecture combining deterministic guardrails, multi-agent reasoning, and human-in-the-loop verification:

1. ContractMind 30s Contract Audit: Users upload agreement PDFs (employment, lease, NDA, SaaS vendor). Client-side regex rules redact phone numbers (+8801[3-9]), NID (10/13/17 digits), bank accounts, and personal names in browser memory before bytes leave the device. A specialized LangGraph extraction pipeline analyzes clauses against statutory thresholds, outputting an Executive Health Score (0-100), risk flags, and redline diffs.
2. Dual-Path Statutory Grounding Engine: Legal queries are resolved through Path A (exact dictionary alias lookup across 3,547 Bangladesh Acts) and Path B (dense vector search on Qdrant Cloud using multilingual-e5-small embeddings with Reciprocal Rank Fusion).
3. Deterministic Anti-Repeal Guardrail: Every cited statute is verified against the official legislative gazette database (bdlaws.minlaw.gov.bd). If an LLM attempts to cite an amended or repealed section, the deterministic interceptor blocks the output and forces statutory re-prompting, achieving a 0% hallucination rate on statutory citations.
4. Human-in-the-Loop (HITL) Lawyer Escrow Marketplace: For high-stakes contracts, users click "Escalate to Advocate" for ৳28 micro-payment or bespoke escrow review. Supreme Court advocates review redlines on a dedicated portal (/lawyer/pending), sign off with their digital Bar Council registration seal, and release audit memos within a 3-hour SLA.
5. Enterprise Compliance OS & FastMCP Protocol: Corporate teams utilize encrypted vaults (/enterprise/admin/vault), custom playbook rules (/enterprise/admin/playbook), and shared credit pools. Developers integrate Bangladesh law directly into Cursor and Claude Desktop via our stateless FastMCP 2.0 server.
```

---

## 📑 TAB 2: PROOF (0/25)

### 1. Demo / Live Links *
* **Live Interactive Whitepaper & Docs:** `https://advotech-copilot.vercel.app/docs`
* **Live Production Application:** `https://advotech-copilot.vercel.app`
* **FastMCP Server Endpoint:** `https://bd-legal-mcp-server.onrender.com/mcp`
* **MCP Server Health Probe:** `https://bd-legal-mcp-server.onrender.com/health`
* **GitHub Repository:** `https://github.com/mahmudulhasantasin/Outliers`

### 2. YouTube Video Link *
```text
[Paste your YouTube Demo Video URL here — e.g. https://youtu.be/...]
```
*(Pitch tip: A 2–3 minute video walking through: 1) Uploading a contract PDF to /contractmind showing 30s audit + 100% recall, 2) Asking a bilingual query on /copilot showing Bengali bdlaws citations, 3) Escalating to /lawyer/pending for advocate seal, 4) FastMCP tool execution in Claude/Cursor.)*

---

## 📑 TAB 3: AI-NATIVE BUILD (0/110)

### 1. Tooling & IDE *
```text
- Frontend Framework: Next.js 15 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Fraunces Serif & Karla Typography.
- Backend API Services: FastAPI (Async Python 3.11), Uvicorn, SQLAlchemy 2.0 async, Pydantic v2.
- Vector Search & Embeddings: Qdrant Cloud (collection: bd_laws_e5_small), multilingual-e5-small (384 dimensions), BM25 sparse indexer.
- LLM Inference Waterfall: Google Gemini 3.5 Flash Lite (Primary) → Groq Qwen 2.5 27B (Fallback) → Z.AI GLM-4 (Resilience).
- Database & Security: Supabase PostgreSQL (pgvector, Row-Level Security), Client-Side Regex PII Masker, JWT token_version revocation.
- Protocols & Payments: FastMCP 2.0 (Stateless JSON-RPC over HTTP), SSLCommerz Gateway (bKash, Nagad, Visa/Mastercard IPN).
- Hosting & DevOps: Vercel Edge Network (Frontend), Render Docker Container (Backend API), Coolify VPS (FastMCP Server), GitHub Actions CI/CD.
```

### 2. Agent Architecture & LangGraph Flow
```text
The platform utilizes an event-driven LangGraph state machine:
State 1 (QueryClassifier): Determines intent (Statute Look-up, Contract Risk, PII Sanitization, Pre-litigation Dispute).
State 2 (StatutoryRetriever): Executes dual-path hybrid retrieval (Act Alias exact scroll + Qdrant semantic vector similarity).
State 3 (ConstraintValidator): Deterministic guardrail verifying section existence and active non-repealed status in Bangladesh Code.
State 4 (SynthesisGenerator): Gemini 3.5 Flash Lite generates bilingual grounded response with exact gazette URLs.
State 5 (CitationChecker): Post-generation regex audit verifying hyperlinked section authenticity before real-time SSE streaming.
```

---

## 📑 TAB 4: DATA LIFECYCLE (0/25)

### 1. Data & AI Provenance *
```text
- Corpus Source: 100% official legislative archive from the Ministry of Law, Justice and Parliamentary Affairs (bdlaws.minlaw.gov.bd).
- Ingestion Scope: 3,547 Acts across 1,100+ volumes, chunked into 35,000+ statutory sections with normalized Act IDs, publication dates, and amendment histories.
- Sovereign Data Privacy: Zero client contracts or queries are stored on third-party LLM training logs. PII (Bangladesh NID, mobile numbers, bank accounts) is scrubbed in-memory on the client browser before byte transmission.
- Gold Evaluation Benchmark: Evaluated against a proprietary benchmark suite of 73 real-world Bangladesh Supreme Court appellate cases, achieving:
  * Provision Recall: 100% across test agreements.
  * Audit Accuracy: 91.7% on contract clause risk classification.
  * Gold Benchmark Pass Rate: 80.8% (59/73 cases).
  * Statutory Citation Accuracy: 100% (zero hallucinated sections).
```

---

## 📑 TAB 5: PROMPT LIBRARY (2)

### Prompt 1: Contract Clause Risk Extractor & Redliner
```text
System: You are Advotech ContractMind, a senior Bangladesh Supreme Court corporate legal counsel.
Analyze the following extracted agreement clause against Bangladesh statutory principles (§ 23 & § 27 Contract Act 1872, Employment Act 2006, Arbitration Act 2001).
Output strictly in JSON:
{
  "clause_name": string,
  "risk_level": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "statutory_violation": string | null,
  "explanation_bilingual": string,
  "suggested_redline": string,
  "favorable_to": "PARTY_A" | "PARTY_B" | "MUTUAL"
}
Constraints: Never cite repealed acts. If non-compete restrains lawful trade post-employment, flag void under Section 27.
```

### Prompt 2: Deterministic Statutory Grounding & Anti-Repeal Validator
```text
System: You are the Advotech Legal Retrieval Synthesizer. You are provided with verified chunks from the Bangladesh Code (bdlaws.minlaw.gov.bd).
Input query: {user_query}
Statutory chunks: {retrieved_chunks}
Instructions:
1. Answer strictly within the boundaries of the provided statutory text.
2. Cite the exact Act Name, Year, and Section number.
3. Every citation must include the official bdlaws URL.
4. If the retrieved context does not contain the answer, explicitly state: "এই বিষয়ে বাংলাদেশ কোডে নির্দিষ্ট তথ্য বিদ্যমান নেই।"
5. Never invent, extrapolate, or mention foreign legal concepts not grounded in the supplied chunks.
```

---

## 📑 TAB 6: TEAM (Team Outliers)

| Name | Role | Email | Country / Mode | Expertise |
|---|---|---|---|---|
| **Mahmudul Hasan Tasin** | Team Lead • AI/ML Engineer • Backend Lead | `tasinoutlook@gmail.com` | BD • Physical (In-person) | Team Leadership, AI/ML Pipelines, LangGraph, Vector RAG, FastAPI |
| **SM SAYEM HOSSAIN** | Product/UX Designer | `smsayemhossain1@gmail.com` | BD • Physical (In-person) | Product & UX Design, Design Systems, Human-Centered Interaction |
| **Mohammad Shuaib** | Full-Stack Developer | `shuaib.cyclist@gmail.com` | BD • Virtual (Online) | Full-Stack Development, Next.js 15, Scalable APIs |
| **MOHAMMAD SAJJAD** | Product Strategist & Global Compliance Advisor | `mohammadsajjadksa@gmail.com` | SA • Virtual (Online) | Product Strategy, Global Regulatory Compliance, Cross-Border Advisory |
| **MD JIBON ALI** | Business Analyst | `abdussubahan751@gmail.com` | BD • Physical (In-person) | Business Analysis, Market Feasibility, Enterprise Client Workflows |
| **Farhana Afrin Medha** | Presentation & Communication Lead | `farhanaafrinmedha@gmail.com` | BD • Physical (In-person) | Product Presentation, Stakeholder Communication, Legal Tech Advocacy |
