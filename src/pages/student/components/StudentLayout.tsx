/* path: src/pages/student/components/StudentLayout.tsx */
import React, { useEffect, useMemo, useState } from "react";
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
import SoftBackground from "./SoftBackground";

/**
 * Zmiany:
 * - Header: spójne wysokości (h-16), wyraźniejsza separacja (shadow + backdrop), lepszy kontrast.
 * - CTA/nawigacja: ujednolicone wymiary (h-11), spójny rytm i paddingi, wyróżniony "Wyloguj".
 * - Profil menu: stałe wysokości pozycji, klarowna hierarchia.
 * - Sidebar/dock: aktywny stan z czytelnym akcentem, animacje hover-lift.
 * - Dark mode: realny toggle z localStorage + dopięcie klasy .dark na <html>.
 */

const useTheme = () => {
  const getInitial = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState<"light" | "dark">(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
};

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const { data: identity } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = useStudentStats();

  const menuItems = useMemo(
    () => [
      { path: "/student/dashboard", label: "Główna", icon: Home },
      { path: "/student/gamification", label: "Ulepszenia", icon: Gamepad2 },
      { path: "/student/leaderboard", label: "Ranking", icon: Trophy },
      { path: "/student/achievements", label: "Osiągnięcia", icon: Award },
      { path: "/student/profile", label: "Profil", icon: User },
    ],
    []
  );

  const profileMenuItems = useMemo(
    () => [
      {
        label: "Profil",
        icon: User,
        action: () => navigate("/student/profile"),
      },
      {
        label: "Ustawienia",
        icon: Settings,
        action: () => navigate("/student/settings"),
      },
      {
        label: "Pomoc",
        icon: HelpCircle,
        action: () => navigate("/student/help"),
      },
      {
        label: theme === "dark" ? "Tryb jasny" : "Tryb ciemny",
        icon: theme === "dark" ? Sun : Moon,
        action: () => toggleTheme(),
      },
      { label: "Wyloguj", icon: LogOut, action: () => logout(), danger: true },
    ],
    [navigate, logout, theme, toggleTheme]
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <MotionConfig transition={{ type: "spring", stiffness: 300, damping: 30 }}>
      <div className="min-h-screen bg-background">
        {/* ===== Sidebar (desktop) ===== */}
        <aside className="hidden lg:block fixed top-0 left-0 h-screen w-72 bg-card/95 backdrop-blur border-r">
          <div className="h-16 flex items-center px-6 border-b relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rotate-45" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white grid place-items-center shadow">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold">Smart Up</span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary grid place-items-center font-bold">
                  {identity?.full_name?.charAt(0) || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary text-white text-xs grid place-items-center font-bold">
                  {stats.level}
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{identity?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  Poziom {stats.level} • {stats.streak} dni
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-3 bg-primary/5 border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Punkty</span>
                </div>
                <p className="text-lg font-bold">
                  <AnimatedCounter value={stats.points} />
                </p>
                <p className="text-xs text-primary">
                  +<AnimatedCounter value={stats.idle_rate} />
                  /h
                </p>
              </div>
              <div className="rounded-xl border p-3 bg-destructive/5 border-destructive/10">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-destructive" />
                  <span className="text-xs text-muted-foreground">Seria</span>
                </div>
                <p className="text-lg font-bold">{stats.streak}</p>
                <p className="text-xs text-destructive">dni z rzędu</p>
              </div>
            </div>
          </div>

          <nav className="px-4 space-y-1">
            {menuItems.map((item, i) => {
              const active = isActive(item.path);
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ x: 4 }}
                  className={`relative w-full flex items-center gap-3 px-4 h-11 rounded-xl transition-colors hover-lift
                    ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t space-y-3">
            <div className="px-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Poziom {stats.level}</span>
                <span>Poziom {stats.level + 1}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.points % 100}%` }}
                  transition={{ duration: 0.9 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                />
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-4 h-11 rounded-xl text-destructive border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors"
              title="Wyloguj"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-semibold">Wyloguj</span>
            </button>
          </div>
        </aside>

        {/* ===== Main + Header ===== */}
        <main className="relative lg:ml-72">
          {/* ===== Tło SVG ===== */}
          <SoftBackground opacity={0.2} speed={2} />
          {/* Header (uniwersalny) */}
          <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b shadow-sm">
            <div className="mx-auto max-w-6xl h-full px-4 lg:px-8 flex items-center justify-between">
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2.5 rounded-xl hover:bg-muted focus-ring"
                  aria-label="Otwórz menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="hidden lg:block min-w-0">
                  <h1 className="text-base sm:text-lg font-semibold truncate">
                    {menuItems.find((i) => i.path === location.pathname)
                      ?.label || "Dashboard"}
                  </h1>
                  <p className="text-xs text-muted-foreground truncate">
                    Witaj, {identity?.full_name?.split(" ")[0]}!
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2 lg:gap-3">
                <button
                  className="relative p-2.5 rounded-xl hover:bg-muted focus-ring h-11 w-11 grid place-items-center"
                  aria-label="Powiadomienia"
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                </button>

                <div className="flex items-center gap-2 px-3 lg:px-4 h-11 rounded-xl border bg-primary/10 border-primary/20">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm lg:text-base tabular-nums">
                    <AnimatedCounter value={stats.points} />
                  </span>
                  <span className="hidden md:block text-xs text-primary">
                    +<AnimatedCounter value={stats.idle_rate} />
                    /h
                  </span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-1.5 h-11 rounded-xl hover:bg-muted focus-ring"
                    aria-haspopup="menu"
                    aria-expanded={profileMenuOpen}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white grid place-items-center font-bold">
                        {identity?.full_name?.charAt(0) || "U"}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-accent text-white text-[10px] lg:text-xs grid place-items-center border-2 border-card">
                        {stats.level}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        profileMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-2 w-64 bg-card rounded-xl border shadow-soft-lg z-50 overflow-hidden"
                        role="menu"
                      >
                        <div className="p-4 border-b">
                          <p className="font-semibold truncate">
                            {identity?.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {identity?.email}
                          </p>
                        </div>
                        <div className="p-2">
                          {profileMenuItems.map((item, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                item.action();
                                setProfileMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 h-11 rounded-lg transition-colors
                                ${
                                  item.danger
                                    ? "text-destructive hover:bg-destructive/10"
                                    : "text-foreground/80 hover:text-foreground hover:bg-muted"
                                }`}
                              role="menuitem"
                            >
                              <item.icon className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          {/* Content; stały spacer pod dockiem */}
          <div className="min-h-[calc(100vh-4rem)] pb-[104px] sm:pb-[112px] lg:pb-[120px]">
            {children}
          </div>
        </main>

        {/* ===== Mobile Sidebar ===== */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="lg:hidden fixed top-0 left-0 h-screen w-80 bg-card/95 backdrop-blur-xl z-50 shadow-2xl border-r"
                aria-label="Nawigacja boczna"
              >
                <div className="h-16 flex items-center justify-between px-6 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white grid place-items-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold">Smart Up</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted focus-ring"
                    aria-label="Zamknij"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary grid place-items-center font-bold">
                        {identity?.full_name?.charAt(0) || "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary text-white text-xs grid place-items-center font-bold">
                        {stats.level}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {identity?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Poziom {stats.level} • {stats.streak} dni
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border p-3 bg-primary/5 border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Punkty
                        </span>
                      </div>
                      <p className="text-lg font-bold">
                        <AnimatedCounter value={stats.points} />
                      </p>
                      <p className="text-xs text-primary">
                        +<AnimatedCounter value={stats.idle_rate} />
                        /h
                      </p>
                    </div>
                    <div className="rounded-xl border p-3 bg-destructive/5 border-destructive/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-4 h-4 text-destructive" />
                        <span className="text-xs text-muted-foreground">
                          Seria
                        </span>
                      </div>
                      <p className="text-lg font-bold">{stats.streak}</p>
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
                        className={`w-full flex items-center gap-3 px-4 h-11 rounded-xl transition-colors hover-lift
                          ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center justify-center gap-2 px-4 h-11 rounded-xl text-destructive border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors"
                    title="Wyloguj"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-semibold">Wyloguj</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ===== Zintegrowany DOCK (MOBILE + DESKTOP) ===== */}
        <nav
          aria-label="Główna nawigacja dolna"
          className="
            fixed bottom-0 z-40
            left-0 right-0
            lg:left-72
            bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60
            border-t shadow-sm
          "
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto max-w-6xl p-1.5 sm:px-4">
            <div className="grid grid-cols-5 gap-1 p-1">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`relative flex flex-col items-center justify-center gap-1 rounded-lg p-4 transition-colors hover-lift
                      ${
                        active
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-[11px] font-medium">
                      {item.label}
                    </span>
                    {active && (
                      <span className="pointer-events-none absolute inset-x-6 -bottom-[3px] h-1 rounded-full bg-primary/70" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </MotionConfig>
  );
};
