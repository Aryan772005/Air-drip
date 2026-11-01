export interface AdviceInfo {
  badge: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  range: string;
  summary: string;
  general: string;
  vulnerable: string;
  sensitive: string;
}

export const AQI_LEVELS: Record<string, AdviceInfo> = {
  Good: {
    badge: "🟢 Good",
    color: "#00B050",
    bgClass: "bg-emerald-950/40",
    borderClass: "border-emerald-500",
    textClass: "text-emerald-400",
    range: "0 - 30 µg/m³",
    summary: "Air quality is considered satisfactory, and air pollution poses little or no risk.",
    general: "Enjoy outdoor activities, morning jogs, and open ventilation freely.",
    vulnerable: "Completely safe for children and seniors to play and exercise outside.",
    sensitive: "Ideal outdoor conditions. No special precautions or medication adjustments needed.",
  },
  Satisfactory: {
    badge: "🟡 Satisfactory",
    color: "#92D050",
    bgClass: "bg-lime-950/40",
    borderClass: "border-lime-500",
    textClass: "text-lime-400",
    range: "31 - 60 µg/m³",
    summary: "Acceptable air quality; minor breathing discomfort possible for unusually sensitive individuals.",
    general: "Safe for regular outdoor activities. Ventilate rooms during daytime hours.",
    vulnerable: "Children and seniors can spend normal active time outdoors with regular hydration.",
    sensitive: "Keep quick-relief inhalers handy if sensitive to dust or slight smog.",
  },
  Moderate: {
    badge: "🟠 Moderate",
    color: "#FFC000",
    bgClass: "bg-amber-950/40",
    borderClass: "border-amber-500",
    textClass: "text-amber-400",
    range: "61 - 90 µg/m³",
    summary: "May cause breathing discomfort to people with lung disease, asthma, and heart conditions.",
    general: "Moderate outdoor exercise is fine. Avoid jogging near heavy traffic corridors.",
    vulnerable: "Limit intense outdoor sports for children; elderly should prefer shaded leisurely walks.",
    sensitive: "Carry your rescue inhaler. Consider wearing a light mask in crowded dusty areas.",
  },
  Poor: {
    badge: "🔴 Poor",
    color: "#FF7A00",
    bgClass: "bg-orange-950/40",
    borderClass: "border-orange-500",
    textClass: "text-orange-400",
    range: "91 - 120 µg/m³",
    summary: "Causes breathing discomfort to most people on prolonged exposure.",
    general: "Cut down on strenuous outdoor exercise. Keep windows closed during rush hours.",
    vulnerable: "Shift school sports indoors. Elderly should avoid early morning or late night walks.",
    sensitive: "Wear an N95 mask outdoors. Ensure indoor air filtration is running if available.",
  },
  "Very Poor": {
    badge: "🟣 Very Poor",
    color: "#FF0000",
    bgClass: "bg-rose-950/50",
    borderClass: "border-rose-500",
    textClass: "text-rose-400",
    range: "121 - 250 µg/m³",
    summary: "Severe respiratory illness on prolonged exposure. Significant trigger for heart disease.",
    general: "Avoid all outdoor workouts. Wear a well-fitted N95 mask when stepping out. Keep doors and windows tightly shut.",
    vulnerable: "Children and elderly must stay indoors. Run HEPA air purifiers in bedrooms. Hydrate frequently.",
    sensitive: "Strict indoor rest. Double check inhaler stocks, keep emergency medications accessible, and consult doctor if wheezing occurs.",
  },
  Severe: {
    badge: "🚨 Severe",
    color: "#780000",
    bgClass: "bg-red-950/70",
    borderClass: "border-red-600",
    textClass: "text-red-400",
    range: "250+ µg/m³",
    summary: "Emergency health warning: affects healthy people and seriously impacts those with existing diseases.",
    general: "HAZARDOUS AIR: Complete outdoor activity ban. N95/N99 mask mandatory outside. Seal windows and run purifiers at maximum.",
    vulnerable: "Strict zero outdoor exposure for children, elderly, and pregnant women. Schools should cancel outdoor classes immediately.",
    sensitive: "Medical alert level. Nebulizer / oxygen support standby for severe asthmatics. Seek immediate medical attention if experiencing chest tightness or shortness of breath.",
  },
};

