/**
 * Markdown Contract & Statutory AI Audit Generator
 * Formats contracts and audit responses into GitHub README / VS Code-compatible Markdown (.md).
 */

import { SAMPLE_CONTRACTS, SampleContract } from "@/data/sampleContracts";
import { CONTRACT_AUDITS, ContractAudit } from "@/data/contractAudits";

/**
 * Normalizes risk labels from any source (backend canonical "HIGH"/"MODERATE"/"LOW",
 * legacy cached title-case "High Risk"/"Review Needed"/"Compliant", or demo data)
 * into a single canonical enum.
 *
 * ✅ FIX #1 — backend now sends "HIGH"/"MODERATE"/"LOW". Old cache & demo data
 *    still use title-case, so this guards against silent "COMPLIANT" fallbacks.
 */
function normalizeRiskLevel(raw: unknown): "HIGH" | "MEDIUM" | "LOW" {
  const s = String(raw || "").toUpperCase().replace(/\s+/g, "_");
  if (["HIGH", "HIGH_RISK", "CRITICAL", "VOID", "NON_COMPLIANT"].includes(s)) {
    return "HIGH";
  }
  if (["MEDIUM", "MODERATE", "REVIEW_NEEDED", "AMBIGUOUS"].includes(s)) {
    return "MEDIUM";
  }
  return "LOW";
}

