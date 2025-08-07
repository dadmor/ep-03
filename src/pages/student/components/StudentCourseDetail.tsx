// src/pages/student/components/StudentCourseDetail.tsx - FIXED NAVIGATION
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  Lock,
  AlertCircle,
  Sparkles,
  Trophy,
  Zap,
  Star,
  Home
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

import { useRPC } from "../hooks/useRPC";
import { useSupabaseQuery } from "../hooks/useSupabaseQuery";
import { cn } from "@/utility";

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
  const [hasAnimated, setHasAnimated] = React.useState(false);

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

    const topics = Object.values(grouped).sort((a, b) => a.position - b.position);

    return topics.map((topic, index) => {
      const isCompleted = topic.activities.length > 0 && 
        topic.activities.every(activity => activity.completed);

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

  // Set animation flag after first load
  React.useEffect(() => {
    if (!isLoading && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isLoading, hasAnimated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  const course = courseData?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative z-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Navigation - ZMIENIONA NAWIGACJA */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student/dashboard#courses")}
              className="gap-2 text-white hover:bg-white/20"
            >
              <Home className="w-4 h-4" />
              Powrót do dashboardu
            </Button>
          </div>

          {/* Course Info */}
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={!hasAnimated ? { scale: 0 } : { scale: 1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-[72px] mb-6 flex items-center justify-center"
            >
              <span className="text-6xl">{course?.icon_emoji || ""}</span>
            </motion.div>
            
            <motion.div
              initial={!hasAnimated ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-9 md:h-10 mb-4 flex items-center justify-center"
            >
              <h1 className="text-2xl md:text-3xl font-bold">
                {course?.title}
              </h1>
            </motion.div>
            
            <motion.div
              initial={!hasAnimated ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="h-12 max-w-xl mx-auto mb-8 flex items-center"
            >
              <p className="text-base text-white/80 line-clamp-2">
                {course?.description}
              </p>
            </motion.div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: `${stats.progress}%` }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                />
              </div>
              <div className="h-5 flex items-center justify-between text-sm mt-2">
                <span className="text-white/80">{stats.completedActivities} z {stats.totalActivities} ukończonych</span>
                <span className="text-white font-medium">{stats.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Path */}
        <div className="relative">
          {/* Connecting Line */}
          <motion.div 
            initial={!hasAnimated ? { opacity: 0, scaleY: 0 } : { opacity: 1, scaleY: 1 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-200 via-purple-300 to-purple-200 transform -translate-x-1/2 origin-top"
          />
          
          {/* Topics */}
          <div className="space-y-24">
            {topicsWithActivities.map((topic, topicIndex) => {
              const Icon = topic.isCompleted ? CheckCircle2 : topic.isUnlocked ? Sparkles : Lock;
              
              return (
                <motion.div
                  key={topic.id}
                  initial={!hasAnimated ? { opacity: 0, x: topicIndex % 2 === 0 ? -30 : 30 } : { opacity: 1, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: !hasAnimated ? topicIndex * 0.1 : 0, duration: 0.3 }}
                  className="relative"
                >
                  {/* Topic Node */}
                  <div className="flex items-center justify-center mb-8">
                    <motion.div 
                      className={cn(
                        "relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl",
                        topic.isCompleted 
                          ? "bg-gradient-to-br from-green-400 to-green-600" 
                          : topic.isUnlocked
                          ? "bg-gradient-to-br from-purple-400 to-purple-600"
                          : "bg-gray-300"
                      )}
                      whileHover={topic.isUnlocked ? { scale: 1.1 } : {}}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </motion.div>
                  </div>

                  {/* Topic Content */}
                  <div className={cn(
                    "bg-white rounded-3xl shadow-xl overflow-hidden",
                    !topic.isUnlocked && "opacity-60"
                  )}>
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Rozdział {topic.position}: {topic.title}
                          </h2>
                          <p className="text-gray-600">
                            {topic.activities.filter(a => a.completed).length} z {topic.activities.length} ukończonych
                          </p>
                        </div>
                        {topic.isCompleted && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Trophy className="w-4 h-4 mr-1" />
                            Ukończony
                          </Badge>
                        )}
                      </div>

                      {!topic.isUnlocked ? (
                        <div className="bg-gray-50 rounded-2xl p-6 text-center">
                          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium">
                            Ukończ poprzedni rozdział, aby odblokować
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {topic.activities.map((activity, activityIndex) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (activity.type === "quiz") {
                                  navigate(`/student/courses/${courseId}/quiz/${activity.id}`);
                                } else {
                                  navigate(`/student/courses/${courseId}/lesson/${activity.id}`);
                                }
                              }}
                              className={cn(
                                "group relative bg-gradient-to-r p-6 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md",
                                activity.completed 
                                  ? "from-green-50 to-emerald-50 border-2 border-green-200" 
                                  : "from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-300"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center",
                                    activity.type === "quiz" 
                                      ? "bg-gradient-to-br from-purple-500 to-purple-600" 
                                      : "bg-gradient-to-br from-blue-500 to-blue-600"
                                  )}>
                                    {activity.type === "quiz" ? (
                                      <Zap className="w-7 h-7 text-white" />
                                    ) : (
                                      <BookOpen className="w-7 h-7 text-white" />
                                    )}
                                  </div>
                                  
                                  <div>
                                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-700 transition-colors">
                                      {activity.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {activity.type === "quiz" ? "Quiz" : "Materiał"}
                                      </Badge>
                                      {activity.score !== null && (
                                        <div className="flex items-center gap-1">
                                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                          <span className="text-sm font-medium">{activity.score}%</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {activity.completed && (
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                  )}
                                  <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};