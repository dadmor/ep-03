// src/pages/student/components/StudentCourseDetail.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Check, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utility";
import { useRPC } from "../hooks/useRPC";
import { useSupabaseQuery } from "../hooks/useSupabaseQuery";

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

interface Course {
  id: number;
  title: string;
  description: string;
  icon_emoji: string;
}

export const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data: courseStructure, isLoading } = useRPC<CourseStructureItem[]>(
    "get_course_structure",
    { p_course_id: parseInt(courseId!) },
    { enabled: !!courseId }
  );

  const { data: courseData } = useSupabaseQuery<Course>("courses", {
    filters: [{ field: "id", operator: "eq", value: parseInt(courseId!) }],
    enabled: !!courseId,
  });

  const topicsWithActivities = React.useMemo(() => {
    if (!courseStructure) return [];

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
    }, {} as any);

    const topics = Object.values(grouped).sort((a: any, b: any) => a.position - b.position);

    return topics.map((topic: any, index: number) => {
      const isCompleted = topic.activities.length > 0 && 
        topic.activities.every((activity: any) => activity.completed);

      const isUnlocked = index === 0 || 
        (topics[index - 1].activities.length > 0 && 
         topics[index - 1].activities.every((a: any) => a.completed));

      return {
        ...topic,
        isCompleted,
        isUnlocked
      };
    });
  }, [courseStructure]);

  const stats = React.useMemo(() => {
    const allActivities = topicsWithActivities.flatMap((t: any) => t.activities);
    const completed = allActivities.filter((a: any) => a.completed).length;
    const total = allActivities.length;

    return {
      totalActivities: total,
      completedActivities: completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [topicsWithActivities]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  const course = courseData?.[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate("/student/dashboard#courses")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Powrót</span>
      </button>

      {/* Course Info */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{course?.icon_emoji || "📚"}</span>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{course?.title}</h1>
            <p className="text-gray-500 mt-1">{course?.description}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Postęp kursu</span>
            <span className="font-medium">{stats.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Topics Path */}
      <div className="space-y-8">
        {topicsWithActivities.map((topic: any, topicIndex: number) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: topicIndex * 0.1 }}
            className={cn(
              "relative",
              !topic.isUnlocked && "opacity-50"
            )}
          >
            {/* Topic Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                topic.isCompleted 
                  ? "bg-green-500 text-white" 
                  : topic.isUnlocked
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-400"
              )}>
                {topic.isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : topic.isUnlocked ? (
                  <span className="font-semibold">{topic.position}</span>
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{topic.title}</h2>
                <p className="text-sm text-gray-500">
                  {topic.activities.filter((a: any) => a.completed).length} z {topic.activities.length} ukończonych
                </p>
              </div>
            </div>

            {/* Activities */}
            <div className="ml-5 pl-5 border-l-2 border-gray-100 space-y-3">
              {topic.activities.map((activity: any) => (
                <motion.button
                  key={activity.id}
                  whileHover={topic.isUnlocked ? { x: 4 } : {}}
                  onClick={() => {
                    if (!topic.isUnlocked) return;
                    const path = activity.type === "quiz" 
                      ? `/student/courses/${courseId}/quiz/${activity.id}`
                      : `/student/courses/${courseId}/lesson/${activity.id}`;
                    navigate(path);
                  }}
                  disabled={!topic.isUnlocked}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                    topic.isUnlocked
                      ? "bg-white border-gray-200 hover:border-gray-300 cursor-pointer"
                      : "bg-gray-50 border-gray-100 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      activity.type === "quiz" ? "bg-purple-100" : "bg-blue-100"
                    )}>
                      {activity.type === "quiz" ? (
                        <Zap className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-500">
                        {activity.type === "quiz" ? "Quiz" : "Materiał"}
                        {activity.score !== null && ` • ${activity.score}%`}
                      </div>
                    </div>
                  </div>
                  {activity.completed && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};