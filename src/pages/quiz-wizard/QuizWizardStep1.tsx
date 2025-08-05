// src/pages/quiz-wizard/QuizWizardStep1.tsx
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  QUIZ_WIZARD_SCHEMA,
  QUIZ_ANALYSIS_OPERATION,
  QUIZ_UI_TEXTS,
  QUIZ_PATHS,
  QUIZ_VALIDATION,
} from "./quizWizard.constants";

export const QuizWizardStep1: React.FC = () => {
  const navigate = useNavigate();
  const { register, setData } = useFormSchemaStore();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionsCount, setQuestionsCount] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<string[]>([
    "single",
    "multiple",
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const llmAnalysis = useLLMOperation("quiz-wizard", "analyze-quiz-topic");
  const { steps, errors: errorTexts } = QUIZ_UI_TEXTS;

  useEffect(() => {
    register(QUIZ_WIZARD_SCHEMA);
    llmAnalysis.registerOperation(QUIZ_ANALYSIS_OPERATION);

    return () => {
      llmAnalysis.unregisterOperation();
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!topic.trim() || topic.length < QUIZ_VALIDATION.topic.minLength) {
      newErrors.topic = QUIZ_VALIDATION.topic.errorMessage;
    }
    if (!difficulty) {
      newErrors.difficulty = "Wybierz poziom trudności";
    }
    if (
      !questionsCount ||
      questionsCount < QUIZ_VALIDATION.questionsCount.min ||
      questionsCount > QUIZ_VALIDATION.questionsCount.max
    ) {
      newErrors.questionsCount = QUIZ_VALIDATION.questionsCount.errorMessage;
    }
    if (questionTypes.length === 0) {
      newErrors.questionTypes = "Wybierz przynajmniej jeden typ pytań";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;

    try {
      const formData = {
        topic: topic.trim(),
        difficulty,
        questionsCount,
        questionTypes,
      };

      setData("quiz-wizard", formData);
      await llmAnalysis.executeOperation(formData);
      navigate(QUIZ_PATHS.step2);
    } catch (error) {
      console.error(errorTexts.analysisError, error);
    }
  };

  const toggleQuestionType = (type: string) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
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
            <Label htmlFor="topic">Temat quizu</Label>
            <Input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                QUIZ_WIZARD_SCHEMA.schema.step1.properties.topic.placeholder
              }
              disabled={llmAnalysis.loading}
              className={errors.topic ? "border-red-300" : ""}
            />
            {errors.topic && (
              <p className="text-sm text-red-600 mt-1">{errors.topic}</p>
            )}
          </div>

          <div>
            <Label htmlFor="difficulty">Poziom trudności</Label>
            <Select
              value={difficulty}
              onValueChange={setDifficulty}
              disabled={llmAnalysis.loading}
            >
              <SelectTrigger
                className={errors.difficulty ? "border-red-300" : ""}
              >
                <SelectValue placeholder="Wybierz poziom..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Łatwy</SelectItem>
                <SelectItem value="medium">Średni</SelectItem>
                <SelectItem value="hard">Trudny</SelectItem>
              </SelectContent>
            </Select>
            {errors.difficulty && (
              <p className="text-sm text-red-600 mt-1">{errors.difficulty}</p>
            )}
          </div>

          <div>
            <Label htmlFor="questionsCount">Liczba pytań</Label>
            <Input
              id="questionsCount"
              type="number"
              value={questionsCount}
              onChange={(e) => setQuestionsCount(parseInt(e.target.value) || 0)}
              min={QUIZ_VALIDATION.questionsCount.min}
              max={QUIZ_VALIDATION.questionsCount.max}
              disabled={llmAnalysis.loading}
              className={errors.questionsCount ? "border-red-300" : ""}
            />
            {errors.questionsCount && (
              <p className="text-sm text-red-600 mt-1">
                {errors.questionsCount}
              </p>
            )}
          </div>

          <div>
            <Label>Typy pytań</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="single"
                  checked={questionTypes.includes("single")}
                  onCheckedChange={() => toggleQuestionType("single")}
                  disabled={llmAnalysis.loading}
                />
                <label htmlFor="single" className="text-sm cursor-pointer">
                  Jednokrotny wybór
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multiple"
                  checked={questionTypes.includes("multiple")}
                  onCheckedChange={() => toggleQuestionType("multiple")}
                  disabled={llmAnalysis.loading}
                />
                <label htmlFor="multiple" className="text-sm cursor-pointer">
                  Wielokrotny wybór
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="truefalse"
                  checked={questionTypes.includes("truefalse")}
                  onCheckedChange={() => toggleQuestionType("truefalse")}
                  disabled={llmAnalysis.loading}
                />
                <label htmlFor="truefalse" className="text-sm cursor-pointer">
                  Prawda/Fałsz
                </label>
              </div>
            </div>
            {errors.questionTypes && (
              <p className="text-sm text-red-600 mt-1">
                {errors.questionTypes}
              </p>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={llmAnalysis.loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2"
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
  );
};
