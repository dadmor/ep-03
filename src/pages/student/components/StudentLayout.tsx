/* path: src/pages/student/components/StudentLayout.tsx */
import React, { useMemo, useState } from "react";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Gamepad2, Trophy, Award, User } from "lucide-react";
import { useStudentStats } from "../hooks";

import Sidebar from "./layout/Sidebar";
import Topbar from "./layout/Topbar";
import BottomNav from "./layout/BottomNav";
import Background from "./layout/Background";
import type { MenuItem } from "./layout/types";

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: identity } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = useStudentStats();

  const menuItems = useMemo<MenuItem[]>(
    () => [
      { path: "/student/dashboard", label: "Główna", icon: Home },
      { path: "/student/gamification", label: "Ulepszenia", icon: Gamepad2 },
      { path: "/student/leaderboard", label: "Ranking", icon: Trophy },
      { path: "/student/achievements", label: "Osiągnięcia", icon: Award },
      { path: "/student/profile", label: "Profil", icon: User },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-background relative">
      <Background />

      {/* Sidebar desktop */}
      <Sidebar
        variant="desktop"
        identity={identity}
        stats={stats}
        menuItems={menuItems}
        currentPath={location.pathname}
        onNavigate={navigate}
        onLogout={() => logout()}
      />

      {/* Main + Topbar */}
      <main className="relative lg:ml-72">
        <Topbar
          identity={identity}
          stats={stats}
          menuItems={menuItems}
          currentPath={location.pathname}
          onNavigate={navigate}
          onLogout={() => logout()}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <section className="min-h-[calc(100vh-4rem)] pb-[104px] sm:pb-[112px] lg:pb-[120px]">
          {children}
        </section>
      </main>

      {/* Sidebar mobile */}
      <Sidebar
        variant="mobile"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        identity={identity}
        stats={stats}
        menuItems={menuItems}
        currentPath={location.pathname}
        onNavigate={navigate}
        onLogout={() => logout()}
      />

      {/* Dock */}
      <BottomNav
        menuItems={menuItems}
        currentPath={location.pathname}
        onNavigate={navigate}
      />
    </div>
  );
};
