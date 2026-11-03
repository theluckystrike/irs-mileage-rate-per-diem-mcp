// GET / page for the hosted Worker.
const TOOLS = [
    ["get_mileage_rate", "IRS standard mileage rates 2011-2026, including the July 1, 2026 increase to 76 cents a mile for business."],
    ["calculate_mileage_deduction", "Deduction or reimbursement for miles by date and purpose, split across the 2026 mid-year rate change."],
    ["get_per_diem_rates", "GSA lodging by month and M&IE by ZIP or city for FY2026 and FY2027 (standard $113 / $68 from Oct. 1, 2026)."],
    ["calculate_trip_per_diem", "Maximum per diem for a trip: nightly lodging, M&IE with 75% first and last day, minus provided meals."],
    ["get_high_low_per_diem", "IRS high-low rates ($329 / $230 from Oct. 1, 2026) and whether a city is a high-cost locality on a date."],
];
function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
export function landingPage(origin) {
    const mcp = `${origin}/mcp`;
    const rows = TOOLS.map(([n, d]) => `<tr><td><code>${n}</code></td><td>${esc(d)}</td></tr>`).join("");
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>IRS Mileage Rate and Per Diem MCP</title>
<meta name="description" content="MCP server with the IRS standard mileage rates (76 cents from July 1, 2026), GSA per diem rates by ZIP for FY2026 and FY2027, and the IRS high-low per diem rates.">
<style>:root{--bg:#fff;--fg:#1a1a1a;--muted:#555;--line:#ddd;--code:#f4f4f4}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#eee;--muted:#aaa;--line:#333;--code:#222}}
body{background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif;max-width:760px;margin:0 auto;padding:24px 16px}
code,pre{background:var(--code);border-radius:4px;font-size:14px}pre{padding:10px;overflow-x:auto}code{padding:1px 4px}
table{border-collapse:collapse;width:100%}td{border-top:1px solid var(--line);padding:8px 6px;vertical-align:top}p.small{color:var(--muted);font-size:14px}a{color:inherit}</style></head>
<body><h1>IRS Mileage Rate and Per Diem MCP server</h1>
<p>Gives an AI assistant the official travel rates that are newer than its training data: the IRS standard mileage rates with the mid-2026 increase, the GSA per diem rates for every ZIP code for FY2026 and FY2027, and the IRS high-low per diem rates from Notice 2026-60. Every figure is copied from irs.gov or gsa.gov.</p>
<h2>Connect</h2>
<p>Hosted endpoint (Streamable HTTP, no sign-in, no token). Paste it into Claude.ai custom connectors or ChatGPT developer mode.</p>
<pre>${esc(mcp)}</pre>
<p>Claude Code</p><pre>claude mcp add --transport http mileage-per-diem ${esc(mcp)}</pre>
<p>Local (stdio)</p><pre>npx -y github:theluckystrike/irs-mileage-rate-per-diem-mcp</pre>
<h2>Tools</h2><table>${rows}</table>
<p>Self-employed and tracking deductions? <a href="https://taxbreakcalc.com/self-employed-set-aside-calculator/?utm_source=mcp&amp;utm_medium=irs-mileage-rate-per-diem-mcp">Self-employed set-aside calculator on taxbreakcalc.com</a>.
Source: <a href="https://github.com/theluckystrike/irs-mileage-rate-per-diem-mcp">github.com/theluckystrike/irs-mileage-rate-per-diem-mcp</a>.</p>
<p class="small">General information, not tax advice. Part of the Zovo MCP collection: <a href="https://mcp.zovo.one">mcp.zovo.one</a>.</p>
</body></html>`;
}
