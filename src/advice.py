"""
Health Advice Engine for Hawa AI.
Provides actionable, simple-English health advisories tailored to CPCB AQI categories
for three key demographic groups:
1. General Public
2. Children & Elderly
3. Sensitive Individuals (Asthma, Respiratory, Heart Disease)
Also computes the daily 'Best Time Window' (safest hours for ventilation / essential errands).
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
import pandas as pd
import numpy as np

# Official CPCB AQI Palette & Health Guidance
AQI_CATEGORIES = {
    "Good": {
        "range_pm25": "0 - 30 µg/m³",
        "color": "#00B050", # Clean Green
        "badge": "🟢 GOOD",
        "summary": "Air quality is considered satisfactory, and air pollution poses little or no risk.",
        "general": "Enjoy outdoor activities, morning jogs, and open ventilation freely.",
        "vulnerable": "Completely safe for children and seniors to play and exercise outside.",
        "sensitive": "Ideal outdoor conditions. No medication adjustments or special precautions needed.",
    },
    "Satisfactory": {
        "range_pm25": "31 - 60 µg/m³",
        "color": "#92D050", # Light Green
        "badge": "🟡 SATISFACTORY",
        "summary": "Acceptable air quality; minor breathing discomfort possible for unusually sensitive people.",
        "general": "Safe for regular outdoor activities. Ventilate rooms during daylight hours.",
        "vulnerable": "Children and seniors can spend time outdoors with regular hydration.",
        "sensitive": "Keep quick-relief inhalers handy if sensitive to dust or slight smog.",
    },
    "Moderate": {
        "range_pm25": "61 - 90 µg/m³",
        "color": "#FFC000", # Yellow/Amber
        "badge": "🟠 MODERATE",
        "summary": "May cause breathing discomfort to people with lung disease, asthma, and heart conditions.",
        "general": "Moderate outdoor exercise is fine. Avoid jogging near heavy traffic corridors.",
        "vulnerable": "Limit intense outdoor sports for children; elderly should take leisurely strolls.",
        "sensitive": "Carry your rescue inhaler. Consider wearing a light surgical or cloth mask in crowded dusty areas.",
    },
    "Poor": {
        "range_pm25": "91 - 120 µg/m³",
        "color": "#FF7A00", # Orange
        "badge": "🟠 POOR",
        "summary": "Causes breathing discomfort to most people on prolonged exposure.",
        "general": "Cut down on strenuous outdoor exercise. Keep windows closed during rush hours.",
        "vulnerable": "Shift school sports indoors. Elderly should avoid early morning or late night walks.",
        "sensitive": "Wear an N95 mask outdoors. Ensure indoor air filtration is running if available.",
    },
    "Very Poor": {
        "range_pm25": "121 - 250 µg/m³",
        "color": "#FF0000", # Red
        "badge": "🔴 VERY POOR",
        "summary": "Severe respiratory illness on prolonged exposure. Significant trigger for heart disease.",
        "general": "Avoid all outdoor workouts. Wear a well-fitted N95/FFP2 mask when stepping out. Keep doors and windows tightly shut.",
        "vulnerable": "Children and elderly must stay indoors. Run HEPA air purifiers in bedrooms. Hydrate frequently.",
        "sensitive": "Strict indoor rest. Double check inhaler stocks, keep emergency medications accessible, and consult doctor if wheezing occurs.",
    },
    "Severe": {
        "range_pm25": "250+ µg/m³",
        "color": "#780000", # Maroon / Deep Red
        "badge": "🟣 SEVERE / HAZARDOUS",
        "summary": "Emergency health warning: affects healthy people and seriously impacts those with existing diseases.",
        "general": "HAZARDOUS AIR: Complete outdoor activity ban. N95/N99 mask mandatory outside. Seal windows, run purifiers at maximum, minimize cooking fumes.",
        "vulnerable": "Strict zero outdoor exposure for children, elderly, and pregnant women. Schools should cancel outdoor classes immediately.",
        "sensitive": "Medical alert level. Nebulizer / oxygen support standby for severe asthmatics. Seek immediate medical attention if experiencing chest tightness or shortness of breath.",
    },
}

def get_health_advice(category):
    """Returns advice dictionary for given AQI category."""
    cat = category.strip() if isinstance(category, str) else "Moderate"
    if cat not in AQI_CATEGORIES:
        cat = "Moderate"
    return AQI_CATEGORIES[cat]

def calculate_best_time_window(station_forecast_df):
    """
    Given an hourly forecast dataframe for a specific station and day,
    identifies the continuous 2-to-3 hour time window with the lowest average PM2.5.
    Returns: string description of the window (e.g. '13:00 - 16:00 (PM2.5: ~180 µg/m³)')
    """
    if len(station_forecast_df) == 0:
        return "Midday (12:00 - 15:00)"
        
    df = station_forecast_df.copy()
    df["Hour"] = pd.to_datetime(df["Datetime"]).dt.hour
    
    # Exclude dead of night 00:00 - 05:00 from practical errands window
    daytime_df = df[(df["Hour"] >= 6) & (df["Hour"] <= 20)]
    if len(daytime_df) < 3:
        daytime_df = df
        
    # 3-hour rolling average
    daytime_df = daytime_df.sort_values("Datetime")
    if len(daytime_df) >= 3:
        rolling_means = daytime_df["PM2.5_Median"].rolling(3).mean().dropna()
        if len(rolling_means) > 0:
            min_idx = rolling_means.idxmin()
            end_row = daytime_df.loc[min_idx]
            end_h = int(end_row["Hour"])
            start_h = max(0, end_h - 2)
            min_val = round(rolling_means[min_idx], 1)
            return f"{start_h:02d}:00 to {end_h+1:02d}:00 (Average PM2.5: {min_val} µg/m³)"
            
    # Fallback to lowest single hour
    min_row = daytime_df.loc[daytime_df["PM2.5_Median"].idxmin()]
    min_h = int(min_row["Hour"])
    return f"{min_h:02d}:00 to {min_h+2:02d}:00 (Lowest diurnal pollution)"

def test_advice():
    for cat in ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]:
        adv = get_health_advice(cat)
        print(f"[{cat}] {adv['badge']}: {adv['summary']}")

if __name__ == "__main__":
    test_advice()
