import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./../globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Advotech Copilot | Pitch Deck",
  description: "AI-powered Legal Intelligence for the Global South",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${karla.variable}`}>
      <body className="bg-[#FBF4EC] text-[#5C4F43] font-sans antialiased selection:bg-[#F6E2D7] selection:text-[#2E2117]">
        {children}
      </body>
    </html>
  );
}