from src.chatbot import conditions
from src.chatbot.conditions import pm25_to_aqi
from src.chatbot import chat


def test_aqi_conversion_bands():
    assert pm25_to_aqi(10)["category"] == "Good"
    assert pm25_to_aqi(45)["category"] == "Satisfactory"
    assert pm25_to_aqi(75)["category"] == "Moderate"
    assert pm25_to_aqi(110)["category"] == "Poor"
    assert pm25_to_aqi(180)["category"] == "Very Poor"
    assert pm25_to_aqi(300)["category"] == "Severe"
    assert "not official" in pm25_to_aqi(45)["basis"]


def test_open_meteo_http_is_mocked_and_cached(monkeypatch):
    calls = []
    class FakeResponse:
        def __init__(self, payload): self.payload = payload
        def raise_for_status(self): pass
        def json(self): return self.payload
    def fake_get(url, **kwargs):
        calls.append(url)
        if "geocoding" in url:
            return FakeResponse({"results": [{"name": "Ludhiana", "latitude": 30.9, "longitude": 75.8}]})
        if "air-quality" in url:
            return FakeResponse({"current": {"pm2_5": 42}, "hourly": {"pm2_5": [42, 55, 39]}})
        return FakeResponse({"current": {"time": "2026-11-01T10:00", "temperature_2m": 24}, "hourly": {"time": [f"2026-11-01T{h:02d}:00" for h in range(24)], "temperature_2m": [24] * 24, "precipitation_probability": [10] * 24}})
    monkeypatch.setattr(conditions.requests, "get", fake_get)
    conditions._CACHE.clear()
    result = conditions.get_conditions("Ludhiana")
    assert result["pm25"]["category"] == "Satisfactory"
    assert result["peak_next_72h"] == 55
    assert len(result["outlook_12h"]) == 12
    conditions.get_conditions("Ludhiana")
    assert len(calls) == 3


def test_gemini_calls_conditions_function(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    seen = []
    class FakeResponse:
        def __init__(self, payload): self.payload = payload
        def raise_for_status(self): pass
        def json(self): return self.payload
    def fake_post(url, **kwargs):
        seen.append(kwargs["json"])
        if len(seen) == 1:
            return FakeResponse({"candidates": [{"content": {"role": "model", "parts": [{"functionCall": {"name": "get_conditions", "args": {"city": "Ludhiana"}}}]}}]})
        assert seen[1]["contents"][-1]["parts"][0]["functionResponse"]["response"]["pm25"]["aqi_approx"] == 70
        return FakeResponse({"candidates": [{"content": {"parts": [{"text": "Approximate AQI 70."}]}}]})
    monkeypatch.setattr(chat.requests, "post", fake_post)
    monkeypatch.setattr(chat, "get_conditions", lambda *args: {"pm25": {"aqi_approx": 70}})
    reply, data = chat._gemini("Ludhiana ka AQI?", [], None)
    assert reply == "Approximate AQI 70."
    assert data == {"pm25": {"aqi_approx": 70}}


def test_city_extraction():
    assert chat.extract_city("Ludhiana ka AQI kya hai?") == "Ludhiana"
    assert chat.extract_city("Weather in Mumbai today") == "Mumbai"
    assert chat.extract_city("AQI kya hai?") == "Ludhiana"
    assert chat.extract_city("rain?", {"city": "Delhi"}) == "Delhi"


def test_intent_detection():
    assert chat.detect_intent("Aaj baarish hogi?") == "weather"
    assert chat.detect_intent("Ludhiana ka AQI kya hai?") == "aqi"
    assert chat.detect_intent("Diwali night patakhe pollution") == "diwali"
    assert chat.detect_intent("Tell me a joke") == "other"


def test_fallback_reply_mocked(monkeypatch):
    sample = {"city": "Ludhiana", "weather": {"temperature_2m": 24}, "outlook_12h": [{"precipitation_probability_pct": 10}], "pm25": {"pm25_ugm3": 42, "aqi_approx": 70, "category": "Satisfactory", "advisory": "Take care", "basis": "Approximate"}, "peak_next_72h": 58}
    monkeypatch.setattr(chat, "_gemini", lambda *args: (_ for _ in ()).throw(RuntimeError()))
    monkeypatch.setattr(chat, "get_conditions", lambda *args: sample)
    chat.HISTORY.clear()
    aqi = chat.answer("Ludhiana ka AQI kya hai?", "test-aqi")
    assert "approximate AQI 70" in aqi["reply"]
    assert "modelled" in aqi["reply"]
    diwali = chat.answer("Diwali night pollution?", "test-diwali")
    assert "7–11" in diwali["reply"]
    assert "58" in diwali["reply"]
    assert "24°C" in chat.answer("Aaj baarish hogi?", "test-weather")["reply"]
    assert chat.answer("Tell me a joke", "test-other")["data"] is None


def test_history_keeps_last_ten():
    chat.HISTORY["history-test"] = [{"role": "user", "content": str(i)} for i in range(15)]
    chat.answer("Tell me a joke", "history-test")
    assert len(chat.HISTORY["history-test"]) == 10
