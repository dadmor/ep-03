// src/pages/teacher/course-structure-wizard/CourseWizardStep4.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import { Eye, Calendar, BookOpen, HelpCircle, FileText, Clock, Target, Users } from "lucide-react";
import StepsHeader from "./StepsHeader";
import { COURSE_UI_TEXTS, COURSE_PATHS } from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      <Card className="border-2 shadow-lg">
        <StepsHero step={4} />
        <CardContent className="p-8">
          <StepsHeader
            title={
              <>
                <Eye className="w-8 h-8 text-purple-600" />
                <span>{steps[4].title}</span>
              </>
            }
            description={steps[4].description}
          />

          <div className="space-y-6">
            {/* Podsumowanie kursu */}
            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-3">{formData.courseTitle}</h4>
                <p className="text-gray-600 mb-6">{formData.description}</p>
                
                {formData.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Calendar className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-indigo-600">{formData.summary.totalWeeks}</div>
                      <div className="text-sm text-gray-600">tygodni</div>
                    </div>
                    <div className="text-center">
                      <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">{formData.summary.totalTopics}</div>
                      <div className="text-sm text-gray-600">tematów</div>
                    </div>
                    <div className="text-center">
                      <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{formData.summary.totalActivities}</div>
                      <div className="text-sm text-gray-600">aktywności</div>
                    </div>
                    <div className="text-center">
                      <HelpCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{formData.summary.totalQuizzes}</div>
                      <div className="text-sm text-gray-600">quizów</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Struktura kursu */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Struktura kursu</h4>
              
              {formData.structure?.map((week: any, weekIndex: number) => (
                <Card key={weekIndex} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h5 className="font-medium">Tydzień {week.weekNumber}</h5>
                    <Badge variant="secondary" className="ml-auto">
                      {week.topics.length} {week.topics.length === 1 ? "temat" : "tematów"}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4 space-y-4">
                    {week.topics.map((topic: any, topicIndex: number) => (
                      <div key={topicIndex} className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-200">
                        <h6 className="font-medium text-gray-900 mb-2">{topic.title}</h6>
                        <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                        
                        {topic.objectives && topic.objectives.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 mb-1">Cele:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {topic.objectives.map((obj: string, i: number) => (
                                <li key={i} className="flex items-start gap-1">
                                  <span className="text-green-500 mt-0.5">•</span>
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {topic.activities && topic.activities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {topic.activities.map((activity: any, actIndex: number) => (
                              <div key={actIndex} className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border text-xs">
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
                          <div className="flex flex-wrap gap-1">
                            {topic.keywords.map((keyword: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert className="bg-purple-50 border-purple-200">
              <AlertDescription className="text-purple-800">
                {steps[4].info}
              </AlertDescription>
            </Alert>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => navigate(COURSE_PATHS.step3)}>
                Wstecz
              </Button>
              <Button 
                onClick={() => navigate(COURSE_PATHS.step5)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Utwórz kurs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};