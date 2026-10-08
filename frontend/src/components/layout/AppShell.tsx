"use client";

import React from "react";
import AppDock from "@/components/dock/AppDock";

export default function AppShell({
  children,
  className = "bg-white",
  mainClassName = "bg-white"
}: {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
}) {
  return (
    <div className={`relative flex min-h-screen w-full transition-colors duration-200 overflow-x-hidden print:overflow-visible print:block print:w-full print:min-h-0 ${className}`}>
      {/* Left Vertical Dock - Hidden during Print / PDF Export */}
      <div className="print:hidden">
        <AppDock />
      </div>

      {/* Main Workspace Area with clearance for the left dock - Reset on Print */}
      <main className={`flex-1 min-h-screen pl-24 pr-6 py-6 md:pl-28 md:pr-10 md:py-8 max-w-[1600px] mx-auto flex flex-col print:p-0 print:m-0 print:w-full print:max-w-none print:min-h-0 ${mainClassName}`}>
        {/* Dynamic Page Content directly without any top header bar */}
        <div className="flex-1 w-full">{children}</div>
      </main>
    </div>
  );
}
