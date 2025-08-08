/* path: src/pages/student/components/StudentLayout.tsx */
import React, { useState } from "react";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Gamepad2,
  Trophy,
  Award,
  User,
  LogOut,
  Menu,
  X,
  Zap,
  Flame,
  GraduationCap,
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { useStudentStats } from "../hooks";
import { AnimatedCounter } from "./motion";

/**
 * Zmiany:
 * - Layout posiada JEDEN uniwersalny header (Dashboard nie renderuje swojego).
 * - Dodany stały bottom-nav (lg:hidden) na mobile.
 * - Dodane odstępy w main: min-h + pb, by nie kolidować z bottom-nav.
 */

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Mock dark mode
  const { data: identity } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = useStudentStats();

  const menuItems = [
    { path: "/student/dashboard", label: "Główna", icon: Home },
    { path: "/student/gamification", label: "Ulepszenia", icon: Gamepad2 },
    { path: "/student/leaderboard", label: "Ranking", icon: Trophy },
    { path: "/student/achievements", label: "Osiągnięcia", icon: Award },
    { path: "/student/profile", label: "Profil", icon: User },
  ];

  const profileMenuItems = [
    { label: "Profil", icon: User, action: () => navigate("/student/profile") },
    { label: "Ustawienia", icon: Settings, action: () => navigate("/student/settings") },
    { label: "Pomoc", icon: HelpCircle, action: () => navigate("/student/help") },
    {
      label: darkMode ? "Tryb jasny" : "Tryb ciemny",
      icon: darkMode ? Sun : Moon,
      action: () => setDarkMode(!darkMode),
    },
    { label: "Wyloguj", icon: LogOut, action: () => logout(), danger: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <MotionConfig transition={{ type: "spring", stiffness: 300, damping: 30 }}>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed top-0 left-0 h-screen w-72 bg-card border-r border-border">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-border relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-3xl transform rotate-45" />
            <div className="flex items-center gap-3 relative z-10">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg"
              >
                <GraduationCap className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-foreground">Smart Up</span>
            </div>
          </div>

          {/* User */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-lg">
                  {identity?.full_name?.charAt(0) || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{stats.level}</span>
                </div>
              </motion.div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {identity?.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Poziom {stats.level} • {stats.streak} dni
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-primary/5 rounded-xl p-3 border border-primary/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Punkty</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  <AnimatedCounter value={stats.points} />
                </p>
                <p className="text-xs text-primary">
                  +<AnimatedCounter value={stats.idle_rate} />
                  /h
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="bg-destructive/5 rounded-xl p-3 border border-destructive/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-destructive" />
                  <span className="text-xs text-muted-foreground">Seria</span>
                </div>
                <p className="text-lg font-bold text-foreground">{stats.streak}</p>
                <p className="text-xs text-destructive">dni z rzędu</p>
              </motion.div>
            </div>
          </div>

          {/* Nav */}
          <nav className="px-4 space-y-1">
            {menuItems.map((item, index) => {
              const active = isActive(item.path);
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-5 h-5 relative z-10" />
                  <span className="font-medium text-sm relative z-10">
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 bg-white rounded-full relative z-10"
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <div className="mb-4 px-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Poziom {stats.level}</span>
                <span>Poziom {stats.level + 1}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.points % 100}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Wyloguj</span>
            </motion.button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-72">
          {/* Uniwersalny Header */}
          <header className="h-20 bg-card/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 hover:bg-muted rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </motion.button>

              <div className="hidden lg:block">
                <h1 className="text-xl font-semibold text-foreground">
                  {menuItems.find((i) => i.path === location.pathname)?.label ||
                    "Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Witaj ponownie, {identity?.full_name?.split(" ")[0]}!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 hover:bg-muted rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </motion.button>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-primary/10 rounded-xl border border-primary/20"
              >
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm lg:text-base text-foreground">
                  <AnimatedCounter value={stats.points} />
                </span>
                <span className="hidden lg:block text-xs text-primary">
                  +{stats.idle_rate}/h
                </span>
              </motion.div>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-xl transition-colors"
                >
                  <div className="relative">
                    <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-sm lg:text-base shadow-lg">
                      {identity?.full_name?.charAt(0) || "U"}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 lg:w-5 lg:h-5 bg-accent rounded-full flex items-center justify-center border-2 border-card">
                      <span className="text-white text-[10px] lg:text-xs font-bold">
                        {stats.level}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-40"
                        onClick={() => setProfileMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-border">
                          <p className="font-semibold text-foreground">
                            {identity?.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {identity?.email}
                          </p>
                        </div>

                        <div className="p-2">
                          {profileMenuItems.map((item, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                item.action();
                                setProfileMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                item.danger
                                  ? "text-destructive hover:bg-destructive/10"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                            >
                              <item.icon className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Content; padding bottom dla bottom-nav na mobile */}
          <div className="min-h-[calc(100vh-5rem)] pb-20 lg:pb-0">{children}</div>
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
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="lg:hidden fixed top:0 top-0 left-0 h-screen w-80 bg-card/95 backdrop-blur-xl z-50 shadow-2xl border-r border-border"
              >
                <div className="h-20 flex items-center justify-between px-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-foreground">
                      Smart Up
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-lg">
                        {identity?.full_name?.charAt(0) || "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {stats.level}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {identity?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Poziom {stats.level} • {stats.streak} dni
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Punkty
                        </span>
                      </div>
                      <p className="text-lg font-bold text-foreground">
                        <AnimatedCounter value={stats.points} />
                      </p>
                      <p className="text-xs text-primary">
                        +<AnimatedCounter value={stats.idle_rate} />
                        /h
                      </p>
                    </div>

                    <div className="bg-destructive/5 rounded-xl p-3 border border-destructive/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-4 h-4 text-destructive" />
                        <span className="text-xs text-muted-foreground">
                          Seria
                        </span>
                      </div>
                      <p className="text-lg font-bold text-foreground">
                        {stats.streak}
                      </p>
                      <p className="text-xs text-destructive">dni z rzędu</p>
                    </div>
                  </div>
                </div>

                <nav className="px-4 space-y-1">
                  {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                  <div className="mb-4 px-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Poziom {stats.level}</span>
                      <span>Poziom {stats.level + 1}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.points % 100}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => logout()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Wyloguj</span>
                  </motion.button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ======= BOTTOM NAV (MOBILE) ======= */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
          <div className="backdrop-blur bg-card/95 border-t border-border">
            <div className="grid grid-cols-5">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${active ? "" : ""}`} />
                    <span className="text-[11px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* safe-area spacer */}
          <div
            className="bg-card"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          />
        </nav>
      </div>
    </MotionConfig>
  );
};
