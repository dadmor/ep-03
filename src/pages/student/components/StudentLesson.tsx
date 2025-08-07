// src/pages/student/components/StudentLesson.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/utility";
import { invalidateRPCCache } from "../hooks/useRPC";

export const StudentLesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = React.useState(false);

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
      await supabaseClient.rpc('start_activity', {
        p_activity_id: parseInt(lessonId!)
      });

      const { data: result, error } = await supabaseClient.rpc('complete_material', {
        p_activity_id: parseInt(lessonId!)
      });

      if (error) throw error;

      if (result) {
        toast.success("Lekcja ukończona!");
        invalidateRPCCache('get_course_structure');
        navigate(`/student/courses/${courseId}`);
      }
    } catch (error: any) {
      toast.error("Nie udało się ukończyć lekcji");
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  const lesson = lessonData?.data;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate(`/student/courses/${courseId}`)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Powrót do kursu</span>
      </button>

      {/* Lesson Info */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{lesson?.topics?.courses?.icon_emoji || '📚'}</span>
          <span>{lesson?.topics?.courses?.title}</span>
          <span>•</span>
          <span>{lesson?.topics?.title}</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{lesson?.title}</h1>
        {lesson?.duration_min && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{lesson?.duration_min} min czytania</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
        <div 
          className="prose prose-gray max-w-none prose-headings:font-semibold prose-p:text-gray-600"
          dangerouslySetInnerHTML={{ __html: lesson?.content || '' }} 
        />
      </div>

      {/* Complete Button */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Ukończyłeś tę lekcję?</p>
            <p className="text-sm text-gray-500 mt-1">
              Oznacz jako ukończone, aby kontynuować
            </p>
          </div>
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            {isCompleting ? "Zapisywanie..." : "Oznacz jako ukończone"}
          </button>
        </div>
      </div>
    </div>
  );
};