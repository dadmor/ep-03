// src/pages/student/components/StudentDashboard.tsx - CLEAN & READABLE VERSION
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Trophy, Flame, Target, Clock, Gift, Zap, TrendingUp, Coins, Rocket, BookOpen, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SubPage } from "@/components/layout";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/utility";
import { useStudentStats } from "../hooks";
import { useRPC } from "../hooks/useRPC";

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<any>();
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useStudentStats();
  const [claimablePoints, setClaimablePoints] = React.useState(0);
  const [isClaimingRewards, setIsClaimingRewards] = React.useState(false);
  
  // Animated idle counter
  const [displayPoints, setDisplayPoints] = React.useState(stats.points);
  const pointsPerSecond = stats.idle_rate / 3600;

  // Pobierz kursy ucznia
  const { data: coursesData, isLoading: coursesLoading } = useRPC<any[]>('get_my_courses');

  // Check claimable rewards
  React.useEffect(() => {
    const checkRewards = async () => {
      try {
        const { data } = await supabaseClient.rpc('check_claimable_rewards');
        setClaimablePoints(data?.claimable_points || 0);
      } catch (error) {
        console.error("Error checking rewards:", error);
      }
    };

    checkRewards();
    const interval = setInterval(checkRewards, 30000);
    return () => clearInterval(interval);
  }, []);

  // Animate idle points
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDisplayPoints(prev => prev + pointsPerSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [pointsPerSecond]);

  // Sync display with actual points
  React.useEffect(() => {
    setDisplayPoints(stats.points);
  }, [stats.points]);

  const handleClaimRewards = async () => {
    setIsClaimingRewards(true);
    try {
      const { data: result, error } = await supabaseClient.rpc('claim_daily_rewards');
      
      if (error) throw error;
      
      if (result) {
        toast.success(
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Gift className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold">Nagrody odebrane!</p>
              <p className="text-sm">+{result.total_earned} punktów</p>
            </div>
          </div>,
          { duration: 5000 }
        );
        refetchStats();
        setClaimablePoints(0);
      }
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Nie można odebrać nagród");
    } finally {
      setIsClaimingRewards(false);
    }
  };

  if (statsLoading || coursesLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const courses = coursesData || [];

  return (
    <SubPage>
      <div className="space-y-8">
        {/* Hero Section - Simplified but still beautiful */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-3xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          
          <div className="relative z-10">
            {/* Welcome & Idle Info */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Witaj, {identity?.full_name || 'Uczniu'}! 👋
              </h1>
              <p className="text-purple-100 text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Zdobywasz +{stats.idle_rate} punktów na godzinę nawet gdy nie grasz!
              </p>
            </div>

            {/* Main Stats - Clean Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Live Points */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Coins className="w-6 h-6" />
                  </div>
                  <span className="text-sm opacity-90">Twoje punkty</span>
                </div>
                <motion.p 
                  key={Math.floor(displayPoints)}
                  className="text-3xl font-bold tabular-nums"
                >
                  {Math.floor(displayPoints).toLocaleString('pl-PL')}
                </motion.p>
              </motion.div>

              {/* Level Progress */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="text-sm opacity-90">Poziom {stats.level}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold">
                    {Math.round(((stats.points - ((stats.level - 1) * (stats.level - 1) * 100)) / 
                      ((stats.level * stats.level * 100) - ((stats.level - 1) * (stats.level - 1) * 100))) * 100)}%
                  </p>
                  <Progress 
                    value={((stats.points - ((stats.level - 1) * (stats.level - 1) * 100)) / 
                      ((stats.level * stats.level * 100) - ((stats.level - 1) * (stats.level - 1) * 100))) * 100} 
                    className="h-2 bg-white/20" 
                  />
                </div>
              </motion.div>

              {/* Claim Rewards */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm opacity-90">Do odebrania</span>
                  <Gift className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold mb-3">
                  {claimablePoints.toLocaleString('pl-PL')}
                </p>
                <Button
                  onClick={handleClaimRewards}
                  disabled={isClaimingRewards || claimablePoints === 0}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  size="sm"
                >
                  {isClaimingRewards ? "Odbieranie..." : "Odbierz"}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Quick Stats - Clean and Simple */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-8 h-8 text-orange-500" />
                <span className="text-2xl font-bold">{stats.streak}</span>
              </div>
              <p className="text-sm text-muted-foreground">Dni z rzędu</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold">{stats.quizzes_completed}</span>
              </div>
              <p className="text-sm text-muted-foreground">Quizy ukończone</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold">{Math.floor(stats.total_time / 60)}h</span>
              </div>
              <p className="text-sm text-muted-foreground">Czas nauki</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Rocket className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold">+{stats.idle_rate}/h</span>
              </div>
              <p className="text-sm text-muted-foreground">Idle rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Courses Section - Clean List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Twoje kursy</h2>
            <Button
              variant="ghost"
              onClick={() => navigate("/student/gamification")}
              className="text-purple-600 hover:text-purple-700"
            >
              Ulepszenia idle
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course: any) => (
              <motion.div
                key={course.course_id}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/student/courses/${course.course_id}`)}
              >
                <Card className="cursor-pointer border-0 shadow-md hover:shadow-xl transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{course.icon_emoji || '📚'}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                          {course.title}
                        </h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Postęp</span>
                            <span className="font-medium">{course.progress_percent}%</span>
                          </div>
                          <Progress value={course.progress_percent} className="h-2" />
                          
                          {course.last_activity && (
                            <p className="text-xs text-muted-foreground">
                              Ostatnia aktywność: {new Date(course.last_activity).toLocaleDateString('pl-PL')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {/* Empty state */}
            {courses.length === 0 && (
              <Card className="col-span-full border-dashed">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nie masz jeszcze przypisanych kursów
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4"
            onClick={() => navigate("/student/leaderboard")}
          >
            <Trophy className="w-5 h-5 mr-2" />
            Ranking
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4"
            onClick={() => navigate("/student/achievements")}
          >
            <Target className="w-5 h-5 mr-2" />
            Osiągnięcia
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4"
            onClick={() => navigate("/student/gamification")}
          >
            <Rocket className="w-5 h-5 mr-2" />
            Ulepszenia
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4"
            onClick={() => navigate("/student/profile")}
          >
            <Gift className="w-5 h-5 mr-2" />
            Profil
          </Button>
        </div>
      </div>
    </SubPage>
  );
};