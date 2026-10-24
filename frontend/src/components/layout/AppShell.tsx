"use client";

import React from "react";
import AppDock from "@/components/dock/AppDock";

// ✅ FIX: Explicitly define the props interface to resolve the 'IntrinsicAttributes' error
interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
}

export default function AppShell({
  children,
  className = "",
  mainClassName = ""
}: AppShellProps) {
  return (
    <div
      className={`relative flex min-h-screen w-full transition-colors duration-200 overflow-x-hidden print:overflow-visible print:block print:w-full print:min-h-0 ${className}`}
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Left Vertical Dock - Hidden during Print / PDF Export */}
      <div className="print:hidden">
        <AppDock />
      </div>

      {/* Main Workspace Area with clearance for the left dock on desktop and top hamburger clearance on mobile - Reset on Print */}
      <main
        className={`flex-1 min-h-screen px-4 pt-16 pb-6 md:pt-8 md:pl-28 md:pr-10 md:pb-8 max-w-[1600px] mx-auto flex flex-col print:p-0 print:m-0 print:w-full print:max-w-none print:min-h-0 ${mainClassName}`}
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        {/* Dynamic Page Content directly without any top header bar */}
        <div className="flex-1 w-full">{children}</div>
      </main>
    </div>
  );
}