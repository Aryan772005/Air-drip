"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  TrendingUp,
  ShieldCheck,
  Sliders,
  HeartPulse,
  Info,
  Wind,
  Layers,
  Activity,
  Trophy,
  Menu,
  X,
  ChevronRight,
  Flame,
  Zap,
} from "lucide-react";

import NikeHeroSection from "@/components/NikeHeroSection";
import AqiInPollutantGrid from "@/components/AqiInPollutantGrid";
import AqiInRankingsTable from "@/components/AqiInRankingsTable";
import AqiInHealthSection from "@/components/AqiInHealthSection";
import LanguageToggle from "@/components/LanguageToggle";

import ForecastMapTab from "@/components/ForecastMapTab";
import PastDiwalisTab from "@/components/PastDiwalisTab";
import ModelTrustTab from "@/components/ModelTrustTab";
import WhatIfTab from "@/components/WhatIfTab";
import HealthTab from "@/components/HealthTab";
import AboutTab from "@/components/AboutTab";
import LiveWeatherWidget from "@/components/LiveWeatherWidget";
import ChatWidget from "@/components/ChatWidget";

import forecastDataRaw from "@/data/forecastData.json";
import stationCoordsRaw from "@/data/stationCoords.json";
import { ForecastRecord, StationCoord } from "@/lib/types";
import { Language, translations } from "@/lib/translations";
import { getCappedAqiDisplay, getAqiCategory } from "@/lib/aqi";

