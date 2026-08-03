import type { APIRoute } from "astro";
import { resolveOpsSession } from "../../../lib/ops-auth";
import { loadOpsPayload, saveOpsPayload, type OpsPayload } from "../../../lib/ops-store";

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const GET: APIRoute = async () => {
  const session = await resolveOpsSession();
  if (!session) return json(401, { ok: false, error: "unauthorized" });

  const { payload, updatedAt, updatedBy } = await loadOpsPayload();
  return json(200, { ok: true, payload, updatedAt, updatedBy, role: session.role });
};

export const PUT: APIRoute = async ({ request }) => {
  const session = await resolveOpsSession();
  if (!session) return json(401, { ok: false, error: "unauthorized" });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "Invalid JSON body." });
  }

  const incoming = body?.payload as OpsPayload | undefined;
  if (!incoming || typeof incoming !== "object") {
    return json(400, { ok: false, error: "Missing payload." });
  }

  try {
    const { updatedAt } = await saveOpsPayload(incoming, session.email);
    return json(200, { ok: true, updatedAt });
  } catch (err: any) {
    console.error("[api/ops/data] save failed", err);
    return json(500, { ok: false, error: String(err?.message || "Save failed.") });
  }
};
