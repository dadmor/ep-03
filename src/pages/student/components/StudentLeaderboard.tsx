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
  ANIMATION_DURATION
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border"></div>
      </div>
    );
  }

  const leaderboard = leaderboardData || [];

  const getRankDisplay = (rank: number) => {
    switch(rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <span className="text-sm font-medium text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-8">
        Ranking
      </h1>

      {/* Filter Tabs - Uproszczone */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-8">
        {[
          { value: "all", label: "Wszyscy" },
          { value: "students", label: "Uczniowie" },
          { value: "teachers", label: "Nauczyciele" }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={cn(
              "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              filter === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard - Bez nadmiarowych animacji */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const isCurrentUser = entry.user_id === identity?.id;
          const isTop3 = entry.rank <= 3;
          
          return (
            <AnimatedCard
              key={entry.user_id}
              index={index}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl transition-colors",
                isCurrentUser 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : isTop3
                  ? "bg-muted/50 border border-border"
                  : "bg-card hover:bg-muted/30"
              )}
            >
              {/* Rank */}
              <div className="w-8 flex justify-center">
                {getRankDisplay(entry.rank)}
              </div>
              
              {/* Avatar */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                isCurrentUser 
                  ? "bg-primary-foreground text-primary" 
                  : isTop3
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {entry.full_name.charAt(0)}
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <div className="font-medium">
                  {entry.full_name}
                  {isCurrentUser && <span className="ml-2 text-sm opacity-70">(Ty)</span>}
                </div>
                <div className={cn(
                  "text-sm",
                  isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
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
                  isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  punktów
                </div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
};