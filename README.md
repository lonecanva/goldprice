# Multi-Asset Market Dashboard

Google Sheets + Google Apps Script backend + GitHub Pages frontend.

Default assets:

- XAUUSD — Gold (`XAU/USD`)
- XAGUSD — Silver (`XAG/USD`)
- UKOUSD — Brent Spot (`XBR/USD`)
- WTIUSD — WTI Spot (`WTI/USD`)
- BTCUSD — Bitcoin
- ETHUSD — Ethereum
- SOLUSD — Solana
- BNBUSD — BNB
- XRPUSD — XRP
- EURUSD
- GBPUSD
- USDJPY

## Part A — Google Sheet / Backend

### 1. Create a Google Sheet

Create a new Google Sheet. You do NOT need to create the tabs manually.

Open:

Extensions → Apps Script

Delete the sample code and paste `backend/Code.gs`.

### 2. Run setupSystem()

In Apps Script, choose:

`setupSystem`

Then click **Run**.

Approve permissions if Google asks.

This creates:

- `Assets`
- `MarketPrices`
- `Settings`

### 3. Add your Twelve Data API key

Option A:

Run `setTwelveDataApiKey()` from Apps Script and paste your key.

Option B:

Apps Script → Project Settings → Script Properties → Add script property

Name:

`TWELVE_DATA_API_KEY`

Value:

your Twelve Data API key

Do NOT put the API key in GitHub.

### 4. Test the backend

Run `getMarketPrices` manually.

Check Execution log and the `MarketPrices` sheet.

If a symbol returns "No quote returned", edit the `ApiSymbol` column in `Assets`.

Important: symbol availability depends on your Twelve Data plan. Commodity access may require a plan that includes commodities.

### 5. Deploy Apps Script

Apps Script:

Deploy → New deployment → Web app

Use:

- Execute as: Me
- Who has access: Anyone

Deploy.

Copy the URL ending in:

`/exec`

Example:

`https://script.google.com/macros/s/XXXXXXXXXXXX/exec`

### 6. Test the web API

Open:

`YOUR_EXEC_URL?action=health`

Then:

`YOUR_EXEC_URL?action=prices`

Then:

`YOUR_EXEC_URL?action=assets`

History example:

`YOUR_EXEC_URL?action=history&symbol=XAUUSD&limit=100`

## Part B — GitHub Frontend

Open:

`frontend/app.js`

Change:

```js
API_URL: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_EXEC_URL_HERE"
```

to your real `/exec` URL.

Upload these files to the ROOT of your GitHub repository:

- `index.html`
- `app.js`
- `style.css`

If you use the files exactly from this ZIP, copy the 3 files from the `frontend` folder into the repository root.

## Enable GitHub Pages

Repository → Settings → Pages

Select:

- Source: Deploy from a branch
- Branch: main
- Folder: / (root)

Save.

## Add or remove assets without editing code

Open the Google Sheet → `Assets`.

Columns:

- Enabled: TRUE/FALSE
- DisplaySymbol: what the website shows
- ApiSymbol: provider/API symbol
- Name
- Category
- Decimals
- SortOrder

Example new asset:

`TRUE | DOGEUSD | DOGE/USD | Dogecoin | Crypto | 6 | 130`

The frontend will receive it automatically.

## Automatic data saving

The frontend requests data every 60 seconds.

The backend caches requests for about 45 seconds so multiple visitors do not immediately create duplicate upstream calls.

Every successful upstream refresh saves one snapshot per asset to `MarketPrices`.

You can optionally run:

`installFiveMinuteTrigger()`

to create a Google Apps Script time trigger that refreshes/saves data every 5 minutes even when nobody has the GitHub page open.

## API endpoints

### Prices

`GET /exec?action=prices`

Force upstream refresh:

`GET /exec?action=prices&force=1`

### Assets

`GET /exec?action=assets`

### History

`GET /exec?action=history&symbol=XAUUSD&limit=100`

### Health

`GET /exec?action=health`

## Notes

1. Public GitHub Pages is client-visible. Keep API keys only in Apps Script Script Properties.
2. Twelve Data plan/data-display licensing can differ by asset class and use case. Confirm that your plan permits the way you intend to display data.
3. Brent naming varies among providers/brokers. The dashboard label can remain `UKOUSD` while `ApiSymbol` is changed independently in the Sheet.
4. If you change `Code.gs` after deploying, deploy a new version / update the web-app deployment so the `/exec` endpoint runs the new code.
