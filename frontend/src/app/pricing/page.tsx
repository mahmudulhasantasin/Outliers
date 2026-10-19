"use client";

import React, { useState, useEffect } from "react";
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
  listMyPayments,
  getPaymentSummary,
} from "@/lib/apiServices";
import {
  Coins,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Loader2,
} from "lucide-react";

const DEFAULT_PACKAGES: CreditPackage[] = [
  {
    id: "pkg_starter",
    name: "Starter Package",
    credits: 100,
    price_bdt: 500,
    description: "Ideal for individual contracts and statutory legal inquiries.",
    is_popular: false,
  },
  {
    id: "pkg_pro",
    name: "Legal Professional",
    credits: 500,
    price_bdt: 2000,
    description: "Best for growing businesses, startups, and advocate consultations.",
    is_popular: true,
  },
  {
    id: "pkg_enterprise",
    name: "Corporate Enterprise",
    credits: 2500,
    price_bdt: 8500,
    description: "Maximum compliance suite with playbook enforcement and team quota.",
    is_popular: false,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [packages, setPackages] = useState<CreditPackage[]>(DEFAULT_PACKAGES);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // bKash Modal State
  const [activeInitiate, setActiveInitiate] = useState<InitiatePaymentResponse | null>(null);
  const [trxId, setTrxId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [isSubmittingTrx, setIsSubmittingTrx] = useState(false);
  const [trxSuccessMessage, setTrxSuccessMessage] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const borderClass = "border-[var(--text-primary)]/10";

  const loadData = async () => {
    try {
      setIsLoading(true);
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
    } catch (err) {
      console.warn("Could not load pricing data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInitiate = async (pkg: CreditPackage) => {
    try {
      setIsLoading(true);
      const res = await initiatePayment(pkg.id);
      setActiveInitiate(res);
      setTrxId("");
      setSenderNumber(user?.mobile || "");
      setTrxSuccessMessage(null);
    } catch (err: any) {
      alert(err.message || "Failed to initiate payment");
    } finally {
      setIsLoading(false);
    }
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
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to submit transaction ID");
    } finally {
      setIsSubmittingTrx(false);
    }
  };

  const copyBkash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-[#E2136E] border border-pink-500/20">
            <Coins className="w-3.5 h-3.5" />
            <span>{isBn ? "বিকাশ ইনস্ট্যান্ট পেমেন্ট ও প্যাকেজ" : "bKash Instant Billing"}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--text-primary)]">
            {isBn ? "স্বচ্ছ ক্রেডিট প্যাকেজ ও মূল্যতালিকা" : "Transparent Credit Pricing"}
          </h1>

          <p className="text-xs md:text-sm text-[var(--text-muted)]">
            {isBn
              ? "চুক্তিপত্র অডিট, এআই লিগ্যাল কোপাইলট এবং বাংলাদেশ বার কাউন্সিল আইনজীবীর ভেরিফিকেশনের জন্য পর্যাপ্ত ক্রেডিট প্যাকেজ নির্বাচন করুন।"
              : "Power your statutory contract audits, legal AI queries, and Supreme Court advocate sign-offs."}
          </p>

          {/* Current Balance Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 text-xs font-semibold">
            <span className="text-[var(--text-muted)]">{isBn ? "বর্তমান ব্যালেন্স:" : "Current Balance:"}</span>
            <span className="font-mono font-bold text-emerald-500 text-sm">
              {summary?.current_balance ?? user?.creditBalance ?? 0} {isBn ? "ক্রেডিট" : "Credits"}
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all relative ${
                pkg.is_popular
                  ? "border-[#E2136E] bg-[var(--bg-card)] shadow-lg shadow-pink-500/5 ring-1 ring-[#E2136E]/30"
                  : `${borderClass} bg-[var(--bg-card)]`
              }`}
            >
              {pkg.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#E2136E] text-white shadow-sm">
                  {isBn ? "সর্বাধিক জনপ্রিয়" : "Most Popular"}
                </div>
              )}

              <div>
                <h3 className="text-lg font-serif font-bold text-[var(--text-primary)] mb-1">
                  {pkg.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mb-5 min-h-[32px]">
                  {pkg.description}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-mono font-bold text-[var(--text-primary)]">
                    ৳{pkg.price_bdt}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    / {pkg.credits} {isBn ? "ক্রেডিট" : "credits"}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-[var(--text-muted)] mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{pkg.credits} AI Contract Audits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Statutory Redline Suggestions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Bangladesh Laws Citations</span>
                  </div>
                  {pkg.credits >= 500 && (
                    <div className="flex items-center gap-2 text-[var(--text-primary)] font-medium">
                      <Sparkles className="w-4 h-4 text-[#E2136E] shrink-0" />
                      <span>Lawyer HITL Verification Capable</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleInitiate(pkg)}
                className={`w-full py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  pkg.is_popular
                    ? "bg-[#E2136E] text-white hover:opacity-90 shadow-md shadow-pink-500/20"
                    : "bg-[var(--accent-solid)] text-[var(--accent-contrast)] hover:opacity-90"
                }`}
              >
                <span>{isBn ? "বিকাশ দিয়ে কিনুন" : "Buy with bKash"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Previous Payment History */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${borderClass} bg-[var(--bg-card)] space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-[var(--text-primary)]">
                {isBn ? "পেমেন্ট হিস্ট্রি ও ট্রানজেকশন" : "Payment & Order History"}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
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
                  <tr className="border-b border-[var(--text-primary)]/10 text-[var(--text-muted)] uppercase text-[10px]">
                    <th className="py-2.5">{isBn ? "প্যাকেজ" : "Package"}</th>
                    <th className="py-2.5">{isBn ? "পরিমাণ" : "Amount"}</th>
                    <th className="py-2.5">{isBn ? "ক্রেডিট" : "Credits"}</th>
                    <th className="py-2.5">{isBn ? "ট্রানজেকশন আইডি" : "TrxID"}</th>
                    <th className="py-2.5">{isBn ? "তারিখ" : "Date"}</th>
                    <th className="py-2.5 text-right">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--text-primary)]/5">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 font-sans font-semibold text-[var(--text-primary)]">
                        {p.package_name}
                      </td>
                      <td className="py-3 text-[var(--text-primary)] font-bold">৳{p.amount_bdt}</td>
                      <td className="py-3 text-emerald-500 font-bold">+{p.credits}</td>
                      <td className="py-3 text-[var(--text-muted)]">{p.bkash_trx_id || "Pending Trx"}</td>
                      <td className="py-3 text-[var(--text-muted)] font-sans">
                        {new Date(p.initiated_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            p.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : p.status === "submitted"
                              ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)] py-4 text-center">
              {isBn ? "এখনও কোনো পেমেন্ট রেকর্ড নেই।" : "No payment history yet."}
            </p>
          )}
        </div>

        {/* ── BKASH PAYMENT MODAL ── */}
        {activeInitiate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-3xl border ${borderClass} bg-[var(--bg-card)] shadow-2xl overflow-hidden`}>
              {/* Modal Header */}
              <div className="p-5 border-b border-[var(--text-primary)]/10 bg-[#E2136E] text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    bKash Payment Gateway
                  </span>
                  <h3 className="text-base font-bold">{activeInitiate.package_name}</h3>
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
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {isBn ? "পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে!" : "Payment Submitted!"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {trxSuccessMessage}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveInitiate(null)}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[var(--accent-solid)] text-[var(--accent-contrast)] cursor-pointer mt-2"
                    >
                      {isBn ? "ঠিক আছে" : "Done"}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Amount & Merchant Info */}
                    <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-[var(--text-muted)]">{isBn ? "পরিশোধযোগ্য টাকা:" : "Amount to Send:"}</span>
                        <span className="text-xl font-bold font-mono text-[#E2136E]">৳{activeInitiate.amount_bdt}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[var(--text-primary)]/5">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                            {isBn ? "বিকাশ মার্চেন্ট / পার্সোনাল নম্বর" : "Send Money to bKash Number"}
                          </p>
                          <p className="font-mono font-bold text-sm text-[var(--text-primary)]">
                            {activeInitiate.bkash_number || "01700000000"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyBkash(activeInitiate.bkash_number || "01700000000")}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/20 text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedNumber ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      {activeInitiate.instructions ||
                        "আপনার বিকাশ অ্যাপ থেকে 'Send Money' করুন এবং এসএমএসে প্রাপ্ত TrxID নিচে লিখুন।"}
                    </p>

                    <form onSubmit={handleTrxSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">
                          {isBn ? "প্রেরকের বিকাশ নম্বর (Sender bKash No)" : "Sender bKash Number"}
                        </label>
                        <input
                          type="tel"
                          required
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className={`w-full px-4 py-2.5 rounded-xl text-sm border font-mono outline-none ${borderClass} bg-[var(--bg-surface)] text-[var(--text-primary)]`}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">
                          {isBn ? "বিকাশ ট্রানজেকশন আইডি (TrxID)" : "bKash Transaction ID (TrxID)"}
                        </label>
                        <input
                          type="text"
                          required
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          placeholder="e.g. BL9A7K8XYZ"
                          className={`w-full px-4 py-2.5 rounded-xl text-sm border font-mono outline-none ${borderClass} bg-[var(--bg-surface)] text-[var(--text-primary)] uppercase`}
                        />
                      </div>

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
