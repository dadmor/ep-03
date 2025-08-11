// src/pages/teacher/TeacherPanel.tsx
// GŁÓWNY KOMPONENT PANELU NAUCZYCIELA

import { Refine } from "@refinedev/core";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import routerBindings from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { authProvider, supabaseClient } from "@/utility";
import { Layout } from "@/components/layout";

// Import wszystkich zasobów nauczyciela

// Import wizardów

import { dashboardResource, dashboardRoutes } from "./dashboard";
import { coursesResource, coursesRoutes } from "./courses";
import { topicsResource, topicsRoutes } from "./topics";
import { activitiesResource, activitiesRoutes } from "./activities";
import { groupsResource, groupsRoutes } from "./groups";
import { usersResource, usersRoutes } from "./users";
import { vendorsResource, vendorsRoutes } from "./vendors";
import { reportsResource, reportsRoutes } from "./reports";
import { courseStructureResource, courseStructureRoutes } from "./course-structure-wizard";
import { educationalMaterialResource, educationalMaterialRoutes } from "./educational-material-wizard";
import { quizWizardResource, quizWizardRoutes } from "./quiz-wizard";
import { questionsRoutes } from "./questions";

const TeacherPanel: React.FC = () => {
  // Wszystkie zasoby dla nauczyciela
  const resources = [
    dashboardResource,
    coursesResource,
    topicsResource,
    activitiesResource,
    groupsResource,
    usersResource,
    vendorsResource,
    reportsResource,
    courseStructureResource,
    educationalMaterialResource,
    quizWizardResource,
  ];

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

  return (
    <Refine
      dataProvider={dataProvider(supabaseClient)}
      liveProvider={liveProvider(supabaseClient)}
      authProvider={authProvider}
      routerProvider={routerBindings}
      resources={resources}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        useNewQueryKeys: true,
        liveMode: "auto",
      }}
    >
      <Routes>
        <Route
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          {/* Przekierowania dla różnych punktów wejścia */}
          <Route
            path="/admin"
            element={<Navigate to="/dashboard/overview" replace />}
          />
          <Route
            path="/teacher"
            element={<Navigate to="/dashboard/overview" replace />}
          />
          <Route
            path="/dashboard"
            element={<Navigate to="/dashboard/overview" replace />}
          />

          {/* Wszystkie trasy nauczyciela */}
          {...allTeacherRoutes}
        </Route>
      </Routes>
    </Refine>
  );
};

export default TeacherPanel;
