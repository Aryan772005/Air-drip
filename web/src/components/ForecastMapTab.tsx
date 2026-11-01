"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  TrendingUp,
  Activity,
  Layers,
  HeartPulse,
  Info,
  PhoneCall,
  ShieldAlert,
  Flame,
  Truck,
  Building2,
  Gauge,
  Wind,
  Droplets,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

import forecastDataRaw from "@/data/forecastData.json";
import { ForecastRecord } from "@/lib/types";
import { AQI_LEVELS, getAqiCategory, getBestTimeWindow } from "@/lib/aqi";
import { ClickedLocationData } from "./MapComponent";
import {
  getWeatherIconFromCode,
  getWeatherConditionFromCode,
  findNearestState,
  getStateHelplines,
  generateDataForLocation,
  getDisasterProbabilities,
} from "@/lib/disasterEmergency";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[580px] sm:h-[640px] bg-slate-100 rounded-3xl flex items-center justify-center border border-slate-200 text-slate-500">
      <div className="animate-pulse flex items-center gap-2.5 font-mono text-sm">
        <MapPin className="w-5 h-5 text-blue-600 animate-bounce" />
        <span>Loading Leaflet India Map & High-Resolution Tiles...</span>
      </div>
    </div>
  ),
});

export default function ForecastMapTab({ onContextChange }: { onContextChange?: (context: { city: string; lat: number; lon: number }) => void }) {
  const forecastData = forecastDataRaw as ForecastRecord[];

  const timestamps = useMemo(() => {
    const set = new Set(forecastData.map((d) => d.Datetime));
    return Array.from(set).sort();
  }, [forecastData]);

  const defaultIdx = useMemo(() => {
    const target = "2026-11-08 22:00:00";
    const idx = timestamps.findIndex((t) => t.includes(target) || t.includes("2026-11-08T22:00"));
    return idx !== -1 ? idx : Math.floor(timestamps.length / 2);
  }, [timestamps]);

  const [timeIndex, setTimeIndex] = useState<number>(defaultIdx);
  const [selectedStation, setSelectedStation] = useState<string>("Delhi - Anand Vihar");
  const [regionFilter, setRegionFilter] = useState<"all" | "delhi" | "india">("all");
  const [showIdw, setShowIdw] = useState<boolean>(true);

  const activeTimestamp = timestamps[timeIndex] || timestamps[0];

  const snapshot = useMemo(() => {
    return forecastData.filter((d) => d.Datetime === activeTimestamp);
  }, [forecastData, activeTimestamp]);

  const filteredSnapshot = useMemo(() => {
    if (regionFilter === "delhi") {
      return snapshot.filter((d) => d.Is_Delhi);
    }
    if (regionFilter === "india") {
      return snapshot.filter((d) => !d.Is_Delhi);
    }
    return snapshot;
  }, [snapshot, regionFilter]);

  const activeStationWeek = useMemo(() => {
    return forecastData
      .filter((d) => d.Station === selectedStation)
      .sort((a, b) => new Date(a.Datetime).getTime() - new Date(b.Datetime).getTime());
  }, [forecastData, selectedStation]);

  const currentStationRecord = useMemo(() => {
    return snapshot.find((d) => d.Station === selectedStation) || activeStationWeek[0];
  }, [snapshot, selectedStation, activeStationWeek]);

  const aqiInfo = currentStationRecord
    ? AQI_LEVELS[currentStationRecord.AQI_Category] || AQI_LEVELS["Severe"]
    : AQI_LEVELS["Severe"];

  const chartData = useMemo(() => {
    return activeStationWeek.map((d) => {
      const dt = new Date(d.Datetime);
      const isDiwaliNight = d.Is_Diwali_Night;
      return {
        datetime: d.Datetime,
        displayTime: `${dt.getDate()} Nov ${dt.getHours()}:00`,
        median: Math.round(d["PM2.5_Median"]),
        low: Math.round(d["PM2.5_Low"]),
        high: Math.round(d["PM2.5_High"]),
        isNight: isDiwaliNight,
      };
    });
  }, [activeStationWeek]);

  const jumpTo = (dateSubstr: string) => {
    const idx = timestamps.findIndex((t) => t.includes(dateSubstr));
    if (idx !== -1) setTimeIndex(idx);
  };

  const formattedActiveTime = new Date(activeTimestamp).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const [clickedData, setClickedData] = useState<ClickedLocationData>(() => {
    const defaultData = generateDataForLocation("Delhi NCR", "Dense Smog & Nocturnal Inversion", 28.6476, 77.3158);
    return {
      lat: 28.6476,
      lon: 77.3158,
      name: "Delhi - Anand Vihar",
      state: "Delhi NCR",
      temp: 21,
      humidity: 74,
      weatherCode: 45,
      iconChar: "🌫️",
      mainCondition: "Dense Smog & Nocturnal Inversion",
      predictions: defaultData.predictions,
      alerts: defaultData.alerts,
      armedForces: defaultData.armedForces,
      localResources: defaultData.localResources,
      probabilities: getDisasterProbabilities("Delhi NCR"),
      helplines: getStateHelplines("Delhi NCR"),
    };
  });

  const handleMapLocationClick = (data: ClickedLocationData) => {
    setClickedData(data);
    onContextChange?.({ city: data.name.replace(/^Delhi - /, ""), lat: data.lat, lon: data.lon });
  };

  return (
    <div className="space-y-8">
      {/* ================= 1. TIMELINE & PRESET CONTROLS ================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-mono font-semibold">
                Active Forecast Timestamp
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{formattedActiveTime}</span>
                {currentStationRecord?.Is_Diwali_Night && (
                  <span className="text-[10px] font-mono bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold animate-pulse">
                    Diwali Night Peak
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Jump Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => jumpTo("2026-11-06 18:00")}
              className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition font-medium"
            >
              Pre-Diwali (Nov 6)
            </button>
            <button
              onClick={() => jumpTo("2026-11-08 22:00")}
              className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-500/20 transition"
            >
              Diwali Night Peak (Nov 8)
            </button>
            <button
              onClick={() => jumpTo("2026-11-10 09:00")}
              className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition font-medium"
            >
              Post-Diwali (Nov 10)
            </button>
          </div>
        </div>

        {/* Time Slider */}
        <div className="space-y-1.5 pt-1">
          <input
            type="range"
            min={0}
            max={timestamps.length - 1}
            value={timeIndex}
            onChange={(e) => setTimeIndex(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-100 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>Nov 5 (D-3 Baseline)</span>
            <span className="text-red-600 font-bold">Nov 8 (Diwali Night Inversion)</span>
            <span>Nov 11 (D+3 Recovery)</span>
          </div>
        </div>
      </div>

      {/* ================= 2. INTERACTIVE GOOGLE MAPS STYLE CONTAINER ================= */}
      <div className="space-y-4">
        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 font-semibold">Station Filter:</span>
            <div className="inline-flex rounded-2xl border border-slate-200 p-1 bg-white shadow-sm text-xs font-mono overflow-x-auto max-w-full">
              <button
                onClick={() => setRegionFilter("all")}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition ${
                  regionFilter === "all" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All (22)
              </button>
              <button
                onClick={() => setRegionFilter("delhi")}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition ${
                  regionFilter === "delhi" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Delhi NCR (10)
              </button>
              <button
                onClick={() => setRegionFilter("india")}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition ${
                  regionFilter === "india" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All-India Metros (12)
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none font-mono font-medium">
            <input
              type="checkbox"
              checked={showIdw}
              onChange={(e) => setShowIdw(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
            />
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Smooth IDW Spatial Heat Layer</span>
          </label>
        </div>

        {/* Map Component */}
        <MapComponent
          stations={filteredSnapshot}
          selectedStation={selectedStation}
          onSelectStation={(st) => setSelectedStation(st)}
          showIdw={showIdw}
          regionFilter={regionFilter}
          onLocationClick={handleMapLocationClick}
        />
      </div>

      {/* ================= 3. LIVE MAP CLICK TELEMETRY & DISASTER HAZARD ENGINE ================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Live Weather Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl shadow-sm">
              {clickedData.iconChar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {clickedData.name}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  {clickedData.state}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 mt-1">
                <span>
                  Lat: {clickedData.lat.toFixed(4)}, Lon: {clickedData.lon.toFixed(4)}
                </span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">{clickedData.mainCondition}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
              {clickedData.temp}°C
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Humidity: {clickedData.humidity}%
            </div>
          </div>
        </div>

        {/* Hazard Predictions Row */}
        <div>
          <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-500 mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500" />
            <span>Hazard Predictions for {clickedData.state}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {clickedData.predictions.map((p) => (
              <div
                key={p.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-900 truncate max-w-[140px]">{p.name}</span>
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase"
                    style={{
                      color: p.color,
                      backgroundColor: `${p.color}15`,
                      border: `1px solid ${p.color}35`,
                    }}
                  >
                    {p.level}
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900 font-mono my-1">{p.value}</div>
                <p className="text-[11px] text-slate-600 leading-snug">{p.impact}</p>
                <div className="text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-200">
                  {p.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Alerts Row */}
        <div>
          <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-500 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Real-Time Government & CPCB Alerts</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {clickedData.alerts.map((a) => (
              <div
                key={a.id}
                className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                    {a.severity}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{a.timestamp}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{a.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">{a.message}</p>
                <div className="text-[10px] text-blue-600 font-mono font-semibold">
                  Source: {a.agency}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Atmospheric Disaster & Hazard Probability Index */}
        <div>
          <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-500 mb-3 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-600" />
            <span>Atmospheric Disaster & Hazard Probability Index ({clickedData.state})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {clickedData.probabilities.map((prob: any) => (
              <div key={prob.hazard} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <div className="text-[11px] font-bold text-slate-800 truncate mb-1">{prob.hazard}</div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-black font-mono" style={{ color: prob.color }}>
                    {prob.probability}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{prob.riskBand}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${prob.probability}%`, backgroundColor: prob.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Armed Forces & Medical Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Armed Forces & Rapid Action Units */}
          <div>
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-500 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Armed Forces & Rapid Action Units</span>
            </h3>
            <div className="space-y-2.5">
              {clickedData.armedForces.map((res: any) => (
                <div
                  key={res.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex justify-between items-center"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{res.name}</div>
                    <div className="text-[11px] text-slate-600">{res.capacity}</div>
                    <div className="text-[10px] font-mono text-emerald-700 mt-0.5 font-medium">
                      📍 {res.distance} • Hotline: {res.contact}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {res.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Local Hospitals & Medical Resources */}
          <div>
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-500 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-500" />
              <span>Dedicated Emergency Pulmonology & ICU Beds</span>
            </h3>
            <div className="space-y-2.5">
              {clickedData.localResources.map((res: any) => (
                <div
                  key={res.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex justify-between items-center"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{res.name}</div>
                    <div className="text-[11px] text-slate-600">{res.capacity}</div>
                    <div className="text-[10px] font-mono text-rose-600 mt-0.5 font-medium">
                      📍 {res.distance} • Desk: {res.contact}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {res.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* State Emergency Helplines */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-500 mb-3 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-blue-600" />
            <span>Official Emergency Helplines ({clickedData.state})</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {clickedData.helplines.map((h: any) => (
              <a
                key={h.title}
                href={`tel:${h.number.replace(/[^0-9]/g, "")}`}
                className="bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-2xl p-3.5 transition-colors group block"
              >
                <div className="text-[10px] text-slate-500 font-mono truncate">{h.type}</div>
                <div className="text-lg font-black text-slate-900 font-mono my-0.5 group-hover:text-blue-600 transition-colors">
                  {h.number}
                </div>
                <div className="text-[10px] text-slate-600 truncate font-medium">{h.title}</div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ================= 4. STATION 7-DAY HOURLY TRAJECTORY CHART ================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>7-Day Hourly Trajectory for {selectedStation}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              LightGBM Quantile Forecast: Median with 80% Uncertainty Range [10th - 90th percentile]
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-red-500 rounded-full" />
              <span className="text-slate-700">Median PM2.5</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-purple-100 border border-purple-300 rounded-sm" />
              <span className="text-slate-500">80% Confidence Band</span>
            </div>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPmMedian" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPmBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <XAxis dataKey="displayTime" stroke="#94a3b8" fontSize={11} interval={16} />
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
              <ReferenceLine y={60} stroke="#16a34a" strokeDasharray="3 3" label="CPCB Safe (60)" />
              <ReferenceLine y={250} stroke="#dc2626" strokeDasharray="3 3" label="Severe (250)" />
              <Area
                type="monotone"
                dataKey="high"
                stroke="transparent"
                fill="url(#colorPmBand)"
                name="80% Upper Bound"
              />
              <Area
                type="monotone"
                dataKey="median"
                stroke="#ef4444"
                strokeWidth={2.5}
                fill="url(#colorPmMedian)"
                name="Median PM2.5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
