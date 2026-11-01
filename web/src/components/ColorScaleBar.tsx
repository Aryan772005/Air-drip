"use client";

import React from "react";
import { Language, translations } from "@/lib/translations";
import { calculateCpcbAqi } from "@/lib/aqi";

interface ColorScaleBarProps {
  pm25: number;
  language: Language;
  className?: string;
}

export default function ColorScaleBar({
  pm25,
  language,
  className = "",
}: ColorScaleBarProps) {
  const t = translations[language];
  const aqi = calculateCpcbAqi(pm25);

  const segments = [
    {
      id: "good",
      label: t.scaleGood,
      range: "0-50",
      color: "#00B050",
      bgClass: "bg-[#00B050]",
      min: 0,
      max: 50,
    },
    {
      id: "satisfactory",
      label: t.scaleSatisfactory,
      range: "51-100",
      color: "#92D050",
      bgClass: "bg-[#92D050]",
      min: 51,
      max: 100,
    },
    {
      id: "moderate",
      label: t.scaleModerate,
      range: "101-200",
      color: "#FFC000",
      bgClass: "bg-[#FFC000]",
      min: 101,
      max: 200,
    },
    {
      id: "poor",
      label: t.scalePoor,
      range: "201-300",
      color: "#FF7A00",
      bgClass: "bg-[#FF7A00]",
      min: 201,
      max: 300,
    },
    {
      id: "very-poor",
      label: t.scaleVeryPoor,
      range: "301-400",
      color: "#FF0000",
      bgClass: "bg-[#FF0000]",
      min: 301,
      max: 400,
    },
    {
      id: "severe",
      label: t.scaleSevere,
      range: "401+",
      color: "#780000",
      bgClass: "bg-[#780000]",
      min: 401,
      max: 500,
    },
  ];

  // Calculate percentage along the 0-500 scale
  const clampAqi = Math.min(500, Math.max(0, aqi));
  const pointerPercent = Math.min(97, Math.max(3, (clampAqi / 500) * 100));

  // Determine active segment
  const activeSegment =
    segments.find((s) => aqi >= s.min && aqi <= s.max) || segments[segments.length - 1];

  return (
    <div className={`w-full ${className}`}>
      {/* Title & Current Position readout */}
      <div className="flex items-center justify-between mb-2 text-xs font-semibold">
        <span className="text-slate-600 font-mono flex items-center gap-1.5">
          <span>{t.cpcbScaleLabel}</span>
        </span>
        <span className="font-bold font-mono px-2.5 py-0.5 rounded-full text-white text-[11px]" style={{ backgroundColor: activeSegment.color }}>
          {activeSegment.label} ({aqi >= 500 ? "500+" : aqi})
        </span>
      </div>

      {/* The 6-segment horizontal bar with interactive marker */}
      <div className="relative pt-3 pb-1">
        {/* Pointer Pin above the bar */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700 ease-out z-10 pointer-events-none"
          style={{ left: `${pointerPercent}%` }}
        >
          <div
            className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md animate-pulse"
            style={{ backgroundColor: activeSegment.color }}
          />
          <div
            className="w-0 h-0 border-x-4 border-x-transparent border-t-4"
            style={{ borderTopColor: activeSegment.color }}
          />
        </div>

        {/* 6 colored segments */}
        <div className="h-3.5 w-full rounded-full overflow-hidden flex shadow-inner border border-slate-200">
          {segments.map((seg, idx) => (
            <div
              key={seg.id}
              className={`h-full flex-1 ${seg.bgClass} transition-opacity duration-300 relative ${
                activeSegment.id === seg.id ? "opacity-100 ring-2 ring-white z-0" : "opacity-85 hover:opacity-100"
              }`}
              title={`${seg.label} (${seg.range})`}
            />
          ))}
        </div>
      </div>

      {/* Accessible Text Labels underneath each segment */}
      <div className="grid grid-cols-6 gap-0.5 pt-1 text-center">
        {segments.map((seg) => {
          const isActive = activeSegment.id === seg.id;
          return (
            <div key={seg.id} className="flex flex-col items-center leading-tight">
              <span
                className={`text-[9px] xs:text-[10px] sm:text-xs font-bold truncate max-w-full ${
                  isActive ? "text-slate-900 underline font-black" : "text-slate-500"
                }`}
                style={{ color: isActive ? seg.color : undefined }}
              >
                {seg.label}
              </span>
              <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-slate-400 font-mono hidden xs:inline">
                {seg.range}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

