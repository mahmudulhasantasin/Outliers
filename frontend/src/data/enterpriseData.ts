// Sovereign Enterprise Architecture Dataset & Playbook Engine for Bangladesh Law

export interface PlaybookRule {
  id: string;
  clauseTypeEn: string;
  clauseTypeBn: string;
  statute: string;
  statutoryReference: string;
  companyRequirementEn: string;
  companyRequirementBn: string;
  standardClauseTemplate: string;
  strictness: "mandatory" | "advisory";
  isActive: boolean;
}

export interface CompanyPlaybook {
  id: string;
  organizationId: string;
  title: string;
  version: string;
  lastUpdated: string;
  rules: PlaybookRule[];
}

export interface EnterpriseMember {
  id: string;
  name: string;
  email: string;
  department: string;
  role: "admin" | "member";
  status: "active" | "suspended";
  monthlyCreditCap: number;
  creditsUsedThisMonth: number;
  joinedAt: string;
  avatarUrl?: string;
}

export interface SharedCompanyContract {
  id: string;
  titleEn: string;
  titleBn: string;
  submittedByName: string;
  submittedByEmail: string;
  submittedAtEn: string;
  submittedAtBn: string;
  categoryEn: string;
  categoryBn: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  status: "approved" | "pending_review";
  advocateVerified: boolean;
  contractId: string;
}

export interface EnterpriseAuditMetadataLog {
  id: string;
  timestampEn: string;
  timestampBn: string;
  memberName: string;
  memberEmail: string;
  department: string;
  module: "ContractMind Audit" | "Advotech Copilot Chat" | "Advocate Verification";
  category: string;
  creditsConsumed: number;
}

export interface EnterpriseOrganization {
  id: string;
  name: string;
  companyType: string;
  registrationNo: string;
  tinNo: string;
  referCode: string;
  adminName: string;
  adminEmail: string;
  totalSeats: number;
  usedSeats: number;
  creditPoolTotal: number;
  creditPoolRemaining: number;
  playbookEnforced: boolean;
  createdAt: string;
}

// ── DEFAULT DEMO ENTERPRISE DATA ──

export const INITIAL_ORGANIZATION: EnterpriseOrganization = {
  id: "ent-apex-01",
  name: "Apex Holdings Ltd.",
  companyType: "Private Limited Company",
  registrationNo: "C-148920/2021 (RJSC Dhaka)",
  tinNo: "582910482912",
  referCode: "APX-8821",
  adminName: "Rahim Chowdhury",
  adminEmail: "rahim@apexholdings.bd",
  totalSeats: 15,
  usedSeats: 8,
  creditPoolTotal: 2500,
  creditPoolRemaining: 1650,
  playbookEnforced: true,
  createdAt: "12 January 2024",
};

export const INITIAL_ENTERPRISE_MEMBERS: EnterpriseMember[] = [
  {
    id: "mem-01",
    name: "Rahim Chowdhury",
    email: "rahim@apexholdings.bd",
    department: "Executive Management",
    role: "admin",
    status: "active",
    monthlyCreditCap: 500,
    creditsUsedThisMonth: 150,
    joinedAt: "12 Jan 2024",
  },
  {
    id: "mem-02",
    name: "Nusrat Jahan",
    email: "nusrat.hr@apexholdings.bd",
    department: "Human Resources",
    role: "member",
    status: "active",
    monthlyCreditCap: 250,
    creditsUsedThisMonth: 120,
    joinedAt: "15 Feb 2024",
  },
  {
    id: "mem-03",
    name: "Tanvir Ahmed, Lead",
    email: "tanvir.procurement@apexholdings.bd",
    department: "Supply Chain & Procurement",
    role: "member",
    status: "active",
    monthlyCreditCap: 200,
    creditsUsedThisMonth: 85,
    joinedAt: "01 Mar 2024",
  },
  {
    id: "mem-04",
    name: "Shamim Hasan",
    email: "shamim.legal@apexholdings.bd",
    department: "Corporate Legal Affairs",
    role: "member",
    status: "active",
    monthlyCreditCap: 400,
    creditsUsedThisMonth: 210,
    joinedAt: "10 Mar 2024",
  },
  {
    id: "mem-05",
    name: "Farhana Akter",
    email: "farhana.it@apexholdings.bd",
    department: "Engineering & IT",
    role: "member",
    status: "active",
    monthlyCreditCap: 150,
    creditsUsedThisMonth: 45,
    joinedAt: "18 Apr 2024",
  },
  {
    id: "mem-06",
    name: "Kamrul Islam",
    email: "kamrul.ops@apexholdings.bd",
    department: "Operations",
    role: "member",
    status: "suspended",
    monthlyCreditCap: 100,
    creditsUsedThisMonth: 10,
    joinedAt: "05 May 2024",
  },
  {
    id: "mem-07",
    name: "Sadia Rahman",
    email: "sadia.finance@apexholdings.bd",
    department: "Finance & Accounts",
    role: "member",
    status: "active",
    monthlyCreditCap: 200,
    creditsUsedThisMonth: 90,
    joinedAt: "22 Jun 2024",
  },
  {
    id: "mem-08",
    name: "Mehedi Miraj",
    email: "mehedi.compliance@apexholdings.bd",
    department: "ESG & Compliance",
    role: "member",
    status: "active",
    monthlyCreditCap: 200,
    creditsUsedThisMonth: 140,
    joinedAt: "14 Jul 2024",
  },
];