export function calculateCpcbAqi(pm25: number): number {
  if (pm25 <= 0) return 0;
  if (pm25 <= 30) {
    return Math.round((50 / 30) * pm25);
  }
  if (pm25 <= 60) {
    return Math.round(50 + ((100 - 50) / (60 - 30)) * (pm25 - 30));
  }
  if (pm25 <= 90) {
    return Math.round(100 + ((200 - 100) / (90 - 60)) * (pm25 - 60));
  }
  if (pm25 <= 120) {
    return Math.round(200 + ((300 - 200) / (120 - 90)) * (pm25 - 90));
  }
  if (pm25 <= 250) {
    return Math.round(300 + ((400 - 300) / (250 - 120)) * (pm25 - 120));
  }
  if (pm25 <= 380) {
    return Math.round(400 + ((500 - 400) / (380 - 250)) * (pm25 - 250));
  }
  // Above 380 µg/m3 PM2.5, Indian CPCB AQI exceeds maximum 500
  return Math.min(800, Math.round(400 + (100 / 130) * (pm25 - 250)));
}

export function getCappedAqiDisplay(pm25: number): {
  aqi: number;
  exactAqi: number;
  display: string;
  isCapped: boolean;
} {
  const exactAqi = calculateCpcbAqi(pm25);
  if (exactAqi >= 500 || pm25 > 380) {
    return { aqi: 500, exactAqi, display: "500+", isCapped: true };
  }
  return { aqi: exactAqi, exactAqi, display: exactAqi.toString(), isCapped: false };
}

export function calculateCigarettes(pm25: number): number {
  // Berkeley Earth rule of thumb: 1 cigarette per day is roughly equivalent to 22 µg/m³ of PM2.5
  if (pm25 <= 0) return 0;
  return Math.max(1, Math.round(pm25 / 22));
}

export function getAqiCategory(pm25: number): { name: string; info: AdviceInfo } {
  if (pm25 <= 30) return { name: "Good", info: AQI_LEVELS["Good"] };
  if (pm25 <= 60) return { name: "Satisfactory", info: AQI_LEVELS["Satisfactory"] };
  if (pm25 <= 90) return { name: "Moderate", info: AQI_LEVELS["Moderate"] };
  if (pm25 <= 120) return { name: "Poor", info: AQI_LEVELS["Poor"] };
  if (pm25 <= 250) return { name: "Very Poor", info: AQI_LEVELS["Very Poor"] };
  return { name: "Severe", info: AQI_LEVELS["Severe"] };
}

export function getBestTimeWindow(stationForecast: any[]): string {
  if (!stationForecast || stationForecast.length === 0) return "12:00 PM – 3:00 PM";
  
  // Look at daytime hours 7 to 19
  const daytime = stationForecast.filter((d) => {
    const h = new Date(d.Datetime).getHours();
    return h >= 7 && h <= 19;
  });
  
  const pool = daytime.length >= 3 ? daytime : stationForecast;
  let minAvg = Infinity;
  let bestStart = 12;
  
  for (let i = 0; i <= pool.length - 3; i++) {
    const avg = (pool[i]["PM2.5_Median"] + pool[i+1]["PM2.5_Median"] + pool[i+2]["PM2.5_Median"]) / 3;
    if (avg < minAvg) {
      minAvg = avg;
      bestStart = new Date(pool[i].Datetime).getHours();
    }
  }
  
  const endH = bestStart + 3;
  const fmt = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:00 ${ampm}`;
  };
  
  return `${fmt(bestStart)} – ${fmt(endH)} (~${Math.round(minAvg)} µg/m³)`;
}
