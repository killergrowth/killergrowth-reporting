# Google Ads → Sheet Pipeline Setup

How to wire up a new client's Google Ads data into reports.killergrowth.com.

**Why this approach:** Google Ads API requires an approved developer token. Google Ads Scripts run *inside* the account — no developer token needed. Script writes daily rows to a central Google Sheet; our build pipeline reads from there.

---

## One-Time Sheet Setup (already done for Sunflower)

1. Create a Google Sheet named `KG Google Ads Data`
2. Create an `all_clients` tab — paste this formula into cell A1:
   ```
   ={"client_id","date","campaign_name","impressions","clicks","cost_usd","conversions";FILTER({"sunflower",sunflower!A2:F},LEN(sunflower!A2:A)>0)}
   ```
   When adding future clients, append a row inside the formula:
   ```
   ;FILTER({"nextclient",nextclient!A2:F},LEN(nextclient!A2:A)>0)
   ```
   before the final `}`
3. Share the sheet:
   - `openclaw-agent@killergrowth.iam.gserviceaccount.com` → **Editor**
   - Everyone else → **Viewer** (prevents accidental column/tab changes)
4. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit`
5. Add it as a GitHub Actions secret: `GOOGLE_ADS_SHEET_ID`

---

## Adding a New Client

### Step 1 — Install the Ads Script in the client's Google Ads account

1. Log in to the client's Google Ads account (or the MCC)
2. Go to: **Tools & Settings → Bulk Actions → Scripts**
3. Click **+** to create a new script
4. Copy the full contents of `scripts/kg-ads-export.js`
5. At the top, set:
   ```js
   var SHEET_ID  = '<paste the Sheet ID here>';
   var CLIENT_ID = '<client slug — must match clients.json>';
   ```
6. Click **Authorize** (grants the script access to write to Google Sheets)
7. Click **Run** once manually — this backfills from Jan 1 2026
8. Set the schedule: **Daily** — use the next available slot in the stagger table below

### Stagger schedule (add 5 min per client)

| Client          | Schedule time |
|----------------|---------------|
| sunflower       | 6:05am        |
| next client     | 6:10am        |
| next client     | 6:15am        |
| next client     | 6:20am        |

### Step 2 — Update `all_clients` tab formula

In the Google Sheet, edit the formula in `all_clients!A1` to include the new client tab:

```
={"client_id","date","campaign_name","impressions","clicks","cost_usd","conversions";
  FILTER({"sunflower",sunflower!A2:F},LEN(sunflower!A2:A)>0);
  FILTER({"newclient",newclient!A2:F},LEN(newclient!A2:A)>0)}
```

### Step 3 — Add client config in `scripts/clients.json`

Make sure `googleAdsCustomerId` is set (no dashes) for the client slug.

### Step 4 — Add a workflow step in `.github/workflows/pull-data.yml`

Copy the Sunflower step, change the slug and if-condition. Make sure `GOOGLE_ADS_SHEET_ID` is included in env.

### Step 5 — Verify

Run the GitHub Actions workflow manually for the new client slug. Check:
- `data/<client-slug>.json` is updated
- `ads.monthlyBreakdown` has data
- Live report page shows Google Ads numbers

---

## How the Pipeline Works

```
Google Ads Account (client)
  └─ Google Ads Script (kg-ads-export.js)
       Runs daily at 6:05am (or per stagger)
       Writes daily rows to: "KG Google Ads Data" Sheet → per-client tab
            ↓
Google Sheet "KG Google Ads Data"
  ├─ sunflower tab   (date, campaign_name, impressions, clicks, cost_usd, conversions)
  ├─ nextclient tab  (same columns)
  └─ all_clients tab (=QUERY formula aggregating all tabs + client_id column)
            ↓
GitHub Actions (hourly cron)
  └─ scripts/pull-google-ads.js
       Reads all_clients tab via Sheets API (service account auth)
       Filters by client slug, aggregates to monthly/campaign shape
       Writes into data/<client>.json under ads.monthlyBreakdown + ads.campaigns
            ↓
build.js → dist/ → Cloudflare Pages → reports.killergrowth.com
```

---

## Troubleshooting

**Script says "Could not open sheet"**
→ SHEET_ID is wrong, or the sheet hasn't been shared with the Google account running the script. The Ads Script runs as the Google account that authorized it — that account needs at least Editor access to the sheet.

**all_clients tab is empty**
→ The per-client tab formula in all_clients may not reference the new client tab yet. Update the formula.

**pull-google-ads.js says "No sheet data for client: sunflower"**
→ Either the sheet ID env var is missing, or the `all_clients` tab formula doesn't include a sunflower row yet, or the script hasn't run its first backfill.

**Developer token gets approved later**
→ When that happens, `pull-google-ads.js` will automatically try the Sheet first (if `GOOGLE_ADS_SHEET_ID` is set). To switch to direct API, remove the `GOOGLE_ADS_SHEET_ID` secret. The fallback path is already wired in.
