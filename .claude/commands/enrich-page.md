# `/enrich-page` — Dual-Mode Interactive Page Generator

Convierte una página existente (generada por `notion-sync`) en una página dual-mode con:
- `data-view="markdown"` — la vista documental existente (sin cambios)
- `data-view="enriched"` — vista interactiva de diseño libre: cards, timelines, tablas, diagramas, stats, o lo que mejor se adapte al contenido

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

1. **Aspectos clave** — "¿Cuáles son los 3–5 aspectos clave de este tema que quieres destacar en la vista enriquecida? (lista separada por comas)"
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

      <!-- Page header (frosted glass) — OBLIGATORIO -->
      <div class="ep-header">
        <h1>{pageIcon} {pageName}</h1>
        <p>{pageDesc}</p>
      </div>

      <!--
        ╔══════════════════════════════════════════════════════╗
        ║  ZONA DE DISEÑO LIBRE — Elige la estructura óptima   ║
        ║  para ESTE contenido específico. No copies el mismo  ║
        ║  layout en todas las páginas.                        ║
        ╚══════════════════════════════════════════════════════╝

        El contenido dentro de este <div data-view="enriched"> es zona de diseño libre.
        Elige el formato que mejor comunique ESTE tema específico.
        No uses la misma estructura en todas las páginas.

        PALETA DE LAYOUTS POSIBLES (no exhaustiva, solo inspiración):

        - Cards             → conceptos paralelos/equivalentes (principios CIA, capas OSI, PKI)
        - Timeline/stepper  → procesos secuenciales (handshake TLS, ciclo de vida, historia)
        - Tabla comparativa → comparar algoritmos, protocolos, tecnologías lado a lado
        - Stat/badge counters → datos numéricos clave (puertos, bits de clave, versiones)
        - Diagrama ASCII/flow → arquitecturas o flujos de datos (con <pre> estilizado)
        - Accordion/details → contenido denso con muchas secciones colapsables
        - Código con pestañas → ejemplos multi-lenguaje o configuraciones
        - Mapa conceptual visual → jerarquía con listas anidadas estilizadas
        - Texto enriquecido puro → si el contenido es narrativo y las cards no añaden valor

        RESTRICCIONES QUE SÍ APLICAN:
        - El .ep-header de arriba es el único elemento fijo/obligatorio
        - Usar prefijo .ep-* para TODOS los estilos del enriched view
        - No dejar placeholders — contenido real derivado del markdownBody
        - Funcionar en dark mode (background var(--color-surface, #1e293b))
        - Ser responsive (mobile-first, colapsar a 1 columna en max-width: 640px)
        - El quiz (si se pidió) siempre va al final
      -->

      [DISEÑA AQUÍ LIBREMENTE BASÁNDOTE EN EL CONTENIDO]

      <!-- Optional: custom interactive JS tool -->
      <!-- Add here if the user requested a simulator, calculator, cipher, etc. -->

      <!-- Quiz — siempre al final si se solicitó -->
      {quizData && <Quiz questions={quizData.questions} title={quizData.title} />}

    </div>
  </div>

</WikiLayout>

<style>
  /* ── Enriched Page Styles (.ep-*) ── */
  .ep-page { padding: 2rem 0; }

  .ep-header {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-top: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 1rem;
    padding: 2.5rem 2rem;
    margin-bottom: 2rem;
    color: white;
    text-align: center;
  }
  .ep-header h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; letter-spacing: -0.02em; }
  .ep-header p { font-size: 1rem; opacity: 0.6; margin: 0; }

  /*
   * Agrega aquí SOLO los estilos necesarios para el layout elegido.
   * Usa prefijo .ep-* para todos los estilos del enriched view.
   *
   * Estilos base comunes (puedes usar estos como punto de partida):
   *
   * .ep-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
   * .ep-card { background: var(--color-surface, #1e293b); border-radius: 0.75rem; padding: 1.5rem; border-left: 4px solid transparent; }
   * .ep-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
   * .ep-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
   * .ep-table th { background: rgba(255,255,255,0.08); padding: 0.75rem 1rem; text-align: left; }
   * .ep-table td { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
   * .ep-timeline { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; }
   * .ep-step { display: flex; gap: 1rem; align-items: flex-start; }
   * .ep-step-num { width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 700; }
   * .ep-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
   * .ep-stat { background: var(--color-surface, #1e293b); border-radius: 0.75rem; padding: 1.25rem; text-align: center; }
   * .ep-stat-value { font-size: 2rem; font-weight: 700; }
   * .ep-accordion summary { cursor: pointer; padding: 0.75rem 1rem; font-weight: 600; list-style: none; }
   *
   * Responsive mínimo requerido:
   */

  @media (max-width: 640px) {
    .ep-header { padding: 1.5rem 1rem; }
    .ep-header h1 { font-size: 1.5rem; }
    /* Agrega overrides responsive para el layout elegido */
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
- **Elige el layout que mejor comunique el contenido.** Cards solo si los conceptos son paralelos. Si el contenido es un proceso/secuencia, usa timeline. Si el contenido es comparativo, usa tabla. Si es narrativo, usa texto enriquecido estructurado.
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
