/* Ashraellen — shared site helpers */
(function () {
  'use strict';

  function pathParts(){ return window.location.pathname.split('/').filter(Boolean); }
  function isGitHub(){ return window.location.hostname.endsWith('github.io'); }
  function langIndex(){ return isGitHub() ? 1 : 0; }
  function basePath(){
    if (window.__BASE__) return window.__BASE__;
    var parts = pathParts();
    return isGitHub() && parts[0] ? '/' + parts[0] + '/' : '/';
  }
  function currentLang(fallback){
    var parts = pathParts();
    var lang = parts[langIndex()] || document.documentElement.lang || fallback || 'en';
    lang = String(lang).slice(0,2).toLowerCase();
    return lang;
  }

  if (!document.querySelector('link[rel="manifest"]')) {
    var manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = '/site.webmanifest';
    document.head.appendChild(manifest);
  }

  if (!document.querySelector('meta[name="theme-color"]')) {
    var theme = document.createElement('meta');
    theme.name = 'theme-color';
    theme.content = '#0b0b0d';
    document.head.appendChild(theme);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  window.__ashraellenSite = { parts:pathParts, isGitHub:isGitHub, langIndex:langIndex, base:basePath, lang:currentLang };
})();

/* Ashraellen — cookie consent and Google Analytics loader */
(function () {
  'use strict';

  var GA_ID = 'G-SMQMGSMWQ3';
  var STORAGE_KEY = 'ashraellen_cookie_consent_v1';
  var labels = {
    en: { text: 'Ashraellen uses technical site features and optional analytics to understand how the site is used. Analytics runs only after your consent.', accept: 'Accept analytics', reject: 'Reject', privacy: 'Privacy Policy' },
    ru: { text: 'Ashraellen использует технические функции сайта и необязательную аналитику, чтобы понимать, как работает сайт. Аналитика запускается только после вашего согласия.', accept: 'Разрешить аналитику', reject: 'Отказаться', privacy: 'Политика конфиденциальности' },
    be: { text: 'Ashraellen выкарыстоўвае тэхнічныя функцыі сайта і неабавязковую аналітыку, каб разумець, як працуе сайт. Аналітыка запускаецца толькі пасля вашай згоды.', accept: 'Дазволіць аналітыку', reject: 'Адмовіцца', privacy: 'Палітыка прыватнасці' },
    pl: { text: 'Ashraellen używa technicznych funkcji strony oraz opcjonalnej analityki, aby rozumieć, jak działa strona. Analityka uruchamia się tylko po Twojej zgodzie.', accept: 'Zezwól na analitykę', reject: 'Odmów', privacy: 'Polityka prywatności' },
    uk: { text: 'Ashraellen використовує технічні функції сайту та необов’язкову аналітику, щоб розуміти, як працює сайт. Аналітика запускається лише після вашої згоди.', accept: 'Дозволити аналітику', reject: 'Відмовитися', privacy: 'Політика конфіденційності' },
    de: { text: 'Ashraellen verwendet technische Website-Funktionen und optionale Analyse, um zu verstehen, wie die Website genutzt wird. Analytics startet nur nach Ihrer Zustimmung.', accept: 'Analytics erlauben', reject: 'Ablehnen', privacy: 'Datenschutzerklärung' },
    fr: { text: 'Ashraellen utilise des fonctions techniques du site et une analyse optionnelle pour comprendre l’usage du site. L’analyse ne démarre qu’après votre consentement.', accept: 'Autoriser l’analyse', reject: 'Refuser', privacy: 'Politique de confidentialité' },
    es: { text: 'Ashraellen utiliza funciones técnicas del sitio y analítica opcional para comprender cómo se usa el sitio. La analítica solo se activa con tu consentimiento.', accept: 'Aceptar analítica', reject: 'Rechazar', privacy: 'Política de privacidad' },
    pt: { text: 'Ashraellen usa funções técnicas do site e análise opcional para entender como o site é usado. A análise só é ativada após o seu consentimento.', accept: 'Aceitar análise', reject: 'Recusar', privacy: 'Política de privacidade' },
    fi: { text: 'Ashraellen käyttää sivuston teknisiä toimintoja ja valinnaista analytiikkaa ymmärtääkseen, miten sivustoa käytetään. Analytiikka käynnistyy vasta suostumuksesi jälkeen.', accept: 'Salli analytiikka', reject: 'Hylkää', privacy: 'Tietosuojakäytäntö' }
  };

  function lang(){ var l = window.__ashraellenSite.lang('en'); return labels[l] ? l : 'en'; }
  function base(){ return window.__ashraellenSite.base(); }
  function readConsent(){ try { return localStorage.getItem(STORAGE_KEY); } catch(e) { return null; } }
  function saveConsent(value){ try { localStorage.setItem(STORAGE_KEY, value); } catch(e) {} }
  function hideBanner(){ var banner = document.getElementById('ashraellen-cookie-consent'); if (banner) banner.remove(); }

  function loadGA(){
    if (window.__ashraellenAnalyticsLoaded) return;
    window.__ashraellenAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip:true, cookie_flags:'SameSite=None;Secure' });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(script);
  }

  function showBanner(){
    if (document.getElementById('ashraellen-cookie-consent')) return;
    var l = lang();
    var t = labels[l] || labels.en;
    var privacyHref = base() + l + '/privacy.html';
    if (l === 'en') privacyHref = base() + 'en/privacy.html';

    if (!document.getElementById('ashraellen-cookie-style')) {
      var style = document.createElement('style');
      style.id = 'ashraellen-cookie-style';
      style.textContent = '#ashraellen-cookie-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;display:flex;gap:14px;align-items:center;justify-content:space-between;max-width:980px;margin:0 auto;padding:14px 14px 14px 16px;border:1px solid rgba(242,242,244,.18);border-radius:18px;background:rgba(11,11,13,.94);color:#f2f2f4;box-shadow:0 20px 70px rgba(0,0,0,.45);backdrop-filter:blur(14px);font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}#ashraellen-cookie-consent p{margin:0;color:rgba(242,242,244,.78);font-size:13px;line-height:1.4;max-width:68ch}#ashraellen-cookie-consent a{color:#f2f2f4;text-decoration:none;border-bottom:1px solid rgba(242,242,244,.25)}#ashraellen-cookie-consent a:hover{border-color:rgba(242,242,244,.55)}.ashraellen-cookie-actions{display:flex;gap:8px;flex:0 0 auto}.ashraellen-cookie-actions button{appearance:none;border:1px solid rgba(242,242,244,.20);border-radius:999px;padding:9px 12px;font-size:13px;font-weight:700;cursor:pointer;background:rgba(255,255,255,.06);color:#f2f2f4}.ashraellen-cookie-actions button:hover{background:rgba(255,255,255,.11)}.ashraellen-cookie-actions .primary{background:#f2f2f4;color:#0b0b0d;border-color:#f2f2f4}.ashraellen-cookie-actions .primary:hover{background:#ffffff}@media(max-width:720px){#ashraellen-cookie-consent{display:block;left:10px;right:10px;bottom:10px;padding:14px}.ashraellen-cookie-actions{margin-top:12px;flex-wrap:wrap}.ashraellen-cookie-actions button{flex:1 1 auto}}';
      document.head.appendChild(style);
    }

    var banner = document.createElement('section');
    banner.id = 'ashraellen-cookie-consent';
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = '<p>' + t.text + ' <a href="' + privacyHref + '">' + t.privacy + '</a></p><div class="ashraellen-cookie-actions"><button type="button" data-cookie-choice="reject">' + t.reject + '</button><button type="button" class="primary" data-cookie-choice="accept">' + t.accept + '</button></div>';
    banner.addEventListener('click', function(event){
      var button = event.target.closest('button[data-cookie-choice]');
      if (!button) return;
      if (button.getAttribute('data-cookie-choice') === 'accept') { saveConsent('accepted'); hideBanner(); loadGA(); }
      else { saveConsent('rejected'); hideBanner(); }
    });
    document.body.appendChild(banner);
  }

  var consent = readConsent();
  if (consent === 'accepted') loadGA();
  else if (consent !== 'rejected') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
    else showBanner();
  }
})();

/* Ashraellen — compact privacy page menu */
(function () {
  'use strict';
  if (!document.querySelector('.privacy-page')) return;
  var labels = {
    en:{entry:'Entry',dossier:'Dossier'}, ru:{entry:'Вход',dossier:'Досье'}, be:{entry:'Уваход',dossier:'Дасье'},
    pl:{entry:'Wejście',dossier:'Dossier'}, de:{entry:'Eingang',dossier:'Dossier'}, fr:{entry:'Entrée',dossier:'Dossier'},
    es:{entry:'Entrada',dossier:'Dossier'}, pt:{entry:'Entrada',dossier:'Dossiê'}, uk:{entry:'Вхід',dossier:'Досьє'},
    fi:{entry:'Alku',dossier:'Ammatillinen esittely'}
  };
  var l = window.__ashraellenSite.lang('en');
  if (!labels[l]) l = 'en';
  var base = window.__ashraellenSite.base();
  var menu = document.querySelector('.site-header .menu');
  if (!menu) return;
  menu.innerHTML = '<a href="' + base + l + '/">' + labels[l].entry + '</a> | <a href="' + base + l + '/professional/">' + labels[l].dossier + '</a>';
})();
