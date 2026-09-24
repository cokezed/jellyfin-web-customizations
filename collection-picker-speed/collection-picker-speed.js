/**
 * Faster Add-to-Collection dropdown - JavaScript Injector snippet.
 *
 * jellyfin-web collection editor (chunk 3380):
 *   ServerConnections.getApiClient(id).getItems(userId, {
 *     Recursive, IncludeItemTypes: "BoxSet", SortBy: "SortName",
 *     EnableTotalRecordCount: false
 *   })
 * without EnableUserData=false. On Jellyfin 10.11, UserData for every BoxSet is very slow
 * (see jellyfin/jellyfin#15090). Large libraries often drop from multi-second waits to tens of ms with the flag.
 *
 * Loads as a public injector script so fetch/getItems are patched before the modal opens.
 *
 * Console check: window.__JF_COLLECTION_PICKER_SPEED__ === 1
 */
(function () {
  "use strict";

  if (window.__JF_COLLECTION_PICKER_SPEED__ === 1) return;
  window.__JF_COLLECTION_PICKER_SPEED__ = 1;

  function isBoxSetQuery(types) {
    if (types == null || types === "") return false;
    return (
      String(types)
        .split(",")
        .map(function (t) {
          return t.trim().toLowerCase();
        })
        .indexOf("boxset") !== -1
    );
  }

  function withUserDataOff(options) {
    if (!options || typeof options !== "object") return options;
    if (!isBoxSetQuery(options.IncludeItemTypes || options.includeItemTypes)) {
      return options;
    }
    if (
      options.EnableUserData !== undefined ||
      options.enableUserData !== undefined
    ) {
      return options;
    }
    var next = {};
    for (var k in options) {
      if (Object.prototype.hasOwnProperty.call(options, k)) next[k] = options[k];
    }
    next.EnableUserData = false;
    return next;
  }

  function rewriteUrl(url) {
    if (!url) return url;
    var s = String(url);
    // Match query or relative; avoid requiring a leading [?&] (some clients differ).
    if (
      s.indexOf("IncludeItemTypes=BoxSet") === -1 &&
      s.indexOf("includeItemTypes=BoxSet") === -1
    ) {
      return url;
    }
    if (/[?&]EnableUserData=/i.test(s)) return url;
    return s + (s.indexOf("?") >= 0 ? "&" : "?") + "EnableUserData=false";
  }

  function patchApiClient(api) {
    if (!api || api.__jfCollectionPickerFast) return;
    api.__jfCollectionPickerFast = true;

    if (typeof api.getItems === "function") {
      var origGetItems = api.getItems.bind(api);
      api.getItems = function (userId, options) {
        return origGetItems(userId, withUserDataOff(options));
      };
    }

    // getItems -> getUrl -> getJSON; rewrite at getJSON so any caller is covered.
    if (typeof api.getJSON === "function") {
      var origGetJSON = api.getJSON.bind(api);
      api.getJSON = function (url) {
        return origGetJSON(rewriteUrl(url));
      };
    }

    if (typeof api.getUrl === "function") {
      var origGetUrl = api.getUrl.bind(api);
      api.getUrl = function (name, params, serverAddress) {
        return rewriteUrl(
          origGetUrl(name, withUserDataOff(params), serverAddress),
        );
      };
    }

    if (typeof api.ajax === "function") {
      var origAjax = api.ajax.bind(api);
      api.ajax = function (request) {
        if (request && typeof request.url === "string") {
          request = Object.assign({}, request, {
            url: rewriteUrl(request.url),
          });
        }
        return origAjax(request);
      };
    }
  }

  function patchApiClientProto(api) {
    try {
      var proto = Object.getPrototypeOf(api);
      if (!proto || proto === Object.prototype || proto.__jfCollectionPickerFastProto) {
        return;
      }
      proto.__jfCollectionPickerFastProto = true;
      patchApiClient(proto);
    } catch (e) {
      /* ignore */
    }
  }

  function patchGetApiClient(mgr) {
    if (!mgr || mgr.__jfCollectionPickerGetApi) return;
    if (typeof mgr.getApiClient !== "function") return;
    mgr.__jfCollectionPickerGetApi = true;
    var orig = mgr.getApiClient.bind(mgr);
    mgr.getApiClient = function () {
      var client = orig.apply(null, arguments);
      patchApiClient(client);
      patchApiClientProto(client);
      return client;
    };
  }

  function patchFetch() {
    if (window.__jfCollectionPickerFetchPatched) return;
    if (typeof window.fetch !== "function") return;
    var origFetch = window.fetch.bind(window);
    var wrapped = function (input, init) {
      try {
        if (typeof input === "string") {
          input = rewriteUrl(input);
        } else if (input && typeof input.url === "string") {
          var rewritten = rewriteUrl(input.url);
          if (rewritten !== input.url && typeof Request === "function") {
            input = new Request(rewritten, input);
          }
        }
      } catch (e) {
        /* ignore */
      }
      return origFetch(input, init);
    };
    window.fetch = wrapped;
    try {
      if (typeof globalThis !== "undefined") globalThis.fetch = wrapped;
    } catch (e2) {
      /* ignore */
    }
    window.__jfCollectionPickerFetchPatched = true;
  }

  function patchXhr() {
    if (window.__jfCollectionPickerXhrPatched) return;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      try {
        if (typeof url === "string") {
          arguments[1] = rewriteUrl(url);
        }
      } catch (e) {
        /* ignore */
      }
      return open.apply(this, arguments);
    };
    window.__jfCollectionPickerXhrPatched = true;
  }

  function tick() {
    try {
      if (window.ApiClient) {
        patchApiClient(window.ApiClient);
        patchApiClientProto(window.ApiClient);
      }
      var managers = [
        window.ConnectionManager,
        window.ServerConnections,
        window.ApiClient && window.ApiClient._connectionManager,
      ];
      for (var i = 0; i < managers.length; i++) {
        var mgr = managers[i];
        if (!mgr) continue;
        patchGetApiClient(mgr);
        if (typeof mgr.getApiClients === "function") {
          var clients = mgr.getApiClients() || [];
          for (var j = 0; j < clients.length; j++) {
            patchApiClient(clients[j]);
            patchApiClientProto(clients[j]);
          }
        }
        if (typeof mgr.getLocalApiClient === "function") {
          patchApiClient(mgr.getLocalApiClient());
        }
      }
    } catch (e) {
      /* ignore */
    }
  }

  patchFetch();
  patchXhr();
  tick();
  setInterval(tick, 500);
})();
