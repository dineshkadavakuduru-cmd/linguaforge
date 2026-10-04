import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid is required." }, { status: 400 });

  try {
    const snapshot = await adminDb
      .collection("userProgress")
      .where("uid", "==", uid)
      .get();

    const history: Array<{ date: string; count: number }> = [];
    const dateMap = new Map<string, number>();

    snapshot.docs.forEach((doc) => {
      const progress = doc.data() as { history?: Array<{ timestamp: Timestamp }> };
      if (progress.history) {
        for (const entry of progress.history) {
          const date = entry.timestamp.toDate();
          const dateStr = date.toISOString().split("T")[0];
          dateMap.set(dateStr, (dateMap.get(dateStr) ?? 0) + 1);
        }
      }
    });

    dateMap.forEach((count, date) => {
      history.push({ date, count });
    });

    history.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ history });
  } catch {
    return NextResponse.json({ history: [] });
  }
}