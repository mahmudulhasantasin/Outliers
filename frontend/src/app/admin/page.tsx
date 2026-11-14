"use client";

import React from "react";
import { useAdminData } from "./admin-data";
import { useLanguage } from "@/context/LanguageContext";
import { StatTile, AdminCard, Eyebrow, Skeleton, SkeletonRows, ErrorBanner, StatusPill } from "@/components/admin/ui";
import { DonutChart, HairlineMeter } from "@/components/admin/charts";
import { Banknote, TrendingDown, TrendingUp, Users, Activity, DollarSign } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// /admin — platform overview: revenue tiles, demographics, financial meters.
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const { isLoading, loadError, load, stats, financials, paymentsList, lawyersList, enterprisesList, withdrawalsList } = useAdminData();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <SkeletonRows rows={1} />
      </div>
    );
  }

  const totalUsers = stats?.users.total || 0;
  const generalUsers = stats?.users.general || 0;
  const lawyerUsers = stats?.users.lawyers || 0;
  const entUsers = (stats?.users.enterprise_admins || 0) + (stats?.users.enterprise_members || 0);
  const revBdt = financials?.aggregates.total_revenue_bdt || 0;
  const pendingPayouts = financials?.aggregates.pending_payouts_bdt || 0;
  const netPosition = financials?.aggregates.net_platform_position_bdt || 0;
  const paidPayouts = financials?.aggregates.paid_payouts_bdt || 0;

  const attention = [
    { label: isBn ? "অপেক্ষমান পেমেন্ট" : "Pending Payments", value: paymentsList.length, href: "/admin/payments" },
    { label: isBn ? "আইনজীবী যাচাই" : "Lawyer Reviews", value: lawyersList.length, href: "/admin/lawyers" },
    { label: isBn ? "এন্টারপ্রাইজ" : "Enterprises", value: enterprisesList.length, href: "/admin/enterprises" },
    { label: isBn ? "উইথড্রয়াল" : "Withdrawals", value: withdrawalsList.length, href: "/admin/payouts" },
  ];

  return (
    <div className="space-y-6">
      {loadError && <ErrorBanner message={isBn ? "প্ল্যাটফর্ম ডাটা লোড ব্যর্থ।" : "Platform data failed to load."} onRetry={() => load(true)} isRetrying={false} />}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label={isBn ? "মোট রেভিনিউ" : "Total Revenue"} value={revBdt} sub={isBn ? "SSLCommerz টপ-আপ" : "From SSLCommerz top-ups"} prefix="৳" icon={Banknote} />
        <StatTile label={isBn ? "অপেক্ষমান পে-আউট" : "Pending Payouts"} value={pendingPayouts} sub={isBn ? "আইনজীবীদের প্রাপ্য" : "Owed to lawyers"} prefix="৳" icon={TrendingDown} />
        <StatTile label={isBn ? "নেট পজিশন" : "Net Position"} value={netPosition} sub={isBn ? "রেভিনিউ − পে-আউট" : "Revenue minus payouts"} prefix="৳" icon={TrendingUp} />
        <StatTile label={isBn ? "মোট ইউজার" : "Total Users"} value={totalUsers} sub={isBn ? "নিবন্ধিত অ্যাকাউন্ট" : "Registered accounts"} icon={Users} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <Eyebrow>{isBn ? "ইউজার ডেমোগ্রাফিক্স" : "USER DEMOGRAPHICS"}</Eyebrow>
              <h3 className="text-sm font-serif font-bold text-(--text-primary) mt-0.5 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-(--text-muted)" />
                {isBn ? "রোল অনুযায়ী বিতরণ" : "Distribution by role"}
              </h3>
            </div>
            <StatusPill label={`${totalUsers} ${isBn ? "মোট" : "total"}`} />
          </div>
          <DonutChart
            segments={[
              { value: generalUsers, label: isBn ? "সাধারণ ইউজার" : "General Users" },
              { value: lawyerUsers, label: isBn ? "আইনজীবী" : "Lawyers" },
              { value: entUsers, label: isBn ? "এন্টারপ্রাইজ" : "Enterprise" },
            ]}
          />
        </AdminCard>

        <AdminCard className="p-6 space-y-5">
          <div>
            <Eyebrow>{isBn ? "আর্থিক বিবরণ" : "FINANCIAL BREAKDOWN"}</Eyebrow>
            <h3 className="text-sm font-serif font-bold text-(--text-primary) mt-0.5 flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-(--text-muted)" />
              {isBn ? "রেভিনিউ বনাম পেআউট (BDT)" : "Revenue vs payouts (BDT)"}
            </h3>
          </div>
          <div className="space-y-5 pt-1">
            <HairlineMeter label={isBn ? "মোট রেভিনিউ" : "Total Revenue"} value={revBdt} max={revBdt} amount={`৳${revBdt.toLocaleString()}`} />
            <HairlineMeter label={isBn ? "আইনজীবীদের পরিশোধিত" : "Paid to Lawyers"} value={paidPayouts} max={revBdt} amount={`৳${paidPayouts.toLocaleString()}`} />
            <HairlineMeter label={isBn ? "অপেক্ষমান পে-আউট" : "Pending Payouts"} value={pendingPayouts} max={revBdt} amount={`৳${pendingPayouts.toLocaleString()}`} />
            <HairlineMeter label={isBn ? "প্ল্যাটফর্ম নেট" : "Platform Net"} value={netPosition} max={revBdt} amount={`৳${netPosition.toLocaleString()}`} />
          </div>
        </AdminCard>
      </div>

      {/* Needs-attention row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {attention.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`p-4 rounded-2xl border bg-(--bg-card) hover:bg-(--bg-surface) transition-colors cursor-pointer block ${
              item.value > 0 ? "border-(--status-risk-med)/40" : "border-(--text-primary)/10"
            }`}
          >
            <p className="text-[10px] font-mono uppercase tracking-widest text-(--text-muted) mb-1">{item.label}</p>
            <p className="text-3xl font-mono font-bold text-(--text-primary) tabular-nums">{item.value}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-(--text-muted) mt-1 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${item.value > 0 ? "bg-(--status-risk-med) animate-pulse" : "bg-(--status-risk-low)"}`} />
              {item.value > 0 ? (isBn ? "মনোযোগ প্রয়োজন" : "Needs attention") : (isBn ? "সব সম্পন্ন" : "All clear")}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
