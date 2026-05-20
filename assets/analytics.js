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