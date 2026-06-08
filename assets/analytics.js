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
    pt: { text: 'Ashraellen usa funções técnicas do site e análise opcional para entender como o site é usado. A análise só é ativada após o seu consentimento.', accept: 'Aceitar análise', reject: 'Recusar', privacy: 'Política de privacidade' }
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
    es:{entry:'Entrada',dossier:'Dossier'}, pt:{entry:'Entrada',dossier:'Dossiê'}, uk:{entry:'Вхід',dossier:'Досьє'}
  };
  var l = window.__ashraellenSite.lang('en');
  if (!labels[l]) l = 'en';
  var base = window.__ashraellenSite.base();
  var menu = document.querySelector('.site-header .menu');
  if (!menu) return;
  menu.innerHTML = '<a href="' + base + l + '/">' + labels[l].entry + '</a> | <a href="' + base + l + '/professional/">' + labels[l].dossier + '</a>';
})();

/* Ashraellen — global contact button on language entry pages */
(function () {
  'use strict';
  var labels = { en:'Contact', ru:'Контакт', be:'Кантакт', pl:'Kontakt', de:'Kontakt', fr:'Contact', es:'Contacto', pt:'Contacto', uk:'Контакт' };
  var parts = window.__ashraellenSite.parts();
  var l = parts[window.__ashraellenSite.langIndex()] || '';
  var rest = parts.slice(window.__ashraellenSite.langIndex() + 1);
  if (!labels[l] || rest.length) return;
  if (!document.querySelector('.entry')) return;
  var base = window.__ashraellenSite.base();
  if (!document.getElementById('contact-corner-style')) {
    var style = document.createElement('style');
    style.id = 'contact-corner-style';
    style.textContent = '.contact-corner{position:fixed;right:22px;top:18px;z-index:6;margin:0}.contact-corner a{display:inline-flex;align-items:center;justify-content:center;padding:7px 11px;border:1px solid rgba(242,242,244,.16);border-radius:999px;background:rgba(0,0,0,.22);backdrop-filter:blur(4px);color:rgba(242,242,244,.62);font-size:12px;font-weight:650;line-height:1;text-decoration:none;letter-spacing:.015em;box-shadow:0 8px 24px rgba(0,0,0,.22);transition:color 140ms ease,border-color 140ms ease,background 140ms ease,transform 140ms ease}.contact-corner a:hover{color:rgba(242,242,244,.86);border-color:rgba(242,242,244,.30);background:rgba(0,0,0,.34);transform:translateY(-1px)}@media(max-width:700px){.contact-corner{right:14px;top:12px}.contact-corner a{font-size:11px;padding:7px 9px}}';
    document.head.appendChild(style);
  }
  var existing = document.getElementById('goContact') || document.querySelector('.contact-corner a');
  if (existing) { existing.href = base + l + '/contact.html'; existing.textContent = labels[l]; return; }
  var p = document.createElement('p');
  p.className = 'contact-corner';
  var a = document.createElement('a');
  a.id = 'goContact';
  a.href = base + l + '/contact.html';
  a.textContent = labels[l];
  p.appendChild(a);
  document.body.appendChild(p);
})();

/* Ashraellen — global privacy corner on language entry pages */
(function () {
  'use strict';
  var labels = { en:'Privacy Policy', ru:'Политика конфиденциальности', be:'Палітыка прыватнасці', pl:'Polityka prywatności', de:'Datenschutzerklärung', fr:'Politique de confidentialité', es:'Política de privacidad', pt:'Política de privacidade', uk:'Політика конфіденційності' };
  var parts = window.__ashraellenSite.parts();
  var l = parts[window.__ashraellenSite.langIndex()] || '';
  var rest = parts.slice(window.__ashraellenSite.langIndex() + 1);
  if (!labels[l] || rest.length) return;
  if (!document.querySelector('.entry')) return;
  var base = window.__ashraellenSite.base();
  if (!document.getElementById('privacy-corner-style')) {
    var style = document.createElement('style');
    style.id = 'privacy-corner-style';
    style.textContent = '.privacy-corner{position:fixed;right:22px;bottom:18px;z-index:5;margin:0}.privacy-corner a{display:inline-flex;align-items:center;justify-content:center;padding:7px 10px;border:1px solid rgba(242,242,244,.12);border-radius:999px;background:rgba(0,0,0,.18);backdrop-filter:blur(4px);color:rgba(242,242,244,.46);font-size:12px;line-height:1;text-decoration:none;transition:color 140ms ease,border-color 140ms ease,background 140ms ease,transform 140ms ease}.privacy-corner a:hover{color:rgba(242,242,244,.82);border-color:rgba(242,242,244,.28);background:rgba(0,0,0,.30);transform:translateY(-1px)}@media(max-width:700px){.privacy-corner{right:14px;bottom:12px}.privacy-corner a{font-size:11px;padding:7px 9px}}';
    document.head.appendChild(style);
  }
  var existing = document.getElementById('goPrivacy') || document.querySelector('.privacy-corner a');
  if (existing) { existing.href = base + l + '/privacy.html'; existing.textContent = labels[l]; return; }
  var p = document.createElement('p');
  p.className = 'privacy-corner';
  var a = document.createElement('a');
  a.id = 'goPrivacy';
  a.href = base + l + '/privacy.html';
  a.textContent = labels[l];
  p.appendChild(a);
  document.body.appendChild(p);
})();

