# Collection picker speed

Speeds up the Add to Collection dropdown on jellyfin-web (Jellyfin 10.11).

## Problem

The dialog loads all BoxSets with:

```js
ApiClient.getItems(userId, {
  Recursive: true,
  IncludeItemTypes: "BoxSet",
  SortBy: "SortName",
  EnableTotalRecordCount: false
})
```

It does not set `EnableUserData=false`. On 10.11, UserData for every collection is expensive ([jellyfin#15090](https://github.com/jellyfin/jellyfin/issues/15090)). More collections means a longer spinner (often several seconds).

## Fix

Patches `getItems` / `getUrl` / `getJSON` / `ajax` (and `fetch` / XHR) so BoxSet list queries get `EnableUserData=false`. The dropdown only needs names and ids.

Install as a **public** injector script. Private scripts load after login via `private.js`, which is too late for this modal.

Console check: `window.__JF_COLLECTION_PICKER_SPEED__ === 1`

Network check: the BoxSet request includes `EnableUserData=false`.

## Install

1. JavaScript Injector → new entry.
2. Paste `collection-picker-speed.js`, enable, **Requires authentication = off**.
3. Restart Jellyfin / hard refresh (Ctrl+Shift+R).

## Notes

- Does not change collection *contents* pages (those still need UserData when browsing a collection).
- Safe if upstream later ships the same flag (we only set it when missing).
