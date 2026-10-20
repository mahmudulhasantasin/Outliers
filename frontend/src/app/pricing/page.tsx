"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  CreditPackage,
  Payment,
  PaymentSummary,
  InitiatePaymentResponse,
  listPackages,
  initiatePayment,
  submitTrxId,
  cancelPayment,
  listMyPayments,
  getPaymentSummary,
} from "@/lib/apiServices";
import {
  Coins,
  Check,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  X,
  Copy,
  Loader2,
  Ban,
} from "lucide-react";

const DEFAULT_PACKAGES: CreditPackage[] = [
  {
    id: 1,
    name: "Starter Pack",
    credits: 440,
    total_credits: 440,
    base_credits: 400,
    bonus_credits: 40,
    price_bdt: 500,
    description: "Ideal for individual contracts and statutory legal inquiries.",
    badge_text: null,
    is_popular: false,
    features: [
      "440 AI Credits (40 Bonus)",
      "15 AI Contract Audits",
      "50 Chat queries with citation",
      "Standard email support",
    ],
  },
  {
    id: 2,
    name: "Standard Pack",
    credits: 950,
    total_credits: 950,
    base_credits: 800,
    bonus_credits: 150,
    price_bdt: 1000,
    description: "Best for growing businesses, startups, and advocate consultations.",
    badge_text: "Most Popular",
    is_popular: true,
    features: [
      "950 AI Credits (150 Bonus)",
      "35 AI Contract Audits",
      "120 Chat queries with citation",
      "Priority support & statutory alerts",
    ],
  },
  {
    id: 3,
    name: "Pro Pack",
    credits: 2600,
    total_credits: 2600,
    base_credits: 2000,
    bonus_credits: 600,
    price_bdt: 2500,
    description: "Maximum compliance suite with playbook enforcement and team quota.",
    badge_text: "Best Value",
    is_popular: false,
    features: [
      "2600 AI Credits (600 Bonus)",
      "100 AI Contract Audits",
      "Unlimited statutory citations",
      "Lawyer HITL Verification Capable",
      "Bar Council compliance audit report",
    ],
  },
];