/* Ashraellen — localized professional dossier button */
(function () {
  'use strict';
  var labels = { ru:'Профессиональное досье', be:'Прафесійнае дасье', pl:'Dossier profesjonalne', de:'Professionelles Dossier', fr:'Dossier professionnel', es:'Dossier profesional', pt:'Dossiê profissional', uk:'Професійне досьє', en:'Professional dossier' };
  var parts = window.__ashraellenSite.parts();
  var l = parts[window.__ashraellenSite.langIndex()] || '';
  var rest = parts.slice(window.__ashraellenSite.langIndex() + 1);
  if (!labels[l] || rest.length) return;
  var base = window.__ashraellenSite.base();
  var href = base + l + '/professional/';
  var existing = document.getElementById('goProfessional');
  if (existing) { existing.href = href; return; }
  var hint = document.querySelector('.action-hint');
  var langs = document.querySelector('.langs');
  if (!hint || !langs) return;
  if (!document.getElementById('professional-button-style')) {
    var style = document.createElement('style');
    style.id = 'professional-button-style';
    style.textContent = '.professional-link{display:flex;justify-content:flex-start;margin:18px 0 0}.professional-link a{display:inline-flex;align-items:center;justify-content:center;padding:7px 11px;border:1px solid rgba(242,242,244,.16);border-radius:999px;background:rgba(0,0,0,.22);color:rgba(242,242,244,.60);font-size:12px;font-weight:650;line-height:1;text-decoration:none;letter-spacing:.015em;box-shadow:0 8px 24px rgba(0,0,0,.22);transition:color 140ms ease,border-color 140ms ease,background 140ms ease,transform 140ms ease}.professional-link a:hover{color:rgba(242,242,244,.86);border-color:rgba(242,242,244,.30);background:rgba(0,0,0,.34);transform:translateY(-1px)}';
    document.head.appendChild(style);
  }
  var p = document.createElement('p');
  p.className = 'professional-link';
  var a = document.createElement('a');
  a.id = 'goProfessional';
  a.href = href;
  a.textContent = labels[l];
  p.appendChild(a);
  hint.insertAdjacentElement('afterend', p);
})();

/* Ashraellen — proposal links on professional pages */
(function () {
  'use strict';
  var parts = window.__ashraellenSite.parts();
  var l = parts[window.__ashraellenSite.langIndex()] || document.documentElement.lang || 'en';
  l = String(l).slice(0,2).toLowerCase();
  if (l !== 'en' && l !== 'ru') return;
  var rest = parts.slice(window.__ashraellenSite.langIndex() + 1);
  if (rest.join('/') !== 'professional') return;
  function addLinks(){
    var section = document.getElementById('pdf');
    if (!section || section.querySelector('[data-proposal-link="1"]')) return;
    var base = window.__ashraellenSite.base();
    var suffix = l === 'ru' ? 'RU' : 'EN';
    var text = l === 'ru' ? 'Скачать 12-месячный проектный план PDF →' : 'Download 12-month project proposal PDF →';
    var p = document.createElement('p');
    var a = document.createElement('a');
    a.className = 'dossier-link';
    a.href = base + 'assets/docs/Ashraellen_12_Month_Project_Proposal_2026_' + suffix + '.pdf';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.dataset.proposalLink = '1';
    a.textContent = text;
    p.appendChild(a);
    section.appendChild(p);
    var h2 = section.querySelector('h2');
    if (h2) h2.textContent = l === 'ru' ? 'PDF-досье, бюджет и проектный план' : 'PDF dossier, budget and project proposal';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addLinks);
  else addLinks();
})();

