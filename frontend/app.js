/**
 * GitHub Pages frontend configuration
 *
 * Replace API_URL with the Google Apps Script Web App /exec URL.
 */

const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbwPgAa6dcOhNuG7QSFPsFVNl9gAFxqWnPQ32wuEBRjyB4yfTEB0nroHLc4cqM-3A8Am/exec",
  REFRESH_SECONDS: 60,
  REQUEST_TIMEOUT_MS: 15000
};

const state = {
  allData: [],
  activeCategory: "All",
  timer: null
};

const el = {
  marketGrid: document.getElementById("marketGrid"),
  filters: document.getElementById("filters"),
  loading: document.getElementById("loading"),
  errorBox: document.getElementById("errorBox"),
  refreshBtn: document.getElementById("refreshBtn"),
  lastUpdated: document.getElementById("lastUpdated"),
  statusDot: document.getElementById("statusDot"),
  connectionStatus: document.getElementById("connectionStatus"),
  refreshLabel: document.getElementById("refreshLabel"),
  cardTemplate: document.getElementById("cardTemplate")
};

init();

function init() {
  el.refreshLabel.textContent = CONFIG.REFRESH_SECONDS;

  el.refreshBtn.addEventListener("click", () => loadPrices(true));

  if (!isConfigured()) {
    showError(
      "Open app.js and replace PASTE_YOUR_GOOGLE_APPS_SCRIPT_EXEC_URL_HERE " +
      "with your deployed Google Apps Script /exec URL."
    );
    setConnection(false, "Setup required");
    return;
  }

  loadPrices(false);
  startAutoRefresh();
}

function isConfigured() {
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/.test(CONFIG.API_URL);
}

async function loadPrices(force) {
  setLoading(true);
  hideError();
  el.refreshBtn.disabled = true;

  try {
    const url = new URL(CONFIG.API_URL);
    url.searchParams.set("action", "prices");
    if (force) url.searchParams.set("force", "1");

    const result = await fetchJson(url.toString());

    if (!result.success) {
      throw new Error(result.error || "Backend returned an error.");
    }

    state.allData = Array.isArray(result.data) ? result.data : [];

    renderFilters();
    renderCards();

    const date = result.timestamp ? new Date(result.timestamp) : new Date();
    el.lastUpdated.textContent = formatDate(date);

    setConnection(true, result.cached ? "Connected · cached" : "Connected");

  } catch (error) {
    console.error(error);
    showError(error.message || "Could not load market data.");
    setConnection(false, "Connection error");

  } finally {
    setLoading(false);
    el.refreshBtn.disabled = false;
  }
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();

  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out.");
    }
    throw err;

  } finally {
    clearTimeout(timeout);
  }
}

function renderFilters() {
  const categories = [
    "All",
    ...new Set(state.allData.map(x => x.category).filter(Boolean))
  ];

  if (!categories.includes(state.activeCategory)) {
    state.activeCategory = "All";
  }

  el.filters.innerHTML = "";

  categories.forEach(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "filter-btn" + (category === state.activeCategory ? " active" : "");
    button.textContent = category;

    button.addEventListener("click", () => {
      state.activeCategory = category;
      renderFilters();
      renderCards();
    });

    el.filters.appendChild(button);
  });
}

function renderCards() {
  el.marketGrid.innerHTML = "";

  const rows = state.activeCategory === "All"
    ? state.allData
    : state.allData.filter(x => x.category === state.activeCategory);

  if (!rows.length) {
    const empty = document.createElement("div");
    empty.className = "notice";
    empty.textContent = "No assets in this category.";
    el.marketGrid.appendChild(empty);
    return;
  }

  rows.forEach(item => {
    const card = el.cardTemplate.content.firstElementChild.cloneNode(true);

    card.querySelector(".symbol").textContent =
      item.displaySymbol || item.apiSymbol || "—";

    card.querySelector(".name").textContent =
      item.name || "Unknown asset";

    card.querySelector(".category-pill").textContent =
      item.category || "Other";

    if (!item.ok) {
      card.classList.add("has-error");
      card.querySelector(".price").textContent = "Unavailable";

      const error = card.querySelector(".card-error");
      error.textContent =
        item.error || "No market quote was returned.";
      error.classList.remove("hidden");

      el.marketGrid.appendChild(card);
      return;
    }

    const decimals = Number.isFinite(Number(item.decimals))
      ? Number(item.decimals)
      : 2;

    card.querySelector(".price").textContent =
      formatPrice(item.price, decimals, item.currency);

    const changeEl = card.querySelector(".change");
    const ch = numberOrNull(item.change);
    const pct = numberOrNull(item.changePercent);

    if (ch !== null || pct !== null) {
      const direction = (ch ?? pct ?? 0);

      changeEl.classList.add(
        direction > 0 ? "positive" :
        direction < 0 ? "negative" :
        "neutral"
      );

      const changeText = ch === null
        ? ""
        : `${ch > 0 ? "+" : ""}${formatNumber(ch, decimals)}`;

      const pctText = pct === null
        ? ""
        : `${pct > 0 ? "+" : ""}${formatNumber(pct, 2)}%`;

      changeEl.textContent =
        [changeText, pctText].filter(Boolean).join("  ");

    } else {
      changeEl.textContent = "—";
      changeEl.classList.add("neutral");
    }

    card.querySelector(".open").textContent =
      formatOptional(item.open, decimals);

    card.querySelector(".high").textContent =
      formatOptional(item.high, decimals);

    card.querySelector(".low").textContent =
      formatOptional(item.low, decimals);

    card.querySelector(".prev").textContent =
      formatOptional(item.previousClose, decimals);

    el.marketGrid.appendChild(card);
  });
}

function formatPrice(value, decimals, currency) {
  const n = numberOrNull(value);
  if (n === null) return "—";

  const formatted = formatNumber(n, decimals);

  // Most configured pairs are USD quoted.
  return currency === "USD" ? `$${formatted}` : `${formatted} ${currency || ""}`.trim();
}

function formatOptional(value, decimals) {
  const n = numberOrNull(value);
  return n === null ? "—" : formatNumber(n, decimals);
}

function formatNumber(value, decimals) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

function setLoading(active) {
  el.loading.classList.toggle("hidden", !active);
}

function showError(message) {
  el.errorBox.textContent = message;
  el.errorBox.classList.remove("hidden");
}

function hideError() {
  el.errorBox.classList.add("hidden");
}

function setConnection(ok, text) {
  el.statusDot.classList.toggle("online", ok);
  el.statusDot.classList.toggle("offline", !ok);
  el.connectionStatus.textContent = text;
}

function startAutoRefresh() {
  if (state.timer) clearInterval(state.timer);

  state.timer = setInterval(
    () => loadPrices(false),
    CONFIG.REFRESH_SECONDS * 1000
  );
}
