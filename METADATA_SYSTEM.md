# 🎯 Sistema de Metadatos Simple

## 📝 Cómo Funciona

### 1. **Crear archivo .astro**
```
src/pages/ciberseguridad/fundamentos/mi-tema.astro
```

### 2. **Crear archivo .meta junto al .astro**
```
src/pages/ciberseguridad/fundamentos/mi-tema.meta
```

### 3. **Ejecutar script**
```bash
npm run generate
```

## 📋 Formato del archivo .meta

```
title=Título del Tema
slug=slug-del-tema
icon=🔧
status=completed
order=1
description=Descripción del tema
tags=tag1,tag2,tag3
certifications=CODIGO:PESO:DOMINIO
```

### Ejemplo:
```
title=CIA - Confidencialidad, Integridad, Disponibilidad
slug=cia
icon=🛡️
status=completed
order=1
description=Los tres pilares fundamentales de la seguridad de la información
tags=CIA,confidencialidad,integridad,disponibilidad,seguridad,fundamentos
certifications=SY0-701:4.5:General Security Concepts
```

## 🏆 Múltiples Certificaciones

Para agregar un tema a múltiples certificaciones:

```
certifications=SY0-701:4.5:General Security Concepts,NSE4_FGT-7.2:4.1:Security Fabric
```

## 🚀 Comandos Disponibles

- `npm run generate` - Genera todos los JSONs e índices
- `npm run update` - Genera JSONs y hace build completo
- `npm run build` - Solo build (sin generar JSONs)

## 📁 Archivos Generados Automáticamente

- `src/data/categories/[categoria]/[seccion]/[tema].json`
- `public/search-[categoria].json`
- `public/search-cert-[codigo].json`
- `public/search-index.json`

## ✨ Ventajas

- ✅ **Súper simple**: Solo un archivo .meta por tema
- ✅ **Fácil edición**: Formato legible
- ✅ **Automático**: Todo se actualiza con un comando
- ✅ **Flexible**: Múltiples certificaciones por tema
- ✅ **Escalable**: Fácil agregar nuevos temas

## 🔄 Flujo de Trabajo

1. Crear `mi-tema.astro`
2. Crear `mi-tema.meta` con metadatos
3. Ejecutar `npm run generate`
4. ¡Listo! Todo se actualiza automáticamente
