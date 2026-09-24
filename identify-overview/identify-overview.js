/**
 * Identify overview - JavaScript Injector snippet.
 *
 * 1) Search results: Overview under each match card.
 * 2) Confirm screen (after pick): full Overview + IMDb link (and TMDB if present).
 *
 * CSS: identify-overview.css → branding CustomCss.
 */
(function () {
  "use strict";

  var lastResults = null;
  var lastSelected = null;
  var decorateTimer = null;
  var confirmTimer = null;

  function isRemoteSearchUrl(url) {
    if (!url) return false;
    var s = String(url);
    if (s.indexOf("Items/RemoteSearch/Apply") !== -1) return false;
    return s.indexOf("Items/RemoteSearch/") !== -1;
  }

  function storeResults(data) {
    if (!data) return;
    if (Array.isArray(data)) {
      lastResults = data;
      scheduleDecorate();
      return;
    }
    if (Array.isArray(data.SearchResults)) {
      lastResults = data.SearchResults;
      scheduleDecorate();
    }
  }

  function truncate(text, max) {
    var t = String(text || "").replace(/\s+/g, " ").trim();
    if (t.length <= max) return t;
    return t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
  }

  function providerId(result, key) {
    if (!result) return "";
    var ids = result.ProviderIds || result.providerIds || {};
    var want = String(key).toLowerCase();
    var keys = Object.keys(ids);
    for (var i = 0; i < keys.length; i++) {
      if (String(keys[i]).toLowerCase() === want && ids[keys[i]]) {
        return String(ids[keys[i]]).trim();
      }
    }
    return "";
  }

  function imdbUrl(result) {
    var id = providerId(result, "Imdb") || providerId(result, "IMDB");
    if (!id) return "";
    if (id.indexOf("tt") !== 0) id = "tt" + id;
    return "https://www.imdb.com/title/" + id + "/";
  }

  function tmdbUrl(result) {
    var id = providerId(result, "Tmdb") || providerId(result, "TmdbId");
    if (!id) return "";
    // Movies use /movie/; series Identify also uses this dialog - /tv/ if Type known is hard here.
    // Prefer movie URL; TMDB redirects poorly for wrong type, so only link when SearchProvider suggests.
    var provider = String(
      result.SearchProviderName || result.searchProviderName || "",
    ).toLowerCase();
    if (provider.indexOf("series") !== -1 || provider.indexOf("tv") !== -1) {
      return "https://www.themoviedb.org/tv/" + id;
    }
    return "https://www.themoviedb.org/movie/" + id;
  }

  function decorateCards() {
    var list = document.querySelector(
      ".identifyDialog .identificationSearchResultList, .identificationSearchResultList",
    );
    if (!list || !lastResults || !lastResults.length) return;

    var cards = list.querySelectorAll("button.card[data-index], .card[data-index]");
    for (var i = 0; i < cards.length; i++) {
      var btn = cards[i];
      if (btn.dataset.jfOverviewDone) continue;
      btn.dataset.jfOverviewDone = "1";

      var idx = parseInt(btn.getAttribute("data-index"), 10);
      if (isNaN(idx) || idx < 0 || idx >= lastResults.length) continue;

      var overview = lastResults[idx].Overview || lastResults[idx].overview;
      if (!overview || !String(overview).trim()) continue;

      var box = btn.querySelector(".cardBox") || btn;
      var old = box.querySelector(".jf-identify-overview");
      if (old) old.parentNode.removeChild(old);

      var div = document.createElement("div");
      div.className = "jf-identify-overview";
      div.setAttribute("title", String(overview).trim());
      div.textContent = truncate(overview, 280);
      box.appendChild(div);
    }
  }

  function resultKey(result) {
    return [
      result.Name || result.name || "",
      providerId(result, "Imdb") || providerId(result, "IMDB"),
      providerId(result, "Tmdb") || providerId(result, "TmdbId"),
      (result.Overview || result.overview || "").length,
    ].join("|");
  }

  /** Dialog / form handlers swallow <a> navigation; open explicitly. */
  function bindExternalLink(anchor, url) {
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.setAttribute("role", "link");
    function open(ev) {
      if (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
      }
      window.open(url, "_blank", "noopener,noreferrer");
    }
    // Capture phase so dialog/form listeners never win
    anchor.addEventListener("click", open, true);
    anchor.addEventListener("auxclick", open, true);
    anchor.addEventListener(
      "mousedown",
      function (ev) {
        if (ev.button === 1) open(ev);
      },
      true,
    );
  }

  function enrichConfirm() {
    var form = document.querySelector(".identifyDialog .identifyOptionsForm");
    if (!form || form.classList.contains("hide")) return;

    var host = form.querySelector(".selectedSearchResult");
    if (!host) return;

    // Prefer click-captured selection; fall back to matching displayed name.
    var result = lastSelected;
    if (!result && lastResults && lastResults.length) {
      var nameEl = host.querySelector("div") || host;
      var text = (nameEl.textContent || "").split("\n")[0].trim();
      for (var i = 0; i < lastResults.length; i++) {
        if (lastResults[i].Name === text || lastResults[i].name === text) {
          result = lastResults[i];
          break;
        }
      }
    }
    if (!result) return;

    var key = resultKey(result);
    // Idempotent: MutationObserver used to tear down/rebuild and kill clicks
    var existing =
      form.querySelector(".jf-identify-confirm-extra") ||
      host.querySelector(".jf-identify-confirm-extra");
    if (existing && existing.getAttribute("data-jf-key") === key) return;
    if (existing) existing.parentNode.removeChild(existing);

    var panel = document.createElement("div");
    panel.className = "jf-identify-confirm-extra";
    panel.setAttribute("data-jf-key", key);

    var overview = result.Overview || result.overview;
    if (overview && String(overview).trim()) {
      var sum = document.createElement("p");
      sum.className = "jf-identify-confirm-overview";
      sum.textContent = String(overview).trim();
      panel.appendChild(sum);
    }

    var links = document.createElement("div");
    links.className = "jf-identify-confirm-links";

    var imdb = imdbUrl(result);
    if (imdb) {
      var a = document.createElement("a");
      a.className = "jf-identify-confirm-link";
      a.textContent = "Open on IMDb";
      bindExternalLink(a, imdb);
      links.appendChild(a);
    }

    var tmdb = tmdbUrl(result);
    if (tmdb) {
      var a2 = document.createElement("a");
      a2.className = "jf-identify-confirm-link";
      a2.textContent = "Open on TMDB";
      bindExternalLink(a2, tmdb);
      links.appendChild(a2);
    }

    if (links.childNodes.length) panel.appendChild(links);
    if (!panel.childNodes.length) return;

    // Sibling after poster block (not nested in innerHTML that JF may rewrite)
    if (host.parentNode) {
      host.parentNode.insertBefore(panel, host.nextSibling);
    } else {
      host.appendChild(panel);
    }
  }

  function scheduleDecorate() {
    clearTimeout(decorateTimer);
    decorateTimer = setTimeout(decorateCards, 80);
  }

  function scheduleConfirm() {
    clearTimeout(confirmTimer);
    confirmTimer = setTimeout(enrichConfirm, 60);
  }

  // Capture which result was clicked before stock handler swaps panels
  document.addEventListener(
    "click",
    function (ev) {
      var card = ev.target && ev.target.closest
        ? ev.target.closest(
            ".identificationSearchResultList button.card[data-index], .identificationSearchResultList .card[data-index]",
          )
        : null;
      if (!card || !lastResults) return;
      var idx = parseInt(card.getAttribute("data-index"), 10);
      if (isNaN(idx) || idx < 0 || idx >= lastResults.length) return;
      lastSelected = lastResults[idx];
      scheduleConfirm();
    },
    true,
  );

  // ApiClient.ajax is typically XHR
  var origOpen = XMLHttpRequest.prototype.open;
  var origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__jfRemoteSearch = isRemoteSearchUrl(url);
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    if (this.__jfRemoteSearch) {
      this.addEventListener("load", function () {
        if (this.status >= 200 && this.status < 300) {
          try {
            storeResults(JSON.parse(this.responseText));
          } catch (e) {}
        }
      });
    }
    return origSend.apply(this, arguments);
  };

  if (window.fetch) {
    var origFetch = window.fetch;
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : input && input.url;
      var watch = isRemoteSearchUrl(url);
      return origFetch.apply(this, arguments).then(function (res) {
        if (!watch || !res.ok) return res;
        res
          .clone()
          .json()
          .then(storeResults)
          .catch(function () {});
        return res;
      });
    };
  }

  var observer = new MutationObserver(function () {
    if (
      document.querySelector(
        ".identificationSearchResults:not(.hide) .identificationSearchResultList .card",
      )
    ) {
      scheduleDecorate();
    }
    if (
      document.querySelector(
        ".identifyDialog .identifyOptionsForm:not(.hide) .selectedSearchResult",
      )
    ) {
      scheduleConfirm();
    }
  });

  function main() {
    if (!document.body) {
      setTimeout(main, 500);
      return;
    }
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    setTimeout(main, 400);
  }
})();
