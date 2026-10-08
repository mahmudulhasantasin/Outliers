export interface ClauseAudit {
  id: string;
  clauseNumber: number;
  titleEn: string;
  titleBn: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW" | "COMPLIANT";
  originalText: string;
  statutoryReferenceId?: string;
  statuteCitationEn?: string;
  statuteCitationBn?: string;
  issueSummaryEn: string;
  issueSummaryBn: string;
  detailedAnalysisEn: string;
  detailedAnalysisBn: string;
  redlineSuggestionEn?: string;
  redlineSuggestionBn?: string;
  keyObligationsEn: string[];
  keyObligationsBn: string[];
}

export interface ContractAudit {
  contractId: string;
  riskScore: number; // 0 - 100
  riskGradeEn: "High Risk" | "Medium Risk" | "Low Risk" | "Safe";
  riskGradeBn: "উচ্চ ঝুঁকি" | "মাঝারি ঝুঁকি" | "নিম্ন ঝুঁকি" | "নিরাপদ";
  summaryEn: string;
  summaryBn: string;
  stats: {
    highRiskCount: number;
    mediumRiskCount: number;
    compliantCount: number;
    totalClauses: number;
  };
  clauses: ClauseAudit[];
}

export const CONTRACT_AUDITS: Record<string, ContractAudit> = {
  "employment-agreement": {
    contractId: "employment-agreement",
    riskScore: 78,
    riskGradeEn: "High Risk",
    riskGradeBn: "উচ্চ ঝুঁকি",
    summaryEn:
      "This employment agreement contains 2 high-risk clauses that directly conflict with mandatory Bangladesh labor statutes (Section 26 of the Bangladesh Labour Act 2006 and Section 27 of The Contract Act 1872).",
    summaryBn:
      "এই নিয়োগ চুক্তিপত্রে ২টি উচ্চ ঝুঁকিপূর্ণ ধারা রয়েছে যা সরাসরি বাংলাদেশের বাধ্যতামূলক শ্রম আইন (শ্রম আইন ২০০৬-এর ধারা ২৬) এবং চুক্তি আইন ১৮৭২-এর ধারা ২৭ পরিপন্থী।",
    stats: {
      highRiskCount: 2,
      mediumRiskCount: 1,
      compliantCount: 2,
      totalClauses: 5
    },
    clauses: [
      {
        id: "emp-c1",
        clauseNumber: 1,
        titleEn: "Scope of Work",
        titleBn: "কাজের পরিধি",
        riskLevel: "COMPLIANT",
        originalText:
          "The Employee shall perform software engineering, architecture design, and deployment tasks exclusively for the Employer.",
        issueSummaryEn: "Standard scope definition with reasonable domain exclusivity.",
        issueSummaryBn: "মানসম্মত দায়িত্ব বর্ণনা এবং স্বাভাবিক পেশাগত এখতিয়ার।",
        detailedAnalysisEn:
          "This clause outlines standard employee obligations without unlawful covenants.",
        detailedAnalysisBn:
          "এই ধারায় কর্মীদের স্বাভাবিক দায়িত্ব স্পষ্টভাবে বর্ণিত এবং কোনো আইনপরিপন্থী শর্ত নেই।",
        keyObligationsEn: [
          "Perform software engineering & architecture design",
          "Dedicated focus during employment tenure"
        ],
        keyObligationsBn: [
          "সফটওয়্যার ইঞ্জিনিয়ারিং ও আর্কিটেকচার ডিজাইন সম্পাদন",
          "চাকরিকালীন দায়িত্ব নিষ্ঠার সাথে পালন"
        ]
      },
      {
        id: "emp-c2",
        clauseNumber: 2,
        titleEn: "Working Hours & Overtime",
        titleBn: "কর্মঘণ্টা ও ওভারটাইম",
        riskLevel: "MEDIUM",
        originalText:
          "The regular work hours shall be 48 hours per week. The Employer reserves the unilateral right to mandate unpaid overtime on weekends during urgent software releases without extra monetary compensation.",
        statutoryReferenceId: "labour-act-100",
        statuteCitationEn: "Sections 100, 102 & 108, Bangladesh Labour Act 2006",
        statuteCitationBn: "ধারা ১০০, ১০২ ও ১০৮, বাংলাদেশ শ্রম আইন ২০০৬",
        issueSummaryEn: "Mandatory unpaid overtime violates statutory overtime wage requirements.",
        issueSummaryBn: "বিনা মজুরিতে অতিরিক্ত কর্মঘণ্টা (ওভারটাইম) বাধ্যতামূলক করা সম্পূর্ণ অবৈধ।",
        detailedAnalysisEn:
          "Under Section 100 and 108 of the Bangladesh Labour Act 2006, regular hours cannot exceed 48 hours per week without paying overtime at twice the ordinary rate of basic wage. Unilateral unpaid overtime on weekends is legally unenforceable.",
        detailedAnalysisBn:
          "বাংলাদেশ শ্রম আইন ২০০৬-এর ধারা ১০০ ও ১০৮ অনুযায়ী, সপ্তাহে ৪৮ ঘণ্টার অতিরিক্ত যেকোনো কাজের জন্য মূল মজুরির দ্বিগুণ হারে ওভারটাইম ভাতা প্রদান বাধ্যতামূলক। বিনা পারিশ্রমিকে ওভারটাইম করানো আইনত দণ্ডনীয়।",
        redlineSuggestionEn:
          "The regular work hours shall be 48 hours per week. Any additional work mandated on weekends shall strictly follow Section 108 of the Bangladesh Labour Act 2006, compensated at twice the regular hourly wage rate.",
        redlineSuggestionBn:
          "সাপ্তাহিক নিয়মিত কর্মঘণ্টা ৪৮ ঘণ্টা হবে। সাপ্তাহিক ছুটির দিন বা জরুরি প্রয়োজনে অতিরিক্ত কাজের ক্ষেত্রে বাংলাদেশ শ্রম আইন ২০০৬-এর ধারা ১০৮ অনুযায়ী সাধারণ দ্বিগুণ হারে অতিরিক্ত মজুরি প্রদান করা হবে।",
        keyObligationsEn: [
          "Maximum 48 regular hours per week",
          "Double wage rate for any additional overtime hours"
        ],
        keyObligationsBn: [
          "সপ্তাহে সর্বোচ্চ ৪৮ স্বাভাবিক কর্মঘণ্টা",
          "অতিরিক্ত সময়ের জন্য দ্বিগুণ হারে ওভারটাইম পরিশোধ"
        ]
      },
      {
        id: "emp-c3",
        clauseNumber: 3,
        titleEn: "Termination & Notice Period",
        titleBn: "চাকরি অবসান ও নোটিশ সময়কাল",
        riskLevel: "HIGH",
        originalText:
          "The Employer may terminate this agreement at any time with immediate effect without providing reason or prior notice. The Employee must provide a minimum 90-day written notice and forfeit the final two months of accrued salary upon resignation.",
        statutoryReferenceId: "labour-act-26",
        statuteCitationEn: "Section 26, Bangladesh Labour Act 2006",
        statuteCitationBn: "ধারা ২৬, বাংলাদেশ শ্রম আইন ২০০৬",
        issueSummaryEn:
          "Unilateral immediate termination and salary forfeiture violate statutory protections.",
        issueSummaryBn:
          "নোটিশ ছাড়া তাৎক্ষণিক বরখাস্ত ও বকেয়া বেতন বাজেয়াপ্ত করার শর্ত সরাসরি শ্রম আইনের লঙ্ঘন।",
        detailedAnalysisEn:
          "Under Section 26 of the Bangladesh Labour Act 2006, termination of a monthly-rated permanent worker mandates 120 days' written notice (or wages in lieu thereof), plus 30 days' compensation for each completed year of service. Forfeiting earned salary upon resignation is unlawful extortion.",
        detailedAnalysisBn:
          "শ্রম আইন ২০০৬-এর ধারা ২৬ অনুযায়ী মাসিক বেতনের স্থায়ী কর্মীকে অব্যাহতি দিতে কমপক্ষে ১২০ দিনের লিখিত নোটিশ বা সমপরিমাণ মজুরি এবং প্রতি বছরের চাকরির জন্য ৩০ দিনের মজুরি ক্ষতিপূরণ দিতে হবে। কোনো অবস্থাতেই অর্জিত বেতন বাজেয়াপ্ত করা যাবে না।",
        redlineSuggestionEn:
          "Either party may terminate this Agreement by providing 120 days' written notice in accordance with Section 26 of the Bangladesh Labour Act 2006, or by paying basic wages in lieu thereof. All accrued salary and statutory terminal benefits must be disbursed within 30 days of release.",
        redlineSuggestionBn:
          "উভয় পক্ষ বাংলাদেশ শ্রম আইন ২০০৬-এর ধারা ২৬ অনুযায়ী ১২০ দিনের লিখিত নোটিশ অথবা তার পরিবর্তে নির্ধারিত মজুরি প্রদানের মাধ্যমে চুক্তি অবসান করতে পারবে। পদত্যাগের পর অর্জিত সকল বকেয়া বেতন ও বিধিবদ্ধ সুবিধা ৩০ কার্যদিবসের মধ্যে প্রদান করা হবে।",
        keyObligationsEn: [
          "Mandatory 120-day written notice for permanent employees",
          "Payment of wages in lieu and full accrued compensation",
          "Zero forfeiture of legitimately earned wages"
        ],
        keyObligationsBn: [
          "স্থায়ী কর্মীর ক্ষেত্রে ১২০ দিনের নোটিশ বাধ্যতামূলক",
          "নোটিশের পরিবর্তে বিকল্প মজুরি ও ক্ষতিপূরণ প্রদান",
          "অর্জিত কোনো বেতন বাজেয়াপ্ত না করার বাধ্যবাধকতা"
        ]
      },
      {
        id: "emp-c4",
        clauseNumber: 4,
        titleEn: "Non-Compete & Restraint of Trade",
        titleBn: "নন-কম্পিট ও পেশাগত বাণিজ্যে বাধা",
        riskLevel: "HIGH",
        originalText:
          "Upon separation, the Employee is strictly prohibited from working for, consulting with, or founding any technology company in Bangladesh or globally for a period of 3 years.",
        statutoryReferenceId: "contract-act-27",
        statuteCitationEn: "Section 27, The Contract Act 1872",
        statuteCitationBn: "ধারা ২৭, চুক্তি আইন ১৮৭২",
        issueSummaryEn:
          "Post-employment trade restraint is legally void ab initio under Section 27.",
        issueSummaryBn:
          "চাকরি ছাড়ার পর ব্যবসা বা পেশা পরিচালনায় বাধা দেওয়ার শর্ত আইনত সম্পূর্ণ বাতিল ও অকার্যকর।",
        detailedAnalysisEn:
          "Section 27 of The Contract Act 1872 explicitly renders void any covenant that restrains an individual from exercising a lawful trade, business, or profession. A 3-year post-termination ban cannot be enforced in any Bangladesh civil court.",
        detailedAnalysisBn:
          "চুক্তি আইন ১৮৭২-এর ধারা ২৭ স্পষ্ট করেছে যে কোনো ব্যক্তিকে আইনসম্মত পেশা বা ব্যবসা পরিচালনায় বাধা দেওয়ার শর্ত সম্পূর্ণ বাতিল (void ab initio)। চাকরি শেষের পর ৩ বছর কোথাও কাজ না করার শর্ত বাংলাদেশের কোনো আদালত কার্যকর করবে না।",
        redlineSuggestionEn:
          "Upon separation, the Employee shall maintain strict confidentiality over proprietary technical documentation and trade secrets, but shall remain fully entitled to exercise their lawful software engineering profession or seek employment elsewhere.",
        redlineSuggestionBn:
          "চাকরি অবসানের পর কর্মী প্রতিষ্ঠানের গোপন তথ্য ও ট্রেড সিক্রেট অক্ষুণ্ণ রাখতে দায়বদ্ধ থাকবেন, তবে স্বাধীনভাবে অন্য যেকোনো প্রতিষ্ঠানে সফটওয়্যার ইঞ্জিনিয়ারিং পেশা বা কর্মসংস্থান গ্রহণের পূর্ণ অধিকার ভোগ করবেন।",
        keyObligationsEn: [
          "Preserve confidential business secrets and proprietary IP",
          "Full freedom to pursue professional employment without restraint"
        ],
        keyObligationsBn: [
          "প্রতিষ্ঠানের বাণিজ্যিক গোপনীয়তা রক্ষা করা",
          "পেশাগত স্বাধীনতা ও কর্মসংস্থানের পূর্ণ অধিকার বহাল রাখা"
        ]
      },
      {
        id: "emp-c5",
        clauseNumber: 5,
        titleEn: "Intellectual Property Assignment",
        titleBn: "বুদ্ধিবৃত্তিক সম্পদ হস্তান্তর",
        riskLevel: "COMPLIANT",
        originalText:
          "All intellectual property, inventions, and patentable software developed by the Employee during the tenure shall permanently belong to the Employer.",
        issueSummaryEn: "Enforceable work-for-hire assignment clause for bona fide employment.",
        issueSummaryBn: "চাকরিকালীন দায়িত্ব অনুযায়ী প্রতিষ্ঠানের অনুকূলে তৈরি কাজের বৈধ হস্তান্তর।",
        detailedAnalysisEn:
          "Under standard commercial copyright and IP principles, work created within the scope of permanent employment belongs to the employer as work-for-hire.",
        detailedAnalysisBn:
          "স্বাভাবিক কর্মচুক্তির অধীনে কর্মরত অবস্থায় তৈরি পণ্যের বুদ্ধিবৃত্তিক স্বত্ব নিয়োগকারীর থাকা আইনসিদ্ধ।",
        keyObligationsEn: [
          "Transfer of codebase and documentation created during working hours"
        ],
        keyObligationsBn: [
          "অফিস চলাকালীন তৈরি কোড ও ডকুমেন্টের কপিরাইট হস্তান্তর"
        ]
      }
    ]
  },
  "vendor-sla": {
    contractId: "vendor-sla",
    riskScore: 84,
    riskGradeEn: "High Risk",
    riskGradeBn: "উচ্চ ঝুঁকি",
    summaryEn:
      "This vendor agreement imposes unconscionable daily penalties and asymmetric uncapped liability that violate Section 73 and Section 74 of The Contract Act 1872.",
    summaryBn:
      "এই ভেন্ডর চুক্তিতে অতিরিক্ত একতরফা দৈনিক জরিমানা ও অসম দ্বিমুখী দায়ের শর্ত রয়েছে, যা চুক্তি আইন ১৮৭২-এর ধারা ৭৩ ও ৭৪ বিরোধী।",
    stats: {
      highRiskCount: 2,
      mediumRiskCount: 1,
      compliantCount: 1,
      totalClauses: 4
    },
    clauses: [
      {
        id: "ven-c1",
        clauseNumber: 1,
        titleEn: "Service Deliverables",
        titleBn: "সার্ভিস ও ডেলিভারি বিবরণ",
        riskLevel: "COMPLIANT",
        originalText:
          "Vendor shall deploy an Enterprise ERP and Payment Gateway within 90 working days from the execution date.",
        issueSummaryEn: "Clear timeline and defined scope of technical delivery.",
        issueSummaryBn: "ডেলিভারির সময়সীমা ও কাজের পরিধি সুনির্দিষ্ট।",
        detailedAnalysisEn: "Clear timeline without predatory or ambiguous terms.",
        detailedAnalysisBn: "যৌক্তিক ৯০ কার্যদিবসের মধ্যে ডেলিভারির স্বাভাবিক সময়সীমা।",
        keyObligationsEn: ["Complete deployment within 90 working days"],
        keyObligationsBn: ["৯০ কার্যদিবসের মধ্যে ডেপ্লয়মেন্ট সম্পন্ন করা"]
      },
      {
        id: "ven-c2",
        clauseNumber: 2,
        titleEn: "Liquidated Damages & Penalty",
        titleBn: "ক্ষতিপূরণ ও একতরফা জরিমানা",
        riskLevel: "HIGH",
        originalText:
          "In the event of a single day delay in milestone delivery, the Vendor shall pay an unconditional penalty of BDT 500,000 per day, regardless of actual loss sustained by the Client.",
        statutoryReferenceId: "contract-act-74",
        statuteCitationEn: "Section 74, The Contract Act 1872",
        statuteCitationBn: "ধারা ৭৪, চুক্তি আইন ১৮৭২",
        issueSummaryEn: "Extortionate daily penalty not tied to actual proven damage.",
        issueSummaryBn: "প্রমাণিত ক্ষতি ছাড়া একতরফা চরম দৈনিক জরিমানা আদায়যোগ্য নয়।",
        detailedAnalysisEn:
          "Section 74 of The Contract Act 1872 stipulates that penalty clauses are subject to reasonable compensation only. A daily fine of BDT 500,000 without proof of actual loss will be rejected by courts as punitive liquidated damages.",
        detailedAnalysisBn:
          "চুক্তি আইন ১৮৭২-এর ধারা ৭৪ অনুযায়ী চুক্তিতে যেকোনো অঙ্কের জরিমানার কথা লেখা থাকলেও ক্ষতিগ্রস্ত পক্ষ কেবল প্রকৃত ও যুক্তিসঙ্গত ক্ষতিপূরণ পাবে। প্রতিদিন ৫ লাখ টাকা শাস্তিমূলক জরিমানা আদায় আইনসিদ্ধ নয়।",
        redlineSuggestionEn:
          "For unexcused delay caused solely by Vendor, Client may claim reasonable liquidated damages capped at 0.5% of the milestone fee per week of delay, up to an aggregate maximum of 5% of the total contract value.",
        redlineSuggestionBn:
          "ভেন্ডরের ব্যর্থতায় অযৌক্তিক বিলম্বের ক্ষেত্রে ক্লায়েন্ট প্রতি সপ্তাহের জন্য মাইলস্টোন ফির সর্বোচ্চ ০.৫% হারে এবং সর্বমোট চুক্তিমূল্যের ৫% এর বেশি নয় এমন যৌক্তিক ক্ষতিপূরণ দাবি করতে পারবে।",
        keyObligationsEn: [
          "Liquidated damages must be reasonable and capped at standard commercial thresholds (e.g., 5%)"
        ],
        keyObligationsBn: [
          "ক্ষতিপূরণ যৌক্তিক হতে হবে এবং সর্বোচ্চ মোট মূল্যের ৫% এর মধ্যে সীমাবদ্ধ থাকবে"
        ]
      },
      {
        id: "ven-c3",
        clauseNumber: 3,
        titleEn: "Limitation of Liability",
        titleBn: "দায়ের সীমাবদ্ধতা (Liability Capping)",
        riskLevel: "HIGH",
        originalText:
          "The Vendor shall assume unlimited, uncapped liability for any indirect, consequential, or operational damages incurred by Client, while Client's liability to Vendor is strictly limited to BDT 1,000.",
        statutoryReferenceId: "contract-act-73",
        statuteCitationEn: "Section 73, The Contract Act 1872",
        statuteCitationBn: "ধারা ৭৩, চুক্তি আইন ১৮৭২",
        issueSummaryEn: "Grossly asymmetric uncapped liability and remote damages.",
        issueSummaryBn: "একতরফা অসীম দায় এবং দূরবর্তী পরোক্ষ ক্ষতির ভার চাপানো ধারা ৭৩ বিরোধী।",
        detailedAnalysisEn:
          "Section 73 excludes remote and indirect losses from contractual recovery. An asymmetric clause imposing unlimited liability on a vendor while shielding the client violates fair commercial equity.",
        detailedAnalysisBn:
          "ধারা ৭৩ স্পষ্ট করেছে যে পরোক্ষ বা দূরবর্তী ক্ষতির ক্ষতিপূরণ দেওয়া যায় না। ভেন্ডরের উপর অসীম দায় অথচ ক্লায়েন্টের দায় মাত্র ১,০০০ টাকায় সীমাবদ্ধ রাখা চরম বৈষম্যমূলক ও বাণিজ্যিক রীতির লঙ্ঘন।",
        redlineSuggestionEn:
          "Except in cases of gross negligence or willful misconduct, neither party shall be liable for indirect or consequential damages. Each party's aggregate liability shall be capped at 100% of the total fees paid under this Agreement.",
        redlineSuggestionBn:
          "ইচ্ছাকৃত জালিয়াতি ছাড়া কোনো পক্ষই পরোক্ষ বা দূরবর্তী ক্ষতির জন্য দায়ী থাকবে না। উভয় পক্ষের মোট দায় এই চুক্তির আওতায় পরিশোধিত মোট মূল্যের ১০০%-এ সীমাবদ্ধ থাকবে।",
        keyObligationsEn: [
          "Mutual liability cap pegged to contract value (100% fee cap)",
          "Exclusion of indirect, remote, and consequential damages"
        ],
        keyObligationsBn: [
          "পারস্পরিক দায় চুক্তিমূল্যের ১০০%-এ সীমাবদ্ধ রাখা",
          "পরোক্ষ ও দূরবর্তী ক্ষতির দায় বাদ দেওয়া"
        ]
      },
      {
        id: "ven-c4",
        clauseNumber: 4,
        titleEn: "Dispute Resolution & Jurisdiction",
        titleBn: "বিরোধ নিষ্পত্তি ও এখতিয়ার",
        riskLevel: "MEDIUM",
        originalText:
          "Any breach or contractual dispute shall be referred solely to the Client's internal legal department whose verdict shall be binding and non-appealable.",
        statutoryReferenceId: "contract-act-28",
        statuteCitationEn: "Section 28, The Contract Act 1872",
        statuteCitationBn: "ধারা ২৮, চুক্তি আইন ১৮৭২",
        issueSummaryEn: "Unilateral judge-and-party dispute resolution mechanism.",
        issueSummaryBn: "একতরফা অভ্যন্তরীণ বিভাগের সিদ্ধান্ত চূড়ান্ত করার শর্ত নিরপেক্ষ সালিশ আইনের পরিপন্থী।",
        detailedAnalysisEn:
          "Agreements restricting legal recourse or appointing one party as the sole judge violate Section 28 (agreements in restraint of legal proceedings) and the Arbitration Act 2001.",
        detailedAnalysisBn:
          "এক পক্ষ নিজেই বিচারক হয়ে চূড়ান্ত রায় দেওয়ার শর্ত আদালত বা নিরপেক্ষ সালিশের অধিকার হরণ করে, যা চুক্তি আইনের ধারা ২৮ পরিপন্থী।",
        redlineSuggestionEn:
          "Disputes shall first be resolved through good-faith negotiation. If unresolved within 30 days, matters shall be submitted to independent arbitration in Dhaka under the Bangladesh Arbitration Act 2001.",
        redlineSuggestionBn:
          "যেকোনো বিরোধ প্রথমে ৩০ দিনের মধ্যে সমঝোতার মাধ্যমে সমাধানের চেষ্টা করা হবে। ব্যর্থ হলে বাংলাদেশ সালিশি আইন ২০০১ অনুযায়ী ঢাকায় নিরপেক্ষ সালিশের মাধ্যমে নিষ্পত্তি হবে।",
        keyObligationsEn: [
          "Good-faith bilateral negotiation (30 days)",
          "Neutral independent arbitration under Arbitration Act 2001"
        ],
        keyObligationsBn: [
          "উভয় পক্ষের আলোচনার মাধ্যমে সমাধান (৩০ দিন)",
          "বাংলাদেশ সালিশি আইন ২০০১ অনুযায়ী নিরপেক্ষ সালিশ"
        ]
      }
    ]
  },
  "freelance-consulting": {
    contractId: "freelance-consulting",
    riskScore: 65,
    riskGradeEn: "Medium Risk",
    riskGradeBn: "মাঝারি ঝুঁকি",
    summaryEn:
      "This agreement features predatory delayed payment terms and premature intellectual property transfer before financial consideration.",
    summaryBn:
      "এই চুক্তিতে ১২০ দিনের অতিরিক্ত বিলম্বিত পেমেন্ট এবং পারিশ্রমিক পরিশোধের পূর্বেই কপিরাইট হস্তান্তরের ঝুঁকিপূর্ণ শর্ত রয়েছে।",
    stats: {
      highRiskCount: 1,
      mediumRiskCount: 1,
      compliantCount: 1,
      totalClauses: 3
    },
    clauses: [
      {
        id: "fl-c1",
        clauseNumber: 1,
        titleEn: "Deliverables Definition",
        titleBn: "ডেলিভারেবল বিবরণ",
        riskLevel: "COMPLIANT",
        originalText:
          "1. Deliverables: Contractor shall deliver 20 complete high-fidelity UI design screens for the Mobile Banking Application.",
        issueSummaryEn: "Clear specification of technical design artifacts.",
        issueSummaryBn: "ডিজাইন স্ক্রিন ও আর্টওয়ার্কের সুনির্দিষ্ট সংখ্যা ও বিবরণ।",
        detailedAnalysisEn: "Well-defined scope of work.",
        detailedAnalysisBn: "সুনির্দিষ্ট কাজের পরিধি।",
        keyObligationsEn: ["Deliver 20 high-fidelity UI design screens"],
        keyObligationsBn: ["২০টি হাই-ফিডেলিটি ইউআই ডিজাইন স্ক্রিন সরবরাহ"]
      },
      {
        id: "fl-c2",
        clauseNumber: 2,
        titleEn: "Payment Terms & Withholding",
        titleBn: "পেমেন্ট শর্ত ও টাকা আটকে রাখার অধিকার",
        riskLevel: "HIGH",
        originalText:
          "2. Payment Terms: Payment shall be disbursed 120 days following final stakeholder approval. Client reserves right of partial deduction without notice.",
        issueSummaryEn: "Predatory 120-day deferral and unilateral deduction rights.",
        issueSummaryBn: "১২০ দিন পর্যন্ত পেমেন্ট স্থগিত রাখা এবং নোটিশ ছাড়া টাকা কাটার একতরফা শর্ত।",
        detailedAnalysisEn:
          "Unilateral withholding without objective milestone criteria leaves freelance contractors unprotected. Standard commercial practice requires payment within 14-30 days upon delivery.",
        detailedAnalysisBn:
          "কাজ শেষ হওয়ার পরও ১২০ দিন টাকা আটকে রাখা এবং কারণ দর্শানো ছাড়া পারিশ্রমিক কেটে নেওয়ার শর্ত ফ্রিল্যান্সারের অধিকার চরমভাবে ক্ষুণ্ণ করে।",
        redlineSuggestionEn:
          "Payment shall be disbursed within 14 business days of milestone completion. Client may only contest invoices with written notice within 7 days specifying objective technical deficiencies.",
        redlineSuggestionBn:
          "মাইলস্টোন অনুমোদনের ১৪ কার্যদিবসের মধ্যে সম্পূর্ণ পারিশ্রমিক পরিশোধ করতে হবে। কোনো অসঙ্গতি থাকলে ক্লায়েন্টকে ৭ দিনের মধ্যে লিখিত কারণ জানাতে হবে।",
        keyObligationsEn: [
          "Payment within 14 business days of milestone submission",
          "Written itemized objections required for any deduction"
        ],
        keyObligationsBn: [
          "১৪ কার্যদিবসের মধ্যে পেমেন্ট ক্লিয়ারেন্স",
          "টাকা কাটার ক্ষেত্রে লিখিত সুনির্দিষ্ট কারণ দর্শানো"
        ]
      },
      {
        id: "fl-c3",
        clauseNumber: 3,
        titleEn: "Ownership of Works & IP Transfer",
        titleBn: "কপিরাইট ও আইপি হস্তান্তর",
        riskLevel: "MEDIUM",
        originalText:
          "3. Ownership of Works: Full global copyright, trademarks, and design rights vest in Client immediately upon creation, irrespective of whether payments are settled.",
        statutoryReferenceId: "contract-act-25",
        issueSummaryEn: "IP vests before payment consideration is fulfilled.",
        issueSummaryBn: "পারিশ্রমিক পরিশোধ ব্যতিরেকে স্বত্ব হস্তান্তরের শর্ত ঝুঁকি সৃষ্টি করে।",
        detailedAnalysisEn:
          "Under contract law, consideration is a fundamental element. Transferring complete worldwide IP before full payment deprives the creator of leverage in the event of default.",
        detailedAnalysisBn:
          "চুক্তি আইনে প্রতিদান (consideration) অপরিহার্য। টাকা পাওয়ার আগেই স্বত্ব হস্তান্তর হয়ে গেলে পরবর্তীতে ক্লায়েন্ট পেমেন্ট না দিলেও কাজের কপিরাইট ভেন্ডরের থাকে না।",
        redlineSuggestionEn:
          "All intellectual property and copyright shall vest in Client upon full and final payment of the agreed project fees. Prior to full settlement, Client retains a non-exclusive preview license.",
        redlineSuggestionBn:
          "চুক্তির সমুদয় পারিশ্রমিক সম্পূর্ণ পরিশোধের পর চূড়ান্ত কপিরাইট ক্লায়েন্টের অনুকূলে হস্তান্তরিত হবে। অর্থ পরিশোধের পূর্বে ক্লায়েন্ট কেবল প্রিভিউ করার অনুমতি পাবেন।",
        keyObligationsEn: [
          "IP transfer conditioned upon receipt of full financial consideration"
        ],
        keyObligationsBn: [
          "সম্পূর্ণ পারিশ্রমিক প্রাপ্তির পর কপিরাইট হস্তান্তর সম্পন্ন হওয়া"
        ]
      }
    ]
  }
};
