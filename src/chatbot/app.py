from __future__ import annotations

from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .chat import answer

app = FastAPI(title="DiwaliAir Chatbot", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=[], allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?", allow_methods=["GET", "POST"], allow_headers=["*"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: str = "default"
    context: dict[str, Any] | None = None


@app.post("/chat")
def chat(request: ChatRequest) -> dict[str, Any]:
    return answer(request.message, request.session_id, request.context)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
