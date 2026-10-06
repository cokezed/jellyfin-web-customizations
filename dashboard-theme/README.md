# Dashboard theme

Themes the Jellyfin **admin Dashboard** (`#/dashboard`) to match Abyss / Custom CSS accents.

## Problem

On Jellyfin 10.11+, Branding Custom CSS is intentionally **not** loaded on the admin Dashboard (recovery surface). Stock UI stays Jellyfin blue (`#00a4dc`) even when the rest of the web client uses Abyss.

## Fix

A JavaScript Injector script watches for `body.dashboardDocument` and injects CSS that:

- Maps MUI `--jf-palette-primary-*` to `--abyss-accent`
- Tints AppBar, drawer, selected nav, buttons, switches, tabs, inputs
- Restyles user avatar, toolbar icons, activity-feed alert bells, and server/web version text
- Replaces cyan Active Devices session cards (`defaultCardBackground*`) with plum/rose glass

Default palette is Abyss **rose orchid** (`215, 100, 190`). Change the `--abyss-*` RGB triples in `dashboard-theme.css` (and re-embed into the JS, or edit the CSS string inside `dashboard-theme.js`) to match another theme.

Console check after hard refresh: `window.__JF_DASHBOARD_THEME__ === 1`

## Needs

- Jellyfin 10.11+ web
- [JavaScript Injector](https://github.com/IAmParadox27/jellyfin-plugin-javascript-injector)
- Dark display theme (same as Abyss)

Optional: pair with [abyss/](../abyss/) Custom CSS on the main client so home/libraries and Dashboard share one palette.

## Install

1. Dashboard → Plugins → JavaScript Injector → new script.
2. Paste `dashboard-theme.js` (CSS is already embedded).
3. Enable, set **Requires authentication = off**, save.
4. Restart Jellyfin / hard refresh (Ctrl+Shift+R).

`dashboard-theme.css` is the editable source for the styles. After changing it, copy the file contents into the `var CSS = "..."` string in `dashboard-theme.js` (JSON-escaped), or keep the CSS next to the JS for reference when maintaining the embed.

## Notes

- Styles apply only while `body.dashboardDocument` is present (admin Dashboard routes).
- Activity entries that stock marks as warn/error stay red (`#cc0000`).
- Does not re-enable Branding Custom CSS on the Dashboard; it only injects this sheet via the Injector.
