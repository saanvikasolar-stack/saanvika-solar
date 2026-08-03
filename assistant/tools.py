"""Tool registry for the personal assistant agent."""

from __future__ import annotations

from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any

from assistant import storage

ToolFn = Callable[..., Any]

TOOLS: dict[str, dict[str, Any]] = {
    "add_note": {
        "description": "Save a note for later reference.",
        "parameters": {"content": "string — note text"},
        "fn": lambda content: storage.add_note(content),
    },
    "list_notes": {
        "description": "List all saved notes.",
        "parameters": {},
        "fn": lambda: storage.list_notes(),
    },
    "add_task": {
        "description": "Add a task to the to-do list.",
        "parameters": {"title": "string", "due": "optional due date string"},
        "fn": lambda title, due=None: storage.add_task(title, due),
    },
    "list_tasks": {
        "description": "List open tasks (or all if include_done=true).",
        "parameters": {"include_done": "optional boolean"},
        "fn": lambda include_done=False: storage.list_tasks(include_done=include_done),
    },
    "complete_task": {
        "description": "Mark a task as done by id.",
        "parameters": {"task_id": "integer"},
        "fn": lambda task_id: storage.complete_task(int(task_id)),
    },
    "add_reminder": {
        "description": "Schedule a reminder with a message and time.",
        "parameters": {"message": "string", "remind_at": "string — when to remind"},
        "fn": lambda message, remind_at: storage.add_reminder(message, remind_at),
    },
    "list_reminders": {
        "description": "List all reminders.",
        "parameters": {},
        "fn": lambda: storage.list_reminders(),
    },
    "get_time": {
        "description": "Return the current UTC time.",
        "parameters": {},
        "fn": lambda: datetime.now(UTC).isoformat(),
    },
}


def run_tool(name: str, **kwargs: Any) -> Any:
    if name not in TOOLS:
        raise ValueError(f"Unknown tool: {name}")
    return TOOLS[name]["fn"](**kwargs)


def tool_catalog() -> str:
    lines = ["Available tools:"]
    for name, meta in TOOLS.items():
        params = meta.get("parameters") or {}
        param_str = ", ".join(f"{k}: {v}" for k, v in params.items()) if params else "none"
        lines.append(f"  - {name}: {meta['description']} ({param_str})")
    return "\n".join(lines)
