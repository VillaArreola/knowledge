# Componente Quiz

## Descripción
El componente `Quiz.astro` es un componente reutilizable que permite crear quizzes interactivos en cualquier página del wiki. **Funciona correctamente** y es fácil de implementar.

## ✅ Estado Actual
- **Funcionando en:** CIA.astro, SD-WAN.astro, NIST.astro
- **Diseño:** Componente independiente estilo GitHub/VS Code (tema oscuro)
- **Validación:** Botón "Siguiente" bloqueado hasta responder cada pregunta
- **Navegación:** Botones Atrás/Siguiente siempre visibles con estado correcto
- **JavaScript:** Event listeners modernos y compatibles con Astro
- **Responsive:** Adaptado para móviles y desktop

## Uso

### 🚀 **Instrucciones Rápidas para IAs**

**Para agregar un quiz a una página, solo necesitas:**

1. **Crear JSON:** `src/data/quiz/[tema].json` (usar `quiz-template.json` como base)
2. **Agregar importaciones:** Al inicio del archivo `.astro`
3. **Agregar componente:** Una línea antes del cierre de `WikiLayout`

**Snippet completo:**
```astro
---
import Quiz from '../../components/Quiz.astro';
import quizData from '../../data/quiz/[tema].json';
---

<WikiLayout title="...">
  <!-- Contenido de la página -->
  
  <Quiz questions={quizData.questions} title={quizData.title} />
</WikiLayout>
```

### 📝 **Paso a Paso Detallado**

#### 1. Crear el archivo JSON de preguntas
Crea un archivo JSON en `src/data/quiz/[nombre-del-tema].json` con la siguiente estructura:

```json
{
  "title": "Quiz de [Nombre del Tema]",
  "questions": [
    {
      "question": "¿Pregunta aquí?",
      "options": [
        "Opción A",
        "Opción B", 
        "Opción C",
        "Opción D"
      ],
      "correct": 0,
      "explanation": "Explicación de por qué es correcta o incorrecta."
    }
  ]
}
```

### 2. Importar en la página
En tu página `.astro`, agrega las importaciones:

```astro
---
import WikiLayout from '../../layouts/WikiLayout.astro';
import Quiz from '../../components/Quiz.astro';
import quizData from '../../data/quiz/[nombre-del-tema].json';
---
```

### 3. Usar el componente
Agrega el componente donde quieras que aparezca el quiz:

```astro
<Quiz questions={quizData.questions} title={quizData.title} />
```

## Estructura del JSON

### Campos requeridos:
- **title**: Título del quiz
- **questions**: Array de preguntas

### Estructura de cada pregunta:
- **question**: Texto de la pregunta
- **options**: Array con 4 opciones de respuesta
- **correct**: Índice de la respuesta correcta (0-3)
- **explanation**: Explicación que se muestra después de responder

## Ejemplos Implementados

### 1. Archivo: `src/data/quiz/cia.json`
```json
{
  "title": "Quiz de Control Objectives",
  "questions": [
    {
      "question": "¿Cuál de los siguientes es un objetivo de control válido?",
      "options": [
        "Instalar antivirus",
        "Lograr disponibilidad de datos",
        "Ejecutar un backup",
        "Comprar licencias"
      ],
      "correct": 1,
      "explanation": "Un objetivo de control define el resultado deseado, no la implementación específica."
    }
  ]
}
```

### 2. Archivo: `src/data/quiz/sdwan.json`
```json
{
  "title": "Quiz de SD-WAN",
  "questions": [
    {
      "question": "¿Qué significa SD-WAN?",
      "options": [
        "Software Defined Wide Area Network",
        "Secure Data Wide Area Network",
        "System Defined Wireless Area Network",
        "Simple Data Wide Area Network"
      ],
      "correct": 0,
      "explanation": "SD-WAN significa Software Defined Wide Area Network, que permite gestionar y optimizar el tráfico de red de forma centralizada."
    }
  ]
}
```

