# 🎯 PROMPT V2 - PÁGINAS WIKI ASTRO INTELIGENTES

## ⚠️ REGLAS ESTRICTAS - NO NEGOCIABLES

1. **SIEMPRE USAR WikiLayout** - Importar y usar `WikiLayout` con `showHeader={false}`
2. **ESTRUCTURA ASTRO OBLIGATORIA** - Usar formato .astro con import, layout, script y style

## 📋 TEMPLATE BÁSICO DE ESTRUCTURA

```astro
---
import WikiLayout from '../../layouts/WikiLayout.astro';
---

<WikiLayout title="[TITULO_NAVEGADOR]" description="[META_DESCRIPTION_SEO]" showHeader={false}>

<div class="[tema]-page">
    <div class="container">
        <!-- CONTENIDO DINÁMICO - La IA decide la estructura -->
    </div>
</div>

</WikiLayout>

<script>
// JavaScript solo cuando sea necesario para interactividad
</script>

<style>
/* Estilos específicos para el tema */
</style>

## 🧠 INSTRUCCIONES INTELIGENTES PARA LA IA

### Análisis de Contenido (OBLIGATORIO):
**Como modelo de IA, DEBES analizar el contenido proporcionado y decidir la mejor estructura:**

1. **¿Qué tipo de información es?**
   - Concepto técnico → Explicación clara + ejemplos + diagramas
   - Proceso/Procedimiento → Pasos numerados + flujos + checklists
   - Herramienta/Software → Guía de uso + comandos + screenshots
   - Protocolo/Estándar → Flujos + estados + implementación
   - Comparación → Tablas + pros/cons + matrices de decisión
   - Framework/Arquitectura → Componentes + implementación + mejores prácticas
   - Seguridad → Amenazas + controles + mitigaciones + incidentes
   - Redes → Topologías + configuraciones + troubleshooting

2. **¿Qué elementos necesita?**
   - **Siempre**: Título principal + descripción clara
   - **Opcional según contenido**: Grids, tablas, pasos, diagramas, ejemplos,

3. **¿Qué nivel de interactividad requiere?**
   - **Básico**: Solo contenido estático
   - **Intermedio**: Modales para información expandible
   - **Avanzado**:  interactivo + animaciones

### Estructura Adaptativa (La IA decide):


### JavaScript Inteligente (Solo cuando sea necesario):

#### Inicialización:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Solo si hay interactividad
});
```

#### Funciones Opcionales:

- **Modales**: Solo si hay información expandible
- **Animaciones**: Solo si mejoran la experiencia

## 🎯 FILOSOFÍA DE DISEÑO FLEXIBLE

### Principios:
- **Análisis Inteligente**: La IA analiza el contenido y decide la mejor estructura
- **Flexibilidad Total**: No hay reglas de diseño forzadas
- **Valor Educativo**: Cada elemento debe agregar valor al aprendizaje
- **Simplicidad**: No complicar innecesariamente
- **Adaptabilidad**: Estructura que se adapte al contenido específico

### Decisiones de la IA:
1. **¿Necesita hero section?** → Solo si es útil para introducir el tema
2. **¿Necesita grids?** → Solo si hay múltiples elementos para organizar
3. **¿Necesita tablas?** → Solo si hay datos comparativos
4. **¿Necesita pasos?** → Solo si es un proceso secuencial
5. **¿Necesita quiz?** → Solo si es educativo y relevante
6. **¿Necesita modales?** → Solo si hay información expandible
7. **¿Necesita animaciones?** → Solo si mejoran la comprensión

## ⚠️ LO QUE NO HACER

❌ No seguir un template rígido
❌ No incluir elementos innecesarios
❌ No forzar una estructura específica
❌ No usar `showHeader={true}`
❌ No crear contenido aburrido
❌ No complicar innecesariamente
❌ No ignorar el tipo de contenido

## ✅ LO QUE SÍ HACER

✅ Usar `WikiLayout` con `showHeader={false}`
✅ **Analizar el contenido** antes de decidir la estructura
✅ **Adaptar la presentación** al tipo de información
✅ **Incluir elementos** solo si agregan valor educativo
✅ **Mantener simplicidad** y claridad
✅ **Usar CSS específico** con clase `.[tema]-page`
✅ **Incluir JavaScript** solo cuando sea necesario
✅ **Crear contenido engaging** y educativo

## 🎨 OBJETIVO FINAL

**Crear páginas wiki inteligentes donde:**
- La IA analice el contenido y decida la mejor estructura
- Cada elemento tenga un propósito educativo claro
- La presentación se adapte naturalmente al tipo de información
- El resultado sea atractivo, útil y fácil de entender
- No haya reglas forzadas que limiten la creatividad

---

**🧠 LA IA ES LIBRE DE DECIDIR** la mejor forma de presentar cada tema, siempre que mantenga la estructura básica de Astro y use WikiLayout.
Estas son solo las instrucciones el usuario te pasara el tema a explicar, por ahora  solo responde: Esperando tema para hacer la wiki.