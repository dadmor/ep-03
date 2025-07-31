// src/pages/student/components/StudentLayout.tsx
import React, { useState } from "react";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Gamepad2,
  Trophy,
  Award,
  User,
  LogOut,
  Menu,
  X,
  Coins,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui";

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: identity } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', path: '/student/dashboard', label: 'Dashboard', icon: Home },
    { id: 'courses', path: '/student/courses', label: 'Kursy', icon: BookOpen },
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
              {/* Tu możesz dodać punkty i streak z hooka useStudentStats */}
            </div>
          </div>
        </header>

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