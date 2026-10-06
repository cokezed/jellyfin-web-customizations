# Dashboard theme

Themes the Jellyfin **admin Dashboard** (`#/dashboard`) to match [Abyss](../abyss/) accents.

## Problem

On Jellyfin 10.11+, Branding Custom CSS is intentionally **not** loaded on the admin Dashboard (recovery surface). Stock UI stays Jellyfin blue (`#00a4dc`) even when the rest of the web client uses Abyss.

## Fix

A JavaScript Injector script watches for `body.dashboardDocument` and injects CSS that:

- Maps MUI `--jf-palette-primary-*` to `--abyss-accent`
- Tints AppBar, drawer, selected nav, buttons, switches, tabs, inputs
- Restyles user avatar, toolbar icons, activity-feed alert bells, and server/web version text
- Replaces cyan Active Devices session cards (`defaultCardBackground*`) with glass tinted to the palette

Console check after hard refresh: `window.__JF_DASHBOARD_THEME__ === 1`

## Files

| File | Use |
| --- | --- |
| `dashboard-theme.js` | Ready-to-paste Injector script (**rose** default) |
| `dashboard-chrome.css` | Dashboard chrome only (uses `--abyss-*` vars) |
| `themes/*.css` | Palette only — same ids / RGB as [abyss/themes/](../abyss/themes/) |
| `themes/*.js` | Ready-to-paste Injector script per palette |
| `themes/all-themes.json` | Theme catalog (same as Abyss) |

Order if you rebuild a paste file yourself: a `themes/<id>.css` palette, then `dashboard-chrome.css`.

## Themes

Same families as [abyss/](../abyss/). Paste the matching `themes/<id>.js` (or keep using root `dashboard-theme.js` for rose).

| File | Label | Group | Accent |
| --- | --- | --- | --- |
| [`themes/stock.js`](themes/stock.js) | Abyss stock | Reference | `rgb(245, 245, 247)` |
| [`themes/rose.js`](themes/rose.js) | Rose orchid (default) | Pink & purple | `rgb(215, 100, 190)` |
| [`themes/lavender.js`](themes/lavender.js) | Lilac | Pink & purple | `rgb(200, 170, 225)` |
| [`themes/midnight.js`](themes/midnight.js) | Royal purple | Pink & purple | `rgb(142, 96, 214)` |
| [`themes/ocean.js`](themes/ocean.js) | Ocean blue | Blue & ice | `rgb(100, 165, 210)` |
| [`themes/frost.js`](themes/frost.js) | Frost | Blue & ice | `rgb(165, 195, 220)` |
| [`themes/sage.js`](themes/sage.js) | Sage green | Green | `rgb(130, 195, 150)` |
| [`themes/jade.js`](themes/jade.js) | Jade | Green | `rgb(95, 170, 150)` |
| [`themes/moss.js`](themes/moss.js) | Moss | Green | `rgb(135, 188, 118)` |
| [`themes/gold.js`](themes/gold.js) | Soft gold | Gold & warm | `rgb(220, 190, 130)` |
| [`themes/honey.js`](themes/honey.js) | Honey | Gold & warm | `rgb(215, 175, 110)` |
| [`themes/copper.js`](themes/copper.js) | Copper | Gold & warm | `rgb(210, 150, 110)` |

Glass tint and secondary live in each `themes/<id>.css` (and in `themes/all-themes.json`).

## Needs

- Jellyfin 10.11+ web
- [JavaScript Injector](https://github.com/IAmParadox27/jellyfin-plugin-javascript-injector)
- Dark display theme (same as Abyss)

Optional: pair with [abyss/](../abyss/) Custom CSS on the main client so home/libraries and Dashboard share one palette.

## Install

1. Dashboard → Plugins → JavaScript Injector → new script.
2. Paste `dashboard-theme.js` (rose) **or** `themes/<id>.js` for another color.
3. Enable, set **Requires authentication = off**, save.
4. Restart Jellyfin / hard refresh (Ctrl+Shift+R).

Only one Dashboard Theme script should be enabled at a time. To switch colors, paste a different `themes/<id>.js` over the entry (or disable the old one and add a new entry).

## Notes

- Styles apply only while `body.dashboardDocument` is present (admin Dashboard routes).
- Activity entries that stock marks as warn/error stay red (`#cc0000`).
- Does not re-enable Branding Custom CSS on the Dashboard; it only injects this sheet via the Injector.
- Keep `themes/*.css` in sync with [abyss/themes/](../abyss/themes/) when palettes change.
