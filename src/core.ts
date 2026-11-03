// Pure logic for IRS standard mileage rates and federal (GSA) / IRS per diem rates. No I/O.
import { GSA, type Destination } from "./gsa.js";
import { HIGH_COST, type HighCost } from "./highcost.js";

export const AS_OF = "2026-11-03";
export const SITE = "https://taxbreakcalc.com";
export const REPO = "irs-mileage-rate-per-diem-mcp";
export const PAGES = { selfEmployed: "/self-employed-set-aside-calculator/" };
export function moreUrl(path: string = PAGES.selfEmployed): string {
  return `${SITE}${path}?utm_source=mcp&utm_medium=${REPO}`;
}
export const DISCLAIMER = "Rates from IRS and GSA publications. General information, not tax advice.";

export const SOURCES = {
  mileagePage: "https://www.irs.gov/tax-professionals/standard-mileage-rates",
  ann202611: "https://www.irs.gov/irb/2026-29_irb",
  n202610: "https://www.irs.gov/pub/irs-drop/n-26-10.pdf",
  n20255: "https://www.irs.gov/pub/irs-drop/n-25-05.pdf",
  ir2025128: "https://www.irs.gov/newsroom/irs-sets-2026-business-standard-mileage-rate-at-725-cents-per-mile-up-25-cents",
  gsaFiles: "https://www.gsa.gov/travel/per-diem-rates/per-diem-files",
  gsaMie: "https://www.gsa.gov/travel/per-diem-rates/mie-breakdowns",
  n202660: "https://www.irs.gov/irb/2026-43_irb",
  n202554: "https://www.irs.gov/irb/2025-41_IRB",
};

export class InputError extends Error {}

// ---------- Mileage ----------

export interface MileagePeriod {
  start: string; end: string; label: string;
  business: number; charity: number; medical: number; moving: number; // cents per mile
  source: string; source_url: string;
}

// Copied from the IRS "Standard mileage rates" table (page updated 28-Jul-2026), fetched 2026-11-03,
// and checked against Notice 2026-10, Announcement 2026-11 and Notice 2025-5.
export const MILEAGE: MileagePeriod[] = [
  { start: "2026-07-01", end: "2026-12-31", label: "July 1 - Dec. 31, 2026", business: 76, charity: 14, medical: 23.5, moving: 23.5, source: "Announcement 2026-11 (IRB 2026-29)", source_url: SOURCES.ann202611 },
  { start: "2026-01-01", end: "2026-06-30", label: "Jan. 1 - June 30, 2026", business: 72.5, charity: 14, medical: 20.5, moving: 20.5, source: "Notice 2026-10, IR-2025-128", source_url: SOURCES.n202610 },
  { start: "2025-01-01", end: "2025-12-31", label: "2025", business: 70, charity: 14, medical: 21, moving: 21, source: "Notice 2025-5, IR-2024-312", source_url: SOURCES.n20255 },
  { start: "2024-01-01", end: "2024-12-31", label: "2024", business: 67, charity: 14, medical: 21, moving: 21, source: "IR-2023-239", source_url: SOURCES.mileagePage },
  { start: "2023-01-01", end: "2023-12-31", label: "2023", business: 65.5, charity: 14, medical: 22, moving: 22, source: "IR-2022-234", source_url: SOURCES.mileagePage },
  { start: "2022-07-01", end: "2022-12-31", label: "July 1 - Dec. 31, 2022", business: 62.5, charity: 14, medical: 22, moving: 22, source: "IR-2022-124", source_url: SOURCES.mileagePage },
  { start: "2022-01-01", end: "2022-06-30", label: "Jan. 1 - June 30, 2022", business: 58.5, charity: 14, medical: 18, moving: 18, source: "IR-2021-251", source_url: SOURCES.mileagePage },
  { start: "2021-01-01", end: "2021-12-31", label: "2021", business: 56, charity: 14, medical: 16, moving: 16, source: "IR-2020-279", source_url: SOURCES.mileagePage },
  { start: "2020-01-01", end: "2020-12-31", label: "2020", business: 57.5, charity: 14, medical: 17, moving: 17, source: "IR-2019-215", source_url: SOURCES.mileagePage },
  { start: "2019-01-01", end: "2019-12-31", label: "2019", business: 58, charity: 14, medical: 20, moving: 20, source: "IR-2018-251", source_url: SOURCES.mileagePage },
  { start: "2018-01-01", end: "2018-12-31", label: "2018", business: 54.5, charity: 14, medical: 18, moving: 18, source: "IR-2017-204, IR-2018-127", source_url: SOURCES.mileagePage },
  { start: "2017-01-01", end: "2017-12-31", label: "2017", business: 53.5, charity: 14, medical: 17, moving: 17, source: "IR-2016-169", source_url: SOURCES.mileagePage },
  { start: "2016-01-01", end: "2016-12-31", label: "2016", business: 54, charity: 14, medical: 19, moving: 19, source: "IR-2015-137", source_url: SOURCES.mileagePage },
  { start: "2015-01-01", end: "2015-12-31", label: "2015", business: 57.5, charity: 14, medical: 23, moving: 23, source: "IR-2014-114", source_url: SOURCES.mileagePage },
  { start: "2014-01-01", end: "2014-12-31", label: "2014", business: 56, charity: 14, medical: 23.5, moving: 23.5, source: "IR-2013-95", source_url: SOURCES.mileagePage },
  { start: "2013-01-01", end: "2013-12-31", label: "2013", business: 56.5, charity: 14, medical: 24, moving: 24, source: "IR-2012-95", source_url: SOURCES.mileagePage },
  { start: "2012-01-01", end: "2012-12-31", label: "2012", business: 55.5, charity: 14, medical: 23, moving: 23, source: "IRB-2012-02", source_url: SOURCES.mileagePage },
  { start: "2011-07-01", end: "2011-12-31", label: "July 1 - Dec. 31, 2011", business: 55.5, charity: 14, medical: 23.5, moving: 23.5, source: "IR-2011-69", source_url: SOURCES.mileagePage },
  { start: "2011-01-01", end: "2011-06-30", label: "Jan. 1 - June 30, 2011", business: 51, charity: 14, medical: 19, moving: 19, source: "IR-2010-119", source_url: SOURCES.mileagePage },
];

