// src/pages/quiz-wizard/quizWizard.constants.ts

import { LLMOperation } from "@/utility/llmFormWizard";

// ===== FORM SCHEMA =====
export const QUIZ_WIZARD_SCHEMA = {
  id: "quiz-wizard",
  title: "Kreator quizów",
  schema: {
    step1: {
      title: "Podstawowe informacje o quizie",
      type: "object",
      properties: {
        topic: {
          type: "text",
          title: "Temat quizu",
          placeholder: "np. Podstawy programowania w Python",
        },
        difficulty: {
          type: "select",
          title: "Poziom trudności",
          options: [
            { value: "easy", label: "Łatwy" },
            { value: "medium", label: "Średni" },
            { value: "hard", label: "Trudny" },
          ],
        },
        questionsCount: {
          type: "number",
          title: "Liczba pytań",
          placeholder: "10",
          min: 5,
          max: 30,
        },
        questionTypes: {
          type: "multiselect",
          title: "Typy pytań",
          options: [
            { value: "single", label: "Jednokrotny wybór" },
            { value: "multiple", label: "Wielokrotny wybór" },
            { value: "truefalse", label: "Prawda/Fałsz" },
          ],
        },
      },
      required: ["topic", "difficulty", "questionsCount"],
    },
    step2: {
      title: "Analiza tematu",
      type: "object",
      properties: {
        keyTopics: { type: "tags", title: "Kluczowe zagadnienia", readOnly: true },
        learningObjectives: { type: "textarea", title: "Cele sprawdzające", readOnly: true },
        suggestedTime: { type: "number", title: "Sugerowany czas (min)", readOnly: true },
        passingScore: { type: "number", title: "Próg zaliczenia (%)", readOnly: true },
      },
    },
    step3: {
      title: "Parametry quizu",
      type: "object",
      properties: {
        quizTitle: {
          type: "text",
          title: "Tytuł quizu",
          placeholder: "np. Test wiedzy - Zmienne i typy danych",
        },
        passingScore: {
          type: "number",
          title: "Próg zaliczenia (%)",
          placeholder: "70",
          min: 50,
          max: 100,
        },
        timeLimit: {
          type: "number",
          title: "Limit czasu (min)",
          placeholder: "Pozostaw puste dla braku limitu",
          min: 5,
          max: 180,
        },
        maxAttempts: {
          type: "number",
          title: "Maksymalna liczba podejść",
          placeholder: "Pozostaw puste dla nieograniczonej liczby",
          min: 1,
          max: 10,
        },
        shuffleQuestions: {
          type: "checkbox",
          title: "Losowa kolejność pytań",
        },
        showExplanations: {
          type: "checkbox",
          title: "Pokazuj wyjaśnienia po odpowiedzi",
        },
      },
      required: ["quizTitle", "passingScore"],
    },
    step4: {
      title: "Podgląd wygenerowanych pytań",
      type: "object",
      properties: {
        questions: { type: "array", title: "Lista pytań", readOnly: true },
      },
    },
    step5: {
      title: "Finalizacja i zapis",
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
        finalTitle: {
          type: "text",
          title: "Ostateczny tytuł",
          placeholder: "Tytuł quizu",
        },
        questions: {
          type: "array",
          title: "Pytania do edycji",
        },
      },
      required: ["courseId", "topicId", "finalTitle"],
    },
  },
};

