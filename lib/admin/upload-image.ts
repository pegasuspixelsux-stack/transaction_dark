/**
 * Browser-side image upload: downscale and re-encode as WebP, then upload
 * straight to ImageKit with a short-lived token signed by
 * /api/admin/imagekit-auth (the private key never reaches the browser).
 */

const MAX_EDGE_PX = 2000;
const WEBP_QUALITY = 0.82;
const MAX_BYTES = 10 * 1024 * 1024;

/** Downscale (never upscale) to MAX_EDGE_PX on the long side and re-encode as WebP. */
async function toWebp(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
  if (!blob || blob.type !== "image/webp") throw new Error(`${file.name}: no pudimos convertir la imagen a WebP.`);
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
}

/** Upload one JPG/PNG/WebP into an ImageKit folder (e.g. "/properties") and return its URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`${file.name}: usá una imagen JPG, PNG o WebP.`);
  if (file.size > MAX_BYTES) throw new Error(`${file.name}: supera los 10 MB.`);
  const webp = await toWebp(file);
  const authRes = await fetch("/api/admin/imagekit-auth", { cache: "no-store" });
  const auth = await authRes.json().catch(() => ({}));
  if (!authRes.ok) throw new Error(auth.error ?? "No pudimos autorizar la subida.");
  const body = new FormData();
  body.set("file", webp);
  body.set("fileName", webp.name);
  body.set("folder", folder);
  body.set("useUniqueFileName", "true");
  body.set("publicKey", auth.publicKey);
  body.set("token", auth.token);
  body.set("expire", String(auth.expire));
  body.set("signature", auth.signature);
  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.message ?? `${file.name}: no pudimos subir la imagen.`);
  return data.url as string;
}