/** Depreciation portion of the business rate (basis reduction), cents per mile. Notice 2026-10 sec. 4, Notice 2025-5 sec. 4. */
export const DEPRECIATION_CENTS: Record<number, number> = { 2021: 26, 2022: 26, 2023: 28, 2024: 30, 2025: 33, 2026: 35 };
/** Max standard automobile cost (FAVR) and max FMV for fleet-average / cents-per-mile valuation. */
export const MAX_AUTO_VALUE: Record<number, { amount: number; source: string }> = {
  2025: { amount: 61200, source: SOURCES.n20255 },
  2026: { amount: 61700, source: SOURCES.n202610 },
};

export const PURPOSES = ["business", "medical", "charity", "moving"] as const;
export type Purpose = (typeof PURPOSES)[number];

const LATEST_MILEAGE_YEAR = 2026;

export function parseDate(s: string, what = "date"): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) throw new InputError(`${what} "${s}" must be YYYY-MM-DD.`);
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) throw new InputError(`${what} "${s}" is not a real date.`);
  return d;
}
const iso = (d: Date) => d.toISOString().slice(0, 10);

export function mileagePeriodFor(date: string): MileagePeriod {
  parseDate(date);
  const y = +date.slice(0, 4);
  if (y > LATEST_MILEAGE_YEAR) throw new InputError(`The IRS has not announced standard mileage rates for ${y} yet (checked ${AS_OF}). It usually announces them in late December. Latest rates: 76 cents a mile for business from July 1, 2026.`);
  const p = MILEAGE.find((x) => date >= x.start && date <= x.end);
  if (!p) throw new InputError(`No standard mileage rate in this server before 2011 (asked for ${date}).`);
  return p;
}

