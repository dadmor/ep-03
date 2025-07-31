// src/pages/student/hooks/useStudentStats.ts
import { useCustom, useGetIdentity } from "@refinedev/core";
import { useEffect, useState } from "react";

export const useStudentStats = () => {
  const { data: identity } = useGetIdentity<any>();
  const [stats, setStats] = useState({
    points: 0,
    level: 1,
    streak: 0,
    idleRate: 1,
    nextLevelPoints: 200,
    quizzesCompleted: 0,
    perfectScores: 0,
    totalTime: 0
  });

  const { data, isLoading } = useCustom({
    url: "rpc/get_my_stats",
    method: "post",
    config: {
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  useEffect(() => {
    if (data?.data) {
      const statsData = data.data;
      setStats({
        points: statsData.points || 0,
        level: statsData.level || 1,
        streak: statsData.streak || 0,
        idleRate: statsData.idle_rate || 1,
        nextLevelPoints: statsData.next_level_points || 200,
        quizzesCompleted: statsData.quizzes_completed || 0,
        perfectScores: statsData.perfect_scores || 0,
        totalTime: statsData.total_time || 0
      });
    }
  }, [data]);

  return { stats, setStats, isLoading };
};