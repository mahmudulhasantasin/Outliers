/**
 * Client-Side Sovereign PII Masking Utility
 * Performs deterministic regex and entity redaction in the browser before any analysis.
 */

export interface PiiRedactionResult {
  redactedText: string;
  stats: {
    emailsCount: number;
    phonesCount: number;
    nidsCount: number;
    namesCount: number;
    totalRedactions: number;
  };
}

const KNOWN_ENTITIES = [
  "Nexus Technologies Ltd.",
  "নেক্সাস টেকনোলজিস লিমিটেড",
  "Shamim Ahmed",
  "শামীম আহমেদ",
  "Prime Trading Corporation",
  "প্রাইম ট্রেডিং কর্পোরেশন",
  "CloudSolve Bangladesh",
  "ক্লাউডসলভ বাংলাদেশ",
  "Global Creative Agency",
  "গ্লোবাল ক্রিয়েটিভ এজেন্সী",
  "Asif Iqbal",
  "আসিফ ইকবাল",
];

export function maskPii(text: string, enabled: boolean = true): PiiRedactionResult {
  if (!enabled || !text) {
    return {
      redactedText: text,
      stats: { emailsCount: 0, phonesCount: 0, nidsCount: 0, namesCount: 0, totalRedactions: 0 },
    };
  }

  let result = text;
  let emailsCount = 0;
  let phonesCount = 0;
  let nidsCount = 0;
  let namesCount = 0;

  // 1. Email Redaction
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  result = result.replace(emailRegex, () => {
    emailsCount++;
    return "[REDACTED_EMAIL]";
  });

  // 2. Phone Redaction (Bangladesh & International patterns)
  const phoneRegex = /(\+?880\s?1[3-9]\d{8}|01[3-9]\d{8}|\+?[1-9]\d{1,14})/g;
  result = result.replace(phoneRegex, (match) => {
    if (match.length >= 7 && !match.startsWith("1872") && !match.startsWith("2006")) {
      phonesCount++;
      return "[REDACTED_PHONE]";
    }
    return match;
  });

  // 3. Bangladeshi National ID (NID) Redaction
  // Handles: 10-digit Smart NID, 13-digit NID, 17-digit old NID (birth year + 13 digits)
  const nidRegex = /\b((19\d{2}|20\d{2})\d{13}|\d{17}|\d{13}|\d{10})\b/g;
  result = result.replace(nidRegex, (match) => {
    if (match.startsWith("1872") || match.startsWith("2006000000")) {
      return match;
    }
    nidsCount++;
    return "[REDACTED_NID]";
  });

  // 4. Known Entity / Person Names
  for (const name of KNOWN_ENTITIES) {
    if (result.includes(name)) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "g");
      const matches = result.match(regex);
      if (matches) {
        namesCount += matches.length;
        result = result.replace(regex, "[REDACTED_PARTY]");
      }
    }
  }

  return {
    redactedText: result,
    stats: {
      emailsCount,
      phonesCount,
      nidsCount,
      namesCount,
      totalRedactions: emailsCount + phonesCount + nidsCount + namesCount,
    },
  };
}
