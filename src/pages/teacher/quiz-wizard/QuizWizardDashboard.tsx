// src/pages/teacher/quiz-wizard/QuizWizardDashboard.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import { FlexBox, GridBox } from "@/components/shared";
import { 
  Brain, 
  Check, 
  Eye, 
  Edit3, 
  RefreshCw, 
  HelpCircle, 
  ListChecks, 
  Trophy,
  Rocket
} from "lucide-react";
import { QUIZ_UI_TEXTS, QUIZ_PATHS } from "./quizWizard.constants";
import { SubPage } from "@/components/layout";

export const QuizWizardDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const quizData = getData("quiz-wizard");
  const { dashboard } = QUIZ_UI_TEXTS;

  const hasSavedQuiz = quizData && quizData.quizTitle;

  return (
    <SubPage>
      <Lead
        title={dashboard.title}
        description={dashboard.description}
      />

      <div className="space-y-6">
        {/* Kreator nowego quizu */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
          <FlexBox variant="start" className="mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{dashboard.wizardTitle}</h2>
              <p className="text-gray-600">{dashboard.wizardDescription}</p>
            </div>
          </FlexBox>
          
          <GridBox variant="1-2-2" className="gap-4">
            <div className="space-y-2">
              {dashboard.features.slice(0, 3).map((feature, index) => (
                <FlexBox key={index} variant="start" className="text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </FlexBox>
              ))}
            </div>
            <div className="space-y-2">
              {dashboard.features.slice(3).map((feature, index) => (
                <FlexBox key={index} variant="start" className="text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </FlexBox>
              ))}
            </div>
          </GridBox>

          <div className="mt-6">
            <Button 
              onClick={() => navigate(`/teacher${QUIZ_PATHS.step1}`)}
              className="w-full md:w-auto"
              size="lg"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Stwórz nowy quiz
            </Button>
          </div>
        </div>

        {/* Ostatni quiz */}
        {hasSavedQuiz && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <FlexBox variant="between-center" className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ostatni quiz</h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Zapisany
              </span>
            </FlexBox>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tytuł quizu</p>
                <p className="font-medium text-gray-900">{quizData.quizTitle}</p>
              </div>
              
              {quizData.topic && (
                <div>
                  <p className="text-sm text-gray-600">Temat</p>
                  <p className="text-gray-900">{quizData.topic}</p>
                </div>
              )}
              
              {quizData.questions && (
                <div>
                  <p className="text-sm text-gray-600">Liczba pytań</p>
                  <p className="text-gray-900">{quizData.questions.length} pytań</p>
                </div>
              )}
            </div>

            <FlexBox variant="start" className="mt-6 gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate(QUIZ_PATHS.step4)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Podgląd
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(QUIZ_PATHS.step5)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edytuj
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(QUIZ_PATHS.step1)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Nowy quiz
              </Button>
            </FlexBox>
          </div>
        )}

        {/* Przydatne linki */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zarządzanie quizami</h3>
          
          <GridBox variant="1-2-3" className="gap-4">
            <button
              onClick={() => navigate("/teacher/activities")}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <FlexBox variant="start" className="mb-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Aktywności</span>
              </FlexBox>
              <p className="text-sm text-gray-600">Wszystkie quizy i materiały</p>
            </button>

            <button
              onClick={() => navigate("/teacher/questions")}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <FlexBox variant="start" className="mb-2">
                <ListChecks className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Pytania</span>
              </FlexBox>
              <p className="text-sm text-gray-600">Zarządzaj pytaniami</p>
            </button>

            <button
              onClick={() => navigate("/teacher/reports")}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <FlexBox variant="start" className="mb-2">
                <Trophy className="w-5 h-5 text-green-600" />
                <span className="font-medium">Wyniki</span>
              </FlexBox>
              <p className="text-sm text-gray-600">Statystyki quizów</p>
            </button>
          </GridBox>
        </div>
      </div>
    </SubPage>
  );
};