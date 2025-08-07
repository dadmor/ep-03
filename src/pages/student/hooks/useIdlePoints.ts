// src/pages/student/hooks/useIdlePoints.ts - ZOPTYMALIZOWANA WERSJA
import { useEffect, useRef } from "react";
import { supabaseClient } from "@/utility";
import { useStudentStats } from "./useStudentStats";

export const useIdlePoints = () => {
  const { stats, setStats } = useStudentStats();
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

  // Używamy requestAnimationFrame zamiast setInterval dla płynniejszej animacji
  useEffect(() => {
    if (stats.idle_rate <= 0) return;
    
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // sekundy
      
      if (deltaTime >= 1) {
        setStats(prev => ({
          ...prev,
          points: prev.points + Math.floor(prev.idle_rate / 3600)
        }));
        lastUpdateRef.current = now;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
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