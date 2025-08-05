import { useState } from "react";
import { useOne, useNavigation, useList, useDelete } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Users,
  FileText,
  Plus,
  Wand,
  Brain,
  Layout,
  Sparkles,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { FlexBox, GridBox } from "@/components/shared";
import { SubPage } from "@/components/layout";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { TopicCard } from "./components/TopicCard";
import { ActivityCard } from "./components/ActivityCard";
import { CourseOverview } from "./components/CourseOverview";

interface Topic {
  id: number;
  title: string;
  position: number;
  is_published: boolean;
  _count?: {
    activities: number;
  };
}

interface Activity {
  id: number;
  title: string;
  type: "material" | "quiz";
  position: number;
  is_published: boolean;
  duration_min?: number;
  topic_id: number;
  _count?: {
    questions: number;
  };
}

export const CoursesShow = () => {
  const { list, edit } = useNavigation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pobierz ID rozwinietego tematu z URL
  const expandedTopicId = searchParams.get("expanded");

  const { mutate: deleteTopic } = useDelete();
  const { mutate: deleteActivity } = useDelete();

  const { data: courseData, isLoading: courseLoading } = useOne({
    resource: "courses",
    id: id as string,
  });

  const {
    data: topicsData,
    isLoading: topicsLoading,
    refetch: refetchTopics,
  } = useList<Topic>({
    resource: "topics",
    filters: [
      {
        field: "course_id",
        operator: "eq",
        value: id,
      },
    ],
    sorters: [
      {
        field: "position",
        order: "asc",
      },
    ],
    meta: {
      select: "*, activities(count)",
    },
  });

  const { data: activitiesData, refetch: refetchActivities } =
    useList<Activity>({
      resource: "activities",
      filters: [
        {
          field: "topic_id",
          operator: "in",
          value: topicsData?.data?.map((t) => t.id) || [],
        },
      ],
      sorters: [
        {
          field: "position",
          order: "asc",
        },
      ],
      meta: {
        select: "*, questions(count)",
      },
      queryOptions: {
        enabled: !!topicsData?.data?.length,
      },
    });

  const { data: accessData } = useList({
    resource: "course_access",
    filters: [
      {
        field: "course_id",
        operator: "eq",
        value: id,
      },
    ],
  });

  if (courseLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const course = courseData?.data;

  // Funkcja do przełączania tematu - tylko jeden może być rozwinięty
  const toggleTopic = (topicId: number) => {
    if (expandedTopicId === topicId.toString()) {
      // Jeśli klikamy na już rozwinięty temat, zwiń go
      searchParams.delete("expanded");
      setSearchParams(searchParams);
    } else {
      // Rozwiń nowy temat
      setSearchParams({ expanded: topicId.toString() });
    }
  };

  const handleDeleteTopic = (topicId: number, title: string) => {
    if (
      confirm(
        `Czy na pewno chcesz usunąć temat "${title}" wraz ze wszystkimi aktywnościami?`
      )
    ) {
      deleteTopic(
        {
          resource: "topics",
          id: topicId,
        },
        {
          onSuccess: () => {
            toast.success("Temat został usunięty");
            refetchTopics();
            refetchActivities();
            // Usuń z URL jeśli to był rozwinięty temat
            if (expandedTopicId === topicId.toString()) {
              searchParams.delete("expanded");
              setSearchParams(searchParams);
            }
          },
        }
      );
    }
  };

  const handleDeleteActivity = (activityId: number, title: string) => {
    if (confirm(`Czy na pewno chcesz usunąć aktywność "${title}"?`)) {
      deleteActivity(
        {
          resource: "activities",
          id: activityId,
        },
        {
          onSuccess: () => {
            toast.success("Aktywność została usunięta");
            refetchActivities();
            refetchTopics();
          },
        }
      );
    }
  };

  const getActivitiesForTopic = (topicId: number) => {
    return (
      activitiesData?.data?.filter(
        (activity) => activity.topic_id === topicId
      ) || []
    );
  };

  // Funkcja do nawigacji z URL powrotu
  const navigateWithReturn = (path: string) => {
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    const returnUrl = encodeURIComponent(currentUrl);
    navigate(`${path}${path.includes("?") ? "&" : "?"}returnUrl=${returnUrl}`);
  };

  // Funkcja do nawigacji do wizarda z kontekstem
  const navigateToWizard = (wizardPath: string, context?: any) => {
    if (context) {
      sessionStorage.setItem("wizardContext", JSON.stringify(context));
    }
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    sessionStorage.setItem("returnUrl", currentUrl);
    navigate(wizardPath);
  };

  return (
    <SubPage>
      <Button variant="outline" size="sm" onClick={() => list("courses")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      {/* Nagłówek kursu z opisem */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Szczegóły kursu</h1>
          <Button 
            onClick={() => edit("courses", course?.id ?? 0)}
            size="sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edytuj kurs
          </Button>
        </div>
        <CourseOverview course={course} />
      </div>

      {/* Statystyki kursu */}
      <GridBox variant="2-2-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={course?.is_published ? "default" : "secondary"}>
              {course?.is_published ? "Opublikowany" : "Szkic"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tematy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicsData?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktywności</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activitiesData?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uczestników</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessData?.total || 0}</div>
          </CardContent>
        </Card>
      </GridBox>

    

      {/* Struktura kursu */}
      <Card>
        <CardHeader>
          <FlexBox>
            <CardTitle>Struktura kursu</CardTitle>
            <Button
              size="sm"
              onClick={() =>
                navigateWithReturn(`/topics/create?course_id=${id}`)
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj temat
            </Button>
          </FlexBox>
        </CardHeader>
        <CardContent>
          {topicsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : topicsData?.data?.length ? (
            <div className="space-y-4">
              {topicsData.data.map((topic: Topic) => {
                const activities = getActivitiesForTopic(topic.id);
                const isExpanded = expandedTopicId === topic.id.toString();

                return (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    isExpanded={isExpanded}
                    onToggle={() => toggleTopic(topic.id)}
                    onDelete={handleDeleteTopic}
                    onEdit={(resource, id) =>
                      navigateWithReturn(`/${resource}/edit/${id}`)
                    }
                    activitiesCount={activities.length}
                    onNavigateToWizard={navigateToWizard}
                    courseId={Number(course?.id)}
                    courseTitle={course?.title}
                  >
                    {activities.length > 0 ? (
                      activities.map((activity: Activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          topicPosition={topic.position}
                          onDelete={handleDeleteActivity}
                          onEdit={(resource, id) =>
                            navigateWithReturn(`/${resource}/edit/${id}`)
                          }
                        />
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>Brak aktywności w tym temacie</p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigateWithReturn(
                                `/activities/create?topic_id=${topic.id}`
                              )
                            }
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Dodaj ręcznie
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              navigateToWizard("/educational-material/step1", {
                                courseId: course?.id,
                                courseTitle: course?.title,
                                topicId: topic.id,
                                topicTitle: topic.title,
                              })
                            }
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generuj materiał z AI
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              navigateToWizard("/quiz-wizard/step1", {
                                courseId: course?.id,
                                courseTitle: course?.title,
                                topicId: topic.id,
                                topicTitle: topic.title,
                              })
                            }
                          >
                            <Brain className="w-4 h-4 mr-2" />
                            Generuj quiz z AI
                          </Button>
                        </div>
                      </div>
                    )}
                  </TopicCard>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Brak tematów w tym kursie</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Button
                  onClick={() =>
                    navigateWithReturn(`/topics/create?course_id=${id}`)
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj pierwszy temat
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    navigateToWizard("/course-structure/step1", {
                      courseId: course?.id,
                      courseTitle: course?.title,
                      mode: "extend", // Tryb rozszerzania istniejącego kursu
                    })
                  }
                >
                  <Layout className="w-4 h-4 mr-2" />
                  Wygeneruj strukturę z AI
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grupy z dostępem */}
      <Card>
        <CardHeader>
          <CardTitle>Grupy z dostępem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Lista grup (do implementacji)</p>
          </div>
        </CardContent>
      </Card>

        {/* Szybkie akcje AI */}
        <Card className="border-dashed border-2 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Szybkie akcje AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4 bg-white"
              onClick={() => navigateToWizard("/course-structure/step1")}
            >
              <div className="flex items-start gap-3">
                <Layout className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Rozbuduj strukturę kursu</div>
                  <div className="text-xs text-muted-foreground">
                    Dodaj nowe tematy z AI
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4 bg-white"
              onClick={() =>
                navigateToWizard("/educational-material/step1", {
                  courseId: course?.id,
                  courseTitle: course?.title,
                })
              }
            >
              <div className="flex items-start gap-3">
                <Wand className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Generuj materiał</div>
                  <div className="text-xs text-muted-foreground">
                    Stwórz treści z AI
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4 bg-white"
              onClick={() =>
                navigateToWizard("/quiz-wizard/step1", {
                  courseId: course?.id,
                  courseTitle: course?.title,
                })
              }
            >
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Stwórz quiz</div>
                  <div className="text-xs text-muted-foreground">
                    Quiz sprawdzający z AI
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};