import { getPrisma } from "@/data/db/client";
import { exportAccount } from "@/server/family";
import { getCurrentUser } from "@/server/auth/session";

export const dynamic = "force-dynamic";

/** Downloads everything stored about the signed-in parent as JSON. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const data = await exportAccount(getPrisma(), user.id);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mivora-daten.json"',
      "Cache-Control": "no-store",
    },
  });
}
