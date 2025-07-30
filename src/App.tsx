// src/App.tsx
import { Authenticated, ErrorComponent, Refine } from "@refinedev/core";
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

import { authRoutes } from "./pages/auth";
import LandingPage from "./pages/Landing";

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
          // questions nie jest zasobem, tylko trasą pomocniczą
          
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

          {/* Chronione trasy */}
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
            {/* PRZEKIEROWANIA DLA NIEISTNIEJĄCYCH TRAS - MUSI BYĆ PIERWSZE! */}
            <Route path="/admin" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/teacher" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/student" element={<Navigate to="/dashboard/overview" replace />} />
            
            {/* Dashboard jako strona główna */}
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
            
            {/* Zarządzanie użytkownikami */}
            {...groupsRoutes}
            {...usersRoutes}
            
            {/* Administracja */}
            {...vendorsRoutes}
            {...reportsRoutes}

            {/* Catch all dla nieznanych tras */}
            <Route path="*" element={<ErrorComponent />} />
          </Route>

          {/* Dodatkowe zabezpieczenie - przekieruj wszystko inne do dashboard */}
          <Route
            path="*"
            element={<Navigate to="/dashboard/overview" replace />}
          />
        </Routes>

        <UnsavedChangesNotifier />
        <DocumentTitleHandler />
      </Refine>
    </BrowserRouter>
  );
}

export default App;