"""Tests for the personal assistant agent."""

from assistant.agent import handle_message
from assistant.storage import add_note, list_notes


def test_add_and_list_notes():
    add_note("test note from pytest")
    notes = list_notes()
    assert any(n["content"] == "test note from pytest" for n in notes)


def test_handle_add_note_message():
    result = handle_message("add note: schedule solar consultation")
    assert "saved" in result["reply"].lower()
    assert result["steps"][0]["tool"] == "add_note"


def test_handle_list_tasks():
    result = handle_message("list tasks")
    assert result["steps"][0]["tool"] == "list_tasks"


def test_handle_help():
    result = handle_message("help")
    assert "personal assistant" in result["reply"].lower()
