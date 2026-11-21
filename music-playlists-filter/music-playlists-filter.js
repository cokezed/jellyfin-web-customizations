/**
 * Hide video playlists on the Music library Playlists view.
 *
 * jellyfin-web music playlists tab (chunk ~67056) calls:
 *   ApiClient.getItems(userId, {
 *     SortBy, SortOrder, IncludeItemTypes: "Playlist", Recursive: true,
 *     Fields: "PrimaryImageAspectRatio,SortName,CanDelete", ...
 *   })
 * with no ParentId — so Video watch-order playlists appear next to music.
 * We drop Type=Playlist + MediaType=Video before cards render.
 *
 * Must wrap the ApiClient *instance* (not only the prototype): other injectors
 * (for example collection-picker-speed) assign own getItems on the instance and
 * shadow a prototype-only patch.
 *
 * Console check: window.__JF_MUSIC_PLAYLISTS_FILTER__ === 1
 */
(function () {
  "use strict";

  if (window.__JF_MUSIC_PLAYLISTS_FILTER__ === 1) return;
  window.__JF_MUSIC_PLAYLISTS_FILTER__ = 1;

  function onMusicLibraryView() {
    var hash = String(window.location.hash || "");
    if (hash.indexOf("collectionType=music") !== -1) return true;
    if (/^#\/music(\?|$)/i.test(hash)) return true;
    if (hash.indexOf("musicplaylists") !== -1) return true;
    return false;
  }

  function isPlaylistQueryUrl(url) {
    if (typeof url !== "string") return false;
    return (
      /IncludeItemTypes=Playlist/i.test(url) ||
      /includeItemTypes=Playlist/i.test(url)
    );
  }

  function isPlaylistQueryOptions(options) {
    if (!options || typeof options !== "object") return false;
    var types = options.IncludeItemTypes || options.includeItemTypes;
    if (types == null || types === "") return false;
    return (
      String(types)
        .split(",")
        .map(function (t) {
          return t.trim().toLowerCase();
        })
        .indexOf("playlist") !== -1
    );
  }

  function copyObj(options) {
    var next = {};
    for (var k in options) {
      if (Object.prototype.hasOwnProperty.call(options, k)) next[k] = options[k];
    }
    return next;
  }

  function ensureMediaTypeFieldOptions(options) {
    var next = copyObj(options);
    var key = next.Fields != null ? "Fields" : next.fields != null ? "fields" : "Fields";
    var fields = String(next[key] || "");
    if (!/(^|,)\s*MediaType\s*(,|$)/i.test(fields)) {
      next[key] = fields ? fields + ",MediaType" : "MediaType";
    }
    return next;
  }

  function ensureMediaTypeFieldUrl(url) {
    if (/[?&]Fields=/i.test(url)) {
      return url.replace(/([?&]Fields=)([^&]*)/i, function (m, prefix, value) {
        var decoded = decodeURIComponent(value);
        if (/(^|,)\s*MediaType\s*(,|$)/i.test(decoded)) return m;
        return prefix + encodeURIComponent(decoded + ",MediaType");
      });
    }
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "Fields=MediaType";
  }

  function filterVideoPlaylists(data) {
    if (!data) return data;
    var items = data.Items || data.items;
    if (!items || !items.filter) return data;
    var kept = items.filter(function (item) {
      if (!item) return false;
      var type = item.Type || item.type;
      var media = item.MediaType || item.mediaType;
      if (type === "Playlist" && String(media).toLowerCase() === "video") {
        return false;
      }
      return true;
    });
    if (kept.length === items.length) return data;
    var next = copyObj(data);
    if (data.Items) next.Items = kept;
    if (data.items) next.items = kept;
    if (typeof data.TotalRecordCount === "number") {
      next.TotalRecordCount = Math.max(
        0,
        data.TotalRecordCount - (items.length - kept.length)
      );
    }
    if (typeof data.totalRecordCount === "number") {
      next.totalRecordCount = Math.max(
        0,
        data.totalRecordCount - (items.length - kept.length)
      );
    }
    return next;
  }

  function wrapMethod(target, name, makeWrapper) {
    if (!target || typeof target[name] !== "function") return false;
    if (target[name].__jfMusicPlFilter) return false;
    var wrapped = makeWrapper(target[name]);
    wrapped.__jfMusicPlFilter = true;
    target[name] = wrapped;
    return true;
  }

  function wrap(target) {
    if (!target) return false;
    var changed = false;

    changed =
      wrapMethod(target, "getJSON", function (origJson) {
        return function (url) {
          var args = Array.prototype.slice.call(arguments);
          if (onMusicLibraryView() && isPlaylistQueryUrl(url)) {
            args[0] = ensureMediaTypeFieldUrl(url);
            return Promise.resolve(origJson.apply(this, args)).then(
              filterVideoPlaylists
            );
          }
          return origJson.apply(this, arguments);
        };
      }) || changed;

    changed =
      wrapMethod(target, "getItems", function (origItems) {
        return function (userId, options) {
          if (onMusicLibraryView() && isPlaylistQueryOptions(options)) {
            var nextOpts = ensureMediaTypeFieldOptions(options);
            return Promise.resolve(origItems.call(this, userId, nextOpts)).then(
              filterVideoPlaylists
            );
          }
          return origItems.apply(this, arguments);
        };
      }) || changed;

    return changed;
  }

  function tryWrap() {
    var api = window.ApiClient;
    if (!api) return false;
    // Instance first: other injectors own-patch getItems and shadow the prototype.
    var a = wrap(api);
    var b = wrap(Object.getPrototypeOf(api));
    return a || b;
  }

  function needsWrap() {
    var api = window.ApiClient;
    if (!api || typeof api.getItems !== "function") return true;
    return !api.getItems.__jfMusicPlFilter;
  }

  tryWrap();
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (needsWrap()) tryWrap();
    if (tries > 400) clearInterval(timer);
  }, 50);
})();
