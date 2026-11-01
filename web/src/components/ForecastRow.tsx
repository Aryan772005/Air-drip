"use client";

import React, { useMemo } from "react";
import {
  CloudLightning,
  CloudRain,
  CloudFog,
  Cloud,
  Calendar,
  Flame,
} from "lucide-react";
import { Language, translations } from "@/lib/translations";
import { getCappedAqiDisplay, calculateCpcbAqi } from "@/lib/aqi";

export interface DayForecastItem {
  date: string;
  dayName: string;
  label: string;
  val: number; // PM2.5 value
  temp: number;
  humidity: number;
  windSpeed: number;
  aqiCat: string;
  isDiwali: boolean;
}

interface ForecastRowProps {
  days: DayForecastItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  language: Language;
  className?: string;
}

export default function ForecastRow({
  days,
  selectedIndex,
  onSelectIndex,
  language,
  className = "",
}: ForecastRowProps) {
  const t = translations[language];

  // Map category to colors & labels
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "Good":
        return {
          label: language === "hi" ? "अच्छा" : "Good",
          color: "#00B050",
          bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "Satisfactory":
        return {
          label: language === "hi" ? "संतोषजनक" : "Satisfactory",
          color: "#92D050",
          bgClass: "bg-lime-50 text-lime-700 border-lime-200",
        };
      case "Moderate":
        return {
          label: language === "hi" ? "मध्यम" : "Moderate",
          color: "#FFC000",
          bgClass: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "Poor":
        return {
          label: language === "hi" ? "खराब" : "Poor",
          color: "#FF7A00",
          bgClass: "bg-orange-50 text-orange-700 border-orange-200",
        };
      case "Very Poor":
        return {
          label: language === "hi" ? "बहुत खराब" : "Very Poor",
          color: "#FF0000",
          bgClass: "bg-rose-50 text-rose-700 border-rose-200",
        };
      case "Severe":
      default:
        return {
          label: language === "hi" ? "गंभीर" : "Severe",
          color: "#780000",
          bgClass: "bg-red-50 text-red-700 border-red-200",
        };
    }
  };

  const getDayDisplayName = (day: DayForecastItem) => {
    if (day.isDiwali) return language === "hi" ? "दिवाली" : "Diwali";
    const dayMapEnToHi: Record<string, string> = {
      Monday: "सोमवार",
      Tuesday: "मंगलवार",
      Wednesday: "बुधवार",
      Thursday: "गुरुवार",
      Friday: "शुक्रवार",
      Saturday: "शनिवार",
      Sunday: "रविवार",
    };
    if (language === "hi") {
      return dayMapEnToHi[day.dayName] || day.dayName;
    }
    return day.dayName;
  };

  // SVG Wave Points (normalized from AQI values)
  const wavePoints = useMemo(() => {
    const width = 800;
    const height = 45;
    const step = width / (days.length - 1 || 1);
    const aqiValues = days.map((d) => calculateCpcbAqi(d.val));
    const minVal = Math.min(...aqiValues);
    const maxVal = Math.max(...aqiValues);
    const range = maxVal - minVal || 1;

    const coords = aqiValues.map((aqi, i) => {
      const x = i * step;
      const normalized = (aqi - minVal) / range;
      const y = height - (normalized * 28 + 8);
      return { x, y, aqi, day: days[i] };
    });

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return { coords, path };
  }, [days]);

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{t.sevenDayHeading}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{t.sevenDaySub}</p>
        </div>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {language === "hi" ? "दिन पर क्लिक करके देखें" : "Click any day to view details"}
        </span>
      </div>

      {/* 7-Day Responsive Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 text-center mb-2">
        {days.map((day, idx) => {
          const isSelected = selectedIndex === idx;
          const aqiInfo = getCappedAqiDisplay(day.val);
          const badge = getCategoryBadge(day.aqiCat);
          const dayNameDisplay = getDayDisplayName(day);

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`flex flex-col items-center justify-between p-2 sm:p-3 rounded-2xl border transition-all duration-200 text-left cursor-pointer group ${
                isSelected
                  ? "bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                  : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Day Name & Date */}
              <div className="flex flex-col items-center w-full">
                <span className="text-[11px] sm:text-xs font-bold text-slate-700 truncate w-full group-hover:text-slate-900">
                  <span className="sm:hidden">
                    {day.isDiwali ? (language === "hi" ? "दिवाली" : "Diwali") : dayNameDisplay.slice(0, 3)}
                  </span>
                  <span className="hidden sm:inline">{dayNameDisplay}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{day.label}</span>
              </div>

              {/* Weather / Status Icon */}
              <div className="my-2">
                {day.isDiwali ? (
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center animate-bounce">
                    <Flame className="w-4 h-4 text-red-600" />
                  </div>
                ) : day.val > 250 ? (
                  <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center">
                    <CloudLightning className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                ) : day.val > 120 ? (
                  <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center">
                    <CloudFog className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                )}
              </div>

              {/* AQI Number without any degree symbol */}
              <div className="flex flex-col items-center my-0.5">
                <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase">AQI</span>
                <span
                  className={`text-base sm:text-2xl font-black font-mono leading-none tracking-tight ${
                    isSelected ? "text-blue-600 scale-105" : "text-slate-900"
                  }`}
                >
                  {aqiInfo.exactAqi}
                </span>
              </div>

              {/* Category chip under each day */}
              <div className="w-full mt-2">
                <span
                  className={`w-full block truncate text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border text-center ${badge.bgClass}`}
                  title={`${badge.label} (Exact AQI: ${aqiInfo.exactAqi})`}
                >
                  {badge.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Smooth SVG AQI Trend Wave */}
      <div className="relative w-full h-14 mt-4 pt-1 pointer-events-none">
        <svg
          viewBox="0 0 800 45"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          {/* Wave line */}
          <path
            d={wavePoints.path}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Vertical indicator line for selected day */}
          <line
            x1={wavePoints.coords[selectedIndex]?.x || 400}
            y1="0"
            x2={wavePoints.coords[selectedIndex]?.x || 400}
            y2={wavePoints.coords[selectedIndex]?.y || 25}
            stroke="#2563eb"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Marker dot on selected day */}
          <circle
            cx={wavePoints.coords[selectedIndex]?.x || 400}
            cy={wavePoints.coords[selectedIndex]?.y || 25}
            r="6"
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth="2"
          />
        </svg>

        {/* Floating Tooltip showing AQI and PM2.5, NEVER degrees */}
        <div
          className="absolute -top-7 -translate-x-1/2 bg-slate-900 text-white px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap transition-all duration-300 pointer-events-auto"
          style={{ left: `${((selectedIndex + 0.5) / days.length) * 100}%` }}
        >
          <span>AQI {getCappedAqiDisplay(days[selectedIndex]?.val || 0).exactAqi}</span>
          <span className="opacity-60">•</span>
          <span className="opacity-90">{Math.round(days[selectedIndex]?.val || 0)} µg/m³</span>
        </div>
      </div>
    </div>
  );
}

