import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { PersonaProvider } from "@/context/PersonaContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const tiroBangla = localFont({
  src: [
    {
      path: "../../public/fonts/TiroBangla-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/TiroBangla-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-bangla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Advotech Copilot | Sovereign Contract Intelligence for Bangladesh Law",
  description: "Enterprise-grade contract intelligence, statutory clause verification, and hallucination-free legal advisory mapped to Bangladesh statutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="h-full">
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
        <ThemeProvider>
          <LanguageProvider>
            <PersonaProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </PersonaProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
