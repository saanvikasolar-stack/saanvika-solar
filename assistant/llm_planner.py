"""Optional OpenAI-backed planner for natural language."""

from __future__ import annotations

import json
import os
from typing import Any

from assistant.tools import TOOLS


def _openai_available() -> bool:
    return bool(os.environ.get("OPENAI_API_KEY"))


def plan(user_message: str) -> list[dict[str, Any]] | None:
    """Return tool calls from the LLM, or None if LLM is unavailable."""
    if not _openai_available():
        return None

    try:
        from openai import OpenAI
    except ImportError:
        return None

    tool_descriptions = [
        {
            "name": name,
            "description": meta["description"],
            "parameters": meta.get("parameters") or {},
        }
        for name, meta in TOOLS.items()
    ]

    system = (
        "You are a personal assistant agent. Given the user message, respond with a JSON array "
        "of tool calls. Each item must have 'tool' (string) and 'args' (object). "
        "Use only these tools: "
        + json.dumps(tool_descriptions)
        + ". If the user is greeting or chatting without needing a tool, return "
        "[{\"tool\": \"__chat__\", \"args\": {\"message\": \"your friendly reply\"}}]."
    )

    client = OpenAI()
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_message},
        ],
        temperature=0.2,
    )
    raw = response.choices[0].message.content or "[]"
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]
        raw = raw.rsplit("```", 1)[0].strip()
    calls = json.loads(raw)
    if not isinstance(calls, list):
        raise TypeError("LLM returned non-list plan")
    return calls
