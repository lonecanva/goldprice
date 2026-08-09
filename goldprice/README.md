# KSM Market Dashboard Working v2

Use a NEW Google Sheet / Apps Script deployment for this dashboard. Do not reuse the old Thai-gold API because its JSON shape is different.

1. Google Sheet > Extensions > Apps Script.
2. Paste `backend/Code.gs`.
3. Run `setupSystem()` once.
4. Deploy > New deployment > Web app > Execute as Me > Anyone.
5. Test `YOUR_EXEC_URL?action=health` then `YOUR_EXEC_URL?action=prices`.
6. Open `github-ready/app.js` and replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_EXEC_URL_HERE` with the new `/exec` URL.
7. Upload `index.html`, `app.js`, `style.css` DIRECTLY to the root of GitHub repo.
8. GitHub Settings > Pages > Deploy from branch > main > /(root).

Default assets: XAUUSD, XAGUSD, BTCUSD, ETHUSD, SOLUSD, BNBUSD, XRPUSD, UKOUSD, WTIUSD.

Providers: Gold API for XAU/XAG/BTC/ETH, CoinGecko for SOL/BNB/XRP, Yahoo Finance futures proxy for Brent/WTI.
