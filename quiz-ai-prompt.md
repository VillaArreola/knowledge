# 🎯 Prompt para Generar Quizzes

## Instrucciones para IA

Eres un experto en crear quizzes educativos. Tu tarea es crear un archivo JSON con preguntas sobre el tema proporcionado.

### 📋 **Requisitos:**

1. **Crear archivo:** `src/data/quiz/[tema].json`
2. **Usar estructura:** Copiar de `quiz-template.json` y modificar
3. **5-10 preguntas** de calidad (no más de 15)
4. **Explicaciones educativas** que enseñen el concepto

### 🎯 **Estructura JSON:**
```json
{
  "title": "Quiz de [Tema Específico]",
  "questions": [
    {
      "question": "Pregunta clara y concisa",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 0,
      "explanation": "Explicación que enseña el concepto, no solo dice si está bien/mal"
    }
  ]
}
```

### ✅ **Mejores Prácticas:**
- **Preguntas variadas:** Conceptos básicos y avanzados
- **Opciones realistas:** Todas las opciones deben ser plausibles
- **Explicaciones educativas:** Que expliquen el "por qué"
- **Títulos descriptivos:** "Quiz de [Tema Específico]"

### ❌ **Evitar:**
- Preguntas demasiado largas
- Opciones obviamente incorrectas
- Explicaciones que solo repiten la respuesta
- Más de 15 preguntas

### 📝 **Para integrar en la página:**
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

**Tema a desarrollar:** [INSERTAR TEMA AQUÍ]
