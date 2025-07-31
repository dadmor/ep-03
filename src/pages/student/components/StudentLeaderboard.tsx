// src/pages/student/components/StudentLeaderboard.tsx - POPRAWIONY
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { Trophy, Medal, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { useRPC } from "../hooks/useRPC";

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

  // Refetch when filter changes
  React.useEffect(() => {
    refetch();
  }, [filter]);

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-600" />;
      default: return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1: return "bg-yellow-50 border-yellow-200";
      case 2: return "bg-gray-50 border-gray-200";
      case 3: return "bg-orange-50 border-orange-200";
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const leaderboard = leaderboardData || [];

  return (
    <SubPage>
      <div className="space-y-6">
        <Lead
          title="Ranking"
          description="Zobacz jak wypadasz na tle innych uczniów"
        />

        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Wszyscy</TabsTrigger>
            <TabsTrigger value="students">Uczniowie</TabsTrigger>
            <TabsTrigger value="teachers">Nauczyciele</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 20</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.user_id === identity?.id;
                  
                  return (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isCurrentUser 
                          ? 'bg-purple-50 border-2 border-purple-200' 
                          : `border ${getRankColor(entry.rank)} hover:bg-gray-50`
                      }`}
                    >
                      <div className="w-10 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {entry.full_name.charAt(0)}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-semibold">
                          {entry.full_name}
                          {isCurrentUser && <Badge className="ml-2" variant="secondary">Ty</Badge>}
                        </p>
                        <p className="text-sm text-gray-500">
                          Poziom {entry.level} • Seria {entry.streak} dni
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.points}</p>
                        <p className="text-xs text-gray-500">punktów</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SubPage>
  );
};