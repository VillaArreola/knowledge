import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to directories and files
const categories = ['redes', 'cyber', 'programacion', 'sistemas'];
const basePath = path.join(__dirname, 'src', 'pages');
const categoryIndexPath = path.join(__dirname, 'src', 'components', 'hub-categorias.astro');
const searchIndexPath = path.join(__dirname, 'public', 'search-index.json');

// Function to get .astro files in a directo
// ry
function getAstroFiles(dir) {
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.astro'))
    .map(file => ({
      name: file.replace('.astro', ''),
      path: `/${path.relative(basePath, path.join(dir, file)).replace(/\\/g, '/')}`
    }));
}

// Update category index
function updateCategoryIndex(newTopics) {
  const categoryIndexContent = fs.readFileSync(categoryIndexPath, 'utf-8');
  const newCards = newTopics.map(topic => `
    <a href="${topic.path}" class="category-card">
      <h3>${topic.icon || '📄'} ${topic.title}</h3>
      <p>${topic.description}</p>
    </a>
  `).join('\n');

  const updatedContent = categoryIndexContent.replace('<!-- Add new topics here -->', `${newCards}\n<!-- Add new topics here -->`);
  fs.writeFileSync(categoryIndexPath, updatedContent, 'utf-8');
  console.log('Category index updated.');
}

// Update search index - Now uses the new structure
async function updateSearchIndex(newTopics) {
  console.log('🔄 Actualizando índices de búsqueda con nueva estructura...');
  
  // Importar y ejecutar el nuevo sistema de generación
  const { generateSearchSystem } = await import('./src/scripts/generateSearchSystem.cjs');
  generateSearchSystem();
  
  console.log('✅ Índices de búsqueda actualizados con nueva estructura.');
}

// Update redes.astro dynamic index
function updateRedesAstro(newTopics) {
  const redesAstroPath = path.join(basePath, 'redes.astro');
  let redesAstroContent = fs.readFileSync(redesAstroPath, 'utf-8');

  const newIndexContent = newTopics.map(topic => `
    <a href="${topic.path}" class="topic-link">
      <h3>${topic.icon || '📄'} ${topic.title}</h3>
      <p>${topic.description}</p>
    </a>
  `).join('\n');

  redesAstroContent = redesAstroContent.replace(
    /<div id="dynamic-index">[\s\S]*?<\/div>/,
    `<div id="dynamic-index">\n${newIndexContent}\n</div>`
  );

  fs.writeFileSync(redesAstroPath, redesAstroContent, 'utf-8');
  console.log('Redes.astro dynamic index updated.');
}

// Update sistemas.astro dynamic index
function updateSistemasAstro(newTopics) {
  const sistemasAstroPath = path.join(basePath, 'sistemas.astro');
  let sistemasAstroContent = fs.readFileSync(sistemasAstroPath, 'utf-8');

  const newIndexContent = newTopics.map(topic => `
    <a href="${topic.path}" class="topic-link">
      <h3>${topic.icon || '📄'} ${topic.title}</h3>
      <p>${topic.description}</p>
    </a>
  `).join('\n');

  sistemasAstroContent = sistemasAstroContent.replace(
    /<div id="dynamic-index">[\s\S]*?<\/div>/,
    `<div id="dynamic-index">\n${newIndexContent}\n</div>`
  );

  fs.writeFileSync(sistemasAstroPath, sistemasAstroContent, 'utf-8');
  console.log('Sistemas.astro dynamic index updated.');
}

// Main function
async function main() {
  const newTopics = [];

  categories.forEach(category => {
    const categoryPath = path.join(basePath, category);
    if (fs.existsSync(categoryPath)) {
      const astroFiles = getAstroFiles(categoryPath);
      astroFiles.forEach(file => {
        newTopics.push({
          title: file.name.replace(/-/g, ' ').toUpperCase(),
          description: `Learn about ${file.name.replace(/-/g, ' ')}`,
          path: file.path
        });
      });
    }
  });

  updateCategoryIndex(newTopics);
  await updateSearchIndex(newTopics);
  updateRedesAstro(newTopics.filter(topic => topic.path.startsWith('/redes')));
  updateSistemasAstro(newTopics.filter(topic => topic.path.startsWith('/sistemas')));
}

main();
