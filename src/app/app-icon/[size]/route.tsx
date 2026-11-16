import { ImageResponse } from "next/og";
import { mascotSvg } from "../../mascot-svg";

const SIZES = new Set([180, 192, 512]);

/** PNG app icons for the home screen (sun mascot on the brand peach, maskable-safe padding). */
export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const size = Number((await params).size);
  if (!SIZES.has(size)) return new Response("Not found", { status: 404 });
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(mascotSvg(null))}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffd9a8" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={size * 0.8} height={size * 0.8} alt="" />
      </div>
    ),
    { width: size, height: size, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
