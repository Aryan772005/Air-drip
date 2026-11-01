"use client";

import { useEffect, useState } from "react";
import { CloudSun, Wind, Droplets, Gauge, ShieldCheck, RefreshCw } from "lucide-react";

interface WeatherData {
  city: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  description: string;
  source: string;
}

export default function LiveWeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiKeyStatus, setApiKeyStatus] = useState<string>("Open-Meteo Live");

  const fetchLiveWeather = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.21&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure&timezone=Asia%2FKolkata"
      );
      const data = await resp.json();
      setWeather({
        city: "Delhi NCR",
        temp: Math.round(data.current.temperature_2m * 10) / 10,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m * 10) / 10,
        pressure: Math.round(data.current.surface_pressure),
        description: "Surface Calm & Inversion",
        source: "Open-Meteo Dual Engine",
      });
      setApiKeyStatus("Open-Meteo Live");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveWeather();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm">Live Ambient Meteorology</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                <ShieldCheck className="w-3 h-3" /> {apiKeyStatus}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Open-Meteo Dual Telemetry</span>
            </div>
          </div>
        </div>
        <button
          onClick={fetchLiveWeather}
          className="text-xs text-slate-500 hover:text-slate-900 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
          title="Refresh live weather"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {weather ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium">Temperature</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{weather.temp}°C</div>
            <div className="text-[11px] text-slate-500 capitalize mt-0.5">{weather.description}</div>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>Humidity</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{weather.humidity}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Aerosol trapping risk</div>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-teal-600" />
              <span>Wind Speed</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{weather.windSpeed} km/h</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
              {weather.windSpeed < 6 ? "Calm / Inversion risk" : "Active ventilation"}
            </div>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-purple-600" />
              <span>Surface Pressure</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{weather.pressure} hPa</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Boundary stability</div>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-slate-400">Connecting to telemetry network...</div>
      )}
    </div>
  );
}
