import type { APIRoute } from "astro";
import { resolveOpsSession } from "../../../lib/ops-auth";

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const GET: APIRoute = async () => {
  const session = await resolveOpsSession();
  if (!session) {
    return json(401, {
      ok: false,
      error: "unauthorized",
      loginUrl: "/api/auth/login?returnToUrl=/ops",
    });
  }
  return json(200, {
    ok: true,
    session: {
      name: session.name,
      email: session.email,
      role: session.role,
      staffId: session.staffId,
    },
  });
};
