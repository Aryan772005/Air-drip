"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  Calendar,
  Wind,
  Sun,
  Moon,
  AlertTriangle,
  ChevronDown,
  Activity,
  ShieldAlert,
  Flame,
  CloudFog,
  Sparkles,
} from "lucide-react";
import forecastDataRaw from "@/data/forecastData.json";
import stationCoordsRaw from "@/data/stationCoords.json";
import { ForecastRecord, StationCoord } from "@/lib/types";

const forecastData = forecastDataRaw as ForecastRecord[];
const stationCoords = stationCoordsRaw as StationCoord[];

interface HeroAtmosphericCardProps {
  currentStation?: string;
  onStationChange?: (station: string) => void;
  onExploreMore?: () => void;
}

export default function HeroAtmosphericCard({
  currentStation = "Delhi - Anand Vihar",
  onStationChange,
  onExploreMore,
}: HeroAtmosphericCardProps) {
  const [selectedStation, setSelectedStation] = useState<string>(currentStation);
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-11-08"); // Diwali day
  const [selectedHour, setSelectedHour] = useState<number>(22); // 10 PM peak firecracker hour

  const handleStationSelect = (st: string) => {
    setSelectedStation(st);
    if (onStationChange) {
      onStationChange(st);
    }
  };

  // Filter records for selected station
  const stationRecords = useMemo(() => {
    return forecastData.filter((d) => d.Station === selectedStation);
  }, [selectedStation]);

  // Available unique dates (Nov 05 - Nov 11)
  const daysList = useMemo(() => {
    const dates = [
      { date: "2026-11-05", dayName: "Thu 5", label: "D-3 Pre-Diwali", isDiwali: false },
      { date: "2026-11-06", dayName: "Fri 6", label: "D-2 Dhanteras", isDiwali: false },
      { date: "2026-11-07", dayName: "Sat 7", label: "D-1 Choti Diwali", isDiwali: false },
      { date: "2026-11-08", dayName: "Sun 8", label: "Diwali Night", isDiwali: true },
      { date: "2026-11-09", dayName: "Mon 9", label: "D+1 Post-Diwali", isDiwali: false },
      { date: "2026-11-10", dayName: "Tue 10", label: "D+2 Dispersal", isDiwali: false },
      { date: "2026-11-11", dayName: "Wed 11", label: "D+3 Residual", isDiwali: false },
    ];

    return dates.map((d) => {
      const dayData = stationRecords.filter((r) => r.Datetime.startsWith(d.date));
      const pmValues = dayData.map((r) => r["PM2.5_Median"]);
      const maxPM = pmValues.length > 0 ? Math.round(Math.max(...pmValues)) : 280;
      const avgTemp =
        dayData.length > 0
          ? Math.round(dayData.reduce((acc, cur) => acc + cur.Temperature, 0) / dayData.length)
          : 21;
      const avgHum =
        dayData.length > 0
          ? Math.round(dayData.reduce((acc, cur) => acc + cur.Humidity, 0) / dayData.length)
          : 68;

      return {
        ...d,
        maxPM,
        avgTemp,
        avgHum,
      };
    });
  }, [stationRecords]);

  // Current selected hour record
  const currentRecord = useMemo(() => {
    const targetDatetimePrefix = `${selectedDateStr} ${selectedHour.toString().padStart(2, "0")}`;
    const found = stationRecords.find((r) => r.Datetime.startsWith(targetDatetimePrefix));
    if (found) return found;

    // Fallback to highest PM of that day
    const dayRecords = stationRecords.filter((r) => r.Datetime.startsWith(selectedDateStr));
    if (dayRecords.length > 0) {
      return dayRecords.reduce((max, r) =>
        r["PM2.5_Median"] > max["PM2.5_Median"] ? r : max
      );
    }
    return stationRecords[0] || null;
  }, [stationRecords, selectedDateStr, selectedHour]);

  const pm25 = currentRecord ? Math.round(currentRecord["PM2.5_Median"]) : 680;
  const pmLow = currentRecord ? Math.round(currentRecord["PM2.5_Low"]) : 590;
  const pmHigh = currentRecord ? Math.round(currentRecord["PM2.5_High"]) : 760;
  const windKmH = currentRecord ? (currentRecord.Wind_Speed * 3.6).toFixed(2) : "3.40";
  const tempC = currentRecord ? Math.round(currentRecord.Temperature) : 21;
  const humidityPct = currentRecord ? Math.round(currentRecord.Humidity) : 74;
  const isDiwaliNight = currentRecord?.Is_Diwali_Night || selectedDateStr === "2026-11-08";

  // Dynamic conditions based on PM2.5
  const conditionMeta = useMemo(() => {
    if (pm25 >= 350) {
      return {
        title: "Severe Smog Peak",
        subtitle: "Severe particulate inversion trapping pyrotechnic aerosols and biomass smoke",
        tag: "Emergency Hazard",
        tagColor: "bg-red-500/20 text-red-400 border-red-500/30",
        colorClass: "from-red-500 to-rose-600",
        inversionHeight: "140m (Extremely Compressed)",
        windStatus: "Stagnant Inversion Calm",
        alertText: "Zero outdoor exposure advised. Run HEPA filtration & seal windows.",
      };
    } else if (pm25 >= 200) {
      return {
        title: "Very Poor Airflow",
        subtitle: "Significant particulate density with restricted planetary boundary ventilation",
        tag: "Very Poor",
        tagColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        colorClass: "from-rose-500 to-amber-600",
        inversionHeight: "220m (Low Boundary Layer)",
        windStatus: "Weak Dispersion",
        alertText: "N95 masks mandatory outdoors. Vulnerable groups must stay inside.",
      };
    } else if (pm25 >= 100) {
      return {
        title: "Moderate-Poor Haze",
        subtitle: "Aerosols accumulating under seasonal autumn temperature inversion",
        tag: "Poor Air Quality",
        tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        colorClass: "from-amber-500 to-yellow-500",
        inversionHeight: "380m (Moderate Ventilation)",
        windStatus: "Moderate Drift",
        alertText: "Limit strenuous outdoor workouts. Keep sensitive individuals sheltered.",
      };
    } else {
      return {
        title: "Satisfactory Dispersion",
        subtitle: "Active air currents allowing acceptable particulate clearance",
        tag: "Satisfactory",
        tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        colorClass: "from-emerald-400 to-teal-500",
        inversionHeight: "550m (Well-Mixed Atmosphere)",
        windStatus: "Active Breeze",
        alertText: "Normal daily activities permitted. Safe for morning routines.",
      };
    }
  }, [pm25]);

  // Hourly wind sparkline data for today
  const hourlyPoints = useMemo(() => {
    const dayRows = stationRecords.filter((r) => r.Datetime.startsWith(selectedDateStr));
    if (dayRows.length === 0) return [2.8, 3.1, 3.4, 4.2, 5.0, 3.8, 2.5, 3.2];
    return dayRows.filter((_, idx) => idx % 2 === 0).map((r) => +(r.Wind_Speed * 3.6).toFixed(1));
  }, [stationRecords, selectedDateStr]);

  // SVG wave points for the bottom 7-day strip
  const maxPmInWeek = Math.max(...daysList.map((d) => d.maxPM), 100);
  const minPmInWeek = Math.min(...daysList.map((d) => d.maxPM), 50);
  const wavePoints = useMemo(() => {
    const width = 700;
    const height = 60;
    const step = width / (daysList.length - 1);

    const coords = daysList.map((d, i) => {
      const x = i * step;
      // Invert: high PM2.5 = higher on the wave (lower y value in SVG)
      const normalized = (d.maxPM - minPmInWeek) / (maxPmInWeek - minPmInWeek || 1);
      const y = height - (normalized * 44 + 8);
      return { x, y, day: d };
    });

    // Create smooth bezier path
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    return { coords, path };
  }, [daysList, minPmInWeek, maxPmInWeek]);

  return (
    <div className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden p-1 shadow-2xl transition-all duration-500">
      {/* Dynamic Atmospheric Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0e172a] to-[#070b14] -z-20" />
      <div
        className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-25 bg-gradient-to-tr ${
          pm25 > 250 ? "from-red-600 via-rose-500 to-amber-500" : "from-emerald-500 to-cyan-500"
        } -z-10 animate-pulse`}
      />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 bg-indigo-600 -z-10" />

      {/* Main Glassmorphic Container Card */}
      <div className="backdrop-blur-2xl bg-white/[0.04] border border-white/[0.12] rounded-3xl p-6 sm:p-8 text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]">
        
        {/* Header Bar: Location Selector & Current Observation Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          {/* Station Dropdown */}
          <div className="relative flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.15] flex items-center justify-center text-rose-400 shadow-sm">
              <MapPin className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Prediction Station
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded-full font-mono">
                  {stationCoords.find((s) => s.Station === selectedStation)?.Region || "Delhi NCR"}
                </span>
              </div>
              <div className="relative inline-block mt-0.5">
                <select
                  value={selectedStation}
                  onChange={(e) => handleStationSelect(e.target.value)}
                  className="bg-transparent font-bold text-lg sm:text-xl text-white pr-8 py-0.5 cursor-pointer focus:outline-none appearance-none hover:text-rose-200 transition-colors"
                >
                  {stationCoords.map((st) => (
                    <option key={st.Station} value={st.Station} className="bg-slate-900 text-white text-sm">
                      {st.Station} ({st.Region})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-1 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Time & Live Status Pill */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 justify-end">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {daysList.find((d) => d.date === selectedDateStr)?.dayName || "Nov 2026"} |{" "}
                  {selectedHour}:00 IST
                </span>
              </div>
              <span className="text-[11px] text-amber-400 font-semibold tracking-wide">
                {isDiwaliNight ? "🔥 Diwali Night Inversion Window" : "Diwali Window Simulation"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Sensor Sync</span>
            </div>
          </div>
        </div>

        {/* Hero Middle Content: Left Details + Right Glass Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
          
          {/* Left Column: Atmospheric Smog Status & Huge PM2.5 Readout */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Condition Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border backdrop-blur-md shadow-sm">
                <span className={`w-2 h-2 rounded-full ${pm25 > 250 ? "bg-red-400" : "bg-emerald-400"}`} />
                <span className={conditionMeta.tagColor}>{conditionMeta.tag}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2 leading-tight">
                {conditionMeta.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-normal max-w-xl leading-relaxed mb-6">
                {conditionMeta.subtitle}
              </p>
            </div>

            {/* Giant Metric Display */}
            <div className="flex flex-wrap items-baseline gap-4 my-2">
              <div className="flex items-baseline">
                <span className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  {pm25}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-400 ml-2">µg/m³</span>
              </div>

              {/* Uncertainty 80% CI interval pill */}
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium">80% Confidence Interval</span>
                <span className="text-sm font-bold text-rose-300 bg-rose-950/40 border border-rose-800/40 px-2.5 py-0.5 rounded-lg">
                  {pmLow} – {pmHigh} µg/m³
                </span>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs font-medium text-slate-200">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>{conditionMeta.alertText}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs font-medium text-slate-300">
                <CloudFog className="w-4 h-4 text-indigo-400" />
                <span>Boundary Layer: {conditionMeta.inversionHeight}</span>
              </div>
            </div>
          </div>

          {/* Right Column: 2 Sleek Translucent Mini-Widgets (Wind + Sunrise Arc) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Widget 1: Wind Status & Ventilation */}
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-white/[0.15] transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Wind className="w-4 h-4" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                    Wind & Ventilation
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/30 border border-cyan-800/30 px-2 py-0.5 rounded-md">
                  {conditionMeta.windStatus}
                </span>
              </div>

              {/* Big Wind Metric */}
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    {windKmH}{" "}
                    <span className="text-xs font-semibold text-slate-400">km/h</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Direction: {currentRecord ? currentRecord.Wind_Direction : 145}° (SSE) •{" "}
                    {currentRecord ? currentRecord.Wind_Speed.toFixed(1) : "0.9"} m/s
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-300">
                    {+windKmH < 5.0 ? "⚠️ Calm Lock" : "Clearing"}
                  </span>
                </div>
              </div>

              {/* Wind sparkline SVG chart with bars */}
              <div className="mt-4 pt-3 border-t border-white/[0.05]">
                <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                  <span>24-Hour Velocity Curve</span>
                  <span>Avg: {windKmH} km/h</span>
                </div>
                <div className="flex items-end gap-1.5 h-10 w-full pt-2">
                  {hourlyPoints.map((val, idx) => {
                    const barH = Math.min(100, Math.max(15, (val / 15) * 100));
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-cyan-950 to-cyan-500/70 rounded-t-sm hover:from-cyan-800 hover:to-cyan-300 transition-all cursor-pointer relative group"
                        style={{ height: `${barH}%` }}
                        title={`${val} km/h`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Widget 2: Sunrise, Sunset & Boundary Layer Inversion Arc */}
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-white/[0.15] transition-all">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                    Sun & Inversion Cycle
                  </span>
                </div>
                <span className="text-[11px] text-amber-300 font-medium">
                  {tempC}°C • {humidityPct}% Hum
                </span>
              </div>

              {/* Semicircle Inversion Arc SVG */}
              <div className="relative flex flex-col items-center justify-center my-1">
                <svg viewBox="0 0 200 90" className="w-48 sm:w-56 overflow-visible">
                  {/* Outer Dotted Arc */}
                  <path
                    d="M 20 80 A 80 80 0 0 1 180 80"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="3"
                    strokeDasharray="4 4"
                  />
                  {/* Active Gradient Arc (Night/Day Indicator) */}
                  <path
                    d="M 20 80 A 80 80 0 0 1 180 80"
                    fill="none"
                    stroke="url(#arcGradient)"
                    strokeWidth="4"
                    strokeDasharray="180"
                    strokeDashoffset={isDiwaliNight ? "30" : "110"}
                    strokeLinecap="round"
                  />
                  {/* Glowing Pin for Sun/Moon Position */}
                  <circle
                    cx={isDiwaliNight ? "155" : "100"}
                    cy={isDiwaliNight ? "35" : "12"}
                    r="6"
                    fill="#f59e0b"
                    className="filter drop-shadow-[0_0_8px_#f59e0b]"
                  />

                  <defs>
                    <linearGradient id="arcGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Subtext under Arc */}
                <div className="w-full flex justify-between items-center text-[11px] text-slate-400 px-2 mt-[-6px]">
                  <div className="flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span>06:38 AM</span>
                  </div>
                  <div className="text-[10px] text-rose-300 font-bold bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-800/30">
                    {isDiwaliNight ? "Nocturnal Inversion Lock" : "Solar Mixing Window"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Moon className="w-3 h-3 text-indigo-400" />
                    <span>17:32 PM</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center mt-2">
                Inversion traps 85% of emissions between 19:00 and 04:00 IST
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Multi-Day Trajectory Wave Strip (Nov 5 - Nov 11) */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
                7-Day Diwali Air Trajectory (D-3 to D+3)
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Click any day to inspect atmospheric conditions
            </span>
          </div>

          {/* Connected Curved Wave Background SVG */}
          <div className="hidden md:block relative w-full h-14 mb-2 pointer-events-none">
            <svg
              viewBox="0 0 700 60"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#ef4444" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              <path
                d={wavePoints.path}
                fill="none"
                stroke="url(#waveGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {wavePoints.coords.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#ffffff"
                  stroke={pt.day.isDiwali ? "#ef4444" : "#3b82f6"}
                  strokeWidth="3"
                  className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                />
              ))}
            </svg>
          </div>

          {/* 7 Days Button Nodes Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {daysList.map((day) => {
              const isSelected = selectedDateStr === day.date;
              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDateStr(day.date)}
                  className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center relative group ${
                    isSelected
                      ? "bg-rose-600/30 border-rose-500 shadow-lg shadow-rose-950/50 scale-[1.02]"
                      : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.15]"
                  }`}
                >
                  {/* Top Badge for Diwali */}
                  {day.isDiwali && (
                    <span className="absolute -top-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-600 text-white shadow-md animate-pulse">
                      Diwali
                    </span>
                  )}

                  <span className="text-xs font-bold text-slate-300 mt-1">{day.dayName}</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-full">{day.label}</span>

                  <div className="my-2">
                    {day.maxPM >= 350 ? (
                      <Flame className="w-5 h-5 text-red-400 animate-bounce" />
                    ) : day.maxPM >= 200 ? (
                      <CloudFog className="w-5 h-5 text-rose-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-amber-400" />
                    )}
                  </div>

                  <div className="text-sm font-black text-white">
                    {day.maxPM}{" "}
                    <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {day.avgTemp}°C • {day.avgHum}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Jump Bar to Map & Simulator */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>
              Trained on 7 years of empirical Diwali data (2018–2024) with LightGBM Quantile ML.
            </span>
          </div>

          {onExploreMore && (
            <button
              onClick={onExploreMore}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold transition-all flex items-center gap-1.5"
            >
              <span>Explore Interactive Map & Heatmap</span>
              <span>→</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

