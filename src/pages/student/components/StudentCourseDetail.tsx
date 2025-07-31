// src/pages/student/components/StudentCourseDetail.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne, useList } from "@refinedev/core";
import { ChevronLeft, Clock, Target, BookOpen, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SubPage } from "@/components/layout";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { ActivityCard } from "./ActivityCard";

export const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Pobierz dane kursu
  const { data: courseData, isLoading: courseLoading } = useOne({
    resource: "courses",
    id: courseId!,
  });

  // Pobierz tematy kursu
  const { data: topicsData, isLoading: topicsLoading } = useList({
    resource: "topics",
    filters: [
      {
        field: "course_id",
        operator: "eq",
        value: courseId,
      },
    ],
    sorters: [
      {
        field: "position",
        order: "asc",
      },
    ],
  });

  // Pobierz aktywności
  const { data: activitiesData } = useList({
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
    queryOptions: {
      enabled: !!topicsData?.data?.length,
    },
  });

  // Pobierz postępy użytkownika
  const { data: progressData } = useList({
    resource: "activity_progress",
    filters: [
      {
        field: "activity_id",
        operator: "in",
        value: activitiesData?.data?.map(a => a.id) || [],
      },
    ],
    queryOptions: {
      enabled: !!activitiesData?.data?.length,
    },
  });

  if (courseLoading || topicsLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const course = courseData?.data;
  const topics = topicsData?.data || [];
  const activities = activitiesData?.data || [];
  const progress = progressData?.data || [];

  // Oblicz postęp kursu
  const completedActivities = progress.filter(p => p.completed_at).length;
  const totalActivities = activities.length;
  const courseProgress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

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
              {courseProgress}% ukończone
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8">
            <div>
              <p className="text-sm text-white/60">Postęp</p>
              <p className="text-2xl font-bold">{completedActivities}/{totalActivities}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Tematy</p>
              <p className="text-2xl font-bold">{topics.length}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Czas trwania</p>
              <p className="text-2xl font-bold">~{Math.ceil(totalActivities * 15 / 60)}h</p>
            </div>
          </div>

          <Progress value={courseProgress} className="mt-6 h-3 bg-white/20" />
        </div>

        {/* Tematy i aktywności */}
        <div className="space-y-6">
          {topics.map((topic) => {
            const topicActivities = activities.filter(a => a.topic_id === topic.id);
            const topicProgress = progress.filter(p => 
              topicActivities.some(a => a.id === p.activity_id) && p.completed_at
            ).length;

            return (
              <Card key={topic.id}>
                <CardHeader>
                  <FlexBox>
                    <div>
                      <CardTitle className="text-xl">
                        Temat {topic.position}: {topic.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {topicProgress}/{topicActivities.length} aktywności ukończonych
                      </p>
                    </div>
                    {topicProgress === topicActivities.length && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Ukończony
                      </Badge>
                    )}
                  </FlexBox>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topicActivities.map((activity) => {
                    const activityProgress = progress.find(p => p.activity_id === activity.id);
                    
                    return (
                      <ActivityCard
                        key={activity.id}
                        activity={{
                          id: activity.id,
                          title: activity.title,
                          type: activity.type,
                          completed: !!activityProgress?.completed_at,
                          score: activityProgress?.score,
                          duration: activity.duration_min,
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
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </SubPage>
  );
};