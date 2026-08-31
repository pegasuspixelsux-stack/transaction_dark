import { NextResponse } from "next/server";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, firebaseEnabled } from "@/lib/firebase";

const str = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const lead = {
    name: str(body.name),
    phone: str(body.phone, 60),
    bestTime: str(body.bestTime, 40),
    intent: str(body.intent, 60),
    asset: str(body.asset, 60),
    zone: str(body.zone, 60),
    timeline: str(body.timeline, 60),
    budget: str(body.budget, 60),
    beds: str(body.beds, 40),
    baths: str(body.baths, 40),
    preference: str(body.preference, 80),
  };

  if (!lead.name || !lead.phone) {
    return NextResponse.json(
      { error: "Nombre y teléfono son obligatorios." },
      { status: 400 },
    );
  }

  try {
    if (firebaseEnabled && db) {
      await addDoc(collection(db, "leads"), {
        ...lead,
        createdAt: serverTimestamp(),
        source: "a-gente-concierge",
      });
    } else {
      // No Firebase project configured yet — record it in the function logs so
      // nothing is lost. Set NEXT_PUBLIC_FIREBASE_* env vars to persist to Firestore.
      console.log("[lead] firebase disabled, logging only:", lead);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[lead] failed to save:", error);
    return NextResponse.json(
      { error: "No pudimos registrar tu consulta. Probá de nuevo." },
      { status: 500 },
    );
  }
}
