"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
  ShieldCheck,
  MapPin,
  Sparkles,
  Cpu,
  TrendingDown,
  BarChart3,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Language, translations } from "@/lib/translations";
import { getAqiCategory, getCappedAqiDisplay, calculateCpcbAqi } from "@/lib/aqi";
import ColorScaleBar from "./ColorScaleBar";

interface VerdictCardProps {
  pm25: number;
  station: string;
  isDiwali: boolean;
  language: Language;
  className?: string;
}

export default function VerdictCard({
  pm25,
  station,
  isDiwali,
  language,
  className = "",
}: VerdictCardProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showMlExplanation, setShowMlExplanation] = useState(false);
  const t = translations[language];

  const { name: categoryName, info } = getAqiCategory(pm25);
  const aqiInfo = getCappedAqiDisplay(pm25);
  const exactAqiNumber = aqiInfo.exactAqi;

  // Verdict headline & explanation based on CPCB AQI category
  const getVerdictHeadline = () => {
    switch (categoryName) {
      case "Good":
        return t.heroHeadlineGood;
      case "Satisfactory":
        return t.heroHeadlineSatisfactory;
      case "Moderate":
        return t.heroHeadlineModerate;
      case "Poor":
        return t.heroHeadlinePoor;
      case "Very Poor":
        return t.heroHeadlineVeryPoor;
      case "Severe":
      default:
        return t.heroHeadlineSevere;
    }
  };

  const getVerdictExplanation = () => {
    if (isDiwali && (categoryName === "Severe" || categoryName === "Very Poor")) {
      return t.smokeExplanation;
    }
    switch (categoryName) {
      case "Good":
        return t.heroDescGood;
      case "Satisfactory":
        return t.heroDescSatisfactory;
      case "Moderate":
        return t.heroDescModerate;
      case "Poor":
        return t.heroDescPoor;
      case "Very Poor":
        return t.heroDescVeryPoor;
      case "Severe":
      default:
        return t.heroDescSevere;
    }
  };

  const getVerdictCategoryLabel = () => {
    switch (categoryName) {
      case "Good":
        return t.scaleGood;
      case "Satisfactory":
        return t.scaleSatisfactory;
      case "Moderate":
        return t.scaleModerate;
      case "Poor":
        return t.scalePoor;
      case "Very Poor":
        return t.scaleVeryPoor;
      case "Severe":
      default:
        return t.scaleSevere;
    }
  };

  const categoryLabel = getVerdictCategoryLabel();
  const timesAboveSafe = (pm25 / 60).toFixed(1);

  return (
    <div
      className={`bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all ${className}`}
    >
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-red-500" />
          <span>{t.diwaliAlertTag}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-800">{station}</span>
        </div>
      </div>

      {/* Main Verdict Badge & Plain-Language Headline (Verdict First!) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span
            className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-xs"
            style={{ backgroundColor: info.color }}
          >
            {categoryLabel}
          </span>

          {/* EXACT AQI SPOTLIGHT BADGE (Always visibly showing exact numbers!) */}
          <div className="inline-flex items-baseline gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-mono text-xs font-bold">
            <span className="text-slate-500 uppercase">{language === "hi" ? "सटीक AQI:" : "Exact AQI:"}</span>
            <span className="text-base font-black" style={{ color: info.color }}>
              {exactAqiNumber}
            </span>
            {aqiInfo.isCapped && (
              <span className="text-[10px] text-slate-400 font-normal">
                ({language === "hi" ? "CPCB पैमाना: 500+" : "CPCB Scale: 500+"})
              </span>
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {getVerdictHeadline()}
        </h2>

        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-3xl">
          {getVerdictExplanation()}
        </p>
      </div>

      {/* EXACT READOUT TILES (Plain numbers prominently visible to satisfy user's request) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5 pt-1">
        {/* Exact AQI Tile */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-slate-500 font-semibold uppercase">
            {language === "hi" ? "सटीक वायु गुणवत्ता (AQI)" : "Exact AQI Index"}
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono" style={{ color: info.color }}>
              {exactAqiNumber}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 500</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            {aqiInfo.isCapped ? (
              <span className="text-red-600 font-bold">⚠️ {t.officialScaleCapped} (500+)</span>
            ) : (
              <span>{categoryLabel}</span>
            )}
          </div>
        </div>

        {/* Exact PM2.5 Tile */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-slate-500 font-semibold uppercase">
            {language === "hi" ? "सटीक PM2.5 स्तर" : "Exact PM2.5 Level"}
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {Math.round(pm25)}
            </span>
            <span className="text-xs font-mono text-slate-500">µg/m³</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            <span className="text-red-600 font-bold">{timesAboveSafe}x</span>{" "}
            {language === "hi" ? "सुरक्षित सीमा (60 µg/m³) से अधिक" : "above 60 µg/m³ safe limit"}
          </div>
        </div>

        {/* Health Risk Level */}
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-slate-500 font-semibold uppercase">
            {language === "hi" ? "स्वास्थ्य जोखिम स्तर" : "Health Risk Level"}
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
            {categoryName === "Severe" || categoryName === "Very Poor" ? (
              <span className="text-red-600">🚨 {language === "hi" ? "अत्यधिक गंभीर खतरा" : "Critical Emergency"}</span>
            ) : categoryName === "Poor" ? (
              <span className="text-orange-600">⚠️ {language === "hi" ? "अस्वस्थ हवा" : "Unhealthy Air"}</span>
            ) : (
              <span className="text-emerald-600">✅ {language === "hi" ? "सुरक्षित स्थिति" : "Safe & Clean"}</span>
            )}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            {language === "hi" ? "CPCB राष्ट्रीय दिशा-निर्देश" : "CPCB India National Standard"}
          </div>
        </div>
      </div>

      {/* Horizontal 6-Segment Color Scale Bar */}
      <div className="my-5">
        <ColorScaleBar pm25={pm25} language={language} />
      </div>

      {/* ================= ACCORDION 1: TECHNICAL DETAILS ================= */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="flex items-center justify-between w-full text-xs font-mono font-semibold text-slate-600 hover:text-slate-900 transition py-1"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>{showTechnicalDetails ? t.hideTechnicalDetails : t.viewTechnicalDetails}</span>
          </span>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono space-y-2 text-slate-700 animate-fade-in">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">{t.rawPm25}:</span>
              <span className="font-bold text-slate-900">{Math.round(pm25)} µg/m³</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">{t.exactAqiLabel}:</span>
              <span className="font-bold text-slate-900">
                {exactAqiNumber} {aqiInfo.isCapped && "(Scale Capped at 500+)"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">{t.stationLabel}:</span>
              <span className="font-bold text-slate-900">{station}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">{t.safeLimitLabel} (CPCB 24h):</span>
              <span className="font-semibold text-slate-800">60 µg/m³ (WHO: 15 µg/m³)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">ML Model:</span>
              <span className="font-semibold text-blue-700">LightGBM Quantile Regressors (q=0.10, 0.50, 0.90)</span>
            </div>
          </div>
        )}

        {/* ================= ACCORDION 2: "WHAT IS THE MACHINE LEARNING MODEL DOING?" (TEACH US) ================= */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowMlExplanation(!showMlExplanation)}
            className="flex items-center justify-between w-full p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-50 border border-blue-200/70 text-blue-900 text-xs font-bold transition shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>{t.mlModelTeacherTitle}</span>
            </span>
            {showMlExplanation ? (
              <ChevronUp className="w-4 h-4 text-blue-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-600" />
            )}
          </button>

          {showMlExplanation && (
            <div className="mt-3 p-5 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border border-blue-200 rounded-2xl text-xs text-slate-700 space-y-4 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2 text-blue-700 font-bold font-mono text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{t.mlModelTeacherSub}</span>
              </div>

              {/* 4 Interactive Educational Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {/* Step 1 */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>{language === "hi" ? "डेटा इनपुट (Data Inputs)" : "Data Inputs (What AI Reads)"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "7 साल का CPCB ऐतिहासिक डेटा (33,264 घंटे) + मौसम का लाइव पूर्वानुमान (हवा की गति, तापमान, आर्द्रता, और सतह का दबाव)।"
                      : "7 years of official CPCB hourly records (33,264 hours) + live meteorology forecasts (wind speed, temperature inversion, humidity, surface pressure)."}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>{language === "hi" ? "दिवाली का स्पेशल फैक्टर (Diwali Spike Weighting)" : "Diwali Spike Feature Engineering"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "दिवाली की रात पटाखों का अचानक 2.7 गुना धुआं फूटता है। मॉडल को 3 गुना अतिरिक्त महत्व देकर प्रशिक्षित किया गया है ताकि यह स्पाइक पकड़ सके।"
                      : "Fireworks cause an abrupt 2.7x burst on Diwali night. The AI uses 3x sample weighting on festival nights so it never misses the sudden spike."}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>{language === "hi" ? "क्वांटाइल रिग्रेशन (80% अनिश्चितता दायरा)" : "Quantile Regression (80% Confidence)"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "केवल एक संख्या देने के बजाय, मॉडल 3 संभावनाएं बताता है: 10th प्रतिशत (यदि हवा चले), 50th प्रतिशत (सबसे सटीक पूर्वानुमान), और 90th प्रतिशत (यदि हवा बिल्कुल रुक जाए)।"
                      : "Instead of a single guess, 3 models output bounds: 10th percentile (if wind picks up), 50th percentile (median forecast), and 90th percentile (worst-case thermal trapping)."}
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                    <span>{language === "hi" ? "95% कम त्रुटि (Leave-One-Out Validation)" : "95% Error Reduction (Leave-One-Out CV)"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "साधारण औसत मॉडलों में दिवाली की रात 320 µg/m³ की भारी गलती होती थी। LightGBM मॉडल ने इस गलती को घटाकर मात्र ~11 µg/m³ कर दिया है!"
                      : "Simple historical averages had massive 320 µg/m³ errors on Diwali night. Our LightGBM model reduced error to ~11.2 µg/m³ (>95% error reduction)."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
