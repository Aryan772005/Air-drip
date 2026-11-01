"use client";

import React, { useState, useMemo } from "react";
import {
  Cloud,
  Home,
  Search,
  Compass,
  Bell,
  MapPin,
  Wind,
  Sun,
  Sunset,
  Sunrise,
  Check,
  ChevronDown,
  CloudFog,
  CloudRain,
  CloudLightning,
  Sparkles,
  GitBranch,
  Terminal,
  Zap,
} from "lucide-react";
import forecastDataRaw from "@/data/forecastData.json";
import stationCoordsRaw from "@/data/stationCoords.json";
import { ForecastRecord, StationCoord } from "@/lib/types";

const forecastData = forecastDataRaw as ForecastRecord[];
const stationCoords = stationCoordsRaw as StationCoord[];

interface AqiInHeroCardProps {
  currentStation: string;
  onStationChange: (station: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export default function AqiInHeroCard({
  currentStation,
  onStationChange,
  onNavigateToTab,
}: AqiInHeroCardProps) {
  const [selectedStation, setSelectedStation] = useState<string>(currentStation);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(3); // Default to Sun 8 (Diwali Night)
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleStationChange = (st: string) => {
    setSelectedStation(st);
    onStationChange(st);
    setIsSearchOpen(false);
  };

  // Filter records for selected station
  const stationRecords = useMemo(() => {
    return forecastData.filter((d) => d.Station === selectedStation);
  }, [selectedStation]);

  // 7-day timeline (D-3 to D+3 / Nov 5 - Nov 11, 2026)
  const daysList = useMemo(() => {
    const dates = [
      { date: "2026-11-05", dayName: "Monday", shortName: "Thu 5", label: "D-3 Pre-Diwali", isDiwali: false },
      { date: "2026-11-06", dayName: "Tuesday", shortName: "Fri 6", label: "D-2 Dhanteras", isDiwali: false },
      { date: "2026-11-07", dayName: "Wednesday", shortName: "Sat 7", label: "D-1 Choti Diwali", isDiwali: false },
      { date: "2026-11-08", dayName: "Thursday", shortName: "Sun 8", label: "Diwali Night", isDiwali: true },
      { date: "2026-11-09", dayName: "Friday", shortName: "Mon 9", label: "D+1 Post-Diwali", isDiwali: false },
      { date: "2026-11-10", dayName: "Saturday", shortName: "Tue 10", label: "D+2 Dispersal", isDiwali: false },
      { date: "2026-11-11", dayName: "Sunday", shortName: "Wed 11", label: "D+3 Residual", isDiwali: false },
    ];

    return dates.map((d) => {
      const dayData = stationRecords.filter((r) => r.Datetime.startsWith(d.date));
      const pmValues = dayData.map((r) => r["PM2.5_Median"]);
      const maxPM = pmValues.length > 0 ? Math.round(Math.max(...pmValues)) : 280;
      const lowPM = dayData.length > 0 ? Math.round(Math.min(...dayData.map((r) => r["PM2.5_Low"]))) : maxPM - 40;
      const highPM = dayData.length > 0 ? Math.round(Math.max(...dayData.map((r) => r["PM2.5_High"]))) : maxPM + 50;
      const avgTemp = dayData.length > 0 ? Math.round(dayData.reduce((acc, cur) => acc + cur.Temperature, 0) / dayData.length) : 22;
      const avgWind = dayData.length > 0 ? (dayData.reduce((acc, cur) => acc + cur.Wind_Speed, 0) / dayData.length * 3.6).toFixed(2) : "3.40";

      return {
        ...d,
        maxPM,
        lowPM,
        highPM,
        avgTemp,
        avgWind,
      };
    });
  }, [stationRecords]);

  const activeDay = daysList[selectedDayIndex] || daysList[3];

  const pm25 = activeDay.maxPM;
  const windKmH = activeDay.avgWind;
  const tempC = activeDay.avgTemp;

  // Search filtered stations
  const filteredStations = useMemo(() => {
    if (!searchQuery) return stationCoords;
    return stationCoords.filter((st) =>
      st.Station.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.Region.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Frequency bars data for wind widget
  const frequencyBars = [14, 22, 35, 18, 45, 68, 85, 55, 38, 70, 48, 28, 20, 36, 58, 30];

  // SVG wave points for bottom 7-day strip
  const wavePoints = useMemo(() => {
    const width = 800;
    const height = 50;
    const step = width / (daysList.length - 1);

    const maxPmInWeek = Math.max(...daysList.map((d) => d.maxPM), 100);
    const minPmInWeek = Math.min(...daysList.map((d) => d.maxPM), 50);

    const coords = daysList.map((d, i) => {
      const x = i * step;
      const normalized = (d.maxPM - minPmInWeek) / (maxPmInWeek - minPmInWeek || 1);
      const y = height - (normalized * 32 + 8);
      return { x, y, day: d };
    });

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    return { coords, path };
  }, [daysList]);

  return (
    <div className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.9)] border border-[#30363d] select-none group">
      
      {/* Background Image: User's Uploaded Lightning Pier Storm Photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20 filter brightness-[0.70] contrast-[1.2] transition-transform duration-1000 group-hover:scale-[1.02]"
        style={{ backgroundImage: "url('/hero_storm.webp')" }}
      />
      {/* GitHub/Nike Dark Vignette Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/60 to-black/70 -z-10" />

      {/* Main Glass Canvas */}
      <div className="p-6 sm:p-9 text-[#f0f6fc] flex flex-col justify-between min-h-[660px] relative">
        
        {/* ================= TOP NAVIGATION BAR (GitHub + Nike Hybrid) ================= */}
        <div className="flex items-center justify-between gap-4 border-b border-[#30363d]/70 pb-4">
          
          {/* Left: Brand "forecast · now" + GitHub Branch Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white tracking-wide">
              <Cloud className="w-5 h-5 fill-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase font-mono">
                forecast · now
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#161b22]/90 border border-[#30363d] text-[11px] text-[#58a6ff] font-mono">
              <GitBranch className="w-3 h-3" />
              <span>diwali-2026</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-ping" />
            </div>
          </div>

          {/* Center: Frosted Navigation Capsule (Home, Search, Map, Bell) */}
          <div className="hidden md:flex items-center gap-5 px-5 py-2 rounded-full backdrop-blur-xl bg-[#161b22]/70 border border-[#30363d] shadow-inner text-white/80">
            <button
              onClick={() => onNavigateToTab?.("forecast")}
              className="hover:text-white hover:scale-110 transition-all"
              title="Dashboard"
            >
              <Home className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hover:text-white hover:scale-110 transition-all"
              title="Search Stations"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToTab?.("forecast")}
              className="hover:text-white hover:scale-110 transition-all"
              title="Interactive Map"
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToTab?.("health")}
              className="hover:text-white hover:scale-110 transition-all"
              title="Health Alerts"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Date/Time + Station Selector Dropdown */}
          <div className="flex items-center gap-3">
            <div className="text-[#8b949e] text-xs sm:text-sm font-mono tracking-wide hidden sm:block">
              08 Nov | 22:00
            </div>

            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl bg-[#161b22]/80 border border-[#30363d] hover:border-[#58a6ff] hover:bg-[#21262d] transition-all text-xs font-semibold text-white shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center text-[10px]">
                  📍
                </div>
                <span className="max-w-[130px] truncate">{selectedStation.replace("Delhi - ", "")}</span>
                <span className="text-[10px] text-[#8b949e] font-mono">Admin</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8b949e]" />
              </button>

              {/* Station Selection Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 top-10 w-72 backdrop-blur-2xl bg-[#161b22]/95 border border-[#30363d] rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-xl mb-2">
                    <Search className="w-3.5 h-3.5 text-[#8b949e]" />
                    <input
                      type="text"
                      placeholder="Search locality or city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs text-white placeholder-[#8b949e] focus:outline-none w-full font-mono"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {filteredStations.map((st) => (
                      <button
                        key={st.Station}
                        onClick={() => handleStationChange(st.Station)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          st.Station === selectedStation
                            ? "bg-rose-600 text-white font-bold"
                            : "text-[#c9d1d9] hover:bg-[#21262d]"
                        }`}
                      >
                        <span className="truncate">{st.Station}</span>
                        <span className="text-[10px] opacity-60 ml-2 font-mono">{st.Region}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= HERO CONTENT (NIKE STYLE TYPOGRAPHY + RIGHT WIDGETS) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6">
          
          {/* Left Hero Column: Bold Nike-Style Headline & Giant Metric */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Nike-Style Punchy Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold uppercase tracking-widest w-fit mb-3">
              <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>SEVERE NOCTURNAL PEAK · DIWALI 2026</span>
            </div>

            {/* Giant Nike Headline: "THUNDERSTORMS" / "DIWALI SMOG PEAK" */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none drop-shadow-2xl">
              {activeDay.isDiwali ? "Thunderstorms" : "Smog Peak"}
            </h1>

            {/* Nike Clean Lowercase Subtitle: "intense weather conditions" */}
            <div className="text-lg sm:text-2xl font-light text-[#f0f6fc]/90 tracking-tight mt-2 lowercase">
              {activeDay.isDiwali
                ? "intense weather conditions & severe particulate inversion"
                : "hazardous particulate entrapment under nocturnal cooling"}
            </div>

            {/* Editorial Description */}
            <p className="text-xs sm:text-sm text-[#8b949e] max-w-lg mt-3.5 leading-relaxed font-normal">
              Heavy smoke accumulation, calm surface winds, and nocturnal thermal inversion
              trapping pyrotechnic aerosols near ground level. Extreme respiratory alert across Delhi NCR.
            </p>

            {/* Giant Nike-Style Metric Display: "22° +/-" (Clean Big Typography) */}
            <div className="flex items-baseline gap-3 mt-7">
              <span className="text-7xl sm:text-8xl md:text-9xl font-extralight tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] leading-none">
                {activeDay.isDiwali ? "738" : pm25}
              </span>
              <span className="text-3xl sm:text-4xl font-light text-[#8b949e]">
                µg/m³
              </span>
              <span className="text-2xl sm:text-3xl font-light text-white/50 tracking-wider">
                +/-
              </span>
            </div>

            {/* Location & AQI Index Pill Row (Matching "New York UV Ind: 2") */}
            <div className="flex flex-wrap items-center gap-6 mt-4 text-xs sm:text-sm text-[#f0f6fc]/80 font-mono">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#58a6ff]" />
                <span className="text-white font-semibold">{selectedStation}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8b949e]">AQI Ind:</span>
                <span className="font-bold text-[#f85149]">
                  {activeDay.isDiwali ? "492 (Severe+)" : "320 (Very Poor)"}
                </span>
                <span className="text-[#30363d]">•</span>
                <span className="text-[#8b949e]">UV Ind: 2</span>
              </div>
            </div>
          </div>

          {/* Right Column: 2 Translucent Glass Cards (Wind Status + Sunrise Arc) */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-4">
            
            {/* Glass Card 1: Wind Status (Matching Reference Image) */}
            <div className="backdrop-blur-xl bg-[#161b22]/75 border border-[#30363d] rounded-3xl p-5 shadow-2xl relative overflow-hidden group hover:border-[#58a6ff]/60 transition-all">
              <div className="flex items-center justify-between mb-3 text-white">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-[#58a6ff]" />
                  <span className="text-xs sm:text-sm font-medium tracking-wide text-[#f0f6fc]">
                    Wind status
                  </span>
                </div>
                <span className="text-sm sm:text-base font-bold text-white font-mono tracking-tight">
                  {windKmH} km/h
                </span>
              </div>

              {/* Sine Wave Curve Line (SVG) */}
              <div className="w-full h-10 my-1">
                <svg viewBox="0 0 240 40" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <path
                    d="M 0 25 C 30 10, 60 35, 90 20 C 120 5, 150 35, 180 15 C 210 5, 230 25, 240 20"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                  />
                </svg>
              </div>

              {/* Vertical Equalizer Frequency Bars */}
              <div className="flex items-end justify-between gap-1.5 h-8 pt-1">
                {frequencyBars.map((heightPct, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-white/70 rounded-full transition-all duration-300 group-hover:bg-[#58a6ff]"
                    style={{ height: `${heightPct}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Glass Card 2: Sunrise & Sunset Arc (Matching Reference Image) */}
            <div className="backdrop-blur-xl bg-[#161b22]/75 border border-[#30363d] rounded-3xl p-5 shadow-2xl relative overflow-hidden group hover:border-[#58a6ff]/60 transition-all">
              <div className="flex items-center justify-between mb-2 text-white text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Sunrise className="w-4 h-4 text-[#d29922]" />
                  <span className="text-[#f0f6fc]">Sunrise ↗</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#3fb950]" />
                  <span className="text-[#f0f6fc]">Sunset</span>
                  <Sunset className="w-4 h-4 text-[#58a6ff]" />
                </div>
              </div>

              {/* Dotted Semicircular Arc with Sun Symbol & Radial Rays */}
              <div className="relative flex flex-col items-center justify-center my-2">
                <svg viewBox="0 0 220 90" className="w-52 sm:w-60 overflow-visible">
                  {/* Semicircular Dotted Arc */}
                  <path
                    d="M 20 80 A 90 90 0 0 1 200 80"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Sun Rays radiating from bottom center */}
                  <line x1="110" y1="80" x2="60" y2="40" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
                  <line x1="110" y1="80" x2="85" y2="25" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
                  <line x1="110" y1="80" x2="110" y2="15" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
                  <line x1="110" y1="80" x2="135" y2="25" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
                  <line x1="110" y1="80" x2="160" y2="40" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />

                  {/* Half Sun Dome in Center */}
                  <path
                    d="M 95 80 A 15 15 0 0 1 125 80 Z"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.8)"
                    strokeWidth="2"
                  />

                  {/* Glowing Node 1 (Sunrise point on arc) */}
                  <circle cx="32" cy="56" r="4" fill="#d29922" className="filter drop-shadow-[0_0_6px_#d29922]" />

                  {/* Glowing Node 2 (Sunset point on arc) */}
                  <circle cx="188" cy="56" r="4" fill="#58a6ff" className="filter drop-shadow-[0_0_6px_#58a6ff]" />
                </svg>

                <div className="w-full flex justify-between items-center text-[11px] text-[#8b949e] font-mono px-4 mt-[-4px]">
                  <span>06:38 AM</span>
                  <span className="text-[10px] text-white/90">11h 04m daylight</span>
                  <span>17:32 PM</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= BOTTOM 7-DAY FORECAST STRIP ================= */}
        {/* Exact Layout from Reference Image: Monday 26°, Tuesday 28° ... with connected glowing wave */}
        <div className="mt-4 pt-4 border-t border-[#30363d]/70 relative">
          
          {/* 7 Days Headers */}
          <div className="grid grid-cols-7 gap-2 text-center mb-1">
            {daysList.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDayIndex(idx)}
                  className="flex flex-col items-center justify-start group cursor-pointer transition-transform hover:scale-105"
                >
                  <span className="text-xs sm:text-sm font-normal text-[#8b949e] group-hover:text-white">
                    {day.dayName}
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-white mt-0.5">
                    {day.isDiwali ? "738°" : `${day.maxPM}°`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Connected Glowing Wave Line SVG with circular nodes & vertical active day indicator */}
          <div className="relative w-full h-16 pointer-events-none">
            <svg viewBox="0 0 800 50" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              
              {/* Continuous Wave Line */}
              <path
                d={wavePoints.path}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
              />

              {/* Vertical Dotted Guideline for Selected/Active Day */}
              <line
                x1={wavePoints.coords[selectedDayIndex]?.x || 400}
                y1="0"
                x2={wavePoints.coords[selectedDayIndex]?.x || 400}
                y2={wavePoints.coords[selectedDayIndex]?.y || 25}
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Glowing Bright Beacon for Active Day */}
              <circle
                cx={wavePoints.coords[selectedDayIndex]?.x || 400}
                cy={wavePoints.coords[selectedDayIndex]?.y || 25}
                r="6"
                fill="#ffffff"
                className="filter drop-shadow-[0_0_10px_#ffffff]"
              />
            </svg>

            {/* Circular Weather Icons on each day node */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-auto">
              {daysList.map((day, idx) => {
                const isSelected = selectedDayIndex === idx;
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-white text-slate-950 shadow-lg shadow-white/50 scale-110"
                        : "bg-[#161b22] text-[#8b949e] hover:bg-[#21262d] hover:text-white border border-[#30363d]"
                    }`}
                    title={`${day.dayName}: ${day.maxPM} µg/m³`}
                  >
                    {day.isDiwali ? (
                      <CloudLightning className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d29922] fill-[#d29922]" />
                    ) : day.maxPM > 300 ? (
                      <CloudRain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#58a6ff]" />
                    ) : day.maxPM > 150 ? (
                      <CloudFog className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f0f6fc]" />
                    ) : (
                      <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8b949e]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
