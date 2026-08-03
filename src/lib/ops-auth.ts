import { members } from "@wix/members";
import { items } from "@wix/data";
import { auth, httpClient } from "@wix/essentials";

export type OpsRole = "owner" | "staff";

export interface OpsStaffRecord {
  _id: string;
  email: string;
  name: string;
  role: OpsRole;
  active: boolean;
  memberId?: string;
}

export interface OpsSession {
  memberId: string;
  email: string;
  name: string;
  role: OpsRole;
  staffId: string;
}

const STAFF_COLLECTION = "OpsStaff";

function normalizeEmail(email: string | undefined | null): string {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function memberIdOf(member: any): string {
  return String(member?._id || member?.id || "");
}

export async function getCurrentMemberSafe() {
  try {
    const res = await members.getCurrentMember({ fieldsets: ["FULL"] as any });
    if ((res as any)?.member) return (res as any).member;
    if ((res as any)?._id || (res as any)?.id) return res as any;
    return null;
  } catch {
    return null;
  }
}

function mapStaffRow(row: any): OpsStaffRecord {
  return {
    _id: String(row._id),
    email: normalizeEmail(row.email as string),
    name: String(row.name || ""),
    role: (row.role === "owner" ? "owner" : "staff") as OpsRole,
    active: row.active !== false,
    memberId: row.memberId ? String(row.memberId) : undefined,
  };
}

async function queryStaffByEmail(email: string): Promise<OpsStaffRecord | null> {
  try {
    const elevatedQuery = auth.elevate(items.query);
    const { items: rows } = await elevatedQuery(STAFF_COLLECTION)
      .eq("email", email)
      .limit(20)
      .find();
    const row = rows.find((r: any) => r.active !== false) ?? rows[0];
    return row ? mapStaffRow(row) : null;
  } catch (err) {
    console.error("[ops-auth] staff-by-email query failed", err);
    return null;
  }
}

async function queryStaffByMemberId(memberId: string): Promise<OpsStaffRecord | null> {
  try {
    const elevatedQuery = auth.elevate(items.query);
    const { items: rows } = await elevatedQuery(STAFF_COLLECTION)
      .eq("memberId", memberId)
      .limit(20)
      .find();
    const row = rows.find((r: any) => r.active !== false) ?? rows[0];
    return row ? mapStaffRow(row) : null;
  } catch (err) {
    console.error("[ops-auth] staff-by-memberId query failed", err);
    return null;
  }
}

export type OpsAccessResult =
  | { status: "ok"; session: OpsSession }
  | { status: "anonymous" }
  | { status: "not_staff"; email?: string; name?: string };

/** Resolve logged-in Wix member → allowlisted Ops staff, with clear denial reason. */
export async function resolveOpsAccess(): Promise<OpsAccessResult> {
  const member = await getCurrentMemberSafe();
  const memberId = memberIdOf(member);
  if (!member || !memberId) return { status: "anonymous" };

  const email = normalizeEmail(member.loginEmail);
  let staff =
    (await queryStaffByMemberId(memberId)) ||
    (email ? await queryStaffByEmail(email) : null);

  // Fallback: scan staff list (small allowlist) if equality filters miss.
  if (!staff) {
    try {
      const all = await listOpsStaff();
      staff =
        all.find((s) => s.active && (s.memberId === memberId || (email && s.email === email))) ||
        null;
    } catch (err) {
      console.error("[ops-auth] staff list fallback failed", err);
    }
  }

  if (!staff || !staff.active) {
    return {
      status: "not_staff",
      email: email || undefined,
      name: member.profile?.nickname || undefined,
    };
  }

  // Backfill memberId when staff was invited by email before first login.
  if (!staff.memberId && email) {
    try {
      const elevatedUpdate = auth.elevate(items.update);
      await elevatedUpdate(STAFF_COLLECTION, {
        email: staff.email,
        name: staff.name,
        role: staff.role,
        active: staff.active,
        _id: staff._id,
        memberId,
      } as any);
      staff = { ...staff, memberId };
    } catch (err) {
      console.warn("[ops-auth] memberId backfill failed", err);
    }
  }

  return {
    status: "ok",
    session: {
      memberId,
      email: staff.email || email,
      name:
        staff.name ||
        member.profile?.nickname ||
        [member.contact?.firstName, member.contact?.lastName].filter(Boolean).join(" ") ||
        email,
      role: staff.role,
      staffId: staff._id,
    },
  };
}

/** Resolve logged-in Wix member → allowlisted Ops staff. Anonymous / non-staff → null. */
export async function resolveOpsSession(): Promise<OpsSession | null> {
  const access = await resolveOpsAccess();
  return access.status === "ok" ? access.session : null;
}

export async function listOpsStaff(): Promise<OpsStaffRecord[]> {
  const elevatedQuery = auth.elevate(items.query);
  const { items: rows } = await elevatedQuery(STAFF_COLLECTION).limit(100).find();
  return rows.map((row: any) => ({
    _id: String(row._id),
    email: normalizeEmail(row.email),
    name: String(row.name || ""),
    role: (row.role === "owner" ? "owner" : "staff") as OpsRole,
    active: row.active !== false,
    memberId: row.memberId ? String(row.memberId) : undefined,
  }));
}

export async function inviteOpsStaff(input: {
  email: string;
  name: string;
  role: OpsRole;
}): Promise<{ staff: OpsStaffRecord; createdMember: boolean; passwordEmailSent: boolean }> {
  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) throw new Error("Valid email is required.");
  if (!input.name?.trim()) throw new Error("Name is required.");
  const role: OpsRole = input.role === "owner" ? "owner" : "staff";

  const existing = await queryStaffByEmail(email);
  if (existing?.active) throw new Error("That email is already on the staff list.");

  let memberId: string | undefined;
  let createdMember = false;
  try {
    const created = await auth.elevate(members.createMember)({
      member: {
        loginEmail: email,
        contact: {
          firstName: input.name.trim().split(/\s+/)[0] || input.name.trim(),
          lastName: input.name.trim().split(/\s+/).slice(1).join(" ") || undefined,
        },
        profile: { nickname: input.name.trim() },
      },
    } as any);
    memberId = String((created as any)?._id || (created as any)?.id || "");
    if (!memberId) memberId = undefined;
    createdMember = !!memberId;
    if (memberId) {
      try {
        await auth.elevate(members.approveMember)(memberId);
      } catch {
        /* may already be approved */
      }
    }
  } catch (err: any) {
    const msg = String(err?.message || err || "");
    if (/already exists|ALREADY_EXISTS/i.test(msg)) {
      try {
        const result = await auth.elevate(members.queryMembers)()
          .eq("loginEmail", email)
          .limit(1)
          .find();
        const found = result.items?.[0] || result.members?.[0];
        memberId = found ? String(found._id || found.id) : undefined;
      } catch {
        /* continue without memberId */
      }
    } else {
      throw err;
    }
  }

  let passwordEmailSent = false;
  try {
    const elevatedFetch = auth.elevate(httpClient.fetchWithAuth);
    const res = await elevatedFetch(
      "https://www.wixapis.com/members/v1/auth/members/send-set-password-email",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hideIgnoreMessage: false }),
      },
    );
    passwordEmailSent = res.ok;
  } catch (err) {
    console.warn("[ops-auth] set-password email failed", err);
  }

  const elevatedInsert = auth.elevate(items.insert);
  const inserted = await elevatedInsert(STAFF_COLLECTION, {
    email,
    name: input.name.trim(),
    role,
    active: true,
    memberId: memberId || "",
  } as any);

  return {
    staff: {
      _id: String(inserted._id),
      email,
      name: input.name.trim(),
      role,
      active: true,
      memberId,
    },
    createdMember,
    passwordEmailSent,
  };
}

export async function deactivateOpsStaff(staffId: string, actor: OpsSession) {
  if (actor.role !== "owner") throw new Error("Only the owner can remove staff.");
  if (staffId === actor.staffId) throw new Error("You cannot deactivate your own account.");

  const elevatedGet = auth.elevate(items.get);
  const row = await elevatedGet(STAFF_COLLECTION, staffId);
  if (!row) throw new Error("Staff not found.");
  if (row.role === "owner") throw new Error("Cannot deactivate the owner.");

  const elevatedUpdate = auth.elevate(items.update);
  await elevatedUpdate(STAFF_COLLECTION, {
    ...row,
    _id: staffId,
    active: false,
  } as any);
}
