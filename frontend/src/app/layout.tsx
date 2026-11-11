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
  title: "Advotech Copilot | Sovereign Contract Intelligence for Bangladesh Law",
  description: "Enterprise-grade contract intelligence, statutory clause verification, and hallucination-free legal advisory mapped to Bangladesh statutes.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
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
