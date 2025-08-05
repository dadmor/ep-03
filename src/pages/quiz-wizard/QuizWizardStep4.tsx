// src/pages/quiz-wizard/QuizWizardStep4.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import { Eye, Check, X } from "lucide-react";
import StepsHeader from "./StepsHeader";
import { QUIZ_UI_TEXTS, QUIZ_PATHS } from "./quizWizard.constants";

export const QuizWizardStep4: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("quiz-wizard");
  const { steps } = QUIZ_UI_TEXTS;

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "single": return "Jednokrotny wybór";
      case "multiple": return "Wielokrotny wybór";
      case "truefalse": return "Prawda/Fałsz";
      default: return type;
    }
  };

  const getQuestionTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "single": return "default" as const;
      case "multiple": return "secondary" as const;
      case "truefalse": return "outline" as const;
      default: return "default" as const;
    }
  };

  return (
    <div className="border rounded-lg bg-white shadow relative pb-6">
      <StepsHero step={4} />
      <div className="space-y-6 p-8">
        <StepsHeader
          title={
            <>
              <Eye className="w-8 h-8 text-zinc-500" />
              <span>{steps[4].title}</span>
            </>
          }
          description={steps[4].description}
        />

        <div className="space-y-6">
          {/* Informacje o quizie */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">{formData.quizTitle}</h4>
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
                <span className="text-gray-600">Max. podejść:</span>
                <span className="ml-2 font-medium">
                  {formData.maxAttempts || "Bez limitu"}
                </span>
              </div>
            </div>
          </div>

          {/* Lista pytań */}
          <div className="space-y-4">
            {formData.questions?.map((question: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium">
                      Pytanie {index + 1}
                    </h5>
                    <div className="flex gap-2">
                      <Badge variant={getQuestionTypeBadgeVariant(question.type)}>
                        {getQuestionTypeLabel(question.type)}
                      </Badge>
                      <Badge variant="outline">{question.points} pkt</Badge>
                    </div>
                  </div>
                  <p className="text-gray-700">{question.question}</p>
                </div>

                <div className="space-y-2 mb-3">
                  {question.options?.map((option: any, optIndex: number) => (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-2 p-2 rounded ${
                        option.is_correct
                          ? "bg-green-50 border border-green-200"
                          : "bg-gray-50"
                      }`}
                    >
                      {option.is_correct ? (
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={option.is_correct ? "font-medium" : ""}>
                        {option.text}
                      </span>
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm">
                      <span className="font-medium">Wyjaśnienie:</span> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            {steps[4].info}
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(QUIZ_PATHS.step3)}>
            Wstecz
          </Button>
          <Button onClick={() => navigate(QUIZ_PATHS.step5)}>
            Zapisz w kursie
          </Button>
        </div>
      </div>
    </div>
  );
};