// src/pages/student/components/StudentLayout.tsx
import React, { useState } from "react";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Gamepad2, Trophy, Award, User, LogOut, Menu, X, Zap } from "lucide-react";
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Smart Up</span>
            </div>
          </div>
          
          {/* User Info & Points */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold">
                {identity?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {identity?.full_name}
                </p>
                <p className="text-xs text-gray-500">Poziom {stats.level}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange" />
                <span className="text-sm font-semibold text-gray-900">
                  {stats.points.toLocaleString('pl-PL')}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                +{stats.idle_rate}/h
              </span>
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
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-all ${
                    isActive 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Wyloguj</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-64">
          {/* Mobile Header */}
          <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange" />
              <span className="font-semibold text-gray-900">
                {stats.points.toLocaleString('pl-PL')}
              </span>
              <span className="text-xs text-gray-500">
                +{stats.idle_rate}/h
              </span>
            </div>
            
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm">
              {identity?.full_name?.charAt(0) || 'U'}
            </div>
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
                className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                className="lg:hidden fixed top-0 left-0 h-screen w-80 bg-white z-50 shadow-xl"
              >
                {/* Mobile sidebar header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Smart Up</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Mobile sidebar content - same as desktop */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold">
                      {identity?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {identity?.full_name}
                      </p>
                      <p className="text-xs text-gray-500">Poziom {stats.level}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange" />
                      <span className="text-sm font-semibold text-gray-900">
                        {stats.points.toLocaleString('pl-PL')}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      +{stats.idle_rate}/h
                    </span>
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
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-all ${
                          isActive 
                            ? 'bg-gray-900 text-white' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.label}</span>
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