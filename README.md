# 🌫️ Air Drip: Diwali Air Quality Predictor (Delhi & All-India)

> **"Pick your neighborhood and see how bad the air will be before, during and after Diwali — with hyper-local forecasts and an actionable health plan."**

---

## 🌐 Full-Stack Web Application (Next.js 14 + TypeScript + Tailwind CSS)

Air Drip includes a **Next.js 14 TypeScript web platform** built with dark theme styling, Leaflet interactive mapping, Recharts data visualizations, and live OpenWeather API telemetry:

```bash
cd web
npm run dev
# App will run at http://localhost:3000
```
Or run the production build:
```bash
cd web
npm run build
npm start
```

*(Note: The Streamlit app is also preserved in `app/` and can be launched with `streamlit run app/streamlit_app.py`)*

## DiwaliAir chatbot API

Install the Python dependencies from the repository root, then start the chatbot API:

```bash
pip install -r requirements.txt
uvicorn src.chatbot.app:app --port 8001
```

The dashboard chat widget connects to `http://localhost:8001/chat`. Set
`GEMINI_API_KEY` in the server environment to enable Gemini tool use; without
it, the chatbot uses its offline rule-based replies. Set `REPLAY=1` to serve the
recorded demo conditions in `data/chatbot_replay.json` without network access.
Live conditions use Open-Meteo's free geocoding, weather and air quality APIs.
AQI in chatbot responses is an approximate conversion from modelled PM2.5 and
is not an official CPCB reading.

---

## 🚀 Interactive Web Application Features

1. **📍 Interactive Forecast & Map**:
   - **CartoDB Dark Leaflet Map** with color-coded CPCB circles for 22+ monitoring stations across Delhi NCR and All-India Metros.
   - **IDW Continuous Heat Layer**: Toggleable Inverse Distance Weighting surface interpolation over Delhi.
   - **Hourly Time Slider (Nov 5 - Nov 11, 2026)** with one-click presets: *Pre-Diwali (Nov 6)*, *Diwali Night Peak (Nov 8 22:00)*, and *Post-Diwali (Nov 10)*.
   - **Location Inspector**: Instant card showing Predicted PM2.5, 80% range (q10 to q90), CPCB AQI category, safest outdoor ventilation window today, and immediate health advice.
   - **Weekly PM2.5 Timeline**: Interactive area chart with Diwali night firecracker window highlighted.
2. **📈 Past Diwalis (The Empirical Reality)**:
   - Trajectory chart (D-7 to D+7) showing the recurring Diwali night spike across every year from 2018 to 2024.
   - Diwali night (19:00 - 02:00) vs normal pre-Diwali baseline bar comparisons.
   - Top 10 hardest-hit hotspots ranking.
   - 3 Key plain-English insights.
3. **🛡️ Model Trust & Rigorous Validation**:
   - **Leave-One-Diwali-Out Cross-Validation** benchmark table showing >95% MAE reduction over historical baseline models.
   - **Unseen 2019 Season Evaluation**: Hour-by-hour comparison of Actual ground truth vs LightGBM vs Baseline.
   - **SHAP Feature Attribution**: Explaining the exact physics of calm wind speed, atmospheric inversion, and festival emissions.
4. **🧪 What-If Policy & Scenario Simulator**:
   - Interactive slider adjusting firecracker intensity from **0% (full ban) to 50% (green crackers) and 100% (normal)**.
   - Real-time recalculation of averted PM2.5 and percentage reduction across every neighborhood.
5. **🩺 CPCB Health Action Engine**:
   - Tailored advice split across **General Public**, **Children & Elderly**, and **Asthma / Heart Disease** patients.
   - Severe / Hazardous emergency checklist.
6. **🌤️ Live Weather Bar**:
   - Integrates live weather telemetry from Open-Meteo, with no API key required.

---

## 📊 Leave-One-Diwali-Out Validation Results

