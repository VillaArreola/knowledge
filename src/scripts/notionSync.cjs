#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const NOTION_ROOT = path.join(ROOT, 'src', 'data', 'notion');
const PAGES_ROOT = path.join(ROOT, 'src', 'pages');
const CONTENT_ROOT = path.join(ROOT, 'src', 'content', 'knowledge');

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');
const LIST_MODE = process.argv.includes('--list');
const CATEGORY_FILTER = process.argv.find((arg, idx) => {
  if (idx < 2) return false;
  return !arg.startsWith('-');
});

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function walkJsonFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJsonFiles(full, out);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.json')) {
      out.push(full);
    }
  }

  return out;
}

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.warn(`⚠️  JSON inválido: ${toPosix(path.relative(ROOT, filePath))} (${error.message})`);
    return null;
  }
}

function cleanLine(input) {
  return String(input || '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function markdownToSummary(markdown) {
  const raw = String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return raw.slice(0, 160).trim();
}

function getImportPath(fromFile, toFile) {
  const rel = path.relative(path.dirname(fromFile), toFile);
  return toPosix(rel.startsWith('.') ? rel : `./${rel}`);
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function buildAstro({ title, description, pageFile, notionJsonPath }) {
  const layoutPath = getImportPath(pageFile, path.join(ROOT, 'src', 'layouts', 'WikiLayout.astro'));
  const notionImportPath = getImportPath(pageFile, notionJsonPath);

  return `---\nimport WikiLayout from '${layoutPath}';\nimport notionData from '${notionImportPath}';\nimport { marked } from 'marked';\n\nconst body = (notionData.markdownBody || '').trim();\nconst hasBody = body.length > 0;\n\nconst metadata = notionData.metadata || {};\nconst notionUrl = metadata.notionUrl || '';\nconst tags = Array.isArray(metadata.tags) ? metadata.tags.filter(Boolean) : [];\nconst fallbackLines = [\n  '## Contenido pendiente',\n  '',\n  'Esta entrada existe en el indice, pero la pagina de Notion aun no tiene bloques de contenido para convertir a Markdown.',\n  '',\n  metadata.description ? '**Descripcion:** ' + metadata.description : '',\n  tags.length ? '**Tags:** ' + tags.join(', ') : '',\n  notionUrl ? '[Abrir en Notion](' + notionUrl + ')' : '',\n].filter(Boolean);\n\nconst markdownHtml = hasBody\n  ? marked(body)\n  : marked(fallbackLines.join('\\n'));\n---\n\n<WikiLayout title="${title}" description="${description}">\n  <div class="prose prose-slate dark:prose-invert max-w-none">\n    <Fragment set:html={markdownHtml} />\n  </div>\n</WikiLayout>\n`;
}

function buildMeta({ name, slug, icon, description, tags, order }) {
  const tagList = Array.isArray(tags) ? tags.filter(Boolean).join(',') : '';
  const lines = [
    `title=${cleanLine(name)}`,
    `slug=${cleanLine(slug)}`,
    `icon=${cleanLine(icon || '📄')}`,
    'status=completed',
    `order=${Number.isFinite(order) ? order : 1}`,
    `description=${cleanLine(description)}`,
  ];

  if (tagList) lines.push(`tags=${cleanLine(tagList)}`);
  return `${lines.join('\n')}\n`;
}

function shouldSkip(pagePath, legacyMdPath) {
  if (FORCE) return false;
  if (fs.existsSync(pagePath)) return true;
  if (fs.existsSync(legacyMdPath)) return true;
  return false;
}

function main() {
  console.log('🚀 notion-sync (CLI)');

  if (!fs.existsSync(NOTION_ROOT)) {
    console.log('⚠️  No existe src/data/notion. Ejecuta: npm run notion-pull');
    process.exit(1);
  }

  const allJsonFiles = walkJsonFiles(NOTION_ROOT)
    .filter((filePath) => !filePath.endsWith(path.join('data', 'notion', 'index.json')))
    .sort();

  if (allJsonFiles.length === 0) {
    console.log('⚠️  No hay archivos JSON en src/data/notion. Ejecuta: npm run notion-pull');
    process.exit(1);
  }

  const files = allJsonFiles.filter((filePath) => {
    if (!CATEGORY_FILTER) return true;
    const relative = toPosix(path.relative(NOTION_ROOT, filePath));
    return relative.startsWith(`${CATEGORY_FILTER}/`);
  });

  if (files.length === 0) {
    console.log(`⚠️  No se encontraron archivos para la categoría: ${CATEGORY_FILTER}`);
    process.exit(1);
  }

  let processed = 0;
  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const jsonPath of files) {
    processed += 1;

    const data = safeReadJson(jsonPath);
    if (!data || !data.metadata) {
      errors += 1;
      continue;
    }

    const metadata = data.metadata;
    const category = cleanLine(metadata.category);
    const section = cleanLine(metadata.section);
    const slug = cleanLine(metadata.slug);

    if (!category || !section || !slug) {
      console.warn(`⚠️  Metadata incompleta en ${toPosix(path.relative(ROOT, jsonPath))}`);
      errors += 1;
      continue;
    }

    const pagePath = path.join(PAGES_ROOT, category, section, `${slug}.astro`);
    const metaPath = path.join(PAGES_ROOT, category, section, `${slug}.meta`);
    const legacyMdPath = path.join(CONTENT_ROOT, category, section, `${slug}.md`);

    if (shouldSkip(pagePath, legacyMdPath)) {
      skipped += 1;
      if (LIST_MODE) {
        console.log(`⏭️  skip ${toPosix(path.relative(ROOT, pagePath))}`);
      }
      continue;
    }

    const icon = cleanLine(metadata.icon || '📄');
    const name = cleanLine(metadata.name || slug);
    const title = `${icon} ${name}`.trim();
    const summary = cleanLine(metadata.description) || markdownToSummary(data.markdownBody) || `Contenido sobre ${name}`;
    const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
    const order = Number.isFinite(metadata.order) ? metadata.order : (parseInt(metadata.order, 10) || 1);

    const astroContent = buildAstro({
      title,
      description: summary,
      pageFile: pagePath,
      notionJsonPath: jsonPath,
    });
    const metaContent = buildMeta({
      name,
      slug,
      icon,
      description: summary,
      tags,
      order,
    });

    if (!DRY_RUN) {
      ensureDir(pagePath);
      fs.writeFileSync(pagePath, astroContent, 'utf-8');
      fs.writeFileSync(metaPath, metaContent, 'utf-8');
    }

    generated += 1;
    console.log(`✅ ${DRY_RUN ? '[dry-run] ' : ''}generado ${toPosix(path.relative(ROOT, pagePath))}`);
  }

  console.log('\n📊 Resumen notion-sync');
  console.log(`- Archivos JSON revisados: ${processed}`);
  console.log(`- Páginas generadas: ${generated}`);
  console.log(`- Páginas saltadas: ${skipped}`);
  console.log(`- Errores: ${errors}`);

  if (DRY_RUN) {
    console.log('ℹ️  Modo dry-run: no se escribieron archivos');
  }

  if (errors > 0) {
    process.exit(1);
  }
}

main();
