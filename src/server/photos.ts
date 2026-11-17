import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MIN_SIDE = 400;
const MAX_SIDE = 1600;
const ID = /^[a-f0-9]{24}$/;

export type PhotoError = "badType" | "tooBig" | "tooSmall";

/** Detects the real file type from its first bytes; the file name and browser-sent type are not trusted. */
export function sniffImageType(head: Uint8Array): "jpeg" | "png" | "webp" | null {
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "jpeg";
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return "png";
  const ascii = (a: number, b: number) => String.fromCharCode(...head.slice(a, b));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

/**
 * Checks and cleans an uploaded photo: real JPEG/PNG/WebP only, at most 5 MB, at least
 * 400 px on the short side. The image is decoded and re-encoded as WebP (max 1600 px),
 * which drops all metadata such as GPS location and camera serial numbers.
 */
export async function processPhoto(file: File): Promise<{ ok: true; data: Buffer } | { ok: false; error: PhotoError }> {
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "tooBig" };
  const input = Buffer.from(await file.arrayBuffer());
  if (!sniffImageType(input.subarray(0, 16))) return { ok: false, error: "badType" };
  try {
    const img = sharp(input, { limitInputPixels: 50_000_000, failOn: "error" }).rotate(); // apply EXIF orientation, then forget it
    const meta = await img.metadata();
    const w = meta.autoOrient?.width ?? meta.width ?? 0;
    const h = meta.autoOrient?.height ?? meta.height ?? 0;
    if (Math.min(w, h) < MIN_SIDE) return { ok: false, error: "tooSmall" };
    const data = await img.resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    return { ok: true, data };
  } catch {
    return { ok: false, error: "badType" };
  }
}

/**
 * Local disk storage for development. When Mivora goes online this is swapped for
 * EU-hosted object storage behind the same three functions.
 */
function dir() {
  return path.resolve(process.env.STORAGE_DIR || "storage", "photos");
}

export async function savePhoto(data: Buffer): Promise<string> {
  const id = randomBytes(12).toString("hex");
  await mkdir(dir(), { recursive: true });
  await writeFile(path.join(dir(), `${id}.webp`), data, { flag: "wx" });
  return id;
}

export async function readPhoto(id: string): Promise<Buffer | null> {
  if (!ID.test(id)) return null;
  try {
    return await readFile(path.join(dir(), `${id}.webp`));
  } catch {
    return null;
  }
}

export async function deletePhoto(id: string): Promise<void> {
  if (!ID.test(id)) return;
  await unlink(path.join(dir(), `${id}.webp`)).catch(() => {});
}

export const photoUrl = (id: string) => `/api/photos/${id}`;
export function photoIdFromUrl(src: string | null | undefined): string | null {
  const m = src?.match(/^\/api\/photos\/([a-f0-9]{24})$/);
  return m ? m[1]! : null;
}