function generateFallbackInitiate(pkg: CreditPackage): InitiatePaymentResponse {
  const timestamp = Date.now();
  const randomCode = `PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const creds = pkg.total_credits || pkg.credits || 0;
  return {
    payment_id: `pay-${timestamp}`,
    reference_code: randomCode,
    amount_bdt: pkg.price_bdt,
    total_credits: creds,
    credits: creds,
    package_name: pkg.name,
    expires_at: new Date(timestamp + 86400000).toISOString(),
    bkash: {
      bkash_number: "01711000000",
      bkash_type: "Merchant",
      instructions_en:
        "1. Open bKash app.\n2. Choose 'Send Money' or 'Payment' to 01711000000.\n3. Enter exact amount ৳" +
        pkg.price_bdt +
        ".\n4. Enter Reference: " +
        randomCode +
        ".\n5. Enter your TrxID below.",
      instructions_bn:
        "১. বিকাশ অ্যাপ খুলুন।\n২. 'Send Money' বা 'Payment' করুন 01711000000 নম্বরে।\n৩. টাকার পরিমাণ ৳" +
        pkg.price_bdt +
        " দিন।\n৪. রেফারেন্স কোড হিসেবে " +
        randomCode +
        " লিখুন।\n৫. প্রাপ্ত TrxID নিচে লিখুন।",
    },
    bkash_number: "01711000000",
    instructions: "Send Money to 01711000000 with Reference: " + randomCode,
  };
}

export default function PricingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";

  useEffect(() => {
    const userRole = String(user?.role).toUpperCase();
    if (userRole === "LAWYER") {
      router.replace("/lawyer/pending");
    }
  }, [user, router]);

  const [packages, setPackages] = useState<CreditPackage[]>(DEFAULT_PACKAGES);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);

  // bKash Modal State
  const [activeInitiate, setActiveInitiate] = useState<InitiatePaymentResponse | null>(null);
  const [initiatingPkgId, setInitiatingPkgId] = useState<number | string | null>(null);
  const [trxId, setTrxId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [isSubmittingTrx, setIsSubmittingTrx] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [trxSuccessMessage, setTrxSuccessMessage] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const borderClass = "border-(--text-primary)/10";

  const refreshData = async () => {
    try {
      if (refreshUser) {
        refreshUser().catch(() => {/* noop */});
      }
      const [pkgsRes, paysRes, sumRes] = await Promise.allSettled([
        listPackages(),
        listMyPayments(),
        getPaymentSummary(),
      ]);

      if (pkgsRes.status === "fulfilled" && Array.isArray(pkgsRes.value) && pkgsRes.value.length > 0) {
        setPackages(pkgsRes.value);
      }
      if (paysRes.status === "fulfilled" && Array.isArray(paysRes.value)) {
        setPayments(paysRes.value);
      }
      if (sumRes.status === "fulfilled" && sumRes.value) {
        setSummary(sumRes.value);
      }
    } catch (err: unknown) {
      console.warn("Could not refresh pricing data:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (refreshUser) {
      refreshUser().catch(() => {/* noop */});
    }

    const fetchInitialData = async () => {
      try {
        const [pkgsRes, paysRes, sumRes] = await Promise.allSettled([
          listPackages(),
          listMyPayments(),
          getPaymentSummary(),
        ]);
        if (!isMounted) return;

        if (pkgsRes.status === "fulfilled" && Array.isArray(pkgsRes.value) && pkgsRes.value.length > 0) {
          setPackages(pkgsRes.value);
        }
        if (paysRes.status === "fulfilled" && Array.isArray(paysRes.value)) {
          setPayments(paysRes.value);
        }
        if (sumRes.status === "fulfilled" && sumRes.value) {
          setSummary(sumRes.value);
        }
      } catch (err: unknown) {
        console.warn("Could not load initial pricing data:", err);
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  const handleInitiate = async (pkg: CreditPackage) => {
    try {
      setInitiatingPkgId(pkg.id);
      const res = await initiatePayment(pkg.id, pkg);
      setActiveInitiate(res);
      setTrxId("");
      setSenderNumber(user?.mobile || "");
      setTrxSuccessMessage(null);
    } catch (err: unknown) {
      console.warn("Initiate payment fallback:", err);
      setActiveInitiate(generateFallbackInitiate(pkg));
      setTrxId("");
      setSenderNumber(user?.mobile || "");
      setTrxSuccessMessage(null);
    } finally {
      setInitiatingPkgId(null);
    }
  };

  const handleResumePending = (p: Payment) => {
    const creds = p.total_credits || p.credits || 0;
    setActiveInitiate({
      payment_id: p.id,
      reference_code: p.reference_code,
      amount_bdt: p.amount_bdt,
      total_credits: creds,
      credits: creds,
      expires_at: p.expires_at || "",
      bkash: {
        bkash_number: "01711000000",
        bkash_type: "Merchant",
        instructions_en: "Send Money to the bKash number below with your Reference code, then submit TrxID.",
        instructions_bn: "নিচের বিকাশ নম্বরে রেফারেন্স কোড সহ টাকা পাঠান এবং TrxID সাবমিট করুন।"
      },
      package_name: p.package_name || p.package?.name || (isBn ? "প্যাকেজ রিচার্জ" : "Package Recharge"),
    });
    setTrxId(p.trx_id || p.bkash_trx_id || "");
    setSenderNumber(user?.mobile || "");
    setTrxSuccessMessage(null);
  };

  const handleTrxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInitiate || !trxId.trim()) return;
    try {
      setIsSubmittingTrx(true);
      await submitTrxId(activeInitiate.payment_id, trxId.trim(), senderNumber.trim() || user?.mobile || "01700000000");
      setTrxSuccessMessage(
        isBn
          ? "ট্রানজেকশন সফলভাবে সাবমিট হয়েছে! অ্যাডমিন অনুমোদন করার সাথে সাথে আপনার ব্যালেন্সে ক্রেডিট যুক্ত হবে।"
          : "Transaction ID submitted successfully! Credits will be credited once verified."
      );
      // Optimistically add to payments list
      const newPayment: Payment = {
        id: activeInitiate.payment_id,
        reference_code: activeInitiate.reference_code,
        package_name: activeInitiate.package_name,
        amount_bdt: activeInitiate.amount_bdt,
        total_credits: activeInitiate.total_credits || activeInitiate.credits || 0,
        credits: activeInitiate.total_credits || activeInitiate.credits || 0,
        status: "PENDING_VERIFICATION",
        trx_id: trxId.trim(),
        bkash_trx_id: trxId.trim(),
        sender_number: senderNumber.trim(),
        created_at: new Date().toISOString(),
        initiated_at: new Date().toISOString(),
      };
      setPayments((prev) => [newPayment, ...prev.filter((p) => String(p.id) !== String(activeInitiate.payment_id))]);
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit transaction ID";
      alert(msg);
    } finally {
      setIsSubmittingTrx(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!activeInitiate) return;
    const confirmCancel = window.confirm(
      isBn ? "আপনি কি নিশ্চিতভাবে এই পেমেন্ট বাতিল করতে চান?" : "Are you sure you want to cancel this pending payment?"
    );
    if (!confirmCancel) return;
    try {
      setIsCancelling(true);
      await cancelPayment(activeInitiate.payment_id);
      setPayments((prev) =>
        prev.map((p) =>
          String(p.id) === String(activeInitiate.payment_id) ? { ...p, status: "CANCELLED" } : p
        )
      );
      setActiveInitiate(null);
      refreshData();
    } catch (err: unknown) {
      console.warn("Cancel payment error:", err);
      setActiveInitiate(null);
    } finally {
      setIsCancelling(false);
    }
  };

  const copyText = (text: string, type: "number" | "ref") => {
    navigator.clipboard.writeText(text);
    if (type === "number") {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          {isBn ? "অনুমোদিত" : "APPROVED"}
        </span>
      );
    }
    if (s === "PENDING_VERIFICATION" || s === "SUBMITTED") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400">
          {isBn ? "যাচাই প্রক্রিয়াধীন" : "VERIFYING"}
        </span>
      );
    }
    if (s === "REJECTED") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
          {isBn ? "প্রত্যাখ্যাত" : "REJECTED"}
        </span>
      );
    }
    if (s === "CANCELLED" || s === "EXPIRED") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-500/10 text-zinc-500">
          {s}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
        {isBn ? "পেমেন্ট বাকি" : "PENDING"}
      </span>
    );
  };

  const approvedPayments = payments.filter((p) => (p.status || "").toUpperCase() === "APPROVED");
  const awaitingPayments = payments.filter((p) => {
    const s = (p.status || "").toUpperCase();
    return s === "PENDING_VERIFICATION" || s === "SUBMITTED" || s === "AWAITING_ADMIN" || s === "PENDING";
  });
  const totalTopupFromPayments = approvedPayments.reduce((sum, p) => sum + (p.amount_bdt || 0), 0);

  const displayApproved = summary?.approved ?? approvedPayments.length;
  const displayAwaiting = summary?.awaiting_admin ?? summary?.pending_submission ?? awaitingPayments.length;
  const displayTotalTopup = summary?.total_topup_bdt ?? summary?.total_spent_bdt ?? totalTopupFromPayments;
  const displayBalance = user?.creditBalance ?? summary?.current_balance ?? 0;

  if (String(user?.role).toUpperCase() === "LAWYER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-[#E2136E] border border-pink-500/20">
            <Coins className="w-3.5 h-3.5" />
            <span>{isBn ? "বিকাশ ইনস্ট্যান্ট পেমেন্ট ও প্যাকেজ" : "bKash Instant Billing"}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-(--text-primary)">
            {isBn ? "স্বচ্ছ ক্রেডিট প্যাকেজ ও মূল্যতালিকা" : "Transparent Credit Pricing"}
          </h1>

          <p className="text-xs md:text-sm text-(--text-muted)">
            {isBn
              ? "চুক্তিপত্র অডিট, এআই লিগ্যাল কোপাইলট এবং বাংলাদেশ বার কাউন্সিল আইনজীবীর ভেরিফিকেশনের জন্য পর্যাপ্ত ক্রেডিট প্যাকেজ নির্বাচন করুন।"
              : "Power your statutory contract audits, legal AI queries, and Supreme Court advocate sign-offs."}
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <div className={`p-4 rounded-2xl border ${borderClass} bg-(--bg-card) flex flex-col justify-between`}>
            <span className="text-[11px] text-(--text-muted) font-medium">
              {isBn ? "বর্তমান ব্যালেন্স" : "Current Balance"}
            </span>
            <span className="font-mono font-bold text-emerald-500 text-lg sm:text-xl mt-1">
              {displayBalance} {isBn ? "ক্রেডিট" : "Credits"}
            </span>
          </div>
          <div className={`p-4 rounded-2xl border ${borderClass} bg-(--bg-card) flex flex-col justify-between`}>
            <span className="text-[11px] text-(--text-muted) font-medium">
              {isBn ? "মোট টপ-আপ" : "Total Top-up"}
            </span>
            <span className="font-mono font-bold text-(--text-primary) text-lg sm:text-xl mt-1">
              ৳{displayTotalTopup}
            </span>
          </div>
          <div className={`p-4 rounded-2xl border ${borderClass} bg-(--bg-card) flex flex-col justify-between`}>
            <span className="text-[11px] text-(--text-muted) font-medium">
              {isBn ? "অনুমোদিত পেমেন্ট" : "Approved Orders"}
            </span>
            <span className="font-mono font-bold text-sky-500 text-lg sm:text-xl mt-1">
              {displayApproved}
            </span>
          </div>
          <div className={`p-4 rounded-2xl border ${borderClass} bg-(--bg-card) flex flex-col justify-between`}>
            <span className="text-[11px] text-(--text-muted) font-medium">
              {isBn ? "অপেক্ষমান যাচাই" : "Awaiting Verification"}
            </span>
            <span className="font-mono font-bold text-amber-500 text-lg sm:text-xl mt-1">
              {displayAwaiting}
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const badge = pkg.badge_text || (pkg.is_popular ? (isBn ? "সর্বাধিক জনপ্রিয়" : "Most Popular") : null);
            const totalCredits = pkg.total_credits || pkg.credits;

            return (
              <div
                key={pkg.id}
                className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all relative ${
                  pkg.is_popular
                    ? "border-[#E2136E] bg-(--bg-card) shadow-lg shadow-pink-500/5 ring-1 ring-[#E2136E]/30"
                    : `${borderClass} bg-(--bg-card)`
                }`}
              >
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#E2136E] text-white shadow-sm">
                    {badge}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-serif font-bold text-(--text-primary) mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-(--text-muted) mb-5 min-h-8">
                    {pkg.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-mono font-bold text-(--text-primary)">
                      ৳{pkg.price_bdt}
                    </span>
                    <span className="text-xs text-(--text-muted) font-mono">
                      / {totalCredits} {isBn ? "ক্রেডিট" : "credits"}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-(--text-muted) mb-6">
                    {pkg.features && pkg.features.length > 0 ? (
                      pkg.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{totalCredits} AI Contract Audits</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Statutory Redline Suggestions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Bangladesh Laws Citations</span>
                        </div>
                        {totalCredits >= 500 && (
                          <div className="flex items-center gap-2 text-(--text-primary) font-medium">
                            <Sparkles className="w-4 h-4 text-[#E2136E] shrink-0" />
                            <span>Lawyer HITL Verification Capable</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={initiatingPkgId !== null}
                  onClick={() => handleInitiate(pkg)}
                  className={`w-full py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 ${
                    pkg.is_popular
                      ? "bg-[#E2136E] text-white hover:opacity-90 shadow-md shadow-pink-500/20"
                      : "bg-(--accent-solid) text-(--accent-contrast) hover:opacity-90"
                  }`}
                >
                  {initiatingPkgId === pkg.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isBn ? "বিকাশ সংযোগ হচ্ছে..." : "Connecting bKash..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isBn ? "বিকাশ দিয়ে কিনুন" : "Buy with bKash"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Previous Payment History */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${borderClass} bg-(--bg-card) space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-(--text-primary)">
                {isBn ? "পেমেন্ট হিস্ট্রি ও ট্রানজেকশন" : "Payment & Order History"}
              </h3>
              <p className="text-xs text-(--text-muted)">
                {isBn
                  ? "আপনার সাম্প্রতিক সকল বিকাশ পেমেন্ট ও অনুমোদনের স্থিতি।"
                  : "Records of your credit package purchases and verification statuses."}
              </p>
            </div>
          </div>

          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-(--text-primary)/10 text-(--text-muted) uppercase text-[10px]">
                    <th className="py-2.5">{isBn ? "রেফারেন্স" : "Ref / Code"}</th>
                    <th className="py-2.5">{isBn ? "প্যাকেজ" : "Package"}</th>
                    <th className="py-2.5">{isBn ? "পরিমাণ" : "Amount"}</th>
                    <th className="py-2.5">{isBn ? "ক্রেডিট" : "Credits"}</th>
                    <th className="py-2.5">{isBn ? "ট্রানজেকশন আইডি" : "TrxID"}</th>
                    <th className="py-2.5">{isBn ? "তারিখ" : "Date"}</th>
                    <th className="py-2.5 text-right">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--text-primary)/5">
                  {payments.map((p) => {
                    const statusUpper = (p.status || "").toUpperCase();
                    const isPending = statusUpper === "PENDING";

                    return (
                      <tr key={p.id}>
                        <td className="py-3 font-semibold text-(--text-primary)">
                          {p.reference_code || `#${p.id}`}
                        </td>
                        <td className="py-3 font-sans text-(--text-primary)">
                          {p.package_name || p.package?.name || (isBn ? "ক্রেডিট রিচার্জ" : "Credit Recharge")}
                        </td>
                        <td className="py-3 text-(--text-primary) font-bold">৳{p.amount_bdt}</td>
                        <td className="py-3 text-emerald-500 font-bold">+{p.total_credits || p.credits || 0}</td>
                        <td className="py-3 text-(--text-muted)">
                          {p.trx_id || p.bkash_trx_id || (
                            <span className="italic text-[10px] opacity-70">
                              {isBn ? "অপেক্ষমান" : "Pending"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-(--text-muted) font-sans">
                          {new Date(p.created_at || p.initiated_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {getStatusBadge(p.status)}
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleResumePending(p)}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E2136E]/10 text-[#E2136E] hover:bg-[#E2136E]/20 transition-colors cursor-pointer"
                              >
                                {isBn ? "জমা দিন" : "Submit"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-(--text-muted) py-4 text-center">
              {isBn ? "এখনও কোনো পেমেন্ট রেকর্ড নেই।" : "No payment history yet."}
            </p>
          )}
        </div>

        {/* ── BKASH PAYMENT MODAL ── */}
        {activeInitiate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-3xl border ${borderClass} bg-(--bg-card) shadow-2xl overflow-hidden`}>
              {/* Modal Header */}
              <div className="p-5 border-b border-(--text-primary)/10 bg-[#E2136E] text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    bKash Payment Gateway
                  </span>
                  <h3 className="text-base font-bold">
                    {activeInitiate.package_name || (isBn ? "ক্রেডিট রিচার্জ" : "Credit Package Recharge")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveInitiate(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {trxSuccessMessage ? (
                  <div className="text-center py-6 space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <p className="text-sm font-semibold text-(--text-primary)">
                      {isBn ? "পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে!" : "Payment Submitted!"}
                    </p>
                    <p className="text-xs text-(--text-muted) leading-relaxed">
                      {trxSuccessMessage}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveInitiate(null)}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-(--accent-solid) text-(--accent-contrast) cursor-pointer mt-2"
                    >
                      {isBn ? "ঠিক আছে" : "Done"}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Amount & Total Credits */}
                    <div className="p-4 rounded-2xl bg-(--bg-surface) border border-(--text-primary)/10 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-(--text-muted)">
                          {isBn ? "পরিশোধযোগ্য টাকা:" : "Amount to Send:"}
                        </span>
                        <div className="text-right">
                          <span className="text-xl font-bold font-mono text-[#E2136E]">
                            ৳{activeInitiate.amount_bdt}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-500 ml-2">
                            (+{activeInitiate.total_credits || activeInitiate.credits || 0} credits)
                          </span>
                        </div>
                      </div>

                      {/* Recipient bKash Number */}
                      <div className="flex justify-between items-center pt-2 border-t border-(--text-primary)/5">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-(--text-muted) flex items-center gap-1.5">
                            <span>{isBn ? "বিকাশ নম্বর" : "bKash Number"}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#E2136E]/10 text-[#E2136E] font-sans">
                              {activeInitiate.bkash?.bkash_type || "Merchant"}
                            </span>
                          </p>
                          <p className="font-mono font-bold text-sm text-(--text-primary)">
                            {activeInitiate.bkash?.bkash_number || activeInitiate.bkash_number || "01700000000"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText(activeInitiate.bkash?.bkash_number || activeInitiate.bkash_number || "01700000000", "number")}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-(--text-primary)/10 hover:bg-(--text-primary)/20 text-(--text-primary) flex items-center gap-1 cursor-pointer"
                        >
                          {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedNumber ? (isBn ? "কপি হয়েছে" : "Copied") : (isBn ? "কপি" : "Copy")}</span>
                        </button>
                      </div>

                      {/* Reference Code */}
                      <div className="flex justify-between items-center pt-2 border-t border-amber-500/20 bg-amber-500/5 -mx-4 -mb-4 p-3 rounded-b-2xl">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                            {isBn ? "রেফারেন্স কোড (বিকাশে অবশ্যই দিন)" : "bKash Reference Code (Required)"}
                          </p>
                          <p className="font-mono font-bold text-sm text-(--text-primary)">
                            {activeInitiate.reference_code || `TOPUP-${activeInitiate.payment_id}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText(activeInitiate.reference_code || `TOPUP-${activeInitiate.payment_id}`, "ref")}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedRef ? (isBn ? "কপি হয়েছে" : "Copied") : (isBn ? "কপি" : "Copy")}</span>
                        </button>
                      </div>
                    </div>

                    {/* Expiry Notice */}
                    {activeInitiate.expires_at && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 px-1">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {isBn ? "এই পেমেন্ট রিকোয়েস্টের মেয়াদ:" : "Payment expires at:"}{" "}
                          {new Date(activeInitiate.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="p-3 rounded-xl bg-(--text-primary)/5 text-[11px] text-(--text-muted) leading-relaxed">
                      {isBn
                        ? activeInitiate.bkash?.instructions_bn || activeInitiate.instructions || "আপনার বিকাশ অ্যাপ থেকে Send Money / Payment করুন, রেফারেন্স ফিল্ডে রেফারেন্স কোডটি দিন এবং এসএমএসে প্রাপ্ত TrxID নিচে লিখুন।"
                        : activeInitiate.bkash?.instructions_en || activeInitiate.instructions || "Send money to the bKash number with the Reference Code above, then enter the TrxID below."}
                    </div>

                    <form onSubmit={handleTrxSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-(--text-muted) mb-1 uppercase tracking-wider">
                          {isBn ? "প্রেরকের বিকাশ নম্বর (Sender bKash No)" : "Sender bKash Number"}
                        </label>
                        <input
                          type="tel"
                          required
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className={`w-full px-4 py-2.5 rounded-xl text-sm border font-mono outline-none ${borderClass} bg-(--bg-surface) text-(--text-primary)`}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-(--text-muted) mb-1 uppercase tracking-wider">
                          {isBn ? "বিকাশ ট্রানজেকশন আইডি (TrxID)" : "bKash Transaction ID (TrxID)"}
                        </label>
                        <input
                          type="text"
                          required
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          placeholder="e.g. BL9A7K8XYZ"
                          className={`w-full px-4 py-2.5 rounded-xl text-sm border font-mono outline-none ${borderClass} bg-(--bg-surface) text-(--text-primary) uppercase`}
                        />
                      </div>

                      <div className="space-y-2 pt-1">
                        <button
                          type="submit"
                          disabled={isSubmittingTrx || !trxId.trim()}
                          className="w-full py-3 rounded-xl text-xs font-bold bg-[#E2136E] text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                          {isSubmittingTrx ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>{isBn ? "ট্রানজেকশন নিশ্চিত করুন" : "Confirm Payment"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCancelPayment}
                          disabled={isCancelling}
                          className="w-full py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {isCancelling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          <span>{isBn ? "পেমেন্ট বাতিল করুন" : "Cancel Payment"}</span>
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
