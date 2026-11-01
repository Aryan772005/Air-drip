export interface EmergencyHelpline {
  title: string;
  number: string;
  type: string;
  description: string;
}

export interface HazardPrediction {
  id: string;
  name: string;
  level: "Severe" | "High" | "Moderate" | "Low";
  color: string;
  value: string;
  impact: string;
  trend: string;
}

export interface RealTimeAlert {
  id: string;
  title: string;
  severity: "Emergency" | "Warning" | "Advisory";
  category: string;
  timestamp: string;
  agency: string;
  message: string;
}

export interface DisasterResource {
  id: string;
  name: string;
  unit: string;
  distance: string;
  contact: string;
  status: "Deployed" | "Standby" | "Active";
  capacity: string;
}

export interface DisasterProbability {
  hazard: string;
  probability: number; // 0 to 100
  color: string;
  riskBand: string;
}

export function getWeatherIconFromCode(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 55) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code >= 95 && code <= 99) return "⚡";
  return "☁️";
}

export function getWeatherConditionFromCode(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code <= 3) return "Partly Cloudy / Hazy";
  if (code === 45 || code === 48) return "Dense Smog & Radiational Fog";
  if (code >= 51 && code <= 55) return "Light Rain / Aerosol Scrubbing";
  if (code >= 61 && code <= 67) return "Moderate Rain / Downpour";
  if (code >= 71 && code <= 77) return "Cold Wave & High Pressure";
  if (code >= 80 && code <= 82) return "Precipitation Showers";
  if (code >= 95 && code <= 99) return "Severe Thunderstorms & Lightning";
  return "Cloudy Inversion Layer";
}

export function findNearestState(lat: number, lon: number): string {
  // Bounding box approximate identification for Indian states
  if (lat >= 28.3 && lat <= 28.9 && lon >= 76.8 && lon <= 77.4) return "Delhi NCR";
  if (lat >= 29.5 && lat <= 32.5 && lon >= 73.8 && lon <= 76.9) return "Punjab";
  if (lat >= 27.6 && lat <= 30.9 && lon >= 74.4 && lon <= 77.6) return "Haryana";
  if (lat >= 23.8 && lat <= 30.4 && lon >= 77.0 && lon <= 84.6) return "Uttar Pradesh";
  if (lat >= 15.6 && lat <= 22.0 && lon >= 72.6 && lon <= 80.9) return "Maharashtra";
  if (lat >= 21.5 && lat <= 27.2 && lon >= 85.8 && lon <= 89.9) return "West Bengal";
  if (lat >= 8.1 && lat <= 13.5 && lon >= 76.2 && lon <= 80.3) return "Tamil Nadu";
  if (lat >= 11.5 && lat <= 18.5 && lon >= 74.0 && lon <= 78.6) return "Karnataka";
  if (lat >= 15.8 && lat <= 19.9 && lon >= 77.2 && lon <= 81.8) return "Telangana";
  if (lat >= 20.1 && lat <= 24.7 && lon >= 68.1 && lon <= 74.5) return "Gujarat";
  if (lat >= 23.0 && lat <= 30.2 && lon >= 69.5 && lon <= 78.2) return "Rajasthan";
  if (lat >= 24.3 && lat <= 27.5 && lon >= 83.3 && lon <= 88.3) return "Bihar";
  return "Delhi NCR"; // Default safe fallthrough
}

export function getStateHelplines(state: string): EmergencyHelpline[] {
  const common = [
    {
      title: "National Emergency Service",
      number: "112",
      type: "Police, Fire & Medical",
      description: "24/7 Centralized emergency dispatch with GPS coordinate tracking.",
    },
    {
      title: "State Disaster Management (SEOC)",
      number: "1070",
      type: "Disaster Management Authority",
      description: "State Emergency Operations Centre response coordinator.",
    },
    {
      title: "Medical Emergency & Ambulance",
      number: "108",
      type: "Critical Care Transport",
      description: "Oxygen-supported Advanced Life Support (ALS) ambulances.",
    },
    {
      title: "CPCB Air Pollution Emergency",
      number: "011-43102468",
      type: "Pollution Control Board",
      description: "Direct control room for reporting hazardous industrial & firecracker burns.",
    },
  ];

  if (state === "Delhi NCR") {
    return [
      {
        title: "DDMA Control Room (Delhi)",
        number: "1077",
        type: "Delhi Disaster Authority",
        description: "Delhi Disaster Management Authority round-the-clock emergency desk.",
      },
      ...common,
    ];
  }

  if (state === "Uttar Pradesh") {
    return [
      {
        title: "UP Disaster Relief Control",
        number: "0522-2237515",
        type: "UPSDMA Command",
        description: "Uttar Pradesh State Disaster Management Authority emergency desk.",
      },
      ...common,
    ];
  }

  return common;
}

