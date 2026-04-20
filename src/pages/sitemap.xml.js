import siteConfig from '../data/site-config.json' with { type: 'json' };
import searchIndexData from '../data/search-index.json' with { type: 'json' };

const SITE = 'https://kb.villaarreola.com';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeUrl(url) {
  if (url.endsWith('/') && url !== `${SITE}/`) {
    return url.slice(0, -1);
  }
  return url;
}

function loadCategoryHubs() {
  const categoryPages = (siteConfig.categories || []).map(category => ({
    url: normalizeUrl(`${SITE}/${category.slug}`),
    priority: 0.9,
    changefreq: 'weekly',
  }));

  return [
    { url: `${SITE}/`, priority: 1.0, changefreq: 'weekly' },
    ...categoryPages,
  ];
}

function loadContentPages() {
  const pages = Array.isArray(searchIndexData.pages) ? searchIndexData.pages : [];

  return pages.map(page => ({
    url: normalizeUrl(`${SITE}${page.url}`),
    priority: 0.7,
    changefreq: 'monthly',
  }));
}

export async function GET() {
  const allPages = [...loadCategoryHubs(), ...loadContentPages()];

  const uniqueByUrl = Array.from(
    new Map(allPages.map(page => [page.url, page])).values()
  );

  const lastmod = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueByUrl
  .map(
    page => `  <url>
    <loc>${escapeXml(page.url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
