const fs = require('fs');
const https = require('https');

const HOST = 'www.ashraellen.com';
const SITE = `https://${HOST}`;
const INDEXNOW_HOST = 'api.indexnow.org';
const KEY = 'b2cda9f3e8714a6db926f48c7251ea65';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const SITEMAP = 'sitemap.xml';
const MAX_URLS = 10000;

function readSitemapUrls() {
  if (!fs.existsSync(SITEMAP)) {
    console.warn(`IndexNow: ${SITEMAP} not found. Skipping submission.`);
    return [];
  }

  const xml = fs.readFileSync(SITEMAP, 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(match => match[1].trim())
    .filter(url => url.startsWith(`${SITE}/`));

  return [...new Set(urls)].slice(0, MAX_URLS);
}

function postIndexNow(urlList) {
  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList
  });

  const options = {
    hostname: INDEXNOW_HOST,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 15000
  };

  return new Promise(resolve => {
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log(`IndexNow: submitted ${urlList.length} URL(s). Status ${res.statusCode}.`);
          resolve(true);
        } else {
          console.warn(`IndexNow: submission returned status ${res.statusCode}.`);
          if (body) console.warn(body.slice(0, 500));
          resolve(false);
        }
      });
    });

    req.on('timeout', () => {
      console.warn('IndexNow: request timed out. Skipping without failing deploy.');
      req.destroy();
      resolve(false);
    });

    req.on('error', error => {
      console.warn(`IndexNow: request failed: ${error.message}. Skipping without failing deploy.`);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

async function main() {
  const urls = readSitemapUrls();
  if (urls.length === 0) {
    console.log('IndexNow: no URLs to submit.');
    return;
  }

  await postIndexNow(urls);
}

main().catch(error => {
  console.warn(`IndexNow: unexpected error: ${error.message}. Skipping without failing deploy.`);
});
