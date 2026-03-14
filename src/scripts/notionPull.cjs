#!/usr/bin/env node
'use strict';

require('dotenv').config();
const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');
const fs = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────────

const NOTION_API_KEY = process.env.NOTION_API_KEY?.trim();
if (!NOTION_API_KEY) {
  console.error('❌  NOTION_API_KEY no encontrada en .env');
  process.exit(1);
}
console.log(`🔑  Token: ${NOTION_API_KEY.substring(0, 10)}... (len=${NOTION_API_KEY.length})`);
if (!NOTION_API_KEY.startsWith('secret_') && !NOTION_API_KEY.startsWith('ntn_')) {
  console.error('❌  El token debe empezar con "secret_" (integración interna) o "ntn_" (OAuth)');
  process.exit(1);
}

const SITE_CONFIG_PATH = path.join(process.cwd(), 'src/data/site-config.json');
let siteConfig = JSON.parse(fs.readFileSync(SITE_CONFIG_PATH, 'utf-8'));

const NOTION_DB_ID = siteConfig.notionDbId?.trim();
if (!NOTION_DB_ID) {
  console.error('❌  notionDbId no encontrada en src/data/site-config.json');
  process.exit(1);
}

const FORCE = process.argv.includes('--force');
const LIST_MODE = process.argv.includes('--list');
const CLEANUP_MODE = process.argv.includes('--cleanup');
const AUTO_CLEANUP = !process.argv.includes('--no-cleanup');
const CATEGORY_FILTER = process.argv.find(a => !a.startsWith('-') && a !== process.argv[0] && a !== process.argv[1]);

// ─── Notion clients ─────────────────────────────────────────────────────────

