"use client";

import React from "react";
import { Flame, Info } from "lucide-react";
import { Language, translations } from "@/lib/translations";
import { calculateCigarettes } from "@/lib/aqi";

interface CigaretteCardProps {
  pm25: number;
  language: Language;
  className?: string;
}

export default function CigaretteCard({
  pm25,
  language,
  className = "",
}: CigaretteCardProps) {
  const t = translations[language];
  const cigarettes = calculateCigarettes(pm25);

  // Generate visual cigarette pills (capped at 16 displayed with +X if more)
  const displayCount = Math.min(16, cigarettes);
  const remaining = cigarettes > 16 ? cigarettes - 16 : 0;

  return (
    <div
      className={`bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 font-mono">
            {t.cigarettesHeading}
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-semibold">
          {language === "hi" ? "स्वास्थ्य जोखिम" : "Health Impact"}
        </span>
      </div>

      {/* Main Verdict Line */}
      <div className="my-2">
        <p className="text-sm sm:text-base text-slate-600 leading-snug">
          {t.cigarettesSubtext}{" "}
          <span className="text-2xl sm:text-4xl font-black text-red-600 font-mono underline decoration-red-300">
            {cigarettes}
          </span>{" "}
          <span className="font-bold text-slate-800">{t.cigarettesUnit}</span>.
        </p>
      </div>

      {/* Visual Cigarette Equivalency Bars */}
      <div className="flex flex-wrap items-center gap-1.5 my-3.5 pt-1">
        {Array.from({ length: displayCount }).map((_, i) => (
          <div
            key={i}
            className="h-6 w-3 sm:w-3.5 rounded-sm bg-gradient-to-t from-amber-600 via-white to-white border border-slate-300 shadow-xs flex flex-col justify-between overflow-hidden"
            title={`Cigarette ${i + 1}`}
          >
            <div className="h-1 bg-amber-500 w-full" />
            <div className="h-2 bg-amber-100 w-full" />
          </div>
        ))}
        {remaining > 0 && (
          <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg ml-1">
            +{remaining} {language === "hi" ? "और" : "more"}
          </span>
        )}
      </div>

      {/* Footnote */}
      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-mono pt-3 border-t border-slate-100">
        <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span className="leading-tight">{t.cigarettesFootnote}</span>
      </div>
    </div>
  );
}

