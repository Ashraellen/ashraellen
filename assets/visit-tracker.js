/*
  Ashraellen — lightweight visit tracker
  --------------------------------------------------
  This script sends anonymous page-view data to a Google Apps Script endpoint.
  It is inactive until window.ASHRAELLEN_TRACKER_ENDPOINT is set on the page.

  Recommended fields collected:
  - page path
  - page title
  - referrer
  - browser language
  - viewport size
  - timestamp

  No names, emails, cookies, localStorage IDs, or personal identifiers are collected here.
*/

(function () {
  'use strict';

  var endpoint = window.ASHRAELLEN_TRACKER_ENDPOINT;

  if (!endpoint || typeof endpoint !== 'string' || endpoint.indexOf('https://') !== 0) {
    return;
  }

  var payload = {
    site: 'ashraellen.com',
    page: window.location.pathname,
    url: window.location.href,
    title: document.title || '',
    referrer: document.referrer || '',
    language: navigator.language || '',
    viewport: (window.innerWidth || 0) + 'x' + (window.innerHeight || 0),
    timestamp: new Date().toISOString()
  };

  try {
    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=UTF-8' });
      navigator.sendBeacon(endpoint, blob);
      return;
    }

    fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function () {});
  } catch (e) {
    // Silent by design. Tracking must never break the site.
  }
})();
