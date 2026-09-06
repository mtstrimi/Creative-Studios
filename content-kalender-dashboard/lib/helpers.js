// Feste, gut unterscheidbare Palette für bis zu 8 Kunden gleichzeitig — nur
// noch für den kleinen Farbpunkt neben dem Kundennamen, nicht mehr für den
// Hintergrund der Kalendereinträge (der richtet sich jetzt nach Content-Art).
const PALETTE = [
  { c: "#2F6F76", tint: "#E3EEEE" },
  { c: "#A63D5D", tint: "#F5E8EC" },
  { c: "#C98A2C", tint: "#F7EEDC" },
  { c: "#3E4C8A", tint: "#E6E8F2" },
  { c: "#6B7B3F", tint: "#ECEFE2" },
  { c: "#A2472F", tint: "#F4E3DD" },
  { c: "#1F7A6C", tint: "#E0EFEB" },
  { c: "#6E4A7E", tint: "#EBE2EF" }
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
// Story handelt, unabhängig vom Kunden.
const CONTENT_ART_COLORS = {
  Reel: { c: "#A63D5D", tint: "#F5E8EC" },
  Beitrag: { c: "#3F7D4A", tint: "#E5F0E7" },
  Story: { c: "#C07A1E", tint: "#F7ECDA" }
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

