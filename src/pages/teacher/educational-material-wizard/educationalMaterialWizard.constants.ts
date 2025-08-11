
import { LLMOperation } from "@/utility/llmFormWizard";

// ===== FORM SCHEMA =====
export const EDUCATIONAL_MATERIAL_SCHEMA = {
  id: "educational-material-wizard",
  title: "Kreator materiałów edukacyjnych",
  schema: {
    step1: {
      title: "Podstawowe informacje",
      type: "object",
      properties: {
        subject: {
          type: "text",
          title: "Temat materiału",
          placeholder: "np. Wprowadzenie do programowania w Python",
        },
        targetLevel: {
          type: "select",
          title: "Poziom zaawansowania",
          options: [
            { value: "beginner", label: "Początkujący" },
            { value: "intermediate", label: "Średniozaawansowany" },
            { value: "advanced", label: "Zaawansowany" },
          ],
        },
        ageGroup: {
          type: "select",
          title: "Grupa wiekowa",
          options: [
            { value: "7-10", label: "7-10 lat (szkoła podstawowa)" },
            { value: "11-14", label: "11-14 lat (klasy 4-8)" },
            { value: "15-18", label: "15-18 lat (szkoła średnia)" },
            { value: "18+", label: "18+ (dorośli)" },
          ],
        },
      },
      required: ["subject", "targetLevel", "ageGroup"],
    },
    step2: {
      title: "Analiza tematu",
      type: "object",
      properties: {
        keyTopics: { type: "tags", title: "Kluczowe zagadnienia", readOnly: true },
        learningObjectives: { type: "textarea", title: "Cele nauczania", readOnly: true },
        prerequisites: { type: "tags", title: "Wymagania wstępne", readOnly: true },
        estimatedDuration: { type: "number", title: "Szacowany czas (min)", readOnly: true },
      },
    },
    step3: {
      title: "Dostosowanie celów",
      type: "object",
      properties: {
        learningObjectives: {
          type: "textarea",
          title: "Cele nauczania (edytowalne)",
          placeholder: "Dostosuj cele nauczania...",
          rows: 6,
        },
        materialType: {
          type: "select",
          title: "Typ materiału",
          options: [
            { value: "lesson", label: "Lekcja z teorią" },
            { value: "exercise", label: "Ćwiczenia praktyczne" },
            { value: "mixed", label: "Teoria + ćwiczenia" },
          ],
        },
      },
      required: ["learningObjectives", "materialType"],
    },
    step4: {
      title: "Podgląd materiału",
      type: "object",
      properties: {
        title: { type: "text", title: "Tytuł materiału", readOnly: true },
        content: { type: "textarea", title: "Treść materiału", readOnly: true },
        exercises: { type: "textarea", title: "Ćwiczenia", readOnly: true },
        summary: { type: "textarea", title: "Podsumowanie", readOnly: true },
      },
    },
    step5: {
      title: "Finalizacja",
      type: "object",
      properties: {
        courseId: {
          type: "select",
          title: "Wybierz kurs",
          placeholder: "Wybierz kurs...",
        },
        topicId: {
          type: "select",
          title: "Wybierz temat",
          placeholder: "Najpierw wybierz kurs...",
        },
        activityTitle: {
          type: "text",
          title: "Tytuł aktywności",
          placeholder: "np. Wprowadzenie do zmiennych",
        },
        activityType: {
          type: "select",
          title: "Typ aktywności",
          options: [
            { value: "material", label: "Materiał edukacyjny" },
            { value: "quiz", label: "Quiz sprawdzający" },
          ],
        },
        content: {
          type: "textarea",
          title: "Treść materiału",
          placeholder: "Edytuj wygenerowaną treść...",
          rows: 15,
        },
        duration: {
          type: "number",
          title: "Czas trwania (min)",
          placeholder: "15",
        },
      },
      required: ["courseId", "topicId", "activityTitle", "activityType", "content"],
    },
  },
};

