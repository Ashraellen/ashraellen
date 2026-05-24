/* Ashraellen — PWA helper */
(function () {
  'use strict';

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
})();

/* Ashraellen — Google Analytics loader */
(function () {
  'use strict';

  var GA_ID = 'G-SMQMGSMWQ3';

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    anonymize_ip: true
  });

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
  document.head.appendChild(script);
})();

/* Ashraellen — localized professional dossier button */
(function () {
  'use strict';

  var labels = {
    ru: 'Профессиональное досье',
    be: 'Прафесійнае дасье',
    pl: 'Dossier profesjonalne',
    de: 'Professionelles Dossier',
    fr: 'Dossier professionnel',
    es: 'Dossier profesional',
    pt: 'Dossiê profissional',
    uk: 'Професійне досьє',
    en: 'Professional dossier'
  };

  var parts = window.location.pathname.split('/').filter(Boolean);
  var langIndex = window.location.hostname.endsWith('github.io') ? 1 : 0;
  var lang = parts[langIndex] || '';
  var rest = parts.slice(langIndex + 1);

  if (!labels[lang] || rest.length) return;

  var base = window.__BASE__ || '/';
  var href = base + lang + '/professional/';
  var existing = document.getElementById('goProfessional');
  if (existing) {
    existing.href = href;
    return;
  }

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
  a.textContent = labels[lang];
  p.appendChild(a);
  hint.insertAdjacentElement('afterend', p);
})();

/* Ashraellen — professional dossier public channels */
(function () {
  'use strict';

  var parts = window.location.pathname.split('/').filter(Boolean);
  var langIndex = window.location.hostname.endsWith('github.io') ? 1 : 0;
  var lang = parts[langIndex] || 'en';
  var rest = parts.slice(langIndex + 1);
  if (rest[0] !== 'professional') return;

  var labels = {
    en: {
      title: 'Public channels:',
      youtube: 'multilingual video archive',
      instagram: 'visual public field',
      telegram: 'Russian-language notes and source-language updates'
    },
    ru: {
      title: 'Публичные каналы:',
      youtube: 'многоязычный видеоархив',
      instagram: 'визуальное публичное поле',
      telegram: 'русскоязычные заметки и обновления исходного языка'
    },
    be: {
      title: 'Публічныя каналы:',
      youtube: 'шматмоўны відэаархіў',
      instagram: 'візуальнае публічнае поле',
      telegram: 'рускамоўныя нататкі і абнаўленні мовы крыніцы'
    },
    pl: {
      title: 'Kanały publiczne:',
      youtube: 'wielojęzyczne archiwum wideo',
      instagram: 'wizualne pole publiczne',
      telegram: 'rosyjskojęzyczne notatki i aktualizacje języka źródłowego'
    },
    de: {
      title: 'Öffentliche Kanäle:',
      youtube: 'mehrsprachiges Videoarchiv',
      instagram: 'visuelles öffentliches Feld',
      telegram: 'russischsprachige Notizen und Aktualisierungen der Ausgangssprache'
    },
    fr: {
      title: 'Canaux publics :',
      youtube: 'archive vidéo multilingue',
      instagram: 'champ public visuel',
      telegram: 'notes en russe et mises à jour dans la langue source'
    },
    es: {
      title: 'Canales públicos:',
      youtube: 'archivo de video multilingüe',
      instagram: 'campo público visual',
      telegram: 'notas en ruso y actualizaciones en la lengua fuente'
    },
    pt: {
      title: 'Canais públicos:',
      youtube: 'arquivo de vídeo multilíngue',
      instagram: 'campo público visual',
      telegram: 'notas em russo e atualizações na língua de origem'
    },
    uk: {
      title: 'Публічні канали:',
      youtube: 'багатомовний відеоархів',
      instagram: 'візуальне публічне поле',
      telegram: 'російськомовні нотатки й оновлення мови джерела'
    }
  };

  var text = labels[lang] || labels.en;
  var box = document.querySelector('.contact-box');
  if (!box || box.querySelector('.channel-list')) return;

  if (!document.getElementById('channel-list-style')) {
    var style = document.createElement('style');
    style.id = 'channel-list-style';
    style.textContent = '.channel-list{margin:12px 0 0;padding:0;list-style:none;display:grid;gap:7px}.channel-list li{color:var(--muted);font-size:14px;line-height:1.45}.channel-list a{color:var(--fg);text-decoration:none;border-bottom:1px solid rgba(242,242,244,.20)}.channel-list a:hover{border-color:rgba(242,242,244,.48)}';
    document.head.appendChild(style);
  }

  var old = Array.prototype.slice.call(box.querySelectorAll('p')).find(function (p) {
    return p.textContent.indexOf('Public channels') !== -1 ||
      p.textContent.indexOf('Публичные каналы') !== -1 ||
      p.textContent.indexOf('Публічныя каналы') !== -1 ||
      p.textContent.indexOf('Kanały publiczne') !== -1 ||
      p.textContent.indexOf('Öffentliche Kanäle') !== -1 ||
      p.textContent.indexOf('Canaux publics') !== -1 ||
      p.textContent.indexOf('Canales públicos') !== -1 ||
      p.textContent.indexOf('Canais públicos') !== -1 ||
      p.textContent.indexOf('Публічні канали') !== -1;
  });

  var container = document.createElement('div');
  container.className = 'channels-block';
  container.innerHTML = '<p><strong>' + text.title + '</strong></p>' +
    '<ul class="channel-list">' +
    '<li><a href="https://www.youtube.com/@ashraellen" target="_blank" rel="noopener noreferrer">YouTube</a> — ' + text.youtube + '</li>' +
    '<li><a href="https://www.instagram.com/kostyshev/" target="_blank" rel="noopener noreferrer">Instagram</a> — ' + text.instagram + '</li>' +
    '<li><a href="https://t.me/ashraellenchannel" target="_blank" rel="noopener noreferrer">Telegram</a> — ' + text.telegram + '</li>' +
    '</ul>';

  if (old) old.replaceWith(container);
  else box.appendChild(container);
})();

