import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ContractMind — Autonomous Contract Risk Auditor",
  description:
    "Sub-minute statutory clause verification, predatory clause detection, and redline diff generation for Bangladesh contracts (§ 27 Contract Act, § 26 Labour Act).",
  alternates: {
    canonical: "/contractmind",
  },
  openGraph: {
    title: "ContractMind — Autonomous Contract Risk Auditor | Advotech Copilot",
    description:
      "Instant contract auditing, risk score calculations, and statutory redline diffs grounded in Bangladesh Law.",
    url: "https://advotech-copilot.vercel.app/contractmind",
  },
};

export default function ContractMindLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
