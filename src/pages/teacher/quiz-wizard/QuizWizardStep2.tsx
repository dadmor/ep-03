import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import { FileText } from "lucide-react";
import { QUIZ_UI_TEXTS, QUIZ_PATHS } from "./quizWizard.constants";
import { SubPage } from "@/components/layout";

export const QuizWizardStep2: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("quiz-wizard");
  const { steps } = QUIZ_UI_TEXTS;

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Łatwy";
      case "medium": return "Średni";
      case "hard": return "Trudny";
      default: return difficulty;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "single": return "Jednokrotny wybór";
      case "multiple": return "Wielokrotny wybór";
      case "truefalse": return "Prawda/Fałsz";
      default: return type;
    }
  };

  return (
    <SubPage>
      <div className="border rounded-lg bg-white shadow relative pb-6">
        <StepsHero step={2} />
        <div className="space-y-6 p-8">
          <StepsHeader
            title={steps[2].title}
            description={steps[2].description}
          />

          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <span className="text-green-800 text-sm">{steps[2].success}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temat</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800">{formData.topic}</div>
              </div>

              {/* Informacja o materiale źródłowym jeśli istnieje */}
              {formData.basedOnMaterial && formData.materialTitle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materiał źródłowy
                  </label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">{formData.materialTitle}</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Pytania będą generowane wyłącznie z treści tego materiału
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poziom trudności</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {getDifficultyLabel(formData.difficulty)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Liczba pytań</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {formData.questionsCount}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Typy pytań</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {formData.questionTypes?.map((type: string) => (
                      <span key={type} className="text-sm text-gray-800">
                        {getQuestionTypeLabel(type)}
                        {formData.questionTypes.indexOf(type) < formData.questionTypes.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kluczowe zagadnienia</label>
                <div className="flex flex-wrap gap-2">
                  {formData.keyTopics?.map((topic: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
                {formData.basedOnMaterial && (
                  <p className="text-xs text-gray-500 mt-2">
                    * Zagadnienia wyodrębnione z materiału źródłowego
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cele sprawdzające</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 whitespace-pre-wrap">
                  {formData.learningObjectives}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sugerowany czas</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {formData.suggestedTime} minut
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sugerowany próg zaliczenia</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {formData.passingScore}%
                  </div>
                </div>
              </div>

              {/* Informacja o kursie i temacie */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Lokalizacja quizu</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Kurs:</span> {formData.courseTitle}
                  </p>
                  <p>
                    <span className="font-medium">Temat:</span> {formData.topicTitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(QUIZ_PATHS.step1)}>
                Wstecz
              </Button>
              <Button onClick={() => navigate(QUIZ_PATHS.step3)}>
                Kontynuuj
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SubPage>
  );
};