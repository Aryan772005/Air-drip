from __future__ import annotations

import json
import os
import re
from collections import defaultdict
from typing import Any

import requests

from .conditions import get_conditions

HISTORY: dict[str, list[dict[str, str]]] = defaultdict(list)
DEFAULT_CITY = "Ludhiana"
_CITY_RE = re.compile(r"\b(?:in|for|at|of|ka|ki|ke|mein|me|near)\s+([A-Za-z][A-Za-z .'-]{1,40}?)(?=\s+(?:ka|ki|ke|mein|me|today|tomorrow|weather|aqi|pollution)\b|[?!.]|$)", re.I)
_KNOWN_CITIES = ("Ludhiana", "Delhi", "New Delhi", "Mumbai", "Chandigarh", "Amritsar", "Jalandhar", "Patiala", "Noida", "Gurgaon", "Bengaluru", "Kolkata", "Chennai", "Hyderabad", "Pune", "Jaipur")


def extract_city(message: str, context: dict[str, Any] | None = None) -> str:
    if context:
        if context.get("city"):
            return str(context["city"])
        if context.get("lat") is not None and context.get("lon") is not None:
            return DEFAULT_CITY
    for city in sorted(_KNOWN_CITIES, key=len, reverse=True):
        if re.search(rf"\b{re.escape(city)}\b", message, re.I):
            return city
    match = _CITY_RE.search(message.strip())
    if match:
        candidate = re.sub(r"\s+", " ", match.group(1)).strip(" .,!?-")
        if candidate:
            return candidate
    return DEFAULT_CITY


def detect_intent(message: str) -> str:
    text = message.casefold()
    if any(k in text for k in ("diwali", "firecracker", "firework", "patakhe", "patakha", "cracker")):
        return "diwali"
    if any(k in text for k in ("aqi", "air quality", "pollution", "pm2.5", "smog", "hawa")):
        return "aqi"
    if any(k in text for k in ("weather", "rain", "baarish", "barish", "temperature", "forecast", "wind")):
        return "weather"
    return "other"


def _fallback(message: str, context: dict[str, Any] | None = None) -> tuple[str, dict[str, Any] | None]:
    intent = detect_intent(message)
    if intent == "other":
        return "I can help with weather, air quality, and Diwali pollution. Aap kis shehar ke baare mein poochna chahenge?", None
    city = extract_city(message, context)
    result = get_conditions(city, (context or {}).get("lat"), (context or {}).get("lon"))
    if result.get("error"):
        if re.search(r"[\u0900-\u097F]|\b(kya|hai|ka|ki|mein|aaj|hogi)\b", message, re.I):
            return "Maaf kijiye, weather aur air-quality data source abhi unreachable hai.", result
        return "Sorry, the weather and air-quality data source is unreachable right now.", result
    if intent == "aqi":
        pm = result.get("pm25") or {}
        if not pm:
            return f"{city} ka PM2.5 data abhi available nahi hai.", result
        if re.search(r"[\u0900-\u097F]|\b(kya|hai|ka|ki|mein|aaj)\b", message, re.I):
            advice = {
                "Good": "Aam outdoor activities theek hain.",
                "Satisfactory": "Sensitive log lambi outdoor activity kam rakhein.",
                "Moderate": "Lung ya heart condition wale bahar ki mehnat kam karein.",
                "Poor": "Bahar ka time kam karein; bachche aur buzurg ghar mein rahein.",
                "Very Poor": "Bahar exercise avoid karein; zaroorat par achha mask pehnein.",
                "Severe": "Ghar ke andar rahein, khidkiyan band rakhein; bachchon aur buzurgon ka dhyan rakhein.",
            }.get(pm["category"], "Bahar jaate waqt ehtiyaat rakhein.")
            reply = f"{city} mein PM2.5 {pm['pm25_ugm3']} {chr(181)}g/m{chr(179)} hai; approximate AQI {pm['aqi_approx']} ({pm['category']}). Yeh modelled estimate hai, official CPCB reading nahi. {advice}"
        else:
            reply = f"{city}: PM2.5 is {pm['pm25_ugm3']} µg/m³; approximate AQI {pm['aqi_approx']} ({pm['category']}). This is modelled, not an official CPCB reading. {pm['advisory']}"
    elif intent == "diwali":
        peak = result.get("peak_next_72h")
        if re.search(r"[\u0900-\u097F]|\b(kya|hai|ka|ki|mein|aaj)\b", message, re.I):
            value = f"Agale 72 ghanton ka PM2.5 peak {peak} µg/m³ tak forecast hai. " if peak is not None else "72-hour peak data available nahi hai. "
            reply = f"{city} mein patakhon se aam taur par shaam 7–11 baje pollution spike hota hai. {value}Bachchon aur buzurgon ko us waqt ghar ke andar rakhein."
        else:
            value = f"The forecast 72-hour PM2.5 peak is {peak} µg/m³. " if peak is not None else "The 72-hour peak is unavailable. "
            reply = f"In {city}, fireworks typically cause an evening pollution spike around 7–11 PM. {value}Keep children and older adults indoors during that window."
    else:
        current = result.get("weather", {})
        outlook = result.get("outlook_12h", [])
        rain = max((x.get("precipitation_probability_pct", 0) or 0 for x in outlook), default=0)
        if re.search(r"[\u0900-\u097F]|\b(kya|hai|ka|ki|mein|aaj|hogi)\b", message, re.I):
            reply = f"{city} mein abhi temperature {current.get('temperature_2m', 'N/A')}°C hai. Agle 12 ghanton mein baarish ki maximum sambhavana {rain}% hai. Bahar jaane se pehle forecast dobara check karein."
        else:
            reply = f"{city} is {current.get('temperature_2m', 'N/A')}°C now. The highest rain chance over the next 12 hours is {rain}%. Check again before heading out."
    return reply, result