const forecastData = forecastDataRaw as ForecastRecord[];
const stationCoords = stationCoordsRaw as StationCoord[];

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("forecast");
  const [selectedStation, setSelectedStation] = useState<string>("Delhi - Anand Vihar");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>("en");
  const [chatContext, setChatContext] = useState<{ city: string; lat?: number; lon?: number }>({ city: selectedStation.replace(/^Delhi - /, "") });

  // Load persisted language from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hawa_lang") as Language;
      if (saved === "en" || saved === "hi") {
        setLanguage(saved);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Dynamic navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const t = translations[language];

  // Current station telemetry
  const currentStationRecords = forecastData.filter((d) => d.Station === selectedStation);
  const diwaliPeak =
    currentStationRecords.find((d) => d.Datetime.startsWith("2026-11-08 22:00")) ||
    currentStationRecords[0];

  const currentPM25 = diwaliPeak ? Math.round(diwaliPeak["PM2.5_Median"]) : 680;
  const currentTemp = diwaliPeak ? Math.round(diwaliPeak.Temperature) : 21;
  const currentHumidity = diwaliPeak ? Math.round(diwaliPeak.Humidity) : 74;
  const currentWind = diwaliPeak ? diwaliPeak.Wind_Speed : 0.9;

  const aqiInfo = getCappedAqiDisplay(currentPM25);
  const { name: aqiCategoryName } = getAqiCategory(currentPM25);

  const dashboardTabs = [
    { id: "forecast", label: "Interactive Map & Heatmap", shortLabel: "Map", icon: MapPin },
    { id: "rankings", label: "City & Station Leaderboard", shortLabel: "Rankings", icon: Trophy },
    { id: "health", label: "Health Protection Matrix", shortLabel: "Health", icon: HeartPulse },
    { id: "whatif", label: "What-If Policy Simulator", shortLabel: "What-If", icon: Sliders },
    { id: "past", label: "Past Diwalis (2015-2024)", shortLabel: "Past", icon: TrendingUp },
    { id: "trust", label: "Model Trust & Validation", shortLabel: "Trust", icon: ShieldCheck },
    { id: "about", label: "Architecture & Methodology", shortLabel: "About", icon: Info },
  ];

  const handleSelectTabFromDrawer = (tabId: string) => {
    setActiveTab(tabId);
    setIsDrawerOpen(false);

    const dashboardElem = document.getElementById("dashboard-section");
    if (dashboardElem) {
      dashboardElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20 selection:bg-blue-600 selection:text-white">
      {/* ================= COMPACT FLOATING NAVBAR (DYNAMIC TRANSPARENT -> WHITE ON SCROLL) ================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-[2000] transition-all duration-300 ${
          hasScrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm text-slate-900"
            : "bg-black/30 backdrop-blur-md border-b border-white/10 text-white"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md text-white shrink-0">
              <Wind className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-black tracking-tight font-mono uppercase">
                {language === "hi" ? "एयर ड्रिप" : "AIR DRIP"} //{" "}
                <span className={hasScrolled ? "text-blue-600" : "text-yellow-400"}>
                  {language === "hi" ? "दिवाली-AQI" : "DIWALI-AQI"}
                </span>
              </span>
              {/* Honest Location Badge */}
              <span
                className={`text-[9px] sm:text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold hidden xs:inline ${
                  hasScrolled
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-white/15 text-white/95 border border-white/25"
                }`}
                title={`Data for ${selectedStation}`}
              >
                📍 {selectedStation.replace("Delhi - ", "")}
              </span>
            </div>
          </div>

          {/* Center: Minimal Live Station Peak Indicator with CPCB AQI */}
          <div
            className={`hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono transition-all ${
              hasScrolled
                ? "bg-slate-100 border border-slate-200 text-slate-700"
                : "bg-black/40 border border-white/20 text-white/90 backdrop-blur-sm"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="opacity-70">{language === "hi" ? "स्टेशन:" : "Station:"}</span>
            <span className="font-bold">{selectedStation}</span>
            <span className="opacity-50">•</span>
            <span className="font-bold text-red-500">
              AQI {aqiInfo.exactAqi} ({aqiCategoryName})
            </span>
          </div>

          {/* Right: Language Toggle & Hamburger Menu Button */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <LanguageToggle
              language={language}
              onLanguageChange={(l) => setLanguage(l)}
              className={hasScrolled ? "!bg-slate-100 !border-slate-200" : ""}
            />

            <button
              onClick={() => setIsDrawerOpen(true)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-2xl transition-all shadow-md text-xs font-bold ${
                hasScrolled
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/30"
              }`}
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-4 h-4" />
              <span>{language === "hi" ? "मेन्यू" : "Menu"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= SLIDE-OUT HAMBURGER DRAWER SIDEBAR ================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[3000] flex justify-end">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          />

          {/* Slide-in drawer container */}
          <div className="relative w-80 sm:w-96 bg-white h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto z-10 animate-slide-in-right">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm font-mono uppercase">
                      Air Drip Dashboard
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">Diwali Air Quality Predictor</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language Selection inside Drawer */}
              <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {language === "hi" ? "भाषा चुनें" : "Select Language"}:
                </span>
                <LanguageToggle
                  language={language}
                  onLanguageChange={(l) => setLanguage(l)}
                  className="!bg-white !border-slate-300"
                />
              </div>

              {/* Station Quick Selector in Drawer */}
              <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {language === "hi" ? "सक्रिय स्टेशन चुनें" : "Select Active Station"}
                </div>
                <select
                  value={selectedStation}
                  onChange={(e) => { setSelectedStation(e.target.value); setChatContext({ city: e.target.value.replace(/^Delhi - /, "") }); }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <optgroup label={language === "hi" ? "दिल्ली एनसीआर (10 स्टेशन)" : "Delhi NCR (10 Stations)"}>
                    {stationCoords
                      .filter((s) => s.Region === "Delhi NCR")
                      .map((st) => (
                        <option key={st.Station} value={st.Station}>
                          {st.Station}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label={language === "hi" ? "अन्य प्रमुख मेट्रो (12 शहर)" : "Major Indian Metros (12 Cities)"}>
                    {stationCoords
                      .filter((s) => s.Region !== "Delhi NCR")
                      .map((st) => (
                        <option key={st.Station} value={st.Station}>
                          {st.Station} ({st.Region})
                        </option>
                      ))}
                  </optgroup>
                </select>
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-600 mt-2.5 pt-2 border-t border-slate-200/60">
                  <span>{language === "hi" ? "वायु गुणवत्ता स्थिति:" : "Air Quality Status:"}</span>
                  <span className="font-bold text-red-600">
                    AQI {aqiInfo.exactAqi} ({aqiCategoryName})
                  </span>
                </div>
              </div>

              {/* Navigation Links inside Drawer */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                  Dashboard Modules
                </div>

                {dashboardTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectTabFromDrawer(tab.id)}
                      className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer Information */}
            <div className="pt-6 border-t border-slate-100 mt-6 text-xs text-slate-400 font-mono space-y-1">
              <p className="font-semibold text-slate-700">CPCB Standards & Open-Meteo API</p>
              <p className="text-[11px]">LightGBM Quantile ML • 80% Confidence Interval</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= HERO SECTION (TRUE 100% FULL SCREEN EDGE-TO-EDGE, NO GAPS) ================= */}
      <section className="w-full m-0 p-0 overflow-hidden">
        <NikeHeroSection
          currentStation={selectedStation}
          onStationChange={(st) => { setSelectedStation(st); setChatContext({ city: st.replace(/^Delhi - /, "") }); }}
          language={language}
          onExploreMap={() => {
            setActiveTab("forecast");
            document.getElementById("dashboard-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          onExploreHealth={() => {
            const adviceElem = document.getElementById("health-advice-section");
            if (adviceElem) {
              adviceElem.scrollIntoView({ behavior: "smooth" });
            } else {
              setActiveTab("health");
              document.getElementById("dashboard-section")?.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />
      </section>

      {/* ================= WHITE UI BODY CONTAINER ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 space-y-12">
        {/* ================= SECTION 2: LIVE METEOROLOGY STRIP ================= */}
        <section>
          <LiveWeatherWidget />
        </section>

        {/* ================= SECTION 3: POLLUTANT BREAKDOWN GRID ================= */}
        <section>
          <AqiInPollutantGrid
            pm25={currentPM25}
            temperature={currentTemp}
            humidity={currentHumidity}
            windSpeed={currentWind}
            stationName={selectedStation}
          />
        </section>

        {/* ================= SECTION 4: MAIN DASHBOARD TABS SECTION ================= */}
        <section id="dashboard-section" className="border-t border-slate-200 pt-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase font-mono flex items-center gap-2">
                <span>{dashboardTabs.find((t) => t.id === activeTab)?.label}</span>
              </h2>
            </div>

            {/* In-page Tab Switcher Pills (Horizontal scrolling on mobile) */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-2xl shadow-sm overflow-x-auto max-w-full text-xs">
              {dashboardTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {tab.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Tab Views in White Aesthetic */}
          <div className="transition-all duration-300">
            {activeTab === "forecast" && <ForecastMapTab onContextChange={setChatContext} />}
            {activeTab === "rankings" && (
              <AqiInRankingsTable
                selectedStation={selectedStation}
                onSelectStation={(st) => setSelectedStation(st)}
              />
            )}
            {activeTab === "health" && (
              <AqiInHealthSection pm25={currentPM25} stationName={selectedStation} />
            )}
            {activeTab === "whatif" && <WhatIfTab />}
            {activeTab === "past" && <PastDiwalisTab />}
            {activeTab === "trust" && <ModelTrustTab />}
            {activeTab === "about" && <AboutTab />}
          </div>
        </section>
      </main>

      {/* ================= CLEAN LIGHT FRONT PAGE FOOTER ================= */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 text-center text-xs text-slate-500 border-t border-slate-200 mt-24 space-y-3 font-mono">
        <div className="flex justify-center items-center gap-2 text-slate-800 font-bold">
          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Wind className="w-3.5 h-3.5" />
          </div>
          <span className="uppercase tracking-wider">Air Drip // Diwali Atmospheric Intelligence Platform</span>
        </div>
        <p className="text-slate-600 max-w-xl mx-auto leading-relaxed">
          Predicting extreme particulate inversions for Diwali 2026 across 22 monitoring stations in Delhi NCR
          and All-India Metros. LightGBM Quantile ML with 80% confidence interval bands.
        </p>
        <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 max-w-md mx-auto">
          Built with Next.js 14, TypeScript, Tailwind CSS, Leaflet & Open-Meteo Dual Telemetry
        </p>
      </footer>
      <ChatWidget context={chatContext} />
    </div>
  );
}
