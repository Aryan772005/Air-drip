"use client";

import { useMemo } from "react";
import { Flame, ShieldAlert, AlertTriangle, TrendingUp, BarChart3, MapPin } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

import pastDataRaw from "@/data/pastDiwaliData.json";

export default function PastDiwalisTab() {
  const pastData = pastDataRaw as {
    trajectory: any[];
    yearly_comparison: any[];
    top10_surge: any[];
    facts: string[];
  };

  const trajectoryPivoted = useMemo(() => {
    const map: Record<number, any> = {};
    for (let d = -7; d <= 7; d++) {
      map[d] = { daysFromDiwali: d };
    }
    pastData.trajectory.forEach((r) => {
      const day = r.Days_From_Diwali;
      const yr = r.Year;
      if (map[day]) {
        map[day][`Year_${yr}`] = Math.round(r["PM2.5"] * 10) / 10;
      }
    });
    return Object.values(map);
  }, [pastData.trajectory]);

  const yearColors: Record<string, string> = {
    Year_2018: "#8b5cf6",
    Year_2019: "#2563eb",
    Year_2020: "#06b6d4",
    Year_2021: "#10b981",
    Year_2022: "#f59e0b",
    Year_2023: "#ea580c",
    Year_2024: "#dc2626",
  };

  return (
    <div className="space-y-8 my-4">
      {/* 3 Key Facts Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-500" />
          <span>Historical Diwali Air Quality Archive (2018–2024)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pastData.facts.map((fact, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1.5"
            >
              <div className="text-xs font-mono font-bold text-blue-600 uppercase">
                Historical Pattern #{idx + 1}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{fact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 1: Festival Trajectory Across 7 Historical Diwalis */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Festival Trajectory: D-7 to D+7 Across 7 Historical Diwalis</span>
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Notice how every year forms a distinctive inverted V-shape peaking abruptly on Diwali Night (Day 0)
          </p>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectoryPivoted}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="daysFromDiwali"
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => (v === 0 ? "Diwali (Day 0)" : `D${v > 0 ? "+" : ""}${v}`)}
              />
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
              <ReferenceLine x={0} stroke="#dc2626" strokeDasharray="3 3" label="Diwali Night" />
              {Object.keys(yearColors).map((k) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  name={k.replace("Year_", "")}
                  stroke={yearColors[k]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Diwali Night vs Normal Non-Diwali Baseline */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Diwali Night vs. Normal Non-Diwali Days (Year-by-Year)</span>
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Comparing peak 8-hour nighttime pollution vs. normal pre-Diwali ambient concentrations
          </p>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pastData.yearly_comparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="Year" stroke="#94a3b8" fontSize={12} />
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
              <Bar dataKey="Normal_Days_PM25" name="Normal Days PM2.5" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Diwali_Night_PM25" name="Diwali Night Peak PM2.5" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Hardest Hit Neighborhoods Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
          <MapPin className="w-4 h-4 text-rose-500" />
          <span>Top 10 Hardest-Hit Surge Neighborhoods Across History</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-mono">
                <th className="p-3">Rank</th>
                <th className="p-3">Station / Locality</th>
                <th className="p-3">Baseline PM2.5</th>
                <th className="p-3">Diwali Night PM2.5</th>
                <th className="p-3">Surge Uplift</th>
                <th className="p-3 text-right">Surge Multiplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {pastData.top10_surge.map((st, i) => (
                <tr key={st.Station} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-slate-400">#{i + 1}</td>
                  <td className="p-3 font-medium text-slate-900 font-sans">{st.Station}</td>
                  <td className="p-3 text-slate-500">{st.Normal_Days_PM25} µg/m³</td>
                  <td className="p-3 font-bold text-rose-600">{st.Diwali_Night_PM25} µg/m³</td>
                  <td className="p-3 font-semibold text-rose-500">+{st.Surge_PM25} µg/m³</td>
                  <td className="p-3 text-right">
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold border border-red-200">
                      {st.Surge_Ratio}x
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