/* Ashraellen — multilingual research core on Research and Method pages */
(function () {
  'use strict';
  var parts = window.__ashraellenSite.parts();
  var langIndex = window.__ashraellenSite.langIndex();
  var l = (parts[langIndex] || document.documentElement.lang || 'en').slice(0,2).toLowerCase();
  var rest = parts.slice(langIndex + 1).join('/');
  var isResearch = rest === 'research';
  var isMethod = rest === 'research/method';
  if (!isResearch && !isMethod) return;

  var texts = {
    en: {
      title: 'Research core',
      p: [
        'Ashraellen is not merely a name, but a mode of seeing.',
        'It is a lifelong artistic-philosophical inquiry into meaning: a way of perceiving the world not as separate events, thoughts and reactions, but as a web of meanings, relations, knots and reflections.',
        'The author is present in this work not as the creator of a final system and not as the owner of truth, but as an observer and recorder of intersections. Books, videos, satire, sound, symbolic analysis, public formulas and the multilingual archive are forms of recording one long investigation.'
      ]
    },
    ru: {
      title: 'Исследовательское ядро',
      p: [
        'Ashraellen — это не столько имя, сколько способ видеть.',
        'Это художественно-философское исследование смысла длиною в жизнь: способ воспринимать мир не как набор отдельных событий, мыслей и реакций, а как паутину смыслов, связей, узлов и отражений.',
        'Автор присутствует в этой работе не как создатель окончательной системы и не как владелец истины, а как наблюдатель и фиксатор переплетений. Книги, видео, сатира, звук, символические разборы, публичные формулы и многоязычный архив — формы фиксации одного длительного исследования.'
      ]
    },
    be: {
      title: 'Даследчае ядро',
      p: [
        'Ashraellen — гэта не столькі імя, колькі спосаб бачыць.',
        'Гэта мастацка-філасофскае даследаванне сэнсу даўжынёю ў жыццё: спосаб успрымаць свет не як набор асобных падзей, думак і рэакцый, а як павуцінне сэнсаў, сувязяў, вузлоў і адлюстраванняў.',
        'Аўтар прысутнічае ў гэтай працы не як стваральнік канчатковай сістэмы і не як уладальнік ісціны, а як назіральнік і фіксатар перапляценняў. Кнігі, відэа, сатыра, гук, сімвалічныя разборы, публічныя формулы і шматмоўны архіў — формы фіксацыі аднаго працяглага даследавання.'
      ]
    },
    pl: {
      title: 'Rdzeń badania',
      p: [
        'Ashraellen nie jest jedynie imieniem, lecz sposobem widzenia.',
        'To trwające całe życie artystyczno-filozoficzne badanie sensu: sposób postrzegania świata nie jako zbioru oddzielnych zdarzeń, myśli i reakcji, lecz jako sieci znaczeń, relacji, węzłów i odbić.',
        'Autor jest obecny w tej pracy nie jako twórca ostatecznego systemu ani właściciel prawdy, lecz jako obserwator i zapisujący sploty. Książki, wideo, satyra, dźwięk, analizy symboliczne, publiczne formuły i wielojęzyczne archiwum są formami zapisu jednego długiego badania.'
      ]
    },
    uk: {
      title: 'Дослідницьке ядро',
      p: [
        'Ashraellen — це не стільки ім’я, скільки спосіб бачити.',
        'Це художньо-філософське дослідження сенсу завдовжки в життя: спосіб сприймати світ не як набір окремих подій, думок і реакцій, а як павутину сенсів, зв’язків, вузлів і віддзеркалень.',
        'Автор присутній у цій роботі не як творець остаточної системи і не як власник істини, а як спостерігач і фіксатор переплетень. Книги, відео, сатира, звук, символічні розбори, публічні формули і багатомовний архів — форми фіксації одного тривалого дослідження.'
      ]
    },
    pt: {
      title: 'Núcleo da investigação',
      p: [
        'Ashraellen não é apenas um nome, mas um modo de ver.',
        'É uma investigação artístico-filosófica do sentido ao longo de uma vida: uma forma de perceber o mundo não como um conjunto de acontecimentos, pensamentos e reações separados, mas como uma teia de sentidos, relações, nós e reflexos.',
        'O autor está presente neste trabalho não como criador de um sistema final nem como proprietário da verdade, mas como observador e registrador de entrelaçamentos. Livros, vídeos, sátira, som, análises simbólicas, fórmulas públicas e o arquivo multilíngue são formas de registrar uma longa investigação.'
      ]
    },
    es: {
      title: 'Núcleo de investigación',
      p: [
        'Ashraellen no es solo un nombre, sino una forma de ver.',
        'Es una investigación artístico-filosófica del sentido a lo largo de una vida: una manera de percibir el mundo no como un conjunto de acontecimientos, pensamientos y reacciones aislados, sino como una red de sentidos, relaciones, nudos y reflejos.',
        'El autor está presente en este trabajo no como creador de un sistema definitivo ni como dueño de la verdad, sino como observador y registrador de entrelazamientos. Libros, vídeos, sátira, sonido, análisis simbólicos, fórmulas públicas y el archivo multilingüe son formas de registrar una larga investigación.'
      ]
    },
    fr: {
      title: 'Noyau de recherche',
      p: [
        'Ashraellen n’est pas seulement un nom, mais une manière de voir.',
        'C’est une recherche artistique et philosophique du sens à l’échelle d’une vie : une manière de percevoir le monde non comme une suite d’événements, de pensées et de réactions séparés, mais comme une toile de sens, de relations, de nœuds et de reflets.',
        'L’auteur est présent dans ce travail non comme le créateur d’un système final ni comme le propriétaire de la vérité, mais comme un observateur et un enregistreur d’entrelacements. Livres, vidéos, satire, son, analyses symboliques, formules publiques et archive multilingue sont des formes d’enregistrement d’une longue recherche.'
      ]
    },
    de: {
      title: 'Forschungskern',
      p: [
        'Ashraellen ist nicht nur ein Name, sondern eine Weise des Sehens.',
        'Es ist eine lebenslange künstlerisch-philosophische Untersuchung des Sinns: eine Weise, die Welt nicht als Ansammlung einzelner Ereignisse, Gedanken und Reaktionen wahrzunehmen, sondern als Gewebe von Bedeutungen, Beziehungen, Knoten und Spiegelungen.',
        'Der Autor ist in dieser Arbeit nicht als Schöpfer eines endgültigen Systems und nicht als Besitzer der Wahrheit anwesend, sondern als Beobachter und Aufzeichner von Verflechtungen. Bücher, Videos, Satire, Klang, symbolische Analysen, öffentliche Formeln und das mehrsprachige Archiv sind Formen der Aufzeichnung einer langen Untersuchung.'
      ]
    }
  };
  var t = texts[l] || texts.en;

  function addCore(){
    if (document.querySelector('[data-ashraellen-research-core="1"]')) return;
    var content = document.querySelector('.content');
    var h1 = content && content.querySelector('h1');
    if (!content || !h1) return;
    var existing = content.textContent || '';
    if (isResearch && (existing.indexOf('lifelong artistic-philosophical') !== -1 || existing.indexOf('длиною в жизнь') !== -1)) return;

    var block = document.createElement('section');
    block.className = isMethod ? 'method-section' : 'research-core-block';
    block.setAttribute('data-ashraellen-research-core','1');
    if (isMethod) {
      var h2 = document.createElement('h2');
      h2.textContent = t.title;
      block.appendChild(h2);
    }
    t.p.forEach(function(txt){
      var p = document.createElement('p');
      p.className = isMethod ? '' : 'lead';
      p.textContent = txt;
      block.appendChild(p);
    });
    var after = h1;
    if (isMethod) {
      var notes = content.querySelectorAll('.method-note');
      if (notes.length) after = notes[notes.length - 1];
    }
    after.insertAdjacentElement('afterend', block);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addCore);
  else addCore();
})();

/* Ashraellen — tiny localized project fixes */
(function () {
  'use strict';
  var path = window.location.pathname;
  var replacement = null;
  if (path.indexOf('/ru/research/projects/') !== -1) replacement = 'Церковь Святого Нытья';
  else if (path.indexOf('/uk/research/projects/') !== -1) replacement = 'Церква Святого Ниття';
  else if (path.indexOf('/be/research/projects/') !== -1) replacement = 'Царква Святога Ныцця';
  if (replacement) {
    document.querySelectorAll('.project-card h2').forEach(function (heading) {
      if (heading.textContent.trim() === 'Church of Saint Whine') heading.textContent = replacement;
    });
  }
})();