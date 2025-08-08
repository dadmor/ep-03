/* path: src/pages/student/components/layout/Sidebar.tsx */
import React from "react";
import {
  GraduationCap,
  LogOut,
  Zap,
  Flame,
  Home,
  Gamepad2,
  Trophy,
  Award,
  User,
} from "lucide-react";
import type { MenuItem } from "./types";

// Lokalne, wewnętrzne komponenty sidebaru
const Brand: React.FC = () => (
  <header className="h-16 px-6 border-b relative grid place-items-center justify-start overflow-hidden">
    <i aria-hidden className="absolute -right-10 -top-10 w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rotate-45" />
    <div className="flex items-center gap-3 relative z-10">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white grid place-items-center shadow">
        <GraduationCap className="w-5 h-5" />
      </div>
      <strong className="text-lg">Smart Up</strong>
    </div>
  </header>
);

const UserCard: React.FC<{ name?: string; level: number; streak: number }> = ({
  name,
  level,
  streak,
}) => (
  <section className="p-6">
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary grid place-items-center font-bold">
          {name?.charAt(0) || "U"}
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary text-white text-xs grid place-items-center font-bold">
          {level}
        </div>
      </div>
      <div className="min-w-0">
        <p className="font-semibold truncate">{name}</p>
        <p className="text-sm text-muted-foreground">
          Poziom {level} • {streak} dni
        </p>
      </div>
    </div>
  </section>
);

const StatsTiles: React.FC<{ points: number; idle: number; streak: number }> = ({
  points,
  idle,
  streak,
}) => (
  <section className="px-6 -mt-2 mb-2">
    <div className="grid grid-cols-2 gap-3">
      <article className="rounded-xl border p-3 bg-primary/5 border-primary/10">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">Punkty</span>
        </div>
        <p className="text-lg font-bold">{points}</p>
        <p className="text-xs text-primary">+{idle}/h</p>
      </article>
      <article className="rounded-xl border p-3 bg-destructive/5 border-destructive/10">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-4 h-4 text-destructive" />
          <span className="text-xs text-muted-foreground">Seria</span>
        </div>
        <p className="text-lg font-bold">{streak}</p>
        <p className="text-xs text-destructive">dni z rzędu</p>
      </article>
    </div>
  </section>
);

const MenuList: React.FC<{
  items: MenuItem[];
  current: string;
  onNavigate: (path: string) => void;
}> = ({ items, current, onNavigate }) => {
  const isActive = (p: string) => current === p;
  const Item = (item: MenuItem) => {
    const active = isActive(item.path);
    return (
      <button
        onClick={() => onNavigate(item.path)}
        className={`relative w-full flex items-center gap-3 px-4 h-11 rounded-xl transition-colors
          ${
            active
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          }`}
      >
        <item.icon className="w-5 h-5" />
        <span className="text-sm font-medium">{item.label}</span>
      </button>
    );
  };
  return (
    <nav className="px-4">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.path}>
            <Item {...item} />
          </li>
        ))}
      </ul>
    </nav>
  );
};

const LogoutButton: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
  <button
    onClick={onLogout}
    className="w-full flex items-center justify-center gap-2 px-4 h-11 rounded-xl text-destructive border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors"
    title="Wyloguj"
  >
    <LogOut className="w-5 h-5" />
    <span className="text-sm font-semibold">Wyloguj</span>
  </button>
);

const LevelProgress: React.FC<{ level: number; points: number }> = ({
  level,
  points,
}) => {
  const pct = Math.max(0, Math.min(100, points % 100));
  return (
    <section className="px-6">
      <div className="px-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Poziom {level}</span>
          <span>Poziom {level + 1}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </section>
  );
};

const SidebarContent: React.FC<{
  identity?: { full_name?: string; email?: string };
  stats: { level: number; streak: number; points: number; idle_rate: number };
  menuItems: MenuItem[];
  currentPath: string;
  onNavigate: (p: string) => void;
  onLogout: () => void;
}> = ({ identity, stats, menuItems, currentPath, onNavigate, onLogout }) => (
  <>
    <Brand />
    <UserCard
      name={identity?.full_name}
      level={stats.level}
      streak={stats.streak}
    />
    <StatsTiles
      points={stats.points}
      idle={stats.idle_rate}
      streak={stats.streak}
    />
    <MenuList
      items={menuItems}
      current={currentPath}
      onNavigate={onNavigate}
    />
    <footer className="mt-auto p-4 border-t space-y-3">
      <LevelProgress level={stats.level} points={stats.points} />
      <LogoutButton onLogout={onLogout} />
    </footer>
  </>
);

type SidebarVariant = "desktop" | "mobile";

const Sidebar: React.FC<{
  variant: SidebarVariant;
  open?: boolean;
  onClose?: () => void;
  identity?: { full_name?: string; email?: string };
  stats: { level: number; streak: number; points: number; idle_rate: number };
  menuItems: MenuItem[];
  currentPath: string;
  onNavigate: (p: string) => void;
  onLogout: () => void;
}> = ({
  variant,
  open = false,
  onClose,
  identity,
  stats,
  menuItems,
  currentPath,
  onNavigate,
  onLogout,
}) => {
  if (variant === "desktop") {
    return (
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-card/95 backdrop-blur border-r flex-col">
        <SidebarContent
          identity={identity}
          stats={stats}
          menuItems={menuItems}
          currentPath={currentPath}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      </aside>
    );
  }

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Zamknij menu"
        onClick={onClose}
        className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      />
      <aside
        className="lg:hidden fixed inset-y-0 left-0 w-80 bg-card/95 backdrop-blur-xl z-50 shadow-2xl border-r flex flex-col"
        aria-label="Nawigacja boczna"
      >
        <header className="h-16 px-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white grid place-items-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <strong className="text-lg">Smart Up</strong>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted focus-ring"
            aria-label="Zamknij"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-muted-foreground">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <section className="overflow-y-auto">
          <UserCard
            name={identity?.full_name}
            level={stats.level}
            streak={stats.streak}
          />
          <StatsTiles
            points={stats.points}
            idle={stats.idle_rate}
            streak={stats.streak}
          />
          <MenuList
            items={menuItems}
            current={currentPath}
            onNavigate={(p) => {
              onNavigate(p);
              onClose?.();
            }}
          />
        </section>

        <footer className="mt-auto p-4 border-t">
          <LogoutButton onLogout={onLogout} />
        </footer>
      </aside>
    </>
  );
};

export default Sidebar;
