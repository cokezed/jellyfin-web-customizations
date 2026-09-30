# Collections row

Shows which collections a movie or show belongs to, above More like this.

## Problem

A collection page lists its titles. A movie page does not list the collections that title is in. Jellyfin has no single API for that lookup.

## Fix

On item detail pages, this script indexes boxsets and their children, caches the map in `sessionStorage` for the browser tab, and inserts a Collections row above More like this.

Install as a **private** injector script so it runs after sign-in.

Console check after hard refresh: `window.__JF_COLLECTION_ROW__ === 1`

## Install

1. JavaScript Injector → new entry named Collections Row.
2. Paste `collections-row.js`, enable, **Requires authentication = on**.
3. Restart Jellyfin / hard refresh (Ctrl+Shift+R).

## Notes

- The first detail page after sign-in builds the index. A library with many collections can take a few seconds. Later pages in the same tab use the cache.
- Posters open the collection the same way as other cards.
- Titles that are not in any collection get no row.
