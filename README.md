# KSM FREE Multi-Asset Market Dashboard

NO Twelve Data key. NO paid API key required.

## Data sources
- XAUUSD Gold spot: Gold API
- XAGUSD Silver spot: Gold API
- BTCUSD, ETHUSD, SOLUSD, BNBUSD, XRPUSD: CoinGecko Keyless Public API
- EURUSD, GBPUSD, USDJPY: ExchangeRate.fun
- UKOUSD: Yahoo Finance `BZ=F` Brent futures proxy
- WTIUSD: Yahoo Finance `CL=F` WTI futures proxy

## Google Sheet setup
1. Create/open a Google Sheet.
2. Extensions > Apps Script.
3. Paste `backend/Code.gs`.
4. Save.
5. Select `setupSystem` and click Run.
6. Approve permissions.
7. Return to the Sheet. It creates `Assets`, `MarketPrices`, `Settings`.
8. Select `getPrices` in Apps Script and Run to test.

## Deploy backend
Apps Script > Deploy > New deployment > Web app

- Execute as: Me
- Who has access: Anyone

Deploy and copy the URL ending `/exec`.

Test:
- `/exec?action=health`
- `/exec?action=prices`
- `/exec?action=assets`
- `/exec?action=history&symbol=XAUUSD&limit=100`

## GitHub
Open `github-ready/app.js`.

Replace:
`PASTE_YOUR_GOOGLE_APPS_SCRIPT_EXEC_URL_HERE`

with your real `/exec` URL.

Upload these to GitHub main branch root:
- index.html
- app.js
- style.css

GitHub > Settings > Pages:
- Deploy from a branch
- main
- /(root)

## Add assets
Use the Google Sheet `Assets`.

Provider values supported:
- GOLD_API
- COINGECKO
- FX
- YAHOO

Example Dogecoin:
`TRUE | DOGEUSD | COINGECKO | dogecoin | Dogecoin | Crypto | 6 | 130`

## Optional automatic history
Run `installFiveMinuteTrigger()` once to save a market snapshot every 5 minutes.

## Important
`UKOUSD` is mapped to Brent futures (`BZ=F`) and WTIUSD to WTI futures (`CL=F`). These can differ from broker CFD/spot quotes. Yahoo's chart endpoint is unofficial and can throttle/change. CoinGecko Keyless Public API is intended for light usage and can rate-limit shared traffic.
