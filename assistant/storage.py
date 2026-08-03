"""JSON file persistence for assistant data."""

from __future__ import annotations

import json
import os
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


def _data_dir() -> Path:
    base = os.environ.get("ASSISTANT_DATA_DIR", "./data")
    path = Path(base)
    path.mkdir(parents=True, exist_ok=True)
    return path


def _load(name: str) -> list[dict[str, Any]]:
    path = _data_dir() / f"{name}.json"
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def _save(name: str, items: list[dict[str, Any]]) -> None:
    path = _data_dir() / f"{name}.json"
    with path.open("w", encoding="utf-8") as f:
        json.dump(items, f, indent=2)


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


def add_note(content: str) -> dict[str, Any]:
    notes = _load("notes")
    note = {"id": len(notes) + 1, "content": content.strip(), "created_at": _now_iso()}
    notes.append(note)
    _save("notes", notes)
    return note


def list_notes() -> list[dict[str, Any]]:
    return _load("notes")


def add_task(title: str, due: str | None = None) -> dict[str, Any]:
    tasks = _load("tasks")
    task = {
        "id": len(tasks) + 1,
        "title": title.strip(),
        "due": due,
        "done": False,
        "created_at": _now_iso(),
    }
    tasks.append(task)
    _save("tasks", tasks)
    return task


def list_tasks(include_done: bool = False) -> list[dict[str, Any]]:
    tasks = _load("tasks")
    if include_done:
        return tasks
    return [t for t in tasks if not t.get("done")]


def complete_task(task_id: int) -> dict[str, Any] | None:
    tasks = _load("tasks")
    for task in tasks:
        if task["id"] == task_id:
            task["done"] = True
            task["completed_at"] = _now_iso()
            _save("tasks", tasks)
            return task
    return None


def add_reminder(message: str, remind_at: str) -> dict[str, Any]:
    reminders = _load("reminders")
    reminder = {
        "id": len(reminders) + 1,
        "message": message.strip(),
        "remind_at": remind_at.strip(),
        "created_at": _now_iso(),
        "triggered": False,
    }
    reminders.append(reminder)
    _save("reminders", reminders)
    return reminder


def list_reminders() -> list[dict[str, Any]]:
    return _load("reminders")
