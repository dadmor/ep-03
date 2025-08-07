// src/pages/student/components/StudentLesson.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ChevronLeft, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubPage } from "@/components/layout";
import { FlexBox } from "@/components/shared";
import { toast } from "sonner";
import { supabaseClient } from "@/utility";
import { invalidateRPCCache } from "../hooks/useRPC";

export const StudentLesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = React.useState(false);

  // Pobierz dane lekcji
  const { data: lessonData, isLoading } = useOne({
    resource: "activities",
    id: lessonId!,
    meta: {
      select: "*, topics(title, course_id, courses(title, icon_emoji))"
    }
  });

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      // Najpierw wywołaj start_activity (utworzy rekord w activity_progress jeśli nie istnieje)
      const { error: startError } = await supabaseClient.rpc('start_activity', {
        p_activity_id: parseInt(lessonId!)
      });

      if (startError) {
        console.error("Start activity error:", startError);
        // Nie przerywaj - może rekord już istnieje
      }

      // Teraz wywołaj complete_material
      const { data: result, error } = await supabaseClient.rpc('complete_material', {
        p_activity_id: parseInt(lessonId!)
      });

      if (error) {
        throw error;
      }

      if (result) {
        toast.success("Lekcja ukończona!", {
          description: "Zdobyłeś punkty za ukończenie materiału"
        });
        
        // Invaliduj cache dla struktury kursu
        invalidateRPCCache('get_course_structure');
        
        // Nawiguj z opóźnieniem, żeby toast był widoczny
        setTimeout(() => {
          navigate(`/student/courses/${courseId}`);
        }, 500);
      }
    } catch (error: any) {
      console.error("Complete error:", error);
      toast.error("Nie udało się ukończyć lekcji", {
        description: error.message
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const lesson = lessonData?.data;

  return (
    <SubPage>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Nawigacja */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/student/courses/${courseId}`)}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Powrót do kursu
        </Button>

        {/* Nagłówek */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{lesson?.topics?.courses?.icon_emoji || '📚'}</span>
            <span>{lesson?.topics?.courses?.title}</span>
            <span>/</span>
            <span>{lesson?.topics?.title}</span>
          </div>
          <h1 className="text-3xl font-bold">{lesson?.title}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Materiał</Badge>
            {lesson?.duration_min && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{lesson?.duration_min} min</span>
              </div>
            )}
          </div>
        </div>

        {/* Treść */}
        <Card>
          <CardContent className="prose prose-lg max-w-none p-8">
            <div dangerouslySetInnerHTML={{ __html: lesson?.content || '' }} />
          </CardContent>
        </Card>

        {/* Akcje */}
        <Card>
          <CardContent className="p-6">
            <FlexBox>
              <div>
                <p className="font-medium">Ukończyłeś tę lekcję?</p>
                <p className="text-sm text-muted-foreground">
                  Kliknij przycisk, aby zaznaczyć jako ukończone i otrzymać punkty
                </p>
              </div>
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompleting ? "Zapisywanie..." : "Oznacz jako ukończone"}
              </Button>
            </FlexBox>
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
};