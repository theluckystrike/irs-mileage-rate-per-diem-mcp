// Fixtures: IRS Notice 2026-10, Announcement 2026-11, Notice 2025-5, the IRS standard mileage rates table,
// Notices 2026-60 and 2025-54, GSA FY2026/FY2027 ZIP files and the GSA M&IE breakdown table (all fetched 2026-11-03),
// plus a cross-check against the GSA per diem API for ZIP 20001 FY2027, or hand-checked arithmetic.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getMileageRates, calculateMileageDeduction as miles, getPerDiemRates as pd, calculateTripPerDiem as trip,
  getHighLowRates as hl, mileagePeriodFor, fiscalYear, InputError,
} from "../dist/core.js";

test("F1 Notice 2026-10: Jan-June 2026 business 72.5, medical 20.5, charity 14", () => {
  const p = mileagePeriodFor("2026-06-30");
  assert.equal(p.business, 72.5); assert.equal(p.medical, 20.5); assert.equal(p.charity, 14);
});

test("F2 Announcement 2026-11: from July 1, 2026 business 76, medical/moving 23.5", () => {
  const p = mileagePeriodFor("2026-07-01");
  assert.equal(p.business, 76); assert.equal(p.medical, 23.5); assert.equal(p.moving, 23.5);
});

test("F3 2026 has a mid-year change; depreciation 35 cents; max auto value 61,700", () => {
  const r = getMileageRates({ year: 2026 });
  assert.equal(r.periods.length, 2); assert.equal(r.mid_year_change, true);
  assert.equal(r.depreciation_cents_per_mile, 35); assert.equal(r.max_auto_value.amount, 61700);
});

test("F4 Notice 2025-5: 2025 business 70, depreciation 33, FAVR 61,200; 2022 H2 62.5", () => {
  const r = getMileageRates({ year: 2025 });
  assert.equal(r.periods[0].business, 70); assert.equal(r.depreciation_cents_per_mile, 33); assert.equal(r.max_auto_value.amount, 61200);
  assert.equal(mileagePeriodFor("2022-08-01").business, 62.5);
});

test("F5 2027 not announced: clear error", () => {
  assert.throws(() => getMileageRates({ year: 2027 }), /not announced/);
  assert.throws(() => mileagePeriodFor("2027-01-05"), /not announced/);
});

test("F6 split 2026 deduction: 1,000 mi before July at 72.5 + 1,000 after at 76 = 1,485", () => {
  const r = miles({ trips: [{ miles: 1000, date: "2026-03-01" }, { miles: 1000, date: "2026-08-01" }] });
  assert.equal(r.total_amount, 1485);
  assert.equal(r.depreciation_basis_reduction["2026"].basis_reduction, 700);
});

test("F7 charity and medical mileage: 100 mi charity 14.00 + 200 mi medical (Sept 2026) 47.00", () => {
  const r = miles({ trips: [{ miles: 100, date: "2026-09-01", purpose: "charity" }, { miles: 200, date: "2026-09-01", purpose: "medical" }] });
  assert.equal(r.by_purpose.charity, 14); assert.equal(r.by_purpose.medical, 47);
});

test("F8 GSA FY2027 ZIP 20001 matches GSA API: Oct 287, Nov 203, Mar 295, Jul 192, M&IE 92", () => {
  const l = pd({ zip: "20001", fiscal_year: 2027 }).locations[0];
  assert.deepEqual([l.lodging_by_month.Oct, l.lodging_by_month.Nov, l.lodging_by_month.Mar, l.lodging_by_month.Jul], [287, 203, 295, 192]);
  assert.equal(l.mie_per_day, 92);
});

test("F9 FY2027 standard CONUS $113 / $68; FY2026 $110 / $68", () => {
  assert.deepEqual(pd({ zip: "01054", fiscal_year: 2027 }).standard_conus, { lodging: 113, mie: 68 });
  assert.deepEqual(pd({ zip: "01054", fiscal_year: 2026 }).standard_conus, { lodging: 110, mie: 68 });
  assert.equal(pd({ zip: "01054", fiscal_year: 2027 }).locations[0].standard_rate, true);
});

test("F10 GSA M&IE breakdown: $92 -> 23/26/38/5, first and last day 69.00", () => {
  const b = pd({ zip: "20001", fiscal_year: 2027 }).locations[0].mie_breakdown;
  assert.deepEqual(b, { breakfast: 23, lunch: 26, dinner: 38, incidentals: 5, first_last_day: 69 });
});

test("F11 fiscal year rolls on Oct 1", () => {
  assert.equal(fiscalYear(new Date(Date.UTC(2026, 8, 30))), 2026);
  assert.equal(fiscalYear(new Date(Date.UTC(2026, 9, 1))), 2027);
});

test("F12 trip across FY change: DC Sept 29 - Oct 2, 2026 = 275+275+287 lodging, M&IE 92*2+69*2", () => {
  const r = trip({ zip: "20001", start_date: "2026-09-29", end_date: "2026-10-02" });
  assert.equal(r.lodging_max_total, 837); assert.equal(r.mie_total, 322); assert.equal(r.total_max_per_diem, 1159);
});

test("F13 meals provided reduce M&IE: 3-day standard-rate trip, 1 lunch provided -> 51+68+51-19 = 151", () => {
  const r = trip({ zip: "01054", start_date: "2026-11-02", end_date: "2026-11-04", meals_provided: { lunch: 1 } });
  assert.equal(r.mie_total, 151); assert.equal(r.lodging_max_total, 226);
});

test("F14 Notice 2026-60: high 329 / low 230, meals 86 / 74, transportation 80/86, incidentals 5", () => {
  const r = hl({ date: "2026-10-15" });
  assert.equal(r.high_rate, 329); assert.equal(r.low_rate, 230);
  assert.equal(r.high_meals_portion, 86); assert.equal(r.low_meals_portion, 74);
  assert.deepEqual(r.transportation_industry_mie, { conus: 80, oconus: 86 }); assert.equal(r.incidental_expenses_only, 5);
  assert.equal(r.high_cost_locality_count, 91);
});

test("F15 Notice 2025-54: Sept 2026 high 319 / low 225", () => {
  const r = hl({ date: "2026-09-15" });
  assert.equal(r.high_rate, 319); assert.equal(r.low_rate, 225);
});

test("F16 Tucson added for FY2027 (Jan 1 - Mar 31): high in Feb 2027, low in Nov 2026", () => {
  assert.equal(hl({ date: "2027-02-15", city: "Tucson", state: "AZ" }).locality.rate_on_date, 329);
  assert.equal(hl({ date: "2026-11-15", city: "Tucson", state: "AZ" }).locality.rate_on_date, 230);
});

test("F17 Panama City removed for FY2027; Sedona wraps the year end (Oct-Dec and Mar-Sep)", () => {
  assert.equal(hl({ date: "2027-06-15", city: "Panama City", state: "FL" }).locality.matches.length, 0);
  assert.equal(hl({ date: "2026-12-15", city: "Sedona", state: "AZ" }).locality.rate_on_date, 329);
  assert.equal(hl({ date: "2027-01-15", city: "Sedona", state: "AZ" }).locality.rate_on_date, 230);
});

test("F18 bad inputs: ZIP format, unknown fiscal year, end before start", () => {
  assert.throws(() => pd({ zip: "2000" }), InputError);
  assert.throws(() => pd({ zip: "20001", fiscal_year: 2025 }), /not in this server/);
  assert.throws(() => trip({ zip: "20001", start_date: "2026-10-05", end_date: "2026-10-01" }), /before/);
});
