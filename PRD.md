# Air Drip: Diwali Air Quality Predictor

PRD + Antigravity prompt pack.

---

## 1. One-line pitch

"Pick your Delhi neighborhood and see how bad the air will be before, during and after Diwali, with a clear health plan."

## 2. Problem

- Air quality in Delhi gets much worse around Diwali (firecrackers + cold, calm weather + stubble smoke).
- People see one city-wide AQI number. It does not tell them what their own area will look like, or when it peaks.
- Result: families, schools, and hospitals cannot plan (when to stay inside, when to open windows, when to keep kids away from outdoor play).

## 3. Users

| User | What they want |
|---|---|
| Parents, elderly, asthma patients | "Is it safe to go out tonight?" |
| Schools, RWAs | "Should we cancel outdoor activity on Nov 9?" |
| Policy / NGO (Paryavaran Welfare Society) | "Which areas get hit hardest?" |

## 4. Goals and non-goals

**Goals**
- Predict PM2.5 and AQI category per neighborhood for D-3 to D+3 around Diwali.
- Show it on a map with a time slider.
- Prove the model is trustworthy using past Diwalis.
- Give simple health advice.

**Non-goals (do not build these)**
- All of India. Only Delhi.
- Real-time sensor hardware.
- Login, database, mobile app.

## 5. Scope

**Must have (MVP)**
1. Clean dataset: hourly PM2.5 for Delhi stations, plus weather.
2. "Diwali effect" chart: PM2.5 around Diwali for past years.
3. Trained model with honest accuracy (MAE, RMSE) and a baseline to beat.
4. Forecast for the real Diwali 2026 window (Diwali is on 8 Nov 2026, verify the date) using the live weather forecast.
5. Map: stations as neighborhoods, coloured by AQI category, with a time slider (Before / During / After).
6. Health advice per AQI category.

**Should have**
- Uncertainty range (80% interval) instead of one number.
- Model Trust page: actual vs predicted on a past Diwali the model never saw.
- Smooth heatmap using IDW interpolation between stations.

**Wow (only if MVP is done)**
- "What-if" slider: firecracker intensity (normal / reduced / green crackers). Label it clearly as a scenario, not a prediction.
- SHAP chart: "why is it high? low wind + Diwali night".
- Advice by group (kids, elderly, asthma).
- Hindi/English toggle.

## 6. Data

| Need | Source | Notes |
|---|---|---|
| Hourly PM2.5, PM10, AQI by station | Kaggle: "Air Quality Data in India (2015-2020)" by Rohan Rao (`station_hour.csv`, `stations.csv`) | Download manually, works offline. This is your safe base. Covers Diwalis 2015 to 2020. |
| Recent years (optional) | OpenAQ API (free key) or CPCB / data.gov.in | Skip if time is short. |
| Weather (history + forecast) | Open-Meteo (archive API and forecast API) | Free, no key. Forecast API reaches ~16 days ahead, so Diwali 2026 is inside the window. |
| Station coordinates | Geocode station names with Nominatim, or hard-code ~10 to 15 well-known stations manually | `stations.csv` has no lat/lon. |
| Traffic | Proxy only: rush-hour flags (8 to 11, 17 to 21), weekday/weekend | Say this honestly in the pitch. |

**Past Diwali dates (to build the feature):**
2015: 11 Nov, 2016: 30 Oct, 2017: 19 Oct, 2018: 7 Nov, 2019: 27 Oct, 2020: 14 Nov, 2026: 8 Nov.

## 7. ML design (keep it simple)

**Target:** PM2.5 (µg/m³) per station per hour. AQI category is computed from PM2.5 using CPCB breakpoints:
0-30 Good, 31-60 Satisfactory, 61-90 Moderate, 91-120 Poor, 121-250 Very Poor, 250+ Severe.

**Key design decision:** we need to predict up to 8 days ahead, and we will not have recent PM2.5 readings for that. So the main model uses **no recent-lag features**. It learns from weather + calendar + station only.

**Features**
- Weather: temperature, humidity, wind speed, wind direction, pressure, precipitation
- Time: hour, day of week, month, rush-hour flag
- Diwali: `days_from_diwali` (-7 to +7), `is_diwali_night` (19:00 to 02:00)
- Station ID (or station average PM2.5 as a feature)

**Models**
- Baseline: station + hour-of-day average. The ML model must beat this.
- Main: LightGBM or XGBoost.
- Uncertainty (Should): LightGBM quantile models at 10% and 90%.

**Validation (this is what impresses judges)**
- Leave-one-Diwali-out: train on other years, test on the held-out Diwali window (e.g. train 2016, 2017, 2018, test on 2019).
- Report MAE, RMSE, and MAE on Diwali night only.

**Known limits (say them proudly):** firecracker intensity changes each year (bans, enforcement), data ends in 2020, traffic is a proxy. The model gives a good estimate, not an exact value.

## 8. App screens (Streamlit, dark theme)

1. **Forecast (home):** map + time slider (D-3 ... D+3, hourly) + AQI legend. Click a station to see its card: PM2.5, AQI category, 80% range, health advice.
2. **Past Diwalis:** line chart of PM2.5 from D-7 to D+7 for each year, plus a "Diwali night vs normal night" bar.
3. **Model Trust:** actual vs predicted for a held-out Diwali, MAE / RMSE, baseline comparison.
4. **What-if (Wow):** firecracker intensity slider.
5. **About:** data sources, method, limits.

## 9. Architecture and folders

```
hawa-ai/
  PRD.md
  data/raw/          # kaggle CSVs
  data/processed/    # cleaned parquet files
  src/
    data_loader.py   # load + clean station data
    weather.py       # Open-Meteo history + forecast, cached
    features.py      # build feature table
    train.py         # train + validate + save model
    predict.py       # forecast for Diwali 2026
    interpolate.py   # IDW grid
    advice.py        # AQI category + health advice
  models/
  app/
    streamlit_app.py
    pages/
  outputs/           # charts, forecast CSV
  requirements.txt
  README.md
```

Flow: raw data -> clean -> add weather -> features -> train -> save model -> forecast file -> Streamlit reads the forecast file and shows the map.

Important: the app should read a **pre-computed forecast CSV**. That way the demo never breaks because of an API failure.

## 10. Success metrics

- Model beats the baseline on the held-out Diwali (lower MAE).
- App loads in under 5 seconds and works with no internet (uses cached files).
- Judge understands the idea in 30 seconds.

## 11. Build order (stop at any point and still have a demo)

1. Data cleaned + Diwali effect chart (the "wow, the problem is real" moment)
2. Weather + model + validation
3. Forecast for Diwali 2026
4. Map + slider
5. Health advice + polish
6. Wow features, README, deploy

