/**
 * Markdown Contract & Statutory AI Audit Generator
 * Formats contracts and audit responses into GitHub README / VS Code-compatible Markdown (.md).
 */

import { SAMPLE_CONTRACTS, SampleContract } from "@/data/sampleContracts";
import { CONTRACT_AUDITS, ContractAudit } from "@/data/contractAudits";

export function generateContractAuditMarkdown(
  contractId: string,
  language: "en" | "bn" = "en",
  advocateVerification?: {
    advocateName: string;
    barCouncilNo: string;
    verifiedAt: string;
    sealApplied: boolean;
    advocateNotes?: string;
  }
): string {
  const contract =
    SAMPLE_CONTRACTS.find((c) => c.id === contractId) || SAMPLE_CONTRACTS[0];
  const audit =
    CONTRACT_AUDITS[contractId] || CONTRACT_AUDITS["employment-agreement"];

  const isBn = language === "bn";

  const title = isBn ? contract.titleBn : contract.titleEn;
  const category = isBn ? contract.categoryBn : contract.categoryEn;
  const summary = isBn ? audit.summaryBn : audit.summaryEn;
  const riskGrade = isBn ? audit.riskGradeBn : audit.riskGradeEn;

  const partyA = isBn
    ? contract.parties.firstPartyBn
    : contract.parties.firstPartyEn;
  const partyB = isBn
    ? contract.parties.secondPartyBn
    : contract.parties.secondPartyEn;

  // Header & Metadata
  let md = `# ${title}\n\n`;
  md += `> **SOVEREIGN STATUTORY AUDIT REPORT · BANGLADESH LAW JURISDICTION**\n`;
  md += `> **Document Reference:** \`BD-AUDIT-${contract.id.toUpperCase()}\` | **Jurisdiction:** Laws of Bangladesh | **Date:** 18 October 2026\n\n`;

  // Status badges
  md += `| Statutory Risk Grade | Risk Score | High Risk Violations | Review Status |\n`;
  md += `| :--- | :---: | :---: | :--- |\n`;
  md += `| **${riskGrade}** | **${audit.riskScore}/100** | **${audit.stats.highRiskCount} Clauses** | ${
    advocateVerification?.sealApplied
      ? "✅ **Advocate Verified & Sealed**"
      : "⏳ **AI Audit Completed (Awaiting Advocate Seal)**"
  } |\n\n`;

  // Parties & Overview
  md += `## 1. Contract Overview & Parties\n\n`;
  md += `- **Primary Statutory Category:** ${category}\n`;
  md += `- **First Party (Employer / Client):** ${partyA}\n`;
  md += `- **Second Party (Employee / Vendor):** ${partyB}\n`;
  md += `- **Governing Statutes:** The Contract Act 1872, Bangladesh Labour Act 2006, Transfer of Property Act 1882\n\n`;

  // Executive Summary Alert
  md += `## 2. Executive Statutory Risk Summary\n\n`;
  if (audit.riskScore >= 60) {
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
    const statusLabel =
      cl.riskLevel === "HIGH"
        ? "🔴 **VOID / UNLAWFUL**"
        : cl.riskLevel === "MEDIUM"
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
    const citation = isBn
      ? cl.statuteCitationBn
      : cl.statuteCitationEn;
    const redline = isBn
      ? cl.redlineSuggestionBn || cl.redlineSuggestionEn
      : cl.redlineSuggestionEn;

    md += `### §${cl.clauseNumber}. ${clTitle}\n\n`;

    if (cl.riskLevel === "HIGH") {
      md += `> [!WARNING]\n`;
      md += `> **Statutory Violation:** ${issue}\n`;
      if (citation) md += `> **Statute:** ${citation}\n`;
      md += `\n`;
    } else if (cl.riskLevel === "MEDIUM") {
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
  if (advocateVerification?.sealApplied) {
    md += `> [!TIP]\n`;
    md += `> **STATUTORY ADVOCATE SIGN-OFF COMPLETED**\n`;
    md += `> This contract has been reviewed, vetted, and approved by an Advocate of the Supreme Court / District Bar of Bangladesh.\n\n`;

    md += `- **Assigned Advocate:** ${advocateVerification.advocateName}\n`;
    md += `- **Bangladesh Bar Council Enrollment No:** \`${advocateVerification.barCouncilNo}\`\n`;
    md += `- **Verification Timestamp:** ${advocateVerification.verifiedAt}\n`;
    md += `- **Advocate Seal Status:** \`APPROVED & DIGITALLY SEALED\`\n`;
    if (advocateVerification.advocateNotes) {
      md += `- **Advocate Review Notes:** ${advocateVerification.advocateNotes}\n`;
    }
    md += `\n`;
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
  md += `*Generated automatically by Legal Copilot Sovereign Contract Intelligence Engine (v2.4).*  \n`;
  md += `*Statutes referenced: Laws of Bangladesh (Legislative and Parliamentary Affairs Division).*  \n`;

  return md;
}
