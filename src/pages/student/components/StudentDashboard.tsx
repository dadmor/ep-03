// src/pages/student/components/StudentDashboard.tsx
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/utility";
import { useStudentStats } from "../hooks";
import { useRPC } from "../hooks/useRPC";
import { 
  AnimatedCard, 
  AnimatedProgress, 
  AnimatedButton,
  AnimatedCounter,
  AnimatePresence,
  motion,
  useAnimationControl,
  ANIMATION_DURATION
} from "./motion";

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<any>();
  const { stats, refetch: refetchStats } = useStudentStats();
  const { data: coursesData } = useRPC<any[]>('get_my_courses');
  const [claimablePoints, setClaimablePoints] = React.useState(0);
  const isAnimating = useAnimationControl();

  const courses = coursesData || [];

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

  const handleClaimRewards = async () => {
    try {
      const { data: result, error } = await supabaseClient.rpc('claim_daily_rewards');
      
      if (error) throw error;
      
      if (result) {
        toast.success(`Odebrano ${result.total_earned} punktów!`);
        refetchStats();
        setClaimablePoints(0);
      }
    } catch (error) {
      toast.error("Nie można odebrać nagród");
    }
  };

  // Fix: Add explicit type for statsData
  const statsData: Array<{
    value: number;
    label: string;
    format?: boolean;
    sublabel?: string;
    prefix?: string;
  }> = [
    { value: stats.points, label: 'punktów', format: true },
    { value: stats.level, label: 'poziom' },
    { value: stats.streak, label: 'dni z rzędu' },
    { value: stats.idle_rate, label: '/h', sublabel: 'idle rate', prefix: '+' }
  ];

  const quickActions = [
    { label: "Ranking", path: "/student/leaderboard", icon: "🏆" },
    { label: "Osiągnięcia", path: "/student/achievements", icon: "🎯" },
    { label: "Ulepszenia", path: "/student/gamification", icon: "🚀" },
    { label: "Profil", path: "/student/profile", icon: "👤" }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ANIMATION_DURATION.normal }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
        <div className="relative z-10">
          <h1 className="text-3xl font-semibold mb-2">
            Cześć, {identity?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-300 mb-8">
            Kontynuuj naukę tam, gdzie skończyłeś
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Live Points */}
            <AnimatedCard
              index={0}
              variant="scale"
              hover={false}
              className="bg-white/10 backdrop-blur rounded-2xl p-4"
            >
              <p className="text-sm text-gray-300 mb-1">Twoje punkty</p>
              <p className="text-2xl font-semibold">
                <AnimatedCounter value={stats.points} />
              </p>
              <p className="text-xs text-gray-400 mt-1">
                +<AnimatedCounter value={stats.idle_rate} /> pkt/h
              </p>
            </AnimatedCard>
            
            {/* Level Progress */}
            <AnimatedCard
              index={1}
              variant="scale"
              hover={false}
              className="bg-white/10 backdrop-blur rounded-2xl p-4"
            >
              <p className="text-sm text-gray-300 mb-1">Poziom {stats.level}</p>
              <div className="mt-2">
                <AnimatedProgress
                  value={((stats.points - ((stats.level - 1) * (stats.level - 1) * 100)) / 
                    ((stats.level * stats.level * 100) - ((stats.level - 1) * (stats.level - 1) * 100))) * 100}
                  className="bg-white/20 rounded-full overflow-hidden"
                  barClassName="h-full bg-white"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Do następnego poziomu</p>
            </AnimatedCard>
            
            {/* Daily Rewards */}
            {claimablePoints > 0 ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaimRewards}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 text-left"
              >
                <p className="text-sm font-medium mb-1">Do odebrania</p>
                <p className="text-2xl font-semibold">{claimablePoints} pkt</p>
                <p className="text-xs opacity-90 mt-1">Kliknij aby odebrać →</p>
              </motion.button>
            ) : (
              <AnimatedCard
                index={2}
                variant="scale"
                hover={false}
                className="bg-white/10 backdrop-blur rounded-2xl p-4"
              >
                <p className="text-sm text-gray-300 mb-1">Seria</p>
                <p className="text-2xl font-semibold">{stats.streak} dni 🔥</p>
                <p className="text-xs text-gray-400 mt-1">Nie przerywaj!</p>
              </AnimatedCard>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <AnimatedCard
              key={stat.label}
              index={index}
              className="bg-white rounded-2xl p-6 border border-gray-100"
              hover="lift"
            >
              <div className="text-3xl font-semibold text-gray-900 mb-1">
                {stat.format ? (
                  <AnimatedCounter 
                    value={stat.value} 
                    prefix={stat.prefix}
                    suffix={stat.sublabel ? stat.label : ""}
                  />
                ) : (
                  <>
                    {stat.prefix}{stat.value}
                    {stat.sublabel && <span className="text-sm text-gray-500">{stat.label}</span>}
                  </>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {stat.sublabel || stat.label}
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Twoje kursy</h2>
            <button
              onClick={() => navigate("/student/gamification")}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Ulepszenia →
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="wait">
              {courses.map((course: any, index: number) => (
                <AnimatedCard
                  key={`course-${course.course_id}`}
                  layoutId={`course-${course.course_id}`}
                  index={index}
                  skipAnimation={!isAnimating}
                  onClick={() => navigate(`/student/courses/${course.course_id}`)}
                  className="bg-white rounded-2xl p-6 border border-gray-100 cursor-pointer hover:border-gray-200"
                  whileHover={{ 
                    borderColor: "#e5e7eb",
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{course.icon_emoji || '📚'}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {course.title}
                      </h3>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Postęp</span>
                          <span className="font-medium">{course.progress_percent}%</span>
                        </div>
                        <AnimatedProgress
                          value={course.progress_percent}
                          delay={isAnimating ? 0.5 + index * 0.1 : 0}
                          skipAnimation={!isAnimating}
                        />
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </AnimatePresence>
            
            {courses.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                Nie masz jeszcze przypisanych kursów
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <AnimatedButton
              key={action.path}
              index={index}
              onClick={() => navigate(action.path)}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </AnimatedButton>
          ))}
        </div>
      </div>
    </div>
  );
};