### 3. Archivo: `src/data/quiz/nist.json`
```json
{
  "title": "Quiz de NIST Cybersecurity Framework",
  "questions": [
    {
      "question": "¿Cuántas funciones tiene el NIST Cybersecurity Framework 2.0?",
      "options": [
        "5 funciones (IDPRR)",
        "6 funciones (GIDPRR)",
        "4 funciones (IDPR)",
        "7 funciones (GIDPRRR)"
      ],
      "correct": 1,
      "explanation": "El NIST CSF 2.0 tiene 6 funciones: GOVERN, IDENTIFY, PROTECT, DETECT, RESPOND y RECOVER. La función GOVERN es nueva en la versión 2.0."
    }
  ]
}
```

### En la página:
```astro
---
import WikiLayout from '../../layouts/WikiLayout.astro';
import Quiz from '../../components/Quiz.astro';
import quizData from '../../data/quiz/nist.json';
---

<WikiLayout title="NIST Cybersecurity Framework" description="...">
  <!-- Contenido de la página -->
  
  <!-- Quiz al final -->
  <Quiz questions={quizData.questions} title={quizData.title} />
</WikiLayout>
```

## Características

✅ **Funciona correctamente** - No más problemas de JavaScript  
✅ **Reutilizable** - Mismo componente para todas las páginas  
✅ **Fácil de mantener** - Solo necesitas crear un JSON  
✅ **Responsive** - Se adapta a móviles y desktop  
✅ **Interactivo** - Feedback inmediato y explicaciones  
✅ **Navegación inteligente** - Botones Siguiente/Atrás con validación  
✅ **Validación obligatoria** - No puedes avanzar sin responder  
✅ **Diseño independiente** - Estilo propio como componente nativo  
✅ **Compacto** - No interfiere con el contenido del wiki  

## Ventajas sobre el método anterior

- ❌ **Antes**: Cada página tenía su propio JavaScript del quiz
- ❌ **Antes**: Errores frecuentes y problemas de funcionamiento
- ❌ **Antes**: Difícil de mantener y actualizar
- ✅ **Ahora**: Un solo componente que funciona siempre
- ✅ **Ahora**: Solo necesitas crear un JSON con las preguntas
- ✅ **Ahora**: Fácil de mantener y actualizar
- ✅ **Ahora**: Diseño profesional y consistente

## Páginas donde está implementado

1. **`/cyber/CIA`** - Quiz de Control Objectives
2. **`/redes/sdwan`** - Quiz de SD-WAN
3. **`/cyber/nist`** - Quiz de NIST Cybersecurity Framework

## Próximos pasos

Para agregar un quiz a una nueva página:

1. Crear el archivo JSON en `src/data/quiz/[tema].json`
2. Importar el componente Quiz y los datos en la página
3. Agregar `<Quiz questions={quizData.questions} title={quizData.title} />` al final de la página

¡El componente está listo para usar en cualquier página del wiki! 🎯

## 💡 **Mejores Prácticas para IAs**

### ✅ **Recomendado:**
- **5-10 preguntas** por quiz (no más de 15)
- **Explicaciones claras** que enseñen, no solo digan si está bien/mal
- **Opciones realistas** - evita opciones obviamente incorrectas
- **Preguntas variadas** - mezcla conceptos básicos y avanzados
- **Títulos descriptivos** - "Quiz de [Tema Específico]"

### ❌ **Evitar:**
- Preguntas demasiado largas o complejas
- Explicaciones que solo repiten la respuesta
- Opciones que no tienen sentido
- Más de 15 preguntas (puede ser abrumador)

### 🎯 **Estructura Ideal:**
```json
{
  "title": "Quiz de [Tema Específico]",
  "questions": [
    {
      "question": "Pregunta clara y concisa",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Explicación que enseña el concepto"
    }
  ]
}
```