export const INITIAL_COMPANY_PLAYBOOK: CompanyPlaybook = {
  id: "pb-apex-01",
  organizationId: "ent-apex-01",
  title: "Apex Holdings Corporate Legal Standard & Risk Playbook",
  version: "v2.4 (Statutory 2026)",
  lastUpdated: "15 October 2026",
  rules: [
    {
      id: "rule-01",
      clauseTypeEn: "Probation & Confirmation Threshold",
      clauseTypeBn: "শিক্ষানবিশকাল ও স্থায়ীকরণ সীমা",
      statute: "Bangladesh Labour Act 2006",
      statutoryReference: "Section 4(4)",
      companyRequirementEn: "Probation for clerical/technical staff must not exceed 3 months, extendable by max 3 months if performance is evaluated in writing.",
      companyRequirementBn: "কেরানি বা টেকনিক্যাল কর্মীদের শিক্ষানবিশকাল ৩ মাসের বেশি হবে না; লিখিত মূল্যায়নের মাধ্যমে সর্বোচ্চ আরো ৩ মাস বাড়ানো যেতে পারে।",
      standardClauseTemplate: "The Employee shall be placed on probation for an initial duration of three (3) calendar months from the commencement date. The Employer may extend the probation period by an additional three (3) months subject to written evaluation pursuant to Section 4(4) of the Bangladesh Labour Act 2006.",
      strictness: "mandatory",
      isActive: true,
    },
    {
      id: "rule-02",
      clauseTypeEn: "Non-Compete & Restraint of Trade Compliance",
      clauseTypeBn: "প্রতিযোগিতা-বিরোধী ও বাণিজ্য বাধানিষেধ নীতি",
      statute: "The Contract Act 1872",
      statutoryReference: "Section 27",
      companyRequirementEn: "Post-termination total employment bans are void under Section 27. Contracts must restrict only customer/client non-solicitation (max 12 months) and proprietary trade secrets, avoiding unlawful restraint of trade.",
      companyRequirementBn: "চাকরি পরবর্তী সম্পূর্ণ পেশাগত নিষেধাজ্ঞা ধারা ২৭ অনুযায়ী বাতিল। চুক্তিতে শুধু গ্রাহক নন-সলিসিটেশন (সর্বোচ্চ ১২ মাস) এবং ট্রেড সিক্রেট সুরক্ষা অন্তর্ভুক্ত করতে হবে।",
      standardClauseTemplate: "During employment and for twelve (12) months following termination, Employee shall not directly solicit, entice, or conduct business with any active client or customer of the Employer whom Employee served during the preceding 12 months. This clause explicitly preserves Employee's statutory right to lawful employment under Section 27 of The Contract Act 1872.",
      strictness: "mandatory",
      isActive: true,
    },
    {
      id: "rule-03",
      clauseTypeEn: "Statutory Termination Notice & Severance",
      clauseTypeBn: "সংবিধিবদ্ধ ছাঁটাই/অবসায়ন নোটিশ ও সেভারেন্স পে",
      statute: "Bangladesh Labour Act 2006",
      statutoryReference: "Section 26",
      companyRequirementEn: "Permanent employee termination requires 120 days written notice or wages in lieu thereof, plus 30 days compensation for each completed year of service.",
      companyRequirementBn: "স্থায়ী কর্মী অবসায়নে ১২০ দিনের লিখিত নোটিশ বা সমপরিমাণ মজুরি এবং প্রতি পূর্ণ কর্মবছরের জন্য ৩০ দিনের ক্ষতিপূরণ প্রদান বাধ্যতামূলক।",
      standardClauseTemplate: "Termination of this Agreement by the Employer for permanent workers shall require either one hundred and twenty (120) days prior written notice or payment of wages in lieu thereof, along with thirty (30) days wages for every completed year of service, in strict adherence to Section 26 of the Bangladesh Labour Act 2006.",
      strictness: "mandatory",
      isActive: true,
    },
    {
      id: "rule-04",
      clauseTypeEn: "Intellectual Property & Work-For-Hire Assignment",
      clauseTypeBn: "বুদ্ধিবৃত্তিক সম্পদ ও ওয়ার্ক-ফর-হায়ার শতভাগ হস্তান্তর",
      statute: "The Copyright Act 2000 & Patents Act",
      statutoryReference: "Section 14, 24",
      companyRequirementEn: "All code, documents, algorithms, models, and works created during employment or using company hardware are 100% company property.",
      companyRequirementBn: "চাকরিতে কর্মরত অবস্থায় বা কোম্পানির যন্ত্রপাতিতে তৈরিকৃত সমস্ত কোড, অ্যালগরিদম ও মেধা সম্পদ সম্পূর্ণভাবে কোম্পানির সম্পত্তি হিসেবে পরিগণিত হবে।",
      standardClauseTemplate: "All Intellectual Property, code, inventions, and works created by Employee in connection with employment or utilizing Employer infrastructure shall be considered 'works made for hire' and absolute property of Apex Holdings Ltd. from inception.",
      strictness: "mandatory",
      isActive: true,
    },
    {
      id: "rule-05",
      clauseTypeEn: "Jurisdiction & Statutory Dispute Resolution",
      clauseTypeBn: "আদালত এখতিয়ার ও সংবিধিবদ্ধ সালিশ নীতি",
      statute: "The Arbitration Act 2001 & CPC 1908",
      statutoryReference: "Arbitration Act 2001",
      companyRequirementEn: "All disputes must be seated in Dhaka, Bangladesh, resolved via arbitration under The Arbitration Act 2001 before approaching the High Court Division.",
      companyRequirementBn: "যেকোনো বিরোধ নিষ্পত্তির স্থান হবে ঢাকা, বাংলাদেশ এবং তা বাংলাদেশ সালিশ আইন ২০০১-এর অধীনে নিষ্পত্তির চেষ্টা করা হবে।",
      standardClauseTemplate: "This Agreement shall be governed by and construed in accordance with the substantive laws of the People's Republic of Bangladesh. Any dispute arising out of or in connection with this Agreement shall be referred to and finally resolved by arbitration in Dhaka under The Arbitration Act 2001.",
      strictness: "mandatory",
      isActive: true,
    },
  ],
};

