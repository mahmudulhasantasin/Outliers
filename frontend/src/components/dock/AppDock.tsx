"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import VerticalDock, { VerticalDockItemData } from "./VerticalDock";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  Bot,
  FileText,
  FolderClock,
  Inbox,
  Archive,
  Settings,
  User,
  Building2,
  Coins,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";

export default function AppDock() {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const { user } = useAuth();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isBn = language === "bn";
  const role = user?.role ?? "general";

  // ── General User Dock ──
  const generalItems: VerticalDockItemData[] = [
    {
      icon: <Bot className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "এডভোটেক কোপাইলট (Q&A)" : "Advotech Copilot",
      isActive: pathname === "/copilot" || pathname === "/app",
      onClick: () => router.push("/copilot"),
    },
    {
      icon: <FileText className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "কন্ট্রাক্টমাইন্ড (চুক্তি বিশ্লেষণ)" : "ContractMind Audit",
      isActive: pathname === "/contractmind",
      onClick: () => router.push("/contractmind"),
    },
    {
      icon: <FolderClock className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "সংরক্ষিত আর্কাইভ" : "Archive & Memos",
      isActive: pathname === "/archive",
      onClick: () => router.push("/archive"),
    },
    {
      icon: <Coins className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "প্যাকেজ ও বিলিং" : "Pricing & Packages",
      isActive: pathname === "/pricing",
      onClick: () => router.push("/pricing"),
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: isBn ? "সেটিংস" : "Settings",
      isActive: pathname === "/settings",
      onClick: () => router.push("/settings"),
    },
    {
      icon: <User className="w-5 h-5" />,
      label: isBn ? "প্রোফাইল ও ক্রেডিট" : "Profile & Credits",
      isActive: pathname === "/profile",
      onClick: () => router.push("/profile"),
    },
  ];

  // ── Lawyer Dock ──
  const lawyerItems: VerticalDockItemData[] = [
    {
      icon: <Inbox className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "পেন্ডিং চুক্তি রিভিউ" : "Pending Contracts",
      isActive: pathname === "/lawyer/pending",
      onClick: () => router.push("/lawyer/pending"),
    },
    {
      icon: <Bot className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "এডভোটেক কোপাইলট (AI Research)" : "AI Research Copilot",
      isActive: pathname === "/copilot" || pathname === "/app",
      onClick: () => router.push("/copilot"),
    },
    {
      icon: <Archive className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "আর্কাইভ চুক্তি" : "Archive Contracts",
      isActive: pathname === "/lawyer/archive",
      onClick: () => router.push("/lawyer/archive"),
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: isBn ? "সেটিংস" : "Settings",
      isActive: pathname === "/settings",
      onClick: () => router.push("/settings"),
    },
    {
      icon: <User className="w-5 h-5" />,
      label: isBn ? "প্রোফাইল ও ভেরিফিকেশন" : "Profile & Verification",
      isActive: pathname === "/profile",
      onClick: () => router.push("/profile"),
    },
  ];

  // ── Enterprise Admin Dock ──
  const enterpriseAdminItems: VerticalDockItemData[] = [
    {
      icon: <Building2 className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "এন্টারপ্রাইজ অ্যাডমিন পোর্টাল" : "Enterprise Admin Portal",
      isActive: pathname.startsWith("/enterprise/admin"),
      onClick: () => router.push("/enterprise/admin"),
    },
    {
      icon: <Bot className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "এডভোটেক কোপাইলট (Q&A)" : "Advotech Copilot",
      isActive: pathname === "/copilot" || pathname === "/app",
      onClick: () => router.push("/copilot"),
    },
    {
      icon: <FileText className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "কন্ট্রাক্টমাইন্ড (চুক্তি বিশ্লেষণ)" : "ContractMind Audit",
      isActive: pathname === "/contractmind",
      onClick: () => router.push("/contractmind"),
    },
    {
      icon: <FolderClock className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "সংরক্ষিত আর্কাইভ" : "Archive & Memos",
      isActive: pathname === "/archive",
      onClick: () => router.push("/archive"),
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: isBn ? "সেটিংস" : "Settings",
      isActive: pathname === "/settings",
      onClick: () => router.push("/settings"),
    },
    {
      icon: <User className="w-5 h-5" />,
      label: isBn ? "প্রোফাইল ও প্রতিষ্ঠান" : "Profile & Organization",
      isActive: pathname === "/profile",
      onClick: () => router.push("/profile"),
    },
  ];

  // ── Enterprise Member Dock ──
  const enterpriseMemberItems: VerticalDockItemData[] = [
    {
      icon: <Building2 className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "মেম্বার ওয়ার্কস্পেস" : "Enterprise Workspace",
      isActive: pathname.startsWith("/enterprise/member"),
      onClick: () => router.push("/enterprise/member"),
    },
    {
      icon: <Bot className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "এডভোটেক কোপাইলট (Q&A)" : "Advotech Copilot",
      isActive: pathname === "/copilot" || pathname === "/app",
      onClick: () => router.push("/copilot"),
    },
    {
      icon: <FileText className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "কন্ট্রাক্টমাইন্ড (প্লেবুক সহ)" : "ContractMind Audit",
      isActive: pathname === "/contractmind",
      onClick: () => router.push("/contractmind"),
    },
    {
      icon: <FolderClock className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "সংরক্ষিত আর্কাইভ" : "Archive & Memos",
      isActive: pathname === "/archive",
      onClick: () => router.push("/archive"),
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: isBn ? "সেটিংস" : "Settings",
      isActive: pathname === "/settings",
      onClick: () => router.push("/settings"),
    },
    {
      icon: <User className="w-5 h-5" />,
      label: isBn ? "প্রোফাইল ও কোটা" : "Profile & Quota",
      isActive: pathname === "/profile",
      onClick: () => router.push("/profile"),
    },
  ];

  // ── Admin Dock ──
  const adminItems: VerticalDockItemData[] = [
    {
      icon: <ShieldAlert className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "সিস্টেম অ্যাডমিন প্যানেল" : "System Admin Panel",
      isActive: pathname.startsWith("/admin"),
      onClick: () => router.push("/admin"),
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: isBn ? "সেটিংস" : "Settings",
      isActive: pathname === "/settings",
      onClick: () => router.push("/settings"),
    },
    {
      icon: <User className="w-5 h-5" />,
      label: isBn ? "অ্যাডমিন প্রোফাইল" : "Admin Profile",
      isActive: pathname === "/profile",
      onClick: () => router.push("/profile"),
    },
  ];

  // ── Pending Enterprise Admin Dock ──
  const pendingEnterpriseAdminItems: VerticalDockItemData[] = [
    {
      icon: <Building2 className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "এন্টারপ্রাইজ ভেরিফিকেশন স্ট্যাটাস" : "Enterprise Verification",
      isActive: pathname.startsWith("/enterprise/pending"),
      onClick: () => router.push("/enterprise/pending"),
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: isBn ? "সেটিংস" : "Settings",
      isActive: pathname === "/settings",
      onClick: () => router.push("/settings"),
    },
    {
      icon: <User className="w-5 h-5" />,
      label: isBn ? "প্রোফাইল ও প্রতিষ্ঠান" : "Profile & Organization",
      isActive: pathname === "/profile",
      onClick: () => router.push("/profile"),
    },
  ];

  // ── Pending Lawyer Dock ──
  const pendingLawyerItems: VerticalDockItemData[] = [
    {
      icon: <Inbox className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "আইনজীবী ভেরিফিকেশন স্ট্যাটাস" : "Lawyer Verification",
      isActive: pathname.startsWith("/lawyer/pending"),
      onClick: () => router.push("/lawyer/pending"),
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: isBn ? "সেটিংস" : "Settings",
      isActive: pathname === "/settings",
      onClick: () => router.push("/settings"),
    },
    {
      icon: <User className="w-5 h-5" />,
      label: isBn ? "প্রোফাইল ও সনদ" : "Profile & Credentials",
      isActive: pathname === "/profile",
      onClick: () => router.push("/profile"),
    },
  ];

  // ── Pending Enterprise Member Dock ──
  const pendingMemberItems: VerticalDockItemData[] = [
    {
      icon: <Building2 className="w-5 h-5 stroke-[2.4]" />,
      label: isBn ? "কোম্পানি অনুমোদন স্ট্যাটাস" : "Company Approval Status",
      isActive: pathname.startsWith("/enterprise/member"),
      onClick: () => router.push("/enterprise/member"),
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: isBn ? "সেটিংস" : "Settings",
      isActive: pathname === "/settings",
      onClick: () => router.push("/settings"),
    },
    {
      icon: <User className="w-5 h-5" />,
      label: isBn ? "প্রোফাইল ও কোটা" : "Profile & Quota",
      isActive: pathname === "/profile",
      onClick: () => router.push("/profile"),
    },
  ];

  const userRole = String(user?.role || role).toUpperCase();
  const entStatus = String(user?.enterpriseProfile?.verificationStatus || "").toLowerCase();
  const isPendingEnterpriseAdmin =
    Boolean(user?.enterpriseProfile && !user?.enterpriseProfile?.isTeamMember && entStatus !== "verified") ||
    entStatus === "pending" ||
    entStatus === "pending_approval";

  const lawyerStatus = String(user?.lawyerProfile?.verificationStatus || "").toLowerCase();
  const isPendingLawyer =
    Boolean(user?.lawyerProfile && lawyerStatus !== "verified") ||
    (userRole === "LAWYER" && lawyerStatus !== "verified") ||
    lawyerStatus === "pending";

  const memberStatus = String(
    user?.enterpriseProfile?.memberApprovalStatus || (user as any)?.member_approval_status || ""
  ).toUpperCase();
  const isPendingMember =
    (userRole === "ENTERPRISE_MEMBER" || user?.enterpriseProfile?.isTeamMember) &&
    (memberStatus === "PENDING" || (memberStatus !== "APPROVED" && memberStatus !== ""));

  const isVerifiedLawyer = userRole === "LAWYER" && lawyerStatus === "verified";
  const isVerifiedEnterpriseAdmin =
    (userRole === "ENTERPRISE_ADMIN" || (userRole === "ENTERPRISE" && !user?.enterpriseProfile?.isTeamMember)) &&
    entStatus === "verified";
  const isVerifiedEnterpriseMember =
    (userRole === "ENTERPRISE_MEMBER" || user?.enterpriseProfile?.isTeamMember) && !isPendingMember;

  const items =
    userRole === "ADMIN"
      ? adminItems
      : isPendingEnterpriseAdmin
      ? pendingEnterpriseAdminItems
      : isPendingLawyer
      ? pendingLawyerItems
      : isPendingMember
      ? pendingMemberItems
      : isVerifiedLawyer
      ? lawyerItems
      : isVerifiedEnterpriseAdmin
      ? enterpriseAdminItems
      : isVerifiedEnterpriseMember
      ? enterpriseMemberItems
      : generalItems;

  return (
    <>
      {/* [UPDATED] Mobile Top Hamburger Button */}
      <div className="md:hidden fixed top-4 left-4 z-100">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2.5 rounded-xl bg-(--bg-card) border border-(--text-primary)/10 shadow-lg text-(--text-primary) hover:bg-(--bg-surface) transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* [UPDATED] Mobile Fullscreen Drawer Menu */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-100 flex bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Drawer Sidebar */}
          <div className="w-72 h-full bg-(--bg-card) p-5 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-lg text-(--text-primary)">
                {isBn ? "মেনু" : "Menu"}
              </span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg text-(--text-muted) hover:bg-(--text-primary)/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto">
              {items.map((item, index) => (
                <button
                  key={index} // [UPDATED] FIX: Changed from item.label to index to resolve TS error
                  onClick={() => {
                    item.onClick();
                    setIsMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    item.isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold"
                      : "text-(--text-primary) hover:bg-(--bg-surface)"
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="text-sm truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}

      {/* [UPDATED] Desktop Floating Dock */}
      <div className="hidden md:block">
        <VerticalDock
          items={items}
          panelWidth={60}
          baseItemSize={42}
          magnification={54}
        />
      </div>
    </>
  );
}