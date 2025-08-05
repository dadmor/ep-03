// src/App.tsx - kompletny z oboma wizardami
import { Authenticated, ErrorComponent, Refine, useGetIdentity } from "@refinedev/core";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Outlet, Route, Routes, Navigate } from "react-router";
import { Layout } from "./components/layout";
import { authProvider, supabaseClient } from "./utility";

// Import zasobów - uporządkowane hierarchicznie
import { dashboardResource, dashboardRoutes } from "./pages/dashboard";
import { coursesResource, coursesRoutes } from "./pages/courses";
import { topicsResource, topicsRoutes } from "./pages/topics";
import { activitiesResource, activitiesRoutes } from "./pages/activities";
import { questionsRoutes } from "./pages/questions";
import { groupsResource, groupsRoutes } from "./pages/groups";
import { usersResource, usersRoutes } from "./pages/users";
import { vendorsResource, vendorsRoutes } from "./pages/vendors";
import { reportsResource, reportsRoutes } from "./pages/reports";

// Import wizardów
import { 
  educationalMaterialResource, 
  educationalMaterialRoutes 
} from "./pages/educational-material-wizard";
import { 
  quizWizardResource, 
  quizWizardRoutes 
} from "./pages/quiz-wizard";

// Import panelu ucznia
import { studentRoutes } from "./pages/student";

import { authRoutes } from "./pages/auth";
import LandingPage from "./pages/Landing";

// Komponent sprawdzający rolę i przekierowujący
const RoleBasedRedirect = () => {
  const { data: identity } = useGetIdentity<any>();
  
  if (identity?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }
  
  return <Navigate to="/dashboard/overview" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Refine
        dataProvider={dataProvider(supabaseClient)}
        liveProvider={liveProvider(supabaseClient)}
        authProvider={authProvider}
        routerProvider={routerBindings}
        resources={[
          // Główne zasoby
          dashboardResource,
          
          // Zarządzanie kursami (hierarchia)
          coursesResource,
          topicsResource,
          activitiesResource,
          
          // Kreatory AI
          educationalMaterialResource,
          quizWizardResource,
          
          // Zarządzanie użytkownikami
          groupsResource,
          usersResource,
          
          // Administracja
          vendorsResource,
          reportsResource,
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
          useNewQueryKeys: true,
          liveMode: "auto",
        }}
      >
        <Routes>
          {/* Publiczne trasy */}
          <Route path="/" element={<LandingPage />} />
          {...authRoutes}

          {/* Chronione trasy - wspólny layout */}
          <Route
            element={
              <Authenticated
                key="protected-layout"
                fallback={<CatchAllNavigate to="/login" />}
              >
                <Layout>
                  <Outlet />
                </Layout>
              </Authenticated>
            }
          >
            {/* PRZEKIEROWANIA DLA NIEISTNIEJĄCYCH TRAS */}
            <Route path="/admin" element={<RoleBasedRedirect />} />
            <Route path="/teacher" element={<RoleBasedRedirect />} />
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            
            {/* Dashboard jako strona główna dla adminów/nauczycieli */}
            <Route
              path="/dashboard"
              element={<Navigate to="/dashboard/overview" replace />}
            />

            {/* Trasy pogrupowane logicznie */}
            {...dashboardRoutes}
            
            {/* Zarządzanie kursami */}
            {...coursesRoutes}
            {...topicsRoutes}
            {...activitiesRoutes}
            {...questionsRoutes}
            
            {/* Kreatory AI */}
            {...educationalMaterialRoutes}
            {...quizWizardRoutes}
            
            {/* Zarządzanie użytkownikami */}
            {...groupsRoutes}
            {...usersRoutes}
            
            {/* Administracja */}
            {...vendorsRoutes}
            {...reportsRoutes}
            
            {/* Panel ucznia */}
            {...studentRoutes}

            {/* Catch all dla nieznanych tras */}
            <Route path="*" element={<ErrorComponent />} />
          </Route>

          {/* Dodatkowe zabezpieczenie */}
          <Route
            path="*"
            element={
              <Authenticated
                key="catch-all-redirect"
                fallback={<Navigate to="/login" replace />}
              >
                <RoleBasedRedirect />
              </Authenticated>
            }
          />
        </Routes>

        <UnsavedChangesNotifier />
        <DocumentTitleHandler />
      </Refine>
    </BrowserRouter>
  );
}

export default App;