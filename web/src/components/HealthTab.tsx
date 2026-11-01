"use client";

import { HeartPulse, ShieldAlert, Baby, Stethoscope, Wind, Home } from "lucide-react";
import { AQI_LEVELS } from "@/lib/aqi";

export default function HealthTab() {
  const levels = Object.entries(AQI_LEVELS);

  return (
    <div className="space-y-6 my-4">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-2 font-mono">
          <HeartPulse className="w-4 h-4" />
          CPCB-Aligned Health Advisory Engine
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          Actionable Health Protections Tailored by Air Quality Category
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
          Air quality varies dynamically by neighborhood and diurnal atmospheric mixing. Follow targeted
          medical guidance for each CPCB category depending on your vulnerability group.
        </p>
      </div>

      {/* CPCB Category Cards */}
      <div className="space-y-4">
        {levels.map(([name, info]) => (
          <div
            key={name}
            className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4 transition-all hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span
                  className="px-3.5 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: info.color }}
                >
                  {info.badge}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-600">
                  PM2.5 Band: {info.range}
                </span>
              </div>
              <span className="text-xs italic text-slate-500 max-w-xl text-right">
                {info.summary}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-emerald-600" /> General Public
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{info.general}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-amber-600" /> Children & Elderly
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{info.vulnerable}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-rose-600" /> Asthma & Heart Patients
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{info.sensitive}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