const notion = new Client({ auth: NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

// ─── Helpers ────────────────────────────────────────────────────────────────

function toKebabCase(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function toTitleCase(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function extractText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(t => t.plain_text || '').join('');
}

function extractTitleFromProps(props) {
  const direct =
    extractText(props['Name']?.title) ||
    extractText(props['name']?.title) ||
    extractText(props['Title']?.title) ||
    extractText(props['title']?.title);

  if (direct) return direct;

  for (const value of Object.values(props || {})) {
    if (value?.type === 'title' && Array.isArray(value.title)) {
      const inferred = extractText(value.title);
      if (inferred) return inferred;
    }
  }

  return 'Sin título';
}

function extractSelect(prop) {
  return prop?.select?.name || '';
}

function extractMultiSelect(prop) {
  if (!prop?.multi_select) return [];
  return prop.multi_select.map(s => s.name);
}

function extractNumber(prop) {
  return prop?.number ?? null;
}

function extractIcon(page) {
  if (!page.icon) return '📄';
  if (page.icon.type === 'emoji') return page.icon.emoji;
  return '📄';
}

function buildOutputPath(category, section, slug) {
  return path.join(
    process.cwd(),
    'src', 'data', 'notion',
    category, section, `${slug}.json`
  );
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

// ─── Site-config auto-update (DB mode) ───────────────────────────────────────

const DEFAULT_COLORS = {
  ciberseguridad: { headerGradient: 'from-indigo-600 to-purple-700', cardAccent: 'border-indigo-400', badge: 'indigo' },
  redes:          { headerGradient: 'from-blue-600 to-cyan-700',     cardAccent: 'border-blue-400',   badge: 'blue' },
  sistemas:       { headerGradient: 'from-slate-600 to-gray-700',    cardAccent: 'border-slate-400',  badge: 'slate' },
  programacion:   { headerGradient: 'from-green-600 to-teal-700',    cardAccent: 'border-green-400',  badge: 'green' },
  cloud:          { headerGradient: 'from-orange-500 to-amber-600',  cardAccent: 'border-orange-400', badge: 'orange' },
};

const DEFAULT_ICONS = {
  ciberseguridad: '🔒', redes: '🌐', sistemas: '⚙️', programacion: '💻', cloud: '☁️',
};

// Returns true if siteConfig was modified
function ensureInConfig(categorySlug, sectionSlug) {
  let changed = false;

  let cat = siteConfig.categories.find(c => c.slug === categorySlug);
  if (!cat) {
    cat = {
      slug: categorySlug,
      name: toTitleCase(categorySlug),
      icon: DEFAULT_ICONS[categorySlug] || '📁',
      defaultSection: sectionSlug || null,
      color: DEFAULT_COLORS[categorySlug] || { headerGradient: 'from-gray-600 to-gray-700', cardAccent: 'border-gray-400', badge: 'gray' },
      sections: [],
    };
    siteConfig.categories.push(cat);
    console.log(`   ✨  Auto-creando categoría en site-config: ${categorySlug}`);
    changed = true;
  }

  if (sectionSlug && !cat.sections.find(s => s.slug === sectionSlug)) {
    cat.sections.push({ slug: sectionSlug, name: toTitleCase(sectionSlug), icon: '📄', column: 2 });
    console.log(`   ✨  Auto-creando sección en site-config: ${categorySlug}/${sectionSlug}`);
    changed = true;
  }

  return changed;
}

function saveSiteConfig() {
  fs.writeFileSync(SITE_CONFIG_PATH, JSON.stringify(siteConfig, null, 2), 'utf-8');
  const publicPath = path.join(process.cwd(), 'public/site-config.json');
  if (fs.existsSync(path.dirname(publicPath))) {
    fs.writeFileSync(publicPath, JSON.stringify(siteConfig, null, 2), 'utf-8');
  }
  console.log('   💾  site-config.json actualizado');
}

// ─── Core query helper ────────────────────────────────────────────────────────

async function queryCollection(id, filter, cursor) {
  const common = {
    start_cursor: cursor,
    page_size: 100,
  };
  if (filter) common.filter = filter;

  if (notion.databases?.query) {
    return notion.databases.query({
      database_id: id,
      ...common,
    });
  }

  if (notion.dataSources?.query) {
    return notion.dataSources.query({
      data_source_id: id,
      ...common,
    });
  }

  throw new Error('El cliente de Notion no expone databases.query ni dataSources.query');
}

async function queryWithFilter(id, filter, cursor) {
  return queryCollection(id, filter, cursor);
}

// ─── Core logic — DB ─────────────────────────────────────────────────────────

async function fetchDatabasePages(dbId) {
  const results = [];
  let cursor;

  const statusFilter = { property: 'Status', status: { equals: 'Done' } };
  const selectFilter = { property: 'Status', select: { equals: 'Done' } };
  let activeFilter = statusFilter;

  do {
    let response;
    try {
      response = await queryWithFilter(dbId, activeFilter, cursor);
    } catch (err) {
      if (err.code === 'validation_error' && activeFilter === statusFilter) {
        activeFilter = selectFilter;
        response = await queryWithFilter(dbId, activeFilter, cursor);
      } else {
        throw err;
      }
    }
    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return results.map(page => {
    const props = page.properties;

    const name = extractTitleFromProps(props);
    const slug = extractText(props['slug']?.rich_text) || toKebabCase(name);
    // Categoría + Subcategoría → normalize to kebab-case slugs
    const category = toKebabCase(extractSelect(props['Categoría']) || extractSelect(props['Categoria']) || 'general');
    const rawSection = extractSelect(props['Subcategoría']) || extractSelect(props['Subcategoria']) || '';
    const section = rawSection ? toKebabCase(rawSection) : 'fundamentos';
    // icon: prefer the icon text property, fall back to page icon
    const icon = extractText(props['icon']?.rich_text) || extractIcon(page);
    const description = extractText(props['description']?.rich_text) || '';
    const tags = extractMultiSelect(props['tags']);
    const certifications = extractMultiSelect(props['certifications']).join(',');
    const order = extractNumber(props['order']) || 1;
    const mode = 'markdown'; // new DB has no Mode property; default to markdown

    return { pageId: page.id, pageUrl: page.url, name, slug, category, section, icon, description, tags, certifications, order, mode };
  });
}

async function fetchAllDatabasePages(dbId) {
  const results = [];
  let cursor;

  do {
    const response = await queryCollection(dbId, null, cursor);
    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return results.map(page => {
    const props = page.properties;
    const status = props['Status']?.status?.name || props['Status']?.select?.name || '';
    const name = extractTitleFromProps(props);
    const slug = extractText(props['slug']?.rich_text) || toKebabCase(name);
    const category = toKebabCase(extractSelect(props['Categoría']) || extractSelect(props['Categoria']) || 'general');
    const rawSection = extractSelect(props['Subcategoría']) || extractSelect(props['Subcategoria']) || '';
    const section = rawSection ? toKebabCase(rawSection) : 'fundamentos';
    return { status, slug, category, section };
  });
}

// ─── Fetch markdown ─────────────────────────────────────────────────────────

async function fetchMarkdown(pageId) {
  try {
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const { parent } = n2m.toMarkdownString(mdBlocks);
    return parent || '';
  } catch (err) {
    console.warn(`  ⚠️  No se pudo obtener markdown para ${pageId}: ${err.message}`);
    return '';
  }
}

// ─── Process ─────────────────────────────────────────────────────────────────

async function processAllFromDB() {
  console.log(`\n📂  DB: ${NOTION_DB_ID}`);
  const allPages = await fetchDatabasePages(NOTION_DB_ID);
  console.log(`   ${allPages.length} páginas Done encontradas`);

  // Auto-ensure all categories/sections exist in site-config
  let configChanged = false;
  for (const page of allPages) {
    if (ensureInConfig(page.category, page.section)) configChanged = true;
  }
  if (configChanged) saveSiteConfig();

  const pages = CATEGORY_FILTER ? allPages.filter(p => p.category === CATEGORY_FILTER) : allPages;

  let skipped = 0, saved = 0;

  for (const page of pages) {
    const { pageId, pageUrl, name, slug, category, section, icon, description, tags, certifications, order, mode } = page;
    const outPath = buildOutputPath(category, section, slug);

    if (!FORCE && fs.existsSync(outPath)) {
      console.log(`   ⏭  ${category}/${section}/${slug} (ya existe)`);
      skipped++;
      continue;
    }

    console.log(`   ⬇  ${category}/${section}/${slug} — obteniendo markdown...`);
    const markdownBody = await fetchMarkdown(pageId);
    if (!markdownBody.trim()) {
      console.warn(`   ⚠️  ${category}/${section}/${slug} sin contenido en bloques de Notion (markdownBody vacío)`);
    }

    const data = {
      metadata: { name, slug, category, section, icon, description, tags, certifications, order, mode, notionUrl: pageUrl },
      markdownBody,
    };

    ensureDir(outPath);
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`   ✅  Guardado: src/data/notion/${category}/${section}/${slug}.json`);
    saved++;
  }

  return { found: allPages.length, skipped, saved };
}

// ─── Cleanup logic ───────────────────────────────────────────────────────────

async function cleanupDB() {
  console.log(`\n🔍  Revisando DB: ${NOTION_DB_ID}`);
  const allPages = await fetchAllDatabasePages(NOTION_DB_ID);
  console.log(`   ${allPages.length} páginas totales encontradas`);

  let reviewed = 0, removed = 0;

  for (const page of allPages) {
    const { status, slug, category, section } = page;
    if (status === 'Done') continue;
    if (CATEGORY_FILTER && category !== CATEGORY_FILTER) continue;

    const notionJsonPath = buildOutputPath(category, section, slug);
    if (!fs.existsSync(notionJsonPath)) continue;

    reviewed++;
    console.log(`   🗑  ${category}/${section}/${slug} (status: "${status}") — eliminando archivos...`);
    fs.unlinkSync(notionJsonPath);
    console.log(`      ✔ src/data/notion/${category}/${section}/${slug}.json`);

    const base = path.join(process.cwd(), 'src', 'pages', category, section, slug);
    for (const ext of ['.astro', '.meta']) {
      const p = base + ext;
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log(`      ✔ src/pages/${category}/${section}/${slug}${ext}`);
        removed++;
      }
    }
  }

  return { reviewed, removed };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function listAccessible() {
  console.log('🔍  Databases accesibles para esta integración:\n');
  let cursor;
  let count = 0;
  do {
    const res = await notion.search({
      filter: { value: 'data_source', property: 'object' },
      start_cursor: cursor,
      page_size: 100,
    });
    for (const db of res.results) {
      const title = db.title?.[0]?.plain_text || '(sin título)';
      const id = db.id.replace(/-/g, '');
      console.log(`  📋  ${title}`);
      console.log(`      ID: ${id}`);
      console.log(`      URL: ${db.url}`);
      console.log();
      count++;
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  if (count === 0) console.log('  (ninguna database accesible — conecta la integración a las databases)');
  console.log(`Total: ${count} databases`);
}

async function main() {
  console.log('🚀  Notion Pull — Knowledge Base');
  console.log(`   Modo: DB (${NOTION_DB_ID})`);

  if (LIST_MODE) {
    await listAccessible();
    return;
  }

  if (CLEANUP_MODE) {
    console.log('   Modo --cleanup activado: eliminando páginas que ya no están Done');
    if (CATEGORY_FILTER) console.log(`   Filtrando por categoría: ${CATEGORY_FILTER}`);

    let totalReviewed = 0, totalRemoved = 0;

    const { reviewed, removed } = await cleanupDB();
    totalReviewed += reviewed;
    totalRemoved += removed;

    console.log('\n─────────────────────────────────────────');
    console.log(`📊  Resumen cleanup:`);
    console.log(`   Páginas en revisión detectadas: ${totalReviewed}`);
    console.log(`   Archivos eliminados: ${totalRemoved}`);
    console.log('\n💡  Ejecuta: npm run generate && npm run deploy');
    return;
  }

  if (FORCE) console.log('   Modo --force activado: sobreescribiendo archivos existentes');
  if (!AUTO_CLEANUP) console.log('   Modo --no-cleanup activado: no se eliminarán páginas fuera de Done');
  if (CATEGORY_FILTER) console.log(`   Filtrando por categoría: ${CATEGORY_FILTER}`);

  let totalFound = 0, totalSkipped = 0, totalSaved = 0;
  let totalReviewed = 0, totalRemoved = 0;

  const { found, skipped, saved } = await processAllFromDB();
  totalFound += found;
  totalSkipped += skipped;
  totalSaved += saved;

  if (AUTO_CLEANUP) {
    const { reviewed, removed } = await cleanupDB();
    totalReviewed += reviewed;
    totalRemoved += removed;
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`📊  Resumen:`);
  console.log(`   Total páginas Done: ${totalFound}`);
  console.log(`   Ya existían (saltadas): ${totalSkipped}`);
  console.log(`   Nuevas guardadas: ${totalSaved}`);
  if (AUTO_CLEANUP) {
    console.log(`   Fuera de Done revisadas: ${totalReviewed}`);
    console.log(`   Archivos eliminados cleanup: ${totalRemoved}`);
  }
  console.log('\n💡  Siguiente paso: /notion-sync en Claude Code');
}

main().catch(err => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
