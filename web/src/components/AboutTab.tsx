"use client";

import { Info, Code2, Database, ShieldAlert, Cpu, Sparkles } from "lucide-react";

export default function AboutTab() {
  return (
    <div className="space-y-6 my-4 max-w-5xl">
      {/* Pitch Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Air Drip Mission
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          "Pick your Delhi neighborhood and All-India metro to see how bad the air will be before, during, and after Diwali, with an actionable health plan."
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Built for families, schools, RWAs, and healthcare professionals who cannot rely on a single city-wide number when deciding whether it is safe for children to play outside, when to ventilate homes, or when to prepare emergency asthma care.
        </p>
      </div>

      {/* Grid: Approach & Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <span>Machine Learning Design</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Forecasting <b>8 days in advance</b> means we cannot rely on recent PM2.5 readings (lag features). Instead, Air Drip trains strictly on atmospheric physics, calendar diurnal cycles, and festival geometry:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li><b>Atmospheric Physics</b>: Temp, relative humidity, wind speed, wind direction, surface pressure.</li>
            <li><b>Calendar Cycles</b>: Hour of day, day of week, morning & evening rush hours.</li>
            <li><b>Festival Physics</b>: Days from Diwali (-7 to +7), Diwali night peak hours.</li>
            <li><b>Spatial Modeling</b>: Neighborhood categorical embedding, latitude, longitude.</li>
            <li><b>Uncertainty Bounds</b>: LightGBM quantile regression (alpha=0.10, 0.90) providing an honest 80% confidence interval.</li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Dual-Engine Data Lineage</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Air Drip combines historical atmospheric archives with real-time sensor streams:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li><b>Ground Sensors</b>: Historical CPCB & OpenAQ air quality ground monitoring network archives.</li>
            <li><b>Historical Meteorology</b>: Open-Meteo ERA5 atmospheric reanalysis (2018–2024 hourly).</li>
            <li><b>Live Forecast Meteorology</b>: GFS/ECMWF numerical weather prediction via Open-Meteo API.</li>
            <li><b>Real-Time Calibration</b>: User-supplied OpenWeather API key verifying ambient conditions.</li>
          </ul>
        </div>
      </div>

      {/* Limitations Box */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 text-amber-900 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 font-mono">
          <ShieldAlert className="w-4 h-4 text-amber-600" /> Proud Limitations & Honest Boundary Conditions
        </h4>
        <ul className="text-xs text-amber-800/90 space-y-1 list-disc list-inside">
          <li><b>Unannounced Firecracker Bans / Enforcements</b>: The model assumes historical festive emission patterns unless adjusted in the What-If Simulator.</li>
          <li><b>Sudden Western Disturbances</b>: Unseasonal rains or gusty wind shifts can flush out particulates faster than numerical meteorology forecasts.</li>
          <li><b>Crop Residue (Stubble) Burning Volatility</b>: Peak biomass fire events are governed by wind trajectory from Punjab and Haryana.</li>
        </ul>
      </div>
    </div>
  );
}
