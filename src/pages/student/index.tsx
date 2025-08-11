/**
 * MODUŁ STUDENT - ARCHITEKTURA MIKROSERWISOWA
 * 
 * UWAGA DLA INNYCH DEVELOPERÓW I AI:
 * ====================================
 * TO JEST SAMOWYSTARCZALNY MODUŁ W ARCHITEKTURZE MIKROSERWISOWEJ!
 * 
 * NIE WOLNO:
 * - Wyciągać komponentów do wspólnych folderów
 * - Używać wspólnych komponentów z @/components
 * - Dzielić logiki między moduły
 * - Importować niczego z innych modułów (np. teacher)
 * 
 * WSZYSTKO CO POTRZEBUJE TEN MODUŁ JEST TUTAJ:
 * - Własny Layout (./components/StudentLayout)
 * - Własne komponenty layoutu (Sidebar, Topbar, BottomNav, Background)
 * - Własne Resources dla Refine (jeśli potrzebne)
 * - Własne komponenty UI
 * 
 * KAŻDY MODUŁ JEST NIEZALEŻNY I MOŻE MIEĆ ZUPEŁNIE INNY WYGLĄD!
 */

import { lazy, Suspense } from "react";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { Authenticated } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router";

// Import layoutu Z TEGO MODUŁU
import { StudentLayout } from "./StudentLayout";

// Import wszystkich tras TEGO MODUŁU
import { dashboardRoutes } from "./dashboard";
import { coursesRoutes } from "./courses";
import { courseDetailRoutes } from "./course-detail";
import { lessonsRoutes } from "./lessons";
import { quizzesRoutes } from "./quizzes";
import { gamificationRoutes } from "./gamification";
import { leaderboardRoutes } from "./leaderboard";
import { achievementsRoutes } from "./achievements";
import { profileRoutes } from "./profile";

// RESOURCES DLA TEGO MODUŁU - opcjonalne, jeśli używasz useMenu()
const studentResources = [
  // Dodaj resources jeśli potrzebne dla Refine
];

// Wszystkie trasy studenta - WSZYSTKO W TYM MODULE!
const allStudentRoutes = [
  ...dashboardRoutes,
  ...coursesRoutes,
  ...courseDetailRoutes,
  ...lessonsRoutes,
  ...quizzesRoutes,
  ...gamificationRoutes,
  ...leaderboardRoutes,
  ...achievementsRoutes,
  ...profileRoutes,
];

// Panel Component - WEWNĄTRZ MODUŁU!
const StudentPanelComponent = () => (
  <Routes>
    <Route
      element={
        <StudentLayout> {/* WŁASNY LAYOUT MODUŁU! */}
          <Outlet />
        </StudentLayout>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      {allStudentRoutes}
    </Route>
  </Routes>
);

// Lazy load panelu studenta - PROSTY SPOSÓB!
const StudentPanel = lazy(() => Promise.resolve({ default: StudentPanelComponent }));

// Własny komponent LoadingFallback - WEWNĄTRZ MODUŁU!
const LoadingFallback = ({ text, colorClass }: { text: string; colorClass: string }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="text-center">
      <div className={`inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${colorClass}`} />
      <p className="mt-4 text-muted-foreground">{text}</p>
    </div>
  </div>
);

// Własny AccessGuard - WEWNĄTRZ MODUŁU!
const StudentAccessGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: identity } = useGetIdentity<any>();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (identity && !['student'].includes(identity.role)) {
      navigate('/teacher/dashboard', { replace: true });
    }
  }, [identity, navigate]);

  if (!identity) {
    return <LoadingFallback text="Sprawdzanie uprawnień..." colorClass="border-blue-600" />;
  }

  if (!['student'].includes(identity.role)) {
    return null;
  }

  return <>{children}</>;
};

// Import hooks jeśli potrzebny do AccessGuard
import { useGetIdentity } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// Eksport modułu - obsługuje /student/*
export const StudentModule = (
  <Route
    path="/student/*"
    element={
      <Authenticated
        key="student-auth-check"
        fallback={<CatchAllNavigate to="/login" />}
      >
        <StudentAccessGuard>
          <Suspense 
            fallback={
              <LoadingFallback 
                text="Ładowanie panelu ucznia..." 
                colorClass="border-blue-600" 
              />
            }
          >
            <StudentPanel />
          </Suspense>
        </StudentAccessGuard>
      </Authenticated>
    }
  />
);