export function generateDataForLocation(state: string, mainCondition: string, lat: number, lon: number) {
  const isDelhi = state === "Delhi NCR";

  const predictions: HazardPrediction[] = [
    {
      id: "p1",
      name: "Diwali Smog Inversion",
      level: isDelhi ? "Severe" : "High",
      color: "#ef4444",
      value: isDelhi ? "738 µg/m³" : "420 µg/m³",
      impact: "Traps 85% of fine pyrotechnic particulate below 160m.",
      trend: "+340% above baseline",
    },
    {
      id: "p2",
      name: "Stubble Biomass Dispersion",
      level: isDelhi ? "High" : "Moderate",
      color: "#f97316",
      value: "NW Winds (1.2 m/s)",
      impact: "Transboundary smoke influx from Punjab/Haryana farm residue.",
      trend: "Peak influx 18:00 - 02:00",
    },
    {
      id: "p3",
      name: "Nocturnal Visibility Risk",
      level: isDelhi ? "Severe" : "Moderate",
      color: "#a855f7",
      value: isDelhi ? "< 600 meters" : "1.8 km",
      impact: "Dense particulate smog reducing visual distance across highways.",
      trend: "Critical flight & road hazard",
    },
    {
      id: "p4",
      name: "Respiratory Hospitalization Surge",
      level: "Severe",
      color: "#dc2626",
      value: "+180% ER Admissions",
      impact: "Acute asthma flare-ups and cardiac strain on elderly citizens.",
      trend: "Peak D to D+2",
    },
  ];

  const alerts: RealTimeAlert[] = [
    {
      id: "a1",
      title: "GRAP Stage IV Emergency Enforced",
      severity: "Emergency",
      category: "Air Quality Hazard",
      timestamp: "Live Alert",
      agency: "Commission for Air Quality Management (CAQM)",
      message: "Ban on construction, diesel BS-IV vehicles, and mandatory work-from-home advisory.",
    },
    {
      id: "a2",
      title: "Surface Inversion Trap Warning",
      severity: "Warning",
      category: "Meteorological Trap",
      timestamp: "Active Window: 19:00 - 06:00",
      agency: "India Meteorological Department (IMD)",
      message: "Calm surface wind (<1 m/s) preventing vertical aerosol ventilation. Indoor HEPA filter advisory.",
    },
    {
      id: "a3",
      title: "Biomass Inflow Surge",
      severity: "Advisory",
      category: "Regional Dispersion",
      timestamp: "Satellite Sensor Sync",
      agency: "ISRO / CPCB Air Lab",
      message: "North-westerly wind drift transporting agricultural particulate into the urban basin.",
    },
  ];

  const armedForces: DisasterResource[] = [
    {
      id: "r1",
      name: "8th Battalion NDRF Command",
      unit: "National Disaster Response Force",
      distance: isDelhi ? "18 km (Ghaziabad)" : "Regional Command",
      contact: "0120-2766013",
      status: "Standby",
      capacity: "CBRN & Hazardous Material Response Teams",
    },
    {
      id: "r2",
      name: "Delhi SDRF Rapid Action Unit",
      unit: "State Disaster Response Force",
      distance: isDelhi ? "9 km (Civil Lines)" : "District HQ",
      contact: "1077",
      status: "Active",
      capacity: "Mobile Mist Cannons & Oxygen Dispensation",
    },
  ];

  const localResources: DisasterResource[] = [
    {
      id: "m1",
      name: isDelhi ? "AIIMS New Delhi Trauma & Pulmonology" : "District Civil Hospital",
      unit: "Emergency Respiratory Department",
      distance: isDelhi ? "8.4 km" : "Local City Core",
      contact: "011-26588500",
      status: "Active",
      capacity: "120 Dedicated Oxygen ICU Beds",
    },
    {
      id: "m2",
      name: isDelhi ? "Safdarjung Respiratory Emergency Centre" : "Medical College Emergency",
      unit: "Critical Care & Bronchial Support",
      distance: isDelhi ? "9.1 km" : "Medical Enclave",
      contact: "011-26165060",
      status: "Active",
      capacity: "85 Nebulizer & High-Flow Cannula Stations",
    },
  ];

  return { predictions, alerts, armedForces, localResources };
}

export function getDisasterProbabilities(state: string): DisasterProbability[] {
  const isDelhi = state === "Delhi NCR";
  return [
    {
      hazard: "Severe Thermal Inversion Trap",
      probability: isDelhi ? 94 : 76,
      color: "#ef4444",
      riskBand: "Critical Exposure",
    },
    {
      hazard: "Firecracker Pyrotechnic Surge",
      probability: isDelhi ? 98 : 88,
      color: "#dc2626",
      riskBand: "Catastrophic Peak",
    },
    {
      hazard: "Dense Smog Fog Visibility Drop",
      probability: isDelhi ? 86 : 68,
      color: "#a855f7",
      riskBand: "High Disruption",
    },
    {
      hazard: "Transboundary Stubble Smoke Inflow",
      probability: isDelhi ? 88 : 55,
      color: "#f97316",
      riskBand: "Severe Dispersion Trap",
    },
    {
      hazard: "Low Wind Surface Calming (<1.0 m/s)",
      probability: isDelhi ? 92 : 72,
      color: "#38bdf8",
      riskBand: "Stagnation Lock",
    },
  ];
}

