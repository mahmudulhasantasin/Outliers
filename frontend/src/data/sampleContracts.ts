export interface SampleContract {
  id: string;
  titleBn: string;
  titleEn: string;
  categoryBn: string;
  categoryEn: string;
  summaryBn: string;
  summaryEn: string;
  parties: {
    firstPartyBn: string;
    firstPartyEn: string;
    secondPartyBn: string;
    secondPartyEn: string;
  };
  sampleText: string;
}

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: "employment-agreement",
    titleBn: "চাকরি ও নিয়োগ চুক্তিপত্র (নমুনা)",
    titleEn: "Standard Employment & Confidentiality Agreement",
    categoryBn: "বাংলাদেশ শ্রম আইন ২০০৬",
    categoryEn: "Labour Act 2006 Compliance",
    summaryBn: "নোটিশ পিরিয়ড, অনির্ধারিত জরিমানা এবং একতরফা সমাপ্তি সংক্রান্ত ঝুঁকিপূর্ণ শর্তাবলী বিদ্যমান।",
    summaryEn: "Identified high-risk clauses concerning 90-day immediate termination and non-compete validity.",
    parties: {
      firstPartyBn: "নেক্সাস টেকনোলজিস লিমিটেড",
      firstPartyEn: "Nexus Technologies Ltd.",
      secondPartyBn: "জনাব শামীম আহমেদ (সফটওয়্যার ইঞ্জিনিয়ার)",
      secondPartyEn: "Mr. Shamim Ahmed (Senior Engineer)"
    },
    sampleText: `EMPLOYMENT AND CONFIDENTIALITY AGREEMENT

This Agreement is entered into on 15th January 2026, between Nexus Technologies Ltd. ("Employer") and Shamim Ahmed ("Employee").

Clause 1: Scope of Work
The Employee shall perform software engineering, architecture design, and deployment tasks exclusively for the Employer.

Clause 2: Working Hours & Overtime
The regular work hours shall be 48 hours per week. The Employer reserves the unilateral right to mandate unpaid overtime on weekends during urgent software releases without extra monetary compensation.

Clause 3: Termination & Notice Period
The Employer may terminate this agreement at any time with immediate effect without providing reason or prior notice. The Employee must provide a minimum 90-day written notice and forfeit the final two months of accrued salary upon resignation.

Clause 4: Non-Compete & Restraint of Trade
Upon separation, the Employee is strictly prohibited from working for, consulting with, or founding any technology company in Bangladesh or globally for a period of 3 years.

Clause 5: Intellectual Property Assignment
All intellectual property, inventions, and patentable software developed by the Employee during the tenure shall permanently belong to the Employer.`
  },
  {
    id: "vendor-sla",
    titleBn: "আইটি সফটওয়্যার সার্ভিস ও ভেন্ডর চুক্তি",
    titleEn: "Software Development & Vendor SLA Agreement",
    categoryBn: "চুক্তি আইন ১৮৭২",
    categoryEn: "The Contract Act 1872",
    summaryBn: "অসীম ক্ষতিপূরণ দায় এবং ধারা ৭৩ ও ৭৪ বিরোধী একতরফা পেনাল্টি ঝুঁকি।",
    summaryEn: "Contains uncapped unlimited indemnity and unilateral penalty clauses conflicting with Section 74.",
    parties: {
      firstPartyBn: "প্রাইম ট্রেডিং কর্পোরেশন",
      firstPartyEn: "Prime Trading Corporation",
      secondPartyBn: "ক্লাউডসলভ বাংলাদেশ",
      secondPartyEn: "CloudSolve Bangladesh"
    },
    sampleText: `IT SERVICE & VENDOR MASTER AGREEMENT

This Master Services Agreement is executed on 1st March 2026 between Prime Trading Corporation ("Client") and CloudSolve Bangladesh ("Vendor").

Clause 1: Service Deliverables
Vendor shall deploy an Enterprise ERP and Payment Gateway within 90 working days from the execution date.

Clause 2: Liquidated Damages & Penalty
In the event of a single day delay in milestone delivery, the Vendor shall pay an unconditional penalty of BDT 500,000 per day, regardless of actual loss sustained by the Client.

Clause 3: Limitation of Liability
The Vendor shall assume unlimited, uncapped liability for any indirect, consequential, or operational damages incurred by Client, while Client's liability to Vendor is strictly limited to BDT 1,000.

Clause 4: Dispute Resolution & Jurisdiction
Any breach or contractual dispute shall be referred solely to the Client's internal legal department whose verdict shall be binding and non-appealable.`
  },
  {
    id: "freelance-consulting",
    titleBn: "ফ্রিল্যান্স কনসালটেন্সি ও আইপি চুক্তি",
    titleEn: "Freelance Consulting & Deliverables Contract",
    categoryBn: "কমন ল ও আইপি সুরক্ষা",
    categoryEn: "IP Transfer & Freelance Retainer",
    summaryBn: "পেমেন্ট মাইলস্টোন আটকে রাখা এবং ওয়ার্ক-ফর-হায়ার কপিরাইট হস্তান্তর জটিলতা।",
    summaryEn: "Features deferred payments and immediate IP vesting prior to financial settlement.",
    parties: {
      firstPartyBn: "গ্লোবাল ক্রিয়েটিভ এজেন্সী",
      firstPartyEn: "Global Creative Agency",
      secondPartyBn: "জনাব আসিফ ইকবাল (UI/UX ডিজাইনার)",
      secondPartyEn: "Mr. Asif Iqbal (Independent Designer)"
    },
    sampleText: `INDEPENDENT CONTRACTOR & DESIGN SERVICES AGREEMENT

Dated: 10th February 2026

1. Deliverables: Contractor shall deliver 20 complete high-fidelity UI design screens for the Mobile Banking Application.
2. Payment Terms: Payment shall be disbursed 120 days following final stakeholder approval. Client reserves right of partial deduction without notice.
3. Ownership of Works: Full global copyright, trademarks, and design rights vest in Client immediately upon creation, irrespective of whether payments are settled.`
  }
];
