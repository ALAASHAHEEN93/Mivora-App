import { getPrisma } from "@/data/db/client";

export const dynamic = "force-dynamic";

/** Liveness check for the container and the reverse proxy. Reveals nothing beyond ok/not ok. */
export async function GET() {
  try {
    if (process.env.DATABASE_URL) await getPrisma().$queryRaw`SELECT 1`;
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
