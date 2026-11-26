import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Copilot — Bangladesh Law Statutory Advisory",
  description:
    "AI legal advisory grounded in official Bangladesh statutes (bdlaws.minlaw.gov.bd) with dual-path RAG and client-side zero-trust PII masking.",
  alternates: {
    canonical: "/copilot",
  },
  openGraph: {
    title: "Legal Copilot — Bangladesh Law Statutory Advisory | Advotech Copilot",
    description:
      "Hallucination-free legal advisory and citation mapping to Bangladesh statutory gazettes.",
    url: "https://advotech-copilot.vercel.app/copilot",
  },
};

export default function CopilotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
