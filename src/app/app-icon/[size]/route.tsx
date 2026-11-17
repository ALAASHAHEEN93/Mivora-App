import { ImageResponse } from "next/og";
import { appIconSvg } from "../../app-icon-svg";

const SIZES = new Set([180, 192, 512]);

/** PNG app icons for the home screen ("Star i" mark on navy, maskable-safe). */
export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const size = Number((await params).size);
  if (!SIZES.has(size)) return new Response("Not found", { status: 404 });
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(appIconSvg())}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1d3557" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={size} height={size} alt="" />
      </div>
    ),
    { width: size, height: size, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
