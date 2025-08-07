// src/pages/student/components/StudentLayout.tsx - UPDATED WITHOUT COURSES TAB
import React, { useState } from "react";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Gamepad2,
  Trophy,
  Award,
  User,
  LogOut,
  Menu,
  X,
  Coins,
  Flame,
  Zap,
  TrendingUp,
  Clock,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useStudentStats } from "../hooks";
import { supabaseClient } from "@/utility";

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: identity } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const { stats, refetch: refetchStats } = useStudentStats();
  
  // Idle points animation
  const [displayPoints, setDisplayPoints] = useState(stats.points);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showEarned, setShowEarned] = useState(false);
  const [showClaimButton, setShowClaimButton] = useState(false);
  const pointsPerSecond = stats.idle_rate / 3600;

  // Animate points counter - akumuluj punkty i pokazuj co 10 sekund
  React.useEffect(() => {
    let accumulated = 0;
    
    const interval = setInterval(() => {
      accumulated += pointsPerSecond;
      setDisplayPoints(prev => prev + pointsPerSecond);
    }, 1000);

    // Pokazuj przyrost co 10 sekund jeśli jest znaczący
    const showInterval = setInterval(() => {
      if (accumulated >= 0.1) {
        setEarnedPoints(accumulated);
        setShowEarned(true);
        setTimeout(() => setShowEarned(false), 2000);
        accumulated = 0;
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(showInterval);
    };
  }, [pointsPerSecond]);

  // Sync with actual points
  React.useEffect(() => {
    setDisplayPoints(stats.points);
  }, [stats.points]);

  // Check for claimable rewards periodically
  React.useEffect(() => {
    const checkRewards = async () => {
      try {
        const { data } = await supabaseClient.rpc('check_claimable_rewards');
        setShowClaimButton(data?.has_rewards || false);
      } catch (error) {
        console.error("Error checking rewards:", error);
      }
    };

    checkRewards();
    const interval = setInterval(checkRewards, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleClaimRewards = async () => {
    try {
      const { data, error } = await supabaseClient.rpc('claim_daily_rewards');
      
      if (error) throw error;
      
      if (data) {
        toast.success(`Odebrano ${data.total_earned} punktów!`, {
          description: data.daily_points > 0 
            ? `Seria ${data.streak} dni!` 
            : "Punkty idle zebrane",
          icon: <Gift className="w-5 h-5" />
        });
        refetchStats();
        setShowClaimButton(false);
      }
    } catch (error) {
      toast.error("Nie można odebrać nagród");
    }
  };

  const menuItems = [
    { id: 'dashboard', path: '/student/dashboard', label: 'Dashboard', icon: Home },
    { id: 'gamification', path: '/student/gamification', label: 'Gamifikacja', icon: Gamepad2 },
    { id: 'leaderboard', path: '/student/leaderboard', label: 'Ranking', icon: Trophy },
    { id: 'achievements', path: '/student/achievements', label: 'Osiągnięcia', icon: Award },
    { id: 'profile', path: '/student/profile', label: 'Profil', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white shadow-xl transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-700 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Smart Up</span>
          </div>
        </div>
        
        {/* Idle Points Display in Sidebar */}
        <div className="p-4 border-b bg-gradient-to-b from-purple-50 to-white">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span className="text-xs font-medium">Punkty</span>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-4 h-4" />
              </motion.div>
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {Math.floor(displayPoints).toLocaleString('pl-PL')}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs opacity-90">
              <TrendingUp className="w-3 h-3" />
              <span>+{stats.idle_rate} pkt/h</span>
            </div>
          </div>
          
          {/* Claim button */}
          <AnimatePresence>
            {showClaimButton && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaimRewards}
                className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-shadow"
              >
                <Gift className="w-4 h-4 inline mr-1" />
                Odbierz nagrody!
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === item.path 
                  ? 'bg-purple-50 text-purple-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Wyloguj</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center gap-4">
              {/* Mobile idle display */}
              <div className="lg:hidden bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-purple-900">
                      {Math.floor(displayPoints).toLocaleString('pl-PL')}
                    </span>
                  </div>
                  <div className="text-xs text-purple-700">
                    +{stats.idle_rate}/h
                  </div>
                </div>
              </div>
              
              {/* Streak display */}
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
                <Flame className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-900">{stats.streak} dni</span>
              </div>
              
              {/* Level display */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                <Trophy className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-900">Poziom {stats.level}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Floating idle indicator for desktop */}
        <div className="hidden lg:block fixed bottom-8 right-8 z-40">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 text-white shadow-2xl min-w-[200px]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">Twoje punkty</div>
                  <div className="text-2xl font-bold tabular-nums">
                    {Math.floor(displayPoints).toLocaleString('pl-PL')}
                  </div>
                  <div className="text-xs opacity-90 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.idle_rate} pkt/h
                  </div>
                </div>
              </div>
              
              {/* Animated earnings - pokazuj co 10 sekund */}
              <AnimatePresence>
                {showEarned && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.8 }}
                    animate={{ opacity: 1, y: -30, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.8 }}
                    className="absolute -top-2 right-4 text-yellow-300 font-bold text-sm"
                  >
                    +{earnedPoints.toFixed(1)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Claim rewards floating button */}
            <AnimatePresence>
              {showClaimButton && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClaimRewards}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                >
                  <Gift className="w-6 h-6 text-white" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};