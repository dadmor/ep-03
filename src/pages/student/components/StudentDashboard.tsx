import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { 
  Zap, Flame, TrendingUp, Trophy, Gift, Star,
  ArrowRight, BookOpen, Target, Users, Clock,
  CheckCircle2, Circle, Play, Sparkles
} from "lucide-react";
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
  motion
} from "./motion";

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<any>();
  const { stats, refetch: refetchStats } = useStudentStats();
  const { data: coursesData } = useRPC<any[]>('get_my_courses');
  const [claimablePoints, setClaimablePoints] = React.useState(0);

  const courses = coursesData || [];

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
        toast.success(`Odebrano ${result.total_earned} punktów!`);
        refetchStats();
        setClaimablePoints(0);
      }
    } catch (error) {
      toast.error("Nie można odebrać nagród");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Clean & Minimal */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {getGreeting()}, {identity?.full_name?.split(' ')[0]}
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('pl-PL', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
            
            {/* Quick Stats - Minimal badges */}
            <div className="flex items-center gap-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full cursor-pointer"
                onClick={() => navigate('/student/gamification')}
              >
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">
                  <AnimatedCounter value={stats.points} />
                </span>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-secondary" />
                <span className="font-medium text-secondary">{stats.level}</span>
              </motion.div>
              
              {stats.streak > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full"
                >
                  <Flame className="w-4 h-4 text-destructive" />
                  <span className="font-medium text-destructive">{stats.streak}</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Section - Vibrant contrast */}
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-primary rounded-2xl p-8 overflow-hidden"
        >
          {/* Geometric pattern inspired by logo */}
          <div className="absolute inset-0">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/90" />
            
            {/* Geometric accent - rotating square like in logo */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
              className="absolute -top-24 -right-24 w-64 h-64"
            >
              <div className="w-full h-full bg-secondary/10 rounded-3xl transform rotate-45" />
            </motion.div>
            
            {/* Circular accent - pulsing */}
            <motion.div 
              animate={{ scale: [0.8, 1, 0.8] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-12 -left-12 w-48 h-48"
            >
              <div className="w-full h-full bg-accent/10 rounded-full blur-2xl" />
            </motion.div>
            
            {/* Grid overlay for modern tech feel */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, white 1px, transparent 1px),
                  linear-gradient(to bottom, white 1px, transparent 1px)
                `,
                backgroundSize: '32px 32px'
              }}
            />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Twoja nauka, Twój sukces! 🚀
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 text-lg max-w-md"
              >
                Każdy dzień to nowa szansa na rozwój. Kontynuuj swoją serię i zbieraj punkty!
              </motion.p>
              
              {/* Streak reminder */}
              {stats.streak > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full"
                >
                  <Flame className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">
                    {stats.streak} dni serii - nie przerywaj!
                  </span>
                </motion.div>
              )}
            </div>
            
            {/* Points Display - Featured */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-right"
            >
              <p className="text-white/60 text-sm mb-1">Twoje punkty</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-white">
                  <AnimatedCounter value={stats.points} />
                </span>
                <motion.div 
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex flex-col items-start"
                >
                  <span className="text-sm text-white/80 font-medium">
                    +<AnimatedCounter value={stats.idle_rate} />/h
                  </span>
                  <span className="text-xs text-white/60">idle rate</span>
                </motion.div>
              </div>
              
              {/* Progress to next level */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                  <span>Poziom {stats.level}</span>
                  <span>Poziom {stats.level + 1}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.points % 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Daily Reward - Subtle notification */}
        {claimablePoints > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-accent/5 border border-accent/20 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Nagroda do odebrania</p>
                <p className="text-sm text-muted-foreground">{claimablePoints} punktów czeka</p>
              </div>
            </div>
            <AnimatedButton
              onClick={handleClaimRewards}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/90 transition-colors"
            >
              Odbierz
            </AnimatedButton>
          </motion.div>
        )}

        {/* Stats Grid - Clean cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm text-muted-foreground">Punkty</span>
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-semibold text-foreground">
              <AnimatedCounter value={stats.points} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              +<AnimatedCounter value={stats.idle_rate} />/h
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-6 hover:border-secondary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm text-muted-foreground">Poziom</span>
              <Trophy className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-2xl font-semibold text-foreground">{stats.level}</p>
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-500"
                style={{ width: `${(stats.points % 100)}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-lg p-6 hover:border-destructive/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm text-muted-foreground">Seria dni</span>
              <Flame className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-2xl font-semibold text-foreground">{stats.streak}</p>
            <p className="text-xs text-muted-foreground mt-1">dni z rzędu</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-lg p-6 hover:border-accent/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm text-muted-foreground">Idle rate</span>
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-semibold text-foreground">
              +<AnimatedCounter value={stats.idle_rate} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">punktów/h</p>
          </motion.div>
        </div>

        {/* Courses Section - Minimal design */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Twoje kursy</h2>
            <button
              onClick={() => navigate("/student/courses")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Zobacz wszystkie
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course: any, index: number) => (
              <motion.div
                key={course.course_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => navigate(`/student/courses/${course.course_id}`)}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">{course.icon_emoji || '📚'}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {course.progress_percent}%
                    </span>
                  </div>
                </div>
                
                <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                
                <div className="space-y-3">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <AnimatedProgress
                      value={course.progress_percent}
                      className="h-full"
                      barClassName="h-full bg-primary transition-all duration-500"
                    />
                  </div>
                  
                  {course.next_activity && (
                    <p className="text-xs text-muted-foreground">
                      Następna: <span className="text-foreground">{course.next_activity}</span>
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
            
            {courses.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Brak przypisanych kursów</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions - Minimal buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Trophy, label: "Ranking", path: "/student/leaderboard", color: "text-primary" },
            { icon: Target, label: "Osiągnięcia", path: "/student/achievements", color: "text-secondary" },
            { icon: Sparkles, label: "Ulepszenia", path: "/student/gamification", color: "text-accent" },
            { icon: Users, label: "Profil", path: "/student/profile", color: "text-destructive" }
          ].map((action, index) => (
            <motion.button
              key={action.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-all group"
            >
              <action.icon className={`w-4 h-4 ${action.color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
};