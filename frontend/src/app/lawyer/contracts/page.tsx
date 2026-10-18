"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import {
  Users,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalContracts: number;
  lastContractEn: string;
  lastContractBn: string;
  status: "active" | "completed";
}

const SAMPLE_CLIENTS: ClientRecord[] = [
  {
    id: "cl-1",
    name: "Mahmud Hasan",
    phone: "+880 1712-345678",
    email: "mahmud@gulshan-properties.bd",
    totalContracts: 3,
    lastContractEn: "Commercial Property Lease Agreement",
    lastContractBn: "বাণিজ্যিক ভবন ভাড়া চুক্তিপত্র",
    status: "active",
  },
  {
    id: "cl-2",
    name: "Nusrat Jahan",
    phone: "+880 1819-876543",
    email: "hr@dhakatech.com",
    totalContracts: 6,
    lastContractEn: "Senior Software Engineer Employment",
    lastContractBn: "নিয়োগ ও নন-কম্পিট চুক্তিপত্র",
    status: "active",
  },
  {
    id: "cl-3",
    name: "Kamrul Islam",
    phone: "+880 1912-778899",
    email: "kamrul@bengallogistics.com",
    totalContracts: 2,
    lastContractEn: "Vendor Supply & Service Level Agreement",
    lastContractBn: "সরবরাহকারী সেবা চুক্তি",
    status: "completed",
  },
  {
    id: "cl-4",
    name: "Tanvir Rahman",
    phone: "+880 1911-223344",
    email: "tanvir@rahmanconsultancy.bd",
    totalContracts: 1,
    lastContractEn: "Software Development & IP Assignment",
    lastContractBn: "সফটওয়্যার আইপি স্বত্ব চুক্তি",
    status: "active",
  },
];

export default function LawyerContractsPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [search, setSearch] = useState("");

  const borderClass = "border-[var(--text-primary)]/10";

  const filtered = SAMPLE_CLIENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 mb-3">
            <Users className="w-3.5 h-3.5" />
            {isBn ? "ক্লায়েন্ট ও চুক্তি ডিরেক্টরি" : "Client Directory"}
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)]">
            {isBn ? "সমস্ত চুক্তি ও ক্লায়েন্ট তালিকা" : "All Contracts & Clients"}
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] mt-1">
            {isBn
              ? "আপনার অধীনে থাকা সকল ক্লায়েন্ট ও তাদের চুক্তির ঐতিহাসিক রেকর্ড।"
              : "Manage all associated clients and their contract consultation history."}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBn ? "ক্লায়েন্টের নাম, মোবাইল বা ইমেইল দিয়ে খুঁজুন..." : "Search by client name, mobile or email..."}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-colors ${borderClass} focus:border-[var(--text-primary)]/40 bg-[var(--bg-card)] text-[var(--text-primary)]`}
          />
        </div>

        {/* Client cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className={`p-5 rounded-2xl border ${borderClass} bg-[var(--bg-card)] flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {client.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      client.status === "active"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-[var(--bg-surface)] text-[var(--text-muted)]"
                    }`}
                  >
                    {client.status === "active" ? (
                      <>
                        <Clock className="w-3 h-3" />
                        {isBn ? "চলমান" : "Active"}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        {isBn ? "সম্পন্ন" : "Archived"}
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--text-muted)] mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    <span className="font-mono">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>{client.email}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-surface)] text-xs mb-4">
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">
                    {isBn ? "সর্বশেষ চুক্তি:" : "Recent Contract:"}
                  </div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {isBn ? client.lastContractBn : client.lastContractEn}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--text-primary)]/5">
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {client.totalContracts} {isBn ? "টি চুক্তি" : "contracts"}
                </span>
                <span className="text-xs font-semibold text-[var(--accent-solid)] flex items-center gap-1">
                  {isBn ? "বিস্তারিত দেখুন" : "View History"}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
