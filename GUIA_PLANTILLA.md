# 📋 Guía para usar la Plantilla Astro

## 🎯 Propósito
Esta plantilla está diseñada para generar páginas educativas interactivas usando Astro. Está basada en la estructura exitosa del archivo CIA.astro y optimizada para que una IA pueda llenar el contenido fácilmente.

## 📂 Ubicación
`src/pages/plantilla.astro`

## 🔧 Instrucciones de Uso para IA

### 1. Configuración Inicial
```astro
---
import WikiLayout from '../layouts/WikiLayout.astro';
---

<WikiLayout title="[TITULO_PAGINA]" description="[DESCRIPCION_PAGINA]">
```

**Reemplazar:**
- `[TITULO_PAGINA]`: Título para la pestaña del navegador
- `[DESCRIPCION_PAGINA]`: Meta descripción para SEO

### 2. Header Principal
```html
<div class="header">
    <h1>🎯 [TITULO_PRINCIPAL]</h1>
    <p>[SUBTITULO_DESCRIPTIVO]</p>
</div>
```

**Reemplazar:**
- `[TITULO_PRINCIPAL]`: Título principal de la página
- `[SUBTITULO_DESCRIPTIVO]`: Descripción breve del tema

### 3. Cards de Conceptos (3 cards principales)

#### Card 1 - Concepto Principal
```html
<div class="card primary-card">
    <h3><span class="icon">[EMOJI]</span>[CONCEPTO_1]</h3>
    <p>[DESCRIPCION_CONCEPTO_1]</p>
```

#### Card 2 - Concepto Secundario
```html
<div class="card secondary-card">
    <h3><span class="icon">[EMOJI]</span>[CONCEPTO_2]</h3>
    <p>[DESCRIPCION_CONCEPTO_2]</p>
```

#### Card 3 - Aplicaciones/Herramientas
```html
<div class="card tertiary-card">
    <h3><span class="icon">[EMOJI]</span>[CONCEPTO_3]</h3>
    <p>[DESCRIPCION_CONCEPTO_3]</p>
```

**Para cada card, reemplazar:**
- `[EMOJI]`: Emoji representativo
- `[CONCEPTO_X]`: Nombre del concepto
- `[DESCRIPCION_CONCEPTO_X]`: Descripción del concepto

### 4. Sub-conceptos dentro de cada Card
```html
<div class="concept-item" onclick="showDetails('concept1')">
    <h4>[EMOJI] [SUB_CONCEPTO_1A]</h4>
    <p>[DESCRIPCION_BREVE_1A]</p>
</div>
```

**Reemplazar para cada sub-concepto:**
- `[SUB_CONCEPTO_XY]`: Nombre del sub-concepto
- `[DESCRIPCION_BREVE_XY]`: Descripción breve

### 5. Ejemplo Práctico
```html
<div class="practical-example">
    <h3>💼 [TITULO_EJEMPLO_PRACTICO]</h3>
    <!-- 3 aspectos del ejemplo -->
</div>
```

**Reemplazar:**
- `[TITULO_EJEMPLO_PRACTICO]`: Título del caso práctico
- `[ASPECTO_X]`: Diferentes aspectos del ejemplo
- `[HERRAMIENTAS_X]`: Herramientas relacionadas

### 6. Técnica Mnemotécnica
```html
<div class="mnemonic">
    🧠 [TECNICA_MEMORIA]: <strong>[FRASE_MNEMOTECNICA]</strong>
</div>
```

**Reemplazar:**
- `[TECNICA_MEMORIA]`: Tipo de técnica (ej: "Acrónimo", "Frase", etc.)
- `[FRASE_MNEMOTECNICA]`: La frase o técnica para recordar

### 7. Quiz Interactivo
```javascript
const questions = [
    {
        question: "[PREGUNTA_1]",
        options: ["[OPCION_A]", "[OPCION_B]", "[OPCION_C]", "[OPCION_D]"],
        correct: 1, // Índice 0-3
        explanation: "[EXPLICACION_1]"
    },
    // ... más preguntas
];
```

**Para cada pregunta:**
- `[PREGUNTA_X]`: La pregunta del quiz
- `[OPCION_A/B/C/D]`: Las 4 opciones de respuesta
- `correct`: Índice de la respuesta correcta (0=A, 1=B, 2=C, 3=D)
- `[EXPLICACION_X]`: Explicación de por qué es correcta

### 8. Detalles Emergentes
```javascript
function showDetails(type: string) {
    const details: Record<string, { title: string; content: string }> = {
        concept1: {
            title: "[TITULO_DETALLE_1] [EMOJI]",
            content: "[CONTENIDO_DETALLADO_1]"
        },
        // ... más detalles
    };
}
```

## 🎨 Personalización de Colores

### Colores de Cards:
```css
.primary-card { border-left-color: #4CAF50; }    /* Verde */
.secondary-card { border-left-color: #f44336; }  /* Rojo */
.tertiary-card { border-left-color: #2196F3; }   /* Azul */
```

### Gradiente de Fondo:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Sugerencias de colores por tema:**
- **Seguridad**: Azul/Púrpura (#667eea, #764ba2)
- **Redes**: Verde/Azul (#00b09b, #96c93d)
- **Programación**: Naranja/Rosa (#ff7e5f, #feb47b)
- **Datos**: Púrpura/Rosa (#8360c3, #2ebf91)

## 📱 Características Incluidas

### ✅ Funcionalidades Listas:
- 📱 **Responsive Design**: Se adapta a móviles y tablets
- 🎯 **Quiz Interactivo**: Sistema completo de preguntas
- 🎨 **Animaciones**: Hover effects y transiciones
- 🔍 **Detalles Emergentes**: Pop-ups informativos
- ⚡ **TypeScript**: Código tipado y sin errores
- 🎭 **Astro Compatible**: Estructura optimizada

### 🎯 Estructura Modular:
1. **Header**: Título principal con gradiente
2. **Grid de Conceptos**: 3 cards principales organizadas
3. **Sub-conceptos**: Elementos interactivos dentro de cada card
4. **Ejemplo Práctico**: Caso de uso real
5. **Mnemotécnica**: Ayuda para memorizar
6. **Quiz**: 5 preguntas interactivas
7. **Responsive**: Funciona en todos los dispositivos

## 🚀 Ejemplo de Uso

Para crear una página sobre "Criptografía":

1. **Copiar** `plantilla.astro` a `crypto.astro`
2. **Reemplazar** placeholders:
   - `[TITULO_PAGINA]` → "Criptografía"
   - `[TITULO_PRINCIPAL]` → "🔐 Fundamentos de Criptografía"
   - `[CONCEPTO_1]` → "Cifrado Simétrico"
   - etc.
3. **Personalizar** colores si es necesario
4. **Generar** contenido específico

## ⚠️ Notas Importantes

1. **No eliminar** la estructura HTML principal
2. **Mantener** los IDs de elementos (`quiz-container`, `score`, etc.)
3. **Conservar** las clases CSS para que funcionen las animaciones
4. **Verificar** que las preguntas del quiz tengan sentido
5. **Probar** la funcionalidad del quiz antes de publicar

## 🔧 Extensiones Posibles

La plantilla se puede extender con:
- Más cards de conceptos
- Videos o imágenes
- Diagramas interactivos
- Enlaces externos
- Descargas de recursos
- Formularios de feedback

Esta plantilla está lista para usar y generar contenido educativo de alta calidad! 🚀