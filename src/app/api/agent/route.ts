import { NextResponse } from "next/server";
import { runMarketingAgent, type AgentRequest } from "@/lib/agent";
import { CONTENT_MODES, type ContentMode } from "@/lib/brand";

const VALID_MODES = new Set(CONTENT_MODES.map((m) => m.id));

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AgentRequest>;
    const mode = body.mode as ContentMode;
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    const language = body.language === "te" ? "te" : "en";

    if (!VALID_MODES.has(mode)) {
      return NextResponse.json(
        { error: "Invalid content mode." },
        { status: 400 }
      );
    }

    if (!prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const result = await runMarketingAgent({ mode, prompt, language });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
