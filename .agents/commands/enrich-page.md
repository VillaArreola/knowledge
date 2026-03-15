# `/enrich-page` — Dual-Mode Interactive Page Generator

Convierte una página existente (generada por `notion-sync`) en una página dual-mode con:
- `data-view="markdown"` — la vista documental existente (sin cambios)
- `data-view="enriched"` — vista interactiva con concept cards, quiz y elementos JS

**Argumento:** ruta relativa de la página, con o sin barra inicial.
Ejemplos: `datacenters/fundamentos/Datos` · `/ciberseguridad/fundamentos/cia`

---

## Paso 1 — Parsear argumento

Extrae `[cat]`, `[sec]`, `[slug]` del argumento (ignora barra inicial si existe).

Rutas derivadas:
- Notion JSON: `src/data/notion/[cat]/[sec]/[slug].json`
- Página actual: `src/pages/[cat]/[sec]/[slug].astro`
- Quiz (si aplica): `src/data/quiz/[slug].json`

Si el JSON o la página no existen, muestra error y detente.

---

## Paso 2 — Leer fuente

Lee `src/data/notion/[cat]/[sec]/[slug].json` → obtén `metadata` y `markdownBody`.
Lee `src/pages/[cat]/[sec]/[slug].astro` → guarda el bloque frontmatter y la sección `data-view="markdown"` (o el `doc-page` actual) para copiarla verbatim en el nuevo archivo.

---

## Paso 3 — Hacer preguntas al usuario

Usa `AskUserQuestion` para las siguientes preguntas (máximo 4 en una sola llamada):

1. **Conceptos principales** — "¿Cuáles son los 3–5 conceptos clave que quieres destacar como cards interactivas? (lista separada por comas)"
2. **Quiz** — "¿Incluir quiz? Si sí, ¿cuántas preguntas (3–10)? ¿O lo genero yo desde el contenido? (responde: no / 5 / auto)"
3. **Elemento interactivo** — "¿Hay algún elemento interactivo específico? (simulador, calculadora, diagrama, cifrador, ejercicio, ninguno)"
4. **Color theme** — Opciones: `seguridad (azul/púrpura)` · `redes (verde/azul)` · `programación (naranja/rosa)` · `datos (púrpura/rosa)` · `custom (describe)`

No generes nada hasta recibir las respuestas.

---

## Paso 4 — Generar archivos

### 4a — Quiz JSON (si se solicitó)

Escribe `src/data/quiz/[slug].json`:

```json
{
  "title": "Quiz: [nombre del tema]",
  "questions": [
    {
      "question": "Pregunta clara y específica sobre el tema",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 0,
      "explanation": "Explicación concisa de por qué es correcta"
    }
  ]
}
```

Genera las preguntas desde el `markdownBody` del JSON de Notion. Asegúrate de que sean preguntas reales (no placeholders) basadas en el contenido actual.

### 4b — Página dual-mode

Escribe `src/pages/[cat]/[sec]/[slug].astro` con esta estructura:

