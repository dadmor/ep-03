// src/pages/teacher/index.tsx
import { lazy, Suspense } from "react";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { 
  AccessGuard, 
  LoadingFallback,
  ModulePanel 
} from "@/components/modules";
import { Authenticated } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router";
import { Layout } from "@/components/layout";

// Import wszystkich tras
import { dashboardRoutes } from "./dashboard";
import { coursesRoutes } from "./courses";
import { topicsRoutes } from "./topics";
import { activitiesRoutes } from "./activities";
import { groupsRoutes } from "./groups";
import { usersRoutes } from "./users";
import { vendorsRoutes } from "./vendors";
import { reportsRoutes } from "./reports";
import { courseStructureRoutes } from "./course-structure-wizard";
import { educationalMaterialRoutes } from "./educational-material-wizard";
import { quizWizardRoutes } from "./quiz-wizard";
import { questionsRoutes } from "./questions";

// Lazy load panelu nauczyciela
const TeacherPanel = lazy(() => import("@/components/modules/ModulePanel").then(module => {
  // Wszystkie trasy nauczyciela
  const allTeacherRoutes = [
    ...dashboardRoutes,
    ...coursesRoutes,
    ...topicsRoutes,
    ...activitiesRoutes,
    ...questionsRoutes,
    ...courseStructureRoutes,
    ...educationalMaterialRoutes,
    ...quizWizardRoutes,
    ...groupsRoutes,
    ...usersRoutes,
    ...vendorsRoutes,
    ...reportsRoutes,
  ];

  // Zwróć komponent z konfiguracją
  return {
    default: () => (
      <ModulePanel 
        routes={allTeacherRoutes}
        defaultPath="dashboard/overview"
        layout={
          <Routes>
            <Route
              element={
                <Layout>
                  <Outlet />
                </Layout>
              }
            >
              <Route index element={<Navigate to="dashboard/overview" replace />} />
              {...allTeacherRoutes}
            </Route>
          </Routes>
        }
      />
    )
  };
}));

// Eksport modułu - obsługuje /teacher/*
export const TeacherModule = (
  <Route
    path="/teacher/*"
    element={
      <Authenticated
        key="teacher-auth-check"
        fallback={<CatchAllNavigate to="/login" />}
      >
        <AccessGuard
          allowedRoles={['teacher', 'admin']}
          fallbackPath="/student/dashboard"
          loadingText="Ładowanie panelu nauczyciela..."
          loadingColorClass="border-indigo-600"
        >
          <Suspense 
            fallback={
              <LoadingFallback 
                text="Ładowanie panelu nauczyciela..." 
                colorClass="border-indigo-600" 
              />
            }
          >
            <TeacherPanel />
          </Suspense>
        </AccessGuard>
      </Authenticated>
    }
  />
);