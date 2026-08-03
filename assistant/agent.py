"""Personal assistant agent — plans user requests and runs tools."""

from __future__ import annotations

import json
from typing import Any

from assistant import llm_planner, local_planner
from assistant.tools import run_tool


def _format_result(tool: str, result: Any) -> str:
    if tool == "get_time":
        return f"Current time (UTC): {result}"
    if tool in {"list_notes", "list_tasks", "list_reminders"}:
        if not result:
            return f"No {tool.replace('list_', '')} yet."
        return json.dumps(result, indent=2)
    if tool == "add_note":
        return f"Note #{result['id']} saved."
    if tool == "add_task":
        return f"Task #{result['id']} added: {result['title']}"
    if tool == "complete_task":
        if result is None:
            return "Task not found."
        return f"Task #{result['id']} marked complete."
    if tool == "add_reminder":
        return f"Reminder #{result['id']} set for {result['remind_at']}."
    return json.dumps(result, indent=2)


def handle_message(user_message: str) -> dict[str, Any]:
    """Process one user message and return structured response."""
    calls = llm_planner.plan(user_message)
    if calls is None:
        calls = local_planner.plan(user_message)

    steps: list[dict[str, Any]] = []
    replies: list[str] = []

    for call in calls:
        tool = call.get("tool", "")
        args = call.get("args") or {}

        if tool == "__help__":
            reply = local_planner.format_help()
            steps.append({"tool": tool, "args": args, "result": reply})
            replies.append(reply)
            continue

        if tool == "__unknown__":
            reply = (
                "I didn't understand that. "
                + local_planner.format_help().split("\n\n")[0]
            )
            steps.append({"tool": tool, "args": args, "result": reply})
            replies.append(reply)
            continue

        if tool == "__chat__":
            reply = str(args.get("message", ""))
            steps.append({"tool": tool, "args": args, "result": reply})
            replies.append(reply)
            continue

        try:
            result = run_tool(tool, **args)
            reply = _format_result(tool, result)
        except Exception as exc:  # noqa: BLE001 — surface tool errors to user
            reply = f"Error running {tool}: {exc}"
            result = {"error": str(exc)}

        steps.append({"tool": tool, "args": args, "result": result})
        replies.append(reply)

    return {
        "message": user_message,
        "steps": steps,
        "reply": "\n".join(replies) if replies else "Done.",
    }
