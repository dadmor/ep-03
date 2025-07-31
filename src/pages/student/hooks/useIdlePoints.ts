// src/pages/student/hooks/useIdlePoints.ts
import { useEffect } from "react";
import { useCustomMutation } from "@refinedev/core";
import { useStudentStats } from "./useStudentStats";

export const useIdlePoints = () => {
  const { stats, setStats } = useStudentStats();
  const { mutate: claimRewards } = useCustomMutation();

  // Symulacja idle points (frontend)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        points: prev.points + Math.floor(prev.idleRate / 60)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [stats.idleRate, setStats]);

  // Odbierz nagrody z backendu
  const claimDailyRewards = async () => {
    const response = await claimRewards({
      url: "rpc/claim_daily_rewards",
      method: "post",
      values: {},
    });

    if (response?.data) {
      return response.data;
    }
  };

  return { claimDailyRewards };
};  