// ===== LLM OPERATIONS =====
export const TOPIC_ANALYSIS_OPERATION: LLMOperation = {
  id: "analyze-topic",
  name: "Analiza tematu edukacyjnego",
  config: {
    endpoint: "https://diesel-power-backend.onrender.com/api/chat",
  },
  prompt: {
    system: "Jesteś ekspertem od edukacji i tworzenia materiałów dydaktycznych.",
    user: `
Przeanalizuj temat edukacyjny:
Temat: {{subject}}
Poziom: {{targetLevel}}
Grupa wiekowa: {{ageGroup}}

Wygeneruj JSON:
{
  "keyTopics": ["temat1", "temat2", "temat3"],
  "learningObjectives": "<szczegółowe cele nauczania - czego uczeń się nauczy>",
  "prerequisites": ["wymaganie1", "wymaganie2"],
  "estimatedDuration": <liczba minut>
}

Wymagania:
- KeyTopics: 3-7 kluczowych zagadnień do omówienia
- LearningObjectives: konkretne, mierzalne cele (100-200 słów)
- Prerequisites: 2-5 wymagań wstępnych (może być puste dla początkujących)
- EstimatedDuration: realistyczny czas w minutach (15-90)
    `,
    responseFormat: "json",
  },
  inputMapping: (data) => ({
    subject: data.subject,
    targetLevel: data.targetLevel,
    ageGroup: data.ageGroup,
  }),
  outputMapping: (llmResult, currentData) => ({
    ...currentData,
    keyTopics: llmResult.keyTopics,
    learningObjectives: llmResult.learningObjectives,
    prerequisites: llmResult.prerequisites,
    estimatedDuration: llmResult.estimatedDuration,
  }),
  validation: (result) =>
    !!(result.keyTopics && result.learningObjectives && result.estimatedDuration),
};

export const MATERIAL_GENERATION_OPERATION: LLMOperation = {
  id: "generate-material",
  name: "Generowanie materiału edukacyjnego",
  config: {
    endpoint: "https://diesel-power-backend.onrender.com/api/chat",
  },
  prompt: {
    system: "Jesteś doświadczonym nauczycielem tworzącym angażujące materiały edukacyjne.",
    user: `
Stwórz materiał edukacyjny:

Temat: {{subject}}
Poziom: {{targetLevel}}
Grupa wiekowa: {{ageGroup}}
Cele nauczania: {{learningObjectives}}
Typ materiału: {{materialType}}
Kluczowe zagadnienia: {{keyTopics}}

Wygeneruj JSON:
{
  "title": "<atrakcyjny tytuł materiału>",
  "content": "<treść materiału w formacie Markdown - teoria, przykłady, wyjaśnienia>",
  "exercises": "<ćwiczenia praktyczne w formacie Markdown>",
  "summary": "<podsumowanie najważniejszych punktów>"
}

Wymagania:
- Title: kreatywny i zachęcający do nauki
- Content: dostosowany do wieku, z przykładami, min. 500 słów
- Exercises: 3-5 ćwiczeń praktycznych z instrukcjami
- Summary: bullet points z najważniejszymi informacjami
- Używaj formatowania Markdown (nagłówki, listy, kod)
- Język dostosowany do grupy wiekowej
    `,
    responseFormat: "json",
  },
  inputMapping: (data) => ({
    subject: data.subject,
    targetLevel: data.targetLevel,
    ageGroup: data.ageGroup,
    learningObjectives: data.learningObjectives,
    materialType: data.materialType,
    keyTopics: Array.isArray(data.keyTopics)
      ? data.keyTopics.join(", ")
      : data.keyTopics,
  }),
  outputMapping: (llmResult, currentData) => ({
    ...currentData,
    title: llmResult.title,
    content: llmResult.content,
    exercises: llmResult.exercises,
    summary: llmResult.summary,
  }),
  validation: (result) =>
    !!(result.title && result.content && result.exercises && result.summary),
};

