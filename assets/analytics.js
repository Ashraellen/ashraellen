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

  if (path.indexOf('/ru/research/projects/') !== -1) {
    replacement = 'Церковь Святого Нытья';
  } else if (path.indexOf('/uk/research/projects/') !== -1) {
    replacement = 'Церква Святого Ниття';
  } else if (path.indexOf('/be/research/projects/') !== -1) {
    replacement = 'Царква Святога Ныцця';
  }

  if (!replacement) return;

  document.querySelectorAll('.project-card h2').forEach(function (heading) {
    if (heading.textContent.trim() === 'Church of Saint Whine') {
      heading.textContent = replacement;
    }
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