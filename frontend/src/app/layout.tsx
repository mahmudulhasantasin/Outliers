import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Tiro_Bangla } from "next/font/google";

import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { PersonaProvider } from "@/context/PersonaContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const tiroBangla = Tiro_Bangla({
  subsets: ["bengali", "latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-bangla",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://advotech-copilot.vercel.app"),
  title: {
    default: "Advotech Copilot | Sovereign Contract Intelligence & Legal AI for Bangladesh",
    template: "%s | Advotech Copilot",
  },
  description:
    "AI-native legal intelligence platform, autonomous contract auditor, and verified Human-in-the-Loop advocate marketplace designed specifically for Bangladesh Law.",
  applicationName: "Advotech Copilot",
  keywords: [
    "Advotech Copilot",
    "JusticeSphere AI",
    "ContractMind",
    "Bangladesh Legal AI",
    "AI Lawyer Bangladesh",
    "Legal AI Bangladesh",
    "Contract Audit Bangladesh",
    "Bangladesh Labour Act 2006",
    "The Contract Act 1872",
    "Supreme Court Advocate Bangladesh",
    "Legal Research Copilot BD",
    "AI Contract Review",
    "Autonomous Legal Auditor",
    "Bangladeshi Law Chatbot",
    "Legal Tech Bangladesh",
  ],
  authors: [{ name: "Outliers Team", url: "https://advotech-copilot.vercel.app" }],
  creator: "Team Outliers",
  publisher: "Advotech Copilot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Advotech Copilot | Sovereign Contract Intelligence for Bangladesh Law",
    description:
      "Enterprise-grade contract intelligence, statutory clause verification, and hallucination-free legal advisory mapped to Bangladesh statutes.",
    url: "https://advotech-copilot.vercel.app",
    siteName: "Advotech Copilot",
    images: [
      {
        url: "/Firefly.png",
        width: 1200,
        height: 630,
        alt: "Advotech Copilot - Sovereign Legal AI Platform",
      },
    ],
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advotech Copilot | Sovereign Contract Intelligence for Bangladesh Law",
    description:
      "AI-native contract defense, statutory auditing, and verified advocate marketplace for Bangladesh.",
    images: ["/Firefly.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://advotech-copilot.vercel.app/#organization",
      name: "Advotech Copilot",
      alternateName: ["JusticeSphere AI", "ContractMind", "Outliers"],
      url: "https://advotech-copilot.vercel.app",
      logo: {
        "@type": "ImageObject",
        url: "https://advotech-copilot.vercel.app/logo.svg",
      },
      sameAs: ["https://github.com/mahmudulhasantasin/Outliers"],
    },
    {
      "@type": "WebSite",
      "@id": "https://advotech-copilot.vercel.app/#website",
      url: "https://advotech-copilot.vercel.app",
      name: "Advotech Copilot",
      publisher: {
        "@id": "https://advotech-copilot.vercel.app/#organization",
      },
      inLanguage: ["bn", "en"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://advotech-copilot.vercel.app/#software",
      name: "Advotech Copilot",
      operatingSystem: "All",
      applicationCategory: "BusinessApplication, LegalService",
      description:
        "Sovereign AI legal intelligence, autonomous contract auditor, and verified advocate marketplace for Bangladesh Law.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BDT",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="h-full" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${tiroBangla.variable} font-sans h-full min-h-screen antialiased`}
        style={{ fontFamily: "var(--font-bangla), var(--font-inter), 'Tiro Bangla', serif, sans-serif" }}
      >
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <ThemeProvider>
          <LanguageProvider>
            <PersonaProvider>
              <AuthProvider>
                <NotificationProvider>
                  {children}
                </NotificationProvider>
              </AuthProvider>
            </PersonaProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
