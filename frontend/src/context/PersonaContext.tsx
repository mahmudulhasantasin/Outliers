"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type PersonaType = "sme" | "hr" | "freelancer" | "advisor";

export interface PersonaInfo {
  id: PersonaType;
  nameKey: string;
  focus: {
    en: string;
    bn: string;
  };
  samplePromptKey: string;
}

export const PERSONAS: PersonaInfo[] = [
  {
    id: "sme",
    nameKey: "persona_sme",
    focus: {
      en: "Commercial risks, payment milestones, unilateral termination",
      bn: "ব্যবসায়িক ঝুঁকি, অর্থ পরিশোধের ধাপ, একতরফা চুক্তি বাতিল শর্ত"
    },
    samplePromptKey: "How do termination penalties in this agreement align with Section 74 of the Contract Act?"
  },
  {
    id: "hr",
    nameKey: "persona_hr",
    focus: {
      en: "Bangladesh Labour Act 2006 compliance, notice periods, overtime",
      bn: "বাংলাদেশ শ্রম আইন ২০০৬ কমপ্লায়েন্স, নোটিশ পিরিয়ড ও সুযোগ-সুবিধা"
    },
    samplePromptKey: "Does the 60-day notice period violate Section 26 of the Bangladesh Labour Act?"
  },
  {
    id: "freelancer",
    nameKey: "persona_freelancer",
    focus: {
      en: "IP transfer rights, non-compete reasonableness, dispute jurisdiction",
      bn: "মেধাস্বত্ব মালিকানা, নন-কম্পিট ধারা এবং বিরোধ নিষ্পত্তির এলাকা"
    },
    samplePromptKey: "Is the 2-year worldwide non-compete clause legally enforceable in Bangladesh?"
  },
  {
    id: "advisor",
    nameKey: "persona_advisor",
    focus: {
      en: "Statutory mapping, high court precedents, formal legal memo draft",
      bn: "আইনি ধারা ম্যাপিং, সুপ্রিম কোর্টের নজির ও আনুষ্ঠানিক মেমো খসড়া"
    },
    samplePromptKey: "Draft a verified memorandum referencing the relevant sections of the Contract Act 1872."
  }
];

interface PersonaContextType {
  persona: PersonaType;
  setPersona: (p: PersonaType) => void;
  currentPersonaInfo: PersonaInfo;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaType>("sme");

  useEffect(() => {
    const saved = localStorage.getItem("app_persona") as PersonaType;
    if (saved && PERSONAS.some(p => p.id === saved)) {
      setPersonaState(saved);
    }
  }, []);

  const setPersona = (p: PersonaType) => {
    setPersonaState(p);
    localStorage.setItem("app_persona", p);
  };

  const currentPersonaInfo = PERSONAS.find(p => p.id === persona) || PERSONAS[0];

  return (
    <PersonaContext.Provider value={{ persona, setPersona, currentPersonaInfo }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return context;
}
