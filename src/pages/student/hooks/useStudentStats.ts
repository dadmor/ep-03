// src/pages/student/hooks/useStudentStats.ts
import { useEffect, useState, useCallback } from "react";
import { supabaseClient } from "@/utility";

export const useStudentStats = () => {
  const [stats, setStats] = useState({
    points: 0,
    level: 1,
    streak: 0,
    idle_rate: 1,
    next_level_points: 200,
    quizzes_completed: 0,
    perfect_scores: 0,
    total_time: 0,
    rank: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseClient.rpc('get_my_stats');
      
      if (error) throw error;
      
      if (data) {
        setStats({
          points: data.points || 0,
          level: data.level || 1,
          streak: data.streak || 0,
          idle_rate: data.idle_rate || 1,
          next_level_points: data.next_level_points || 200,
          quizzes_completed: data.quizzes_completed || 0,
          perfect_scores: data.perfect_scores || 0,
          total_time: data.total_time || 0,
          rank: data.rank || 0
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, setStats, isLoading, refetch };
};
