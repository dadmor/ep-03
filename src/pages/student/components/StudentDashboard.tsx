// src/pages/student/components/StudentDashboard.tsx - FINALNIE POPRAWIONY
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Trophy, Flame, Target, Clock, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SubPage } from "@/components/layout";
import { GridBox, FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { toast } from "sonner";
import { supabaseClient } from "@/utility";
import { StatCard } from "./StatCard";
import { CourseCard } from "./CourseCard";
import { ActivityCard } from "./ActivityCard";
import { useStudentStats } from "../hooks";
import { useRPC } from "../hooks/useRPC";
import { useSupabaseQuery } from "../hooks/useSupabaseQuery";

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<any>();
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useStudentStats();
  
  // Pobierz kursy ucznia używając RPC
  const { data: coursesData, isLoading: coursesLoading } = useRPC<any[]>('get_my_courses');

  // Pobierz ostatnie aktywności używając Supabase query
  const { data: activitiesData } = useSupabaseQuery('activity_progress', {
    select: `
      *,
      activities!inner(
        id,
        title,
        type,
        topics!inner(
          id,
          title,
          courses!inner(
            id,
            title,
            icon_emoji
          )
        )
      )
    `,
    filters: identity?.id ? [
      {
        field: 'user_id',
        operator: 'eq',
        value: identity.id,
      },
    ] : [],
    sorts: [
      {
        field: 'started_at',
        order: 'desc',
      },
    ],
    limit: 5,
    enabled: !!identity?.id,
  });

  const handleClaimRewards = async () => {
    try {
      const { data: result, error } = await supabaseClient.rpc('claim_daily_rewards');
      
      if (error) throw error;
      
      if (result) {
        toast.success(`Odebrano ${result.total_earned} punktów!`, {
          description: result.daily_points > 0 
            ? `Seria ${result.streak} dni!` 
            : "Punkty idle zebrane"
        });
        refetchStats();
      }
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Nie można odebrać nagród");
    }
  };

  const levelProgress = stats.level > 0 
    ? ((stats.points - ((stats.level - 1) * (stats.level - 1) * 100)) / 
       ((stats.level * stats.level * 100) - ((stats.level - 1) * (stats.level - 1) * 100))) * 100
    : 0;

  if (statsLoading || coursesLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const courses = coursesData || [];
  const activities = activitiesData || [];

  return (
    <SubPage>
      <div className="space-y-6">
        {/* Powitanie */}
        <FlexBox>
          <Lead
            title={`Witaj, ${identity?.full_name || 'Uczniu'}! 👋`}
            description="Kontynuuj swoją przygodę z nauką"
          />
          <Button
            onClick={handleClaimRewards}
            variant="outline"
            className="gap-2"
          >
            <Gift className="w-4 h-4" />
            Odbierz nagrody
          </Button>
        </FlexBox>

        {/* Statystyki */}
        <GridBox variant="2-2-4">
          <StatCard 
            icon={Trophy} 
            label="Poziom" 
            value={stats.level} 
            color="yellow"
            subtitle={`${stats.points}/${stats.next_level_points} pkt`}
          />
          <StatCard 
            icon={Flame} 
            label="Seria dni" 
            value={stats.streak} 
            color="orange"
            trend={stats.streak > 7 ? 15 : 0}
          />
          <StatCard 
            icon={Target} 
            label="Ukończone quizy" 
            value={stats.quizzes_completed} 
            color="green"
          />
          <StatCard 
            icon={Clock} 
            label="Czas nauki" 
            value={`${Math.floor(stats.total_time / 60)}h`} 
            color="purple"
          />
        </GridBox>

        {/* Postęp poziomu */}
        <Card>
          <CardHeader>
            <FlexBox>
              <CardTitle>Postęp poziomu</CardTitle>
              <span className="text-sm text-muted-foreground">
                Poziom {stats.level} → {stats.level + 1}
              </span>
            </FlexBox>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={levelProgress} className="h-3" />
            <FlexBox>
              <span className="text-sm text-muted-foreground">
                {stats.points} punktów
              </span>
              <span className="text-sm font-medium">
                {stats.next_level_points - stats.points} punktów do następnego poziomu
              </span>
            </FlexBox>
          </CardContent>
        </Card>

        {/* Aktywne kursy */}
        {courses.length > 0 && (
          <div>
            <FlexBox className="mb-4">
              <h2 className="text-xl font-bold">Twoje kursy</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student/courses")}
              >
                Zobacz wszystkie
              </Button>
            </FlexBox>
            
            <GridBox>
              {courses.slice(0, 3).map((course: any) => (
                <CourseCard 
                  key={course.course_id}
                  course={{
                    id: course.course_id,
                    title: course.title,
                    emoji: course.icon_emoji || '📚',
                    progress: course.progress_percent || 0,
                    lastActivity: course.last_activity 
                      ? new Date(course.last_activity).toLocaleDateString('pl-PL')
                      : null
                  }}
                  onClick={() => navigate(`/student/courses/${course.course_id}`)}
                />
              ))}
            </GridBox>
          </div>
        )}

        {/* Ostatnie aktywności */}
        {activities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ostatnie aktywności</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.map((progress: any) => (
                <ActivityCard
                  key={progress.activity_id}
                  activity={{
                    id: progress.activity_id,
                    title: progress.activities?.title || 'Bez tytułu',
                    type: progress.activities?.type || 'material',
                    completed: !!progress.completed_at,
                    score: progress.score,
                    courseTitle: progress.activities?.topics?.courses?.title,
                    courseEmoji: progress.activities?.topics?.courses?.icon_emoji
                  }}
                  onStart={() => {
                    const courseId = progress.activities?.topics?.courses?.id;
                    const activityId = progress.activity_id;
                    if (courseId && activityId) {
                      if (progress.activities?.type === 'quiz') {
                        navigate(`/student/courses/${courseId}/quiz/${activityId}`);
                      } else {
                        navigate(`/student/courses/${courseId}/lesson/${activityId}`);
                      }
                    }
                  }}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </SubPage>
  );
};