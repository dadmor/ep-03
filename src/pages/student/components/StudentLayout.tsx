// src/pages/student/components/StudentLayout.tsx - ZOPTYMALIZOWANA WERSJA
import React, { useState } from "react";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Gamepad2, Trophy, Award, User, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { useStudentStats } from "../hooks";

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: identity } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = useStudentStats();

  const menuItems = [
    { path: '/student/dashboard', label: 'Główna', icon: Home },
    { path: '/student/gamification', label: 'Ulepszenia', icon: Gamepad2 },
    { path: '/student/leaderboard', label: 'Ranking', icon: Trophy },
    { path: '/student/achievements', label: 'Osiągnięcia', icon: Award },
    { path: '/student/profile', label: 'Profil', icon: User }
  ];

  return (
    <MotionConfig transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}>
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="text-xl font-semibold">Smart Up</div>
          </div>
          
          {/* Points Display */}
          <div className="p-6 border-b border-gray-100">
            <div className="text-2xl font-semibold text-gray-900">
              {stats.points.toLocaleString('pl-PL')}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              punktów • +{stats.idle_rate}/h
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="p-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                    isActive 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Wyloguj</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-64">
          {/* Mobile Header */}
          <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-50 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {stats.points.toLocaleString('pl-PL')} pkt
              </div>
              <div className="text-xs text-gray-500">+{stats.idle_rate}/h</div>
            </div>
            
            <div className="w-10" /> {/* Spacer for center alignment */}
          </header>

          {/* Content */}
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Sidebar */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/20 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                className="lg:hidden fixed top-0 left-0 h-screen w-80 bg-white z-50 shadow-xl"
              >
                {/* Mobile sidebar content - same as desktop */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                  <div className="text-xl font-semibold">Smart Up</div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 border-b border-gray-100">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stats.points.toLocaleString('pl-PL')}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    punktów • +{stats.idle_rate}/h
                  </div>
                </div>
                
                <nav className="p-4">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                          isActive 
                            ? 'bg-gray-900 text-white' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

