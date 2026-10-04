import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { exerciseId?: string; uid?: string };
    if (!body.exerciseId || !body.uid) return NextResponse.json({ error: "exerciseId and uid are required." }, { status: 400 });
    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) return NextResponse.json({ flagged: true, localOnly: true });
    await adminDb.collection("exercises").doc(body.exerciseId).update({ "metadata.flaggedCount": FieldValue.increment(1) });
    return NextResponse.json({ flagged: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to flag exercise." }, { status: 500 });
  }
}
