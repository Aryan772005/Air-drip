"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AQI_LEVELS } from "@/lib/aqi";
import {
  getWeatherIconFromCode,
  getWeatherConditionFromCode,
  findNearestState,
  getStateHelplines,
  generateDataForLocation,
  getDisasterProbabilities,
} from "@/lib/disasterEmergency";
import { Layers, Crosshair, Map as MapIcon, Globe, Compass } from "lucide-react";

export interface ClickedLocationData {
  lat: number;
  lon: number;
  name: string;
  state: string;
  temp: number;
  humidity: number;
  weatherCode: number;
  iconChar: string;
  mainCondition: string;
  predictions: any[];
  alerts: any[];
  armedForces: any[];
  localResources: any[];
  probabilities: any[];
  helplines: any[];
}

interface MapProps {
  stations: any[];
  selectedStation: string;
  onSelectStation: (name: string) => void;
  showIdw: boolean;
  regionFilter?: "all" | "delhi" | "india";
  onLocationClick?: (data: ClickedLocationData) => void;
}

export default function MapComponent({
  stations,
  selectedStation,
  onSelectStation,
  showIdw,
  regionFilter = "all",
  onLocationClick,
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const idwLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);
  const onLocationClickRef = useRef(onLocationClick);

  useEffect(() => {
    onLocationClickRef.current = onLocationClick;
  }, [onLocationClick]);

  const [mapStyle, setMapStyle] = useState<"dark" | "light" | "satellite" | "streets">("dark");
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);

  // Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const tileGroup = L.layerGroup().addTo(map);
    const idwGroup = L.layerGroup().addTo(map);
    const markerGroup = L.layerGroup().addTo(map);

    tileLayerGroupRef.current = tileGroup;
    idwLayerGroupRef.current = idwGroup;
    markerLayerGroupRef.current = markerGroup;
    mapInstanceRef.current = map;

    // Handle auto-resize on screen / orientation change
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);
    setTimeout(handleResize, 250);

    // Map click handler
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      try {
        let locationName = "Selected Coordinates";
        let stateName = findNearestState(lat, lon);

        try {
          const revResp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
          );
          if (revResp.ok) {
            const revData = await revResp.json();
            const city =
              revData.address?.city ||
              revData.address?.town ||
              revData.address?.village ||
              revData.address?.suburb ||
              revData.address?.county ||
              "Selected Area";
            stateName = revData.address?.state || stateName;
            locationName = `${city}, ${stateName}`;
          }
        } catch (err) {
          console.warn("Reverse geocode fallback to state prediction:", err);
        }

        let temp = 22;
        let humidity = 68;
        let weatherCode = 45;

        try {
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`;
          const weatherResp = await fetch(weatherUrl);
          if (weatherResp.ok) {
            const weatherData = await weatherResp.json();
            temp = Math.round(weatherData.current.temperature_2m);
            humidity = weatherData.current.relative_humidity_2m;
            weatherCode = weatherData.current.weather_code;
          }
        } catch (err) {
          console.warn("Weather fetch fallback:", err);
        }

        const iconChar = getWeatherIconFromCode(weatherCode);
        const mainCondition = getWeatherConditionFromCode(weatherCode);

        if (currentMarkerRef.current) {
          map.removeLayer(currentMarkerRef.current);
        }

        const customIcon = L.divIcon({
          className: "custom-map-marker",
          html: `
            <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
              <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(239,68,68,0.25); animation:glowPulse 2s infinite;"></div>
              <div style="font-size:28px; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.8)); transform:translate(0, -10px);">📍</div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 34],
        });

        const newMarker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
        currentMarkerRef.current = newMarker;

        map.flyTo([lat, lon], Math.max(map.getZoom(), 8), { duration: 1.2 });

        newMarker
          .bindPopup(
            `
            <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#0f172a; background:#ffffff; padding:12px; border-radius:12px; min-width:200px; max-width:240px; border:1px solid #e2e8f0; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
              <div style="font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:#2563eb; font-weight:700; margin-bottom:2px;">
                ${stateName} · Live Telemetry
              </div>
              <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:6px; line-height:1.2;">
                ${locationName}
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between; background:#f8fafc; padding:6px 8px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:6px;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-size:16px;">${iconChar}</span>
                  <span style="font-size:14px; font-weight:800; color:#0f172a;">${temp}°C</span>
                </div>
                <div style="font-size:10px; color:#64748b; font-family:monospace;">
                  Hum: <b>${humidity}%</b>
                </div>
              </div>
              <div style="font-size:10px; font-weight:600; color:#dc2626; background:#fef2f2; border:1px solid #fee2e2; padding:3px 6px; border-radius:6px; text-align:center;">
                ${mainCondition}
              </div>
            </div>
            `,
            { className: "custom-leaflet-popup", maxWidth: 260 }
          )
          .openPopup();

        const locationData = generateDataForLocation(stateName, mainCondition, lat, lon);
        const helplines = getStateHelplines(stateName);
        const probabilities = getDisasterProbabilities(stateName);

        if (onLocationClickRef.current) {
          onLocationClickRef.current({
            lat,
            lon,
            name: locationName,
            state: stateName,
            temp,
            humidity,
            weatherCode,
            iconChar,
            mainCondition,
            predictions: locationData.predictions,
            alerts: locationData.alerts,
            armedForces: locationData.armedForces,
            localResources: locationData.localResources,
            probabilities,
            helplines,
          });
        }
      } catch (err) {
        console.error("Map click handler error:", err);
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layers when mapStyle changes
  useEffect(() => {
    if (!tileLayerGroupRef.current) return;
    tileLayerGroupRef.current.clearLayers();

    if (mapStyle === "dark") {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 16, attribution: "Esri Dark Canvas" }
      ).addTo(tileLayerGroupRef.current);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 16, attribution: "" }
      ).addTo(tileLayerGroupRef.current);
    } else if (mapStyle === "light") {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 16, attribution: "Esri Light Canvas" }
      ).addTo(tileLayerGroupRef.current);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 16, attribution: "" }
      ).addTo(tileLayerGroupRef.current);
    } else if (mapStyle === "satellite") {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18, attribution: "Esri Satellite" }
      ).addTo(tileLayerGroupRef.current);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18, attribution: "" }
      ).addTo(tileLayerGroupRef.current);
    } else if (mapStyle === "streets") {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18, attribution: "Esri World Streets" }
      ).addTo(tileLayerGroupRef.current);
    }
  }, [mapStyle]);

  // Pan to selected station
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStation) return;
    const target = stations.find((s) => s.Station === selectedStation);
    if (target) {
      const zoom = target.Is_Delhi ? 11 : 8;
      mapInstanceRef.current.flyTo([target.Latitude, target.Longitude], zoom, {
        duration: 1.2,
      });
    }
  }, [selectedStation, stations]);

  // Handle region filter camera reset
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (regionFilter === "delhi") {
      mapInstanceRef.current.flyTo([28.6139, 77.209], 10, { duration: 1.2 });
    } else if (regionFilter === "india" || regionFilter === "all") {
      mapInstanceRef.current.flyTo([22.5937, 78.9629], 5, { duration: 1.2 });
    }
  }, [regionFilter]);

  // Render station markers and IDW spatial interpolation
  useEffect(() => {
    if (!mapInstanceRef.current || !markerLayerGroupRef.current || !idwLayerGroupRef.current) return;

    markerLayerGroupRef.current.clearLayers();
    idwLayerGroupRef.current.clearLayers();

    if (showIdw) {
      stations.forEach((st) => {
        const aqiInfo = AQI_LEVELS[st.AQI_Category] || AQI_LEVELS["Severe"];
        const outerRadius = st.Is_Delhi ? 6500 : 18000;
        const innerRadius = st.Is_Delhi ? 3200 : 9000;

        L.circle([st.Latitude, st.Longitude], {
          radius: outerRadius,
          fillColor: aqiInfo.color,
          fillOpacity: 0.12,
          stroke: false,
        }).addTo(idwLayerGroupRef.current!);

        L.circle([st.Latitude, st.Longitude], {
          radius: innerRadius,
          fillColor: aqiInfo.color,
          fillOpacity: 0.24,
          stroke: false,
        }).addTo(idwLayerGroupRef.current!);
      });
    }

    stations.forEach((st) => {
      const aqiInfo = AQI_LEVELS[st.AQI_Category] || AQI_LEVELS["Severe"];
      const isSelected = st.Station === selectedStation;
      const pm25 = Math.round(st["PM2.5_Median"] || 250);

      const markerHtml = `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
          ${
            isSelected
              ? `<div style="position:absolute; width:46px; height:46px; border-radius:50%; background:${aqiInfo.color}; opacity:0.35; animation:glowPulse 1.8s infinite;"></div>`
              : ""
          }
          <div style="
            width:${isSelected ? "34px" : "28px"};
            height:${isSelected ? "34px" : "28px"};
            border-radius:50%;
            background:${aqiInfo.color};
            border:${isSelected ? "3px solid #ffffff" : "2px solid #ffffff"};
            box-shadow:0 4px 12px rgba(0,0,0,0.3);
            display:flex;
            align-items:center;
            justify-content:center;
            color:#ffffff;
            font-size:${isSelected ? "11px" : "10px"};
            font-weight:900;
            font-family:monospace;
            transition:all 0.2s ease;
          ">
            ${pm25 > 999 ? "999+" : pm25}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-station-pin",
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([st.Latitude, st.Longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#0f172a; background:#ffffff; padding:12px; border-radius:12px; min-width:210px; max-width:240px; border:1px solid #e2e8f0;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
            <span style="font-size:10px; font-family:monospace; font-weight:800; color:#2563eb; text-transform:uppercase;">
              ${st.Region || (st.Is_Delhi ? "Delhi NCR" : "All-India")}
            </span>
            <span style="font-size:9px; font-weight:800; padding:2px 6px; border-radius:10px; background:${aqiInfo.color}; color:#fff; text-transform:uppercase;">
              ${st.AQI_Category}
            </span>
          </div>
          <h4 style="margin:0 0 6px; font-weight:800; font-size:14px; color:#0f172a;">
            ${st.Station}
          </h4>
          <div style="background:#f8fafc; padding:8px 10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <span style="font-size:11px; color:#64748b;">PM2.5 Forecast:</span>
              <span style="font-size:15px; font-weight:900; color:#0f172a;">${pm25} <span style="font-size:10px; font-weight:400; color:#64748b;">µg/m³</span></span>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#475569;">
            <span>Temp: <b>${Math.round(st.Temperature || 22)}°C</b></span>
            <span>Hum: <b>${Math.round(st.Humidity || 70)}%</b></span>
            <span>Wind: <b>${st.Wind_Speed || 1.2} m/s</b></span>
          </div>
          <div style="margin-top:8px; text-align:center;">
            <button style="width:100%; padding:6px 8px; border-radius:8px; background:#2563eb; color:#ffffff; font-size:11px; font-weight:700; border:none; cursor:pointer;" onclick="window.selectStationDirectly && window.selectStationDirectly('${st.Station}')">
              Select & Inspect Station
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 260 });

      marker.on("click", () => {
        onSelectStation(st.Station);
      });

      marker.addTo(markerLayerGroupRef.current!);
    });

    (window as any).selectStationDirectly = (name: string) => {
      onSelectStation(name);
    };
  }, [stations, selectedStation, showIdw, onSelectStation]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (regionFilter === "delhi") {
      mapInstanceRef.current.flyTo([28.6139, 77.209], 10, { duration: 1.2 });
    } else {
      mapInstanceRef.current.flyTo([22.5937, 78.9629], 5, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[560px] lg:h-[640px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left Floating Instruction Pill */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-[1000] max-w-[calc(100%-120px)] sm:max-w-none">
        <div className="bg-white/95 backdrop-blur-md px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl border border-slate-200 text-[11px] sm:text-xs text-slate-800 shadow-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
          <span className="truncate sm:whitespace-normal font-medium">
            Click <b>anywhere</b> on the map for live weather & emergency hazards
          </span>
        </div>
      </div>

      {/* Top Right Map Style & Recenter */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-[1000] flex items-center gap-1.5 sm:gap-2">
        <div className="relative">
          <button
            onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
            className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md hover:bg-slate-50 text-slate-800 px-3 py-1.5 sm:py-2 rounded-2xl border border-slate-200 shadow-md text-xs font-semibold transition"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="capitalize hidden sm:inline">{mapStyle} Layer</span>
          </button>

          {isStyleMenuOpen && (
            <div className="absolute right-0 top-11 w-48 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl z-50 space-y-1">
              <button
                onClick={() => {
                  setMapStyle("dark");
                  setIsStyleMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 font-medium transition ${
                  mapStyle === "dark" ? "bg-blue-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Dark Canvas (ESRI)</span>
              </button>
              <button
                onClick={() => {
                  setMapStyle("light");
                  setIsStyleMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 font-medium transition ${
                  mapStyle === "light" ? "bg-blue-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Light Canvas (ESRI)</span>
              </button>
              <button
                onClick={() => {
                  setMapStyle("satellite");
                  setIsStyleMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 font-medium transition ${
                  mapStyle === "satellite" ? "bg-blue-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Satellite Imagery</span>
              </button>
              <button
                onClick={() => {
                  setMapStyle("streets");
                  setIsStyleMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 font-medium transition ${
                  mapStyle === "streets" ? "bg-blue-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Street Map (ESRI)</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleRecenter}
          className="p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-md hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-md transition"
          title="Recenter Map View"
        >
          <Crosshair className="w-4 h-4 text-emerald-600" />
        </button>
      </div>

      {/* Bottom Floating AQI Scale Legend (Responsive) */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-[1000] bg-white/95 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-slate-200 shadow-md flex items-center gap-2 sm:gap-3 text-xs">
        <span className="font-mono text-[10px] sm:text-[11px] text-slate-500 uppercase font-bold tracking-wider">
          AQI:
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-mono">
          <span className="flex items-center gap-0.5 sm:gap-1 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#00B050]" /> 0-30
          </span>
          <span className="flex items-center gap-0.5 sm:gap-1 text-lime-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#92D050]" /> 31-60
          </span>
          <span className="flex items-center gap-0.5 sm:gap-1 text-amber-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#FFC000]" /> 61-90
          </span>
          <span className="hidden md:flex items-center gap-0.5 sm:gap-1 text-orange-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#FF7A00]" /> 91-120
          </span>
          <span className="hidden md:flex items-center gap-0.5 sm:gap-1 text-rose-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#FF0000]" /> 121-250
          </span>
          <span className="flex items-center gap-0.5 sm:gap-1 text-red-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#780000]" /> 250+ Severe
          </span>
        </div>
      </div>
    </div>
  );
}
