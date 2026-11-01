"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowRight,
  Zap,
  MapPin,
  ChevronDown,
  Search,
  Building,
  Flame,
} from "lucide-react";
import forecastDataRaw from "@/data/forecastData.json";
import stationCoordsRaw from "@/data/stationCoords.json";
import { ForecastRecord, StationCoord } from "@/lib/types";
import { Language, translations } from "@/lib/translations";
import { getCappedAqiDisplay, calculateCpcbAqi } from "@/lib/aqi";

import VerdictCard from "./VerdictCard";
import CigaretteCard from "./CigaretteCard";
import RealTemperatureCard from "./RealTemperatureCard";
import HealthAdvice from "./HealthAdvice";
import ForecastRow, { DayForecastItem } from "./ForecastRow";

const forecastData = forecastDataRaw as ForecastRecord[];
const stationCoords = stationCoordsRaw as StationCoord[];

interface NikeHeroSectionProps {
  currentStation: string;
  onStationChange: (station: string) => void;
  onExploreMap: () => void;
  onExploreHealth: () => void;
  language?: Language;
}

export default function NikeHeroSection({
  currentStation,
  onStationChange,
  onExploreMap,
  onExploreHealth,
  language = "en",
}: NikeHeroSectionProps) {
  const [selectedStation, setSelectedStation] = useState<string>(currentStation);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(3); // Default to Day 3 (Diwali Night)
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const t = translations[language];

  // Sync external station change
  React.useEffect(() => {
    setSelectedStation(currentStation);
  }, [currentStation]);

  const handleSelectStation = (st: string) => {
    setSelectedStation(st);
    onStationChange(st);
    setIsDropdownOpen(false);
  };

  // Extract real weekly records for the selected station
  const stationWeekRecords = useMemo(() => {
    return forecastData.filter((d) => d.Station === selectedStation);
  }, [selectedStation]);

  // Dynamically calculate the 7 daily forecast peak metrics from forecastData.json
  const daysList: DayForecastItem[] = useMemo(() => {
    const dates = [
      { dateStr: "2026-11-05", dayName: "Monday", label: "Nov 5" },
      { dateStr: "2026-11-06", dayName: "Tuesday", label: "Nov 6" },
      { dateStr: "2026-11-07", dayName: "Wednesday", label: "Nov 7" },
      { dateStr: "2026-11-08", dayName: "Thursday", label: "Diwali" },
      { dateStr: "2026-11-09", dayName: "Friday", label: "Nov 9" },
      { dateStr: "2026-11-10", dayName: "Saturday", label: "Nov 10" },
      { dateStr: "2026-11-11", dayName: "Sunday", label: "Nov 11" },
    ];

    return dates.map((d, index) => {
      const dayRecords = stationWeekRecords.filter((r) => r.Datetime.startsWith(d.dateStr));

      let targetRow = dayRecords.find((r) => r.Datetime.includes("22:00:00"));
      if (!targetRow && dayRecords.length > 0) {
        targetRow = dayRecords.reduce((max, r) => (r["PM2.5_Median"] > max["PM2.5_Median"] ? r : max));
      }

      const isDiwali = index === 3;
      const pm25 = targetRow ? Math.round(targetRow["PM2.5_Median"]) : isDiwali ? 580 : 210;
      const temp = targetRow ? Math.round(targetRow.Temperature) : 22;
      const humidity = targetRow ? Math.round(targetRow.Humidity) : 72;
      const windSpeed = targetRow ? targetRow.Wind_Speed : 1.2;
      const aqiCat = targetRow?.AQI_Category || (pm25 > 250 ? "Severe" : pm25 > 120 ? "Very Poor" : "Moderate");

      return {
        date: d.dateStr,
        dayName: d.dayName,
        label: d.label,
        val: pm25,
        temp,
        humidity,
        windSpeed,
        aqiCat,
        isDiwali,
      };
    });
  }, [stationWeekRecords]);

  const activeDay = daysList[selectedDayIndex] || daysList[3];
  const cappedAqi = getCappedAqiDisplay(activeDay.val);

  // Group stations for honest location dropdown
  const delhiStations = useMemo(() => {
    return stationCoords.filter(
      (s) =>
        s.Region === "Delhi NCR" &&
        s.Station.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const otherMetroStations = useMemo(() => {
    return stationCoords.filter(
      (s) =>
        s.Region !== "Delhi NCR" &&
        s.Station.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Featured Hotspot Cards with plain-language, non-jargon explanations
  const featuredHotspots = [
    {
      station: "Delhi - Anand Vihar",
      tag: language === "hi" ? "सर्वाधिक प्रदूषण" : "HIGHEST SMOG ZONE",
      pm25: 738,
      aqi: "AQI 500+ · SEVERE",
      color: "#780000",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
      caption:
        language === "hi"
          ? "बस टर्मिनल और घनी आबादी के कारण यहां दिवाली की रात धुआं सबसे ज्यादा जमता है।"
          : "Heavy highway bus traffic and fireworks create the highest smoke accumulation here.",
    },
    {
      station: "Delhi - Punjabi Bagh",
      tag: language === "hi" ? "औद्योगिक क्षेत्र" : "COMMERCIAL & RESIDENTIAL",
      pm25: 680,
      aqi: "AQI 465 · SEVERE",
      color: "#ef4444",
      image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
      caption:
        language === "hi"
          ? "कम हवा चलने की वजह से रात के समय पटाखों का धुआं कई घंटों तक फंसा रहता है।"
          : "Very low wind speeds prevent smoke from escaping, keeping air unsafe overnight.",
    },
    {
      station: "Mumbai",
      tag: language === "hi" ? "तटीय इलाका" : "COASTAL METRO",
      pm25: 185,
      aqi: "AQI 185 · MODERATE",
      color: "#0284c7",
      image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
      caption:
        language === "hi"
          ? "समुद्री हवाओं के कारण दिल्ली की तुलना में यहां धुआं तेजी से साफ होता है।"
          : "Sea breeze helps disperse smoke faster compared to the landlocked northern plains.",
    },
    {
      station: "Kolkata",
      tag: language === "hi" ? "नदी घाटी" : "RIVER BASIN",
      pm25: 295,
      aqi: "AQI 320 · VERY POOR",
      color: "#7c3aed",
      image: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
      caption:
        language === "hi"
          ? "सर्दियों की नमी और पटाखों का धुआं मिलकर गहरी धुंध पैदा करते हैं।"
          : "Winter moisture combines with fireworks smoke to create thick, lingering smog.",
    },
  ];

  return (
    <div className="w-full">
      {/* ================= 1. TRUE FULL-SCREEN HERO LANDING SECTION ================= */}
      <div className="relative w-full h-screen min-h-[560px] h-[100dvh] overflow-hidden bg-black m-0 p-0">
        {/* Full-Screen Thunder Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/hero_storm.webp"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none filter brightness-[0.88] contrast-[1.10]"
          style={{ minWidth: "100%", minHeight: "100%", objectFit: "cover" }}
        >
          <source src="/hero_thunder.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Cinematic gradient overlays for contrast & legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent pointer-events-none" />

        {/* Main Hero Content: Clean Flex Container */}
        <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex flex-col justify-end pt-20 pb-12 sm:pb-16 md:pb-20">
          {/* Top Row: Stream Indicator Pill */}
          <div className="absolute top-20 sm:top-24 right-4 sm:right-8 md:right-12 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-mono text-white/90">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.liveStream}</span>
          </div>

          {/* Kicker Tag */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
            <span className="text-[11px] sm:text-xs md:text-sm font-black font-mono tracking-widest text-yellow-400 uppercase">
              {t.brandTitle}
            </span>
          </div>

          {/* Giant Headline */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-white uppercase leading-[0.92] drop-shadow-2xl">
            {language === "hi" ? (
              <>
                हवा को पहचानें। <br />
                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  धुएं से पहले।
                </span>
              </>
            ) : (
              <>
                FEEL THE AIR. <br />
                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  BEFORE THE SMOG.
                </span>
              </>
            )}
          </h1>

          {/* Sub-headline */}
          <p className="text-xs sm:text-sm md:text-base text-slate-200/90 font-normal max-w-2xl mt-3 sm:mt-4 leading-relaxed drop-shadow">
            {language === "hi"
              ? "भारतीय परिवारों के लिए सरल और सटीक वायु गुणवत्ता पूर्वानुमान। बाहर निकलने से पहले प्रदूषण का स्तर जानें और स्वास्थ्य की सुरक्षा करें।"
              : "Clear, actionable air quality guide for families. Know pollution levels before stepping out, with easy steps to protect children and elders."}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-5 sm:mt-6">
            <button
              onClick={onExploreMap}
              className="px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-white text-slate-900 font-black text-xs sm:text-sm tracking-wide uppercase hover:bg-slate-100 transition-all flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95"
            >
              <span>{t.exploreMap}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreHealth}
              className="px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold text-xs sm:text-sm tracking-wide uppercase hover:bg-white hover:text-slate-900 transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              <span>{t.healthDefense}</span>
            </button>

            {/* Honest CPCB Status Pill */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-300 border-l border-white/20 pl-4 py-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>
                AQI {cappedAqi.exactAqi} ({activeDay.aqiCat}) • {selectedStation}
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5 text-white/70 text-[10px] font-mono tracking-widest uppercase animate-bounce pointer-events-none">
          <span>{t.scrollExplore}</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* ================= 2. REFACTORED CITIZEN AMBIENT CONSOLE (WHITE BG) ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-8 sm:space-y-12">
        {/* Station Selector Bar with Honest Location Labeling */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                {t.selectStation}
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>{selectedStation}</span>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold hidden sm:inline">
                  {selectedStation.includes("Delhi") ? "Delhi NCR" : "Major Metro"}
                </span>
              </div>
            </div>
          </div>

          {/* Station Dropdown Trigger */}
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-400 text-xs sm:text-sm font-bold text-slate-800 shadow-sm transition"
            >
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span>{language === "hi" ? "स्टेशन बदलें" : "Change Station / City"}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-12 w-full sm:w-96 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xl z-50 animate-fade-in">
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={language === "hi" ? "स्टेशन या शहर खोजें..." : "Search Indian station or city..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 w-full font-mono focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div className="max-h-72 overflow-y-auto space-y-3 p-1">
                  {/* Delhi NCR Group */}
                  {delhiStations.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 py-1 bg-slate-50 rounded-lg mb-1">
                        {t.delhiNCR}
                      </div>
                      <div className="space-y-0.5">
                        {delhiStations.map((s) => (
                          <button
                            key={s.Station}
                            type="button"
                            onClick={() => handleSelectStation(s.Station)}
                            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex justify-between items-center transition ${
                              s.Station === selectedStation
                                ? "bg-blue-600 text-white font-bold"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span>{s.Station}</span>
                            <span className="text-[10px] opacity-75 font-mono">NCR</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Metros Group */}
                  {otherMetroStations.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 py-1 bg-slate-50 rounded-lg mb-1">
                        {t.otherMetros}
                      </div>
                      <div className="space-y-0.5">
                        {otherMetroStations.map((s) => (
                          <button
                            key={s.Station}
                            type="button"
                            onClick={() => handleSelectStation(s.Station)}
                            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex justify-between items-center transition ${
                              s.Station === selectedStation
                                ? "bg-blue-600 text-white font-bold"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span>{s.Station}</span>
                            <span className="text-[10px] opacity-75 font-mono">Metro</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1. Verdict First, Numbers Second (VerdictCard) */}
        <div>
          <VerdictCard
            pm25={activeDay.val}
            station={selectedStation}
            isDiwali={activeDay.isDiwali}
            language={language}
          />
        </div>

        {/* 2. Side-by-Side Cards: Cigarette Equivalent + Real Temperature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cigarette Equivalent Card */}
          <CigaretteCard pm25={activeDay.val} language={language} />

          {/* Dedicated Real Temperature Card (strictly separated from pollution) */}
          <RealTemperatureCard
            temperature={activeDay.temp}
            humidity={activeDay.humidity}
            windSpeed={activeDay.windSpeed}
            city={selectedStation}
            language={language}
          />
        </div>

        {/* 3. Actionable Health Advice: What Should I Do? */}
        <div id="health-advice-section">
          <HealthAdvice pm25={activeDay.val} language={language} />
        </div>

        {/* 4. 7-Day Forecast Row (Zero degree symbol, AQI number, color chip under each day) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <ForecastRow
            days={daysList}
            selectedIndex={selectedDayIndex}
            onSelectIndex={(idx) => setSelectedDayIndex(idx)}
            language={language}
          />
        </div>

        {/* 5. Critical Pollution Hotspots (Ground Zero) */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6 px-1">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">
                {language === "hi" ? "प्रमुख प्रदूषण हॉटस्पॉट" : "CRITICAL SMOG HOTSPOTS // LIVE COMPARISON"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 mt-1">
                {language === "hi"
                  ? "दिवाली ग्राउंड जीरो: सबसे ज्यादा प्रभावित क्षेत्र"
                  : "GROUND ZERO: THE DIWALI HOTSPOTS"}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {language === "hi" ? "क्लिक करके डेटा देखें" : "Click any hotspot to focus simulation"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredHotspots.map((spot) => (
              <div
                key={spot.station}
                onClick={() => handleSelectStation(spot.station)}
                className="group relative rounded-3xl overflow-hidden border border-slate-200 bg-white cursor-pointer shadow-md hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Photo Container */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden">
                  <img
                    src={spot.image}
                    alt={spot.station}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                      {spot.tag}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: spot.color }}
                    />
                  </div>

                  {/* Bottom Overlay Info */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {spot.aqi}
                    </div>
                    <div className="text-[11px] font-mono text-slate-300">
                      PM2.5: {spot.pm25} µg/m³
                    </div>
                  </div>
                </div>

                {/* Card Footer Text */}
                <div className="p-4 bg-white">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                    {spot.station}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {spot.caption}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-blue-600 font-semibold">
                    <span>{language === "hi" ? "स्टेशन चुनें" : "Inspect Station"}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
