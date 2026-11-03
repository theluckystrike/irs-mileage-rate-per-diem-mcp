# irs-mileage-rate-per-diem-mcp

An MCP server that gives an AI assistant the official IRS standard mileage rates, including the July 1, 2026 increase to 76 cents a mile, the GSA per diem rates for every ZIP code for FY2026 and FY2027, and the IRS high-low per diem rates from Notice 2026-60. It calculates mileage deductions and trip per diem with the right rate for each date.

Hosted endpoint, no sign-in and no token:

```
https://irs-mileage-rate-per-diem-mcp.lipmichal.workers.dev/mcp
```

## Tools

| Tool | What it does |
|---|---|
| `get_mileage_rate` | IRS business, medical, charity and military moving rates for a year or date (2011-2026), the depreciation part of the business rate and the FAVR / employer-vehicle maximum value. |
| `calculate_mileage_deduction` | Deduction or tax-free reimbursement for a list of trips, each at the rate in force on its date. Splits 2026 at July 1 and returns the basis reduction for business miles. |
| `get_per_diem_rates` | GSA maximum lodging by month and M&IE for a ZIP code or city, with the meal breakdown and the 75% first and last day amount. FY2026 and FY2027. |
| `calculate_trip_per_diem` | Maximum per diem for a trip: each night at that month's lodging rate (across seasons and the Oct. 1 fiscal year change), M&IE with 75% on travel days, minus provided meals. |
| `get_high_low_per_diem` | IRS high-low rates, the meals portion, transportation industry M&IE and incidentals rate for a date, and whether a city is a high-cost locality on that date. |

Every result has structured JSON, a plain-English summary, `as_of`, `source` (the irs.gov or gsa.gov document) and `more` (a self-employed tax calculator on taxbreakcalc.com).

## What it knows that your model does not

- The IRS raised the 2026 business mileage rate mid-year: 72.5 cents a mile from Jan. 1 to June 30, 2026 and 76 cents from July 1, 2026 (Announcement 2026-11). Medical and military moving went from 20.5 to 23.5 cents. Charity stays at 14 cents.
- The depreciation part of the 2026 business rate is 35 cents a mile. The FAVR and employer-vehicle maximum value for 2026 is $61,700 (Notice 2026-10).
- FY2027 GSA per diem (from Oct. 1, 2026): standard CONUS rate $113 lodging and $68 M&IE, and the rates for 295 named destinations by month.
- IRS high-low method from Oct. 1, 2026: $329 high and $230 low, with $86 and $74 treated as meals (Notice 2026-60). Tucson, San Mateo, Albuquerque and Cody were added; Panama City was removed.
- The IRS had not announced the 2027 mileage rates on 2026-11-03. The tools say so.

## Install

### Claude.ai custom connector or ChatGPT developer mode

Add a custom connector and paste the URL. No token is needed.

```
https://irs-mileage-rate-per-diem-mcp.lipmichal.workers.dev/mcp
```

### Claude Code

```
claude mcp add --transport http mileage-per-diem https://irs-mileage-rate-per-diem-mcp.lipmichal.workers.dev/mcp
```

Or run it locally:

```
claude mcp add mileage-per-diem -- npx -y github:theluckystrike/irs-mileage-rate-per-diem-mcp
```

### Claude Desktop

Add this to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mileage-per-diem": {
      "command": "npx",
      "args": ["-y", "github:theluckystrike/irs-mileage-rate-per-diem-mcp"]
    }
  }
}
```

### Cursor

Add this to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mileage-per-diem": {
      "url": "https://irs-mileage-rate-per-diem-mcp.lipmichal.workers.dev/mcp"
    }
  }
}
```

### VS Code

Add this to `.vscode/mcp.json`:

```json
{
  "servers": {
    "mileage-per-diem": {
      "type": "http",
      "url": "https://irs-mileage-rate-per-diem-mcp.lipmichal.workers.dev/mcp"
    }
  }
}
```

Node 20 or newer is needed for the local `npx` version.

## Example prompts

- "What is the IRS mileage rate for 2026? Did it change during the year?"
- "I drove 6,200 business miles from January to June 2026 and 5,800 from July to December. What is my deduction?"
- "What is the per diem for ZIP 02110 in March 2027?"
- "Calculate the per diem for a trip to Washington DC from September 29 to October 2, 2026, with lunch provided one day."
- "What are the IRS high-low per diem rates from October 2026, and is Chicago high-cost in November?"

