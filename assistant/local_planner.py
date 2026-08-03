"""Rule-based planner — works without an LLM API key."""

from __future__ import annotations

import re
from typing import Any

from assistant.tools import tool_catalog


def plan(user_message: str) -> list[dict[str, Any]]:
    """Return a list of tool calls inferred from the user message."""
    text = user_message.strip()
    lower = text.lower()

    if not text:
        return []

    if lower in {"help", "?", "commands"}:
        return [{"tool": "__help__", "args": {}}]

    # Notes
    note_match = re.match(
        r"^(?:add\s+note|note|remember|save\s+note)\s*:?\s*(.+)$",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if note_match:
        return [{"tool": "add_note", "args": {"content": note_match.group(1).strip()}}]

    if re.search(r"\b(list|show)\s+notes\b", lower):
        return [{"tool": "list_notes", "args": {}}]

    # Tasks
    task_match = re.match(
        r"^(?:add\s+task|task|todo)\s*:?\s*(.+)$",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if task_match:
        return [{"tool": "add_task", "args": {"title": task_match.group(1).strip()}}]

    if re.search(r"\b(list|show)\s+(?:tasks|todos)\b", lower):
        return [{"tool": "list_tasks", "args": {}}]

    complete_match = re.match(
        r"^(?:complete|done|finish)\s+task\s+#?(\d+)$",
        text,
        re.IGNORECASE,
    )
    if complete_match:
        return [{"tool": "complete_task", "args": {"task_id": int(complete_match.group(1))}}]

    # Reminders
    reminder_match = re.match(
        r"^(?:remind\s+me|reminder)\s+(?:at\s+)?(.+?)\s+(?:to\s+)?(.+)$",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if reminder_match:
        return [
            {
                "tool": "add_reminder",
                "args": {
                    "remind_at": reminder_match.group(1).strip(),
                    "message": reminder_match.group(2).strip(),
                },
            }
        ]

    if re.search(r"\b(list|show)\s+reminders\b", lower):
        return [{"tool": "list_reminders", "args": {}}]

    # Time
    if re.search(r"\b(what\s+time|current\s+time|time\s+now)\b", lower):
        return [{"tool": "get_time", "args": {}}]

    return [{"tool": "__unknown__", "args": {"message": text}}]


def format_help() -> str:
    return (
        "I'm your personal assistant. Try:\n"
        "  - add note: buy solar panels\n"
        "  - list notes\n"
        "  - add task: schedule site survey\n"
        "  - list tasks\n"
        "  - complete task 1\n"
        "  - remind me tomorrow 9am to call the client\n"
        "  - list reminders\n"
        "  - what time is it?\n\n"
        + tool_catalog()
        + "\n\nSet OPENAI_API_KEY for natural-language planning beyond these patterns."
    )
