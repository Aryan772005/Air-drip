"use client";

import { useState, useMemo } from "react";
import { Sliders, AlertTriangle, ShieldCheck, TrendingDown, Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

import forecastDataRaw from "@/data/forecastData.json";
import { ForecastRecord } from "@/lib/types";

export default function WhatIfTab() {
  const forecastData = forecastDataRaw as ForecastRecord[];
  const [intensity, setIntensity] = useState<number>(100);

  const intensityFactor = intensity / 100.0;

  // Compute simulated scenario dataset
  const scenarioData = useMemo(() => {
    return forecastData.map((d) => {
      if (!d.Is_Diwali_Night) {
        return { ...d, Scenario_PM25: d["PM2.5_Median"] };
      }
      const normalBase = d.Is_Delhi ? 235.0 : 130.0;
      const uplift = Math.max(0, d["PM2.5_Median"] - normalBase);
      const simulated = Math.round((normalBase + intensityFactor * uplift) * 10) / 10;
      return {
        ...d,
        Scenario_PM25: simulated,
      };
    });
  }, [forecastData, intensityFactor]);

  // Aggregate metrics for Diwali Night hours
  const nightRecords = useMemo(() => {
    return scenarioData.filter((d) => d.Is_Diwali_Night);
  }, [scenarioData]);

  const origAvg = useMemo(() => {
    if (nightRecords.length === 0) return 0;
    return Math.round((nightRecords.reduce((acc, r) => acc + r["PM2.5_Median"], 0) / nightRecords.length) * 10) / 10;
  }, [nightRecords]);

  const scenAvg = useMemo(() => {
    if (nightRecords.length === 0) return 0;
    return Math.round((nightRecords.reduce((acc, r) => acc + r.Scenario_PM25, 0) / nightRecords.length) * 10) / 10;
  }, [nightRecords]);

  const savedAbs = Math.round((origAvg - scenAvg) * 10) / 10;
  const savedPct = origAvg > 0 ? Math.round((savedAbs / origAvg) * 100) : 0;

  // Delhi Timeline comparison chart
  const timelineComparison = useMemo(() => {
    const delhiRows = scenarioData.filter((d) => d.Is_Delhi);
    const times = Array.from(new Set(delhiRows.map((d) => d.Datetime))).sort();

    return times.map((t) => {
      const subset = delhiRows.filter((d) => d.Datetime === t);
      const avgOrig = subset.reduce((acc, r) => acc + r["PM2.5_Median"], 0) / subset.length;
      const avgScen = subset.reduce((acc, r) => acc + r.Scenario_PM25, 0) / subset.length;
      const dt = new Date(t);
      return {
        time: `${dt.getDate()} Nov ${dt.getHours()}:00`,
        "Normal Forecast (100% Crackers)": Math.round(avgOrig),
        [`Simulated Scenario (${intensity}%)`]: Math.round(avgScen),
      };
    });
  }, [scenarioData, intensity]);

  // Station breakdown for Diwali night peak
  const stationRankings = useMemo(() => {
    const stations = Array.from(new Set(nightRecords.map((d) => d.Station)));
    return stations
      .map((st) => {
        const rows = nightRecords.filter((d) => d.Station === st);
        const norm = Math.round((rows.reduce((acc, r) => acc + r["PM2.5_Median"], 0) / rows.length) * 10) / 10;
        const scen = Math.round((rows.reduce((acc, r) => acc + r.Scenario_PM25, 0) / rows.length) * 10) / 10;
        const saved = Math.round((norm - scen) * 10) / 10;
        return {
          Station: st,
          Normal_PM25: norm,
          Scenario_PM25: scen,
          Saved_PM25: Math.round(saved * 10) / 10,
          Saved_Pct: Math.round((saved / norm) * 100),
        };
      })
      .sort((a, b) => b.Saved_PM25 - a.Saved_PM25);
  }, [nightRecords]);

  return (
    <div className="space-y-6 my-4">
      {/* Policy Simulator Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-2 font-mono">
          <Sliders className="w-4 h-4" />
          Interactive Policy Simulator: Firecracker Emission Sensitivity
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          Simulate Real Air Quality Under Different Crackers Regulations
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
          Simulate the direct impact of firecracker bans, green cracker mandates, or community compliance on peak Diwali night pollution.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl w-fit">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span><b>Important Disclaimer:</b> Physical scenario estimate based on emission scaling, not a regulatory guarantee.</span>
        </div>
      </div>

      {/* Slider Control Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 font-mono">
              Firecracker Emission Intensity
            </div>
            <div className="text-3xl font-black text-rose-600 mt-0.5">
              {intensity}%{" "}
              <span className="text-sm font-normal text-slate-500">
                {intensity === 100
                  ? "(Normal Historical Levels)"
                  : intensity === 50
                  ? "(Reduced / Green Crackers)"
                  : intensity === 0
                  ? "(Zero Firecrackers / Complete Ban)"
                  : "(Custom Regulation)"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 font-mono">
            <button
              onClick={() => setIntensity(100)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                intensity === 100
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              100% (Normal)
            </button>
            <button
              onClick={() => setIntensity(50)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                intensity === 50
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              50% (Green Crackers)
            </button>
            <button
              onClick={() => setIntensity(0)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                intensity === 0
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              0% (Zero Crackers)
            </button>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={intensity}
          onChange={(e) => setIntensity(parseInt(e.target.value))}
          className="w-full h-2.5 bg-slate-100 rounded-lg cursor-pointer"
        />

        {/* 3 Metric Output Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Standard Forecast Peak (Diwali Night)</div>
            <div className="text-2xl font-black text-rose-600 font-mono mt-1">{origAvg} µg/m³</div>
            <div className="text-[11px] text-slate-400 font-mono">100% historical cracker activity</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Simulated Peak at {intensity}% Intensity</div>
            <div className="text-2xl font-black text-blue-600 font-mono mt-1">{scenAvg} µg/m³</div>
            <div className="text-[11px] text-slate-400 font-mono">Simulated festive atmospheric load</div>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
            <div className="text-xs text-emerald-800 font-medium">Averted Pollution Load</div>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
              -{savedAbs} µg/m³ <span className="text-sm font-semibold">({savedPct}% Cleaner)</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-mono">Estimated public health savings</div>
          </div>
        </div>
      </div>

      {/* Trajectory Comparison Chart */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-mono">
            Delhi Timeline: Normal 100% Crackers vs. {intensity}% Scenario
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Hourly simulation showing how festival ban compliance suppresses the peak spike
          </p>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} interval={16} />
              <YAxis stroke="#94a3b8" fontSize={11} unit=" µg" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#0f172a",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 8, fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="Normal Forecast (100% Crackers)"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={`Simulated Scenario (${intensity}%)`}
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Station Impact Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Station-by-Station Averted Pollution Impact</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-mono">
                <th className="p-3 font-semibold">Station / Neighborhood</th>
                <th className="p-3 font-semibold">Standard PM2.5</th>
                <th className="p-3 font-semibold text-blue-600">Scenario PM2.5</th>
                <th className="p-3 font-semibold text-emerald-600">Averted PM2.5</th>
                <th className="p-3 font-semibold text-right">% Cleaner Air</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {stationRankings.map((st) => (
                <tr key={st.Station} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-medium text-slate-900 font-sans">{st.Station}</td>
                  <td className="p-3 text-rose-600 font-semibold">{st.Normal_PM25} µg/m³</td>
                  <td className="p-3 text-blue-600 font-semibold">{st.Scenario_PM25} µg/m³</td>
                  <td className="p-3 text-emerald-600 font-bold">-{st.Saved_PM25} µg/m³</td>
                  <td className="p-3 text-right">
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                      +{st.Saved_Pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