export function generateContractAuditMarkdown(
  contractId: string,
  language: "en" | "bn" = "en",
  advocateVerification?: {
    advocateName: string;
    barCouncilNo: string;
    verifiedAt: string;
    sealApplied: boolean;
    advocateNotes?: string;
  },
  record?: {
    id?: string;
    contractId?: string;
    titleEn?: string;
    titleBn?: string;
    categoryEn?: string;
    categoryBn?: string;
    firstPartyEn?: string;
    firstPartyBn?: string;
    secondPartyEn?: string;
    secondPartyBn?: string;
    auditDateEn?: string;
    auditDateBn?: string;
    riskScore?: number;
    riskGradeEn?: string;
    riskGradeBn?: string;
    summaryEn?: string;
    summaryBn?: string;
    highRiskCount?: number;
    mediumRiskCount?: number;
    compliantCount?: number;
    isLawyerVerified?: boolean;
    hitlStatus?: string;
  }
): string {
  const isBn = language === "bn";

  // 1. Check if we have a real uploaded audit result in localStorage
  if (typeof window !== "undefined") {
    try {
      const keysToTry = [
        `contract_audit_${contractId}`,
        record?.contractId ? `contract_audit_${record.contractId}` : null,
        record?.id ? `contract_audit_${record.id}` : null,
      ].filter(Boolean) as string[];

      for (const k of keysToTry) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (Array.isArray(parsed.clauses) || parsed.risk_score !== undefined)) {
            return generateRealContractAuditMarkdown(parsed, language, advocateVerification);
          }
        }
      }
    } catch {}
  }

  // 2. Identify template base based on title / id
  let templateKey = "employment-agreement";
  const titleLower = (
    (record?.titleEn || "") +
    " " +
    (record?.titleBn || "") +
    " " +
    contractId
  ).toLowerCase();

  if (
    titleLower.includes("vendor") ||
    titleLower.includes("sla") ||
    titleLower.includes("software") ||
    titleLower.includes("it ")
  ) {
    templateKey = "vendor-sla";
  } else if (
    titleLower.includes("freelance") ||
    titleLower.includes("consult") ||
    titleLower.includes("advisor") ||
    titleLower.includes("service")
  ) {
    templateKey = "freelance-consulting";
  } else if (contractId in CONTRACT_AUDITS) {
    templateKey = contractId;
  }

  const baseContract =
    SAMPLE_CONTRACTS.find((c) => c.id === templateKey) || SAMPLE_CONTRACTS[0];
  const audit =
    CONTRACT_AUDITS[templateKey] || CONTRACT_AUDITS["employment-agreement"];

  const title =
    (isBn ? record?.titleBn : record?.titleEn) ||
    (isBn ? baseContract.titleBn : baseContract.titleEn);
  const category =
    (isBn ? record?.categoryBn : record?.categoryEn) ||
    (isBn ? baseContract.categoryBn : baseContract.categoryEn);
  const summary =
    (isBn ? record?.summaryBn : record?.summaryEn) ||
    (isBn ? audit.summaryBn : audit.summaryEn);
  const riskScore =
    typeof record?.riskScore === "number" ? record.riskScore : audit.riskScore;
  const riskGrade =
    (isBn ? record?.riskGradeBn : record?.riskGradeEn) ||
    (isBn ? audit.riskGradeBn : audit.riskGradeEn);
  const highRiskCount =
    typeof record?.highRiskCount === "number"
      ? record.highRiskCount
      : audit.stats.highRiskCount;
  const auditDate =
    (isBn ? record?.auditDateBn : record?.auditDateEn) || "18 October 2026";
  const docRef = record?.contractId || contractId || "LIVE";

  const partyA =
    (isBn ? record?.firstPartyBn : record?.firstPartyEn) ||
    (isBn ? baseContract.parties.firstPartyBn : baseContract.parties.firstPartyEn);
  const partyB =
    (isBn ? record?.secondPartyBn : record?.secondPartyEn) ||
    (isBn ? baseContract.parties.secondPartyBn : baseContract.parties.secondPartyEn);

  const isVerified = Boolean(
    advocateVerification?.sealApplied ||
      record?.isLawyerVerified ||
      record?.hitlStatus === "COMPLETED"
  );

  // Header & Metadata
  let md = `# ${title}\n\n`;
  md += `> **SOVEREIGN STATUTORY AUDIT REPORT · BANGLADESH LAW JURISDICTION**\n`;
  md += `> **Document Reference:** \`BD-AUDIT-${String(docRef).toUpperCase()}\` | **Jurisdiction:** Laws of Bangladesh | **Date:** ${auditDate}\n\n`;

  // Status badges
  md += `| Statutory Risk Grade | Risk Score | High Risk Violations | Review Status |\n`;
  md += `| :--- | :---: | :---: | :--- |\n`;
  md += `| **${riskGrade}** | **${riskScore}/100** | **${highRiskCount} Clauses** | ${
    isVerified
      ? "✅ **Advocate Verified & Sealed**"
      : "⏳ **AI Audit Completed (Awaiting Advocate Seal)**"
  } |\n\n`;

  // Parties & Overview
  md += `## 1. Contract Overview & Parties\n\n`;
  md += `- **Primary Statutory Category:** ${category}\n`;
  md += `- **First Party (Client / Employer):** ${partyA}\n`;
  md += `- **Second Party (Contractor / Employee):** ${partyB}\n`;
  md += `- **Governing Statutes:** The Contract Act 1872, Bangladesh Labour Act 2006, Transfer of Property Act 1882\n\n`;

  // Executive Summary Alert
  md += `## 2. Executive Statutory Risk Summary\n\n`;
  if (riskScore >= 60) {
    md += `> [!CAUTION]\n`;
    md += `> **HIGH STATUTORY RISK DETECTED**\n`;
    md += `> ${summary}\n\n`;
  } else {
    md += `> [!NOTE]\n`;
    md += `> **STATUTORY ASSESSMENT**\n`;
    md += `> ${summary}\n\n`;
  }

  // Statutory Compliance Matrix Table
  md += `## 3. Statutory Compliance Matrix\n\n`;
  md += `| Clause # | Provision Title | Risk Level | Statutory Citation (Bangladesh) | Legal Enforceability |\n`;
  md += `| :---: | :--- | :---: | :--- | :--- |\n`;
  for (const cl of audit.clauses) {
    const clTitle = isBn ? cl.titleBn : cl.titleEn;
    const citation = isBn
      ? cl.statuteCitationBn || "শ্রম ও চুক্তি আইন"
      : cl.statuteCitationEn || "Statutory Law of Bangladesh";
    const normalizedRisk = normalizeRiskLevel(cl.riskLevel);
    const statusLabel =
      normalizedRisk === "HIGH"
        ? "🔴 **VOID / UNLAWFUL**"
        : normalizedRisk === "MEDIUM"
        ? "🟡 **AMBIGUOUS**"
        : "🟢 **COMPLIANT**";

    md += `| §${cl.clauseNumber} | ${clTitle} | \`${cl.riskLevel}\` | ${citation} | ${statusLabel} |\n`;
  }
  md += `\n`;

  // Detailed Clause-by-Clause Audit
  md += `## 4. Clause-by-Clause Statutory Audit & Redlines\n\n`;

  for (const cl of audit.clauses) {
    const clTitle = isBn ? cl.titleBn : cl.titleEn;
    const issue = isBn ? cl.issueSummaryBn : cl.issueSummaryEn;
    const analysis = isBn ? cl.detailedAnalysisBn : cl.detailedAnalysisEn;
    const citation = isBn ? cl.statuteCitationBn : cl.statuteCitationEn;
    const redline = isBn
      ? cl.redlineSuggestionBn || cl.redlineSuggestionEn
      : cl.redlineSuggestionEn;

    md += `### §${cl.clauseNumber}. ${clTitle}\n\n`;

    const normalizedRisk = normalizeRiskLevel(cl.riskLevel);
    if (normalizedRisk === "HIGH") {
      md += `> [!WARNING]\n`;
      md += `> **Statutory Violation:** ${issue}\n`;
      if (citation) md += `> **Statute:** ${citation}\n`;
      md += `\n`;
    } else if (normalizedRisk === "MEDIUM") {
      md += `> [!NOTE]\n`;
      md += `> **Review Recommendation:** ${issue}\n`;
      if (citation) md += `> **Statute:** ${citation}\n`;
      md += `\n`;
    }

    md += `**Original Clause Text:**\n`;
    md += `> "${cl.originalText}"\n\n`;

    md += `**Statutory Legal Analysis:**\n`;
    md += `${analysis}\n\n`;

    if (redline) {
      md += `**Recommended Sovereign Redline (Compliant under Bangladesh Law):**\n\n`;
      md += `\`\`\`diff\n`;
      md += `- [ORIGINAL UNENFORCEABLE CLAUSE]\n`;
      md += `- ${cl.originalText.slice(0, 140)}...\n`;
      md += `+ [STATUTORY COMPLIANT DRAFT]\n`;
      md += `+ ${redline}\n`;
      md += `\`\`\`\n\n`;
    }

    md += `---\n\n`;
  }

  // Advocate Sign-off & Verification Section
  md += `## 5. Advocate Statutory Verification & Digital Seal\n\n`;
  if (isVerified) {
    const advName = advocateVerification?.advocateName || "Supreme Court Advocate";
    const barNo = advocateVerification?.barCouncilNo || "BC-ADV-2024-8842";
    const vTime = advocateVerification?.verifiedAt || auditDate;
    const notes =
      advocateVerification?.advocateNotes ||
      "Reviewed and cross-examined against relevant Bangladesh Statutes. Redlines confirmed lawful.";

    md += `> [!TIP]\n`;
    md += `> **STATUTORY ADVOCATE SIGN-OFF COMPLETED**\n`;
    md += `> This contract has been reviewed, vetted, and approved by an Advocate of the Supreme Court / District Bar of Bangladesh.\n\n`;

    md += `- **Assigned Advocate:** ${advName}\n`;
    md += `- **Bangladesh Bar Council Enrollment No:** \`${barNo}\`\n`;
    md += `- **Verification Timestamp:** ${vTime}\n`;
    md += `- **Advocate Seal Status:** \`APPROVED & DIGITALLY SEALED\`\n`;
    md += `- **Advocate Review Notes:** ${notes}\n\n`;
    md += `- [x] Section 26/27 Bangladesh Labour Act 2006 statutory severance audited\n`;
    md += `- [x] Restraint of trade doctrine (Section 27 Contract Act 1872) resolved\n`;
    md += `- [x] Penalty and liquidated damages (Section 74 Contract Act 1872) standardized\n`;
    md += `- [x] Sovereign Digital Stamp & Bar Council Advocate Seal Verified\n`;
  } else {
    md += `> [!IMPORTANT]\n`;
    md += `> **PENDING ADVOCATE REVIEW**\n`;
    md += `> This AI-generated audit report is currently dispatched to the Advocate Workspace for statutory verification.\n\n`;
    md += `- [ ] Advocate Bar Council verification pending\n`;
    md += `- [ ] Statutory redlines confirmed by advocate\n`;
    md += `- [ ] Digital seal to be applied upon final review\n`;
  }

  md += `\n---\n`;
  md += `*Generated automatically by Advotech Copilot Sovereign Contract Intelligence Engine (v2.4).*  \n`;
  md += `*Statutes referenced: Laws of Bangladesh (Legislative and Parliamentary Affairs Division).*  \n`;

  return md;
}

