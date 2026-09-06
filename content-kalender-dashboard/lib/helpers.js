// Zurückhaltende, an Apples Systemfarben angelehnte Palette für bis zu 8
// Kunden gleichzeitig — nur für den kleinen Farbpunkt neben dem Kundennamen.
const PALETTE = [
  { c: "#0071E3", tint: "#EAF3FE" },
  { c: "#AF52DE", tint: "#F7EEFC" },
  { c: "#30B0C7", tint: "#E9F7F9" },
  { c: "#5856D6", tint: "#EEEEFC" },
  { c: "#FF2D55", tint: "#FFEEF2" },
  { c: "#A2845E", tint: "#F5EFE7" },
  { c: "#8E8E93", tint: "#F1F1F3" },
  { c: "#00C7BE", tint: "#E5FBFA" }
];

export function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

// Farbe des Kalender-Eintrags richtet sich nach der Content-Art — so ist auf
// einen Blick erkennbar, ob es sich um ein Reel, einen Beitrag oder eine
// Story handelt, unabhängig vom Kunden. Angelehnt an Apples Systemfarben.
const CONTENT_ART_COLORS = {
  Reel: { c: "#FF3B30", tint: "#FFF0EF" },
  Beitrag: { c: "#34C759", tint: "#EEFAF1" },
  Story: { c: "#FF9500", tint: "#FFF6E9" }
};

export function normalizeArt(value) {
  const s = (value || "").toLowerCase();
  if (s.includes("reel")) return "Reel";
  if (s.includes("stor")) return "Story";
  if (s.includes("beitrag") || s.includes("post")) return "Beitrag";
  return value || "Beitrag";
}

export function colorForArt(value) {
  return CONTENT_ART_COLORS[normalizeArt(value)] || CONTENT_ART_COLORS.Beitrag;
}

export function artLabel(value) {
  return normalizeArt(value);
}

export const CONTENT_ART_LEGEND = [
  { name: "Reel", ...CONTENT_ART_COLORS.Reel },
  { name: "Beitrag", ...CONTENT_ART_COLORS.Beitrag },
  { name: "Story", ...CONTENT_ART_COLORS.Story }
];

export function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export function fmtKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember"
];

export function monthLabel(date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function rangeLabel(months) {
  const first = months[0];
  const last = months[months.length - 1];
  if (first.getFullYear() === last.getFullYear()) {
    return `${MONTH_NAMES[first.getMonth()]} – ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`;
  }
  return `${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()} – ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`;
}

// Baut immer ein 6x7-Raster (42 Zellen), damit alle drei Monate exakt
// gleich hoch sind, unabhängig davon, wie viele Wochen der Monat hat.
export function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Montag = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevMonthDays - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ date: new Date(year, month + 1, nextDay), inMonth: false });
    nextDay++;
  }
  return cells;
}

