/* Ashraellen — compact privacy page menu */
(function () {
  'use strict';

  if (!document.querySelector('.privacy-page')) return;

  var labels = {
    en: { entry: 'Entry', dossier: 'Dossier' },
    ru: { entry: 'Вход', dossier: 'Досье' },
    be: { entry: 'Уваход', dossier: 'Дасье' },
    pl: { entry: 'Wejście', dossier: 'Dossier' },
    de: { entry: 'Eingang', dossier: 'Dossier' },
    fr: { entry: 'Entrée', dossier: 'Dossier' },
    es: { entry: 'Entrada', dossier: 'Dossier' },
    pt: { entry: 'Entrada', dossier: 'Dossiê' },
    uk: { entry: 'Вхід', dossier: 'Досьє' }
  };

  var parts = window.location.pathname.split('/').filter(Boolean);
  var isGitHub = window.location.hostname.endsWith('github.io');
  var langIndex = isGitHub ? 1 : 0;
  var lang = parts[langIndex] || document.documentElement.lang || 'en';
  lang = String(lang).slice(0, 2).toLowerCase();
  if (!labels[lang]) lang = 'en';

  var base = window.__BASE__ || (isGitHub && parts[0] ? '/' + parts[0] + '/' : '/');
  var menu = document.querySelector('.site-header .menu');
  if (!menu) return;

  menu.innerHTML = '<a href="' + base + lang + '/">' + labels[lang].entry + '</a> | <a href="' + base + lang + '/professional/">' + labels[lang].dossier + '</a>';
})();
