// src/pages/student/components/StudentCourseDetail.tsx - POPRAWIONY
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, Target, BookOpen, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SubPage } from "@/components/layout";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { ActivityCard } from "./ActivityCard";
import { useRPC } from "../hooks/useRPC";
import { useSupabaseQuery } from "../hooks/useSupabaseQuery";

export const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Pobierz strukturę kursu przez RPC
  const { data: courseStructure, isLoading } = useRPC<any[]>(
    'get_course_structure',
    { p_course_id: parseInt(courseId!) },
    { enabled: !!courseId }
  );

  // Pobierz dane kursu
  const { data: courseData } = useSupabaseQuery('courses', {
    filters: [{ field: 'id', operator: 'eq', value: parseInt(courseId!) }],
    enabled: !!courseId
  });

  // Grupuj aktywności według tematów - PRZENIESIONE PRZED WARUNKIEM
  const topicsWithActivities = React.useMemo(() => {
    if (!courseStructure) return [];
    
    const grouped = courseStructure.reduce((acc, item) => {
      const topicKey = `${item.topic_id}-${item.topic_title}`;
      if (!acc[topicKey]) {
        acc[topicKey] = {
          id: item.topic_id,
          title: item.topic_title,
          position: item.topic_position,
          activities: []
        };
      }
      
      if (item.activity_id) {
        acc[topicKey].activities.push({
          id: item.activity_id,
          title: item.activity_title,
          type: item.activity_type,
          position: item.activity_position,
          completed: item.is_completed,
          score: item.score
        });
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped).sort((a, b) => a.position - b.position);
  }, [courseStructure]);

  // Oblicz statystyki - PRZENIESIONE PRZED WARUNKIEM
  const stats = React.useMemo(() => {
    const allActivities = topicsWithActivities.flatMap(t => t.activities);
    const completed = allActivities.filter(a => a.completed).length;
    const total = allActivities.length;
    
    return {
      totalActivities: total,
      completedActivities: completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      topics: topicsWithActivities.length
    };
  }, [topicsWithActivities]);

  // WARUNEK LOADING PO WSZYSTKICH HOOKACH
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
                <span className="text-5xl">{course?.icon_emoji || '📚'}</span>
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
              <p className="text-2xl font-bold">{stats.completedActivities}/{stats.totalActivities}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Tematy</p>
              <p className="text-2xl font-bold">{stats.topics}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Czas trwania</p>
              <p className="text-2xl font-bold">~{Math.ceil(stats.totalActivities * 15 / 60)}h</p>
            </div>
          </div>

          <Progress value={stats.progress} className="mt-6 h-3 bg-white/20" />
        </div>

        {/* Tematy i aktywności */}
        <div className="space-y-6">
          {topicsWithActivities.map((topic) => {
            const topicCompleted = topic.activities.filter((a: any) => a.completed).length;
            const isTopicComplete = topicCompleted === topic.activities.length;

            return (
              <Card key={topic.id}>
                <CardHeader>
                  <FlexBox>
                    <div>
                      <CardTitle className="text-xl">
                        Temat {topic.position}: {topic.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {topicCompleted}/{topic.activities.length} aktywności ukończonych
                      </p>
                    </div>
                    {isTopicComplete && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Ukończony
                      </Badge>
                    )}
                  </FlexBox>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topic.activities.map((activity: any) => (
                    <ActivityCard
                      key={activity.id}
                      activity={{
                        id: activity.id,
                        title: activity.title,
                        type: activity.type,
                        completed: activity.completed,
                        score: activity.score,
                        points: activity.type === 'quiz' ? 20 : 10,
                      }}
                      onStart={() => {
                        if (activity.type === 'quiz') {
                          navigate(`/student/courses/${courseId}/quiz/${activity.id}`);
                        } else {
                          navigate(`/student/courses/${courseId}/lesson/${activity.id}`);
                        }
                      }}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </SubPage>
  );
};