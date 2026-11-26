import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Credit Plans",
  description:
    "Flexible credit packages and pricing for autonomous contract audits, legal copilot queries, and verified Bangladesh Supreme Court advocate reviews.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing & Credit Plans | Advotech Copilot",
    description:
      "Affordable pricing for legal research and advocate reviews in Bangladesh. Pay easily with bKash and credit bundles.",
    url: "https://advotech-copilot.vercel.app/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
