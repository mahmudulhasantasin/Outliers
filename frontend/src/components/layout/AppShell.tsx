"use client";

import React from "react";
import AppDock from "@/components/dock/AppDock";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full bg-transparent transition-colors duration-200 overflow-x-hidden">
      {/* Left Vertical Dock - Only navigation in the app */}
      <AppDock />

      {/* Main Workspace Area with clearance for the left dock - Zero top nav */}
      <main className="flex-1 min-h-screen pl-24 pr-6 py-6 md:pl-28 md:pr-10 md:py-8 max-w-[1600px] mx-auto flex flex-col">
        {/* Dynamic Page Content directly without any top header bar */}
        <div className="flex-1 w-full">{children}</div>
      </main>
    </div>
  );
}
