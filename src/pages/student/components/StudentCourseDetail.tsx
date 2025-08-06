// src/pages/student/components/StudentCourseDetail.tsx - Z PROGRESYWNYM ODBLOKOWYWANIEM
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  Lock,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SubPage } from "@/components/layout";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { ActivityCard } from "./ActivityCard";
import { useRPC } from "../hooks/useRPC";
import { useSupabaseQuery } from "../hooks/useSupabaseQuery";

// Definicje typów
interface CourseStructureItem {
  topic_id: number;
  topic_title: string;
  topic_position: number;
  activity_id: number | null;
  activity_title: string | null;
  activity_type: "material" | "quiz" | null;
  activity_position: number | null;
  is_completed: boolean;
  score: number | null;
}

interface Activity {
  id: number;
  title: string;
  type: "material" | "quiz";
  position: number;
  completed: boolean;
  score: number | null;
}

interface TopicWithActivities {
  id: number;
  title: string;
  position: number;
  activities: Activity[];
  isUnlocked: boolean;
  isCompleted: boolean;
}

interface Course {
  id: number;
  title: string;
  description: string;
  icon_emoji: string;
}

export const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Pobierz strukturę kursu przez RPC
  const { data: courseStructure, isLoading } = useRPC<CourseStructureItem[]>(
    "get_course_structure",
    { p_course_id: parseInt(courseId!) },
    { enabled: !!courseId }
  );

  // Pobierz dane kursu
  const { data: courseData } = useSupabaseQuery<Course>("courses", {
    filters: [{ field: "id", operator: "eq", value: parseInt(courseId!) }],
    enabled: !!courseId,
  });

  // Grupuj aktywności według tematów z logiką odblokowywania
  const topicsWithActivities = React.useMemo(() => {
    if (!courseStructure) return [];

    // Najpierw grupuj aktywności według tematów
    const grouped = courseStructure.reduce((acc, item) => {
      const topicKey = `${item.topic_id}-${item.topic_title}`;
      if (!acc[topicKey]) {
        acc[topicKey] = {
          id: item.topic_id,
          title: item.topic_title,
          position: item.topic_position,
          activities: [],
        };
      }

      if (item.activity_id) {
        acc[topicKey].activities.push({
          id: item.activity_id,
          title: item.activity_title!,
          type: item.activity_type!,
          position: item.activity_position!,
          completed: item.is_completed,
          score: item.score,
        });
      }

      return acc;
    }, {} as Record<string, Omit<TopicWithActivities, 'isUnlocked' | 'isCompleted'>>);

    // Konwertuj na tablicę i posortuj
    const topics = Object.values(grouped).sort((a, b) => a.position - b.position);

    // Dodaj logikę odblokowywania
    return topics.map((topic, index) => {
      // Sprawdź czy wszystkie aktywności w temacie są ukończone
      const isCompleted = topic.activities.length > 0 && 
        topic.activities.every(activity => activity.completed);

      // Pierwszy temat zawsze odblokowany
      // Kolejne tylko jeśli poprzedni jest ukończony
      const isUnlocked = index === 0 || 
        (topics[index - 1].activities.length > 0 && 
         topics[index - 1].activities.every(a => a.completed));

      return {
        ...topic,
        isCompleted,
        isUnlocked
      };
    }) as TopicWithActivities[];
  }, [courseStructure]);

  // Oblicz statystyki
  const stats = React.useMemo(() => {
    const allActivities = topicsWithActivities.flatMap((t) => t.activities);
    const completed = allActivities.filter((a) => a.completed).length;
    const total = allActivities.length;

    return {
      totalActivities: total,
      completedActivities: completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      topics: topicsWithActivities.length,
      unlockedTopics: topicsWithActivities.filter(t => t.isUnlocked).length,
    };
  }, [topicsWithActivities]);

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const course = courseData?.[0];

  return (
    <SubPage>
      <div className="space-y-6">
        {/* Nawigacja */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/student/courses")}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Powrót do kursów
        </Button>

        {/* Nagłówek kursu */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl">{course?.icon_emoji || "📚"}</span>
                <h1 className="text-3xl font-bold">{course?.title}</h1>
              </div>
              <p className="text-white/80 max-w-2xl">{course?.description}</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              {stats.progress}% ukończone
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8">
            <div>
              <p className="text-sm text-white/60">Postęp</p>
              <p className="text-2xl font-bold">
                {stats.completedActivities}/{stats.totalActivities}
              </p>
            </div>
            <div>
              <p className="text-sm text-white/60">Tematy odblokowane</p>
              <p className="text-2xl font-bold">
                {stats.unlockedTopics}/{stats.topics}
              </p>
            </div>
            <div>
              <p className="text-sm text-white/60">Czas trwania</p>
              <p className="text-2xl font-bold">
                ~{Math.ceil((stats.totalActivities * 15) / 60)}h
              </p>
            </div>
          </div>

          <Progress value={stats.progress} className="mt-6 h-3 bg-white/20" />
        </div>

        {/* Alert o progresji */}
        {stats.unlockedTopics < stats.topics && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Kolejne tematy zostaną odblokowane po ukończeniu wszystkich aktywności w bieżącym temacie.
            </AlertDescription>
          </Alert>
        )}

        {/* Tematy i aktywności */}
        <div className="space-y-6">
          {topicsWithActivities.map((topic) => {
            const topicCompleted = topic.activities.filter(
              (a) => a.completed
            ).length;

            return (
              <Card 
                key={topic.id}
                className={!topic.isUnlocked ? 'opacity-60' : ''}
              >
                <CardHeader>
                  <FlexBox>
                    <div className="flex items-center gap-3">
                      {!topic.isUnlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                      <div>
                        <CardTitle className="text-xl">
                          Temat {topic.position}: {topic.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {topicCompleted}/{topic.activities.length} aktywności
                          ukończonych
                        </p>
                      </div>
                    </div>
                    {topic.isCompleted && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Ukończony
                      </Badge>
                    )}
                  </FlexBox>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!topic.isUnlocked ? (
                    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Ten temat zostanie odblokowany po ukończeniu poprzedniego tematu
                      </p>
                    </div>
                  ) : (
                    topic.activities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={{
                          id: activity.id,
                          title: activity.title,
                          type: activity.type,
                          completed: activity.completed,
                          score: activity.score,
                          points: activity.type === "quiz" ? 20 : 10,
                        }}
                        onStart={() => {
                          if (activity.type === "quiz") {
                            navigate(
                              `/student/courses/${courseId}/quiz/${activity.id}`
                            );
                          } else {
                            navigate(
                              `/student/courses/${courseId}/lesson/${activity.id}`
                            );
                          }
                        }}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </SubPage>
  );
};