import { getPrisma } from "@/data/db/client";
import { readPhoto } from "@/server/photos";
import { photoAccess } from "@/server/listings";
import { accountsAvailable, getCurrentUser } from "@/server/auth/session";

export const dynamic = "force-dynamic";

/** Serves uploaded listing photos. Unpublished photos only reach their provider and admins. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const notFound = () => new Response("Not found", { status: 404 });
  if (!accountsAvailable()) return notFound();
  const { id } = await params;
  const data = await readPhoto(id);
  if (!data) return notFound();
  const user = await getCurrentUser();
  const access = await photoAccess(getPrisma(), id, user ? { id: user.id, email: user.email } : null);
  if (!access) return notFound();
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": access === "public" ? "public, max-age=86400" : "private, no-store",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Content-Disposition": "inline",
    },
  });
}
