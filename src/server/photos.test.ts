import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { processPhoto, sniffImageType } from "./photos";

async function jpegWithGps(width: number, height: number) {
  return sharp({ create: { width, height, channels: 3, background: { r: 200, g: 120, b: 80 } } })
    .jpeg()
    .withExif({ IFD0: { Make: "TestCam", Copyright: "secret" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "50/1 56/1 0/1" } })
    .toBuffer();
}
const asFile = (buf: Buffer | string, name = "photo.jpg", type = "image/jpeg") => new File([typeof buf === "string" ? buf : new Uint8Array(buf)], name, { type });

describe("photo uploads", () => {
  it("re-encodes to WebP, shrinks big photos and removes all metadata (GPS)", async () => {
    const input = await jpegWithGps(3000, 2000);
    expect((await sharp(input).metadata()).exif).toBeDefined();
    const res = await processPhoto(asFile(input));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const meta = await sharp(res.data).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(1600);
    expect(meta.exif).toBeUndefined();
    expect(res.data.includes(Buffer.from("TestCam"))).toBe(false);
  });

  it("rejects files that only pretend to be images", async () => {
    expect((await processPhoto(asFile("<svg onload=alert(1)>", "x.jpg"))).ok).toBe(false);
    expect((await processPhoto(asFile("<svg xmlns='http://www.w3.org/2000/svg'/>", "x.svg", "image/svg+xml"))).ok).toBe(false);
    const res = await processPhoto(asFile(Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x01, 0x02]), "broken.jpg"));
    expect(res).toEqual({ ok: false, error: "badType" });
  });

  it("rejects tiny and oversized photos", async () => {
    expect(await processPhoto(asFile(await jpegWithGps(300, 300)))).toEqual({ ok: false, error: "tooSmall" });
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.jpg", { type: "image/jpeg" });
    expect(await processPhoto(big)).toEqual({ ok: false, error: "tooBig" });
  });

  it("recognises real image types by their first bytes", () => {
    expect(sniffImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe("png");
    expect(sniffImageType(Buffer.from("RIFF....WEBPVP8 "))).toBe("webp");
    expect(sniffImageType(Buffer.from("GIF89a"))).toBeNull();
  });
});
