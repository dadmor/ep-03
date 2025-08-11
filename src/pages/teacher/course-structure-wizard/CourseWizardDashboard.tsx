// ===== DASHBOARD =====
// src/pages/course-structure-wizard/CourseWizardDashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import { FlexBox, GridBox } from "@/components/shared";
import { 
  Layout, 
  Check, 
  Eye, 
  Edit3, 
  RefreshCw, 
  BookOpen, 
  GraduationCap,
  Calendar,
  Rocket
} from "lucide-react";
import { COURSE_UI_TEXTS, COURSE_PATHS } from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";

export const CourseWizardDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const courseData = getData("course-structure-wizard");
  const { dashboard } = COURSE_UI_TEXTS;

  const hasSavedCourse = courseData && courseData.courseTitle;

  return (
    <SubPage>
      <Lead
        title={dashboard.title}
        description={dashboard.description}
      />

      <div className="space-y-6">
        {/* Kreator nowego kursu */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
          <FlexBox variant="start" className="mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Layout className="w-8 h-8 text-indigo-600" />
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
              onClick={() => navigate(COURSE_PATHS.step1)}
              className="w-full md:w-auto"
              size="lg"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Stwórz strukturę kursu
            </Button>
          </div>
        </div>

        {/* Ostatni kurs */}
        {hasSavedCourse && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <FlexBox variant="between-center" className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ostatnia struktura</h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Wygenerowana
              </span>
            </FlexBox>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tytuł kursu</p>
                <p className="font-medium text-gray-900">{courseData.courseTitle}</p>
              </div>
              
              {courseData.subject && (
                <div>
                  <p className="text-sm text-gray-600">Przedmiot</p>
                  <p className="text-gray-900">{courseData.subject}</p>
                </div>
              )}
              
              {courseData.summary && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Liczba tygodni</p>
                    <p className="text-gray-900 font-medium">{courseData.summary.totalWeeks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Liczba tematów</p>
                    <p className="text-gray-900 font-medium">{courseData.summary.totalTopics}</p>
                  </div>
                </div>
              )}
            </div>

            <FlexBox variant="start" className="mt-6 gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate(COURSE_PATHS.step4)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Podgląd
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(COURSE_PATHS.step3)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edytuj
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(COURSE_PATHS.step1)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Nowa struktura
              </Button>
            </FlexBox>
          </div>
        )}

        {/* Przydatne linki */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zarządzanie kursami</h3>
          
          <GridBox variant="1-2-3" className="gap-4">
            <button
              onClick={() => navigate("/teacher/courses")}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <FlexBox variant="start" className="mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Kursy</span>
              </FlexBox>
              <p className="text-sm text-gray-600">Zobacz wszystkie kursy</p>
            </button>

            <button
              onClick={() => navigate("/teacher/educational-material")}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <FlexBox variant="start" className="mb-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Materiały</span>
              </FlexBox>
              <p className="text-sm text-gray-600">Kreator materiałów</p>
            </button>

            <button
              onClick={() => navigate("/teacher/quiz-wizard")}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <FlexBox variant="start" className="mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="font-medium">Quizy</span>
              </FlexBox>
              <p className="text-sm text-gray-600">Kreator quizów</p>
            </button>
          </GridBox>
        </div>
      </div>
    </SubPage>
  );
};
