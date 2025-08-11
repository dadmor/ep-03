// src/pages/course-structure-wizard/CourseWizardStep4.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import { Eye, Calendar, BookOpen, HelpCircle, FileText } from "lucide-react";
import StepsHeader from "./StepsHeader";
import { COURSE_UI_TEXTS, COURSE_PATHS } from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";

export const CourseWizardStep4: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("course-structure-wizard");
  const { steps } = COURSE_UI_TEXTS;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "material": return <FileText className="w-4 h-4" />;
      case "quiz": return <HelpCircle className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <SubPage>
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
            {/* Podsumowanie kursu */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">{formData.courseTitle}</h4>
              <p className="text-sm text-gray-600 mb-4">{formData.description}</p>
              
              {formData.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{formData.summary.totalWeeks}</div>
                    <div className="text-gray-600">tygodni</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{formData.summary.totalTopics}</div>
                    <div className="text-gray-600">tematów</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formData.summary.totalActivities}</div>
                    <div className="text-gray-600">aktywności</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formData.summary.totalQuizzes}</div>
                    <div className="text-gray-600">quizów</div>
                  </div>
                </div>
              )}
            </div>

            {/* Struktura kursu */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Struktura kursu</h4>
              
              {formData.structure?.map((week: any, weekIndex: number) => (
                <div key={weekIndex} className="border rounded-lg overflow-hidden">
                  <div className="bg-indigo-50 px-4 py-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h5 className="font-medium">Tydzień {week.weekNumber}</h5>
                    <Badge variant="secondary" className="ml-auto">
                      {week.topics.length} {week.topics.length === 1 ? "temat" : "tematów"}
                    </Badge>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {week.topics.map((topic: any, topicIndex: number) => (
                      <div key={topicIndex} className="border-l-4 border-indigo-200 pl-4">
                        <h6 className="font-medium text-gray-900">{topic.title}</h6>
                        <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                        
                        {topic.objectives && topic.objectives.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-gray-700">Cele:</p>
                            <ul className="text-xs text-gray-600 list-disc list-inside">
                              {topic.objectives.map((obj: string, i: number) => (
                                <li key={i}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {topic.activities && topic.activities.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {topic.activities.map((activity: any, actIndex: number) => (
                              <div key={actIndex} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                {getActivityIcon(activity.type)}
                                <span>{activity.title}</span>
                                {activity.duration && (
                                  <span className="text-gray-500">({activity.duration} min)</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {topic.keywords && topic.keywords.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {topic.keywords.map((keyword: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-indigo-800 text-sm">
              {steps[4].info}
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(COURSE_PATHS.step3)}>
              Wstecz
            </Button>
            <Button onClick={() => navigate(COURSE_PATHS.step5)}>
              Utwórz kurs
            </Button>
          </div>
        </div>
      </div>
    </SubPage>
  );
};