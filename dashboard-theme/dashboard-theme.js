/**
 * Theme the Jellyfin admin Dashboard (10.11+) with Abyss-style accents.
 *
 * Branding Custom CSS is not loaded on /dashboard (recovery surface). This
 * injects dashboard-theme.css while body.dashboardDocument is present.
 *
 * Install: JavaScript Injector -> paste this file, enable, Requires authentication = off.
 * Console check: window.__JF_DASHBOARD_THEME__ === 1
 *
 * To change colors, edit dashboard-theme.css and rebuild the CSS string below,
 * or edit the --abyss-* RGB values inside the embedded CSS.
 */
(function () {
  "use strict";

  if (window.__JF_DASHBOARD_THEME__ === 1) return;
  window.__JF_DASHBOARD_THEME__ = 1;

  var STYLE_ID = "jf-dashboard-theme";
  var CSS = "/*\n * Theme the Jellyfin admin Dashboard (10.11+) to match Abyss / Custom CSS accents.\n *\n * Branding Custom CSS does not load on /dashboard. Inject via dashboard-theme.js\n * (JavaScript Injector). Edit the palette RGB triples below to match your theme.\n *\n * Default palette: Abyss rose orchid (215, 100, 190).\n */\r\n/* Abyss palette - Rose orchid (theme: rose) */\r\n:root {\r\n  --abyss-accent: 215, 100, 190;\r\n  --abyss-accent-channel: 215 100 190;\r\n  --abyss-glass-tint: 50, 36, 58;\r\n}\r\nhtml[data-theme=\"dark\"] {\r\n  --jf-palette-primary-main: rgb(var(--abyss-accent));\r\n  --jf-palette-primary-mainChannel: var(--abyss-accent-channel);\r\n  --jf-palette-secondary-main: rgb(190, 120, 255);\r\n  --jf-palette-secondary-mainChannel: 190 120 255;\r\n  --jf-palette-AppBar-defaultBg: rgba(var(--abyss-glass-tint), 0.92);\r\n  --jf-palette-AppBar-transparentBg: rgba(var(--abyss-glass-tint), 0.72);\r\n}\r\n\r\n/* Admin dashboard chrome — MUI + leftover legacy blues */\r\nbody.dashboardDocument {\r\n  --jf-palette-primary-main: rgb(var(--abyss-accent));\r\n  --jf-palette-primary-mainChannel: var(--abyss-accent-channel);\r\n  --jf-palette-primary-dark: rgb(var(--abyss-accent));\r\n  --jf-palette-primary-darkChannel: var(--abyss-accent-channel);\r\n  --jf-palette-primary-light: rgba(var(--abyss-accent), 0.72);\r\n  --jf-palette-primary-lightChannel: var(--abyss-accent-channel);\r\n  --jf-palette-secondary-main: rgb(190, 120, 255);\r\n  --jf-palette-secondary-mainChannel: 190 120 255;\r\n  --jf-palette-AppBar-defaultBg: rgba(var(--abyss-glass-tint), 0.92);\r\n  --jf-palette-AppBar-transparentBg: rgba(var(--abyss-glass-tint), 0.72);\r\n}\r\nbody.dashboardDocument .dashboard-appBar,\r\nbody.dashboardDocument .MuiAppBar-root {\r\n  background-color: rgba(var(--abyss-glass-tint), 0.92) !important;\r\n  background-image: none !important;\r\n}\r\nbody.dashboardDocument .MuiDrawer-paper {\r\n  background-color: rgba(20, 14, 24, 0.98) !important;\r\n  border-right: 1px solid rgba(var(--abyss-accent), 0.14) !important;\r\n}\r\nbody.dashboardDocument .MuiListItemButton-root.Mui-selected,\r\nbody.dashboardDocument .MuiListItemButton-root.Mui-selected:hover {\r\n  background-color: rgba(var(--abyss-accent), 0.22) !important;\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .MuiListItemButton-root.Mui-selected .MuiListItemIcon-root,\r\nbody.dashboardDocument .MuiListItemButton-root.Mui-selected .MuiSvgIcon-root {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .MuiListItemButton-root:hover {\r\n  background-color: rgba(var(--abyss-accent), 0.1) !important;\r\n}\r\nbody.dashboardDocument .MuiButton-containedPrimary,\r\nbody.dashboardDocument .MuiButton-contained.MuiButton-colorPrimary {\r\n  background-color: rgb(var(--abyss-accent)) !important;\r\n  color: #121212 !important;\r\n}\r\nbody.dashboardDocument .MuiButton-containedPrimary:hover,\r\nbody.dashboardDocument .MuiButton-contained.MuiButton-colorPrimary:hover {\r\n  background-color: rgba(var(--abyss-accent), 0.88) !important;\r\n  box-shadow: 0 0 14px rgba(var(--abyss-accent), 0.35) !important;\r\n}\r\nbody.dashboardDocument .MuiButton-outlinedPrimary,\r\nbody.dashboardDocument .MuiButton-textPrimary,\r\nbody.dashboardDocument .MuiLink-root,\r\nbody.dashboardDocument a.MuiTypography-root {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .MuiButton-outlinedPrimary {\r\n  border-color: rgba(var(--abyss-accent), 0.55) !important;\r\n}\r\nbody.dashboardDocument .MuiSwitch-switchBase.Mui-checked {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track {\r\n  background-color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .MuiCheckbox-root.Mui-checked,\r\nbody.dashboardDocument .MuiRadio-root.Mui-checked,\r\nbody.dashboardDocument .MuiSvgIcon-root.MuiSvgIcon-colorPrimary {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .MuiTab-root.Mui-selected {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .MuiTabs-indicator {\r\n  background-color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .MuiCircularProgress-colorPrimary,\r\nbody.dashboardDocument .MuiLinearProgress-barColorPrimary {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n  background-color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .MuiChip-colorPrimary {\r\n  background-color: rgba(var(--abyss-accent), 0.22) !important;\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .MuiFilledInput-root.Mui-focused,\r\nbody.dashboardDocument .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline,\r\nbody.dashboardDocument .MuiInput-underline:after {\r\n  border-color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .MuiInputLabel-root.Mui-focused,\r\nbody.dashboardDocument .MuiFormLabel-root.Mui-focused {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .MuiSlider-thumb,\r\nbody.dashboardDocument .MuiSlider-track {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .button-submit,\r\nbody.dashboardDocument .navMenuOption-selected,\r\nbody.dashboardDocument .emby-checkbox:checked + span + .checkboxOutline,\r\nbody.dashboardDocument .itemProgressBarForeground,\r\nbody.dashboardDocument .progressring-spiner {\r\n  background-color: rgb(var(--abyss-accent)) !important;\r\n  border-color: rgb(var(--abyss-accent)) !important;\r\n  color: #121212 !important;\r\n}\r\nbody.dashboardDocument .button-link,\r\nbody.dashboardDocument .inputLabelFocused,\r\nbody.dashboardDocument .selectLabelFocused,\r\nbody.dashboardDocument .textareaLabelFocused,\r\nbody.dashboardDocument .buttonActive {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .emby-input:focus,\r\nbody.dashboardDocument .emby-textarea:focus,\r\nbody.dashboardDocument .emby-select-withcolor:focus {\r\n  border-color: rgb(var(--abyss-accent)) !important;\r\n}\r\n\r\n/* App bar — user avatar + toolbar icon buttons (help, etc.) */\r\nbody.dashboardDocument .dashboard-appBar .MuiIconButton-root,\r\nbody.dashboardDocument .MuiToolbar-root .MuiIconButton-root {\r\n  color: rgba(var(--abyss-accent), 0.88) !important;\r\n}\r\nbody.dashboardDocument .dashboard-appBar .MuiIconButton-root:hover,\r\nbody.dashboardDocument .MuiToolbar-root .MuiIconButton-root:hover {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n  background-color: rgba(var(--abyss-accent), 0.12) !important;\r\n}\r\nbody.dashboardDocument .MuiAvatar-root:not(:has(img)),\r\nbody.dashboardDocument .MuiAvatar-colorDefault {\r\n  background-color: rgb(var(--abyss-accent)) !important;\r\n  color: #121212 !important;\r\n}\r\n\r\n/* Activity feed alert bells — stock JS inlines #00a4dc / #cc0000 */\r\nbody.dashboardDocument .listItemIcon {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .listItemIcon[style*=\"#00a4dc\"],\r\nbody.dashboardDocument .listItemIcon[style*=\"#00A4DC\"],\r\nbody.dashboardDocument .listItemIcon[style*=\"rgb(0, 164, 220)\"],\r\nbody.dashboardDocument .listItemIcon[style*=\"rgb(0,164,220)\"] {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n  background-color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .listItemIcon[style*=\"#cc0000\"],\r\nbody.dashboardDocument .listItemIcon[style*=\"#CC0000\"],\r\nbody.dashboardDocument .listItemIcon[style*=\"#c00\"] {\r\n  color: #cc0000 !important;\r\n  background-color: #cc0000 !important;\r\n}\r\n\r\n/* Server info — Web / server / build version values */\r\nbody.dashboardDocument #webVersion,\r\nbody.dashboardDocument #versionNumber,\r\nbody.dashboardDocument #buildVersion,\r\nbody.dashboardDocument #serverName,\r\nbody.dashboardDocument .serverInfo \u003e :nth-child(2n) {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument .serverInfo a,\r\nbody.dashboardDocument .serverInfo .button-link {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\n\r\n/* Catch leftover stock cyan on dashboard (inline styles without !important) */\r\nbody.dashboardDocument [style*=\"#00a4dc\"],\r\nbody.dashboardDocument [style*=\"#00A4DC\"] {\r\n  color: rgb(var(--abyss-accent)) !important;\r\n}\r\nbody.dashboardDocument [style*=\"background-color:#00a4dc\"],\r\nbody.dashboardDocument [style*=\"background-color: #00a4dc\"],\r\nbody.dashboardDocument [style*=\"background-color:#00A4DC\"],\r\nbody.dashboardDocument [style*=\"background:#00a4dc\"],\r\nbody.dashboardDocument [style*=\"background: #00a4dc\"] {\r\n  background-color: rgb(var(--abyss-accent)) !important;\r\n  background: rgb(var(--abyss-accent)) !important;\r\n}";

  function onDashboard() {
    return !!(document.body && document.body.classList.contains("dashboardDocument"));
  }

  function ensureStyle() {
    var existing = document.getElementById(STYLE_ID);
    if (onDashboard()) {
      if (!existing) {
        var style = document.createElement("style");
        style.id = STYLE_ID;
        style.setAttribute("data-jf-dashboard-theme", "1");
        style.textContent = CSS;
        (document.head || document.documentElement).appendChild(style);
      }
    } else if (existing) {
      existing.remove();
    }
  }

  function watch() {
    ensureStyle();
    if (!document.body) return;
    var obs = new MutationObserver(ensureStyle);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  if (document.body) {
    watch();
  } else {
    document.addEventListener("DOMContentLoaded", watch, { once: true });
  }

  window.addEventListener("hashchange", ensureStyle);
  window.addEventListener("popstate", ensureStyle);
})();