| Held-Out Year | Baseline MAE | LightGBM MAE | Baseline RMSE | LightGBM RMSE | Baseline Night MAE | LightGBM Night MAE | MAE Improvement |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **2018** | 76.88 µg/m³ | **3.95 µg/m³** | 120.64 | **18.17** | 391.23 µg/m³ | **57.61 µg/m³** | **+94.9%** |
| **2019** | 59.34 µg/m³ | **2.42 µg/m³** | 89.95 | **5.19** | 320.42 µg/m³ | **10.97 µg/m³** | **+95.9%** |
| **2020** | 63.37 µg/m³ | **3.24 µg/m³** | 95.79 | **8.64** | 302.83 µg/m³ | **9.68 µg/m³** | **+94.9%** |
| **2021** | 64.16 µg/m³ | **2.65 µg/m³** | 94.37 | **7.44** | 346.05 µg/m³ | **18.40 µg/m³** | **+95.9%** |
| **2022** | 62.92 µg/m³ | **2.38 µg/m³** | 96.91 | **4.69** | 294.99 µg/m³ | **13.03 µg/m³** | **+96.2%** |
| **2023** | 60.13 µg/m³ | **2.28 µg/m³** | 96.76 | **4.05** | 319.68 µg/m³ | **9.24 µg/m³** | **+96.2%** |
| **2024** | 57.65 µg/m³ | **2.54 µg/m³** | 87.68 | **5.15** | 308.50 µg/m³ | **15.99 µg/m³** | **+95.6%** |

---

## 💡 3 Key Plain-English Facts

1. **Massive Nighttime Surge**: Delhi PM2.5 surges by an average of **2.7x** on Diwali night compared to baseline nights, leaping from **238.6 to 637.3 µg/m³**.
2. **Dead-of-Night Stagnation**: Firecracker smoke intensity consistently peaks between **23:00 and 01:00**, creating a hazardous inversion blanket that persists until **09:00 the following morning**.
3. **Hardest Hit Neighborhood**: Historical ground records show **Delhi - Anand Vihar** suffers the steepest nighttime spike (**+450.0 µg/m³** above baseline, reaching Severe AQI 850+ µg/m³).

---

## 🏗️ Architecture

```
hawa-ai/
  web/                               # Next.js 14 + TypeScript frontend
    src/
      app/
        page.tsx                     # Main dashboard page
        layout.tsx                   # Dark theme shell
        globals.css                  # Tailwind + Leaflet styles
      components/
        ForecastMapTab.tsx           # Map, time slider, station cards
        MapComponent.tsx             # Leaflet dark map & IDW heat layer
        PastDiwalisTab.tsx           # Multi-year historical trends & facts
        ModelTrustTab.tsx            # Cross-validation table, 2019 test, SHAP
        WhatIfTab.tsx                # Firecracker policy sensitivity simulator
        HealthTab.tsx                # Multi-demographic CPCB health guide
        AboutTab.tsx                 # Problem, architecture, limitations
        LiveWeatherWidget.tsx        # OpenWeather API live status
      lib/
        aqi.ts                       # CPCB NAQI calculation & advice engine
        types.ts                     # TypeScript data interfaces
      data/                          # Pre-computed typed JSON bundles
        forecastData.json            # 3,696 hourly forecast records
        metricsData.json             # Leave-one-out CV results
        trust2019Data.json           # Unseen 2019 test comparisons
        shapData.json                # SHAP ranking & weights
        pastDiwaliData.json          # Multi-year trajectories & facts
        stationCoords.json           # Lat/lon coordinates
  data/
    processed/                       # Parquet datasets & station coordinates
  src/                               # Python ML & pipeline modules
    data_loader.py                   # Data ingestion & CPCB calculator
    weather.py                       # OpenWeather + Open-Meteo dual engine
    features.py                      # Feature engineering (no recent lags)
    train.py                         # LightGBM & Quantile model training
    predict.py                       # Forecast generation
    interpolate.py                   # IDW 60x60 grid interpolation
    advice.py                        # Health advice logic
    explain.py                       # SHAP tree analysis
    export_web_data.py               # JSON exporter for Next.js
  models/                            # Serialized LightGBM & Quantile models
  outputs/                           # Validation metrics, charts, & SHAP plots
```

> AI-powered neighborhood-level air quality prediction before, during and after Diwali.
