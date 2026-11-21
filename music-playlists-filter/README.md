# Music playlists filter

Hide **video** playlists from the Music library Playlists tab.

## Problem

Music → Playlists loads all user playlists recursively:

```js
ApiClient.getItems(userId, {
  SortBy: "SortName",
  SortOrder: "Ascending",
  IncludeItemTypes: "Playlist",
  Recursive: true,
  Fields: "PrimaryImageAspectRatio,SortName,CanDelete",
  StartIndex: 0
})
```

There is no music-library parent filter, so `MediaType=Video` playlists (for example a TV or movie watch-order list) appear next to music playlists.

## Fix

JavaScript Injector snippet that wraps `ApiClient.getItems` / `getJSON` while you are on a Music library view (`#/music` or `collectionType=music`). It drops `Type=Playlist` + `MediaType=Video` before cards render.

Video playlists still show on Home and the general Playlists library.

Wraps the ApiClient **instance** (not only the prototype). Other injectors (for example [collection-picker-speed](../collection-picker-speed/)) assign their own `getItems` on the instance and would shadow a prototype-only patch.

Console check after hard refresh: `window.__JF_MUSIC_PLAYLISTS_FILTER__ === 1`

## Install

1. JavaScript Injector → new entry.
2. Paste `music-playlists-filter.js`, enable, **Requires authentication = on**.
3. Restart Jellyfin / hard refresh (Ctrl+Shift+R).

## Notes

- Does not delete playlists or change the server library.
- Ensures `MediaType` is requested on playlist queries when missing from `Fields`.
- Re-checks briefly after load in case another injector patches `ApiClient` later.
