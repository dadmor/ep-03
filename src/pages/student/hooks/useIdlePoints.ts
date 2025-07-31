// src/pages/student/hooks/useIdlePoints.ts
import { useEffect } from "react";
import { supabaseClient } from "@/utility";
import { useStudentStats } from "./useStudentStats";

export const useIdlePoints = () => {
  const { stats, setStats } = useStudentStats();

  // Symulacja idle points (frontend) - tylko wizualna
  useEffect(() => {
    if (stats.idle_rate <= 0) return;
    
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        points: prev.points + Math.floor(prev.idle_rate / 3600) // punkty na sekundę
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [stats.idle_rate, setStats]);

  // Odbierz nagrody z backendu
  const claimDailyRewards = async () => {
    try {
      const { data, error } = await supabaseClient.rpc('claim_daily_rewards');
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Failed to claim rewards:", error);
      throw error;
    }
  };

  return { claimDailyRewards };
};