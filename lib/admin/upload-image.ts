/**
 * Browser-side image upload: optionally trim, downscale and re-encode as WebP,
 * then upload straight to ImageKit with a short-lived token signed by
 * /api/admin/imagekit-auth (the private key never reaches the browser).
 */

const DEFAULT_MAX_EDGE_PX = 2000;
const WEBP_QUALITY = 0.82;
const MAX_BYTES = 10 * 1024 * 1024;

export interface UploadOptions {
  /** Longest side after resizing (never upscales). Default 2000. */
  maxEdge?: number;
  /**
   * Crop away a uniform border (transparent, or the solid color found in all
   * four corners) before resizing — for logos exported on a padded square canvas.
   */
  trim?: boolean;
}

type Box = { x: number; y: number; w: number; h: number };

/** Bounding box of the pixels that differ from the background (transparent or the corner color). */
function contentBox(ctx: CanvasRenderingContext2D, width: number, height: number): Box | null {
  const { data } = ctx.getImageData(0, 0, width, height);
  const at = (x: number, y: number) => (y * width + x) * 4;
  const corners = [at(0, 0), at(width - 1, 0), at(0, height - 1), at(width - 1, height - 1)];
  const [c0] = corners;
  const close = (i: number, j: number) =>
    Math.abs(data[i] - data[j]) <= 12 &&
    Math.abs(data[i + 1] - data[j + 1]) <= 12 &&
    Math.abs(data[i + 2] - data[j + 2]) <= 12 &&
    Math.abs(data[i + 3] - data[j + 3]) <= 12;
  const solidCorners = corners.every((i) => close(i, c0));
  const isBackground = (i: number) => data[i + 3] <= 8 || (solidCorners && close(i, c0));

  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isBackground(at(x, y))) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null; // nothing but background: keep the image as is
  // A little breathing room so anti-aliased edges are not clipped.
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.02);
  const x = Math.max(0, minX - pad);
  const y = Math.max(0, minY - pad);
  return { x, y, w: Math.min(width, maxX + pad + 1) - x, h: Math.min(height, maxY + pad + 1) - y };
}

/** Trim (optional), downscale (never upscale) to `maxEdge` on the long side and re-encode as WebP. */
async function toWebp(file: File, { maxEdge = DEFAULT_MAX_EDGE_PX, trim = false }: UploadOptions): Promise<File> {
  const bitmap = await createImageBitmap(file);
  let box: Box = { x: 0, y: 0, w: bitmap.width, h: bitmap.height };
  if (trim) {
    const probe = document.createElement("canvas");
    probe.width = bitmap.width;
    probe.height = bitmap.height;
    const pctx = probe.getContext("2d", { willReadFrequently: true });
    if (pctx) {
      pctx.drawImage(bitmap, 0, 0);
      box = contentBox(pctx, bitmap.width, bitmap.height) ?? box;
    }
  }
  const scale = Math.min(1, maxEdge / Math.max(box.w, box.h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(box.w * scale));
  canvas.height = Math.max(1, Math.round(box.h * scale));
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, box.x, box.y, box.w, box.h, 0, 0, canvas.width, canvas.height);
  }
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
  if (!blob || blob.type !== "image/webp") throw new Error(`${file.name}: no pudimos convertir la imagen a WebP.`);
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
}

/** Upload one JPG/PNG/WebP into an ImageKit folder (e.g. "/properties") and return its URL. */
export async function uploadImage(file: File, folder: string, options: UploadOptions = {}): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`${file.name}: usá una imagen JPG, PNG o WebP.`);
  if (file.size > MAX_BYTES) throw new Error(`${file.name}: supera los 10 MB.`);
  const webp = await toWebp(file, options);
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
