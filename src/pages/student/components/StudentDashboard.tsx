// src/pages/student/components/StudentDashboard.tsx
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Flame, TrendingUp, Gift, Sparkles, Star, Trophy } from "lucide-react";
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

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Dzień dobry";
    if (hour < 18) return "Cześć";
    return "Dobry wieczór";
  };

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
        toast.success(
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Odebrano {result.total_earned} punktów!</span>
          </div>
        );
        refetchStats();
        setClaimablePoints(0);
      }
    } catch (error) {
      toast.error("Nie można odebrać nagród");
    }
  };

  const statsData = [
    { 
      value: stats.points, 
      label: 'punktów', 
      format: true,
      icon: Zap,
      gradient: 'from-yellow-400 to-orange-500',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]'
    },
    { 
      value: stats.level, 
      label: 'poziom',
      icon: Trophy,
      gradient: 'from-purple-400 to-pink-500',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]'
    },
    { 
      value: stats.streak, 
      label: 'dni z rzędu',
      icon: Flame,
      gradient: 'from-red-400 to-orange-500',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]'
    },
    { 
      value: stats.idle_rate, 
      label: '/h', 
      sublabel: 'idle rate', 
      prefix: '+',
      icon: TrendingUp,
      gradient: 'from-cyan-400 to-blue-500',
      glow: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]'
    }
  ];

  const quickActions = [
    { label: "Ranking", path: "/student/leaderboard", icon: "🏆", color: "from-yellow-400 to-orange-500" },
    { label: "Osiągnięcia", path: "/student/achievements", icon: "🎯", color: "from-purple-400 to-pink-500" },
    { label: "Ulepszenia", path: "/student/gamification", icon: "🚀", color: "from-blue-400 to-cyan-500" },
    { label: "Profil", path: "/student/profile", icon: "👤", color: "from-green-400 to-emerald-500" }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section - Energetic & Modern */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ANIMATION_DURATION.normal }}
        className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 overflow-hidden"
      >
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full filter blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-300 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-300 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: ANIMATION_DURATION.normal, delay: 0.1 }}
              className="text-3xl font-black text-white mb-2"
            >
              {getGreeting()}, {identity?.full_name?.split(' ')[0]}! 
              <motion.span
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 1, delay: 0.5 }}
                className="inline-block ml-2"
              >
                👋
              </motion.span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: ANIMATION_DURATION.normal, delay: 0.2 }}
              className="text-white/80 text-lg"
            >
              {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </motion.p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Points Display - Neon style */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-right"
            >
              <p className="text-white/60 text-sm mb-1">Twoje punkty</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white drop-shadow-lg">
                  <AnimatedCounter value={stats.points} />
                </span>
                <motion.span 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-sm text-yellow-300 font-bold"
                >
                  +<AnimatedCounter value={stats.idle_rate} />/h
                </motion.span>
              </div>
            </motion.div>
            
            {/* Level Badge - Gaming style */}
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform cursor-pointer shadow-[0_0_30px_rgba(251,191,36,0.6)]">
                <span className="text-white font-black text-2xl">{stats.level}</span>
              </div>
              <Star className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white/80 font-bold">POZIOM</span>
            </motion.div>
          </div>
        </div>
        
        {/* Daily Rewards - Exciting animation */}
        {claimablePoints > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="mt-6 p-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.6)]"
              >
                <Gift className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <p className="text-white font-bold">Nagroda do odebrania!</p>
                <p className="text-sm text-white/80">{claimablePoints} punktów czeka na Ciebie</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClaimRewards}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Odbierz teraz!
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Cards - Vibrant & Interactive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <AnimatedCard
              key={stat.label}
              index={index}
              className={`bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-transparent transition-all duration-300 hover:${stat.glow} group cursor-pointer`}
              hover={false}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 0.3 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-3xl font-black text-gray-900 mb-1">
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
                <div className="text-sm text-gray-500 font-medium">
                  {stat.sublabel || stat.label}
                </div>
              </motion.div>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Courses Section - Modern cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Twoje kursy</h2>
            <p className="text-gray-500">Kontynuuj swoją przygodę z nauką</p>
          </div>
          <button
            onClick={() => navigate("/student/gamification")}
            className="text-purple-600 hover:text-purple-700 font-semibold transition-colors flex items-center gap-1 group"
          >
            Zobacz wszystkie 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {courses.map((course: any, index: number) => (
              <AnimatedCard
                key={`course-${course.course_id}`}
                layoutId={`course-${course.course_id}`}
                index={index}
                skipAnimation={!isAnimating}
                onClick={() => navigate(`/student/courses/${course.course_id}`)}
                className="bg-white rounded-2xl p-6 border-2 border-gray-100 cursor-pointer hover:border-purple-300 hover:shadow-[0_10px_40px_rgba(168,85,247,0.15)] transition-all group"
              >
                <div className="mb-4">
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl mb-3"
                  >
                    {course.icon_emoji || '📚'}
                  </motion.div>
                  <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors text-lg">
                    {course.title}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Postęp</span>
                      <span className="text-gray-900 font-bold">{course.progress_percent}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <AnimatedProgress
                        value={course.progress_percent}
                        delay={isAnimating ? 0.5 + index * 0.1 : 0}
                        skipAnimation={!isAnimating}
                        className="h-full"
                        barClassName={`h-full bg-gradient-to-r ${
                          course.progress_percent === 100 
                            ? 'from-green-400 to-emerald-500' 
                            : course.progress_percent >= 75 
                            ? 'from-blue-400 to-cyan-500'
                            : course.progress_percent >= 50
                            ? 'from-purple-400 to-pink-500'
                            : 'from-orange-400 to-yellow-500'
                        }`}
                      />
                    </div>
                  </div>
                  
                  {course.next_activity && (
                    <p className="text-xs text-gray-500 font-medium">
                      Następna lekcja: <span className="text-purple-600">{course.next_activity}</span>
                    </p>
                  )}
                </div>
              </AnimatedCard>
            ))}
          </AnimatePresence>
          
          {courses.length === 0 && (
            <div className="col-span-full text-center py-16">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-3xl">📚</span>
              </motion.div>
              <p className="text-gray-900 font-bold text-lg mb-2">Brak kursów</p>
              <p className="text-gray-500">Poproś nauczyciela o przypisanie do kursu</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Gaming-style buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <AnimatedButton
            key={action.path}
            index={index}
            onClick={() => navigate(action.path)}
            className="relative overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative flex items-center gap-3 p-4 bg-white border-2 border-gray-100 rounded-2xl group-hover:border-transparent transition-all">
              <motion.span 
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="text-2xl"
              >
                {action.icon}
              </motion.span>
              <span className="font-bold text-gray-700 group-hover:text-white transition-colors">
                {action.label}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </AnimatedButton>
        ))}
      </div>
    </div>
  );
};