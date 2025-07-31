import { useOne, useNavigation, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit,
  FileText,
  HelpCircle,
  Clock,
  Target,
  Timer,
  RefreshCw,
  ListChecks,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { BackToCourseButton } from "../courses/components/BackToCourseButton";

export const ActivitiesShow = () => {
  const { edit } = useNavigation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: activityData, isLoading } = useOne({
    resource: "activities",
    id: id as string,
    meta: {
      select: "*, topics(*, courses(*)), questions:questions(count)",
    },
  });

  // Pobierz listę pytań dla quizu
  const { data: questionsData, isLoading: questionsLoading } = useList({
    resource: "questions",
    filters: [
      {
        field: "activity_id",
        operator: "eq",
        value: parseInt(id as string),
      },
    ],
    sorters: [
      {
        field: "position",
        order: "asc",
      },
    ],
    queryOptions: {
      enabled: activityData?.data?.type === "quiz" && !!id,
    },
  });

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const activity = activityData?.data;
  const topic = activity?.topics;
  const course = topic?.courses;
  
  // Obsługa różnych formatów odpowiedzi Supabase dla count
  const questionsCount = activity?.questions?.[0]?.count || activity?._count?.questions || 0;

  const handleEdit = () => {
    // Zapisz obecny stan przed edycją
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('returnUrl', currentUrl);
    edit("activities", activity?.id ?? "");
  };

  const handleNavigateWithState = (path: string) => {
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('returnUrl', currentUrl);
    navigate(path);
  };

  const getActivityIcon = () => {
    return activity?.type === "quiz" ? (
      <HelpCircle className="w-6 h-6 text-blue-500" />
    ) : (
      <FileText className="w-6 h-6 text-green-500" />
    );
  };

  return (
    <SubPage>
      <BackToCourseButton />

      <FlexBox>
        <Lead
          title={
            <div className="flex items-center gap-3">
              {getActivityIcon()}
              {activity?.title}
            </div>
          }
          description={
            <div>
              <div className="text-sm text-muted-foreground">
                {course?.title} → Temat {topic?.position}: {topic?.title}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={activity?.type === "quiz" ? "default" : "outline"}
                >
                  {activity?.type === "quiz" ? "Quiz" : "Materiał"}
                </Badge>
                <Badge
                  variant={activity?.is_published ? "default" : "secondary"}
                >
                  {activity?.is_published ? "Opublikowany" : "Szkic"}
                </Badge>
              </div>
            </div>
          }
        />
        <div className="flex gap-2">
          {activity?.type === "quiz" && (
            <Button
              variant="outline"
              onClick={() => handleNavigateWithState(`/questions/manage/${activity.id}`)}
            >
              <ListChecks className="w-4 h-4 mr-2" />
              Pytania ({questionsCount})
            </Button>
          )}
          <Button onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edytuj
          </Button>
        </div>
      </FlexBox>

      {/* Informacje o aktywności */}
      <GridBox variant="2-2-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Czas trwania
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activity?.duration_min || "-"} min
            </div>
          </CardContent>
        </Card>

        {activity?.type === "quiz" && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Próg zaliczenia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activity?.passing_score || 70}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Limit czasu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activity?.time_limit || "Brak"}
                  {activity?.time_limit && " min"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Liczba prób
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activity?.max_attempts || "Bez limitu"}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </GridBox>

      {/* Treść materiału */}
      {activity?.type === "material" && activity?.content && (
        <Card>
          <CardHeader>
            <CardTitle>Treść materiału</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{activity.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informacje o quizie */}
      {activity?.type === "quiz" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Informacje o quizie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questionsCount === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium text-muted-foreground mb-4">
                      Ten quiz nie ma jeszcze pytań
                    </p>
                    <Button
                      onClick={() => handleNavigateWithState(`/questions/manage/${activity.id}`)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Dodaj pytania
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Liczba pytań
                        </p>
                        <p className="text-2xl font-bold">
                          {questionsCount}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Wymagany wynik
                        </p>
                        <p className="text-2xl font-bold">
                          {activity.passing_score || 70}%
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Limit czasu
                        </p>
                        <p className="text-2xl font-bold">
                          {activity.time_limit
                            ? `${activity.time_limit} min`
                            : "Brak"}
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleNavigateWithState(`/questions/manage/${activity.id}`)}
                    >
                      <ListChecks className="w-4 h-4 mr-2" />
                      Zarządzaj pytaniami
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lista pytań */}
          {questionsCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pytania w quizie</span>
                  <Badge variant="outline">
                    {questionsData?.data?.length || 0} pytań
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {questionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questionsData?.data?.map((question, index) => (
                      <div 
                        key={question.id} 
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {question.type === 'single_choice' && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Jednokrotny wybór
                                </Badge>
                              )}
                              {question.type === 'multiple_choice' && (
                                <Badge variant="outline" className="text-xs">
                                  <ListChecks className="w-3 h-3 mr-1" />
                                  Wielokrotny wybór
                                </Badge>
                              )}
                              {question.type === 'true_false' && (
                                <Badge variant="outline" className="text-xs">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Prawda/Fałsz
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {question.points} pkt
                              </Badge>
                            </div>
                            <p className="font-medium">{question.content}</p>
                            {question.explanation && (
                              <p className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium">Wyjaśnienie:</span> {question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Metadane */}
      <Card>
        <CardHeader>
          <CardTitle>Szczegóły</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pozycja w temacie:</span>
              <span className="font-medium">{activity?.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={activity?.is_published ? "default" : "secondary"}>
                {activity?.is_published ? "Opublikowany" : "Szkic"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Utworzono:</span>
              <span>
                {new Date(activity?.created_at).toLocaleDateString("pl-PL")}
              </span>
            </div>
            {activity?.updated_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Ostatnia aktualizacja:
                </span>
                <span>
                  {new Date(activity.updated_at).toLocaleDateString("pl-PL")}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};