## Data sources

IRS Notice 2026-10, Announcement 2026-11, Notice 2025-5, the IRS standard mileage rates table, Notices 2026-60 and 2025-54, the GSA FY2026 and FY2027 per diem ZIP code files and the GSA M&IE breakdown table, all fetched on 2026-11-03. See [DATA_SOURCES.md](DATA_SOURCES.md).

## Limitations

- General information, not tax advice.
- Per diem covers the continental U.S. (CONUS) only. Alaska, Hawaii, territories and foreign rates (OCONUS, set by the Department of Defense and State Department) are not included.
- GSA rates for FY2026 and FY2027 only. Mileage rates for 2011 to 2026.
- Some ZIP codes span more than one per diem area. The tools list every match; pick by the county the lodging is in.
- The trip calculator applies the federal travel rules (75% M&IE on the first and last day). Your employer's policy can differ.

## More

Self-employed and tracking deductions? Use the [self-employed set-aside calculator](https://taxbreakcalc.com/self-employed-set-aside-calculator/?utm_source=mcp&utm_medium=irs-mileage-rate-per-diem-mcp) on taxbreakcalc.com.

Part of the Zovo MCP collection: https://mcp.zovo.one

## Development

```
npm install
npm run build
npm test
```

`src/core.ts` holds the rates and rules and has no I/O. `src/gsa.ts` and `src/highcost.ts` are generated from the GSA files and Notice tables. `src/stdio.ts` is the local entry and `src/worker.ts` is the Cloudflare Worker entry. Both use the same tool registry in `src/tools.ts`.

## License

MIT

<!-- data-servers:start -->
## More data servers from the same author

Each one is free, needs no API key and has a hosted URL you can paste into Claude or ChatGPT.

| server | tools | hosted URL |
|---|---|---|
| [cups-to-grams-mcp](https://github.com/theluckystrike/cups-to-grams-mcp) | convert_ingredient, search_ingredients, scale_recipe, convert_oven_temperature | `https://cups-to-grams-mcp.lipmichal.workers.dev/mcp` |
| [dscr-loan-calculator-mcp](https://github.com/theluckystrike/dscr-loan-calculator-mcp) | calculate_dscr, max_loan_for_target_dscr, rent_needed_for_target_dscr, compare_scenarios, amortization_summary | `https://dscr-loan-calculator-mcp.lipmichal.workers.dev/mcp` |
| [gold-price-per-gram-mcp](https://github.com/theluckystrike/gold-price-per-gram-mcp) | get_gold_price_per_gram, get_metal_prices, calculate_jewelry_value, convert_gold_units | `https://gold-price-per-gram-mcp.lipmichal.workers.dev/mcp` |
| [lake-level-mcp](https://github.com/theluckystrike/lake-level-mcp) | search_lakes, get_lake_level, get_lake_history, compare_lakes | `https://lake-level-mcp.lipmichal.workers.dev/mcp` |
| [minimum-wage-mcp](https://github.com/theluckystrike/minimum-wage-mcp) | get_minimum_wage, list_upcoming_increases, compare_states, annual_income_at_minimum_wage | `https://minimum-wage-mcp.lipmichal.workers.dev/mcp` |
| [no-tax-on-overtime-mcp](https://github.com/theluckystrike/no-tax-on-overtime-mcp) | calculate_overtime_deduction, calculate_tips_deduction, calculate_senior_deduction, estimate_tax_savings, explain_eligibility | `https://no-tax-on-overtime-mcp.lipmichal.workers.dev/mcp` |
| [paycheck-calculator-mcp](https://github.com/theluckystrike/paycheck-calculator-mcp) | calculate_take_home_pay, compare_states_take_home, salary_to_hourly, hourly_to_salary, get_federal_tax_brackets | `https://paycheck-calculator-mcp.lipmichal.workers.dev/mcp` |
| [uk-income-tax-salary-mcp](https://github.com/theluckystrike/uk-income-tax-salary-mcp) | calculate_uk_take_home, get_uk_tax_bands, compare_salaries, marginal_rate_at_income | `https://uk-income-tax-salary-mcp.lipmichal.workers.dev/mcp` |
| [us-federal-holidays-business-days-mcp](https://github.com/theluckystrike/us-federal-holidays-business-days-mcp) | list_federal_holidays, is_business_day, add_business_days, count_business_days, invoice_due_date | `https://us-federal-holidays-business-days-mcp.lipmichal.workers.dev/mcp` |
| [ab-test-sample-size-calculator-mcp](https://github.com/theluckystrike/ab-test-sample-size-calculator-mcp) | calculate_sample_size, estimate_test_duration, test_ab_significance, fisher_exact_test, check_peeking_risk | `https://ab-test-sample-size-calculator-mcp.lipmichal.workers.dev/mcp` |
| [aca-premium-tax-credit-calculator-mcp](https://github.com/theluckystrike/aca-premium-tax-credit-calculator-mcp) | get_federal_poverty_level, calculate_premium_tax_credit, check_subsidy_cliff, get_aptc_repayment_cap | `https://aca-premium-tax-credit-calculator-mcp.lipmichal.workers.dev/mcp` |
| [ap-score-distributions-mcp](https://github.com/theluckystrike/ap-score-distributions-mcp) | get_ap_score_distribution, estimate_ap_percentile, compare_ap_exams, list_ap_exams, estimate_ap_score_from_composite | `https://ap-score-distributions-mcp.lipmichal.workers.dev/mcp` |
| [car-loan-interest-deduction-calculator-mcp](https://github.com/theluckystrike/car-loan-interest-deduction-calculator-mcp) | calculate_car_loan_interest_deduction, calculate_salt_deduction, get_tax_brackets_and_standard_deduction, calculate_child_tax_credit | `https://car-loan-interest-deduction-calculator-mcp.lipmichal.workers.dev/mcp` |
| [cpi-inflation-calculator-mcp](https://github.com/theluckystrike/cpi-inflation-calculator-mcp) | calculate_inflation, get_latest_cpi, get_inflation_rate, compare_raise_to_inflation, calculate_social_security_cola | `https://cpi-inflation-calculator-mcp.lipmichal.workers.dev/mcp` |
| [estate-gift-tax-exemption-calculator-mcp](https://github.com/theluckystrike/estate-gift-tax-exemption-calculator-mcp) | get_exemption_amounts, calculate_estate_tax, check_gift, compare_years | `https://estate-gift-tax-exemption-calculator-mcp.lipmichal.workers.dev/mcp` |
| [recipe-nutrition-calculator-mcp](https://github.com/theluckystrike/recipe-nutrition-calculator-mcp) | lookup_ingredient_nutrition, calculate_recipe_nutrition, round_nutrition_label, scale_recipe_nutrition | `https://recipe-nutrition-calculator-mcp.lipmichal.workers.dev/mcp` |
| [retirement-contribution-limits-2027-mcp](https://github.com/theluckystrike/retirement-contribution-limits-2027-mcp) | get_contribution_limits, calculate_max_contribution, get_social_security_cola, compare_years | `https://retirement-contribution-limits-2027-mcp.lipmichal.workers.dev/mcp` |
| [section-179-deduction-calculator-mcp](https://github.com/theluckystrike/section-179-deduction-calculator-mcp) | calculate_section_179, calculate_bonus_depreciation, get_vehicle_depreciation_limits, calculate_asset_loan_payment | `https://section-179-deduction-calculator-mcp.lipmichal.workers.dev/mcp` |
| [student-loan-repayment-assistance-plan-calculator-mcp](https://github.com/theluckystrike/student-loan-repayment-assistance-plan-calculator-mcp) | calculate_rap_payment, compare_rap_vs_standard, get_federal_loan_limits, get_plan_transition_dates | `https://student-loan-repayment-assistance-plan-calculator-mcp.lipmichal.workers.dev/mcp` |
| [subdomain-finder-mcp](https://github.com/theluckystrike/subdomain-finder-mcp) | find_subdomains, resolve_subdomains, get_certificate_history, summarize_attack_surface | `https://subdomain-finder-mcp.lipmichal.workers.dev/mcp` |
| [uk-statutory-sick-pay-maternity-pay-calculator-mcp](https://github.com/theluckystrike/uk-statutory-sick-pay-maternity-pay-calculator-mcp) | calculate_statutory_sick_pay, calculate_statutory_maternity_pay, get_minimum_wage_rates, check_eligibility | `https://uk-statutory-sick-pay-maternity-pay-calculator-mcp.lipmichal.workers.dev/mcp` |

The paid back-office collection (invoices, VAT, PDFs, spreadsheets) is at https://mcp.zovo.one
<!-- data-servers:end -->
