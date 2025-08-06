// src/pages/course-structure-wizard/courseStructureWizard.constants.ts

import { LLMOperation } from "@/utility/llmFormWizard";

// ===== TYPES =====
export type CourseType = 'matura' | 'academic' | 'professional' | 'hobby' | 'certification';

export interface CourseFormData {
  courseType?: CourseType;
  subject?: string;
  level?: string;
  duration?: string;
  courseTitle?: string;
  description?: string;
  objectives?: string[];
  targetAudience?: string;
  prerequisites?: string[];
  estimatedHours?: number;
  topicsCount?: number;
  topicsPerWeek?: number;
  includeExercises?: boolean;
  includeQuizzes?: boolean;
  quizFrequency?: string;
  structure?: any[];
  summary?: {
    totalWeeks: number;
    totalTopics: number;
    totalActivities: number;
    totalQuizzes: number;
  };
}

// ===== FORM SCHEMA =====
export const COURSE_STRUCTURE_SCHEMA = {
  id: "course-structure-wizard",
  title: "Kreator struktury kursu",
  schema: {
    step1: {
      title: "Podstawowe informacje o kursie",
      type: "object",
      properties: {
        courseType: {
          type: "select",
          title: "Typ kursu",
          options: [
            { value: "matura", label: "Kurs maturalny" },
            { value: "academic", label: "Kurs akademicki" },
            { value: "professional", label: "Kurs zawodowy" },
            { value: "hobby", label: "Kurs hobbystyczny" },
            { value: "certification", label: "Kurs certyfikacyjny" },
          ],
        },
        subject: {
          type: "text",
          title: "Przedmiot/Dziedzina",
          placeholder: "np. Matematyka, Programowanie Python, Język angielski",
        },
        level: {
          type: "select",
          title: "Poziom kursu",
          options: [
            { value: "basic", label: "Podstawowy" },
            { value: "extended", label: "Rozszerzony" },
            { value: "beginner", label: "Początkujący" },
            { value: "intermediate", label: "Średniozaawansowany" },
            { value: "advanced", label: "Zaawansowany" },
          ],
        },
        duration: {
          type: "select",
          title: "Planowany czas trwania",
          options: [
            { value: "1month", label: "1 miesiąc" },
            { value: "3months", label: "3 miesiące" },
            { value: "6months", label: "6 miesięcy" },
            { value: "1year", label: "1 rok" },
            { value: "2years", label: "2 lata" },
          ],
        },
      },
      required: ["courseType", "subject", "level", "duration"],
    },
    step2: {
      title: "Analiza wymagań",
      type: "object",
      properties: {
        courseTitle: { type: "text", title: "Proponowany tytuł kursu", readOnly: true },
        description: { type: "textarea", title: "Opis kursu", readOnly: true },
        objectives: { type: "tags", title: "Cele kursu", readOnly: true },
        targetAudience: { type: "text", title: "Grupa docelowa", readOnly: true },
        prerequisites: { type: "tags", title: "Wymagania wstępne", readOnly: true },
        estimatedHours: { type: "number", title: "Szacowana liczba godzin", readOnly: true },
        topicsCount: { type: "number", title: "Liczba głównych tematów", readOnly: true },
      },
    },
    step3: {
      title: "Dostosowanie struktury",
      type: "object",
      properties: {
        courseTitle: {
          type: "text",
          title: "Tytuł kursu",
          placeholder: "np. Matematyka - Przygotowanie do matury",
        },
        description: {
          type: "textarea",
          title: "Opis kursu",
          rows: 4,
        },
        topicsPerWeek: {
          type: "number",
          title: "Liczba tematów na tydzień",
          min: 1,
          max: 7,
        },
        includeExercises: {
          type: "checkbox",
          title: "Dodaj ćwiczenia do każdego tematu",
        },
        includeQuizzes: {
          type: "checkbox",
          title: "Dodaj quizy sprawdzające",
        },
        quizFrequency: {
          type: "select",
          title: "Częstotliwość quizów",
          options: [
            { value: "after_each", label: "Po każdym temacie" },
            { value: "weekly", label: "Co tydzień" },
            { value: "biweekly", label: "Co dwa tygodnie" },
            { value: "monthly", label: "Co miesiąc" },
            { value: "chapter_end", label: "Na koniec działu" },
          ],
        },
      },
      required: ["courseTitle", "description", "topicsPerWeek"],
    },
    step4: {
      title: "Podgląd struktury",
      type: "object",
      properties: {
        structure: { type: "array", title: "Struktura kursu", readOnly: true },
      },
    },
    step5: {
      title: "Tworzenie kursu",
      type: "object",
      properties: {
        courseName: {
          type: "text",
          title: "Ostateczna nazwa kursu",
        },
        iconEmoji: {
          type: "text",
          title: "Emoji ikona",
          placeholder: "np. 📚 📐 🎓",
        },
        isPublished: {
          type: "checkbox",
          title: "Opublikuj od razu",
        },
      },
      required: ["courseName"],
    },
  },
};

