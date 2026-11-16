import { addDays, weekday } from "./time";

/** A session the family has put into their calendar. Stored on the device for now. */
export interface PlannedItem {
  activityId: string;
  startsAt: string; // ISO with offset
  endsAt: string;
}

/** Compact string form for storage: "activityId|startsAt|endsAt". */
export function encodePlanned(p: PlannedItem): string {
  return `${p.activityId}|${p.startsAt}|${p.endsAt}`;
}

export function decodePlanned(s: string): PlannedItem | null {
  const [activityId, startsAt, endsAt] = s.split("|");
  if (!activityId || !startsAt || !endsAt) return null;
  if (Number.isNaN(Date.parse(startsAt)) || Number.isNaN(Date.parse(endsAt))) return null;
  return { activityId, startsAt, endsAt };
}

/** Monday-first index (Mon = 0 … Sun = 6), as used in German calendars. */
export function mondayIndex(isoDate: string): number {
  return (weekday(isoDate) + 6) % 7;
}

export function startOfWeek(isoDate: string): string {
  return addDays(isoDate, -mondayIndex(isoDate));
}

export function weekDays(isoDate: string): string[] {
  const monday = startOfWeek(isoDate);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Month grid, Monday-first, padded with `null` to full weeks. `month` is 1–12. */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const first = `${year}-${String(month).padStart(2, "0")}-01`;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array<null>(mondayIndex(first)).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(first, i)),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const idx = year * 12 + (month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

/** Keys (encodePlanned) of items that overlap in time with at least one other item. */
export function findConflicts(items: PlannedItem[]): Set<string> {
  const out = new Set<string>();
  const sorted = [...items].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i]!;
      const b = sorted[j]!;
      if (Date.parse(b.startsAt) >= Date.parse(a.endsAt)) break;
      out.add(encodePlanned(a));
      out.add(encodePlanned(b));
    }
  }
  return out;
}

function icsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** RFC 5545 calendar file, importable into Google/Apple/Outlook calendars. */
export function toIcs(
  events: { uid: string; title: string; location: string; startsAt: string; endsAt: string }[],
  now: Date = new Date(),
): string {
  const stamp = icsDate(now.toISOString());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mivora//Familienkalender//DE",
    "CALSCALE:GREGORIAN",
    ...events.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${e.uid}@mivora`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsDate(e.startsAt)}`,
      `DTEND:${icsDate(e.endsAt)}`,
      `SUMMARY:${icsText(e.title)}`,
      `LOCATION:${icsText(e.location)}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