// ===== VALIDATION RULES =====
export const MATERIAL_VALIDATION = {
  subject: {
    required: true,
    minLength: 5,
    maxLength: 200,
    errorMessage: "Temat jest wymagany (5-200 znaków)",
  },
  activityTitle: {
    required: true,
    minLength: 3,
    maxLength: 100,
    errorMessage: "Tytuł jest wymagany (3-100 znaków)",
  },
  content: {
    required: true,
    minLength: 100,
    errorMessage: "Treść materiału jest wymagana (min. 100 znaków)",
  },
  duration: {
    required: true,
    min: 5,
    max: 180,
    errorMessage: "Czas trwania musi być między 5 a 180 minut",
  },
};

// ===== UI TEXTS =====
export const MATERIAL_UI_TEXTS = {
  steps: {
    1: {
      title: "O czym chcesz stworzyć materiał?",
      description:
        "Podaj temat, poziom zaawansowania i grupę docelową - AI pomoże stworzyć angażujący materiał edukacyjny",
      button: "Analizuj temat",
      loading: "Analizuję temat...",
    },
    2: {
      title: "Analiza tematu",
      description: "AI przeanalizowała temat i zaproponowała strukturę materiału",
      success: "✓ Analiza zakończona pomyślnie",
    },
    3: {
      title: "Dostosuj cele i typ materiału",
      description:
        "Możesz zmodyfikować cele nauczania i wybrać typ materiału do wygenerowania",
      button: "Generuj materiał",
      loading: "Generuję materiał...",
      loadingInfo: "⚡ AI tworzy spersonalizowany materiał edukacyjny...",
    },
    4: {
      title: "Podgląd wygenerowanego materiału",
      description: "AI przygotowała kompletny materiał edukacyjny",
      info: "💡 W następnym kroku wybierzesz kurs i temat, do którego dodasz materiał.",
    },
    5: {
      title: "Zapisz materiał w kursie",
      description:
        "Wybierz kurs i temat, następnie dostosuj materiał przed zapisaniem",
      saveInfo:
        "💾 Materiał zostanie zapisany jako nowa aktywność w wybranym temacie",
      button: "Zapisz materiał",
      loading: "Zapisuję...",
      success:
        "✓ Materiał został zapisany pomyślnie! Przekierowuję do kursu...",
    },
  },
  dashboard: {
    title: "Kreator materiałów edukacyjnych",
    description: "Twórz angażujące materiały z pomocą AI",
    wizardTitle: "Kreator materiałów AI",
    wizardDescription:
      "Stwórz materiał edukacyjny w 5 prostych krokach",
    features: [
      "Automatyczna analiza tematu",
      "Dostosowanie do wieku uczniów",
      "Generowanie celów nauczania",
      "Tworzenie ćwiczeń praktycznych",
      "Formatowanie Markdown",
      "Integracja z kursami",
    ],
  },
  errors: {
    subjectRequired: "Podaj temat materiału",
    analysisError: "Błąd analizy tematu:",
    generationError: "Błąd generowania materiału:",
    saveError: "Wystąpił błąd podczas zapisu",
    unexpectedError: "Wystąpił nieoczekiwany błąd",
    noCourses: "Nie znaleziono żadnych kursów",
    noTopics: "Wybierz najpierw kurs",
  },
};

// ===== API CONFIG =====
export const MATERIAL_API_CONFIG = {
  llmEndpoint: "https://diesel-power-backend.onrender.com/api/chat",
  saveTimeout: 2000,
};

// ===== NAVIGATION PATHS =====
export const MATERIAL_PATHS = {
  dashboard: "/educational-material",
  step1: "/educational-material/step1",
  step2: "/educational-material/step2",
  step3: "/educational-material/step3",
  step4: "/educational-material/step4",
  step5: "/educational-material/step5",
  courses: "/courses",
};