"""HTTP API for the personal assistant agent."""

from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel, Field

from assistant.agent import handle_message

load_dotenv()

app = FastAPI(
    title="Personal Assistant Agent",
    description="Agent API for notes, tasks, reminders, and chat",
    version="0.1.0",
)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, examples=["add note: follow up with client"])


class ChatResponse(BaseModel):
    message: str
    reply: str
    steps: list[dict]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest) -> ChatResponse:
    result = handle_message(body.message)
    return ChatResponse(
        message=result["message"],
        reply=result["reply"],
        steps=result["steps"],
    )


def run() -> None:
    import uvicorn

    host = os.environ.get("ASSISTANT_HOST", "127.0.0.1")
    port = int(os.environ.get("ASSISTANT_PORT", "8765"))
    uvicorn.run("assistant.server:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    run()