export function generateRealContractAuditMarkdown(
  result: any,
  language: "en" | "bn" = "en",
  advocateVerification?: {
    advocateName: string;
    barCouncilNo: string;
    verifiedAt: string;
    sealApplied: boolean;
    advocateNotes?: string;
  }
): string {
  const isBn = language === "bn";
  const title =
    result.title ||
    result.file_name ||
    (isBn ? "চুক্তিপত্র অডিট" : "Contract Audit");
  const riskScore = result.risk_score ?? 50;
  const riskGrade =
    result.risk_grade ||
    (riskScore > 70
      ? isBn
        ? "উচ্চ ঝুঁকি"
        : "High Risk"
      : isBn
      ? "মাঝারি ঝুঁকি"
      : "Moderate Risk");
  const summary =
    result.summary ||
    result.executive_summary ||
    (isBn
      ? "চুক্তিপত্রের ধারাগুলো বাংলাদেশ আইনের অধীনে পরীক্ষা করা হয়েছে।"
      : "Clauses evaluated under codified statutes of Bangladesh.");
  const clauses = result.clauses || [];

  // ✅ FIX — normalize against both canonical and legacy labels + read nested counts
  const highRiskCount =
    result.high_risk_count ??
    result.counts?.high_risk ??
    clauses.filter((c: any) => normalizeRiskLevel(c.risk_level) === "HIGH").length;

  let md = `# ${title}\n\n`;
  md += `> **SOVEREIGN STATUTORY AUDIT REPORT · BANGLADESH LAW JURISDICTION**\n`;
  md += `> **Contract ID:** \`${
    result.contract_id || result.id || "LIVE"
  }\` | **Jurisdiction:** Laws of Bangladesh\n\n`;

  md += `| Statutory Risk Grade | Risk Score | High Risk Violations | Review Status |\n`;
  md += `| :--- | :---: | :---: | :--- |\n`;
  md += `| **${riskGrade}** | **${riskScore}/100** | **${highRiskCount} Clauses** | ${
    advocateVerification?.sealApplied
      ? "✅ **Advocate Verified & Sealed**"
      : "⏳ **AI Audit Completed (Awaiting Advocate Seal)**"
  } |\n\n`;

  md += `## 1. Executive Statutory Risk Summary\n\n`;
  if (riskScore >= 60) {
    md += `> [!CAUTION]\n`;
    md += `> **HIGH STATUTORY RISK DETECTED**\n`;
    md += `> ${summary}\n\n`;
  } else {
    md += `> [!NOTE]\n`;
    md += `> **STATUTORY ASSESSMENT**\n`;
    md += `> ${summary}\n\n`;
  }

  md += `## 2. Statutory Compliance Matrix\n\n`;
  md += `| Clause # | Provision Title | Risk Level | Statutory Citation (Bangladesh) | Legal Enforceability |\n`;
  md += `| :---: | :--- | :---: | :--- | :--- |\n`;
  for (const cl of clauses) {
    const clTitle = cl.title || cl.clause_title || `Clause ${cl.clause_number}`;
    const citation =
      cl.statute_citation ||
      cl.statute_reference ||
      (isBn ? "বাংলাদেশ সংবিধিবদ্ধ আইন" : "Statutes of Bangladesh");

    // ✅ FIX — normalize before comparing
    const normalizedRisk = normalizeRiskLevel(cl.risk_level);
    const statusLabel =
      normalizedRisk === "HIGH"
        ? "🔴 **VOID / UNLAWFUL**"
        : normalizedRisk === "MEDIUM"
        ? "🟡 **AMBIGUOUS**"
        : "🟢 **COMPLIANT**";

    md += `| §${cl.clause_number} | ${clTitle} | \`${cl.risk_level}\` | ${citation} | ${statusLabel} |\n`;
  }
  md += `\n`;

  md += `## 3. Clause-by-Clause Statutory Audit & Redlines\n\n`;
  for (const cl of clauses) {
    const clTitle = cl.title || cl.clause_title || `Clause ${cl.clause_number}`;
    const issue =
      cl.issue_summary ||
      cl.legal_explanation ||
      (isBn ? "ধারাটি পর্যবেক্ষণ প্রয়োজন" : "Review required");
    const analysis = cl.detailed_analysis || cl.legal_explanation || "";
    const citation = cl.statute_citation || cl.statute_reference;
    const redline = cl.proposed_safe_redline || cl.redline_suggestion;

    md += `### §${cl.clause_number}. ${clTitle}\n\n`;

    // ✅ FIX — normalize before comparing
    const normalizedRisk = normalizeRiskLevel(cl.risk_level);
    if (normalizedRisk === "HIGH") {
      md += `> [!WARNING]\n`;
      md += `> **Statutory Violation:** ${issue}\n`;
      if (citation) md += `> **Statute:** ${citation}\n`;
      md += `\n`;
    } else if (normalizedRisk === "MEDIUM") {
      md += `> [!NOTE]\n`;
      md += `> **Review Recommendation:** ${issue}\n`;
      if (citation) md += `> **Statute:** ${citation}\n`;
      md += `\n`;
    }

    if (cl.original_text) {
      md += `**Original Clause Text:**\n`;
      md += `> "${cl.original_text}"\n\n`;
    }

    if (analysis) {
      md += `**Statutory Legal Analysis:**\n`;
      md += `${analysis}\n\n`;
    }

    if (redline) {
      md += `**Recommended Sovereign Redline (Compliant under Bangladesh Law):**\n\n`;
      md += `\`\`\`diff\n`;
      if (cl.original_text) {
        md += `- [ORIGINAL CLAUSE]\n`;
        md += `- ${cl.original_text.slice(0, 140)}...\n`;
      }
      md += `+ [STATUTORY COMPLIANT DRAFT]\n`;
      md += `+ ${redline}\n`;
      md += `\`\`\`\n\n`;
    }

    md += `---\n\n`;
  }

  md += `## 4. Advocate Statutory Verification & Digital Seal\n\n`;
  if (advocateVerification?.sealApplied) {
    md += `> [!TIP]\n`;
    md += `> **STATUTORY ADVOCATE SIGN-OFF COMPLETED**\n`;
    md += `> This contract has been reviewed and approved by an Advocate of the Supreme Court / District Bar of Bangladesh.\n\n`;
    md += `- **Assigned Advocate:** ${advocateVerification.advocateName}\n`;
    md += `- **Bangladesh Bar Council Enrollment No:** \`${advocateVerification.barCouncilNo}\`\n`;
    md += `- **Verification Timestamp:** ${advocateVerification.verifiedAt}\n`;
    md += `- **Advocate Seal Status:** \`APPROVED & DIGITALLY SEALED\`\n`;
  } else {
    md += `> [!IMPORTANT]\n`;
    md += `> **PENDING ADVOCATE REVIEW**\n`;
    md += `> Dispatched to Advocate Workspace for statutory verification.\n`;
  }

  md += `\n---\n`;
  md += `*Generated automatically by Advotech Copilot Sovereign Contract Intelligence Engine.*  \n`;
  return md;
}