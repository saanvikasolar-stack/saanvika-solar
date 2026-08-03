# saanvika-solar — Personal Assistant Agent

A lightweight personal assistant agent you can run from the CLI or over HTTP. It manages notes, tasks, and reminders using a local rule-based planner by default, with optional OpenAI-backed natural language when `OPENAI_API_KEY` is set.

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
pip install -e .

# One-shot
assistant "add note: follow up with solar client"
assistant "list notes"

# Interactive chat
assistant -i

# API server (default http://127.0.0.1:8765)
python -m assistant.server
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/chat` | POST | Send a message; returns `reply` and tool `steps` |

Example:

```bash
curl -s http://127.0.0.1:8765/health
curl -s -X POST http://127.0.0.1:8765/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"add task: site survey"}'
```

## Configuration

Copy `.env.example` to `.env` and adjust as needed:

- `OPENAI_API_KEY` — enables LLM planning for free-form messages
- `OPENAI_MODEL` — defaults to `gpt-4o-mini`
- `ASSISTANT_DATA_DIR` — where notes/tasks are stored (default `./data`)
- `ASSISTANT_HOST` / `ASSISTANT_PORT` — API bind address

## Development

```bash
ruff check assistant tests
pytest -q
```

## Example commands

| Message | Action |
|---------|--------|
| `add note: buy panels` | Save a note |
| `list notes` | Show all notes |
| `add task: call installer` | Add a task |
| `list tasks` | Show open tasks |
| `complete task 1` | Mark task done |
| `remind me tomorrow 9am to review proposal` | Set reminder |
| `what time is it?` | Current UTC time |
| `help` | Show available commands |

Data is persisted as JSON under `data/` (gitignored).