// ===== LLM OPERATIONS =====
export const COURSE_ANALYSIS_OPERATION: LLMOperation = {
  id: "analyze-course-requirements",
  name: "Analiza wymagań kursu",
  config: {
    endpoint: "https://diesel-power-backend.onrender.com/api/chat",
  },
  prompt: {
    system: "Jesteś ekspertem od projektowania kursów edukacyjnych i programów nauczania.",
    user: `
Przeanalizuj wymagania dla kursu:
Typ: {{courseType}}
Przedmiot: {{subject}}
Poziom: {{level}}
Czas trwania: {{duration}}

Wygeneruj JSON:
{
  "courseTitle": "<tytuł kursu odpowiedni do typu i poziomu>",
  "description": "<szczegółowy opis kursu 100-200 słów>",
  "objectives": ["cel1", "cel2", "cel3", "cel4", "cel5"],
  "targetAudience": "<opis grupy docelowej>",
  "prerequisites": ["wymaganie1", "wymaganie2"],
  "estimatedHours": <liczba godzin>,
  "topicsCount": <liczba głównych tematów>
}

Wymagania:
- Dla kursów maturalnych: zgodność z podstawą programową
- CourseTitle: profesjonalny i opisowy
- Description: zawiera zakres materiału i metodykę
- Objectives: 5-8 konkretnych, mierzalnych celów
- Prerequisites: realistyczne wymagania (może być pusta tablica)
- EstimatedHours: realistyczna liczba godzin
- TopicsCount: odpowiednia liczba tematów do czasu trwania
    `,
    responseFormat: "json",
  },
  inputMapping: (data) => ({
    courseType: data.courseType,
    subject: data.subject,
    level: data.level,
    duration: data.duration,
  }),
  outputMapping: (llmResult, currentData) => ({
    ...currentData,
    courseTitle: llmResult.courseTitle,
    description: llmResult.description,
    objectives: llmResult.objectives,
    targetAudience: llmResult.targetAudience,
    prerequisites: llmResult.prerequisites,
    estimatedHours: llmResult.estimatedHours,
    topicsCount: llmResult.topicsCount,
  }),
  validation: (result) =>
    !!(result.courseTitle && result.description && result.objectives && result.topicsCount),
};

export const STRUCTURE_GENERATION_OPERATION: LLMOperation = {
  id: "generate-course-structure",
  name: "Generowanie struktury kursu",
  config: {
    endpoint: "https://diesel-power-backend.onrender.com/api/chat",
  },
  prompt: {
    system: "Jesteś ekspertem od tworzenia szczegółowych programów nauczania. Tworzysz logiczną, progresywną strukturę kursu.",
    user: `
    Stwórz szczegółową strukturę kursu:
    
    Tytuł: {{courseTitle}}
    Opis: {{description}}
    Przedmiot: {{subject}}
    Poziom: {{level}}
    Typ: {{courseType}}
    Cele: {{objectives}}
    Liczba tematów: {{topicsCount}}
    Tematy na tydzień: {{topicsPerWeek}}
    Ćwiczenia: {{includeExercises}}
    Quizy: {{includeQuizzes}}
    Częstotliwość quizów: {{quizFrequency}}
    
    WAŻNE: Wygeneruj KOMPLETNY JSON dla pierwszych 4 tygodni kursu. NIE UŻYWAJ komentarzy w JSON. NIE UŻYWAJ "...". Każdy tydzień musi być w pełni wypełniony.
    
    Wygeneruj JSON ze strukturą:
    {
      "structure": [
        {
          "weekNumber": 1,
          "topics": [
            {
              "title": "<tytuł tematu>",
              "description": "<opis tematu>",
              "objectives": ["cel1", "cel2"],
              "activities": [
                {
                  "type": "material",
                  "title": "<tytuł materiału>",
                  "duration": <czas w minutach>
                },
                {
                  "type": "quiz",
                  "title": "<tytuł quizu>",
                  "questionsCount": <liczba pytań>
                }
              ],
              "keywords": ["słowo1", "słowo2"]
            }
          ]
        }
      ],
      "summary": {
        "totalWeeks": 4,
        "totalTopics": <liczba tematów w 4 tygodniach>,
        "totalActivities": <suma wszystkich aktywności>,
        "totalQuizzes": <suma wszystkich quizów>
      }
    }
    
    Wymagania:
    - Wygeneruj DOKŁADNIE 4 tygodnie
    - Każdy tydzień ma {{topicsPerWeek}} tematów
    - Logiczna progresja trudności
    - Dla kursów maturalnych: zgodność z wymaganiami egzaminacyjnymi
    - Każdy temat ma jasno określone cele
    - Realistyczne czasy trwania (30-90 min na materiał)
    - Quizy dostosowane do poziomu (5-15 pytań)
    - NIE UŻYWAJ komentarzy ani "..." w JSON
        `,
    responseFormat: "json",
  },
  inputMapping: (data) => ({
    courseTitle: data.courseTitle,
    description: data.description,
    subject: data.subject,
    level: data.level,
    courseType: data.courseType,
    objectives: Array.isArray(data.objectives) ? data.objectives.join(", ") : data.objectives,
    topicsCount: data.topicsCount,
    topicsPerWeek: data.topicsPerWeek,
    includeExercises: data.includeExercises ? "tak" : "nie",
    includeQuizzes: data.includeQuizzes ? "tak" : "nie",
    quizFrequency: data.quizFrequency || "chapter_end",
  }),
  outputMapping: (llmResult, currentData) => ({
    ...currentData,
    structure: llmResult.structure,
    summary: llmResult.summary,
  }),
  validation: (result) =>
    !!(result.structure && Array.isArray(result.structure) && result.structure.length > 0),
};

