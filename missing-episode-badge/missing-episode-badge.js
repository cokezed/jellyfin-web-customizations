/**
 * Missing episode badge (JavaScript Injector).
 * Stock baseline: https://www.reddit.com/r/JellyfinCommunity/comments/1t1zxb5/
 *
 * Install: see missing-episode-badge/README.md (JavaScript Injector + Custom CSS).
 *
 * Version history (changes after the Reddit script):
 * v1 - Series library cards only; virtual aired episodes; custom badge on .cardImageContainer.
 * v2 - Season row on show detail (Season cards); API seasonId= (not SeasonIds); badges in .cardIndicators stacked under unwatched; native countIndicator + playlist_remove icon + count; session token only (API_TOKEN unused on web).
 * v3 - IGNORE_SPECIALS: exclude S00 / ParentIndexNumber 0 from series totals.
 * v4 - Count index gaps within a season (e.g. have E01-E02 and E04-E06, no E03), not only virtual rows; per-season grouping on series-wide fetch; data-jf-missing-done only after a finished check.
 * v5 - Mark non-series/season cards done immediately (Collections/Movies grids) so MutationObserver does not keep rescanning them.
 *
 * Uses session AccessToken from localStorage. Leave API_TOKEN empty unless you know you need it.
 */
(function () {
  "use strict";

  const API_BASE = window.location.origin;
  /** Fallback only if session token unavailable (leave empty on normal web). */
  const API_TOKEN = "";
  /** Material Icons ligature (gap in episode list) */
  const MISSING_ICON = "playlist_remove";
  /** Skip Season 0 / ParentIndexNumber 0 (Specials) in missing counts */
  const IGNORE_SPECIALS = true;
  const cache = new Map();
  const pending = new Set();
  let userId = "";
  let accessToken = "";

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
    const r = await fetch(`${API_BASE}${path}`, {
      headers: { "X-Emby-Token": token },
    });
    if (!r.ok) throw new Error(`${r.status} ${path}`);
    return r.json();
  }

  function isSpecialEpisode(ep) {
    if (!IGNORE_SPECIALS) return false;
    if (ep.ParentIndexNumber === 0) return true;
    if (ep.SeasonIndexNumber === 0) return true;
    return false;
  }

  function isVirtualEpisode(ep) {
    return ep.LocationType === "Virtual" || ep.IsVirtualItem === true;
  }

  /** Missing = aired virtual placeholders OR empty slots in 1..max episode index (e.g. have 1,2,4 but not 3). */
  function countMissingInSeasonEpisodes(items, now) {
    var byIndex = Object.create(null);
    var maxIdx = 0;
    for (var j = 0; j < items.length; j++) {
      var ep = items[j];
      var n = ep.IndexNumber;
      if (n == null) continue;
      if (n > maxIdx) maxIdx = n;
      byIndex[n] = ep;
    }
    var missing = 0;
    for (var i = 1; i <= maxIdx; i++) {
      var slot = byIndex[i];
      if (!slot) {
        missing++;
        continue;
      }
      if (!isVirtualEpisode(slot)) continue;
      var premiere = slot.PremiereDate
        ? new Date(slot.PremiereDate).getTime()
        : null;
      if (!premiere || premiere <= now) missing++;
    }
    return missing;
  }

  function countMissingAired(items) {
    const now = Date.now();
    var bySeason = Object.create(null);
    for (const ep of items || []) {
      if (isSpecialEpisode(ep)) continue;
      var sn = ep.ParentIndexNumber;
      if (sn == null || sn === 0) continue;
      if (!bySeason[sn]) bySeason[sn] = [];
      bySeason[sn].push(ep);
    }
    var missing = 0;
    for (var key in bySeason) {
      if (!Object.prototype.hasOwnProperty.call(bySeason, key)) continue;
      missing += countMissingInSeasonEpisodes(bySeason[key], now);
    }
    return missing;
  }

  async function fetchSeriesMissing(seriesId) {
    const cacheKey = "series:" + seriesId;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    if (pending.has(cacheKey)) return null;
    pending.add(cacheKey);

    try {
      const data = await apiFetch(
        `/Shows/${seriesId}/Episodes?userId=${userId}&Fields=IsVirtualItem,PremiereDate,LocationType,ParentIndexNumber,SeasonIndexNumber,IndexNumber&Limit=500`,
      );
      const result = { missing: countMissingAired(data.Items) };
      cache.set(cacheKey, result);
      return result;
    } catch (e) {
      return null;
    } finally {
      pending.delete(cacheKey);
    }
  }

  async function fetchSeasonMissing(seasonId) {
    const cacheKey = "season:" + seasonId;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    if (pending.has(cacheKey)) return null;
    pending.add(cacheKey);

    try {
      const season = await apiFetch(
        `/Items/${seasonId}?userId=${userId}&Fields=Type,SeriesId,IndexNumber`,
      );
      if ((season.Type || "").toLowerCase() !== "season") {
        return { missing: 0 };
      }
      if (IGNORE_SPECIALS && season.IndexNumber === 0) {
        return { missing: 0 };
      }

      var data = null;
      if (season.SeriesId) {
        data = await apiFetch(
          `/Shows/${season.SeriesId}/Episodes?userId=${userId}&seasonId=${seasonId}&Fields=IsVirtualItem,PremiereDate,LocationType,ParentIndexNumber,SeasonIndexNumber,IndexNumber&Limit=500`,
        );
      } else {
        data = await apiFetch(
          `/Items/${seasonId}/Children?userId=${userId}&Fields=IsVirtualItem,PremiereDate,LocationType,ParentIndexNumber,SeasonIndexNumber,IndexNumber&Limit=500`,
        );
      }

      const result = {
        missing: countMissingInSeasonEpisodes(data.Items || [], Date.now()),
      };
      cache.set(cacheKey, result);
      return result;
    } catch (e) {
      return null;
    } finally {
      pending.delete(cacheKey);
    }
  }

  function normalizeType(type) {
    return (type || "").toLowerCase();
  }

  function formatCount(n) {
    return n >= 100 ? "99+" : String(n);
  }

  function buildBadge(counts) {
    const div = document.createElement("div");
    div.className = "indicator countIndicator jf-missing-ep-badge";
    var label =
      counts.missing === 1
        ? "1 missing episode"
        : counts.missing + " missing episodes";
    div.setAttribute("aria-label", label);
    div.setAttribute("title", label);

    const icon = document.createElement("span");
    icon.className = "material-icons jf-missing-ep-badge-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = MISSING_ICON;

    const num = document.createElement("span");
    num.className = "jf-missing-ep-badge-count";
    num.textContent = formatCount(counts.missing);

    div.appendChild(icon);
    div.appendChild(num);
    return div;
  }

  async function decorateCard(card) {
    if (card.dataset.jfMissingDone) return;

    var itemId = null;
    var itemType = null;

    if (card.dataset.id && card.dataset.type) {
      itemId = card.dataset.id;
      itemType = card.dataset.type;
    } else {
      var link = card.querySelector("a[href]");
      if (link) {
        var href = link.getAttribute("href") || "";
        var mId = href.match(/[?&]id=([a-f0-9]{32})/i);
        if (mId) itemId = mId[1];
      }
      if (itemId) {
        try {
          var info = await apiFetch(
            "/Items/" + itemId + "?userId=" + userId + "&Fields=Type",
          );
          itemType = info.Type;
        } catch (e) {
          return;
        }
      }
    }

    var typeKey = normalizeType(itemType);
    if (!itemId || (typeKey !== "series" && typeKey !== "season")) {
      // Mark done so we do not rescan every BoxSet/Movie card on Collections etc.
      if (itemId || typeKey) card.dataset.jfMissingDone = "1";
      return;
    }

    var counts =
      typeKey === "season"
        ? await fetchSeasonMissing(itemId)
        : await fetchSeriesMissing(itemId);
    if (!counts) return;
    if (counts.missing === 0) {
      card.dataset.jfMissingDone = "1";
      return;
    }

    var imgContainer = card.querySelector(".cardImageContainer") || card;
    if (!imgContainer) return;

    var old = imgContainer.querySelector(".jf-missing-ep-badge");
    if (old) old.parentNode.removeChild(old);

    var indicators = imgContainer.querySelector(".cardIndicators");
    if (!indicators) {
      indicators = document.createElement("div");
      indicators.className = "cardIndicators";
      imgContainer.appendChild(indicators);
    }

    indicators.appendChild(buildBadge(counts));
    card.dataset.jfMissingDone = "1";
  }

  function scanCards() {
    document
      .querySelectorAll(".card:not([data-jf-missing-done])")
      .forEach(function (card) {
        decorateCard(card);
      });
  }

  let scanTimer = null;
  const observer = new MutationObserver(() => {
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
