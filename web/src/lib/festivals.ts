/**
 * Marketing dates for India. Fixed-date days are exact. Lunar festivals move every
 * year: the LUNAR table must be checked each year (or replaced with a calendar API).
 */
export type Festival = { date: string; name: string };

const FIXED: [string, string][] = [
  ["01-01", "New Year"],
  ["01-14", "Makar Sankranti"],
  ["01-26", "Republic Day"],
  ["02-14", "Valentine's Day"],
  ["03-08", "Women's Day"],
  ["04-14", "Baisakhi"],
  ["05-01", "Labour Day"],
  ["06-21", "Yoga Day"],
  ["08-15", "Independence Day"],
  ["09-05", "Teachers' Day"],
  ["10-02", "Gandhi Jayanti"],
  ["11-14", "Children's Day"],
  ["12-25", "Christmas"],
  ["12-31", "New Year's Eve"],
];

// TODO(yearly): verify against a panchang before each season.
const LUNAR: Record<number, [string, string][]> = {
  2026: [
    ["10-11", "Navratri begins"],
    ["10-20", "Dussehra"],
    ["11-06", "Dhanteras"],
    ["11-08", "Diwali"],
  ],
};

function nthWeekday(year: number, month: number, weekday: number, n: number) {
  const d = new Date(Date.UTC(year, month - 1, 1));
  const offset = (weekday - d.getUTCDay() + 7) % 7;
  d.setUTCDate(1 + offset + (n - 1) * 7);
  return d.toISOString().slice(0, 10);
}

export function festivalsFor(year: number, month: number): Festival[] {
  const mm = String(month).padStart(2, "0");
  const list: Festival[] = [...FIXED, ...(LUNAR[year] ?? [])]
    .filter(([md]) => md.startsWith(mm))
    .map(([md, name]) => ({ date: `${year}-${md}`, name }));
  if (month === 5) list.push({ date: nthWeekday(year, 5, 0, 2), name: "Mother's Day" });
  if (month === 6) list.push({ date: nthWeekday(year, 6, 0, 3), name: "Father's Day" });
  if (month === 11) {
    const thanksgiving = new Date(nthWeekday(year, 11, 4, 4));
    thanksgiving.setUTCDate(thanksgiving.getUTCDate() + 1);
    list.push({ date: thanksgiving.toISOString().slice(0, 10), name: "Black Friday" });
  }
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function parseMonth(s: string | null) {
  const m = s?.match(/^(\d{4})-(\d{2})$/);
  const now = new Date();
  const year = m ? Number(m[1]) : now.getFullYear();
  const month = m ? Number(m[2]) : now.getMonth() + 1;
  if (month < 1 || month > 12 || year < 2020 || year > 2100) throw new Error("Bad month");
  return { year, month, key: `${year}-${String(month).padStart(2, "0")}` };
}
