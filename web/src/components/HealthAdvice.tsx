"use client";

import React from "react";
import { HeartPulse, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Language, translations, getHealthAdviceForLevel } from "@/lib/translations";
import { getAqiCategory } from "@/lib/aqi";

interface HealthAdviceProps {
  pm25: number;
  language: Language;
  className?: string;
}

export default function HealthAdvice({
  pm25,
  language,
  className = "",
}: HealthAdviceProps) {
  const t = translations[language];
  const { name: category } = getAqiCategory(pm25);
  const adviceList = getHealthAdviceForLevel(category);

  const isHighDanger = category === "Severe" || category === "Very Poor";

  return (
    <div className={`w-full ${className}`}>
      {/* Section Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4 px-1">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isHighDanger ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
              <HeartPulse className="w-4 h-4" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.whatShouldIDo}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.whatShouldIDoSub}
          </p>
        </div>

        <span
          className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
            isHighDanger
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-emerald-50 text-emerald-600 border-emerald-200"
          }`}
        >
          {isHighDanger ? (
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {language === "hi" ? "आपातकालीन स्वास्थ्य चेतावनी" : "Emergency Advisory"}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {language === "hi" ? "सामान्य सावधानियां" : "Standard Guidance"}
            </span>
          )}
        </span>
      </div>

      {/* 4 to 5 Actionable Icon Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
        {adviceList.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 hover:border-blue-400 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-2xs mb-3.5 group-hover:scale-105 transition-transform">
                <span>{item.icon}</span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 leading-tight mb-2">
                {language === "hi" ? item.titleHi : item.titleEn}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {language === "hi" ? item.descHi : item.descEn}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === "hi" ? "डॉक्टर की सलाह" : "Recommended"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