export const INITIAL_SHARED_CONTRACTS: SharedCompanyContract[] = [
  {
    id: "sh-cnt-01",
    titleEn: "Senior Software Engineer Employment & Confidentiality Agreement",
    titleBn: "সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার নিয়োগ ও গোপনীয়তা চুক্তি",
    submittedByName: "Nusrat Jahan (HR Lead)",
    submittedByEmail: "nusrat.hr@apexholdings.bd",
    submittedAtEn: "16 Oct 2026, 11:30 AM",
    submittedAtBn: "১৬ অক্টোবর ২০২৬, সকাল ১১:৩০",
    categoryEn: "Labour & Employment",
    categoryBn: "শ্রম ও কর্মসংস্থান আইন",
    riskScore: 78,
    riskLevel: "high",
    status: "approved",
    advocateVerified: true,
    contractId: "employment-agreement",
  },
  {
    id: "sh-cnt-02",
    titleEn: "Enterprise Cloud ERP & Payment Gateway Vendor SLA",
    titleBn: "এন্টারপ্রাইজ ক্লাউড ইআরপি ও পেমেন্ট গেটওয়ে ভেন্ডর এসএলএ",
    submittedByName: "Tanvir Ahmed (Procurement)",
    submittedByEmail: "tanvir.procurement@apexholdings.bd",
    submittedAtEn: "17 Oct 2026, 04:15 PM",
    submittedAtBn: "১৭ অক্টোবর ২০২৬, বিকাল ৪:১৫",
    categoryEn: "ICT & Commercial Contracts",
    categoryBn: "তথ্যপ্রযুক্তি ও বাণিজ্যিক চুক্তি",
    riskScore: 72,
    riskLevel: "high",
    status: "pending_review",
    advocateVerified: false,
    contractId: "vendor-sla",
  },
  {
    id: "sh-cnt-03",
    titleEn: "Gulshan Corporate Tower Commercial Floor Lease Agreement",
    titleBn: "গুলশান করপোরেট টাওয়ার বাণিজ্যিক ফ্লোর লিজ চুক্তিপত্র",
    submittedByName: "Shamim Hasan (Legal Affairs)",
    submittedByEmail: "shamim.legal@apexholdings.bd",
    submittedAtEn: "18 Oct 2026, 09:45 AM",
    submittedAtBn: "১৮ অক্টোবর ২০২৬, সকাল ৯:৪৫",
    categoryEn: "Real Estate & Commercial Lease",
    categoryBn: "বাণিজ্যিক লিজ ও স্থাবর সম্পত্তি আইন",
    riskScore: 68,
    riskLevel: "medium",
    status: "approved",
    advocateVerified: true,
    contractId: "commercial-lease",
  },
];

