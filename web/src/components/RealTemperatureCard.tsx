"use client";

import React from "react";
import { Thermometer, Droplets, Wind, CloudSun } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface RealTemperatureCardProps {
  temperature: number; // in Celsius
  humidity: number; // in %
  windSpeed: number; // in m/s or km/h
  city: string;
  language: Language;
  className?: string;
}

export default function RealTemperatureCard({
  temperature,
  humidity,
  windSpeed,
  city,
  language,
  className = "",
}: RealTemperatureCardProps) {
  const t = translations[language];
  const windKmH = Math.round(windSpeed * 3.6 * 10) / 10;

  return (
    <div
      className={`bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all ${className}`}
    >
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 font-mono">
              {t.weatherHeading}
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">{city}</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
          {language === "hi" ? "लाइव मौसम" : "Real-Time"}
        </span>
      </div>

      {/* Temperature Display (in °C, strictly separated from air quality) */}
      <div className="flex items-baseline gap-2 my-2">
        <Thermometer className="w-6 h-6 text-amber-500 shrink-0 self-center" />
        <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">
          {Math.round(temperature)}
        </span>
        <span className="text-2xl font-light text-slate-500">°C</span>
        <span className="text-xs text-slate-400 font-mono ml-1">
          ({Math.round((temperature * 9) / 5 + 32)}°F)
        </span>
      </div>

      {/* Humidity & Wind Speed */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs font-mono">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
          <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase">{t.weatherHumidity}</div>
            <div className="font-bold text-slate-800">{humidity}%</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
          <Wind className="w-4 h-4 text-teal-500 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase">{t.weatherWind}</div>
            <div className="font-bold text-slate-800">{windKmH} km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}

