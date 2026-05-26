/**
 * Background Service Worker — AmCupon Extension
 * Descarca si cacheaza output.json zilnic.
 */

const DATA_URL    = "https://amcupon.ro/output.json";
const CACHE_KEY   = "amcupon_data";
const CACHE_TS    = "amcupon_ts";
const TTL_MS      = 6 * 60 * 60 * 1000; // 6 ore

async function fetchAndCache() {
  try {
    const res  = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    await chrome.storage.local.set({
      [CACHE_KEY]: data,
      [CACHE_TS]:  Date.now(),
    });
    console.log(`[AmCupon] Date actualizate: ${data.length} magazine`);
    return data;
  } catch (err) {
    console.warn("[AmCupon] Fetch esuat:", err.message);
    return null;
  }
}

async function getDataCached() {
  const stored = await chrome.storage.local.get([CACHE_KEY, CACHE_TS]);
  const ts     = stored[CACHE_TS] || 0;
  const data   = stored[CACHE_KEY];

  if (data && Date.now() - ts < TTL_MS) {
    return data;
  }
  return fetchAndCache();
}

// ── La instalare: fetch imediat ──────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  console.log("[AmCupon] Extensie instalata — fetch date initiale");
  fetchAndCache();
});

// ── Alarm zilnica pentru refresh date ────────────────────────────────────────
chrome.alarms.create("refresh_data", { periodInMinutes: 360 }); // 6h

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refresh_data") {
    fetchAndCache();
  }
});

// ── Mesaje de la popup ────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_DATA") {
    getDataCached().then((data) => sendResponse({ data }));
    return true; // async response
  }
  if (msg.type === "FORCE_REFRESH") {
    fetchAndCache().then((data) => sendResponse({ data }));
    return true;
  }
});
