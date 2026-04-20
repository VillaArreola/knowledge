const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const SITE = 'https://kb.villaarreola.com';

function decodeXmlEntities(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function normalizeUrl(url) {
  if (url.endsWith('/') && url !== `${SITE}/`) {
    return url.slice(0, -1);
  }
  return url;
}

function getExpectedUrls() {
  const searchIndexPath = path.join(__dirname, '../../public/search-index.json');
  if (!fs.existsSync(searchIndexPath)) {
    throw new Error('No existe public/search-index.json. Ejecuta npm run generate primero.');
  }

  const siteConfigPath = path.join(__dirname, '../data/site-config.json');
  const siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'));
  const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf-8'));

  const hubUrls = [
    `${SITE}/`,
    ...(siteConfig.categories || []).map(category => `${SITE}/${category.slug}`),
  ].map(normalizeUrl);

  const contentUrls = (searchIndex.pages || [])
    .map(page => normalizeUrl(`${SITE}${page.url}`));

  return new Set([...hubUrls, ...contentUrls]);
}

function extractLocUrls(xml) {
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  return new Set(
    matches.map(match => {
      const url = decodeXmlEntities(match.replace('<loc>', '').replace('</loc>', ''));
      return normalizeUrl(url.trim());
    })
  );
}

async function getSitemapUrls() {
  const sitemapModulePath = pathToFileURL(path.join(__dirname, '../pages/sitemap.xml.js')).href;
  const { GET } = await import(sitemapModulePath);
  const response = await GET();
  const xml = await response.text();

  return extractLocUrls(xml);
}

async function main() {
  const expected = getExpectedUrls();
  const actual = await getSitemapUrls();

  const deadUrls = [...actual].filter(url => !expected.has(url));
  const missingUrls = [...expected].filter(url => !actual.has(url));

  if (deadUrls.length > 0) {
    console.error('\n❌ Sitemap contiene rutas muertas (bloquea deploy):');
    deadUrls.sort().forEach(url => console.error(` - ${url}`));
    process.exit(1);
  }

  if (missingUrls.length > 0) {
    console.warn('\n⚠️  Faltan rutas esperadas en sitemap (warning):');
    missingUrls.sort().forEach(url => console.warn(` - ${url}`));
  }

  console.log(`✅ Sitemap validado. URLs declaradas: ${actual.size}.`);
}

main().catch(error => {
  console.error('❌ Error validando sitemap:', error.message);
  process.exit(1);
});
