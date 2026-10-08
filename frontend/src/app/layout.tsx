import type { Metadata } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
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

const hindSiliguri = Hind_Siliguri({
  variable: "--font-bangla",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Legal Copilot | Sovereign Contract Intelligence for Bangladesh Law",
  description: "Enterprise-grade contract intelligence, statutory clause verification, and hallucination-free legal advisory mapped to Bangladesh statutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-white">
      <body
        className={`${inter.variable} ${hindSiliguri.variable} font-sans h-full min-h-screen bg-white text-neutral-900 antialiased transition-colors duration-200`}
        style={{ fontFamily: "var(--font-inter), var(--font-bangla), sans-serif" }}
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
