import { items } from "@wix/data";
import { auth } from "@wix/essentials";

const STORE_COLLECTION = "OpsStore";
const WORKSPACE_ID = "workspace";

export type OpsPayload = {
  leads: unknown[];
  projects: unknown[];
  complaints: unknown[];
  inventory: unknown[];
  agents: unknown[];
  dispatches: unknown[];
};

const EMPTY: OpsPayload = {
  leads: [],
  projects: [],
  complaints: [],
  inventory: [],
  agents: [],
  dispatches: [],
};

function parsePayload(raw: unknown): OpsPayload {
  if (!raw) return { ...EMPTY, leads: [], projects: [], complaints: [], inventory: [], agents: [], dispatches: [] };
  let data: any = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch {
      return { ...EMPTY };
    }
  }
  return {
    leads: Array.isArray(data.leads) ? data.leads : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    complaints: Array.isArray(data.complaints) ? data.complaints : [],
    inventory: Array.isArray(data.inventory) ? data.inventory : [],
    agents: Array.isArray(data.agents) ? data.agents : [],
    dispatches: Array.isArray(data.dispatches) ? data.dispatches : [],
  };
}

export async function loadOpsPayload(): Promise<{
  payload: OpsPayload;
  updatedAt?: string;
  updatedBy?: string;
}> {
  try {
    const elevatedGet = auth.elevate(items.get);
    const row = await elevatedGet(STORE_COLLECTION, WORKSPACE_ID);
    if (!row) return { payload: { ...EMPTY } };
    return {
      payload: parsePayload(row.payload),
      updatedAt: row.updatedAt ? String(row.updatedAt) : undefined,
      updatedBy: row.updatedBy ? String(row.updatedBy) : undefined,
    };
  } catch (err) {
    console.error("[ops-store] load failed", err);
    return { payload: { ...EMPTY } };
  }
}

export async function saveOpsPayload(
  payload: OpsPayload,
  updatedBy: string,
): Promise<{ updatedAt: string }> {
  const updatedAt = new Date().toISOString();
  const serialized = JSON.stringify({
    leads: payload.leads || [],
    projects: payload.projects || [],
    complaints: payload.complaints || [],
    inventory: payload.inventory || [],
    agents: payload.agents || [],
    dispatches: payload.dispatches || [],
  });

  // 500 KB CMS item limit — reject oversized saves early with a clear error.
  if (serialized.length > 480_000) {
    throw new Error("Workspace is too large to save. Archive old records or contact support.");
  }

  const elevatedUpdate = auth.elevate(items.update);
  try {
    await elevatedUpdate(STORE_COLLECTION, {
      _id: WORKSPACE_ID,
      title: "Saanvika Ops Workspace",
      payload: serialized,
      updatedBy,
      updatedAt,
    } as any);
  } catch {
    const elevatedInsert = auth.elevate(items.insert);
    await elevatedInsert(STORE_COLLECTION, {
      _id: WORKSPACE_ID,
      title: "Saanvika Ops Workspace",
      payload: serialized,
      updatedBy,
      updatedAt,
    } as any);
  }

  return { updatedAt };
}
