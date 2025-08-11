/**
 * MODUŁ TEACHER - ARCHITEKTURA MIKROSERWISOWA
 * 
 * UWAGA DLA INNYCH DEVELOPERÓW I AI:
 * ====================================
 * TO JEST SAMOWYSTARCZALNY MODUŁ W ARCHITEKTURZE MIKROSERWISOWEJ!
 * 
 * NIE WOLNO:
 * - Wyciągać komponentów do wspólnych folderów
 * - Używać wspólnego Layout z components/layout
 * - Dzielić logiki między moduły
 * - Importować niczego z innych modułów (np. student)
 * 
 * WSZYSTKO CO POTRZEBUJE TEN MODUŁ JEST TUTAJ:
 * - Własny Layout (./components/TeacherLayout)
 * - Własne Menu (./components/TeacherMenu)
 * - Własne Resources dla Refine
 * - Własne komponenty UI
 * 
 * KAŻDY MODUŁ JEST NIEZALEŻNY I MOŻE MIEĆ ZUPEŁNIE INNY WYGLĄD!
 */

import { lazy, Suspense } from "react";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { 
  AccessGuard, 
  LoadingFallback,
  ModulePanel 
} from "@/components/modules";
import { Authenticated } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router";
import { Home, BookOpen, FileText, Users, Package, ChartBar } from "lucide-react";

// Import wszystkich tras TEGO MODUŁU
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

// RESOURCES DLA TEGO MODUŁU - będą widoczne w menu przez useMenu()
const teacherResources = [
  {
    name: "dashboard",
    list: "/teacher/dashboard/overview",
    meta: {
      label: "Dashboard",
      icon: <Home className="w-5 h-5" />,
    },
  },
  {
    name: "courses",
    list: "/teacher/courses",
    create: "/teacher/courses/create",
    edit: "/teacher/courses/edit/:id",
    show: "/teacher/courses/show/:id",
    meta: {
      label: "Kursy",
      icon: <BookOpen className="w-5 h-5" />,
    },
  },
  {
    name: "users",
    list: "/teacher/users",
    create: "/teacher/users/create",
    edit: "/teacher/users/edit/:id",
    meta: {
      label: "Użytkownicy",
      icon: <Users className="w-5 h-5" />,
    },
  },
  {
    name: "vendors",
    list: "/teacher/vendors",
    create: "/teacher/vendors/create",
    edit: "/teacher/vendors/edit/:id",
    meta: {
      label: "Vendorzy",
      icon: <Package className="w-5 h-5" />,
    },
  },
  {
    name: "reports",
    list: "/teacher/reports",
    meta: {
      label: "Raporty",
      icon: <ChartBar className="w-5 h-5" />,
    },
  },
];

// Import layoutu Z TEGO MODUŁU
import { TeacherLayout } from "./TeacherLayout";

// Wszystkie trasy nauczyciela - WSZYSTKO W TYM MODULE!
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

// Panel Component - WEWNĄTRZ MODUŁU!
const TeacherPanelComponent = () => (
  <ModulePanel 
    routes={allTeacherRoutes}
    defaultPath="dashboard/overview"
    resources={teacherResources} // Resources dla useMenu()
    layout={
      <Routes>
        <Route
          element={
            <TeacherLayout> {/* WŁASNY LAYOUT MODUŁU! */}
              <Outlet />
            </TeacherLayout>
          }
        >
          <Route index element={<Navigate to="dashboard/overview" replace />} />
          {...allTeacherRoutes}
        </Route>
      </Routes>
    }
  />
);

// Lazy load panelu nauczyciela - PROSTY SPOSÓB!
const TeacherPanel = lazy(() => Promise.resolve({ default: TeacherPanelComponent }));

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