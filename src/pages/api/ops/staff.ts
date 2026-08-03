import type { APIRoute } from "astro";
import {
  deactivateOpsStaff,
  inviteOpsStaff,
  listOpsStaff,
  resolveOpsSession,
} from "../../../lib/ops-auth";

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const GET: APIRoute = async () => {
  const session = await resolveOpsSession();
  if (!session) return json(401, { ok: false, error: "unauthorized" });
  if (session.role !== "owner") return json(403, { ok: false, error: "owner_only" });

  const staff = await listOpsStaff();
  return json(200, {
    ok: true,
    staff: staff.map((s) => ({
      id: s._id,
      email: s.email,
      name: s.name,
      role: s.role,
      active: s.active,
    })),
  });
};

export const POST: APIRoute = async ({ request }) => {
  const session = await resolveOpsSession();
  if (!session) return json(401, { ok: false, error: "unauthorized" });
  if (session.role !== "owner") return json(403, { ok: false, error: "owner_only" });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "Invalid JSON body." });
  }

  try {
    const result = await inviteOpsStaff({
      email: String(body.email || ""),
      name: String(body.name || ""),
      role: body.role === "owner" ? "owner" : "staff",
    });
    return json(200, {
      ok: true,
      staff: {
        id: result.staff._id,
        email: result.staff.email,
        name: result.staff.name,
        role: result.staff.role,
        active: result.staff.active,
      },
      createdMember: result.createdMember,
      passwordEmailSent: result.passwordEmailSent,
    });
  } catch (err: any) {
    return json(400, { ok: false, error: String(err?.message || "Invite failed.") });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const session = await resolveOpsSession();
  if (!session) return json(401, { ok: false, error: "unauthorized" });
  if (session.role !== "owner") return json(403, { ok: false, error: "owner_only" });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "Invalid JSON body." });
  }
  const staffId = String(body.staffId || "");
  if (!staffId) return json(400, { ok: false, error: "staffId required." });

  try {
    await deactivateOpsStaff(staffId, session);
    return json(200, { ok: true });
  } catch (err: any) {
    return json(400, { ok: false, error: String(err?.message || "Remove failed.") });
  }
};