// ===== VALIDATION RULES =====
export const COURSE_VALIDATION = {
  subject: {
    required: true,
    minLength: 3,
    maxLength: 100,
    errorMessage: "Przedmiot jest wymagany (3-100 znaków)",
  },
  courseTitle: {
    required: true,
    minLength: 5,
    maxLength: 200,
    errorMessage: "Tytuł jest wymagany (5-200 znaków)",
  },
  description: {
    required: true,
    minLength: 50,
    maxLength: 1000,
    errorMessage: "Opis jest wymagany (50-1000 znaków)",
  },
  topicsPerWeek: {
    required: true,
    min: 1,
    max: 7,
    errorMessage: "Liczba tematów na tydzień musi być między 1 a 7",
  },
};

// ===== UI TEXTS =====
export const COURSE_UI_TEXTS = {
  steps: {
    1: {
      title: "Jaki kurs chcesz stworzyć?",
      description:
        "Określ typ, przedmiot i poziom - AI stworzy kompletną strukturę kursu",
      button: "Analizuj wymagania",
      loading: "Analizuję wymagania...",
    },
    2: {
      title: "Analiza wymagań kursu",
      description: "AI przeanalizowała wymagania i zaproponowała parametry kursu",
      success: "✓ Analiza zakończona pomyślnie",
    },
    3: {
      title: "Dostosuj strukturę kursu",
      description:
        "Określ tempo nauki i dodatkowe elementy kursu",
      button: "Generuj strukturę",
      loading: "Generuję strukturę...",
      loadingInfo: "⚡ AI tworzy szczegółowy plan kursu z podziałem na tygodnie...",
    },
    4: {
      title: "Podgląd struktury kursu",
      description: "AI przygotowała kompletną strukturę z harmonogramem",
      info: "💡 Po zapisaniu będziesz mógł dodawać materiały do utworzonych tematów.",
    },
    5: {
      title: "Tworzenie kursu",
      description:
        "Ostatnie poprawki przed utworzeniem kursu",
      saveInfo:
        "💾 Zostanie utworzony kurs z pełną strukturą tematów. Materiały i quizy możesz dodać później.",
      button: "Utwórz kurs",
      loading: "Tworzę kurs...",
      success:
        "✓ Kurs został utworzony pomyślnie! Przekierowuję...",
    },
  },
  dashboard: {
    title: "Generator struktury kursu",
    description: "Twórz kompletne kursy z pomocą AI",
    wizardTitle: "Generator kursów AI",
    wizardDescription:
      "Stwórz pełną strukturę kursu w 5 krokach",
    features: [
      "Automatyczna analiza wymagań",
      "Generowanie harmonogramu",
      "Podział na tygodnie i tematy",
      "Sugestie materiałów i quizów",
      "Zgodność z podstawą programową",
      "Progresja poziomu trudności",
    ],
  },
  errors: {
    subjectRequired: "Podaj przedmiot kursu",
    analysisError: "Błąd analizy wymagań:",
    generationError: "Błąd generowania struktury:",
    saveError: "Wystąpił błąd podczas tworzenia kursu",
    unexpectedError: "Wystąpił nieoczekiwany błąd",
  },
};

// ===== NAVIGATION PATHS =====
export const COURSE_PATHS = {
  dashboard: "/course-structure",
  step1: "/course-structure/step1",
  step2: "/course-structure/step2",
  step3: "/course-structure/step3",
  step4: "/course-structure/step4",
  step5: "/course-structure/step5",
  courses: "/courses",
};

// ===== COURSE TYPE CONFIGS =====
export const COURSE_TYPE_CONFIG: Record<CourseType, {
  defaultTopics?: string[];
  defaultQuizFrequency: string;
  includeExercises: boolean;
  includeQuizzes: boolean;
}> = {
  matura: {
    defaultTopics: [
      "Wprowadzenie i powtórka",
      "Podstawowe zagadnienia",
      "Zagadnienia rozszerzone",
      "Zadania typu maturalnego",
      "Próbne egzaminy",
      "Powtórka przedegzaminacyjna",
    ],
    defaultQuizFrequency: "weekly",
    includeExercises: true,
    includeQuizzes: true,
  },
  academic: {
    defaultQuizFrequency: "biweekly",
    includeExercises: true,
    includeQuizzes: true,
  },
  professional: {
    defaultQuizFrequency: "chapter_end",
    includeExercises: true,
    includeQuizzes: true,
  },
  hobby: {
    defaultQuizFrequency: "monthly",
    includeExercises: true,
    includeQuizzes: false,
  },
  certification: {
    defaultQuizFrequency: "after_each",
    includeExercises: true,
    includeQuizzes: true,
  },
};