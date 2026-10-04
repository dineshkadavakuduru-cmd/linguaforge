"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

const levels = ["#1a1a24", "#29245b", "#403b87", "#5750b5", "#6c63ff"];

function activityLevel(count: number) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

function getWeeksBack(weeks: number) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - weeks * 7);
  return startOfWeek;
}

export function StreakCalendar({ uid }: { uid: string }) {
  const [activityData, setActivityData] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadHistory() {
      try {
        const response = await fetch(`/api/exercise-history?uid=${encodeURIComponent(uid)}`);
        if (!response.ok) throw new Error("Failed to fetch history");
        const { history } = await response.json() as { history: Array<{ date: string; count: number }> };
        if (!active) return;
        const map = new Map<string, number>();
        history.forEach((entry) => map.set(entry.date, entry.count));
        setActivityData(map);
      } catch {
        // Keep empty map on error
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadHistory();
    return () => { active = false; };
  }, [uid]);

  const weeks = Array.from({ length: 52 }, (_, week) => week);
  const days = Array.from({ length: 7 }, (_, day) => day);
  const startDate = getWeeksBack(51);

  function getDateForCell(week: number, day: number) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + week * 7 + day);
    return format(date, "yyyy-MM-dd");
  }

  if (loading) {
    return (
      <section className="rounded-xl border border-default bg-surface p-6 animate-pulse">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-sm text-zinc-400">Practice history</p><h2 className="mt-1 font-display text-2xl tracking-tight text-white">A year in review</h2></div>
          <span className="hidden text-xs text-zinc-600 sm:block">Last 52 weeks</span>
        </div>
        <div className="mt-6 overflow-x-auto pb-1">
          <svg aria-label="Practice activity heatmap" role="img" viewBox="0 0 620 88" className="h-auto min-w-[580px] w-full">
            {days.map((day) => <text key={`label-${day}`} x="0" y={14 + day * 10} fill="#71717a" fontSize="6">{day === 1 ? "Mon" : day === 3 ? "Wed" : day === 5 ? "Fri" : ""}</text>)}
            {weeks.flatMap((week) => days.map((day) => <rect key={`${week}-${day}`} x={22 + week * 11} y={7 + day * 10} width="7" height="7" rx="2" fill={levels[0]} />))}
          </svg>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-zinc-600"><span>Less</span>{levels.map((level) => <span key={level} className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: level }} />)}<span>More</span></div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-default bg-surface p-6">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-sm text-zinc-400">Practice history</p><h2 className="mt-1 font-display text-2xl tracking-tight text-white">A year in review</h2></div>
        <span className="hidden text-xs text-zinc-600 sm:block">Last 52 weeks</span>
      </div>
      <div className="mt-6 overflow-x-auto pb-1">
        <svg aria-label="Practice activity heatmap" role="img" viewBox="0 0 620 88" className="h-auto min-w-[580px] w-full">
          {days.map((day) => <text key={`label-${day}`} x="0" y={14 + day * 10} fill="#71717a" fontSize="6">{day === 1 ? "Mon" : day === 3 ? "Wed" : day === 5 ? "Fri" : ""}</text>)}
          {weeks.flatMap((week) => days.map((day) => {
            const dateStr = getDateForCell(week, day);
            const count = activityData.get(dateStr) ?? 0;
            const level = activityLevel(count);
            return <rect key={`${week}-${day}`} x={22 + week * 11} y={7 + day * 10} width="7" height="7" rx="2" fill={levels[level]} />;
          }))}
        </svg>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-zinc-600"><span>Less</span>{levels.map((level) => <span key={level} className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: level }} />)}<span>More</span></div>
    </section>
  );
}