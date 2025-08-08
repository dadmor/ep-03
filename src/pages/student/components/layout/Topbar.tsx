/* path: src/pages/student/components/layout/Topbar.tsx */
import React, { useMemo, useState } from "react";
import { Menu, Bell, Zap, ChevronDown, User, Settings, HelpCircle, LogOut, Sun, Moon } from "lucide-react";
import type { MenuItem } from "./types";

const useTheme = () => {
  const getInitial = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved as "light" | "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const [theme, setTheme] = useState<"light" | "dark">(getInitial);
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
};

const Topbar: React.FC<{
  identity?: { full_name?: string; email?: string };
  stats: { level: number; streak: number; points: number; idle_rate: number };
  menuItems: MenuItem[];
  currentPath: string;
  onNavigate: (p: string) => void;
  onLogout: () => void;
  onOpenSidebar: () => void;
}> = ({ identity, stats, menuItems, currentPath, onNavigate, onLogout, onOpenSidebar }) => {
  const { theme, toggle } = useTheme();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const title = useMemo(
    () => menuItems.find((i) => i.path === currentPath)?.label || "Dashboard",
    [menuItems, currentPath]
  );

  const profileMenuItems = useMemo(
    () => [
      { label: "Profil", icon: User, action: () => onNavigate("/student/profile") },
      { label: "Ustawienia", icon: Settings, action: () => onNavigate("/student/settings") },
      { label: "Pomoc", icon: HelpCircle, action: () => onNavigate("/student/help") },
      { label: theme === "dark" ? "Tryb jasny" : "Tryb ciemny", icon: theme === "dark" ? Sun : Moon, action: () => toggle() },
      { label: "Wyloguj", icon: LogOut, action: () => onLogout(), danger: true },
    ],
    [onNavigate, onLogout, theme, toggle]
  );

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b shadow-sm">
      <div className="mx-auto max-w-6xl h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2.5 rounded-xl hover:bg-muted focus-ring"
            aria-label="Otwórz menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block min-w-0">
            <h1 className="text-base sm:text-lg font-semibold truncate">{title}</h1>
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
              {stats.points}
            </span>
            <span className="hidden md:block text-xs text-primary">
              +{stats.idle_rate}/h
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
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {profileMenuOpen && (
              <menu className="absolute right-0 mt-2 w-64 bg-card rounded-xl border shadow-soft-lg z-50 overflow-hidden">
                <section className="p-4 border-b">
                  <p className="font-semibold truncate">{identity?.full_name}</p>
                  <p className="text-sm text-muted-foreground truncate">{identity?.email}</p>
                </section>
                <ul className="p-2">
                  {profileMenuItems.map((item, i) => (
                    <li key={i}>
                      <button
                        onClick={() => {
                          item.action();
                          setProfileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 h-11 rounded-lg ${
                          (item as any).danger
                            ? "text-destructive hover:bg-destructive/10"
                            : "text-foreground/80 hover:text-foreground hover:bg-muted"
                        }`}
                        role="menuitem"
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </menu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
