/**
 * Foreign-language dialog badge (JavaScript Injector).
 *
 * Shows a small ISO language code on Movie/Episode posters when the primary
 * *defined* audio track is not English. Undefined/missing/und language tags
 * are ignored (no badge).
 *
 * Install: see foreign-language-badge/README.md (JavaScript Injector + Custom CSS).
 *
 * Uses session AccessToken from localStorage. Leave API_TOKEN empty on normal web.
 */
(function () {
  "use strict";

  const API_BASE = window.location.origin;
  const API_TOKEN = "";
  /** Preferred dialogue languages (no badge). Normalized to lowercase. */
  const PREFERRED = { eng: 1, en: 1, "en-us": 1, "en-gb": 1, english: 1 };
  /** Skip these - never show a badge for undefined/missing tags. */
  const IGNORE = {
    und: 1,
    unk: 1,
    zxx: 1,
    mul: 1,
    mis: 1,
    xxx: 1,
    "": 1,
    undefined: 1,
    unknown: 1,
    null: 1,
    none: 1,
  };
  /** ISO 639-2/3 (and names) → short badge text. */
  const TO_BADGE = {
    jpn: "JP",
    japanese: "JP",
    ja: "JP",
    spa: "ES",
    spanish: "ES",
    es: "ES",
    "es-mx": "ES",
    "es-419": "ES",
    fra: "FR",
    fre: "FR",
    french: "FR",
    fr: "FR",
    ger: "DE",
    deu: "DE",
    german: "DE",
    de: "DE",
    ita: "IT",
    italian: "IT",
    it: "IT",
    kor: "KR",
    korean: "KR",
    ko: "KR",
    chi: "ZH",
    zho: "ZH",
    cmn: "ZH",
    chinese: "ZH",
    zh: "ZH",
    "zh-cn": "ZH",
    "zh-tw": "ZH",
    "zh-hans": "ZH",
    "zh-hant": "ZH",
    por: "PT",
    portuguese: "PT",
    pt: "PT",
    "pt-br": "BR",
    rus: "RU",
    russian: "RU",
    ru: "RU",
    hin: "HI",
    hindi: "HI",
    hi: "HI",
    ara: "AR",
    arabic: "AR",
    ar: "AR",
    tha: "TH",
    thai: "TH",
    th: "TH",
    vie: "VI",
    vietnamese: "VI",
    vi: "VI",
    pol: "PL",
    polish: "PL",
    pl: "PL",
    nld: "NL",
    dut: "NL",
    dutch: "NL",
    nl: "NL",
    swe: "SV",
    swedish: "SV",
    sv: "SV",
    nor: "NO",
    norwegian: "NO",
    no: "NO",
    dan: "DA",
    danish: "DA",
    da: "DA",
    fin: "FI",
    finnish: "FI",
    fi: "FI",
    tur: "TR",
    turkish: "TR",
    tr: "TR",
    heb: "HE",
    hebrew: "HE",
    he: "HE",
    hun: "HU",
    hungarian: "HU",
    hu: "HU",
    ces: "CS",
    cze: "CS",
    czech: "CS",
    cs: "CS",
    ron: "RO",
    rum: "RO",
    romanian: "RO",
    ro: "RO",
    ukr: "UK",
    ukrainian: "UK",
    uk: "UK",
    gre: "EL",
    ell: "EL",
    greek: "EL",
    el: "EL",
    ind: "ID",
    indonesian: "ID",
    id: "ID",
    may: "MS",
    msa: "MS",
    malay: "MS",
    ms: "MS",
    tam: "TA",
    tamil: "TA",
    ta: "TA",
    tel: "TE",
    telugu: "TE",
    te: "TE",
    ben: "BN",
    bengali: "BN",
    bn: "BN",
    yue: "ZH",
    cantonese: "ZH",
  };

  const cache = new Map();
  const pendingIds = new Set();
  let userId = "";
  let accessToken = "";
  let flushTimer = null;
  const BATCH = 40;

  function getCredentials() {
    try {
      var keys = Object.keys(localStorage);
      var key = null;
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf("jellyfin_credentials") === 0) {
          key = keys[i];
          break;
        }
      }
      if (!key) return { userId: "", accessToken: "" };
      var creds = JSON.parse(localStorage.getItem(key));
      if (!creds || !creds.Servers || !creds.Servers[0]) {
        return { userId: "", accessToken: "" };
      }
      var server = creds.Servers[0];
      return {
        userId: server.UserId || "",
        accessToken: server.AccessToken || "",
      };
    } catch (e) {
      return { userId: "", accessToken: "" };
    }
  }

  function getAuthToken() {
    return accessToken || API_TOKEN || "";
  }

  async function apiFetch(path) {
    var token = getAuthToken();
    if (!token) throw new Error("no auth token");
    const r = await fetch(API_BASE + path, {
      headers: { "X-Emby-Token": token },
    });
    if (!r.ok) throw new Error(r.status + " " + path);
    return r.json();
  }

  function normalizeLang(raw) {
    if (raw == null) return "";
    return String(raw).trim().toLowerCase().replace(/_/g, "-");
  }

  function isIgnored(norm) {
    if (!norm) return true;
    if (IGNORE[norm]) return true;
    var base = norm.split("-")[0];
    return !!IGNORE[base];
  }

  function isPreferred(norm) {
    if (!norm) return false;
    if (PREFERRED[norm]) return true;
    var base = norm.split("-")[0];
    return !!PREFERRED[base];
  }

  function badgeText(norm) {
    if (TO_BADGE[norm]) return TO_BADGE[norm];
    var base = norm.split("-")[0];
    if (TO_BADGE[base]) return TO_BADGE[base];
    if (base.length <= 3) return base.toUpperCase();
    return base.slice(0, 3).toUpperCase();
  }

  /** First defined audio language: prefer IsDefault, else stream order. */
  function pickForeignBadge(streams) {
    var audio = [];
    for (var i = 0; i < (streams || []).length; i++) {
      if ((streams[i].Type || "") === "Audio") audio.push(streams[i]);
    }
    if (!audio.length) return null;

    audio.sort(function (a, b) {
      var ad = a.IsDefault ? 0 : 1;
      var bd = b.IsDefault ? 0 : 1;
      return ad - bd;
    });

    for (var j = 0; j < audio.length; j++) {
      var norm = normalizeLang(audio[j].Language);
      if (isIgnored(norm)) continue;
      if (isPreferred(norm)) return null;
      return badgeText(norm);
    }
    return null;
  }

  function buildBadge(code) {
    var div = document.createElement("div");
    div.className = "jf-foreign-lang-badge";
    div.setAttribute("aria-label", "Audio: " + code);
    div.setAttribute("title", "Primary audio: " + code);
    div.textContent = code;
    return div;
  }

  function applyBadge(card, code) {
    var imgContainer = card.querySelector(".cardImageContainer") || card;
    var old = imgContainer.querySelector(".jf-foreign-lang-badge");
    if (old) old.parentNode.removeChild(old);
    if (!code) return;
    imgContainer.appendChild(buildBadge(code));
  }

  function cardItemId(card) {
    if (card.dataset.id) return card.dataset.id;
    var link = card.querySelector("a[href]");
    if (!link) return null;
    var href = link.getAttribute("href") || "";
    var m = href.match(/[?&]id=([a-f0-9]{32})/i);
    return m ? m[1] : null;
  }

  function cardType(card) {
    return (card.dataset.type || "").toLowerCase();
  }

  function eligibleType(type) {
    return type === "movie" || type === "episode" || type === "video";
  }

  async function flushBatch(ids) {
    if (!ids.length || !userId) return;
    var unique = [];
    var seen = {};
    for (var i = 0; i < ids.length; i++) {
      if (seen[ids[i]] || cache.has(ids[i])) continue;
      seen[ids[i]] = 1;
      unique.push(ids[i]);
    }
    for (var start = 0; start < unique.length; start += BATCH) {
      var slice = unique.slice(start, start + BATCH);
      try {
        var data = await apiFetch(
          "/Users/" +
            userId +
            "/Items?Ids=" +
            slice.join(",") +
            "&Fields=MediaStreams,Type&Limit=" +
            slice.length,
        );
        var byId = {};
        var items = data.Items || data || [];
        for (var k = 0; k < items.length; k++) {
          byId[items[k].Id] = items[k];
        }
        for (var s = 0; s < slice.length; s++) {
          var id = slice[s];
          var item = byId[id];
          var code = null;
          if (item && eligibleType((item.Type || "").toLowerCase())) {
            code = pickForeignBadge(item.MediaStreams);
          }
          cache.set(id, code);
        }
      } catch (e) {
        for (var f = 0; f < slice.length; f++) {
          cache.set(slice[f], null);
        }
      }
    }
  }

  async function decorateCard(card) {
    if (card.dataset.jfForeignLangDone) return;
    var type = cardType(card);
    var id = cardItemId(card);
    if (!id) return;

    // Known non-media card types: skip without API.
    if (type && !eligibleType(type) && type !== "") {
      if (
        type === "series" ||
        type === "season" ||
        type === "boxset" ||
        type === "folder" ||
        type === "collectionfolder" ||
        type === "person" ||
        type === "musicalbum" ||
        type === "musicartist"
      ) {
        card.dataset.jfForeignLangDone = "1";
        return;
      }
    }

    if (!cache.has(id)) {
      pendingIds.add(id);
      scheduleFlush();
      return;
    }

    applyBadge(card, cache.get(id));
    card.dataset.jfForeignLangDone = "1";
  }

  function scheduleFlush() {
    clearTimeout(flushTimer);
    flushTimer = setTimeout(async function () {
      var ids = Array.from(pendingIds);
      pendingIds.clear();
      await flushBatch(ids);
      document
        .querySelectorAll(".card:not([data-jf-foreign-lang-done])")
        .forEach(function (card) {
          decorateCard(card);
        });
    }, 250);
  }

  function scanCards() {
    document
      .querySelectorAll(".card:not([data-jf-foreign-lang-done])")
      .forEach(function (card) {
        decorateCard(card);
      });
  }

  var scanTimer = null;
  var observer = new MutationObserver(function () {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scanCards, 300);
  });

  function main() {
    var creds = getCredentials();
    userId = creds.userId;
    accessToken = creds.accessToken;
    if (!userId || !getAuthToken()) {
      setTimeout(main, 1500);
      return;
    }
    observer.observe(document.body, { childList: true, subtree: true });
    scanCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    setTimeout(main, 800);
  }
})();
