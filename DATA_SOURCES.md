# Data sources

Every rate in `src/core.ts`, `src/gsa.ts` and `src/highcost.ts` was copied from the documents below, fetched on 2026-11-03.

| Figures | Source | URL |
|---|---|---|
| Standard mileage rates 2011-2026 for business, charity, medical and military moving, with both 2026 periods | IRS "Standard mileage rates" page (updated 28-Jul-2026) | https://www.irs.gov/tax-professionals/standard-mileage-rates |
| 2026 from July 1: business 76 cents, medical and moving 23.5 cents (fuel price increase); charity fixed at 14 cents by IRC 170(i); Notice 2026-10 otherwise stays in effect | Announcement 2026-11, IRB 2026-29 | https://www.irs.gov/irb/2026-29_irb |
| 2026 from Jan. 1: business 72.5, medical and moving 20.5, charity 14; depreciation 26/28/30/33/35 cents for 2022-2026; FAVR max standard auto cost and max FMV $61,700 | IRS Notice 2026-10 | https://www.irs.gov/pub/irs-drop/n-26-10.pdf |
| 2026 rates news release, Dec. 29, 2025 | IR-2025-128 | https://www.irs.gov/newsroom/irs-sets-2026-business-standard-mileage-rate-at-725-cents-per-mile-up-25-cents |
| 2025: business 70; depreciation 26 (2021); FAVR max $61,200 | IRS Notice 2025-5 | https://www.irs.gov/pub/irs-drop/n-25-05.pdf |
| FY2027 GSA per diem by ZIP (Oct. 1, 2026 - Sept. 30, 2027): lodging by month and M&IE for 295 destinations; standard CONUS $113 / $68 | GSA, FY2027PerDiemZipCode_Validated090126.xlsx | https://www.gsa.gov/system/files/FY2027PerDiemZipCode_Validated090126.xlsx |
| FY2026 GSA per diem by ZIP; standard CONUS $110 / $68 | GSA, FY2026_ZipCodeFile.xlsx | https://www.gsa.gov/system/files/FY2026_ZipCodeFile.xlsx |
| FY2027 rates list (checked: standard $113 / $68) | GSA, FY2027_PerDiemRates_Validated090126.xlsx | https://www.gsa.gov/travel/per-diem-rates/per-diem-files |
| CONUS M&IE breakdown for $68, $74, $80, $86, $92 (breakfast, lunch, dinner, incidentals, 75% first and last day) | GSA M&IE breakdowns ("FY 25-Present") | https://www.gsa.gov/travel/per-diem-rates/mie-breakdowns |
| FY2027 high-low: $329 high / $230 low, meals $86 / $74, transportation industry M&IE $80 CONUS / $86 OCONUS, incidental only $5, 91 high-cost localities (threshold $280) | IRS Notice 2026-60, IRB 2026-43 | https://www.irs.gov/irb/2026-43_irb |
| FY2026 high-low: $319 / $225, meals $86 / $74, 88 high-cost localities (threshold $272) | IRS Notice 2025-54, IRB 2025-41 | https://www.irs.gov/irb/2025-41_IRB |

## Checks

- GSA per diem API (api.gsa.gov, DEMO_KEY) for ZIP 20001, FY2027, returned the same monthly lodging (Jan 203, Mar 295, Jul 192, Sep and Oct 287) and $92 M&IE as the bundled ZIP file. The API needs a key, so the server uses the published files.
- The IRS mileage page labels the July 2026 source "IR-2026-29" but links to IRB 2026-29; the rates come from Announcement 2026-11 in that bulletin.
- 1,839 ZIP codes span more than one per diem area (or a listed area and the standard rate). The tools return every match for those ZIPs.
