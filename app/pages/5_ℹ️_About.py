"""
Page 5: About, Methodology & Limitations
"""

import streamlit as st

st.set_page_config(page_title="About - Hawa AI", page_icon="ℹ️", layout="wide")

st.title("ℹ️ About Hawa AI")
st.markdown("### *'Pick your Delhi neighborhood and see how bad the air will be before, during and after Diwali, with a clear health plan.'*")

st.markdown("""
---
### 1. Problem Statement
Every autumn, air quality across Delhi NCR and Northern India deteriorates sharply due to the convergence of three factors:
- **Firecracker emissions** on Diwali night.
- **Seasonal winter inversion**: calm winds, cold surface temperatures, and low boundary layer trapping smoke.
- **Stubble burning smoke** transported across North-Western corridors.

Public air quality advisories typically report a single citywide average AQI number. This leaves families, schools, RWAs, and hospitals unable to answer basic questions:
* *Which neighborhood will peak earliest?*
* *When is the safest 2-hour window to ventilate homes or run errands?*
* *Should our school cancel outdoor activity on Nov 9?*

---
### 2. Machine Learning Architecture
To forecast up to **8 days in advance**, Hawa AI deliberately uses **no recent PM2.5 lags** (since recent readings are not available for next week).
Instead, the models learn strictly from:
1. **Atmospheric Physics**: Temperature, relative humidity, wind speed, wind direction, surface pressure, precipitation.
2. **Calendar Dynamics**: Hour of day, day of week, diurnal rush hour curves (8-11, 17-21).
3. **Festival Cycle**: `days_from_diwali` (-7 to +7), and `is_diwali_night` (19:00 to 02:00).
4. **Spatial Locality**: Categorical station ID, latitude, longitude, and elevation/topography features.

**Ensemble Stack:**
- **Baseline Model**: Station + hour of day empirical mean.
- **Main Regressor**: LightGBM with festival loss weighting (3x Diwali window sample weight).
- **Quantile Regressors**: LightGBM quantile regression at `alpha=0.10` and `alpha=0.90` providing the 80% confidence interval.

---
### 3. Official CPCB Air Quality Index Breakpoints
Hawa AI adheres strictly to the Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) breakpoints for PM2.5:

| Category | PM2.5 Band (µg/m³) | Color Code | Health Impact |
|---|---|---|---|
| **Good** | 0 – 30 | 🟢 Green | Minimal impact |
| **Satisfactory** | 31 – 60 | 🟡 Light Green | Minor breathing discomfort to sensitive people |
| **Moderate** | 61 – 90 | 🟠 Yellow | Breathing discomfort to people with lungs, asthma and heart diseases |
| **Poor** | 91 – 120 | 🟠 Orange | Breathing discomfort to most people on prolonged exposure |
| **Very Poor** | 121 – 250 | 🔴 Red | Respiratory illness on prolonged exposure |
| **Severe** | 250+ | 🟣 Maroon | Affects healthy people and seriously impacts those with existing diseases |

---
### 4. Known Limitations (Stated Proudly)
1. **Firecracker Enforcement Variance**: Firecracker bans, green cracker mandates, and enforcement levels fluctuate each year. The model presents an **80% uncertainty interval** and an interactive **What-If policy slider** rather than a fake exact number.
2. **Traffic is a Proxy**: Traffic volume is represented via morning/evening peak hour flags and weekend indicators rather than real-time Google Maps telemetry.
3. **Offline Caching**: All forecast grids and validation tables are precomputed to disk so the application loads in under 2 seconds and works without an internet connection during demos.
""")

