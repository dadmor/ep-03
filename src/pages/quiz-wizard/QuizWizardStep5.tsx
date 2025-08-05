// src/pages/quiz-wizard/QuizWizardStep5.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import { useCreate, useList, BaseRecord } from "@refinedev/core";
import { Save, ArrowLeft, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepsHero } from "./StepsHero";
import StepsHeader from "./StepsHeader";
import {
  QUIZ_VALIDATION,
  QUIZ_UI_TEXTS,
  QUIZ_PATHS,
} from "./quizWizard.constants";
import { SubPage } from "@/components/layout";

// Definicje typów dla lepszej kontroli TypeScript
interface Course extends BaseRecord {
  id: number;
  title: string;
  is_published: boolean;
}

interface Topic extends BaseRecord {
  id: number;
  title: string;
  position: number;
  course_id: number;
}

interface Activity extends BaseRecord {
  id: number;
  position: number;
}

export const QuizWizardStep5: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const { mutate: createActivity } = useCreate();
  const { mutate: createQuestion } = useCreate();
  const formData = getData("quiz-wizard");

  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [finalTitle, setFinalTitle] = useState(formData.quizTitle || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { steps, errors: errorTexts } = QUIZ_UI_TEXTS;

  // Pobierz listę kursów
  const { data: coursesData } = useList<Course>({
    resource: "courses",
    meta: {
      select: "id, title, is_published",
    },
    filters: [
      {
        field: "is_published",
        operator: "eq",
        value: true,
      },
    ],
  });

  // Pobierz listę tematów dla wybranego kursu
  const { data: topicsData } = useList<Topic>({
    resource: "topics",
    filters: [
      {
        field: "course_id",
        operator: "eq",
        value: courseId,
      },
    ],
    sorters: [
      {
        field: "position",
        order: "asc",
      },
    ],
    queryOptions: {
      enabled: !!courseId,
    },
  });

  // Pobierz ostatnią pozycję dla wybranego tematu
  const { data: activitiesData } = useList<Activity>({
    resource: "activities",
    filters: [
      {
        field: "topic_id",
        operator: "eq",
        value: topicId,
      },
    ],
    sorters: [
      {
        field: "position",
        order: "desc",
      },
    ],
    pagination: {
      pageSize: 1,
    },
    queryOptions: {
      enabled: !!topicId,
    },
  });

  const nextPosition = activitiesData?.data?.[0]?.position 
    ? activitiesData.data[0].position + 1 
    : 1;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!courseId) {
      newErrors.courseId = "Wybierz kurs";
    }
    if (!topicId) {
      newErrors.topicId = "Wybierz temat";
    }
    if (!finalTitle.trim() || finalTitle.length < QUIZ_VALIDATION.quizTitle.minLength) {
      newErrors.finalTitle = QUIZ_VALIDATION.quizTitle.errorMessage;
    }
    if (!formData.questions || formData.questions.length === 0) {
      newErrors.questions = errorTexts.noQuestions;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      // 1. Najpierw utwórz aktywność typu quiz
      createActivity(
        {
          resource: "activities",
          values: {
            topic_id: parseInt(topicId),
            type: "quiz",
            title: finalTitle.trim(),
            position: nextPosition,
            duration_min: formData.suggestedTime || formData.timeLimit || 30,
            is_published: false,
            passing_score: formData.passingScore,
            time_limit: formData.timeLimit || null,
            max_attempts: formData.maxAttempts || null,
          },
        },
        {
          onSuccess: async (activityData) => {
            const activityId = activityData.data.id;

            // 2. Następnie dodaj wszystkie pytania
            try {
              const questionPromises = formData.questions.map((question: any, index: number) => 
                new Promise((resolve, reject) => {
                  createQuestion(
                    {
                      resource: "questions",
                      values: {
                        activity_id: activityId,
                        question: question.question,
                        explanation: question.explanation,
                        points: question.points,
                        position: index + 1,
                        options: question.options.map((opt: any, optIndex: number) => ({
                          id: optIndex + 1,
                          text: opt.text,
                          is_correct: opt.is_correct,
                        })),
                      },
                    },
                    {
                      onSuccess: resolve,
                      onError: reject,
                    }
                  );
                })
              );

              await Promise.all(questionPromises);

              // 3. Zapisz w lokalnym store
              setData("quiz-wizard", {
                ...formData,
                finalTitle: finalTitle.trim(),
                courseId,
                topicId,
                activityId,
                saved: true,
              });

              setSaving(false);
              setSaved(true);

              // Przekieruj do zarządzania pytaniami po timeout
              setTimeout(() => {
                navigate(`${QUIZ_PATHS.questions}/${activityId}`);
              }, 2000);
            } catch (error) {
              setSaving(false);
              console.error("Błąd podczas zapisywania pytań:", error);
              alert("Błąd podczas zapisywania pytań");
            }
          },
          onError: (error) => {
            setSaving(false);
            console.error(errorTexts.saveError, error);
            alert(errorTexts.saveError);
          },
        }
      );
    } catch (error) {
      setSaving(false);
      console.error(errorTexts.unexpectedError, error);
      alert(errorTexts.unexpectedError);
    }
  };

  // Type guard do sprawdzenia czy course ma wymagane właściwości
  const isCourseValid = (course: BaseRecord): course is Course => {
    return course.id !== undefined && course.title !== undefined;
  };

  // Type guard do sprawdzenia czy topic ma wymagane właściwości
  const isTopicValid = (topic: BaseRecord): topic is Topic => {
    return topic.id !== undefined && topic.title !== undefined && topic.position !== undefined;
  };

  return (<SubPage>
    <div className="border rounded-lg bg-white shadow relative">
      <StepsHero step={5} />

      <div className="p-8">
        <StepsHeader
          title={
            <>
              <HelpCircle className="w-8 h-8 text-blue-500" />
              <span>{steps[5].title}</span>
            </>
          }
          description={steps[5].description}
        />

        {saved && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              {steps[5].success}
            </AlertDescription>
          </Alert>
        )}

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {/* Wybór kursu i tematu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courseId">Kurs <span className="text-red-500">*</span></Label>
              <Select
                value={courseId}
                onValueChange={(value) => {
                  setCourseId(value);
                  setTopicId(""); // Reset topic selection
                }}
              >
                <SelectTrigger className={errors.courseId ? "border-red-300" : ""}>
                  <SelectValue placeholder="Wybierz kurs..." />
                </SelectTrigger>
                <SelectContent>
                  {coursesData?.data?.map((course) => {
                    if (!isCourseValid(course)) return null;
                    return (
                      <SelectItem 
                        key={course.id} 
                        value={course.id.toString()}
                      >
                        {course.title}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.courseId && (
                <p className="text-sm text-red-600 mt-1">{errors.courseId}</p>
              )}
            </div>

            <div>
              <Label htmlFor="topicId">Temat <span className="text-red-500">*</span></Label>
              <Select
                value={topicId}
                onValueChange={setTopicId}
                disabled={!courseId}
              >
                <SelectTrigger className={errors.topicId ? "border-red-300" : ""}>
                  <SelectValue placeholder={courseId ? "Wybierz temat..." : "Najpierw wybierz kurs..."} />
                </SelectTrigger>
                <SelectContent>
                  {topicsData?.data?.map((topic) => {
                    if (!isTopicValid(topic)) return null;
                    return (
                      <SelectItem 
                        key={topic.id} 
                        value={topic.id.toString()}
                      >
                        {topic.position}. {topic.title}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.topicId && (
                <p className="text-sm text-red-600 mt-1">{errors.topicId}</p>
              )}
            </div>
          </div>

          {/* Tytuł quizu */}
          <div>
            <Label htmlFor="finalTitle">
              Tytuł quizu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="finalTitle"
              type="text"
              value={finalTitle}
              onChange={(e) => setFinalTitle(e.target.value)}
              placeholder="Tytuł quizu"
              maxLength={QUIZ_VALIDATION.quizTitle.maxLength}
              className={errors.finalTitle ? "border-red-300" : ""}
            />
            {errors.finalTitle && (
              <p className="text-sm text-red-600 mt-1">{errors.finalTitle}</p>
            )}
          </div>

          {/* Podsumowanie quizu */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Podsumowanie quizu</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Liczba pytań:</span>
                <span className="ml-2 font-medium">{formData.questions?.length || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Próg zaliczenia:</span>
                <span className="ml-2 font-medium">{formData.passingScore}%</span>
              </div>
              <div>
                <span className="text-gray-600">Limit czasu:</span>
                <span className="ml-2 font-medium">
                  {formData.timeLimit ? `${formData.timeLimit} min` : "Brak"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Łączna liczba punktów:</span>
                <span className="ml-2 font-medium">
                  {formData.questions?.reduce((sum: number, q: any) => sum + q.points, 0) || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Lista pytań (skrócona) */}
          <div>
            <h4 className="font-medium mb-3">Pytania ({formData.questions?.length || 0})</h4>
            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
              {formData.questions?.map((question: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm truncate flex-1">
                    {index + 1}. {question.question}
                  </span>
                  <span className="text-sm font-medium ml-2">{question.points} pkt</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ostrzeżenie o edycji */}
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-800" />
            <AlertDescription className="text-yellow-800">
              Po zapisaniu będziesz mógł edytować pytania w panelu zarządzania quizem
            </AlertDescription>
          </Alert>

          {/* Informacja o zapisie */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">{steps[5].saveInfo}</p>
          </div>

          <Separator />

          {/* Przyciski nawigacji */}
          <footer className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(QUIZ_PATHS.step4)}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Wstecz
            </Button>

            <Button
              type="submit"
              disabled={saving || saved}
              className="flex items-center gap-2 min-w-[160px]"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {steps[5].loading}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {steps[5].button}
                </>
              )}
            </Button>
          </footer>
        </form>
      </div>
    </div></SubPage>
  );
};