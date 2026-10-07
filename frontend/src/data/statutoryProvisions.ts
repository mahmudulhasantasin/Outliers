export interface StatutoryProvision {
  id: string;
  actTitleEn: string;
  actTitleBn: string;
  sectionEn: string;
  sectionBn: string;
  bdlawsUrl: string;
  fullTextEn: string;
  fullTextBn: string;
  summaryEn: string;
  summaryBn: string;
}

export const STATUTORY_PROVISIONS: Record<string, StatutoryProvision> = {
  "contract-act-73": {
    id: "contract-act-73",
    actTitleEn: "The Contract Act, 1872 (Act IX of 1872)",
    actTitleBn: "চুক্তি আইন, ১৮৭২",
    sectionEn: "Section 73 - Compensation for loss or damage caused by breach of contract",
    sectionBn: "ধারা ৭৩ - চুক্তিভঙ্গের কারণে ক্ষতি বা লোকসানের ক্ষতিপূরণ",
    bdlawsUrl: "http://bdlaws.minlaw.gov.bd/act-26/section-2741.html",
    fullTextEn: "When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.\n\nSuch compensation is not to be given for any remote and indirect loss or damage sustained by reason of the breach.",
    fullTextBn: "যখন কোনো চুক্তি ভঙ্গ করা হয়, তখন যে পক্ষ এর ফলে ক্ষতিগ্রস্ত হয় সে চুক্তিভঙ্গকারী পক্ষের নিকট থেকে সেই ক্ষতির ক্ষতিপূরণ পাওয়ার অধিকারী, যা স্বাভাবিকভাবেই চুক্তিভঙ্গের কারণে উদ্ভূত হয় বা যা চুক্তি করার সময় উভয় পক্ষের জানা ছিল যে এর ফলে এমন ক্ষতি হতে পারে।\n\nতবে কোনো পরোক্ষ বা দূরবর্তী ক্ষতির জন্য ক্ষতিপূরণ দেওয়া যাবে না।",
    summaryEn: "Prohibits unlimited punitive compensation. Only damages that naturally arose or were reasonably contemplated can be claimed. Indirect or remote losses are strictly excluded.",
    summaryBn: "অবাস্তব বা পরোক্ষ ক্ষতিপূরণ দাবি করা বেআইনি। কেবল স্বাভাবিক ও প্রত্যক্ষ ক্ষতির জন্যই ক্ষতিপূরণ প্রাপ্য।"
  },
  "contract-act-74": {
    id: "contract-act-74",
    actTitleEn: "The Contract Act, 1872 (Act IX of 1872)",
    actTitleBn: "চুক্তি আইন, ১৮৭২",
    sectionEn: "Section 74 - Compensation for breach of contract where penalty stipulated for",
    sectionBn: "ধারা ৭৪ - চুক্তিভঙ্গের জন্য জরিমানা নির্ধারিত থাকলে ক্ষতিপূরণ",
    bdlawsUrl: "http://bdlaws.minlaw.gov.bd/act-26/section-2742.html",
    fullTextEn: "When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, or if the contract contains any other stipulation by way of penalty, the party complaining of the breach is entitled, whether or not actual damage or loss is proved to have been caused thereby, to receive from the party who has broken the contract reasonable compensation not exceeding the amount so named or, as the case may be, the penalty stipulated for.",
    fullTextBn: "চুক্তিতে যদি চুক্তিভঙ্গের জন্য কোনো নির্দিষ্ট অর্থ প্রদানের শর্ত থাকে বা জরিমানার বিধান থাকে, তবে ক্ষতিগ্রস্ত পক্ষ প্রমাণ ছাড়াই উপযুক্ত ও যৌক্তিক ক্ষতিপূরণ পাওয়ার অধিকারী, যা চুক্তিতে উল্লেখিত সর্বোচ্চ সীমার বেশি হবে না।",
    summaryEn: "Courts will not enforce extortionate liquidated damages. Even if an agreement specifies an enormous daily penalty, the aggrieved party is only entitled to reasonable compensation, not the entire penalty sum.",
    summaryBn: "চুক্তিতে অতিরিক্ত জরিমানা লেখা থাকলেও আইন অনুযায়ী কেবল যৌক্তিক পরিমাণ ক্ষতিপূরণ আদায়যোগ্য, একতরফা অমানবিক জরিমানা আদায় করা যায় না।"
  },
  "contract-act-27": {
    id: "contract-act-27",
    actTitleEn: "The Contract Act, 1872 (Act IX of 1872)",
    actTitleBn: "চুক্তি আইন, ১৮৭২",
    sectionEn: "Section 27 - Agreement in restraint of trade void",
    sectionBn: "ধারা ২৭ - ব্যবসা-বাণিজ্য বা পেশা পরিচালনায় বাধা প্রদানকারী চুক্তি বাতিল",
    bdlawsUrl: "http://bdlaws.minlaw.gov.bd/act-26/section-2695.html",
    fullTextEn: "Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.\n\nException 1: One who sells the good-will of a business may agree with the buyer to refrain from carrying on a similar business, within specified local limits, so long as the buyer carries on a like business therein.",
    fullTextBn: "যে কোনো চুক্তি যার মাধ্যমে কাউকে আইনানুগ পেশা, ব্যবসা বা বাণিজ্য পরিচালনায় বিরত রাখা হয়, তা ততখানি বাতিল বলে গণ্য হবে।\n\nব্যতিক্রম ১: গুডউইল বিক্রির ক্ষেত্রে যুক্তিসঙ্গত ভৌগোলিক সীমায় অনুরূপ ব্যবসা না করার শর্ত প্রযোজ্য হতে পারে।",
    summaryEn: "Post-employment non-compete clauses prohibiting individuals from working in their trade or founding startups are fundamentally void ab initio under Bangladesh law.",
    summaryBn: "চাকরি ছাড়ার পর কোনো ব্যক্তি বা ফ্রিল্যান্সারকে অন্য কোথাও কাজ করতে বা স্টার্টআপ করতে বাধা দেওয়া সম্পূর্ণ বেআইনি ও বাতিল।"
  },
  "labour-act-26": {
    id: "labour-act-26",
    actTitleEn: "Bangladesh Labour Act, 2006 (Act XLII of 2006)",
    actTitleBn: "বাংলাদেশ শ্রম আইন, ২০০৬",
    sectionEn: "Section 26 - Discharge from service of permanent worker",
    sectionBn: "ধারা ২৬ - স্থায়ী শ্রমিকের কর্মাবসান বা ডিসচার্জ সংক্রান্ত বিধান",
    bdlawsUrl: "http://bdlaws.minlaw.gov.bd/act-952/section-31154.html",
    fullTextEn: "The employment of a permanent worker may be terminated by the employer otherwise than in the manner provided elsewhere in this Chapter, by giving him in the case of monthly rated worker, 120 days' notice in writing, or in the case of other worker, 60 days' notice in writing.\n\nWhere an employer terminates the employment of a permanent worker without notice, he shall pay the worker wages in lieu of the notice period, along with compensation equal to 30 days' wages for every completed year of service.",
    fullTextBn: "মাসিক বেতনের স্থায়ী শ্রমিকের ক্ষেত্রে ১২০ দিনের লিখিত নোটিশ এবং অন্যান্য শ্রমিকের ক্ষেত্রে ৬০ দিনের লিখিত নোটিশ প্রদান ব্যতিরেকে কোনো নিয়োগকারী স্থায়ী শ্রমিকের চাকরি অবসান করতে পারবেন না।\n\nনোটিশ ছাড়া চাকরি অবসান ঘটালে নোটিশ মেয়াদের সমপরিমাণ মজুরি এবং প্রতি পূর্ণ বছরের চাকরির জন্য ৩০ দিনের মজুরি ক্ষতিপূরণ হিসেবে প্রদান করতে হবে।",
    summaryEn: "Mandates strict notice periods or wages in lieu thereof plus statutory gratuity/compensation. Immediate unilateral termination without compensatory remuneration is illegal.",
    summaryBn: "স্থায়ী কর্মীকে হঠাৎ বিনা নোটিশে বা ক্ষতিপূরণ ছাড়া চাকরি থেকে অব্যাহতি দেওয়া শ্রম আইন অনুযায়ী দণ্ডনীয় ও অবৈধ।"
  }
};
