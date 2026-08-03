# AGENTS.md

## Project overview

This repository contains a **personal assistant agent** (`assistant/`) — a Python service that handles notes, tasks, reminders, and optional LLM-backed chat. It runs as a CLI (`assistant`) or HTTP API (`python -m assistant.server`).

## Cursor Cloud specific instructions

### Services

| Service | Command | Default URL |
|---------|---------|-------------|
| Assistant API | `python -m assistant.server` | http://127.0.0.1:8765 |

No database or Docker is required. State is stored in `./data/*.json`.

### Setup (first time)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
pip install -e .
```

The VM update script runs `pip install` only; activate the venv before running commands, or invoke tools via `.venv/bin/python` / `.venv/bin/assistant`.

### Lint and test

```bash
source .venv/bin/activate
ruff check assistant tests
pytest -q
```

### Running the API

```bash
source .venv/bin/activate
python -m assistant.server
```

Health check: `curl http://127.0.0.1:8765/health`

### LLM (optional)

Set `OPENAI_API_KEY` in `.env` for natural-language planning beyond built-in command patterns. Without it, the local rule-based planner handles structured phrases like `add note: ...` and `list tasks`.

### Gotchas

- `data/` is gitignored; each environment keeps its own notes/tasks unless `ASSISTANT_DATA_DIR` is set.
- The API binds to `127.0.0.1` by default; set `ASSISTANT_HOST=0.0.0.0` only if you need external access.
