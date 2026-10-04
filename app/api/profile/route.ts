import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid is required." }, { status: 400 });

  try {
    const snapshot = await adminDb.collection("users").doc(uid).get();
    if (!snapshot.exists) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const user = snapshot.data();
    return NextResponse.json({
      activeLanguages: user?.activeLanguages ?? ["es"],
      currentLanguage: user?.currentLanguage ?? "es",
      xp: user?.xp ?? 0,
      streakCount: user?.streakCount ?? 0,
      settings: user?.settings ?? {},
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch profile." }, { status: 500 });
  }
}