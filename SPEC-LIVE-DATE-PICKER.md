# Live Date Picker — Architecture Spec
**Date:** 2026-07-28  
**Author:** BJ / Tyler B  
**Status:** Implementation in progress (Sunflower as template client)

---

## Problem

The current date picker only filters pre-cached array data (ads monthly breakdown, GBP timeseries, organic sessions chart). Scalar fields — GSC keywords, impressions/clicks, Fathom visitor counts, lead signals — don't change when you switch date ranges. This makes the picker misleading.

---

## Solution: Hybrid Model

- **Page load** → fetch `data/<slug>.json` immediately (fast, renders in <1s, same as today)
- **Date picker change** → fire live Cloudflare Pages Function API calls for the date range, swap in fresh data server-side

No full-page reload. No waiting on load. Accurate data when you actually need a different range.

---

## Date Presets (Final List)

Custom range is dropped. Four fixed presets only:

| Preset key | Label | What it means |
|---|---|---|
| `last30` | Last 30 Days | Rolling 30-day window |
| `lastMonth` | Last Month | Clean calendar month — default, matches reporting |
| `last3months` | Last 3 Months | Quarter-ish trend |
| `ytd` | Year to Date | Jan 1 → today |

**Default:** `lastMonth` — matches the standard reporting period clients expect.

---

## Data Sources: Live vs Cached

| Source | Mode | CF Function | Notes |
|---|---|---|---|
| GSC (keywords, impressions, clicks) | **Live** | `functions/api/gsc.js` ✅ exists | Already written, just needs wiring |
| GA4 (sessions, conversions, channels) | **Live** | `functions/api/ga4.js` | SA auth, same pattern as GSC |
| Fathom (uniques, visits, bounce, duration) | **Live** | `functions/api/fathom.js` | Bearer token, clean REST |
| GBP (calls, directions, views) | **Live** | `functions/api/gbp.js` | SA auth (DWD), Business Profile Performance API |
| GHL (contacts, conversations) | **Live** | `functions/api/ghl.js` | API key, filter by date |
| Meta Ads | **Live** | `functions/api/meta.js` | System user token (build when needed) |
| Local Falcon | **Cached** | — | Scans are point-in-time, no date range API |
| DataForSEO | **Cached** | — | Per-query cost, don't hit on picker change |
| PageSpeed / PSI | **Cached** | — | Slow + no date range concept |
| Work Log (Monday) | **Cached** | — | Pulled on daily cron, no live need |

---

## CF Pages Function Contract

All functions share the same interface:

**Request:**
```
GET /api/<source>?slug=sunflower&period=lastMonth
```

**Response:**
```json
{
  "period": "lastMonth",
  "startDate": "2026-07-01",
  "endDate": "2026-07-31",
  "fetchedAt": "2026-07-28T...",
  // source-specific payload
}
```

**Error:**
```json
{ "error": "Description of what went wrong" }
```

**Rules:**
- All functions return `Cache-Control: no-store`
- All functions accept `slug` param (used to look up per-client IDs from a config map)
- Period math is always server-side — client just sends the preset key
- Missing/unconfigured clients return `{ "skipped": true }` (not an error)

### Period date math (shared across all functions)

```js
function getDateRange(period) {
  const now = new Date();
  switch (period) {
    case 'last30': {
      const end = new Date(now); end.setDate(end.getDate() - 1);
      const start = new Date(end); start.setDate(start.getDate() - 29);
      return { startDate: fmt(start), endDate: fmt(end) };
    }
    case 'lastMonth': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last  = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: fmt(first), endDate: fmt(last) };
    }
    case 'last3months': {
      const end = new Date(now); end.setDate(end.getDate() - 1);
      const start = new Date(end); start.setMonth(start.getMonth() - 3);
      return { startDate: fmt(start), endDate: fmt(end) };
    }
    case 'ytd': {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now); end.setDate(end.getDate() - 1);
      return { startDate: fmt(start), endDate: fmt(end) };
    }
    default:
      return getDateRange('lastMonth');
  }
}
```

---

## Client Config Map

Each CF function needs to know per-client IDs (GA4 property, Fathom site ID, etc.). These are embedded in each function as a `CLIENT_MAP` object matching `clients.json`. Updated whenever a new client is onboarded.

---

## Dashboard Changes

### 1. Replace preset dropdown

Remove: `This Month`, `Last Month`, `Last 3 Months`, `Last 6 Months`, `Year to Date`, `Custom`  
Add: `Last 30 Days`, `Last Month`, `Last 3 Months`, `Year to Date`  
Default: `Last Month`

Remove the custom date range UI entirely (`dr-custom` div, `dr-start`/`dr-end` selects, error span).

### 2. `onPresetChange()` — new behavior

When preset changes:
1. Show loading overlay on each data section
2. Fire parallel `fetch()` calls to all relevant live API endpoints
3. When all resolve: merge live data into `DR_DATA`, call `applyRange()` with the full date range
4. Hide loading overlays

```js
function onPresetChange() {
  var preset = el('dr-preset').value;
  var cfg = window.CLIENT_CONFIG || {};
  showLoadingState();
  fetchLiveData(preset, cfg).then(function(liveData) {
    var merged = mergeData(DR_DATA, liveData);
    DR_DATA = merged;
    applyPreset(preset);
    hideLoadingState();
  }).catch(function() {
    // Fall back to cached data silently
    applyPreset(preset);
    hideLoadingState();
  });
}
```

### 3. Loading state

Simple approach: lime-bordered pulse on each section card while loading. No skeleton screens, no spinners per field. Just a subtle `.loading` class on `#ct` that fades section opacity to 0.6 and shows a thin lime progress bar at the top.

### 4. `mergeData(cached, live)`

Live data wins for fields it provides. Cached data fills everything else. Local Falcon, PSI, work log, keywords rankings always come from cache.

---

## PSI Switcher Fix

**Root cause confirmed:** `PSI_DATA` is set correctly (`mobile` + `desktop` objects). The switcher works — but `analyticsSource` is missing from some client JSON files, causing `renderWebsite` to skip the Fathom path and not call `renderPSI` at all on re-render.

**Fix:** 
1. Set `analyticsSource: 'fathom'` in `data/<slug>.json` for all Fathom clients at build time
2. Ensure `renderPSI` is always called at end of `renderWebsite` regardless of analytics source

---

## CF Pages Env Vars Required

All already set as GitHub Actions secrets. Need to confirm set in CF Pages project settings:

| Var | Used by |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | ga4.js, gsc.js, gbp.js |
| `FATHOM_API_TOKEN` | fathom.js |
| `GHL_API_KEY` | ghl.js |
| `META_ACCESS_TOKEN` | meta.js (future) |

---

## Rollout Plan

1. ✅ Build all CF Functions (`ga4`, `fathom`, `gbp`, `ghl`)
2. ✅ Update `report-template.html` — new presets, `onPresetChange` live fetch, loading state
3. ✅ Fix PSI switcher + `analyticsSource` 
4. ✅ Deploy Sunflower as template — verify all four presets work live
5. Roll to all other clients — just requires `CLIENT_MAP` entries in each function

---

## What Stays the Same

- Page load behavior — `data/<slug>.json` still fetched first, renders immediately
- `applyRange()` internal logic — still used after live data is merged in
- Work log, Local Falcon, DataForSEO, PSI — always from cache, never live-fetched
- Export PDF — uses whatever is currently rendered, no change needed
