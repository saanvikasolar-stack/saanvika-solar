import type { APIRoute } from "astro";
import { resolveOpsAccess } from "../../../lib/ops-auth";

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const GET: APIRoute = async () => {
  const access = await resolveOpsAccess();
  if (access.status === "ok") {
    return json(200, {
      ok: true,
      session: {
        name: access.session.name,
        email: access.session.email,
        role: access.session.role,
        staffId: access.session.staffId,
      },
    });
  }
  if (access.status === "not_staff") {
    return json(403, {
      ok: false,
      error: "not_staff",
      email: access.email,
      loginUrl: "/login",
    });
  }
  return json(401, {
    ok: false,
    error: "unauthorized",
    loginUrl: "/api/auth/login?returnToUrl=/ops/index.html",
  });
};