// ===== LLM OPERATIONS =====
export const QUIZ_ANALYSIS_OPERATION: LLMOperation = {
  id: "analyze-quiz-topic",
  name: "Analiza tematu quizu",
  config: {
    endpoint: "https://diesel-power-backend.onrender.com/api/chat",
  },
  prompt: {
    system: "Jesteś ekspertem od tworzenia testów i quizów edukacyjnych.",
    user: `
Przeanalizuj temat dla quizu:
Temat: {{topic}}
Poziom trudności: {{difficulty}}
Liczba pytań: {{questionsCount}}

Wygeneruj JSON:
{
  "keyTopics": ["zagadnienie1", "zagadnienie2", "zagadnienie3"],
  "learningObjectives": "<cele sprawdzające - co quiz ma zweryfikować>",
  "suggestedTime": <liczba minut>,
  "passingScore": <próg zaliczenia w %>
}

Wymagania:
- KeyTopics: 5-10 kluczowych zagadnień do sprawdzenia
- LearningObjectives: konkretne umiejętności do weryfikacji (50-150 słów)
- SuggestedTime: 1-3 minuty na pytanie
- PassingScore: 60-80% w zależności od trudności
    `,
    responseFormat: "json",
  },
  inputMapping: (data) => ({
    topic: data.topic,
    difficulty: data.difficulty,
    questionsCount: data.questionsCount,
  }),
  outputMapping: (llmResult, currentData) => ({
    ...currentData,
    keyTopics: llmResult.keyTopics,
    learningObjectives: llmResult.learningObjectives,
    suggestedTime: llmResult.suggestedTime,
    passingScore: llmResult.passingScore,
  }),
  validation: (result) =>
    !!(result.keyTopics && result.learningObjectives && result.suggestedTime && result.passingScore),
};

export const QUIZ_GENERATION_OPERATION: LLMOperation = {
  id: "generate-quiz-questions",
  name: "Generowanie pytań quizowych",
  config: {
    endpoint: "https://diesel-power-backend.onrender.com/api/chat",
  },
  prompt: {
    system: "Jesteś ekspertem od tworzenia pytań testowych. Tworzysz rzetelne, dobrze sformułowane pytania sprawdzające wiedzę.",
    user: `
Stwórz pytania quizowe:

Temat: {{topic}}
Poziom trudności: {{difficulty}}
Liczba pytań: {{questionsCount}}
Typy pytań: {{questionTypes}}
Kluczowe zagadnienia: {{keyTopics}}
Cele: {{learningObjectives}}

Wygeneruj JSON z tablicą pytań:
{
  "quizTitle": "<tytuł quizu>",
  "questions": [
    {
      "question": "<treść pytania>",
      "type": "single|multiple|truefalse",
      "options": [
        {"text": "<treść opcji>", "is_correct": true/false},
        {"text": "<treść opcji>", "is_correct": true/false}
      ],
      "explanation": "<wyjaśnienie poprawnej odpowiedzi>",
      "points": <liczba punktów 1-5>
    }
  ]
}

Wymagania:
- Pytania jasne i jednoznaczne
- 4 opcje dla single/multiple, 2 dla true/false
- Dokładnie jedna poprawna dla single, 1-3 dla multiple
- Wyjaśnienia edukacyjne (30-100 słów)
- Punkty: łatwe=1-2, średnie=2-3, trudne=3-5
- Różnorodność typów pytań
- Pokrycie wszystkich kluczowych zagadnień
    `,
    responseFormat: "json",
  },
  inputMapping: (data) => ({
    topic: data.topic,
    difficulty: data.difficulty,
    questionsCount: data.questionsCount,
    questionTypes: Array.isArray(data.questionTypes) 
      ? data.questionTypes.join(", ") 
      : data.questionTypes || "single, multiple, truefalse",
    keyTopics: Array.isArray(data.keyTopics)
      ? data.keyTopics.join(", ")
      : data.keyTopics,
    learningObjectives: data.learningObjectives,
  }),
  outputMapping: (llmResult, currentData) => ({
    ...currentData,
    quizTitle: llmResult.quizTitle,
    questions: llmResult.questions,
  }),
  validation: (result) =>
    !!(result.quizTitle && result.questions && Array.isArray(result.questions) && result.questions.length > 0),
};

