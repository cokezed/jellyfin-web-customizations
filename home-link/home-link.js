/**
 * Home header link - JavaScript Injector snippet.
 *
 * Stock jellyfin-web uses <button class="headerHomeButton"> + navigate("home"),
 * so middle-click / Ctrl+click / "Open in new tab" cannot work.
 *
 * Replaces that button with an <a href="…#/home"> that keeps the same classes
 * and SPA-navigates on plain left-click.
 *
 * Visibility: stock toggles `.hide` on its original button reference after render.
 * After we replace the node, that toggle no longer reaches us - so we mirror
 * `.skinHeader.noHomeButtonHeader` onto the link ourselves.
 *
 * Console check: window.__JF_HOME_LINK__ === 1
 */
(function () {
  "use strict";

  if (window.__JF_HOME_LINK__ === 1) return;
  window.__JF_HOME_LINK__ = 1;

  function homeHref() {
    var path = window.location.pathname || "/web/index.html";
    if (path.indexOf("/web") === -1) {
      path = "/web/index.html";
    }
    var q = path.indexOf("?");
    if (q >= 0) path = path.substring(0, q);
    return window.location.origin + path + "#/home";
  }

  function spaGoHome() {
    try {
      if (
        window.Emby &&
        window.Emby.Page &&
        typeof window.Emby.Page.show === "function"
      ) {
        window.Emby.Page.show("home");
        return;
      }
    } catch (e) {
      /* fall through */
    }
    window.location.hash = "#/home";
  }

  function syncVisibility(el) {
    if (!el) return;
    var header = document.querySelector(".skinHeader");
    // On Home (and a few other views) stock adds noHomeButtonHeader and hides the icon.
    if (header && header.classList.contains("noHomeButtonHeader")) {
      el.classList.add("hide");
    } else {
      el.classList.remove("hide");
    }
  }

  function upgrade(btn) {
    if (!btn || btn.tagName === "A" || btn.getAttribute("data-jf-home-link") === "1") {
      return;
    }
    if (!btn.classList || !btn.classList.contains("headerHomeButton")) {
      return;
    }

    var a = document.createElement("a");
    a.href = homeHref();
    a.className = btn.className;
    a.innerHTML = btn.innerHTML;
    a.setAttribute("data-jf-home-link", "1");
    a.setAttribute("role", "button");
    var title = btn.getAttribute("title") || btn.getAttribute("aria-label") || "Home";
    a.setAttribute("title", title);
    a.setAttribute("aria-label", title);
    a.style.textDecoration = "none";

    a.addEventListener("click", function (ev) {
      if (ev.defaultPrevented) return;
      if (ev.button !== 0) return;
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      ev.preventDefault();
      spaGoHome();
    });

    if (btn.parentNode) {
      btn.parentNode.replaceChild(a, btn);
    }
    syncVisibility(a);
  }

  function scan() {
    try {
      var nodes = document.querySelectorAll(
        "button.headerHomeButton, .headerHomeButton:not([data-jf-home-link='1'])",
      );
      for (var i = 0; i < nodes.length; i++) {
        upgrade(nodes[i]);
      }
      var links = document.querySelectorAll("a.headerHomeButton[data-jf-home-link='1']");
      var href = homeHref();
      for (var j = 0; j < links.length; j++) {
        if (links[j].getAttribute("href") !== href) {
          links[j].setAttribute("href", href);
        }
        syncVisibility(links[j]);
      }
    } catch (e) {
      /* ignore */
    }
  }

  var timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(scan, 50);
  }

  function main() {
    scan();
    document.addEventListener("viewshow", schedule);
    window.addEventListener("hashchange", schedule);
    if (document.body) {
      var mo = new MutationObserver(schedule);
      mo.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    setTimeout(main, 0);
  }
})();
