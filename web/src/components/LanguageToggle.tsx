"use client";

import React from "react";
import { Languages } from "lucide-react";
import { Language } from "@/lib/translations";

interface LanguageToggleProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  className?: string;
}

export default function LanguageToggle({
  language,
  onLanguageChange,
  className = "",
}: LanguageToggleProps) {
  const toggleLanguage = (lang: Language) => {
    onLanguageChange(lang);
    try {
      localStorage.setItem("hawa_lang", lang);
    } catch (e) {
      // Ignore if localStorage unavailable
    }
  };

  return (
    <div
      className={`inline-flex items-center bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-1 text-xs font-semibold shadow-sm transition-all ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => toggleLanguage("en")}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all ${
          language === "en"
            ? "bg-white text-slate-900 shadow-sm font-bold"
            : "text-white/80 hover:text-white"
        }`}
        aria-pressed={language === "en"}
      >
        <span>English</span>
      </button>

      <button
        type="button"
        onClick={() => toggleLanguage("hi")}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all ${
          language === "hi"
            ? "bg-white text-slate-900 shadow-sm font-bold"
            : "text-white/80 hover:text-white"
        }`}
        aria-pressed={language === "hi"}
      >
        <span>हिंदी</span>
      </button>
    </div>
  );
}