// ===== VALIDATION RULES =====
export const QUIZ_VALIDATION = {
  topic: {
    required: true,
    minLength: 5,
    maxLength: 200,
    errorMessage: "Temat jest wymagany (5-200 znaków)",
  },
  quizTitle: {
    required: true,
    minLength: 5,
    maxLength: 100,
    errorMessage: "Tytuł jest wymagany (5-100 znaków)",
  },
  questionsCount: {
    required: true,
    min: 5,
    max: 30,
    errorMessage: "Liczba pytań musi być między 5 a 30",
  },
  passingScore: {
    required: true,
    min: 50,
    max: 100,
    errorMessage: "Próg zaliczenia musi być między 50% a 100%",
  },
  timeLimit: {
    min: 5,
    max: 180,
    errorMessage: "Limit czasu musi być między 5 a 180 minut",
  },
  maxAttempts: {
    min: 1,
    max: 10,
    errorMessage: "Liczba podejść musi być między 1 a 10",
  },
};

// ===== UI TEXTS =====
export const QUIZ_UI_TEXTS = {
  steps: {
    1: {
      title: "Jaki quiz chcesz stworzyć?",
      description:
        "Podaj temat, poziom trudności i liczbę pytań - AI wygeneruje profesjonalny quiz",
      button: "Analizuj temat",
      loading: "Analizuję temat...",
    },
    2: {
      title: "Analiza tematu quizu",
      description: "AI przeanalizowała temat i zaproponowała parametry quizu",
      success: "✓ Analiza zakończona pomyślnie",
    },
    3: {
      title: "Skonfiguruj parametry quizu",
      description:
        "Dostosuj ustawienia quizu według swoich potrzeb",
      button: "Generuj pytania",
      loading: "Generuję pytania...",
      loadingInfo: "⚡ AI tworzy zestaw pytań dostosowanych do tematu...",
    },
    4: {
      title: "Podgląd wygenerowanych pytań",
      description: "AI przygotowała kompletny zestaw pytań",
      info: "💡 W następnym kroku będziesz mógł edytować pytania i wybrać kurs.",
    },
    5: {
      title: "Zapisz quiz w kursie",
      description:
        "Wybierz kurs i temat, sprawdź pytania przed zapisaniem",
      saveInfo:
        "💾 Quiz zostanie zapisany jako nowa aktywność z wygenerowanymi pytaniami",
      button: "Zapisz quiz",
      loading: "Zapisuję...",
      success:
        "✓ Quiz został zapisany pomyślnie! Przekierowuję do zarządzania pytaniami...",
    },
  },
  dashboard: {
    title: "Kreator quizów",
    description: "Twórz profesjonalne testy sprawdzające z pomocą AI",
    wizardTitle: "Kreator quizów AI",
    wizardDescription:
      "Stwórz quiz w 5 prostych krokach",
    features: [
      "Automatyczna analiza tematu",
      "Generowanie różnych typów pytań",
      "Dostosowanie poziomu trudności",
      "Inteligentne wyjaśnienia odpowiedzi",
      "Konfiguracja parametrów quizu",
      "Edycja i dostosowanie pytań",
    ],
  },
  errors: {
    topicRequired: "Podaj temat quizu",
    analysisError: "Błąd analizy tematu:",
    generationError: "Błąd generowania pytań:",
    saveError: "Wystąpił błąd podczas zapisu",
    unexpectedError: "Wystąpił nieoczekiwany błąd",
    noCourses: "Nie znaleziono żadnych kursów",
    noTopics: "Wybierz najpierw kurs",
    noQuestions: "Brak pytań do zapisania",
  },
};

// ===== API CONFIG =====
export const QUIZ_API_CONFIG = {
  llmEndpoint: "https://diesel-power-backend.onrender.com/api/chat",
  saveTimeout: 2000,
};

// ===== NAVIGATION PATHS =====
export const QUIZ_PATHS = {
  dashboard: "/quiz-wizard",
  step1: "/quiz-wizard/step1",
  step2: "/quiz-wizard/step2",
  step3: "/quiz-wizard/step3",
  step4: "/quiz-wizard/step4",
  step5: "/quiz-wizard/step5",
  questions: "/questions/manage",
};