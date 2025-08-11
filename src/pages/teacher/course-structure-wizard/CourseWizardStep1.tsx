// src/pages/course-structure-wizard/CourseWizardStep1.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormSchemaStore, useLLMOperation } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  COURSE_STRUCTURE_SCHEMA,
  COURSE_ANALYSIS_OPERATION,
  COURSE_UI_TEXTS,
  COURSE_PATHS,
  COURSE_VALIDATION,
} from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";

export const CourseWizardStep1: React.FC = () => {
  const navigate = useNavigate();
  const { register, setData } = useFormSchemaStore();
  const [courseType, setCourseType] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const llmAnalysis = useLLMOperation("course-structure-wizard", "analyze-course-requirements");
  const { steps, errors: errorTexts } = COURSE_UI_TEXTS;

  useEffect(() => {
    register(COURSE_STRUCTURE_SCHEMA);
    llmAnalysis.registerOperation(COURSE_ANALYSIS_OPERATION);

    return () => {
      llmAnalysis.unregisterOperation();
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!courseType) {
      newErrors.courseType = "Wybierz typ kursu";
    }
    if (!subject.trim() || subject.length < COURSE_VALIDATION.subject.minLength) {
      newErrors.subject = COURSE_VALIDATION.subject.errorMessage;
    }
    if (!level) {
      newErrors.level = "Wybierz poziom kursu";
    }
    if (!duration) {
      newErrors.duration = "Wybierz czas trwania";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;

    try {
      const formData = {
        courseType,
        subject: subject.trim(),
        level,
        duration,
      };
      
      setData("course-structure-wizard", formData);
      await llmAnalysis.executeOperation(formData);
      navigate(COURSE_PATHS.step2);
    } catch (error) {
      console.error(errorTexts.analysisError, error);
    }
  };

  return (
    <SubPage>
      <div className="border rounded-lg bg-white shadow relative pb-6">
        <StepsHero step={1} />

        <div className="p-6">
          <StepsHeader
            title={steps[1].title}
            description={steps[1].description}
          />

          {llmAnalysis.error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-800 text-sm">
                {errorTexts.analysisError} {llmAnalysis.error}
              </span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="courseType">Typ kursu</Label>
              <Select
                value={courseType}
                onValueChange={setCourseType}
                disabled={llmAnalysis.loading}
              >
                <SelectTrigger className={errors.courseType ? "border-red-300" : ""}>
                  <SelectValue placeholder="Wybierz typ kursu..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matura">Kurs maturalny</SelectItem>
                  <SelectItem value="academic">Kurs akademicki</SelectItem>
                  <SelectItem value="professional">Kurs zawodowy</SelectItem>
                  <SelectItem value="hobby">Kurs hobbystyczny</SelectItem>
                  <SelectItem value="certification">Kurs certyfikacyjny</SelectItem>
                </SelectContent>
              </Select>
              {errors.courseType && (
                <p className="text-sm text-red-600 mt-1">{errors.courseType}</p>
              )}
            </div>

            <div>
              <Label htmlFor="subject">Przedmiot/Dziedzina</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="np. Matematyka, Programowanie Python, Język angielski"
                disabled={llmAnalysis.loading}
                className={errors.subject ? "border-red-300" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
              )}
            </div>

            <div>
              <Label htmlFor="level">Poziom kursu</Label>
              <Select
                value={level}
                onValueChange={setLevel}
                disabled={llmAnalysis.loading}
              >
                <SelectTrigger className={errors.level ? "border-red-300" : ""}>
                  <SelectValue placeholder="Wybierz poziom..." />
                </SelectTrigger>
                <SelectContent>
                  {courseType === "matura" ? (
                    <>
                      <SelectItem value="basic">Podstawowy</SelectItem>
                      <SelectItem value="extended">Rozszerzony</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="beginner">Początkujący</SelectItem>
                      <SelectItem value="intermediate">Średniozaawansowany</SelectItem>
                      <SelectItem value="advanced">Zaawansowany</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-red-600 mt-1">{errors.level}</p>
              )}
            </div>

            <div>
              <Label htmlFor="duration">Planowany czas trwania</Label>
              <Select
                value={duration}
                onValueChange={setDuration}
                disabled={llmAnalysis.loading}
              >
                <SelectTrigger className={errors.duration ? "border-red-300" : ""}>
                  <SelectValue placeholder="Wybierz czas trwania..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 miesiąc</SelectItem>
                  <SelectItem value="3months">3 miesiące</SelectItem>
                  <SelectItem value="6months">6 miesięcy</SelectItem>
                  <SelectItem value="1year">1 rok</SelectItem>
                  <SelectItem value="2years">2 lata</SelectItem>
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="text-sm text-red-600 mt-1">{errors.duration}</p>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={llmAnalysis.loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2"
            >
              {llmAnalysis.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {steps[1].loading}
                </>
              ) : (
                steps[1].button
              )}
            </button>
          </div>
        </div>
      </div>
    </SubPage>
  );
};