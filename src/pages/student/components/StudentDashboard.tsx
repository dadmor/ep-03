// src/pages/student/components/StudentDashboard.tsx
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Flame, TrendingUp, Gift } from "lucide-react";
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

  const statsData: Array<{
    value: number;
    label: string;
    format?: boolean;
    sublabel?: string;
    prefix?: string;
    icon: React.ElementType;
    accent: string;
  }> = [
    { 
      value: stats.points, 
      label: 'punktów', 
      format: true,
      icon: Zap,
      accent: 'text-orange'
    },
    { 
      value: stats.level, 
      label: 'poziom',
      icon: TrendingUp,
      accent: 'text-primary'
    },
    { 
      value: stats.streak, 
      label: 'dni z rzędu',
      icon: Flame,
      accent: 'text-destructive'
    },
    { 
      value: stats.idle_rate, 
      label: '/h', 
      sublabel: 'idle rate', 
      prefix: '+',
      icon: Gift,
      accent: 'text-accent'
    }
  ];

  const quickActions = [
    { label: "Ranking", path: "/student/leaderboard", icon: "🏆" },
    { label: "Osiągnięcia", path: "/student/achievements", icon: "🎯" },
    { label: "Ulepszenia", path: "/student/gamification", icon: "🚀" },
    { label: "Profil", path: "/student/profile", icon: "👤" }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section - Minimalistyczne */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ANIMATION_DURATION.normal }}
        className="bg-white rounded-2xl p-8 border border-gray-100"
      >
        <div className="flex items-start justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: ANIMATION_DURATION.normal, delay: 0.1 }}
              className="text-2xl font-semibold text-gray-900 mb-1"
            >
              Witaj, {identity?.full_name?.split(' ')[0]} 👋
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: ANIMATION_DURATION.normal, delay: 0.2 }}
              className="text-gray-500"
            >
              {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </motion.p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Points Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-right"
            >
              <p className="text-sm text-gray-500 mb-1">Twoje punkty</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-gray-900">
                  <AnimatedCounter value={stats.points} />
                </span>
                <span className="text-sm text-orange font-medium">
                  +<AnimatedCounter value={stats.idle_rate} />/h
                </span>
              </div>
            </motion.div>
            
            {/* Level Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">{stats.level}</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">poziom</span>
            </motion.div>
          </div>
        </div>
        
        {/* Daily Rewards - Subtelny */}
        {claimablePoints > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-orange/5 border border-orange/20 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center">
                <Gift className="w-5 h-5 text-orange" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nagroda do odebrania</p>
                <p className="text-xs text-gray-500">{claimablePoints} punktów czeka na Ciebie</p>
              </div>
            </div>
            <button
              onClick={handleClaimRewards}
              className="px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors text-sm font-medium"
            >
              Odbierz
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Cards - Czyste i minimalistyczne */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <AnimatedCard
              key={stat.label}
              index={index}
              className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all"
              hover="lift"
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className={`w-5 h-5 ${stat.accent}`} />
                {stat.prefix && (
                  <span className="text-xs font-medium text-green-600">
                    {stat.prefix}
                  </span>
                )}
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
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
                <div className="text-sm text-gray-500 mt-1">
                  {stat.sublabel || stat.label}
                </div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Kursy</h2>
            <p className="text-sm text-gray-500">Kontynuuj naukę</p>
          </div>
          <button
            onClick={() => navigate("/student/gamification")}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            Zobacz wszystkie <ArrowRight className="w-4 h-4" />
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
                className="bg-white rounded-xl p-6 border border-gray-100 cursor-pointer hover:border-gray-200 transition-all group"
              >
                <div className="mb-4">
                  <div className="text-3xl mb-3">{course.icon_emoji || '📚'}</div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Postęp</span>
                      <span className="text-gray-900 font-medium">{course.progress_percent}%</span>
                    </div>
                    <AnimatedProgress
                      value={course.progress_percent}
                      delay={isAnimating ? 0.5 + index * 0.1 : 0}
                      skipAnimation={!isAnimating}
                      className="bg-gray-100 rounded-full overflow-hidden h-2"
                      barClassName="h-full bg-primary"
                    />
                  </div>
                  
                  {course.next_activity && (
                    <p className="text-xs text-gray-500">
                      Następna lekcja: {course.next_activity}
                    </p>
                  )}
                </div>
              </AnimatedCard>
            ))}
          </AnimatePresence>
          
          {courses.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <p className="text-gray-900 font-medium mb-2">Brak kursów</p>
              <p className="text-sm text-gray-500">Poproś nauczyciela o przypisanie do kursu</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Subtelne karty */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <AnimatedButton
            key={action.path}
            index={index}
            onClick={() => navigate(action.path)}
            className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-all group"
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </AnimatedButton>
        ))}
      </div>
    </div>
  );
};