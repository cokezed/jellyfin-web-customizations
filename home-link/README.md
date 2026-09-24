# Home header link

Turns the top-left Home control into a real link so middle-click, Ctrl+click, and "Open link in new tab" work.

## Problem

Stock jellyfin-web uses a button with `navigate("home")` and no `href`, so the browser cannot open Home in a new tab.

## Fix

Replaces that button with an `<a href=".../web/...#/home">` that keeps the same classes.

- Normal left-click: same SPA home navigation as stock
- Ctrl/Cmd/middle-click or context menu: real `#/home` URL

Use a **public** injector script (auth not required).

Console check after hard refresh: `window.__JF_HOME_LINK__ === 1`

## Install

1. JavaScript Injector → new entry.
2. Paste `home-link.js`, enable, **Requires authentication = off**.
3. Restart Jellyfin / hard refresh (Ctrl+Shift+R).

## Notes

- Re-applies when the header re-renders (MutationObserver + `viewshow`).
- Hides on views where `.skinHeader` has `noHomeButtonHeader` (for example Home), matching stock. Needed because replacing the button breaks stock's `.hide` toggle on the old node.
- Drawer and back button are unchanged.
