// src/pages/student/index.tsx
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { 
  ModuleWrapper, 
  AccessGuard, 
  LoadingFallback,
  ModulePanel 
} from "@/components/modules";

// Import layoutu
import { StudentLayout } from "./components/StudentLayout";

// Import wszystkich tras
import { dashboardRoutes } from "./dashboard";
import { coursesRoutes } from "./courses";
import { courseDetailRoutes } from "./course-detail";
import { lessonsRoutes } from "./lessons";
import { quizzesRoutes } from "./quizzes";
import { gamificationRoutes } from "./gamification";
import { leaderboardRoutes } from "./leaderboard";
import { achievementsRoutes } from "./achievements";
import { profileRoutes } from "./profile";

// Lazy load panelu studenta
const StudentPanel = lazy(() => import("@/components/modules/ModulePanel").then(module => {
  // Wszystkie trasy studenta
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

  // Zwróć komponent z konfiguracją
  return {
    default: () => (
      <ModulePanel 
        routes={allStudentRoutes}
        layout={
          <StudentLayout>
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              {...allStudentRoutes}
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </StudentLayout>
        }
      />
    )
  };
}));

// Wrapper modułu studenta
const StudentModuleWrapper = () => {
  return (
    <ModuleWrapper authKey="student-auth-check">
      <AccessGuard
        allowedRoles={['student']}
        fallbackPath="/dashboard/overview"
        loadingText="Ładowanie panelu ucznia..."
        loadingColorClass="border-blue-600"
      >
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
      </AccessGuard>
    </ModuleWrapper>
  );
};

// Eksport modułu - BEZ FUNKCJI, TYLKO JSX
export const StudentModule = (
  <Route
    path="/student/*"
    element={<StudentModuleWrapper />}
  />
);
