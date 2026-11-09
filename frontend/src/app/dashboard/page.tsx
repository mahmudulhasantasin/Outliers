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
    const userRole = String(user.role || "").toUpperCase();
    const entStatus = String(user.enterpriseProfile?.verificationStatus || "").toLowerCase();
    const isPendingEnterprise =
      Boolean(user.enterpriseProfile && !user.enterpriseProfile?.isTeamMember && entStatus !== "verified") ||
      entStatus === "pending" ||
      entStatus === "pending_approval";

    const lawyerStatus = String(user.lawyerProfile?.verificationStatus || "").toLowerCase();
    const isPendingLawyer =
      Boolean(user.lawyerProfile && lawyerStatus !== "verified") ||
      (userRole === "LAWYER" && lawyerStatus !== "verified") ||
      lawyerStatus === "pending";

    const memberStatus = String(
      user.enterpriseProfile?.memberApprovalStatus || (user as any)?.member_approval_status || ""
    ).toUpperCase();
    const isPendingMember =
      (userRole === "ENTERPRISE_MEMBER" || user.enterpriseProfile?.isTeamMember) &&
      (memberStatus === "PENDING" || (memberStatus !== "APPROVED" && memberStatus !== ""));

    if (isPendingEnterprise) {
      router.replace("/enterprise/pending");
    } else if (isPendingLawyer) {
      router.replace("/lawyer/pending");
    } else if (isPendingMember) {
      router.replace("/enterprise/member");
    } else if (userRole === "ADMIN") {
      router.replace("/admin");
    } else if (
      userRole === "ENTERPRISE_ADMIN" ||
      (userRole.includes("ENTERPRISE") && entStatus === "verified")
    ) {
      router.replace("/enterprise/admin");
    } else if (userRole === "LAWYER" && lawyerStatus === "verified") {
      router.replace("/lawyer/pending");
    } else if (userRole === "ENTERPRISE_MEMBER") {
      router.replace("/enterprise/member");
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
