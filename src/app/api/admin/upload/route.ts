import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { adminApi, err, json } from "@/lib/admin/http";
import { audit, rateLimit } from "@/lib/admin/security";

// Photo upload for posts. Every image is decoded and re-encoded on the server:
// - the real format is checked from the file contents (not the name or type),
// - hidden metadata is removed, including GPS location from phone photos,
// - it is resized to at most 2400 px and saved as WebP under a random name.
// Production storage: Vercel Blob (BLOB_READ_WRITE_TOKEN). Local dev: public/uploads.

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["jpeg", "png", "webp", "gif", "avif", "heif", "tiff"]);

export async function POST(req: NextRequest) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  if (!(await rateLimit(`upload:${user.id}`, 120, 3600))) return err("Too many uploads in the last hour. Please wait a bit.", 429);
  if (Number(req.headers.get("content-length") || 0) > MAX_BYTES + 100_000) return err("That image is too big (max 8 MB).", 413);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return err("No image received.");
  if (file.size > MAX_BYTES) return err("That image is too big (max 8 MB).", 413);

  let out: Buffer;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    // limitInputPixels guards against "decompression bomb" images.
    const meta = await sharp(input, { limitInputPixels: 60_000_000 }).metadata();
    if (!meta.format || !ALLOWED.has(meta.format)) return err("Please use a JPG, PNG, WebP or GIF photo.");
    const animated = (meta.pages ?? 1) > 1;
    let img = sharp(input, { animated, limitInputPixels: 60_000_000 });
    if (!animated) img = img.rotate(); // apply the phone's orientation before metadata is dropped
    out = await img
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer(); // sharp drops EXIF/GPS/XMP by default
  } catch {
    return err("That file couldn't be read as a picture. Try a JPG or PNG (iPhone HEIC photos: export as JPG first).");
  }

  const name = `blog/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.webp`;
  try {
    let url: string;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(name, out, {
        access: "public",
        contentType: "image/webp",
        addRandomSuffix: false,
        cacheControlMaxAge: 60 * 60 * 24 * 365, // random, never-reused names → cache forever
      });
      url = blob.url;
    } else if (process.env.VERCEL === "1") {
      return err("Image storage isn't connected yet. In Vercel, add a Blob store to this project.", 503);
    } else {
      const file = path.join(process.cwd(), "public", "uploads", name);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, out);
      // Full address so the photo also shows on the two static sites while testing locally.
      url = `${req.nextUrl.origin}/uploads/${name}`;
    }
    await audit("image.uploaded", user, name, { bytes: out.length });
    return json({ url });
  } catch (e) {
    console.error("[upload] failed", (e as Error).message);
    return err("Upload failed. Please try again.", 500);
  }
}
