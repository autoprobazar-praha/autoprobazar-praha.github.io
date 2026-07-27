/* =========================================================
   Cookie consent banner — AutoProBazar Praha
   Opt-in dle novely zákona č. 127/2005 Sb. (ZEK), § 89 odst. 3
   (aktivní souhlas PŘED spuštěním netechnických cookies;
   "Přijmout vše" a "Odmítnout vše" v jedné vrstvě, žádná
   předzaškrtnutá políčka)
   ========================================================= */
(function () {
  var STORAGE_KEY = "cookieConsent"; // "accepted" | "rejected"
  var lang = localStorage.getItem("lang") || "cz";

  var TXT = {
    cz: {
      title: "Používáme cookies",
      body: "Nezbytné cookies používáme vždy pro fungování webu. Analytické a marketingové cookies (např. Google Analytics, Meta Pixel) spustíme pouze s vaším souhlasem.",
      acceptAll: "Přijmout vše",
      rejectAll: "Odmítnout vše",
      settings: "Nastavení cookies",
      more: "Více v zásadách cookies",
    },
    ua: {
      title: "Ми використовуємо cookies",
      body: "Технічні cookies використовуються завжди для роботи сайту. Аналітичні та маркетингові cookies (напр. Google Analytics, Meta Pixel) вмикаються лише за вашою згодою.",
      acceptAll: "Прийняти всі",
      rejectAll: "Відхилити всі",
      settings: "Налаштування cookies",
      more: "Детальніше в політиці cookies",
    },
  };

  var t = TXT[lang] || TXT.cz;

  function injectStyles() {
    if (document.getElementById("cookie-consent-style")) return;
    var style = document.createElement("style");
    style.id = "cookie-consent-style";
    style.textContent = `
      #cookie-consent-banner {
        position: fixed; left: 0; right: 0; bottom: 0; z-index: 99999;
        background: #14101c; border-top: 1px solid rgba(255,255,255,0.08);
        padding: 20px 24px; font-family: 'Inter', sans-serif;
        display: flex; flex-wrap: wrap; gap: 16px 24px;
        align-items: center; justify-content: space-between;
        box-shadow: 0 -8px 30px rgba(0,0,0,0.45);
      }
      #cookie-consent-banner .cc-text { flex: 1 1 340px; color: #b8b8cc; font-size: 14px; line-height: 1.6; }
      #cookie-consent-banner .cc-text strong { color: #fff; display: block; font-size: 15px; margin-bottom: 4px; }
      #cookie-consent-banner .cc-text a { color: #a58ac9; text-decoration: underline; }
      #cookie-consent-banner .cc-btns { display: flex; gap: 10px; flex-wrap: wrap; }
      #cookie-consent-banner button {
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
        padding: 11px 20px; border-radius: 8px; cursor: pointer; border: 1px solid transparent;
        transition: opacity .2s;
      }
      #cookie-consent-banner button:hover { opacity: .85; }
      #cc-accept-all { background: #7a5a9e; color: #fff; }
      #cc-reject-all { background: transparent; color: #b8b8cc; border-color: rgba(255,255,255,0.18); }
      @media (max-width: 640px) {
        #cookie-consent-banner { padding: 16px; }
        #cookie-consent-banner .cc-btns { width: 100%; }
        #cookie-consent-banner .cc-btns button { flex: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  function buildBanner() {
    var el = document.createElement("div");
    el.id = "cookie-consent-banner";
    el.innerHTML =
      '<div class="cc-text"><strong>' + t.title + "</strong>" +
      t.body + ' <a href="cookies.html">' + t.more + "</a></div>" +
      '<div class="cc-btns">' +
      '<button id="cc-reject-all" type="button">' + t.rejectAll + "</button>" +
      '<button id="cc-accept-all" type="button">' + t.acceptAll + "</button>" +
      "</div>";
    document.body.appendChild(el);

    document.getElementById("cc-accept-all").addEventListener("click", function () {
      setConsent("accepted");
    });
    document.getElementById("cc-reject-all").addEventListener("click", function () {
      setConsent("rejected");
    });
  }

  function removeBanner() {
    var el = document.getElementById("cookie-consent-banner");
    if (el) el.remove();
  }

  function setConsent(value) {
    localStorage.setItem(STORAGE_KEY, value);
    removeBanner();
    if (value === "accepted") enableAnalytics();
  }

  // Stub: called only after opt-in consent. Paste real GA4 / Meta Pixel
  // snippets here (the same ones referenced by the <!-- GA4 --> / <!-- Meta
  // Pixel --> placeholder comments in <head>) so they only ever load with
  // consent, never before.
  function enableAnalytics() {
    // Example once you have a GA4 Measurement ID:
    // var s = document.createElement('script');
    // s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX';
    // s.async = true;
    // document.head.appendChild(s);
    // window.dataLayer = window.dataLayer || [];
    // function gtag(){ dataLayer.push(arguments); }
    // gtag('js', new Date());
    // gtag('config', 'G-XXXXXXX');
  }

  // Public API — call from a "Nastavení cookies" link anywhere on the site
  window.openCookieSettings = function () {
    removeBanner();
    injectStyles();
    buildBanner();
  };

  function init() {
    injectStyles();
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "accepted") {
      enableAnalytics();
      return;
    }
    if (saved === "rejected") return;
    buildBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
