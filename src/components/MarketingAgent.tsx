"use client";

import { useEffect, useMemo, useState } from "react";
import { CONTENT_MODES, type ContentMode } from "@/lib/brand";

type Message = {
  id: string;
  role: "user" | "agent";
  text: string;
  mode?: ContentMode;
  source?: "openai" | "local";
};

const QUICK_PROMPTS: { mode: ContentMode; label: string; prompt: string }[] = [
  {
    mode: "instagram",
    label: "Subsidy carousel",
    prompt:
      "Write an Instagram carousel caption explaining PM Surya Ghar subsidy for Kakinada homeowners. End with CTA to DM SOLAR.",
  },
  {
    mode: "whatsapp",
    label: "Site visit blast",
    prompt:
      "WhatsApp broadcast inviting homeowners for a free rooftop site visit this week.",
  },
  {
    mode: "instagram",
    label: "Reel hook",
    prompt:
      "Write 5 short Instagram Reel hooks about switching to rooftop solar in Kakinada for @saanvika_solar.",
  },
  {
    mode: "faq_reply",
    label: "3 kW subsidy FAQ",
    prompt: "A customer asked: How much subsidy do I get for a 3 kW system?",
  },
  {
    mode: "campaign_plan",
    label: "7-day plan",
    prompt:
      "Plan a 7-day Instagram + WhatsApp campaign to book free site visits for @saanvika_solar.",
  },
  {
    mode: "google_ad",
    label: "Search ads",
    prompt: "Google ads for PM Surya Ghar rooftop solar in Kakinada.",
  },
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function MarketingAgent() {
  const [mode, setMode] = useState<ContentMode>("instagram");
  const [language, setLanguage] = useState<"en" | "te">("en");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      text: "I’m your Saanvika Solar marketing agent. I create Instagram captions for @saanvika_solar, WhatsApp blasts, ads, flyer copy, FAQ replies, and campaign plans — using your real company facts from saanvikasolar.in.",
    },
  ]);

  const activeMode = useMemo(
    () => CONTENT_MODES.find((m) => m.id === mode)!,
    [mode]
  );

  useEffect(() => {
    setPrompt("");
  }, [mode]);

  async function generate(nextPrompt?: string, nextMode?: ContentMode) {
    const finalPrompt = (nextPrompt ?? prompt).trim();
    const finalMode = nextMode ?? mode;
    if (!finalPrompt || loading) return;

    setError(null);
    setLoading(true);
    setMode(finalMode);
    setPrompt(finalPrompt);

    const userMsg: Message = {
      id: uid(),
      role: "user",
      text: finalPrompt,
      mode: finalMode,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: finalMode,
          prompt: finalPrompt,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "agent",
          text: data.content,
          mode: data.mode,
          source: data.source,
        },
      ]);
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  return (
    <div className="agent-shell">
      <aside className="agent-sidebar">
        <div className="brand-mark">
          <span className="sun" aria-hidden />
          <div>
            <p className="brand-name">Saanvika Solar</p>
            <p className="brand-handle">@{`saanvika_solar`}</p>
          </div>
        </div>

        <p className="sidebar-label">Content type</p>
        <div className="mode-list">
          {CONTENT_MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={mode === item.id ? "mode active" : "mode"}
              onClick={() => setMode(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.description}</small>
            </button>
          ))}
        </div>

        <div className="sidebar-meta">
          <a
            href="https://www.instagram.com/saanvika_solar/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a href="https://saanvikasolar.in" target="_blank" rel="noreferrer">
            Website
          </a>
          <a href="https://wa.me/918519833679" target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
      </aside>

      <section className="agent-main">
        <header className="agent-header">
          <div>
            <h1>Marketing Agent</h1>
            <p>
              Create on-brand posts for <strong>@saanvika_solar</strong> and
              convert local homeowners in Kakinada.
            </p>
          </div>
          <div className="lang-toggle" role="group" aria-label="Language">
            <button
              type="button"
              className={language === "en" ? "active" : ""}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={language === "te" ? "active" : ""}
              onClick={() => setLanguage("te")}
            >
              TE
            </button>
          </div>
        </header>

        <div className="quick-row">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q.label}
              type="button"
              className="chip"
              disabled={loading}
              onClick={() => generate(q.prompt, q.mode)}
            >
              {q.label}
            </button>
          ))}
        </div>

        <div className="thread" aria-live="polite">
          {messages.map((m) => (
            <article
              key={m.id}
              className={m.role === "user" ? "bubble user" : "bubble agent"}
            >
              <div className="bubble-top">
                <span>{m.role === "user" ? "You" : "Agent"}</span>
                {m.mode ? <em>{m.mode.replace("_", " ")}</em> : null}
                {m.source ? (
                  <em className="source">
                    {m.source === "openai" ? "AI" : "Brand templates"}
                  </em>
                ) : null}
              </div>
              <pre>{m.text}</pre>
              {m.role === "agent" && m.id !== "welcome" ? (
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => copyText(m.text)}
                >
                  Copy
                </button>
              ) : null}
            </article>
          ))}
          {loading ? (
            <article className="bubble agent loading">
              <span className="pulse" />
              Drafting {activeMode.label.toLowerCase()} content…
            </article>
          ) : null}
        </div>

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            generate();
          }}
        >
          <label className="sr-only" htmlFor="prompt">
            Marketing brief
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={activeMode.promptHint}
            rows={3}
            disabled={loading}
          />
          <div className="composer-actions">
            {error ? <p className="error">{error}</p> : <span />}
            <button type="submit" disabled={loading || !prompt.trim()}>
              {loading ? "Creating…" : `Create ${activeMode.label}`}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
