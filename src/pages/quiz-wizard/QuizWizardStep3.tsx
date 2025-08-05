// src/pages/quiz-wizard/QuizWizardStep3.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormSchemaStore, useLLMOperation } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import {
  QUIZ_GENERATION_OPERATION,
  QUIZ_UI_TEXTS,
  QUIZ_PATHS,
  QUIZ_VALIDATION,
} from "./quizWizard.constants";
import { SubPage } from "@/components/layout";

export const QuizWizardStep3: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const formData = getData("quiz-wizard");
  
  const [quizTitle, setQuizTitle] = useState(formData.quizTitle || "");
  const [passingScore, setPassingScore] = useState(formData.passingScore || 70);
  const [timeLimit, setTimeLimit] = useState(formData.timeLimit || "");
  const [maxAttempts, setMaxAttempts] = useState(formData.maxAttempts || "");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showExplanations, setShowExplanations] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const llmGeneration = useLLMOperation("quiz-wizard", "generate-quiz-questions");
  const { steps, errors: errorTexts } = QUIZ_UI_TEXTS;

  useEffect(() => {
    llmGeneration.registerOperation(QUIZ_GENERATION_OPERATION);

    return () => {
      llmGeneration.unregisterOperation();
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!quizTitle.trim() || quizTitle.length < QUIZ_VALIDATION.quizTitle.minLength) {
      newErrors.quizTitle = QUIZ_VALIDATION.quizTitle.errorMessage;
    }
    if (!passingScore || passingScore < QUIZ_VALIDATION.passingScore.min || passingScore > QUIZ_VALIDATION.passingScore.max) {
      newErrors.passingScore = QUIZ_VALIDATION.passingScore.errorMessage;
    }
    if (timeLimit && (parseInt(timeLimit) < QUIZ_VALIDATION.timeLimit.min || parseInt(timeLimit) > QUIZ_VALIDATION.timeLimit.max)) {
      newErrors.timeLimit = QUIZ_VALIDATION.timeLimit.errorMessage;
    }
    if (maxAttempts && (parseInt(maxAttempts) < QUIZ_VALIDATION.maxAttempts.min || parseInt(maxAttempts) > QUIZ_VALIDATION.maxAttempts.max)) {
      newErrors.maxAttempts = QUIZ_VALIDATION.maxAttempts.errorMessage;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    try {
      const updatedData = {
        ...formData,
        quizTitle: quizTitle.trim(),
        passingScore,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : null,
        shuffleQuestions,
        showExplanations,
      };
      
      setData("quiz-wizard", updatedData);
      await llmGeneration.executeOperation(updatedData);
      navigate(QUIZ_PATHS.step4);
    } catch (error) {
      console.error(errorTexts.generationError, error);
    }
  };

  return (<SubPage>
    <div className="border rounded-lg bg-white shadow relative pb-6">
      <StepsHero step={3} />
      <div className="space-y-6 p-8">
        <StepsHeader
          title={steps[3].title}
          description={steps[3].description}
        />

        <div className="space-y-6">
          <div>
            <Label htmlFor="quizTitle">Tytuł quizu <span className="text-red-500">*</span></Label>
            <Input
              id="quizTitle"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="np. Test wiedzy - Zmienne i typy danych"
              className={`mt-1 ${errors.quizTitle ? "border-red-300" : ""}`}
            />
            {errors.quizTitle && (
              <p className="text-sm text-red-600 mt-1">{errors.quizTitle}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passingScore">Próg zaliczenia (%) <span className="text-red-500">*</span></Label>
              <Input
                id="passingScore"
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                min={QUIZ_VALIDATION.passingScore.min}
                max={QUIZ_VALIDATION.passingScore.max}
                className={`mt-1 ${errors.passingScore ? "border-red-300" : ""}`}
              />
              {errors.passingScore && (
                <p className="text-sm text-red-600 mt-1">{errors.passingScore}</p>
              )}
            </div>

            <div>
              <Label htmlFor="timeLimit">Limit czasu (min)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="Pozostaw puste dla braku limitu"
                min={QUIZ_VALIDATION.timeLimit.min}
                max={QUIZ_VALIDATION.timeLimit.max}
                className={`mt-1 ${errors.timeLimit ? "border-red-300" : ""}`}
              />
              {errors.timeLimit && (
                <p className="text-sm text-red-600 mt-1">{errors.timeLimit}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="maxAttempts">Maksymalna liczba podejść</Label>
            <Input
              id="maxAttempts"
              type="number"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              placeholder="Pozostaw puste dla nieograniczonej liczby"
              min={QUIZ_VALIDATION.maxAttempts.min}
              max={QUIZ_VALIDATION.maxAttempts.max}
              className={`mt-1 ${errors.maxAttempts ? "border-red-300" : ""}`}
            />
            {errors.maxAttempts && (
              <p className="text-sm text-red-600 mt-1">{errors.maxAttempts}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shuffleQuestions"
                checked={shuffleQuestions}
                onCheckedChange={(checked) => setShuffleQuestions(checked as boolean)}
              />
              <label htmlFor="shuffleQuestions" className="text-sm cursor-pointer">
                Losowa kolejność pytań
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showExplanations"
                checked={showExplanations}
                onCheckedChange={(checked) => setShowExplanations(checked as boolean)}
              />
              <label htmlFor="showExplanations" className="text-sm cursor-pointer">
                Pokazuj wyjaśnienia po odpowiedzi
              </label>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate(QUIZ_PATHS.step2)}
            >
              Wstecz
            </Button>

            <Button
              onClick={handleNext}
              disabled={llmGeneration.loading}
            >
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
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-blue-800 text-sm">
              {steps[3].loadingInfo}
            </span>
          </div>
        )}
      </div>
    </div></SubPage>
  );
};