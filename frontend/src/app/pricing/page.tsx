/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Coins, Check, Sparkles, ArrowRight, Clock, CheckCircle2,
  X, Copy, Loader2, Ban, Phone, Hash,
} from "lucide-react";

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

  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
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

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeInitiate) {
        setActiveInitiate(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeInitiate]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeInitiate) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeInitiate]);

  const borderClass = "border-(--text-primary)/10";

  // ✅ Check if user is Enterprise
  const isEnterprise = 
    String(user?.role).toLowerCase().includes("enterprise") || 
    user?.role === "enterprise_admin" || 
    user?.role === "enterprise_member";

  // ✅ Determine which balance to show (Company Pool vs Personal)
  const displayBalance = isEnterprise 
    ? (user?.enterprise_credit_balance ?? 0) 
    : (user?.creditBalance ?? summary?.current_balance ?? 0);

  const balanceLabel = isEnterprise 
    ? (isBn ? "কোম্পানি পুল ব্যালেন্স" : "Company Pool Balance")
    : (isBn ? "বর্তমান ব্যালেন্স" : "Current Balance");

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

      if (pkgsRes.status === "fulfilled" && Array.isArray(pkgsRes.value)) {
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
        setIsLoadingPackages(true);
        const [pkgsRes, paysRes, sumRes] = await Promise.allSettled([
          listPackages(),
          listMyPayments(),
          getPaymentSummary(),
        ]);
        if (!isMounted) return;

        if (pkgsRes.status === "fulfilled" && Array.isArray(pkgsRes.value)) {
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
      } finally {
        if (isMounted) setIsLoadingPackages(false);
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
    } catch (err: any) {
      alert(err?.message || "Failed to initiate payment.");
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

  // ✅ Filter packages based on user role
  const displayPackages = packages.filter((pkg) => {
    const isEnterprisePack = pkg.name.toLowerCase().includes("enterprise");
    if (isEnterprise) {
      return isEnterprisePack; // Enterprise Admin/Member shudhu Enterprise pack dekhabe
    }
    return !isEnterprisePack; // Normal/Lawyer ra Enterprise pack dekhabe na
  });

  const approvedPayments = payments.filter((p) => (p.status || "").toUpperCase() === "APPROVED");
  const awaitingPayments = payments.filter((p) => {
    const s = (p.status || "").toUpperCase();
    return s === "PENDING_VERIFICATION" || s === "SUBMITTED" || s === "AWAITING_ADMIN" || s === "PENDING";
  });
  const totalTopupFromPayments = approvedPayments.reduce((sum, p) => sum + (p.amount_bdt || 0), 0);

  const displayApproved = summary?.approved ?? approvedPayments.length;
  const displayAwaiting = summary?.awaiting_admin ?? summary?.pending_submission ?? awaitingPayments.length;
  const displayTotalTopup = summary?.total_topup_bdt ?? summary?.total_spent_bdt ?? totalTopupFromPayments;

  if (String(user?.role).toUpperCase() === "LAWYER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-primary)">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 md:py-12 space-y-8 sm:space-y-10 min-w-0">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-[#E2136E] border border-pink-500/20">
            <Coins className="w-3.5 h-3.5" />
            <span>{isBn ? "বিকাশ ইনস্ট্যান্ট পেমেন্ট ও প্যাকেজ" : "bKash Instant Billing"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-(--text-primary)">
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
          <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${borderClass} bg-(--bg-card) flex flex-col justify-between`}>
            <span className="text-[11px] text-(--text-muted) font-medium">
              {balanceLabel}
            </span>
            <span className="font-mono font-bold text-emerald-500 text-base sm:text-xl mt-1 truncate">
              {displayBalance} {isBn ? "ক্রেডিট" : "Credits"}
            </span>
          </div>
          <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${borderClass} bg-(--bg-card) flex flex-col justify-between`}>
            <span className="text-[11px] text-(--text-muted) font-medium">
              {isBn ? "মোট টপ-আপ" : "Total Top-up"}
            </span>
            <span className="font-mono font-bold text-(--text-primary) text-base sm:text-xl mt-1 truncate">
              ৳{displayTotalTopup}
            </span>
          </div>
          <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${borderClass} bg-(--bg-card) flex flex-col justify-between`}>
            <span className="text-[11px] text-(--text-muted) font-medium">
              {isBn ? "অনুমোদিত পেমেন্ট" : "Approved Orders"}
            </span>
            <span className="font-mono font-bold text-sky-500 text-base sm:text-xl mt-1 truncate">
              {displayApproved}
            </span>
          </div>
          <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${borderClass} bg-(--bg-card) flex flex-col justify-between`}>
            <span className="text-[11px] text-(--text-muted) font-medium">
              {isBn ? "অপেক্ষমান যাচাই" : "Awaiting Verification"}
            </span>
            <span className="font-mono font-bold text-amber-500 text-base sm:text-xl mt-1 truncate">
              {displayAwaiting}
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {isLoadingPackages ? (
           <div className="flex justify-center py-20">
             <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
           </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 ${displayPackages.length === 1 ? "md:grid-cols-1 max-w-md mx-auto" : "md:grid-cols-3"}`}>
            {displayPackages.map((pkg) => {
              const badge = pkg.badge_text || (pkg.is_popular ? (isBn ? "সর্বাধিক জনপ্রিয়" : "Most Popular") : null);
              const totalCredits = pkg.total_credits || pkg.credits;

              return (
                <div
                  key={pkg.id}
                  className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl border flex flex-col justify-between transition-all relative ${
                    pkg.is_popular
                      ? "border-[#E2136E] bg-(--bg-card) shadow-lg shadow-pink-500/5 ring-1 ring-[#E2136E]/30"
                      : `${borderClass} bg-(--bg-card)`
                  }`}
                >
                  {badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#E2136E] text-white shadow-sm whitespace-nowrap">
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
                      <span className="text-2xl sm:text-3xl font-mono font-bold text-(--text-primary)">
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
                    className={`w-full py-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 ${
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
        )}

        {/* Previous Payment History */}
        <div className={`p-5 sm:p-8 rounded-2xl sm:rounded-3xl border ${borderClass} bg-(--bg-card) space-y-4`}>
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
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs font-mono whitespace-nowrap">
                <thead>
                  <tr className="border-b border-(--text-primary)/10 text-(--text-muted) uppercase text-[10px]">
                    <th className="py-2.5 px-3">{isBn ? "রেফারেন্স" : "Ref / Code"}</th>
                    <th className="py-2.5 px-3">{isBn ? "প্যাকেজ" : "Package"}</th>
                    <th className="py-2.5 px-3">{isBn ? "পরিমাণ" : "Amount"}</th>
                    <th className="py-2.5 px-3">{isBn ? "ক্রেডিট" : "Credits"}</th>
                    <th className="py-2.5 px-3">{isBn ? "ট্রানজেকশন আইডি" : "TrxID"}</th>
                    <th className="py-2.5 px-3">{isBn ? "তারিখ" : "Date"}</th>
                    <th className="py-2.5 px-3 text-right">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--text-primary)/5">
                  {payments.map((p) => {
                    const statusUpper = (p.status || "").toUpperCase();
                    const isPending = statusUpper === "PENDING";

                    return (
                      <tr key={p.id}>
                        <td className="py-3 px-3 font-semibold text-(--text-primary)">
                          {p.reference_code || `#${p.id}`}
                        </td>
                        <td className="py-3 px-3 font-sans text-(--text-primary)">
                          {p.package_name || p.package?.name || (isBn ? "ক্রেডিট রিচার্জ" : "Credit Recharge")}
                        </td>
                        <td className="py-3 px-3 text-(--text-primary) font-bold">৳{p.amount_bdt}</td>
                        <td className="py-3 px-3 text-emerald-500 font-bold">+{p.total_credits || p.credits || 0}</td>
                        <td className="py-3 px-3 text-(--text-muted)">
                          {p.trx_id || p.bkash_trx_id || (
                            <span className="italic text-[10px] opacity-70">
                              {isBn ? "অপেক্ষমান" : "Pending"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-(--text-muted) font-sans">
                          {new Date(p.created_at || p.initiated_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {getStatusBadge(p.status)}
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleResumePending(p)}
                                className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#E2136E]/10 text-[#E2136E] hover:bg-[#E2136E]/20 transition-colors cursor-pointer shrink-0"
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

        {/* ── BKASH PAYMENT MODAL (RESPONSIVE & COMPACT) ── */}
        {activeInitiate && (
          <div
            onClick={() => setActiveInitiate(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border ${borderClass} bg-(--bg-card) shadow-2xl flex flex-col`}
            >
              
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-(--text-primary)/10 bg-[#E2136E] text-white flex items-center justify-between shrink-0 sticky top-0 z-10">
                <div className="min-w-0 flex-1 pr-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block truncate">
                    bKash Payment Gateway
                  </span>
                  <h3 className="text-base font-bold truncate">
                    {activeInitiate.package_name || (isBn ? "ক্রেডিট রিচার্জ" : "Credit Package Recharge")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveInitiate(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-4">
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
                      <div className="flex flex-wrap sm:flex-nowrap justify-between items-baseline gap-1">
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
                      <div className="flex justify-between items-center gap-2 pt-2 border-t border-(--text-primary)/5">
                        <div className="min-w-0 flex-1 pr-1">
                          <p className="text-[10px] uppercase font-bold text-(--text-muted) flex items-center gap-1.5 flex-wrap">
                            <span>{isBn ? "বিকাশ নম্বর" : "bKash Number"}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#E2136E]/10 text-[#E2136E] font-sans">
                              {activeInitiate.bkash?.bkash_type || "Merchant"}
                            </span>
                          </p>
                          <p className="font-mono font-bold text-sm text-(--text-primary) truncate">
                            {activeInitiate.bkash?.bkash_number || activeInitiate.bkash_number || "01700000000"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText(activeInitiate.bkash?.bkash_number || activeInitiate.bkash_number || "01700000000", "number")}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-(--text-primary)/10 hover:bg-(--text-primary)/20 text-(--text-primary) flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedNumber ? (isBn ? "কপি হয়েছে" : "Copied") : (isBn ? "কপি" : "Copy")}</span>
                        </button>
                      </div>

                      {/* Reference Code */}
                      <div className="flex justify-between items-center gap-2 pt-2 border-t border-amber-500/20 bg-amber-500/5 -mx-4 -mb-4 p-3 rounded-b-2xl">
                        <div className="min-w-0 flex-1 pr-1">
                          <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 truncate">
                            {isBn ? "রেফারেন্স কোড (বিকাশে অবশ্যই দিন)" : "bKash Reference Code (Required)"}
                          </p>
                          <p className="font-mono font-bold text-sm text-(--text-primary) truncate">
                            {activeInitiate.reference_code || `TOPUP-${activeInitiate.payment_id}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText(activeInitiate.reference_code || `TOPUP-${activeInitiate.payment_id}`, "ref")}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 flex items-center gap-1 cursor-pointer shrink-0"
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
                          {isBn ? "পেমেন্টের মেয়াদ:" : "Expires at:"}{" "}
                          {new Date(activeInitiate.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {/* Compact Instructions (Replaced long text with 3 steps) */}
                    <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] text-(--text-primary)">
                        <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-600 flex items-center justify-center text-[9px] font-bold shrink-0">1</span>
                        <span>{isBn ? "বিকাশ অ্যাপে 'Send Money' করুন" : "Open bKash app and use 'Send Money'"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-(--text-primary)">
                        <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-600 flex items-center justify-center text-[9px] font-bold shrink-0">2</span>
                        <span>{isBn ? "উপরের রেফারেন্স কোডটি দিন" : "Enter the Reference Code above"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-(--text-primary)">
                        <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-600 flex items-center justify-center text-[9px] font-bold shrink-0">3</span>
                        <span>{isBn ? "প্রাপ্ত TrxID নিচে লিখুন" : "Enter the TrxID below"}</span>
                      </div>
                    </div>

                    <form onSubmit={handleTrxSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-(--text-muted) mb-1 uppercase tracking-wider">
                          {isBn ? "প্রেরকের বিকাশ নম্বর" : "Sender bKash Number"}
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-(--text-muted) absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={senderNumber}
                            onChange={(e) => setSenderNumber(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border font-mono outline-none ${borderClass} bg-(--bg-surface) text-(--text-primary) focus:border-[#E2136E]`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-(--text-muted) mb-1 uppercase tracking-wider">
                          {isBn ? "বিকাশ ট্রানজেকশন আইডি" : "bKash Transaction ID"}
                        </label>
                        <div className="relative">
                          <Hash className="w-4 h-4 text-(--text-muted) absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            placeholder="e.g. BL9A7K8XYZ"
                            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border font-mono outline-none ${borderClass} bg-(--bg-surface) text-(--text-primary) uppercase focus:border-[#E2136E]`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
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
                          <span>{isBn ? "পেমেন্ট নিশ্চিত করুন" : "Confirm Payment"}</span>
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