export const INITIAL_AUDIT_LOGS: EnterpriseAuditMetadataLog[] = [
  {
    id: "log-101",
    timestampEn: "18 Oct 2026, 17:15",
    timestampBn: "১৮ অক্টোবর ২০২৬, ১৭:১৫",
    memberName: "Nusrat Jahan",
    memberEmail: "nusrat.hr@apexholdings.bd",
    department: "Human Resources",
    module: "ContractMind Audit",
    category: "Labour Act 2006",
    creditsConsumed: 50,
  },
  {
    id: "log-102",
    timestampEn: "18 Oct 2026, 15:40",
    timestampBn: "১৮ অক্টোবর ২০২৬, ১৫:৪০",
    memberName: "Tanvir Ahmed",
    memberEmail: "tanvir.procurement@apexholdings.bd",
    department: "Supply Chain",
    module: "Advotech Copilot Chat",
    category: "The Contract Act 1872",
    creditsConsumed: 5,
  },
  {
    id: "log-103",
    timestampEn: "18 Oct 2026, 11:20",
    timestampBn: "১৮ অক্টোবর ২০২৬, ১১:২০",
    memberName: "Shamim Hasan",
    memberEmail: "shamim.legal@apexholdings.bd",
    department: "Corporate Legal Affairs",
    module: "Advocate Verification",
    category: "Arbitration Act 2001",
    creditsConsumed: 100,
  },
  {
    id: "log-104",
    timestampEn: "17 Oct 2026, 16:05",
    timestampBn: "১৭ অক্টোবর ২০২৬, ১৬:০৫",
    memberName: "Farhana Akter",
    memberEmail: "farhana.it@apexholdings.bd",
    department: "Engineering & IT",
    module: "ContractMind Audit",
    category: "Copyright Act 2000",
    creditsConsumed: 50,
  },
  {
    id: "log-105",
    timestampEn: "17 Oct 2026, 12:50",
    timestampBn: "১৭ অক্টোবর ২০২৬, ১২:৫০",
    memberName: "Sadia Rahman",
    memberEmail: "sadia.finance@apexholdings.bd",
    department: "Finance & Accounts",
    module: "Advotech Copilot Chat",
    category: "Income Tax Act 2023",
    creditsConsumed: 5,
  },
];
