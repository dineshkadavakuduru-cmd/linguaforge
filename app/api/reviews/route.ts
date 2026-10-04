import { NextResponse } from "next/server";
import { getNextReview } from "@/lib/srs/scheduler";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");
  const lang = url.searchParams.get("lang") || "es";
  if (!uid) return NextResponse.json({ error: "uid is required." }, { status: 400 });
  return NextResponse.json({ reviews: await getNextReview(uid, lang) });
}
