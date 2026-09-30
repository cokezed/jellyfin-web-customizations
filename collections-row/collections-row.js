/**
 * Collections row on item detail pages.
 *
 * jellyfin-web lists the titles inside a collection, and has no row for the
 * collections a movie or show belongs to. This adds that row above More like this.
 *
 * Install as a private JavaScript Injector script (Requires authentication = on).
 * Console check: window.__JF_COLLECTION_ROW__ === 1
 */
(function () {
  "use strict";

  if (window.__JF_COLLECTION_ROW__ === 1) return;
  window.__JF_COLLECTION_ROW__ = 1;

  var cacheKey = "jf-collection-row-v1";
  var indexPromise = null;

  function client() {
    return window.ApiClient || null;
  }

  function userId(api) {
    return api.getCurrentUserId && api.getCurrentUserId();
  }

  function itemIdFromLocation() {
    var hash = window.location.hash || "";
    var query = hash.indexOf("?") >= 0 ? hash.slice(hash.indexOf("?") + 1) : "";
    return new URLSearchParams(query).get("id");
  }

  function mapLimit(items, limit, worker) {
    var results = new Array(items.length);
    var next = 0;
    function run() {
      if (next >= items.length) return Promise.resolve();
      var index = next++;
      return worker(items[index]).then(function (value) {
        results[index] = value;
        return run();
      });
    }
    var lanes = [];
    for (var i = 0; i < limit && i < items.length; i++) lanes.push(run());
    return Promise.all(lanes).then(function () { return results; });
  }

  function loadIndex(api, uid) {
    if (indexPromise) return indexPromise;
    var stored = null;
    try { stored = sessionStorage.getItem(cacheKey); } catch (e) { stored = null; }
    if (stored) {
      try {
        indexPromise = Promise.resolve(JSON.parse(stored));
        return indexPromise;
      } catch (e) { /* rebuild */ }
    }
    indexPromise = api.getItems(uid, {
      IncludeItemTypes: "BoxSet",
      Recursive: true,
      SortBy: "SortName",
      SortOrder: "Ascending",
      Fields: "PrimaryImageAspectRatio",
      EnableImageTypes: "Primary",
      ImageTypeLimit: 1,
      Limit: 500
    }).then(function (page) {
      var boxes = (page && page.Items) || [];
      return mapLimit(boxes, 6, function (box) {
        return api.getItems(uid, { ParentId: box.Id, Limit: 400 }).then(function (kids) {
          return { box: box, kids: (kids && kids.Items) || [] };
        });
      });
    }).then(function (groups) {
      var map = {};
      (groups || []).forEach(function (group) {
        if (!group) return;
        group.kids.forEach(function (kid) {
          if (!map[kid.Id]) map[kid.Id] = [];
          map[kid.Id].push({
            Id: group.box.Id,
            Name: group.box.Name,
            Tag: group.box.ImageTags && group.box.ImageTags.Primary
          });
        });
      });
      try { sessionStorage.setItem(cacheKey, JSON.stringify(map)); } catch (e) { /* ignore quota */ }
      return map;
    }).catch(function () {
      indexPromise = null;
      return {};
    });
    return indexPromise;
  }

  function serverId(api) {
    var hash = window.location.hash || "";
    var query = hash.indexOf("?") >= 0 ? hash.slice(hash.indexOf("?") + 1) : "";
    var fromHash = new URLSearchParams(query).get("serverId");
    return fromHash || (api.serverId && api.serverId()) || "";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  }

  function posterUrl(api, box) {
    if (!box.Tag || !api.getUrl) return "";
    return api.getUrl("Items/" + box.Id + "/Images/Primary", { maxWidth: 360, tag: box.Tag, quality: 90 });
  }

  function render(page, boxes) {
    var existing = page.querySelector("#jfCollectionRow");
    if (existing) existing.remove();
    if (!boxes.length) return;
    var api = client();
    var sid = serverId(api);
    var cards = boxes.map(function (box) {
      var href = "#/details?id=" + encodeURIComponent(box.Id) + (sid ? "&serverId=" + encodeURIComponent(sid) : "");
      var image = posterUrl(api, box);
      var style = image ? " style=\"background-image:url('" + image.replace(/'/g, "%27") + "')\"" : "";
      var name = escapeHtml(box.Name);
      return '<div class="card overflowPortraitCard card-hoverable" data-id="' + escapeHtml(box.Id) + '" data-serverid="' + escapeHtml(sid) + '" data-type="BoxSet" data-isfolder="true">' +
        '<div class="cardBox cardBox-bottompadded">' +
        '<div class="cardScalable">' +
        '<div class="cardPadder cardPadder-overflowPortrait"></div>' +
        '<a href="' + href + '" data-action="link" class="cardImageContainer coveredImage cardContent itemAction"' + style + ' aria-label="' + name + '"></a>' +
        '</div>' +
        '<div class="cardText cardTextCentered"><a href="' + href + '" data-action="link" class="itemAction textActionButton">' + name + '</a></div>' +
        '</div></div>';
    }).join("");
    var section = document.createElement("div");
    section.id = "jfCollectionRow";
    section.className = "verticalSection detailVerticalSection jf-in-collections";
    section.innerHTML = '<h2 class="sectionTitle sectionTitle-cards padded-right">Collections</h2>';
    var scroller = document.createElement("div");
    scroller.className = "itemsContainer scrollSlider focuscontainer-x padded-right";
    scroller.innerHTML = cards;
    section.appendChild(scroller);
    section.addEventListener("click", function (event) {
      if (event.defaultPrevented) return;
      var node = event.target.closest && event.target.closest(".itemAction");
      var card = node && node.closest("[data-id]");
      var router = window.Emby && window.Emby.Page;
      if (!card || !router || !router.showItem) return;
      event.preventDefault();
      router.showItem({
        Id: card.getAttribute("data-id"),
        ServerId: card.getAttribute("data-serverid"),
        Type: "BoxSet",
        IsFolder: true
      });
    });
    var anchor = page.querySelector("#similarCollapsible");
    if (anchor) anchor.parentNode.insertBefore(section, anchor);
    else page.appendChild(section);
  }

  function refresh(page) {
    var api = client();
    var uid = api && userId(api);
    var id = itemIdFromLocation();
    if (!page || !api || !uid || !id) return;
    if (page.id !== "itemDetailPage") return;
    loadIndex(api, uid).then(function (map) {
      if (itemIdFromLocation() !== id) return;
      render(page, (map && map[id]) || []);
    }).catch(function () { /* keep the rest of the page usable */ });
  }

  document.addEventListener("viewshow", function (event) {
    var page = event.target;
    if (page && page.id === "itemDetailPage") refresh(page);
  });

  function schedule() {
    var page = document.getElementById("itemDetailPage");
    if (page && !page.classList.contains("hide")) refresh(page);
  }
  window.addEventListener("hashchange", function () {
    window.setTimeout(schedule, 80);
  });
  schedule();
})();
