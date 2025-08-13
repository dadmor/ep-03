// src/pages/teacher/course-structure-wizard/CourseWizardDashboard.tsx
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
  Rocket,
  Clock,
  Target,
  Users,
  ArrowRight
} from "lucide-react";
import { COURSE_UI_TEXTS, COURSE_PATHS } from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        {/* Hero Section - Kreator nowego kursu */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 rounded-lg border-2 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Layout className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{dashboard.wizardTitle}</h2>
              <p className="text-gray-600 mb-4">{dashboard.wizardDescription}</p>
              
              <div className="flex flex-wrap gap-4 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>15-20 minut</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span>Struktura gotowa do wypełnienia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Dla wszystkich poziomów</span>
                </div>
              </div>

              <GridBox variant="1-2-2" className="gap-3 mb-6">
                {dashboard.features.map((feature, index) => (
                  <FlexBox key={index} variant="start" className="text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{feature}</span>
                  </FlexBox>
                ))}
              </GridBox>

              <Button 
                onClick={() => navigate(COURSE_PATHS.step1)}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Stwórz strukturę kursu
              </Button>
            </div>
          </div>
        </div>

        {/* Ostatni kurs */}
        {hasSavedCourse && (
          <Card className="hover:shadow-lg transition-shadow border-2 border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Ostatnia struktura</CardTitle>
                  <CardDescription>Kontynuuj pracę nad swoim kursem</CardDescription>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Wygenerowana
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{courseData.summary.totalWeeks}</div>
                      <div className="text-sm text-gray-600">tygodni</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{courseData.summary.totalTopics}</div>
                      <div className="text-sm text-gray-600">tematów</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => navigate(COURSE_PATHS.step4)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Podgląd
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(COURSE_PATHS.step3)}
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edytuj
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(COURSE_PATHS.step1)}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Nowa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Przydatne linki */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200"
            onClick={() => navigate("/teacher/courses")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <CardTitle className="text-lg">Kursy</CardTitle>
              <CardDescription>Zobacz wszystkie kursy</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200"
            onClick={() => navigate("/teacher/educational-material")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <CardTitle className="text-lg">Materiały</CardTitle>
              <CardDescription>Kreator materiałów</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200"
            onClick={() => navigate("/teacher/quiz-wizard")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <CardTitle className="text-lg">Quizy</CardTitle>
              <CardDescription>Kreator quizów</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </SubPage>
  );
};