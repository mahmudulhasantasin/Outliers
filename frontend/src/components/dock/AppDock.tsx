"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import VerticalDock, { VerticalDockItemData } from "./VerticalDock";
import { useLanguage } from "@/context/LanguageContext";
import { usePersona, PERSONAS } from "@/context/PersonaContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  Bot,
  FileText,
  FolderClock,
  Globe,
  UserCheck,
  Moon,
  Sun,
  ShieldCheck,
  Cpu,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function AppDock() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { persona, setPersona, currentPersonaInfo } = usePersona();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "bn" ? "en" : "bn");
  };

  const cyclePersona = () => {
    const currentIndex = PERSONAS.findIndex((p) => p.id === persona);
    const nextIndex = (currentIndex + 1) % PERSONAS.length;
    setPersona(PERSONAS[nextIndex].id);
  };

  const items: VerticalDockItemData[] = [
    {
      icon: <Bot className="w-5 h-5 stroke-[2.4]" />,
      label: language === "bn" ? "লিগ্যাল কোপাইলট (Q&A)" : "Legal Copilot",
      isActive: pathname === "/copilot" || pathname === "/app",
      onClick: () => router.push("/copilot"),
    },
    {
      icon: <FileText className="w-5 h-5 stroke-[2.4]" />,
      label: language === "bn" ? "কন্ট্রাক্টমাইন্ড (চুক্তি বিশ্লেষণ)" : "ContractMind Audit",
      isActive: pathname === "/contractmind",
      onClick: () => router.push("/contractmind"),
    },
    {
      icon: <FolderClock className="w-5 h-5 stroke-[2.4]" />,
      label: language === "bn" ? "সংরক্ষিত আর্কাইভ" : "Archive & Memos",
      isActive: pathname === "/archive",
      onClick: () => router.push("/archive"),
    },
    {
      icon: <Cpu className="w-5 h-5 stroke-[2.4]" />,
      label: language === "bn" ? "সিস্টেম আর্কিটেকচার" : "Architecture",
      isActive: pathname === "/architecture",
      onClick: () => router.push("/architecture"),
    },
    {
      icon: <ShieldCheck className="w-5 h-5 stroke-[2.4]" />,
      label: language === "bn" ? "সিকিউরিটি ও অডিট" : "Security & Audit",
      isActive: pathname === "/security" || pathname === "/audit",
      onClick: () => router.push("/security"),
    },
    {
      icon: (
        <span className="text-xs font-semibold tracking-wider">
          {language === "bn" ? "বাং" : "EN"}
        </span>
      ),
      label: language === "bn" ? "Switch to English" : "বাংলা ভাষায় পরিবর্তন",
      onClick: toggleLanguage,
      className: "hover:text-amber-400 dark:hover:text-amber-300",
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      label: `${t(currentPersonaInfo.nameKey)} (${language === "bn" ? "ক্লিক করে পরিবর্তন" : "Click to Switch"})`,
      onClick: cyclePersona,
      className: "hover:text-indigo-400 dark:hover:text-indigo-300",
    },
    {
      icon: theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />,
      label: theme === "dark" ? (language === "bn" ? "লাইট মোড" : "Light Mode") : (language === "bn" ? "ডার্ক মোড" : "Dark Mode"),
      onClick: toggleTheme,
    },
    {
      icon: <LogOut className="w-4 h-4 text-rose-500" />,
      label: language === "bn" ? "লগআউট / পাবলিক পেজ" : "Sign Out to Landing",
      onClick: () => {
        logout();
        router.push("/");
      },
    },
  ];

  return <VerticalDock items={items} panelWidth={60} baseItemSize={42} magnification={54} />;
}
