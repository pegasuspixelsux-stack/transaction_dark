import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { can } from "@/lib/admin/rbac";
import { getServerSession } from "@/lib/server/admin-session";

const noStore = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

/**
 * Signs a short-lived ImageKit upload token so the browser can upload straight
 * to ImageKit without ever seeing the private key.
 */
export async function GET() {
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  if (!can(session.role, "properties:write")) return json({ error: "No tenés permiso para subir imágenes." }, 403);

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  if (!privateKey || !publicKey) return json({ error: "La carga de imágenes no está configurada." }, 503);

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 600;
  const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");
  return json({ token, expire, signature, publicKey });
}
