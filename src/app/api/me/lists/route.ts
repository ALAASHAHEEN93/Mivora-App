import { getPrisma } from "@/data/db/client";
import { getCurrentUser } from "@/server/auth/session";
import { addToList, assignChildren, getLists, mergeLists, removeFromList, validateListValue, type ListName } from "@/server/lists";

export const dynamic = "force-dynamic";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

/** Rejects cross-site writes: the request must come from our own origin. */
function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json({ error: "unauthorized" }, 401);
  return json({ userId: user.id, ...(await getLists(getPrisma(), user.id)) });
}

/** Body: {op:"add"|"remove", list, value} · {op:"merge", saved:[], planned:[]} · {op:"assign", value:key, childIds:[]}. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const user = await getCurrentUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const db = getPrisma();

  if (body.op === "merge") {
    const saved = Array.isArray(body.saved) ? body.saved : [];
    const planned = Array.isArray(body.planned) ? body.planned : [];
    return json({ userId: user.id, ...(await mergeLists(db, user.id, { saved, planned })) });
  }

  if (body.op === "assign") {
    const key = validateListValue("planned", body.value);
    if (!key) return json({ error: "bad_request" }, 400);
    return (await assignChildren(db, user.id, key, body.childIds)) ? json({ ok: true }) : json({ error: "not_found" }, 404);
  }

  const list = body.list === "saved" || body.list === "planned" ? (body.list as ListName) : null;
  const value = list ? validateListValue(list, body.value) : null;
  if (!list || !value || (body.op !== "add" && body.op !== "remove")) return json({ error: "bad_request" }, 400);

  if (body.op === "add") {
    if (!(await addToList(db, user.id, list, value))) return json({ error: "limit" }, 409);
  } else {
    await removeFromList(db, user.id, list, value);
  }
  return json({ ok: true });
}
