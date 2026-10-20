"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    const userRole = String(user.role).toUpperCase();
    if (userRole === "LAWYER") {
      router.replace("/lawyer/pending");
    } else if (userRole === "ADMIN") {
      router.replace("/admin");
    } else if (userRole.includes("ENTERPRISE")) {
      router.replace("/enterprise/admin");
    } else {
      router.replace("/copilot");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
