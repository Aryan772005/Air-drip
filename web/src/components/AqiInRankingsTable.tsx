"use client";

import React, { useState, useMemo } from "react";
import {
  Trophy,
  Search,
  Filter,
  ArrowUpDown,
  Flame,
  ShieldCheck,
  TrendingUp,
  MapPin,
} from "lucide-react";
import forecastDataRaw from "@/data/forecastData.json";
import stationCoordsRaw from "@/data/stationCoords.json";
import { ForecastRecord, StationCoord } from "@/lib/types";

const forecastData = forecastDataRaw as ForecastRecord[];
const stationCoords = stationCoordsRaw as StationCoord[];

interface AqiInRankingsTableProps {
  onSelectStation: (station: string) => void;
  selectedStation: string;
}

export default function AqiInRankingsTable({
  onSelectStation,
  selectedStation,
}: AqiInRankingsTableProps) {
  const [filterRegion, setFilterRegion] = useState<"all" | "delhi" | "india">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const rankedStations = useMemo(() => {
    const list = stationCoords.map((st) => {
      const records = forecastData.filter((d) => d.Station === st.Station);

      const diwaliRecords = records.filter((r) => r.Datetime.startsWith("2026-11-08"));
      const peakRow =
        diwaliRecords.length > 0
          ? diwaliRecords.reduce((max, r) => (r["PM2.5_Median"] > max["PM2.5_Median"] ? r : max))
          : records[0];

      const pm25 = peakRow ? Math.round(peakRow["PM2.5_Median"]) : 250;
      const aqi = Math.min(500, Math.round(pm25 * 0.72 + 50));
      const aqiCat = peakRow?.AQI_Category || (pm25 > 250 ? "Severe" : "Very Poor");

      return {
        station: st.Station,
        region: st.Region === "Delhi NCR" ? "Delhi NCR" : "All-India Metro",
        locality: st.Locality,
        pm25,
        aqi,
        category: aqiCat,
        isDelhi: st.Region === "Delhi NCR",
      };
    });

    let filtered = list;
    if (filterRegion === "delhi") {
      filtered = list.filter((s) => s.isDelhi);
    } else if (filterRegion === "india") {
      filtered = list.filter((s) => !s.isDelhi);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.locality.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) =>
      sortOrder === "desc" ? b.pm25 - a.pm25 : a.pm25 - b.pm25
    );
  }, [filterRegion, searchTerm, sortOrder]);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "Severe":
        return "bg-red-50 text-red-600 border-red-200";
      case "Very Poor":
        return "bg-rose-50 text-rose-600 border-rose-200";
      case "Poor":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "Moderate":
        return "bg-amber-50 text-amber-600 border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
    }
  };

  return (
    <div className="w-full my-6 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Air Quality Leaderboard // 22 Indian Stations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            Ranked by predicted peak PM2.5 concentration on Diwali Night (Nov 8, 2026, 22:00 IST)
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Region Filter Buttons */}
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-2xl shadow-sm text-xs font-mono">
            <button
              onClick={() => setFilterRegion("all")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterRegion === "all" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All (22)
            </button>
            <button
              onClick={() => setFilterRegion("delhi")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterRegion === "delhi" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Delhi NCR (10)
            </button>
            <button
              onClick={() => setFilterRegion("india")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterRegion === "india" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All-India Metros (12)
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search station or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-48 sm:w-60 font-mono shadow-sm"
            />
          </div>

          {/* Sort Button */}
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-sm"
            title="Toggle Sort Order"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-14 text-center">Rank</th>
                <th className="py-3.5 px-4">Station / Neighborhood</th>
                <th className="py-3.5 px-4">Region</th>
                <th className="py-3.5 px-4 text-center">AQI Category</th>
                <th className="py-3.5 px-4 text-right">Predicted PM2.5</th>
                <th className="py-3.5 px-4 text-right">CPCB AQI</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {rankedStations.map((item, index) => {
                const isSelected = item.station === selectedStation;
                const isTop3 = index < 3 && sortOrder === "desc";

                return (
                  <tr
                    key={item.station}
                    onClick={() => onSelectStation(item.station)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 border-l-4 border-l-blue-600"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center font-bold">
                      {isTop3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-extrabold border border-red-200">
                          {index + 1}
                        </span>
                      ) : (
                        <span className="text-slate-400">#{index + 1}</span>
                      )}
                    </td>

                    {/* Station Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="font-sans text-sm">{item.station}</span>
                      {isTop3 && <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                    </td>

                    {/* Region */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{item.region}</td>

                    {/* AQI Category Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getCategoryBadge(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </td>

                    {/* Predicted PM2.5 */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-black text-slate-900 text-sm">{item.pm25}</span>
                      <span className="text-[10px] text-slate-400 ml-1">µg/m³</span>
                    </td>

                    {/* CPCB AQI */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-extrabold text-amber-600 text-sm">{item.aqi}</span>
                    </td>

                    {/* Select Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStation(item.station);
                        }}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? "Active" : "Inspect"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
