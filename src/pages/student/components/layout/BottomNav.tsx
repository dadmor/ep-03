/* path: src/pages/student/components/layout/BottomNav.tsx */
import React from "react";
import type { MenuItem } from "./types";

const BottomNav: React.FC<{
  menuItems: MenuItem[];
  currentPath: string;
  onNavigate: (p: string) => void;
}> = ({ menuItems, currentPath, onNavigate }) => {
  const isActive = (path: string) => currentPath === path;

  return (
    <nav
      aria-label="Główna nawigacja dolna"
      className="fixed bottom-0 z-40 left-0 right-0 lg:left-72 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-t shadow-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-6xl p-1.5 sm:px-4">
        <ul className="grid grid-cols-5 gap-1 p-1">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <button
                  onClick={() => onNavigate(item.path)}
                  className={`relative flex flex-col items-center justify-center gap-1 rounded-lg p-4 transition-colors ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium">{item.label}</span>
                  {active && (
                    <i
                      aria-hidden
                      className="pointer-events-none absolute inset-x-6 -bottom-[3px] h-1 rounded-full bg-primary/70"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default BottomNav;
