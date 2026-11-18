"use client";

const MAX_SIDE = 2000;

/** Shrinks big phone photos in the browser before upload (keeps GIFs as-is). */
async function shrink(file: File): Promise<Blob> {
  if (file.type === "image/gif" || file.size < 300_000) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  return blob && blob.size < file.size ? blob : file;
}

export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't a picture.");
  const blob = await shrink(file);
  const form = new FormData();
  const ext = blob.type === "image/webp" ? "webp" : file.name.split(".").pop();
  form.append("file", new File([blob], `photo.${ext}`, { type: blob.type || file.type }));
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed. Please try again.");
  return data.url as string;
}

export function pickImage(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif,image/heic";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}
