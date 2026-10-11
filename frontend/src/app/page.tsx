"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Eye, EyeOff, Sparkles, Sun, Moon, Scale } from "lucide-react";
import DotField from "@/components/effects/DotField";
import GradientWaves from "@/components/effects/GradientWaves";

export default function RootAuthPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { loginAsDemoUser } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsDemoUser();
    router.push("/copilot");
  };

  const handleSocialAuth = () => {
    loginAsDemoUser();
    router.push("/copilot");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen w-full" style={{ backgroundColor: "var(--bg-primary)" }} />
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans transition-colors duration-200 overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Background Interactive DotField */}
      <div className="fixed inset-0 pointer-events-auto z-0 overflow-hidden">
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          bulgeStrength={67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={500}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom={theme === "dark" ? "rgba(168, 85, 247, 0.45)" : "rgba(129, 140, 248, 0.55)"}
          gradientTo={theme === "dark" ? "rgba(216, 180, 254, 0.25)" : "rgba(192, 132, 252, 0.4)"}
          glowColor="transparent"
        />
      </div>
      {/* Top Floating Controls (Theme & Language Toggle) */}
      <div className="fixed top-5 right-6 z-20 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setLanguage(language === "en" ? "bn" : "en")}
          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-sm border border-neutral-200/60 dark:border-white/10 hover:opacity-80"
          style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}
        >
          {language === "en" ? "বাংলা" : "EN"}
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-xs font-medium transition-all shadow-sm border border-neutral-200/60 dark:border-white/10 hover:opacity-80"
          style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
        </button>
      </div>

      {/* Main Dual-Pane Card matching reference layout */}
      <div
        className="relative w-full max-w-[1020px] min-h-[600px] md:min-h-[640px] rounded-[32px] p-3 md:p-4 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.45)] border border-neutral-200/60 dark:border-white/10 flex flex-col md:flex-row transition-colors"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        {/* Left Visual Hero Banner */}
        <div
          className="relative w-full md:w-[48%] rounded-[24px] p-8 md:p-12 flex flex-col justify-between overflow-hidden shrink-0 min-h-[320px] md:min-h-auto"
          style={{
            backgroundColor: "var(--bg-surface)",
          }}
        >
          {/* Animated GradientWaves WebGL Background */}
          <div className="absolute inset-0 pointer-events-auto z-0 overflow-hidden">
            <GradientWaves
              horizonColor={theme === "dark" ? "#1e1b4b" : "#5227FF"}
              waveColor={theme === "dark" ? "#818cf8" : "#FF9FFC"}
              crestColor={theme === "dark" ? "#e0e7ff" : "#FFFFFF"}
              speed={0.4}
              amplitude={2.5}
              waveScale={0.6}
              waveRatio={0.9}
              swell={35}
              turbulence={20}
              tilt={1.11}
              zoom={1}
              height={5.5}
              fogDepth={15}
              detail="medium"
              brightness={1}
              opacity={theme === "dark" ? 0.85 : 0.9}
              mouseInteraction
              parallaxStrength={0.5}
              grain
              grainIntensity={0.05}
            />
          </div>

          {/* Top Brand Logo & Name */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: "var(--accent-solid)", color: "var(--accent-contrast)" }}
            >
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-semibold text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
              Legal Copilot
            </span>
          </div>

          {/* Bottom Headline & Tagline */}
          <div className="relative z-10 pt-16 md:pt-0">
            <span
              className="text-xs font-semibold uppercase tracking-wider block mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              {language === "bn" ? "আইনি নিশ্চয়তা ও প্রফেশনাল বুদ্ধিমত্তা" : "Sovereign Contract Intelligence"}
            </span>
            <h2
              className="text-2xl sm:text-3xl md:text-[34px] font-serif font-normal leading-[1.22] tracking-tight mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              {language === "bn"
                ? "চুক্তির প্রতিটি ধারা বিশ্লেষণ করুন শতভাগ নিশ্চয়তায়"
                : "Analyze every clause with zero statutory hallucination."}
            </h2>
            <p className="text-xs sm:text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {language === "bn"
                ? "বাংলাদেশের সংবিধিবদ্ধ আইন (bdlaws), শ্রম আইন ও চুক্তি আইনের নির্ভরযোগ্য যাচাইকরণ প্ল্যাটফর্ম।"
                : "Verify legal risks, align compliance with Bangladesh statutes, and audit contracts in seconds."}
            </p>
          </div>
        </div>

        {/* Right Authentication Form Pane */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 md:px-14 py-8 md:py-10">
          <div className="w-full max-w-[380px] mx-auto">
            {/* Top Asterisk / Sparkle Icon */}
            <div className="mb-4">
              <span className="inline-block text-xl text-amber-500 font-serif leading-none select-none">
                ✱
              </span>
            </div>

            {/* Form Title & Subtitle */}
            <h1
              className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {isSignUp
                ? language === "bn"
                  ? "নতুন অ্যাকাউন্ট খুলুন"
                  : "Create an account"
                : language === "bn"
                ? "স্বাগতম, ফিরে আসার জন্য ধন্যবাদ"
                : "Welcome back"}
            </h1>
            <p className="text-xs sm:text-[13px] leading-relaxed mb-7" style={{ color: "var(--text-muted)" }}>
              {isSignUp
                ? language === "bn"
                  ? "আপনার প্রতিষ্ঠানের চুক্তি ও আইনি ডকুমেন্টস নিরাপদে অডিট করতে শুরু করুন।"
                  : "Start auditing contracts and checking statutory compliance seamlessly."
                : language === "bn"
                ? "আপনার সংরক্ষিত চুক্তি, অডিট রিপোর্ট এবং আইনি কনসাল্টেশনে প্রবেশ করুন।"
                : "Sign in to access your audit workspace, legal memos, and verified citations."}
            </p>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {language === "bn" ? "পুরো নাম" : "Full name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === "bn" ? "ব্যারিস্টার / অ্যাডভোকেট / আপনার নাম" : "e.g. Tariqul Islam"}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors border-neutral-200 dark:border-white/10 focus:border-neutral-900 dark:focus:border-white"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--text-primary)"
                    }}
                  />
                </div>
              )}

              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {language === "bn" ? "ইমেইল অ্যাড্রেস" : "Your email"}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === "bn" ? "advocate@supremecourt.bd" : "counsel@lawfirm.com"}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors border-neutral-200 dark:border-white/10 focus:border-neutral-900 dark:focus:border-white"
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--text-primary)"
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {isSignUp
                    ? language === "bn"
                      ? "পাসওয়ার্ড দিন"
                      : "Create password"
                    : language === "bn"
                    ? "পাসওয়ার্ড"
                    : "Password"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm border outline-none transition-colors border-neutral-200 dark:border-white/10 focus:border-neutral-900 dark:focus:border-white"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--text-primary)"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.99] hover:opacity-90"
                  style={{
                    backgroundColor: "var(--accent-solid)",
                    color: "var(--accent-contrast)"
                  }}
                >
                  {isSignUp
                    ? language === "bn"
                      ? "অ্যাকাউন্ট খুলুন"
                      : "Create account"
                    : language === "bn"
                    ? "লগইন করুন"
                    : "Sign in"}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div
                className="w-full border-t border-neutral-200/80 dark:border-white/10"
              />
              <span
                className="absolute px-3 text-[11px] uppercase tracking-wider font-medium"
                style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)" }}
              >
                {language === "bn" ? "অথবা" : "or continue with"}
              </span>
            </div>

            {/* Social Auth Buttons (Google, GitHub, Apple) */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleSocialAuth}
                className="py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-white/10 flex items-center justify-center transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/60 active:scale-95"
                style={{ color: "var(--text-primary)" }}
                aria-label="Continue with Google"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleSocialAuth}
                className="py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-white/10 flex items-center justify-center transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/60 active:scale-95"
                style={{ color: "var(--text-primary)" }}
                aria-label="Continue with GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleSocialAuth}
                className="py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-white/10 flex items-center justify-center transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/60 active:scale-95"
                style={{ color: "var(--text-primary)" }}
                aria-label="Continue with Apple"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-1.97.6-2.61 1.35-.57.65-1.06 1.71-.93 2.73.99.08 2.01-.5 2.62-1.23z" />
                </svg>
              </button>
            </div>

            {/* Bottom Toggle between Sign In / Sign Up */}
            <div className="mt-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              <span>
                {isSignUp
                  ? language === "bn"
                    ? "ইতিমধ্যে অ্যাকাউন্ট আছে? "
                    : "Already have an account? "
                  : language === "bn"
                  ? "অ্যাকাউন্ট নেই? "
                  : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity ml-1"
                style={{ color: "var(--text-primary)" }}
              >
                {isSignUp
                  ? language === "bn"
                    ? "লগইন করুন"
                    : "Sign in"
                  : language === "bn"
                    ? "নিবন্ধন করুন"
                    : "Register"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
