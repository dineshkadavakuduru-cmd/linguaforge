import { NextResponse } from "next/server";
import { formatInTimeZone } from "date-fns-tz";
import { isAfter, parseISO, subDays } from "date-fns";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { CheckInResponse, UserDoc } from "@/types";

function todayForTimezone(timezone: string) {
  try {
    return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
  } catch {
    return formatInTimeZone(new Date(), "UTC", "yyyy-MM-dd");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { uid?: string };
    if (!body.uid) return NextResponse.json({ error: "uid is required." }, { status: 400 });

    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      const response: CheckInResponse = { streakCount: 0, xp: 0, alreadyCheckedIn: false, usedStreakFreeze: false };
      return NextResponse.json(response);
    }

    const userRef = adminDb.collection("users").doc(body.uid);
    const snapshot = await userRef.get();
    if (!snapshot.exists) return NextResponse.json({ error: "User profile not found." }, { status: 404 });

    const user = snapshot.data() as UserDoc;
    const timezone = user.timezone || "UTC";
    const today = todayForTimezone(timezone);
    const lastCheckIn = user.lastCheckInDate;
    if (lastCheckIn === today) {
      const response: CheckInResponse = { streakCount: user.streakCount, xp: user.xp, alreadyCheckedIn: true, usedStreakFreeze: false };
      return NextResponse.json(response);
    }

    const yesterday = formatInTimeZone(subDays(parseISO(`${today}T12:00:00Z`), 1), timezone, "yyyy-MM-dd");
    let streakCount = Math.max(1, user.streakCount || 0);
    let usedStreakFreeze = false;
    if (lastCheckIn === yesterday) {
      streakCount += 1;
    } else if (lastCheckIn && isAfter(parseISO(today), parseISO(lastCheckIn))) {
      if ((user.streakFreezeCount || 0) > 0) {
        usedStreakFreeze = true;
      } else {
        streakCount = 1;
      }
    }

    const xp = (user.xp || 0) + 10;
    const update = {
      streakCount,
      xp,
      streakFreezeCount: usedStreakFreeze ? Math.max(0, (user.streakFreezeCount || 0) - 1) : user.streakFreezeCount || 0,
      lastCheckInDate: today,
      updatedAt: FieldValue.serverTimestamp(),
    };
    await userRef.set(update, { merge: true });

    const response: CheckInResponse = { streakCount, xp, alreadyCheckedIn: false, usedStreakFreeze };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to check in." }, { status: 500 });
  }
}