/* Ashraellen — localized project card titles */
(function () {
  'use strict';

  var path = window.location.pathname;
  var replacement = null;

  if (path.indexOf('/ru/research/projects/') !== -1) replacement = 'Церковь Святого Нытья';
  else if (path.indexOf('/uk/research/projects/') !== -1) replacement = 'Церква Святого Ниття';
  else if (path.indexOf('/be/research/projects/') !== -1) replacement = 'Царква Святога Ныцця';

  if (!replacement) return;

  document.querySelectorAll('.project-card h2').forEach(function (heading) {
    if (heading.textContent.trim() === 'Church of Saint Whine') heading.textContent = replacement;
  });
})();

/* Ashraellen — link Whinesis project cards */
(function () {
  'use strict';

  var match = window.location.pathname.match(/^\/([a-z]{2})\/research\/projects\/?/);
  if (!match) return;

  var lang = match[1];
  var labels = {
    ru:'Открыть →',
    uk:'Відкрити →',
    be:'Адкрыць →',
    pl:'Otwórz →',
    de:'Öffnen →',
    es:'Abrir →',
    fr:'Ouvrir →',
    pt:'Abrir →',
    en:'Open →'
  };

  var names = [
    'Книга Нытия',
    'Книга Ниття',
    'Кніга Ныцця',
    'The Book of Whinesis',
    'Księga Narzekania',
    'Das Buch des Jammerns',
    'El Libro de los Lamentos',
    'Le Livre des Lamentations',
    'O Livro das Lamúrias'
  ];

  document.querySelectorAll('.project-card').forEach(function (card) {
    var h = card.querySelector('h2');
    var actions = card.querySelector('.actions');
    if (!h || !actions) return;

    var title = h.textContent.trim();
    var isBookCard = names.some(function (name) {
      return title.indexOf(name) !== -1;
    });

    var hasBookStatus = card.textContent.indexOf('Страница готовится') !== -1 ||
      card.textContent.indexOf('Сторінка в підготовці') !== -1 ||
      card.textContent.indexOf('Страница в подготовке') !== -1 ||
      card.textContent.indexOf('Strona w przygotowaniu') !== -1 ||
      card.textContent.indexOf('Seite in Vorbereitung') !== -1 ||
      card.textContent.indexOf('Página en preparación') !== -1 ||
      card.textContent.indexOf('Page en préparation') !== -1 ||
      card.textContent.indexOf('Página em preparação') !== -1 ||
      card.textContent.indexOf('Page in preparation') !== -1;

    if (!isBookCard && !hasBookStatus) return;

    actions.innerHTML = '<a class="btn" href="/' + lang + '/books/the-book-of-whinesis/">' + (labels[lang] || 'Open →') + '</a>';
  });
})();

/* Ashraellen — tiny Belarusian text fixes */
(function () {
  'use strict';

  var path = window.location.pathname;

  if (path.indexOf('/be/public/posts/essay/') !== -1) {
    var description = document.querySelector('meta[name="description"]');
    if (description && description.content.indexOf('адзін пытанне') !== -1) {
      description.content = description.content.replace('адзін пытанне', 'адно пытанне');
    }
  }

  if (path.indexOf('/be/public/posts/essay/cycles/cycle-0001.html') !== -1) {
    document.querySelectorAll('p').forEach(function (node) {
      if (node.textContent.indexOf('у зместе цыклаў') !== -1) {
        node.textContent = node.textContent.replace('у зместе цыклаў', 'у змесце цыклаў');
      }
    });
  }
})();