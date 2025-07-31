// src/components/menu/StudentMenu.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetIdentity, useLogout } from "@refinedev/core";
import {
  Home,
  BookOpen,
  Gamepad2,
  Trophy,
  Award,
  User,
  LogOut,
  Settings,
  X
} from "lucide-react";
import { cn } from "@/utility";
import { Button } from "../ui";


interface StudentMenuProps {
  onClose?: () => void;
}

export const StudentMenu: React.FC<StudentMenuProps> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();

  const menuItems = [
    { id: 'dashboard', path: '/student/dashboard', label: 'Dashboard', icon: Home },
    { id: 'courses', path: '/student/courses', label: 'Kursy', icon: BookOpen },
    { id: 'gamification', path: '/student/gamification', label: 'Gamifikacja', icon: Gamepad2 },
    { id: 'leaderboard', path: '/student/leaderboard', label: 'Ranking', icon: Trophy },
    { id: 'achievements', path: '/student/achievements', label: 'Osiągnięcia', icon: Award },
    { id: 'profile', path: '/student/profile', label: 'Profil', icon: User }
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-700 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Smart Up</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* User info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
            {identity?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{identity?.full_name}</p>
            <p className="text-xs text-gray-500">Uczeń</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive(item.path)
                ? "bg-purple-50 text-purple-700 font-medium" 
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-1">
        <button 
          onClick={() => handleNavigation('/student/settings')}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Ustawienia</span>
        </button>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Wyloguj</span>
        </button>
      </div>
    </div>
  );
};