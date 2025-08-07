// src/pages/student/components/StudentLeaderboard.tsx
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/utility";
import { useRPC } from "../hooks/useRPC";
import { 
  AnimatedCard,
  AnimatedCounter,
  motion,
  AnimatePresence,
  ANIMATION_DURATION,
  ANIMATION_DELAY
} from "./motion";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  points: number;
  level: number;
  streak: number;
}

export const StudentLeaderboard = () => {
  const { data: identity } = useGetIdentity<any>();
  const [filter, setFilter] = React.useState<"all" | "students" | "teachers">("all");

  const { data: leaderboardData, isLoading, refetch } = useRPC<LeaderboardEntry[]>(
    'get_leaderboard',
    { 
      p_limit: 20,
      p_filter: filter 
    }
  );

  React.useEffect(() => {
    refetch();
  }, [filter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  const leaderboard = leaderboardData || [];

  const getRankDisplay = (rank: number) => {
    switch(rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <span className="text-sm font-medium text-gray-500">{rank}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ANIMATION_DURATION.normal }}
        className="text-2xl font-semibold text-gray-900 mb-8"
      >
        Ranking
      </motion.h1>

      {/* Filter Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ANIMATION_DURATION.normal, delay: 0.1 }}
        className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-8"
      >
        <AnimatePresence mode="wait">
          {[
            { value: "all", label: "Wszyscy" },
            { value: "students", label: "Uczniowie" },
            { value: "teachers", label: "Nauczyciele" }
          ].map((tab) => (
            <motion.button
              key={tab.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(tab.value as any)}
              className={cn(
                "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all relative",
                filter === tab.value
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {filter === tab.value && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white shadow-sm rounded-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Leaderboard */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: ANIMATION_DURATION.fast }}
          className="space-y-2"
        >
          {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.user_id === identity?.id;
            const isTop3 = entry.rank <= 3;
            
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: index * ANIMATION_DELAY.staggerFast,
                  duration: ANIMATION_DURATION.normal 
                }}
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl transition-all",
                  isCurrentUser 
                    ? "bg-gray-900 text-white shadow-lg" 
                    : isTop3
                    ? "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                    : "bg-white hover:bg-gray-50"
                )}
              >
                {/* Rank */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: index * ANIMATION_DELAY.staggerFast + 0.2,
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  className="w-8 flex justify-center"
                >
                  {getRankDisplay(entry.rank)}
                </motion.div>
                
                {/* Avatar */}
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: index * ANIMATION_DELAY.staggerFast + 0.1,
                    duration: ANIMATION_DURATION.normal 
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                    isCurrentUser 
                      ? "bg-white text-gray-900" 
                      : isTop3
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  {entry.full_name.charAt(0)}
                </motion.div>
                
                {/* User Info */}
                <div className="flex-1">
                  <div className="font-medium">
                    {entry.full_name}
                    {isCurrentUser && <span className="ml-2 text-sm opacity-70">(Ty)</span>}
                  </div>
                  <div className={cn(
                    "text-sm",
                    isCurrentUser ? "text-gray-300" : "text-gray-500"
                  )}>
                    Poziom {entry.level} • Seria {entry.streak} dni
                  </div>
                </div>
                
                {/* Points */}
                <div className="text-right">
                  <div className="font-semibold">
                    <AnimatedCounter value={entry.points} />
                  </div>
                  <div className={cn(
                    "text-xs",
                    isCurrentUser ? "text-gray-300" : "text-gray-500"
                  )}>
                    punktów
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};