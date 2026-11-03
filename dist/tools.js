// One tool registry shared by the stdio and Cloudflare Worker entries.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AS_OF, DISCLAIMER, InputError, PURPOSES, SOURCES, moreUrl, getMileageRates, calculateMileageDeduction, getPerDiemRates, calculateTripPerDiem, getHighLowRates, } from "./core.js";
export const SERVER_NAME = "irs-mileage-rate-per-diem-mcp";
export const SERVER_VERSION = "1.0.0";
const money = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dateArg = (what) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe(`${what} (YYYY-MM-DD).`);
function reply(summary, data, source) {
    const body = { ...data, summary, as_of: AS_OF, source, more: moreUrl(), disclaimer: DISCLAIMER };
    return {
        content: [
            { type: "text", text: `${summary}\n\n${DISCLAIMER}` },
            { type: "text", text: JSON.stringify(body, null, 2) },
        ],
        structuredContent: body,
    };
}
function run(fn) {
    try {
        return fn();
    }
    catch (e) {
        const msg = e instanceof InputError ? e.message : `Unexpected error: ${e.message}`;
        return { isError: true, content: [{ type: "text", text: msg }] };
    }
}
const RO = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const loc = {
    zip: z.string().regex(/^\d{5}(-\d{4})?$/).optional().describe("5-digit ZIP code of the destination (best match)."),
    city: z.string().min(2).max(80).optional().describe("City or county name, e.g. \"Boston\" or \"Maricopa\"."),
    state: z.string().min(2).max(30).optional().describe("2-letter state code, e.g. MA."),
};
export function registerTools(server) {
    server.registerTool("get_mileage_rate", {
        title: "IRS standard mileage rates (2011-2026, incl. the July 2026 increase)",
        description: "Returns the official IRS standard mileage rates in cents per mile for business, medical, charity and military moving use, for a year or a specific date. Knows the mid-year 2026 change: 72.5 cents for business from Jan. 1 to June 30, 2026 (Notice 2026-10) and 76 cents from July 1, 2026 (Announcement 2026-11, fuel price increase), medical/moving 20.5 then 23.5 cents, charity 14 cents. Also returns the depreciation (basis reduction) part of the business rate (35 cents for 2026) and the FAVR / employer-vehicle maximum value ($61,700 for 2026). 2027 rates are not announced yet and the tool says so.",
        inputSchema: {
            year: z.number().int().min(2011).max(2100).optional().describe("Tax year, e.g. 2026. Default 2026."),
            date: dateArg("A date the miles were driven; returns the rate in force that day").optional(),
        },
        annotations: { ...RO, title: "IRS standard mileage rates" },
    }, async (a) => run(() => {
        const r = getMileageRates(a);
        const ps = r.periods.map((p) => `${p.label}: business ${p.business} cents, medical/moving ${p.medical} cents, charity ${p.charity} cents (${p.source})`);
        let s = `IRS standard mileage rates for ${r.query}: ${ps.join("; ")}.`;
        if (r.mid_year_change)
            s += " The rate changed mid-year, so split miles by date.";
        if (r.depreciation_cents_per_mile)
            s += ` Depreciation part of the business rate: ${r.depreciation_cents_per_mile} cents a mile.`;
        return reply(s, r, r.periods.map((p) => p.source_url).filter((v, i, x) => x.indexOf(v) === i).join(" ; ") + ` ; ${SOURCES.mileagePage}`);
    }));
    server.registerTool("calculate_mileage_deduction", {
        title: "Mileage deduction or reimbursement calculator",
        description: "Calculates the deduction or tax-free reimbursement for driven miles at the IRS standard mileage rates, splitting by the date each trip was driven. Applies the 2026 mid-year increase automatically (72.5 cents before July 1, 76 cents from July 1). Supports business, medical, charity and military moving miles, returns the amount per rate period and purpose, and the depreciation basis reduction for business miles. Notes who can and cannot deduct (employees' unreimbursed mileage is not deductible after the One, Big, Beautiful Bill Act).",
        inputSchema: {
            trips: z.array(z.object({
                miles: z.number().min(0).max(1e6).describe("Miles driven."),
                date: dateArg("Date driven, or any date in the period (e.g. 2026-03-15 for all January-June 2026 miles)"),
                purpose: z.enum(PURPOSES).optional().describe("business (default), medical, charity or moving."),
            })).min(1).max(1000).describe("Trips or mileage totals, each with a date."),
            default_purpose: z.enum(PURPOSES).optional().describe("Purpose for trips that do not set one. Default business."),
        },
        annotations: { ...RO, title: "Mileage deduction calculator" },
    }, async (a) => run(() => {
        const r = calculateMileageDeduction(a);
        const ls = r.lines.map((l) => `${l.miles} ${l.purpose} miles in ${l.period} at ${l.cents_per_mile} cents = ${money(l.amount)}`);
        const s = `${ls.join("; ")}. Total ${money(r.total_amount)}.${r.notes.length ? " " + r.notes[r.notes.length - 1] : ""}`;
        return reply(s, r, `${SOURCES.mileagePage} ; ${SOURCES.n202610} ; ${SOURCES.ann202611}`);
    }));
    server.registerTool("get_per_diem_rates", {
        title: "GSA per diem rates by ZIP or city (FY2026 and FY2027)",
        description: "Returns the official GSA federal per diem rates for a U.S. (CONUS) destination by ZIP code or city/state: maximum lodging per night by month and the meals and incidental expenses (M&IE) rate with its breakfast/lunch/dinner/incidentals breakdown and the 75% first/last-day amount. Covers FY2026 (Oct. 1, 2025 - Sept. 30, 2026) and FY2027 (from Oct. 1, 2026; standard rate $113 lodging and $68 M&IE). Data from GSA's FY2026 and FY2027 ZIP code files, so it knows rates newer than a model's training data.",
        inputSchema: {
            ...loc,
            date: dateArg("Travel date; picks the fiscal year and shows that night's lodging rate").optional(),
            fiscal_year: z.number().int().min(2026).max(2027).optional().describe("Federal fiscal year (2027 = Oct. 2026 - Sept. 2027). Default: the current one."),
        },
        annotations: { ...RO, title: "GSA per diem rates" },
    }, async (a) => run(() => {
        const r = getPerDiemRates(a);
        const ls = r.locations.slice(0, 3).map((l) => `${l.standard_rate ? "Standard CONUS rate" : `${l.destination}, ${l.state}${l.county ? ` (${l.county})` : ""}`}: lodging ${l.lodging_on_date !== null ? `$${l.lodging_on_date} a night on ${r.date}` : `$${l.max_lodging_range[0]}-$${l.max_lodging_range[1]} a night by month`}, M&IE $${l.mie_per_day} a day ($${l.mie_breakdown?.first_last_day ?? l.mie_per_day * 0.75} on first and last day)`);
        let s = `FY${r.fiscal_year} GSA per diem (${r.period}). ${ls.join("; ")}.`;
        if (r.locations.length > 3)
            s += ` ${r.locations.length - 3} more matches in the JSON.`;
        return reply(s, r, `${SOURCES.gsaFiles} ; ${SOURCES.gsaMie}`);
    }));
    server.registerTool("calculate_trip_per_diem", {
        title: "Trip per diem calculator (GSA rates)",
        description: "Calculates the maximum federal per diem for a business trip: lodging for each night at that month's GSA rate (crossing seasons and the Oct. 1 fiscal year change), M&IE for each day with 75% on the first and last day, minus meals provided at the GSA breakdown amounts. Uses the official FY2026 and FY2027 GSA rates for trips between Oct. 1, 2025 and Sept. 30, 2027.",
        inputSchema: {
            ...loc,
            start_date: dateArg("First travel day"),
            end_date: dateArg("Last travel day"),
            meals_provided: z.object({
                breakfast: z.number().int().min(0).max(366).optional(),
                lunch: z.number().int().min(0).max(366).optional(),
                dinner: z.number().int().min(0).max(366).optional(),
            }).optional().describe("Number of meals provided (by a conference or the employer) to deduct from M&IE."),
        },
        annotations: { ...RO, title: "Trip per diem calculator" },
    }, async (a) => run(() => {
        const r = calculateTripPerDiem(a);
        const s = `${r.travel_days}-day trip to ${r.standard_rate ? "a standard-rate location" : `${r.destination}, ${r.state}`} (${r.start_date} to ${r.end_date}): lodging up to ${money(r.lodging_max_total)} for ${r.nights} nights, M&IE ${money(r.mie_total)} ($${r.mie_per_full_day} a full day, $${r.mie_first_last_day} first and last day${r.meals_provided_deduction ? `, less ${money(r.meals_provided_deduction)} for provided meals` : ""}). Maximum per diem ${money(r.total_max_per_diem)}.`;
        return reply(s, r, `${SOURCES.gsaFiles} ; ${SOURCES.gsaMie}`);
    }));
    server.registerTool("get_high_low_per_diem", {
        title: "IRS high-low per diem rates and high-cost localities",
        description: "Returns the IRS high-low substantiation method rates for a date and whether a city is a high-cost locality then: from Oct. 1, 2026 $329 high / $230 low with $86 / $74 treated as meals (Notice 2026-60); Oct. 1, 2025 - Sept. 30, 2026 $319 / $225 (Notice 2025-54). Also the transportation industry M&IE ($80 CONUS, $86 OCONUS) and the $5 incidental-expenses-only rate. Checks the 91 FY2027 high-cost localities and their seasonal portions (e.g. Tucson added, Panama City removed).",
        inputSchema: {
            date: dateArg("Travel date. Default today").optional(),
            city: z.string().min(2).max(80).optional().describe("City or county to test against the high-cost list."),
            state: z.string().min(2).max(30).optional().describe("2-letter state code or state name."),
        },
        annotations: { ...RO, title: "IRS high-low per diem" },
    }, async (a) => run(() => {
        const r = getHighLowRates(a);
        let s = `IRS high-low per diem for ${r.date} (${r.notice}, ${r.period}): high $${r.high_rate} ($${r.high_meals_portion} meals), low $${r.low_rate} ($${r.low_meals_portion} meals). Transportation industry M&IE $${r.transportation_industry_mie.conus} CONUS / $${r.transportation_industry_mie.oconus} OCONUS; incidentals only $${r.incidental_expenses_only}.`;
        if (r.locality) {
            const m = r.locality.matches;
            s += m.length
                ? ` ${m.map((x) => `${x.city}, ${x.state} is high-cost ${x.high_cost_portion}`).slice(0, 3).join("; ")}. On ${r.date} the ${r.locality.rate_on_date === r.high_rate ? "high" : "low"} rate of $${r.locality.rate_on_date} applies.`
                : ` No high-cost locality matched, so the low rate of $${r.low_rate} applies.`;
        }
        return reply(s, r, `${r.fiscal_year === 2027 ? SOURCES.n202660 : SOURCES.n202554} (${r.notice})`);
    }));
}
export function createServer() {
    const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
    registerTools(server);
    return server;
}
