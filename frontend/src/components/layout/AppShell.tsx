"use client";

import React from "react";
import AppDock from "@/components/dock/AppDock";
import { useAuth } from "@/context/AuthContext";
import { usePersona } from "@/context/PersonaContext";
import { useLanguage } from "@/context/LanguageContext";
import { Shield, Sparkles } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { currentPersonaInfo } = usePersona();
  const { language, t } = useLanguage();

  return (
    <div className="relative flex min-h-screen w-full bg-[var(--bg-primary)] transition-colors duration-200 overflow-x-hidden">
      {/* Left Vertical Dock */}
      <AppDock />

      {/* Main Workspace Area with left padding to give clearance to the dock */}
      <main className="flex-1 min-h-screen pl-24 pr-6 py-6 md:pl-28 md:pr-10 md:py-8 max-w-[1600px] mx-auto flex flex-col">
        {/* Subtle Top Indicator Bar without full navbar borders */}
        <div className="flex items-center justify-between mb-6 pb-2 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-sm shadow-md">
              LC
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                {t("appName")}
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {language === "bn" ? currentPersonaInfo.focus.bn : currentPersonaInfo.focus.en}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-neutral-200/70 dark:bg-neutral-900/80 text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {user ? user.name : "Guest Session"}
            </div>
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div className="flex-1 w-full">{children}</div>
      </main>
    </div>
  );
}
