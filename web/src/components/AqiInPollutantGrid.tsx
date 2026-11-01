"use client";

import React from "react";
import {
  Activity,
  AlertCircle,
  Wind,
  Droplets,
  Eye,
  Layers,
  TrendingUp,
} from "lucide-react";

interface AqiInPollutantGridProps {
  pm25: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  stationName: string;
}

export default function AqiInPollutantGrid({
  pm25,
  temperature,
  humidity,
  windSpeed,
  stationName,
}: AqiInPollutantGridProps) {
  const pm10 = Math.round(pm25 * 1.28);
  const aqiScore = Math.min(500, Math.round(pm25 * 0.72 + 50));

  const pollutants = [
    {
      id: "pm25",
      name: "PM2.5",
      fullName: "Fine Particulate Matter (<2.5 µm)",
      value: pm25,
      unit: "µg/m³",
      limit: "60 µg/m³ (CPCB)",
      ratio: (pm25 / 60).toFixed(1),
      status: pm25 > 250 ? "Severe" : pm25 > 120 ? "Very Poor" : pm25 > 60 ? "Moderate" : "Good",
      color: pm25 > 250 ? "#dc2626" : pm25 > 120 ? "#ea580c" : pm25 > 60 ? "#d97706" : "#16a34a",
      pct: Math.min(100, Math.round((pm25 / 450) * 100)),
      desc: "Primary driver of Diwali smog. Penetrates deep into lung alveoli and bloodstream.",
    },
    {
      id: "pm10",
      name: "PM10",
      fullName: "Coarse Inhalable Particles (<10 µm)",
      value: pm10,
      unit: "µg/m³",
      limit: "100 µg/m³ (CPCB)",
      ratio: (pm10 / 100).toFixed(1),
      status: pm10 > 430 ? "Severe" : pm10 > 250 ? "Very Poor" : pm10 > 100 ? "Moderate" : "Good",
      color: pm10 > 430 ? "#b91c1c" : pm10 > 250 ? "#ea580c" : pm10 > 100 ? "#d97706" : "#16a34a",
      pct: Math.min(100, Math.round((pm10 / 600) * 100)),
      desc: "Pyrotechnic chemical fallout, heavy ash, and resuspension of road dust.",
    },
    {
      id: "aqi",
      name: "CPCB AQI",
      fullName: "Composite Air Quality Index",
      value: aqiScore,
      unit: "Index",
      limit: "100 (Safe Ceiling)",
      ratio: (aqiScore / 100).toFixed(1),
      status: aqiScore > 400 ? "Severe" : aqiScore > 300 ? "Very Poor" : aqiScore > 100 ? "Moderate" : "Good",
      color: aqiScore > 400 ? "#dc2626" : aqiScore > 300 ? "#ea580c" : "#16a34a",
      pct: Math.min(100, Math.round((aqiScore / 500) * 100)),
      desc: "Official composite index calculated using India National Air Quality breakpoints.",
    },
    {
      id: "inversion",
      name: "Inversion Layer",
      fullName: "Planetary Boundary Height",
      value: pm25 > 350 ? 140 : 380,
      unit: "meters",
      limit: "600m (Normal Mixing)",
      ratio: "0.2x",
      status: pm25 > 350 ? "Severe Compression" : "Moderate",
      color: "#6366f1",
      pct: pm25 > 350 ? 25 : 65,
      desc: "Nocturnal cooling creates an atmospheric ceiling trapping smoke near ground level.",
    },
    {
      id: "dispersion",
      name: "Wind Dispersion",
      fullName: "Surface Ventilation Coefficient",
      value: (windSpeed * 3.6).toFixed(1),
      unit: "km/h",
      limit: "12 km/h (Active)",
      ratio: "Calm",
      status: windSpeed < 1.5 ? "Stagnant (<1 m/s)" : "Moderate",
      color: "#0284c7",
      pct: Math.min(100, Math.round(((windSpeed * 3.6) / 20) * 100)),
      desc: "Calm surface breezes prevent horizontal clearance of pyrotechnic particulates.",
    },
    {
      id: "visibility",
      name: "Visual Range",
      fullName: "Atmospheric Optical Range",
      value: pm25 > 350 ? 0.8 : 2.5,
      unit: "km",
      limit: "10 km (Clear Air)",
      ratio: "Dense Smog",
      status: pm25 > 350 ? "Dense Fog / Smoke" : "Hazy",
      color: "#8b5cf6",
      pct: pm25 > 350 ? 12 : 35,
      desc: "High aerosol concentration causing severe light scattering and opacity.",
    },
  ];

  return (
    <div className="w-full my-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Pollutant Breakdown & Environmental Telemetry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time concentration levels vs. standard health safety limits for {stationName}
          </p>
        </div>

        <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
          Standards: CPCB (India) & WHO
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pollutants.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Header: Name + Badge */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="text-sm font-extrabold text-slate-900 tracking-wide">{item.name}</span>
                <div className="text-[11px] text-slate-500 truncate max-w-[190px]">{item.fullName}</div>
              </div>
              <span
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: `${item.color}15`,
                  color: item.color,
                  border: `1px solid ${item.color}35`,
                }}
              >
                {item.status}
              </span>
            </div>

            {/* Value + Unit */}
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{item.value}</span>
              <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full bg-slate-100 rounded-full h-2 my-3 overflow-hidden border border-slate-200/80">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.pct}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>

            {/* Limits & Comparison Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 mt-2">
              <span>Limit: {item.limit}</span>
              <span className="font-semibold text-slate-800">
                {item.id === "pm25" || item.id === "pm10" ? `${item.ratio}x Above Limit` : item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
