import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormSchemaStore, useLLMOperation } from "@/utility/llmFormWizard";
import { useList, useOne, BaseRecord } from "@refinedev/core";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, BookOpen, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  QUIZ_WIZARD_SCHEMA,
  QUIZ_ANALYSIS_OPERATION,
  QUIZ_UI_TEXTS,
  QUIZ_PATHS,
  QUIZ_VALIDATION,
} from "./quizWizard.constants";
import { SubPage } from "@/components/layout";

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

interface Material extends BaseRecord {
  id: number;
  title: string;
  position: number;
  content?: string;
}

interface WizardContext {
  courseId?: number;
  topicId?: number;
  topicTitle?: string;
  courseTitle?: string;
  materialId?: number;
  materialTitle?: string;
}

export const QuizWizardStep1: React.FC = () => {
  const navigate = useNavigate();
  const { register, setData } = useFormSchemaStore();
  
  // Pola formularza
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionsCount, setQuestionsCount] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<string[]>([
    "single",
    "multiple",
  ]);
  const [quizSource, setQuizSource] = useState<"general" | "material">("general");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contextInfo, setContextInfo] = useState<WizardContext | null>(null);

  const llmAnalysis = useLLMOperation("quiz-wizard", "analyze-quiz-topic");
  const { steps, errors: errorTexts } = QUIZ_UI_TEXTS;

  // Pobierz listę kursów z tematami
  const { data: coursesData, isLoading: coursesLoading } = useList<Course>({
    resource: "courses",
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

  // Pobierz dane materiału jeśli materialId jest w kontekście
  const { data: materialData, isLoading: materialLoading } = useOne({
    resource: "activities",
    id: contextInfo?.materialId || 0,
    queryOptions: {
      enabled: !!contextInfo?.materialId,
    },
  });

  // Pobierz materiały dla wybranego tematu
  const { data: materialsData, isLoading: materialsLoading } = useList<Material>({
    resource: "activities",
    filters: [
      {
        field: "topic_id",
        operator: "eq",
        value: topicId ? parseInt(topicId) : undefined,
      },
      {
        field: "type",
        operator: "eq",
        value: "material",
      },
    ],
    sorters: [
      {
        field: "position",
        order: "asc",
      },
    ],
    queryOptions: {
      enabled: !!topicId,
    },
  });

  // Pobierz tematy dla wybranego kursu
  const selectedCourse = coursesData?.data?.find(c => c.id.toString() === courseId);
  const topics = selectedCourse?.topics || [];

  useEffect(() => {
    register(QUIZ_WIZARD_SCHEMA);
    llmAnalysis.registerOperation(QUIZ_ANALYSIS_OPERATION);

    // Sprawdź kontekst z sesji
    const contextStr = sessionStorage.getItem('wizardContext');
    if (contextStr) {
      const context: WizardContext = JSON.parse(contextStr);
      setContextInfo(context);
      
      // Ustaw wartości z kontekstu
      if (context.courseId) {
        setCourseId(context.courseId.toString());
      }
      if (context.topicId) {
        setTopicId(context.topicId.toString());
      }
      if (context.topicTitle) {
        setTopic(context.topicTitle);
      }
      if (context.materialId) {
        setQuizSource("material");
        setSelectedMaterialId(context.materialId.toString());
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
      if (selectedTopic && !topic) {
        setTopic(selectedTopic.title);
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
    if (quizSource === "material" && !selectedMaterialId) {
      newErrors.materialId = errorTexts.materialRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;

    try {
      const formData: any = {
        courseId: parseInt(courseId),
        topicId: parseInt(topicId),
        topic: topic.trim(),
        difficulty,
        questionsCount,
        questionTypes,
        courseTitle: selectedCourse?.title,
        topicTitle: topics.find(t => t.id.toString() === topicId)?.title,
        quizSource,
      };

      // Jeśli wybrano materiał, pobierz jego treść
      if (quizSource === "material" && selectedMaterialId) {
        const selectedMaterial = materialsData?.data?.find(
          m => m.id.toString() === selectedMaterialId
        );
        if (selectedMaterial) {
          formData.materialContent = selectedMaterial.content;
          formData.materialTitle = selectedMaterial.title;
          formData.materialId = parseInt(selectedMaterialId);
          formData.basedOnMaterial = true;
        }
      } else if (contextInfo?.materialId && materialData?.data) {
        // Jeśli przyszliśmy z kontekstu materiału
        formData.materialContent = materialData.data.content;
        formData.materialTitle = materialData.data.title;
        formData.materialId = contextInfo.materialId;
        formData.basedOnMaterial = true;
      }

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
    <SubPage>
      <div className="border rounded-lg bg-white shadow relative pb-6">
        <StepsHero step={1} />

        <div className="p-6">
          <StepsHeader
            title={steps[1].title}
            description={steps[1].description}
          />

          {/* Alert o kontekście materiału */}
          {contextInfo?.materialId && materialData && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Generujesz quiz na podstawie materiału:</strong>
                <br />
                <span className="text-sm">{materialData.data.title}</span>
                <br />
                <span className="text-xs text-muted-foreground mt-1">
                  Pytania będą generowane z treści tego materiału
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Standardowy alert o kontekście kursu */}
          {contextInfo && !contextInfo.materialId && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Tworzysz quiz dla: <strong>{contextInfo.courseTitle}</strong>
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
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-600" />
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
                        setSelectedMaterialId(""); // Reset material selection
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
                      onValueChange={(value) => {
                        setTopicId(value);
                        setSelectedMaterialId(""); // Reset material selection
                      }}
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

            {/* Wybór źródła quizu */}
            {topicId && !contextInfo?.materialId && (
              <div>
                <Label>Źródło pytań</Label>
                <Tabs value={quizSource} onValueChange={(v) => setQuizSource(v as "general" | "material")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">Wiedza ogólna</TabsTrigger>
                    <TabsTrigger value="material">Z materiału</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">
                          Pytania będą generowane na podstawie ogólnej wiedzy z wybranego tematu
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="material">
                    <Card>
                      <CardContent className="pt-6">
                        {materialsLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                        ) : materialsData?.data?.length === 0 ? (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Brak materiałów w tym temacie. Najpierw dodaj materiał edukacyjny.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div>
                            <Label htmlFor="materialId">
                              Wybierz materiał <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={selectedMaterialId}
                              onValueChange={setSelectedMaterialId}
                              disabled={llmAnalysis.loading}
                            >
                              <SelectTrigger className={errors.materialId ? "border-red-300" : ""}>
                                <SelectValue placeholder="Wybierz materiał..." />
                              </SelectTrigger>
                              <SelectContent>
                                {materialsData?.data?.map((material) => (
                                  <SelectItem key={material.id} value={material.id.toString()}>
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4" />
                                      <span>{material.position}. {material.title}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.materialId && (
                              <p className="text-sm text-red-600 mt-1">{errors.materialId}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                              Pytania będą tworzone WYŁĄCZNIE z treści wybranego materiału
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Szczegóły quizu */}
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
              <p className="text-sm text-muted-foreground mt-1">
                {contextInfo?.materialId || quizSource === "material"
                  ? "Quiz będzie generowany z treści materiału"
                  : "Możesz dostosować temat quizu lub pozostawić sugerowany"}
              </p>
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
                onChange={(e) =>
                  setQuestionsCount(parseInt(e.target.value) || 0)
                }
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
              disabled={llmAnalysis.loading || (materialLoading && !!contextInfo?.materialId)}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2"
            >
              {llmAnalysis.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {contextInfo?.materialId || quizSource === "material" ? "Analizuję materiał..." : steps[1].loading}
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