SYSTEM = "You are DiwaliAir Assistant, a concise weather and air-quality helper. Reply in the user's language, 3-6 short lines, answer first then a practical tip. For any weather, AQI, pollution or firecracker-air question you MUST call get_conditions before answering and use only returned values. If data errors, say the source is unreachable. AQI is approximate modelled PM2.5, never official CPCB. Diwali/firecracker answers mention the 7-11 PM spike and the 72h peak when available. For unrelated questions say you only help with weather/air quality. If city omitted use Ludhiana."


def _gemini(message: str, history: list[dict[str, str]], context: dict[str, Any] | None) -> tuple[str, dict[str, Any] | None]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("no API key")
    contents: list[dict[str, Any]] = [
        {"role": "model" if m["role"] == "assistant" else "user", "parts": [{"text": m["content"]}]}
        for m in history
    ]
    context_hint = f" Selected map context: {json.dumps(context)}." if context else ""
    contents.append({"role": "user", "parts": [{"text": message + context_hint}]})
    data_out = None
    for _ in range(3):
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')}:generateContent",
            params={"key": api_key},
            headers={"content-type": "application/json"},
            json={
                "systemInstruction": {"parts": [{"text": SYSTEM}]},
                "tools": [{"functionDeclarations": [{
                    "name": "get_conditions",
                    "description": "Get current weather, 12-hour forecast, PM2.5 AQI estimate and 72-hour peak for a city or map coordinates.",
                    "parameters": {"type": "object", "properties": {"city": {"type": "string"}, "lat": {"type": "number"}, "lon": {"type": "number"}, "required": ["city"]}},
                }]}],
                "contents": contents,
                "generationConfig": {"maxOutputTokens": 500},
            },
            timeout=18,
        )
        response.raise_for_status()
        payload = response.json()
        candidate = (payload.get("candidates") or [{}])[0]
        model_content = candidate.get("content", {})
        parts = model_content.get("parts", [])
        calls = [part["functionCall"] for part in parts if "functionCall" in part and part["functionCall"].get("name") == "get_conditions"]
        if not calls:
            return "".join(p.get("text", "") for p in parts), data_out
        contents.append(model_content)
        responses = []
        for call in calls:
            args = call.get("args", {})
            data_out = get_conditions(args.get("city") or DEFAULT_CITY, args.get("lat"), args.get("lon"))
            responses.append({"functionResponse": {"name": "get_conditions", "response": data_out}})
        contents.append({"role": "user", "parts": responses})
    raise RuntimeError("tool call loop exceeded")


def answer(message: str, session_id: str = "default", context: dict[str, Any] | None = None) -> dict[str, Any]:
    history = HISTORY[session_id][-10:]
    try:
        reply, data = _gemini(message, history, context)
        if detect_intent(message) != "other" and data is None:
            raise RuntimeError("weather intent did not use tool")
    except Exception:
        reply, data = _fallback(message, context)
    HISTORY[session_id].extend([{"role": "user", "content": message}, {"role": "assistant", "content": reply}])
    HISTORY[session_id] = HISTORY[session_id][-10:]
    return {"reply": reply, "data": data}
