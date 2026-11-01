"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  HeartPulse,
  Baby,
  Activity,
  Wind,
  CheckCircle2,
  XCircle,
  Clock,
  Home,
  Sparkles,
} from "lucide-react";
import { AQI_LEVELS, getAqiCategory, getBestTimeWindow } from "@/lib/aqi";

interface AqiInHealthSectionProps {
  pm25: number;
  stationName: string;
}

export default function AqiInHealthSection({
  pm25,
  stationName,
}: AqiInHealthSectionProps) {
  const [activeGroup, setActiveGroup] = useState<"general" | "vulnerable" | "sensitive">("general");

  const { name: categoryName, info } = getAqiCategory(pm25);

  const groups = [
    { id: "general", label: "General Public", icon: Activity },
    { id: "vulnerable", label: "Children & Elderly", icon: Baby },
    { id: "sensitive", label: "Asthma & Heart Patients", icon: HeartPulse },
  ];

  const getAdviceText = () => {
    if (activeGroup === "vulnerable") return info.vulnerable;
    if (activeGroup === "sensitive") return info.sensitive;
    return info.general;
  };

  const isSevere = pm25 > 250;
  const isPoor = pm25 > 120;

  return (
    <div className="w-full my-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <span>Health Advisory & Protective Protocol</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalized medical guidance calibrated for {stationName} ({pm25} µg/m³ • {categoryName})
          </p>
        </div>

        {/* Audience Pill Selector (Scrollable on mobile) */}
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-2xl shadow-sm text-xs font-mono overflow-x-auto max-w-full">
          {groups.map((g) => {
            const Icon = g.icon;
            const isSelected = activeGroup === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Advisory Banner Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${info.color}15`, color: info.color }}
            >
              {info.badge.split(" ")[0]}
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                Current Exposure Threat Level
              </span>
              <h3 className="text-2xl font-black text-slate-900">{info.badge}</h3>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-slate-700 font-mono">
              CPCB Safety Threshold: 60 µg/m³
            </div>
            <div className="text-xs font-semibold text-rose-600">
              {(pm25 / 60).toFixed(1)}x Safe Limit for {stationName}
            </div>
          </div>
        </div>

        {/* Target Group Advisory */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6">
          <div className="text-xs font-mono uppercase tracking-wider font-bold text-blue-600 mb-1.5 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Group Action Plan: {groups.find((g) => g.id === activeGroup)?.label}</span>
          </div>
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
            {getAdviceText()}
          </p>
        </div>

        {/* Action Grid: What To Do vs. What To Avoid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Recommended Actions */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mandatory Protective Actions</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>
                  Wear a certified <b>N95 / N99 mask</b> if stepping outdoors; standard cloth masks do not filter fine particulates.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>
                  Run indoor <b>HEPA air purifiers</b> continuously on high speed with closed windows and sealed door gaps.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>
                  Maintain frequent warm hydration and saline nasal rinses to clear trapped upper-airway aerosols.
                </span>
              </li>
            </ul>
          </div>

          {/* Critical Warnings */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-3">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>High-Risk Activities to Avoid</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                <span>
                  <b>No early morning jogging or vigorous outdoor exercise</b> during peak nocturnal inversion hours (8 PM - 9 AM).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                <span>
                  Avoid opening windows for cross-ventilation during rush hours or firecracker ignition spikes.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                <span>
                  Do not burn incense sticks, candles, or waste materials indoors to avoid compounding particulate loads.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
