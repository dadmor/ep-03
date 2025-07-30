import { useState } from "react";
import { useOne, useNavigation, useList, useDelete, useUpdate } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, Edit, Users, FileText, Plus, MoreVertical, 
  Trash2, Eye, Clock, HelpCircle, ChevronDown, ChevronRight,
  GripVertical, ListChecks
} from "lucide-react";
import { Button, Badge, Input, Switch } from "@/components/ui";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Topic {
  id: number;
  title: string;
  position: number;
  is_published: boolean;
  _count?: {
    activities: number;
  };
  activities?: Activity[];
}

interface Activity {
  id: number;
  title: string;
  type: 'material' | 'quiz';
  position: number;
  is_published: boolean;
  duration_min?: number;
  _count?: {
    questions: number;
  };
}

export const CoursesShow = () => {
  const { list, edit, create } = useNavigation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [editingTopic, setEditingTopic] = useState<number | null>(null);
  const [editingTopicTitle, setEditingTopicTitle] = useState("");

  const { mutate: deleteTopic } = useDelete();
  const { mutate: deleteActivity } = useDelete();
  const { mutate: updateTopic } = useUpdate();

  const { data: courseData, isLoading: courseLoading } = useOne({
    resource: "courses",
    id: id as string,
  });

  const { data: topicsData, isLoading: topicsLoading, refetch: refetchTopics } = useList<Topic>({
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
      select: '*, activities(count)'
    }
  });

  // Pobierz aktywności dla wszystkich tematów
  const { data: activitiesData, refetch: refetchActivities } = useList<Activity>({
    resource: "activities",
    filters: [
      {
        field: "topic_id",
        operator: "in",
        value: topicsData?.data?.map(t => t.id) || [],
      },
    ],
    sorters: [
      {
        field: "position",
        order: "asc",
      },
    ],
    meta: {
      select: '*, questions(count)'
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

  const toggleTopic = (topicId: number) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const handleDeleteTopic = (topicId: number, title: string) => {
    if (confirm(`Czy na pewno chcesz usunąć temat "${title}" wraz ze wszystkimi aktywnościami?`)) {
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

  const handleEditTopicTitle = (topic: Topic) => {
    setEditingTopic(topic.id);
    setEditingTopicTitle(topic.title);
  };

  const handleSaveTopicTitle = () => {
    if (editingTopic && editingTopicTitle.trim()) {
      updateTopic(
        {
          resource: "topics",
          id: editingTopic,
          values: { title: editingTopicTitle },
        },
        {
          onSuccess: () => {
            toast.success("Tytuł tematu został zaktualizowany");
            setEditingTopic(null);
            setEditingTopicTitle("");
            refetchTopics();
          },
        }
      );
    }
  };

  const getActivityIcon = (type: string) => {
    return type === 'quiz' ? <HelpCircle className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-green-500" />;
  };

  const getActivitiesForTopic = (topicId: number) => {
    return activitiesData?.data?.filter(activity => activity.topic_id === topicId) || [];
  };

  return (
    <SubPage>
      <Button variant="outline" size="sm" onClick={() => list("courses")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <Lead
          title={
            <div className="flex items-center gap-3">
              {course?.icon_emoji && (
                <span className="text-4xl">{course.icon_emoji}</span>
              )}
              {course?.title}
            </div>
          }
          description={course?.description}
        />
        <Button onClick={() => edit("courses", course?.id ?? "")}>
          <Edit className="w-4 h-4 mr-2" />
          Edytuj kurs
        </Button>
      </FlexBox>

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
            <div className="text-2xl font-bold">{activitiesData?.total || 0}</div>
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
              onClick={() => navigate(`/topics/create?course_id=${id}`)}
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
                const isExpanded = expandedTopics.has(topic.id);
                const isEditing = editingTopic === topic.id;

                return (
                  <div key={topic.id} className="border rounded-lg">
                    {/* Nagłówek tematu */}
                    <div className="p-4 bg-muted/30">
                      <FlexBox>
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleTopic(topic.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          
                          {isEditing ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editingTopicTitle}
                                onChange={(e) => setEditingTopicTitle(e.target.value)}
                                onBlur={handleSaveTopicTitle}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveTopicTitle();
                                  if (e.key === 'Escape') {
                                    setEditingTopic(null);
                                    setEditingTopicTitle("");
                                  }
                                }}
                                className="h-8"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => toggleTopic(topic.id)}
                            >
                              <h4 className="font-medium">
                                {topic.position}. {topic.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {activities.length} aktywności
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={topic.is_published ? "default" : "secondary"}>
                            {topic.is_published ? "Opublikowany" : "Szkic"}
                          </Badge>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTopicTitle(topic)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Zmień nazwę
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => edit("topics", topic.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edytuj szczegóły
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => navigate(`/activities/create?topic_id=${topic.id}`)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Dodaj aktywność
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTopic(topic.id, topic.title)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Usuń temat
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </FlexBox>
                    </div>

                    {/* Lista aktywności */}
                    {isExpanded && (
                      <div className="p-4 space-y-2">
                        {activities.length > 0 ? (
                          activities.map((activity: Activity) => (
                            <div 
                              key={activity.id} 
                              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                              {getActivityIcon(activity.type)}
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {topic.position}.{activity.position} {activity.title}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {activity.type === 'quiz' ? 'Quiz' : 'Materiał'}
                                  </Badge>
                                  {activity.type === 'quiz' && activity._count?.questions !== undefined && (
                                    <Badge variant="outline" className="text-xs">
                                      {activity._count.questions} pytań
                                    </Badge>
                                  )}
                                </div>
                                {activity.duration_min && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Clock className="w-3 h-3" />
                                    {activity.duration_min} min
                                  </div>
                                )}
                              </div>

                              <Badge variant={activity.is_published ? "default" : "secondary"}>
                                {activity.is_published ? "Opublikowany" : "Szkic"}
                              </Badge>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/activities/show/${activity.id}`)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Podgląd
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => edit("activities", activity.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edytuj
                                  </DropdownMenuItem>
                                  {activity.type === 'quiz' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => navigate(`/questions/manage/${activity.id}`)}
                                        className="text-blue-600"
                                      >
                                        <ListChecks className="mr-2 h-4 w-4" />
                                        Zarządzaj pytaniami
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteActivity(activity.id, activity.title)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Usuń
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            <p>Brak aktywności w tym temacie</p>
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => navigate(`/activities/create?topic_id=${topic.id}`)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Dodaj pierwszą aktywność
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Brak tematów w tym kursie</p>
              <Button
                className="mt-4"
                onClick={() => navigate(`/topics/create?course_id=${id}`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj pierwszy temat
              </Button>
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
    </SubPage>
  );
};