```astro
---
import WikiLayout from '[relative path to layouts/WikiLayout.astro]';
import notionData from '[relative path to notion JSON]';
import { marked } from 'marked';
[import Quiz from '[relative path to components/Quiz.astro]';]  // solo si hay quiz
[import quizData from '[relative path to src/data/quiz/[slug].json]';]  // solo si hay quiz

const body = (notionData.markdownBody || '').trim();
const hasBody = body.length > 0;

const metadata = notionData.metadata || {};
const notionUrl = metadata.notionUrl || '';
const pageIcon = metadata.icon || '📄';
const pageName = metadata.name || '';
const pageDesc = metadata.description || '';
const tags = Array.isArray(metadata.tags) ? metadata.tags.filter(Boolean) : [];
const category = metadata.category || '';
const section = metadata.section || '';
const rawCerts = typeof metadata.certifications === 'string' ? metadata.certifications : '';
const certCodes = rawCerts.split(',').map(c => c.split(':')[0].trim()).filter(Boolean);

const fallbackLines = [
  '## Contenido pendiente',
  '',
  metadata.description ? '**Descripcion:** ' + metadata.description : '',
  tags.length ? '**Tags:** ' + tags.join(', ') : '',
  notionUrl ? '[Abrir en Notion](' + notionUrl + ')' : '',
].filter(Boolean);

const markdownHtml = hasBody
  ? marked(body)
  : marked(fallbackLines.join('\n'));
---

<WikiLayout title="[icon] [name]" description="[desc]" hasDualMode={true}>

  <!-- ── MARKDOWN VIEW ─────────────────────────────────── -->
  <div data-view="markdown">
    <div class="doc-page">
      <header class="doc-header">
        {(category || section) && (
          <div class="doc-breadcrumb">{category}{section ? ` / ${section}` : ''}</div>
        )}
        <h1 class="doc-title">{pageIcon} {pageName}</h1>
        {pageDesc && <p class="doc-description">{pageDesc}</p>}
        {(tags.length > 0 || certCodes.length > 0) && (
          <div class="doc-meta-row">
            {tags.map((tag) => <span class="doc-tag">{tag}</span>)}
            {certCodes.map((code) => <span class="doc-cert">{code}</span>)}
          </div>
        )}
      </header>
      <div class="doc-content">
        <Fragment set:html={markdownHtml} />
      </div>
    </div>
  </div>

  <!-- ── ENRICHED VIEW ─────────────────────────────────── -->
  <div data-view="enriched">
    <div class="ep-page">

      <!-- Gradient header -->
      <div class="ep-header">
        <h1>{pageIcon} {pageName}</h1>
        <p>{pageDesc}</p>
      </div>

      <!-- Concept cards grid -->
      <div class="ep-grid">
        <div class="ep-card ep-card--primary">
          <h3><span class="ep-icon">[EMOJI_1]</span>[CONCEPTO_1]</h3>
          <p>[DESCRIPCION_1]</p>
          <div class="ep-items">
            <div class="ep-item">[SUBCONCEPTO_1A]</div>
            <div class="ep-item">[SUBCONCEPTO_1B]</div>
          </div>
        </div>
        <div class="ep-card ep-card--secondary">
          <h3><span class="ep-icon">[EMOJI_2]</span>[CONCEPTO_2]</h3>
          <p>[DESCRIPCION_2]</p>
          <div class="ep-items">
            <div class="ep-item">[SUBCONCEPTO_2A]</div>
            <div class="ep-item">[SUBCONCEPTO_2B]</div>
          </div>
        </div>
        <div class="ep-card ep-card--tertiary">
          <h3><span class="ep-icon">[EMOJI_3]</span>[CONCEPTO_3]</h3>
          <p>[DESCRIPCION_3]</p>
          <div class="ep-items">
            <div class="ep-item">[SUBCONCEPTO_3A]</div>
            <div class="ep-item">[SUBCONCEPTO_3B]</div>
          </div>
        </div>
      </div>

      <!-- Optional: practical example block -->
      <div class="ep-example">
        <h3>💼 [TITULO_EJEMPLO]</h3>
        <p>[DESCRIPCION_EJEMPLO]</p>
        <!-- code block, table, diagram, etc. if relevant -->
      </div>


      <!-- Optional: custom interactive JS tool -->
      <!-- Add here if the user requested a simulator, calculator, cipher, etc. -->

      <!-- Quiz -->
      {quizData && <Quiz questions={quizData.questions} title={quizData.title} />}

    </div>
  </div>

</WikiLayout>

<style>
  /* ── Enriched Page Styles (.ep-*) ── */
  .ep-page { padding: 2rem 0; }

  .ep-header {
    background: linear-gradient(135deg, [COLOR_1] 0%, [COLOR_2] 100%);
    border-radius: 1rem;
    padding: 2.5rem 2rem;
    margin-bottom: 2rem;
    color: white;
    text-align: center;
  }
  .ep-header h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; }
  .ep-header p { font-size: 1rem; opacity: 0.9; margin: 0; }

  .ep-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .ep-card {
    background: var(--color-surface, #1e293b);
    border-radius: 0.75rem;
    padding: 1.5rem;
    border-left: 4px solid transparent;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .ep-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .ep-card h3 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.75rem; font-size: 1.1rem; }
  .ep-card p { font-size: 0.9rem; opacity: 0.8; margin: 0 0 1rem; }
  .ep-icon { font-size: 1.3rem; }

  .ep-card--primary   { border-left-color: [CARD_COLOR_1]; }
  .ep-card--secondary { border-left-color: [CARD_COLOR_2]; }
  .ep-card--tertiary  { border-left-color: [CARD_COLOR_3]; }

  .ep-items { display: flex; flex-direction: column; gap: 0.4rem; }
  .ep-item {
    font-size: 0.85rem;
    padding: 0.35rem 0.75rem;
    background: rgba(255,255,255,0.06);
    border-radius: 0.4rem;
    cursor: default;
  }

  .ep-example {
    background: var(--color-surface, #1e293b);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .ep-example h3 { margin: 0 0 0.75rem; font-size: 1.1rem; }

  .ep-mnemonic {
    background: rgba(255,255,255,0.05);
    border-radius: 0.75rem;
    padding: 1rem 1.5rem;
    margin-bottom: 2rem;
    font-size: 0.95rem;
  }

  @media (max-width: 640px) {
    .ep-header { padding: 1.5rem 1rem; }
    .ep-header h1 { font-size: 1.5rem; }
    .ep-grid { grid-template-columns: 1fr; }
  }
</style>

<script>
  /* Optional: interactive JS tool code goes here */
</script>
```

