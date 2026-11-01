"""Open-Meteo conditions with a small in-process TTL cache."""
from __future__ import annotations

import os
import time
from typing import Any

import requests

_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}
TTL_SECONDS = 600
TIMEOUT_SECONDS = 8


def pm25_to_aqi(pm25: float) -> dict[str, Any]:
    """Approximate CPCB-style category from modelled PM2.5 concentration."""
    bands = [
        (30, "Good", "Air is clean; usual outdoor activity is fine.", 0, 50, 0),
        (60, "Satisfactory", "Sensitive people should limit prolonged outdoor exertion.", 51, 100, 31),
        (90, "Moderate", "People with lung or heart conditions should reduce outdoor exertion.", 101, 200, 61),
        (120, "Poor", "Reduce outdoor activity; children and older adults should stay indoors.", 201, 300, 91),
        (250, "Very Poor", "Avoid outdoor exertion; use a well-fitted mask if going out.", 301, 400, 121),
        (float("inf"), "Severe", "Stay indoors with windows closed; protect children and older adults.", 401, 500, 251),
    ]
    index = next(i for i, (limit, *_rest) in enumerate(bands) if pm25 <= limit)
    _, category, advisory, aqi_lo, aqi_hi, pm_lo = bands[index]
    pm_hi = bands[index][0]
    aqi = round((pm25 - pm_lo) / (pm_hi - pm_lo) * (aqi_hi - aqi_lo) + aqi_lo) if index < len(bands) - 1 else min(500, round(401 + (pm25 - 251) / 249 * 99))
    return {"pm25_ugm3": round(pm25, 1), "aqi_approx": max(0, min(500, aqi)), "category": category, "advisory": advisory, "basis": "Approximate and modelled from PM2.5; not official CPCB data."}


def _get_json(url: str, params: dict[str, Any]) -> dict[str, Any]:
    response = requests.get(url, params=params, timeout=TIMEOUT_SECONDS)
    response.raise_for_status()
    return response.json()


def get_conditions(city: str = "Ludhiana", lat: float | None = None, lon: float | None = None) -> dict[str, Any]:
    """Fetch current weather, next 12h forecast and a 72h PM2.5 peak."""
    key = f"{city.casefold()}:{lat}:{lon}"
    now = time.monotonic()
    if key in _CACHE and now - _CACHE[key][0] < TTL_SECONDS:
        return _CACHE[key][1]
    try:
        if lat is None or lon is None:
            if os.getenv("REPLAY") == "1":
                lat, lon = 30.9010, 75.8573
                resolved_city = city
            else:
                geo = _get_json("https://geocoding-api.open-meteo.com/v1/search", {"name": city, "count": 1, "language": "en", "format": "json"})
                result = (geo.get("results") or [None])[0]
                if not result:
                    return {"error": f"Could not find {city} in the weather data source."}
                lat, lon = result["latitude"], result["longitude"]
                resolved_city = result.get("name", city)
        else:
            resolved_city = city
        if os.getenv("REPLAY") == "1":
            from pathlib import Path
            import json
            replay_path = Path(__file__).resolve().parents[2] / "data" / "chatbot_replay.json"
            if replay_path.exists():
                payload = json.loads(replay_path.read_text(encoding="utf-8"))
                payload["city"] = resolved_city
                _CACHE[key] = (now, payload)
                return payload
            return {"error": "Recorded conditions are unavailable in REPLAY mode."}
        weather = _get_json("https://api.open-meteo.com/v1/forecast", {"latitude": lat, "longitude": lon, "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m", "hourly": "precipitation_probability,temperature_2m", "forecast_days": 3, "timezone": "auto"})
        air = _get_json("https://air-quality-api.open-meteo.com/v1/air-quality", {"latitude": lat, "longitude": lon, "current": "pm2_5", "hourly": "pm2_5", "forecast_days": 3, "timezone": "auto"})
        current = weather.get("current", {})
        times = weather.get("hourly", {}).get("time", [])
        now_idx = next((i for i, t in enumerate(times) if t >= current.get("time", "")), 0)
        outlook = [{"time": times[i], "temperature_c": weather["hourly"]["temperature_2m"][i], "precipitation_probability_pct": weather["hourly"]["precipitation_probability"][i]} for i in range(now_idx, min(now_idx + 12, len(times)))]
        air_hourly = air.get("hourly", {})
        air_values = [v for v in air_hourly.get("pm2_5", []) if isinstance(v, (int, float))]
        current_pm = air.get("current", {}).get("pm2_5")
        if current_pm is None and air_values:
            current_pm = air_values[0]
        payload = {"city": resolved_city, "coordinates": {"lat": lat, "lon": lon}, "weather": current, "outlook_12h": outlook, "pm25": pm25_to_aqi(float(current_pm)) if current_pm is not None else None, "peak_next_72h": max(air_values) if air_values else None, "source": "Open-Meteo"}
        _CACHE[key] = (now, payload)
        return payload
    except (requests.RequestException, KeyError, ValueError, IndexError, TypeError) as exc:
        return {"error": f"The weather and air-quality data source is unreachable ({type(exc).__name__})."}
