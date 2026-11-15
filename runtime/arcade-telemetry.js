/*!
 * GenesisOS Arcade telemetry bridge v1.0.0
 * Forwards DemoNet game events (TRAIL_*, etc.) and arcade funnel events to GA4.
 * Drop-in: <script src="/runtime/arcade-telemetry.js" defer></script>
 * Must load BEFORE the game module so window.__GOS_DEMONET is set when the game boots.
 * No PII: only primitive payload fields, short strings, max 10 params per event.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document && !root.__GOS_TELEMETRY) root.__GOS_TELEMETRY = api.init(root);
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  var DEFAULT_GA_ID = "G-7ZNYFJFNM9";
  var MAX_PARAMS = 10;
  var MAX_STR = 40;
  var MAX_ERRORS = 5;
  var BLOCKED_KEYS = /(email|phone|address|wallet|token|password|ip|user(name)?|player_?name)/i;

  // DemoNet type -> GA4 recommended event (in addition to the raw gos_* event)
  var RECOMMENDED = {
    TRAIL_JOURNEY_STARTED: ["level_start", { level_name: "frontier_trail" }],
    TRAIL_JOURNEY_COMPLETE: ["level_end", { level_name: "frontier_trail", success: true }],
    TRAIL_GAME_OVER: ["level_end", { level_name: "frontier_trail", success: false }],
  };

  function eventName(type) {
    return ("gos_" + String(type || "event").toLowerCase().replace(/[^a-z0-9_]/g, "_")).slice(0, 40);
  }

  function sanitize(payload) {
    var out = {};
    var n = 0;
    if (!payload || typeof payload !== "object") return out;
    for (var k in payload) {
      if (!Object.prototype.hasOwnProperty.call(payload, k) || n >= MAX_PARAMS) continue;
      if (BLOCKED_KEYS.test(k)) continue;
      var v = payload[k];
      var key = String(k).replace(/[^A-Za-z0-9_]/g, "_").slice(0, 40);
      if (typeof v === "number" && isFinite(v)) { out[key] = v; n++; }
      else if (typeof v === "boolean") { out[key] = v; n++; }
      else if (typeof v === "string" && v.length) { out[key] = v.slice(0, MAX_STR); n++; }
    }
    return out;
  }

  function detectGame(w) {
    var el = w.document && w.document.documentElement;
    var attr = el && el.getAttribute && el.getAttribute("data-gos-game");
    if (attr) return attr;
    var m = String((w.location && w.location.pathname) || "").match(/\/games\/([^/]+)/);
    return m ? m[1] : "arcade";
  }

  function init(w, opts) {
    opts = opts || {};
    var gaId = opts.gaId || (w.__GOS_GA_ID) || DEFAULT_GA_ID;
    var game = opts.game || detectGame(w);
    var seen = {};
    var errors = 0;

    w.dataLayer = w.dataLayer || [];
    if (typeof w.gtag !== "function") {
      w.gtag = function () { w.dataLayer.push(arguments); };
    }
    var doc = w.document;
    var hasLoader = doc && doc.querySelector && doc.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (!hasLoader && doc && doc.createElement && opts.loadGtag !== false) {
      var s = doc.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaId);
      (doc.head || doc.documentElement).appendChild(s);
      w.gtag("js", new Date());
      w.gtag("config", gaId);
    }

    function send(name, params) {
      try { w.gtag("event", name, params || {}); } catch (e) { /* never break the game */ }
    }

    function onDemonet(evt) {
      if (!evt || !evt.type) return;
      var id = evt.type + ":" + (evt.ts || "");
      if (evt.ts && seen[id]) return; // dedupe direct call + postMessage
      if (evt.ts) seen[id] = 1;
      var params = sanitize(evt.payload);
      params.game = game;
      send(eventName(evt.type), params);
      var rec = RECOMMENDED[evt.type];
      if (rec) {
        var p = {};
        for (var k in rec[1]) p[k] = rec[1][k];
        p.game = game;
        send(rec[0], p);
      }
    }

    // Chain any host handler already installed.
    var prev = typeof w.__GOS_DEMONET === "function" ? w.__GOS_DEMONET : null;
    w.__GOS_DEMONET = function (evt) {
      onDemonet(evt);
      if (prev) { try { prev(evt); } catch (e) {} }
    };

    if (w.addEventListener) {
      // Iframe-hosted cabinets post to the parent.
      w.addEventListener("message", function (m) {
        var d = m && m.data;
        if (d && d.channel === "gos-demonet") onDemonet(d);
      });
      // Launch-health signal: runtime errors (rate-limited).
      w.addEventListener("error", function (e) {
        if (errors >= MAX_ERRORS) return;
        errors++;
        send("exception", { description: String((e && e.message) || "error").slice(0, 100), fatal: false, game: game });
      });
      // Funnel: lobby/listing -> Play clicks.
      if (doc && doc.addEventListener) {
        doc.addEventListener("click", function (e) {
          var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
          if (!a) return;
          var href = a.getAttribute("href") || "";
          var m = href.match(/games\/([^/]+)\/?(listing\.html)?/);
          if (!m) return;
          send(m[2] ? "gos_details_click" : "gos_play_click", { game: m[1], from: game });
        }, true);
      }
    }

    // Game boot signal: canvas mounted inside #gos-mount.
    if (doc && doc.getElementById && typeof w.MutationObserver === "function") {
      var t0 = Date.now();
      var mount = doc.getElementById("gos-mount");
      if (mount) {
        var mo = new w.MutationObserver(function () {
          if (mount.querySelector("canvas")) {
            mo.disconnect();
            send("gos_game_loaded", { game: game, load_ms: Date.now() - t0 });
          }
        });
        mo.observe(mount, { childList: true, subtree: true });
      }
    }

    return { gaId: gaId, game: game, track: send, onDemonet: onDemonet };
  }

  return { init: init, sanitize: sanitize, eventName: eventName, RECOMMENDED: RECOMMENDED, version: "1.0.0" };
});