---

## Paso 5 — Marcar el JSON como enriched

Actualiza `src/data/notion/[cat]/[sec]/[slug].json` → cambia (o añade) `metadata.mode` a `"enriched"`:

```json
{
  "metadata": {
    ...
    "mode": "enriched"
  },
  ...
}
```

Esto previene que `npm run notion-sync --force` sobreescriba la página enriquecida.

---

## Reglas importantes

- **No dejes placeholders** en el archivo final — genera contenido real basado en el `markdownBody`.
- Cuando el contenido ya tiene secciones claras (##, tablas, listas), úsalas para derivar las cards.
- Si el usuario no pidió elemento interactivo (`ninguno`), elimina el bloque `<script>` vacío.
- Si el usuario no pidió quiz, elimina todos los imports y referencias a `quizData`.
- Si no hay ejemplo práctico obvio en el contenido, omite el bloque `.ep-example`.
- Los **colores** deben ser coherentes con el tema elegido. Usa las paletas de GUIA_PLANTILLA.md:
  - seguridad: `#667eea` / `#764ba2` (cards: `#667eea`, `#f093fb`, `#4fc3f7`)
  - redes: `#00b09b` / `#96c93d` (cards: `#00b09b`, `#48bb78`, `#4299e1`)
  - programación: `#ff7e5f` / `#feb47b` (cards: `#ff7e5f`, `#f6d365`, `#fda085`)
  - datos: `#8360c3` / `#2ebf91` (cards: `#8360c3`, `#a18cd1`, `#2ebf91`)
- Los **relative import paths** deben calcularse correctamente según la profundidad del archivo.
- Respeta el prefijo `.ep-*` para todos los estilos enriched (no usar `.doc-*` ni clases globales).

---

## Verificación post-generación

Al terminar, muestra al usuario:
1. Archivos escritos (lista)
2. Comando para revisar: `npm run dev` → navegar a `/[cat]/[sec]/[slug]`
3. Recordar correr `npm run generate` si el `.meta` cambió (no debería cambiar en este flujo)
4. Para publicar: `npm run deploy`
