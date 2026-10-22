"use client";

import React from "react";
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
} from "lucide-react";

export default function AppDock() {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const { user } = useAuth();

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
    // ✅ FIX: Enterprise Member er jonno Settings add kora holo
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

  const userRole = String(user?.role || role).toUpperCase();
  const isLawyer = userRole === "LAWYER";

  const items =
    userRole === "ADMIN"
      ? adminItems
      : isLawyer
      ? lawyerItems
      : userRole === "ENTERPRISE_ADMIN"
      ? enterpriseAdminItems
      : userRole === "ENTERPRISE_MEMBER"
      ? enterpriseMemberItems
      : userRole === "ENTERPRISE" && user?.enterpriseProfile?.isTeamMember
      ? enterpriseMemberItems
      : userRole === "ENTERPRISE"
      ? enterpriseAdminItems
      : generalItems;

  return <VerticalDock items={items} panelWidth={60} baseItemSize={42} magnification={54} />;
}