export function getMileageRates(a: { year?: number; date?: string }) {
  if (a.date) {
    const p = mileagePeriodFor(a.date);
    const y = +a.date.slice(0, 4);
    return { query: a.date, periods: [p], depreciation_cents_per_mile: DEPRECIATION_CENTS[y] ?? null, max_auto_value: MAX_AUTO_VALUE[y] ?? null, mid_year_change: MILEAGE.filter((x) => x.start.startsWith(String(y))).length > 1 };
  }
  const y = a.year ?? LATEST_MILEAGE_YEAR;
  if (y > LATEST_MILEAGE_YEAR) throw new InputError(`The IRS has not announced standard mileage rates for ${y} yet (checked ${AS_OF}). It usually announces them in late December.`);
  const periods = MILEAGE.filter((x) => x.start.startsWith(String(y))).sort((p, q) => p.start.localeCompare(q.start));
  if (!periods.length) throw new InputError(`No standard mileage rate in this server for ${y}. Covered: 2011-${LATEST_MILEAGE_YEAR}.`);
  return { query: String(y), periods, depreciation_cents_per_mile: DEPRECIATION_CENTS[y] ?? null, max_auto_value: MAX_AUTO_VALUE[y] ?? null, mid_year_change: periods.length > 1 };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function calculateMileageDeduction(a: { trips: Array<{ miles: number; date: string; purpose?: Purpose }>; default_purpose?: Purpose }) {
  if (!a.trips.length) throw new InputError("Give at least one trip.");
  const groups = new Map<string, { period: MileagePeriod; purpose: Purpose; miles: number }>();
  for (const t of a.trips) {
    const purpose = t.purpose ?? a.default_purpose ?? "business";
    const p = mileagePeriodFor(t.date);
    const k = `${p.start}|${purpose}`;
    const g = groups.get(k) ?? { period: p, purpose, miles: 0 };
    g.miles += t.miles;
    groups.set(k, g);
  }
  const lines = [...groups.values()].sort((x, y) => x.period.start.localeCompare(y.period.start) || x.purpose.localeCompare(y.purpose)).map((g) => {
    const cents = g.period[g.purpose];
    return { period: g.period.label, purpose: g.purpose, miles: r2(g.miles), cents_per_mile: cents, amount: r2((g.miles * cents) / 100), source: g.period.source };
  });
  const total = r2(lines.reduce((s, l) => s + l.amount, 0));
  const byPurpose: Record<string, number> = {};
  for (const l of lines) byPurpose[l.purpose] = r2((byPurpose[l.purpose] ?? 0) + l.amount);
  // depreciation (basis reduction) for business miles, by calendar year
  const dep: Record<string, { business_miles: number; cents_per_mile: number | null; basis_reduction: number | null }> = {};
  for (const t of a.trips) {
    if ((t.purpose ?? a.default_purpose ?? "business") !== "business") continue;
    const y = +t.date.slice(0, 4);
    const e = dep[y] ?? { business_miles: 0, cents_per_mile: DEPRECIATION_CENTS[y] ?? null, basis_reduction: null };
    e.business_miles = r2(e.business_miles + t.miles);
    e.basis_reduction = e.cents_per_mile === null ? null : r2((e.business_miles * e.cents_per_mile) / 100);
    dep[y] = e;
  }
  const notes: string[] = [];
  if (lines.some((l) => l.purpose === "business")) notes.push("Employees cannot deduct unreimbursed business mileage as an itemized deduction (made permanent by the One, Big, Beautiful Bill Act); self-employed people deduct it on Schedule C, and employers can reimburse it tax-free at these rates.");
  if (lines.some((l) => l.purpose === "moving")) notes.push("The moving rate applies only to active-duty Armed Forces members moving under orders and, from 2026, certain intelligence community members.");
  if (lines.some((l) => l.purpose === "medical")) notes.push("Medical mileage counts toward itemized medical expenses, deductible only above 7.5% of AGI.");
  if (a.trips.some((t) => t.date.startsWith("2026"))) notes.push("2026 has two business rates: 72.5 cents before July 1 and 76 cents from July 1 (Announcement 2026-11).");
  return { lines, total_amount: total, by_purpose: byPurpose, depreciation_basis_reduction: dep, notes };
}

// ---------- Per diem (GSA CONUS) ----------

export const MIE_BREAKDOWN: Record<number, { breakfast: number; lunch: number; dinner: number; incidentals: number; first_last_day: number }> = {
  68: { breakfast: 16, lunch: 19, dinner: 28, incidentals: 5, first_last_day: 51 },
  74: { breakfast: 18, lunch: 20, dinner: 31, incidentals: 5, first_last_day: 55.5 },
  80: { breakfast: 20, lunch: 22, dinner: 33, incidentals: 5, first_last_day: 60 },
  86: { breakfast: 22, lunch: 23, dinner: 36, incidentals: 5, first_last_day: 64.5 },
  92: { breakfast: 23, lunch: 26, dinner: 38, incidentals: 5, first_last_day: 69 },
};

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
export const FISCAL_YEARS = Object.keys(GSA).map(Number).sort();

/** Federal fiscal year of a date: Oct 1 starts the next FY. */
export function fiscalYear(d: Date): number {
  return d.getUTCMonth() >= 9 ? d.getUTCFullYear() + 1 : d.getUTCFullYear();
}
function fyIndex(d: Date): number {
  return (d.getUTCMonth() + 3) % 12; // Oct=0 ... Sep=11
}
function fyData(fy: number) {
  const g = GSA[String(fy)];
  if (!g) throw new InputError(`GSA per diem rates for FY${fy} are not in this server. Covered: FY${FISCAL_YEARS.join(", FY")} (Oct. 1, ${FISCAL_YEARS[0] - 1} to Sept. 30, ${FISCAL_YEARS[FISCAL_YEARS.length - 1]}).`);
  return g;
}

export interface Location { fiscal_year: number; kind: "destination" | "standard"; destination?: Destination; matched_by: string }

function std(fy: number): Destination {
  const g = fyData(fy);
  return { id: 0, name: "Standard CONUS rate", county: "", defined: "All counties not specifically listed", state: "", lodging_oct_sep: Array(12).fill(g.standard.lodging), mie: g.standard.mie };
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function findLocations(fy: number, a: { zip?: string; city?: string; state?: string }): Destination[] {
  const g = fyData(fy);
  if (a.zip) {
    const z = a.zip.trim().slice(0, 5);
    if (!/^\d{5}$/.test(z)) throw new InputError(`ZIP "${a.zip}" must be 5 digits.`);
    const ids = g.zips[z];
    if (ids) return ids.map((id) => (id === 0 ? std(fy) : g.destinations.find((d) => d.id === id)!));
    if (g.standard_zips.length % 5 === 0) {
      for (let i = 0; i < g.standard_zips.length; i += 5) if (g.standard_zips.slice(i, i + 5) === z) return [std(fy)];
    }
    throw new InputError(`ZIP ${z} is not in the GSA FY${fy} ZIP file (it may be outside the continental U.S., a PO-box-only ZIP or invalid). Try city and state.`);
  }
  if (!a.city && !a.state) throw new InputError("Give a 5-digit ZIP, or a city (and ideally a 2-letter state).");
  const st = a.state?.trim().toUpperCase();
  if (st && !/^[A-Z]{2}$/.test(st)) throw new InputError(`State "${a.state}" must be a 2-letter code like CA.`);
  const c = a.city ? norm(a.city) : "";
  let hits = g.destinations.filter((d) => (!st || d.state === st) && (!c || norm(d.name).split(" ").join(" ").includes(c) || norm(d.county).includes(c) || norm(d.defined).includes(c)));
  if (!hits.length && c) {
    const words = c.split(" ");
    hits = g.destinations.filter((d) => (!st || d.state === st) && words.every((w) => norm(`${d.name} ${d.county} ${d.defined}`).includes(w)));
  }
  if (!hits.length) {
    if (st) return [std(fy)];
    throw new InputError(`No GSA destination matches "${a.city}". Add the state, or use a ZIP code. Places not listed get the standard rate.`);
  }
  return hits.slice(0, 10);
}

function monthlyTable(d: Destination) {
  const o: Record<string, number> = {};
  MONTHS.forEach((m, i) => { o[m] = d.lodging_oct_sep[i]; });
  return o;
}

export function getPerDiemRates(a: { zip?: string; city?: string; state?: string; date?: string; fiscal_year?: number }) {
  const fy = a.fiscal_year ?? (a.date ? fiscalYear(parseDate(a.date)) : fiscalYear(parseDate(AS_OF)));
  const hits = findLocations(fy, a);
  const g = fyData(fy);
  const month = a.date ? fyIndex(parseDate(a.date)) : null;
  const locations = hits.map((d) => ({
    destination: d.name,
    county: d.county || null,
    location_defined: d.defined || null,
    state: d.state || null,
    lodging_by_month: monthlyTable(d),
    lodging_on_date: month === null ? null : d.lodging_oct_sep[month],
    max_lodging_range: [Math.min(...d.lodging_oct_sep), Math.max(...d.lodging_oct_sep)],
    mie_per_day: d.mie,
    mie_breakdown: MIE_BREAKDOWN[d.mie] ?? null,
    standard_rate: d.id === 0,
  }));
  return {
    fiscal_year: fy,
    period: `Oct. 1, ${fy - 1} - Sept. 30, ${fy}`,
    standard_conus: { lodging: g.standard.lodging, mie: g.standard.mie },
    date: a.date ?? null,
    locations,
    multiple_matches: locations.length > 1,
    notes: [
      "Lodging is a maximum per night before taxes. M&IE is per full day; the first and last travel day get 75%.",
      ...(a.zip && locations.length > 1 ? ["This ZIP spans more than one county; check which county the lodging is in."] : []),
    ],
  };
}

export function calculateTripPerDiem(a: { zip?: string; city?: string; state?: string; start_date: string; end_date: string; meals_provided?: { breakfast?: number; lunch?: number; dinner?: number } }) {
  const s = parseDate(a.start_date, "start_date");
  const e = parseDate(a.end_date, "end_date");
  if (e < s) throw new InputError("end_date is before start_date.");
  const days = Math.round((+e - +s) / 86400000) + 1;
  if (days > 366) throw new InputError("Trips longer than 366 days are not supported.");
  const nightsDetail: Array<{ night_of: string; lodging: number }> = [];
  let dest: Destination | null = null;
  const pick = (fy: number) => {
    const hits = findLocations(fy, a);
    if (hits.length > 1 && !a.zip) throw new InputError(`"${a.city}" matches ${hits.length} GSA destinations (${hits.map((h) => `${h.name}, ${h.state}`).join("; ")}). Add the state or use a ZIP code.`);
    return hits[0];
  };
  const mieDays: Array<{ date: string; mie: number; share: number }> = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(+s + i * 86400000);
    const fy = fiscalYear(d);
    const loc = pick(fy);
    dest = dest ?? loc;
    if (i < days - 1) nightsDetail.push({ night_of: iso(d), lodging: loc.lodging_oct_sep[fyIndex(d)] });
    const share = days === 1 ? 0.75 : i === 0 || i === days - 1 ? 0.75 : 1;
    mieDays.push({ date: iso(d), mie: loc.mie, share });
  }
  const lodging = nightsDetail.reduce((t, n) => t + n.lodging, 0);
  let mie = mieDays.reduce((t, m) => t + m.mie * m.share, 0);
  const mp = a.meals_provided ?? {};
  let deduction = 0;
  const mieRate = mieDays[0].mie;
  const bd = MIE_BREAKDOWN[mieRate];
  if (bd) deduction = (mp.breakfast ?? 0) * bd.breakfast + (mp.lunch ?? 0) * bd.lunch + (mp.dinner ?? 0) * bd.dinner;
  mie = r2(Math.max(0, mie - deduction));
  return {
    destination: dest!.name,
    state: dest!.state || null,
    county: dest!.county || null,
    standard_rate: dest!.id === 0,
    start_date: a.start_date,
    end_date: a.end_date,
    travel_days: days,
    nights: nightsDetail.length,
    lodging_max_total: lodging,
    lodging_by_night: nightsDetail.length <= 62 ? nightsDetail : undefined,
    mie_per_full_day: mieRate,
    mie_first_last_day: bd ? bd.first_last_day : r2(mieRate * 0.75),
    meals_provided_deduction: r2(deduction),
    mie_total: mie,
    total_max_per_diem: r2(lodging + mie),
    notes: [
      "GSA federal travel rules: first and last day of travel at 75% of M&IE; deduct provided meals at the GSA breakdown amounts.",
      ...(days === 1 ? ["Same-day trip: 75% M&IE shown, which applies only when travel lasts more than 12 hours; no lodging."] : []),
      "Under Rev. Proc. 2019-48 an employer allowance up to these rates is treated as substantiated (time, place and business purpose still need records). Self-employed people may use the M&IE rate but must substantiate actual lodging cost.",
    ],
  };
}

// ---------- IRS high-low and special rates ----------

export const HIGH_LOW: Record<number, { high: number; low: number; high_meals: number; low_meals: number; transportation_mie_conus: number; transportation_mie_oconus: number; incidental_only: number; threshold: number; notice: string; source: string }> = {
  2027: { high: 329, low: 230, high_meals: 86, low_meals: 74, transportation_mie_conus: 80, transportation_mie_oconus: 86, incidental_only: 5, threshold: 280, notice: "Notice 2026-60", source: SOURCES.n202660 },
  2026: { high: 319, low: 225, high_meals: 86, low_meals: 74, transportation_mie_conus: 80, transportation_mie_oconus: 86, incidental_only: 5, threshold: 272, notice: "Notice 2025-54", source: SOURCES.n202554 },
};

function inRanges(h: HighCost, d: Date): boolean {
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const key = m * 100 + day;
  return h.ranges.some(([sm, sd, em, ed]) => {
    const a = sm * 100 + sd, b = em * 100 + ed;
    return a <= b ? key >= a && key <= b : key >= a || key <= b;
  });
}

export function getHighLowRates(a: { date?: string; city?: string; state?: string }) {
  const d = parseDate(a.date ?? AS_OF);
  const fy = fiscalYear(d);
  const r = HIGH_LOW[fy];
  if (!r) throw new InputError(`IRS high-low rates for Oct. ${fy - 1} - Sept. ${fy} are not in this server. Covered: Oct. 1, 2025 - Sept. 30, 2027 (Notices 2025-54 and 2026-60).`);
  const list = HIGH_COST[String(fy)] ?? [];
  let locality: null | { matches: Array<{ city: string; state: string; location: string; high_cost_portion: string; high_cost_on_date: boolean }>; rate_on_date: number; meals_on_date: number } = null;
  if (a.city || a.state) {
    const c = a.city ? norm(a.city) : "";
    const STATES: Record<string, string> = { AL: "Alabama", AZ: "Arizona", CA: "California", CO: "Colorado", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia", ID: "Idaho", IL: "Illinois", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MT: "Montana", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", TN: "Tennessee", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WY: "Wyoming" };
    const stName = a.state ? (STATES[a.state.trim().toUpperCase()] ?? a.state.trim()) : "";
    const matches = list.filter((h) => (!stName || norm(h.state) === norm(stName)) && (!c || norm(`${h.city} ${h.location}`).includes(c)))
      .map((h) => ({ city: h.city, state: h.state, location: h.location, high_cost_portion: h.high_cost_portion, high_cost_on_date: inRanges(h, d) }));
    const high = matches.some((m) => m.high_cost_on_date);
    locality = { matches, rate_on_date: high ? r.high : r.low, meals_on_date: high ? r.high_meals : r.low_meals };
  }
  return {
    date: iso(d),
    fiscal_year: fy,
    period: `Oct. 1, ${fy - 1} - Sept. 30, ${fy}`,
    notice: r.notice,
    high_rate: r.high,
    low_rate: r.low,
    high_meals_portion: r.high_meals,
    low_meals_portion: r.low_meals,
    high_cost_threshold: r.threshold,
    transportation_industry_mie: { conus: r.transportation_mie_conus, oconus: r.transportation_mie_oconus },
    incidental_expenses_only: r.incidental_only,
    high_cost_locality_count: list.length,
    locality,
    notes: [
      "High-low method: one high rate for listed high-cost localities during the listed portion of the year, one low rate everywhere else in the continental U.S. Includes lodging and M&IE.",
      ...(locality && !locality.matches.length ? ["No high-cost locality matched; the low rate applies."] : []),
      ...(fy === 2027 ? ["Notice 2026-60 added Tucson, San Mateo/Foster City/Belmont, Albuquerque and Cody, and removed Panama City."] : []),
    ],
  };
}
