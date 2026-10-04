import { formatInTimeZone } from "date-fns-tz";
import { getFirestore, Timestamp, Query } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

const BATCH_SIZE = 500;

function yesterdayForTimezone(timezone: string) {
  try {
    const now = new Date();
    const today = formatInTimeZone(now, timezone, "yyyy-MM-dd");
    const [year, month, day] = today.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day - 1, 12));
    return formatInTimeZone(date, timezone, "yyyy-MM-dd");
  } catch {
    return formatInTimeZone(new Date(Date.now() - 86400000), "UTC", "yyyy-MM-dd");
  }
}

async function processUsersForTimezone(db: ReturnType<typeof getFirestore>, timezone: string, yesterday: string) {
  let query: Query = db.collection("users")
    .where("timezone", "==", timezone)
    .where("lastCheckInDate", "<", yesterday)
    .limit(BATCH_SIZE);

  let snapshot = await query.get();

  while (!snapshot.empty) {
    const writes = snapshot.docs.map(async (document) => {
      const user = document.data();
      const lastCheckInDate = typeof user.lastCheckInDate === "string" ? user.lastCheckInDate : "";
      if (!lastCheckInDate || lastCheckInDate >= yesterday) return;

      const freezeCount = Number(user.streakFreezeCount || 0);
      const update = freezeCount > 0
        ? { streakFreezeCount: freezeCount - 1, lastCheckInDate: yesterday, updatedAt: Timestamp.now() }
        : { streakCount: 0, lastCheckInDate: yesterday, updatedAt: Timestamp.now() };
      await document.ref.set(update, { merge: true });
    });

    await Promise.all(writes);

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    query = db.collection("users")
      .where("timezone", "==", timezone)
      .where("lastCheckInDate", "<", yesterday)
      .startAfter(lastDoc)
      .limit(BATCH_SIZE);

    snapshot = await query.get();
  }
}

export const streakMidnight = onSchedule("every 1 hours", async () => {
  const db = getFirestore();

  // Get all unique timezones from users who need streak updates
  const timezonesSnapshot = await db.collection("users")
    .where("lastCheckInDate", "<", yesterdayForTimezone("UTC")) // Use UTC as a baseline to find stale users
    .select("timezone")
    .get();

  const timezones = new Set<string>();
  timezonesSnapshot.docs.forEach((doc) => {
    const tz = doc.data().timezone;
    if (typeof tz === "string") timezones.add(tz);
  });

  await Promise.all(
    Array.from(timezones).map((timezone) =>
      processUsersForTimezone(db, timezone, yesterdayForTimezone(timezone))
    )
  );
});
