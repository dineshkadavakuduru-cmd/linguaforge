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

// Anchor at local noon so a one-day subtraction can never slip across a DST
// boundary and report the wrong calendar day.
function yesterdayForTimezone(timezone: string) {
  const today = todayForTimezone(timezone);
  return formatInTimeZone(subDays(parseISO(`${today}T12:00:00Z`), 1), timezone, "yyyy-MM-dd");
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

    // A streak is a read-modify-write over the same document. Running it inside
    // a transaction makes a second tab / a reload racing at local midnight
    // increment the streak exactly once.
    const outcome = await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(userRef);
      if (!snapshot.exists) return { status: 404 as const };

      const user = snapshot.data() as UserDoc;
      const timezone = user.timezone || "UTC";
      const today = todayForTimezone(timezone);
      const lastCheckIn = user.lastCheckInDate;

      if (lastCheckIn === today) {
        const response: CheckInResponse = { streakCount: user.streakCount, xp: user.xp, alreadyCheckedIn: true, usedStreakFreeze: false };
        return { status: 200 as const, response };
      }

      const yesterday = yesterdayForTimezone(timezone);
      let streakCount = Math.max(1, user.streakCount || 0);
      let usedStreakFreeze = false;

      if (lastCheckIn === yesterday) {
        // Consecutive calendar day: extend the streak.
        streakCount += 1;
      } else if (lastCheckIn && isAfter(parseISO(today), parseISO(lastCheckIn))) {
        // Missed at least one day: a freeze preserves the run, otherwise reset.
        if ((user.streakFreezeCount || 0) > 0) {
          usedStreakFreeze = true;
        } else {
          streakCount = 1;
        }
      }

      const xp = (user.xp || 0) + 10;
      transaction.set(userRef, {
        streakCount,
        xp,
        streakFreezeCount: usedStreakFreeze ? Math.max(0, (user.streakFreezeCount || 0) - 1) : user.streakFreezeCount || 0,
        lastCheckInDate: today,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      const response: CheckInResponse = { streakCount, xp, alreadyCheckedIn: false, usedStreakFreeze };
      return { status: 200 as const, response };
    });

    if (outcome.status === 404) return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    return NextResponse.json(outcome.response);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to check in." }, { status: 500 });
  }
}
