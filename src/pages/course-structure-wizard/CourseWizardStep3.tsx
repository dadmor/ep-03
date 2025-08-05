// src/pages/course-structure-wizard/CourseWizardStep3.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormSchemaStore, useLLMOperation } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import {
  STRUCTURE_GENERATION_OPERATION,
  COURSE_UI_TEXTS,
  COURSE_PATHS,
  COURSE_VALIDATION,
  COURSE_TYPE_CONFIG,
  CourseFormData,
  CourseType,
} from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";

export const CourseWizardStep3: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const formData = getData("course-structure-wizard") as CourseFormData;

  const [courseTitle, setCourseTitle] = useState(formData.courseTitle || "");
  const [description, setDescription] = useState(formData.description || "");
  const [topicsPerWeek, setTopicsPerWeek] = useState(2);
  const [includeExercises, setIncludeExercises] = useState(true);
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  const [quizFrequency, setQuizFrequency] = useState("weekly");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const llmGeneration = useLLMOperation(
    "course-structure-wizard",
    "generate-course-structure"
  );
  const { steps, errors: errorTexts } = COURSE_UI_TEXTS;

  useEffect(() => {
    llmGeneration.registerOperation(STRUCTURE_GENERATION_OPERATION);

    // Ustaw domyślne wartości na podstawie typu kursu
    if (formData.courseType && formData.courseType in COURSE_TYPE_CONFIG) {
      const courseType = formData.courseType as CourseType;
      const config = COURSE_TYPE_CONFIG[courseType];
      setIncludeExercises(config.includeExercises);
      setIncludeQuizzes(config.includeQuizzes);
      setQuizFrequency(config.defaultQuizFrequency);
    }

    return () => {
      llmGeneration.unregisterOperation();
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      !courseTitle.trim() ||
      courseTitle.length < COURSE_VALIDATION.courseTitle.minLength
    ) {
      newErrors.courseTitle = COURSE_VALIDATION.courseTitle.errorMessage;
    }
    if (
      !description.trim() ||
      description.length < COURSE_VALIDATION.description.minLength
    ) {
      newErrors.description = COURSE_VALIDATION.description.errorMessage;
    }
    if (
      !topicsPerWeek ||
      topicsPerWeek < COURSE_VALIDATION.topicsPerWeek.min ||
      topicsPerWeek > COURSE_VALIDATION.topicsPerWeek.max
    ) {
      newErrors.topicsPerWeek = COURSE_VALIDATION.topicsPerWeek.errorMessage;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    try {
      const updatedData = {
        ...formData,
        courseTitle: courseTitle.trim(),
        description: description.trim(),
        topicsPerWeek,
        includeExercises,
        includeQuizzes,
        quizFrequency,
      };

      setData("course-structure-wizard", updatedData);
      await llmGeneration.executeOperation(updatedData);
      navigate(COURSE_PATHS.step4);
    } catch (error) {
      console.error(errorTexts.generationError, error);
    }
  };

  return (
    <SubPage>
      <div className="border rounded-lg bg-white shadow relative pb-6">
        <StepsHero step={3} />
        <div className="space-y-6 p-8">
          <StepsHeader
            title={steps[3].title}
            description={steps[3].description}
          />

          <div className="space-y-6">
            <div>
              <Label htmlFor="courseTitle">
                Tytuł kursu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="courseTitle"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="np. Matematyka - Przygotowanie do matury"
                className={`mt-1 ${errors.courseTitle ? "border-red-300" : ""}`}
              />
              {errors.courseTitle && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.courseTitle}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">
                Opis kursu <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Szczegółowy opis kursu..."
                rows={4}
                className={`mt-1 ${errors.description ? "border-red-300" : ""}`}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.description}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {description.length} / {COURSE_VALIDATION.description.minLength}{" "}
                znaków minimum
              </p>
            </div>

            <div>
              <Label htmlFor="topicsPerWeek">
                Liczba tematów na tydzień{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="topicsPerWeek"
                type="number"
                value={topicsPerWeek}
                onChange={(e) =>
                  setTopicsPerWeek(parseInt(e.target.value) || 0)
                }
                min={COURSE_VALIDATION.topicsPerWeek.min}
                max={COURSE_VALIDATION.topicsPerWeek.max}
                className={`mt-1 ${
                  errors.topicsPerWeek ? "border-red-300" : ""
                }`}
              />
              {errors.topicsPerWeek && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.topicsPerWeek}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Określa tempo realizacji kursu
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeExercises"
                  checked={includeExercises}
                  onCheckedChange={(checked) =>
                    setIncludeExercises(checked as boolean)
                  }
                />
                <label
                  htmlFor="includeExercises"
                  className="text-sm cursor-pointer"
                >
                  Dodaj ćwiczenia do każdego tematu
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeQuizzes"
                  checked={includeQuizzes}
                  onCheckedChange={(checked) =>
                    setIncludeQuizzes(checked as boolean)
                  }
                />
                <label
                  htmlFor="includeQuizzes"
                  className="text-sm cursor-pointer"
                >
                  Dodaj quizy sprawdzające
                </label>
              </div>

              {includeQuizzes && (
                <div className="ml-6">
                  <Label htmlFor="quizFrequency">Częstotliwość quizów</Label>
                  <Select
                    value={quizFrequency}
                    onValueChange={setQuizFrequency}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="after_each">
                        Po każdym temacie
                      </SelectItem>
                      <SelectItem value="weekly">Co tydzień</SelectItem>
                      <SelectItem value="biweekly">Co dwa tygodnie</SelectItem>
                      <SelectItem value="monthly">Co miesiąc</SelectItem>
                      <SelectItem value="chapter_end">
                        Na koniec działu
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate(COURSE_PATHS.step2)}
              >
                Wstecz
              </Button>

              <Button onClick={handleNext} disabled={llmGeneration.loading}>
                {llmGeneration.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {steps[3].loading}
                  </>
                ) : (
                  steps[3].button
                )}
              </Button>
            </div>
          </div>

          {llmGeneration.loading && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <span className="text-indigo-800 text-sm">
                {steps[3].loadingInfo}
              </span>
            </div>
          )}
        </div>
      </div>
    </SubPage>
  );
};