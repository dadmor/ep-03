// src/pages/educational-material-wizard/MaterialWizardStep5.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import { useCreate, useList, BaseRecord } from "@refinedev/core";
import { Save, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  MATERIAL_VALIDATION,
  MATERIAL_UI_TEXTS,
  MATERIAL_PATHS,
} from "./educationalMaterialWizard.constants";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
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

export const MaterialWizardStep5: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const { mutate: createActivity } = useCreate();
  const formData = getData("educational-material-wizard");

  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [activityTitle, setActivityTitle] = useState(formData.title || "");
  const [activityType, setActivityType] = useState("material");
  const [content, setContent] = useState(
    formData.content + 
    (formData.exercises ? `\n\n## Ćwiczenia\n\n${formData.exercises}` : "") +
    (formData.summary ? `\n\n## Podsumowanie\n\n${formData.summary}` : "")
  );
  const [duration, setDuration] = useState(formData.estimatedDuration || 30);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { steps, errors: errorTexts } = MATERIAL_UI_TEXTS;

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
    if (!activityTitle.trim() || activityTitle.length < MATERIAL_VALIDATION.activityTitle.minLength) {
      newErrors.activityTitle = MATERIAL_VALIDATION.activityTitle.errorMessage;
    }
    if (!content.trim() || content.length < MATERIAL_VALIDATION.content.minLength) {
      newErrors.content = MATERIAL_VALIDATION.content.errorMessage;
    }
    if (!duration || duration < MATERIAL_VALIDATION.duration.min || duration > MATERIAL_VALIDATION.duration.max) {
      newErrors.duration = MATERIAL_VALIDATION.duration.errorMessage;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      createActivity(
        {
          resource: "activities",
          values: {
            topic_id: parseInt(topicId),
            type: activityType,
            title: activityTitle.trim(),
            content: activityType === "material" ? content.trim() : null,
            position: nextPosition,
            duration_min: duration,
            is_published: false,
          },
        },
        {
          onSuccess: (data) => {
            // Zapisz w lokalnym store
            setData("educational-material-wizard", {
              ...formData,
              activityTitle: activityTitle.trim(),
              content: content.trim(),
              courseId,
              topicId,
              activityId: data.data.id,
              saved: true,
            });

            setSaving(false);
            setSaved(true);

            // Przekieruj do kursu po timeout
            setTimeout(() => {
              navigate(`${MATERIAL_PATHS.courses}/show/${courseId}?expanded=${topicId}`);
            }, 2000);
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

  return (
    <SubPage>
      <div className="border rounded-lg bg-white shadow relative">
        <StepsHero step={5} />

        <div className="p-8">
          <StepsHeader
            title={
              <>
                <FileText className="w-8 h-8 text-purple-500" />
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

            {/* Tytuł aktywności */}
            <div>
              <Label htmlFor="activityTitle">
                Tytuł aktywności <span className="text-red-500">*</span>
              </Label>
              <Input
                id="activityTitle"
                type="text"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                placeholder="np. Wprowadzenie do zmiennych"
                maxLength={MATERIAL_VALIDATION.activityTitle.maxLength}
                className={errors.activityTitle ? "border-red-300" : ""}
              />
              {errors.activityTitle && (
                <p className="text-sm text-red-600 mt-1">{errors.activityTitle}</p>
              )}
            </div>

            {/* Typ aktywności i czas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activityType">Typ aktywności</Label>
                <Select
                  value={activityType}
                  onValueChange={setActivityType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="material">Materiał edukacyjny</SelectItem>
                    <SelectItem value="quiz">Quiz sprawdzający</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">
                  Czas trwania (min) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  min={MATERIAL_VALIDATION.duration.min}
                  max={MATERIAL_VALIDATION.duration.max}
                  className={errors.duration ? "border-red-300" : ""}
                />
                {errors.duration && (
                  <p className="text-sm text-red-600 mt-1">{errors.duration}</p>
                )}
              </div>
            </div>

            {/* Treść materiału */}
            {activityType === "material" && (
              <div>
                <Label htmlFor="content">
                  Treść materiału <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Treść materiału w formacie Markdown..."
                  rows={15}
                  className={`font-mono text-sm ${errors.content ? "border-red-300" : ""}`}
                />
                {errors.content && (
                  <p className="text-sm text-red-600 mt-1">{errors.content}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {content.length} znaków (minimum {MATERIAL_VALIDATION.content.minLength})
                </p>
              </div>
            )}

            {activityType === "quiz" && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  💡 Po zapisaniu zostaniesz przekierowany do kreatora pytań quizowych
                </AlertDescription>
              </Alert>
            )}

            {/* Informacja o zapisie */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 text-sm">{steps[5].saveInfo}</p>
            </div>

            <Separator />

            {/* Przyciski nawigacji */}
            <footer className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(MATERIAL_PATHS.step4)}
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
      </div>
    </SubPage>
  );
};