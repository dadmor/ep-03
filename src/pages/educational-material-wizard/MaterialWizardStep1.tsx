// src/pages/educational-material-wizard/MaterialWizardStep1.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormSchemaStore, useLLMOperation } from "@/utility/llmFormWizard";
import { useList, BaseRecord } from "@refinedev/core";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, BookOpen } from "lucide-react";
import {
  EDUCATIONAL_MATERIAL_SCHEMA,
  TOPIC_ANALYSIS_OPERATION,
  MATERIAL_UI_TEXTS,
  MATERIAL_PATHS,
  MATERIAL_VALIDATION,
} from "./educationalMaterialWizard.constants";
import { SubPage } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Course extends BaseRecord {
  id: number;
  title: string;
  icon_emoji?: string;
  is_published: boolean;
  topics?: Topic[];
}

interface Topic extends BaseRecord {
  id: number;
  title: string;
  position: number;
  course_id: number;
}

export const MaterialWizardStep1: React.FC = () => {
  const navigate = useNavigate();
  const { register, setData } = useFormSchemaStore();
  
  // Pola formularza
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subject, setSubject] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contextInfo, setContextInfo] = useState<any>(null);

  const llmAnalysis = useLLMOperation("educational-material-wizard", "analyze-topic");
  const { steps, errors: errorTexts } = MATERIAL_UI_TEXTS;

  // Pobierz listę kursów z tematami
  const { data: coursesData, isLoading: coursesLoading } = useList<Course>({
    resource: "courses",
    filters: [
      {
        field: "is_published",
        operator: "eq",
        value: true,
      },
    ],
    meta: {
      select: "*, topics(*)",
    },
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
  });

  // Pobierz tematy dla wybranego kursu
  const selectedCourse = coursesData?.data?.find(c => c.id.toString() === courseId);
  const topics = selectedCourse?.topics || [];

  useEffect(() => {
    register(EDUCATIONAL_MATERIAL_SCHEMA);
    llmAnalysis.registerOperation(TOPIC_ANALYSIS_OPERATION);

    // Sprawdź kontekst z sesji
    const contextStr = sessionStorage.getItem('wizardContext');
    if (contextStr) {
      const context = JSON.parse(contextStr);
      setContextInfo(context);
      
      // Ustaw wartości z kontekstu
      if (context.courseId) {
        setCourseId(context.courseId.toString());
      }
      if (context.topicId) {
        setTopicId(context.topicId.toString());
      }
      if (context.topicTitle) {
        setSubject(context.topicTitle);
      }
    }

    return () => {
      llmAnalysis.unregisterOperation();
    };
  }, []);

  // Automatycznie ustaw temat na podstawie wybranego tematu kursu
  useEffect(() => {
    if (topicId && topics.length > 0) {
      const selectedTopic = topics.find(t => t.id.toString() === topicId);
      if (selectedTopic && !subject) {
        setSubject(selectedTopic.title);
      }
    }
  }, [topicId, topics]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!courseId) {
      newErrors.courseId = "Wybierz kurs";
    }
    if (!topicId) {
      newErrors.topicId = "Wybierz temat z kursu";
    }
    if (!subject.trim() || subject.length < MATERIAL_VALIDATION.subject.minLength) {
      newErrors.subject = MATERIAL_VALIDATION.subject.errorMessage;
    }
    if (!targetLevel) {
      newErrors.targetLevel = "Wybierz poziom zaawansowania";
    }
    if (!ageGroup) {
      newErrors.ageGroup = "Wybierz grupę wiekową";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;

    try {
      const formData = {
        courseId: parseInt(courseId),
        topicId: parseInt(topicId),
        subject: subject.trim(),
        targetLevel,
        ageGroup,
        courseTitle: selectedCourse?.title,
        topicTitle: topics.find(t => t.id.toString() === topicId)?.title,
      };
      
      setData("educational-material-wizard", formData);
      await llmAnalysis.executeOperation(formData);
      navigate(MATERIAL_PATHS.step2);
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

          {contextInfo && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Tworzysz materiał dla: <strong>{contextInfo.courseTitle}</strong>
                {contextInfo.topicTitle && (
                  <> → <strong>{contextInfo.topicTitle}</strong></>
                )}
              </AlertDescription>
            </Alert>
          )}

          {llmAnalysis.error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-800 text-sm">
                {errorTexts.analysisError} {llmAnalysis.error}
              </span>
            </div>
          )}

          <div className="space-y-4">
            {/* Wybór kursu i tematu */}
            <Card className="border-2 border-purple-200 bg-purple-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">Wybierz miejsce w kursie</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="courseId">
                      Kurs <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={courseId}
                      onValueChange={(value) => {
                        setCourseId(value);
                        setTopicId(""); // Reset topic selection
                      }}
                      disabled={llmAnalysis.loading || coursesLoading || !!contextInfo?.courseId}
                    >
                      <SelectTrigger className={errors.courseId ? "border-red-300" : ""}>
                        <SelectValue placeholder="Wybierz kurs..." />
                      </SelectTrigger>
                      <SelectContent>
                        {coursesData?.data?.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            <div className="flex items-center gap-2">
                              {course.icon_emoji && <span>{course.icon_emoji}</span>}
                              {course.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.courseId && (
                      <p className="text-sm text-red-600 mt-1">{errors.courseId}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="topicId">
                      Temat <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={topicId}
                      onValueChange={setTopicId}
                      disabled={!courseId || llmAnalysis.loading || !!contextInfo?.topicId}
                    >
                      <SelectTrigger className={errors.topicId ? "border-red-300" : ""}>
                        <SelectValue placeholder={courseId ? "Wybierz temat..." : "Najpierw wybierz kurs..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {topics
                          .sort((a, b) => a.position - b.position)
                          .map((topic) => (
                            <SelectItem key={topic.id} value={topic.id.toString()}>
                              {topic.position}. {topic.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {errors.topicId && (
                      <p className="text-sm text-red-600 mt-1">{errors.topicId}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Szczegóły materiału */}
            <div>
              <Label htmlFor="subject">Temat materiału</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={EDUCATIONAL_MATERIAL_SCHEMA.schema.step1.properties.subject.placeholder}
                disabled={llmAnalysis.loading}
                className={errors.subject ? "border-red-300" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Możesz dostosować temat materiału lub pozostawić sugerowany
              </p>
            </div>

            <div>
              <Label htmlFor="targetLevel">Poziom zaawansowania</Label>
              <Select
                value={targetLevel}
                onValueChange={setTargetLevel}
                disabled={llmAnalysis.loading}
              >
                <SelectTrigger className={errors.targetLevel ? "border-red-300" : ""}>
                  <SelectValue placeholder="Wybierz poziom..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Początkujący</SelectItem>
                  <SelectItem value="intermediate">Średniozaawansowany</SelectItem>
                  <SelectItem value="advanced">Zaawansowany</SelectItem>
                </SelectContent>
              </Select>
              {errors.targetLevel && (
                <p className="text-sm text-red-600 mt-1">{errors.targetLevel}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ageGroup">Grupa wiekowa</Label>
              <Select
                value={ageGroup}
                onValueChange={setAgeGroup}
                disabled={llmAnalysis.loading}
              >
                <SelectTrigger className={errors.ageGroup ? "border-red-300" : ""}>
                  <SelectValue placeholder="Wybierz grupę wiekową..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7-10">7-10 lat (szkoła podstawowa)</SelectItem>
                  <SelectItem value="11-14">11-14 lat (klasy 4-8)</SelectItem>
                  <SelectItem value="15-18">15-18 lat (szkoła średnia)</SelectItem>
                  <SelectItem value="18+">18+ (dorośli)</SelectItem>
                </SelectContent>
              </Select>
              {errors.ageGroup && (
                <p className="text-sm text-red-600 mt-1">{errors.ageGroup}</p>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={llmAnalysis.loading}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2"
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