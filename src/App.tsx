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

// Import zasobów
import { coursesResource, coursesRoutes } from "./pages/courses";
import { topicsResource, topicsRoutes } from "./pages/topics";
import { activitiesResource, activitiesRoutes } from "./pages/activities";
import { usersResource, usersRoutes } from "./pages/users";
import { groupsResource, groupsRoutes } from "./pages/groups";
import { vendorsResource, vendorsRoutes } from "./pages/vendors";
import { dashboardResource, dashboardRoutes } from "./pages/dashboard";
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
          dashboardResource,
          groupsResource,
          coursesResource,

          activitiesResource,
          usersResource,

          vendorsResource,
          reportsResource,
          topicsResource,
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
            {/* Dashboard jako strona główna */}
            <Route
              path="/dashboard"
              element={<Navigate to="/dashboard/overview" replace />}
            />

            {...dashboardRoutes}
            {...groupsRoutes}
            {...coursesRoutes}
            {...activitiesRoutes}
            {...usersRoutes}
            {...vendorsRoutes}
            {...reportsRoutes}
            {...topicsRoutes}

            {/* Catch all dla nieznanych tras */}
            <Route path="*" element={<ErrorComponent />} />
          </Route>

          {/* Dodatkowe zabezpieczenie */}
          <Route
            path="*"
            element={
              <Authenticated
                key="catch-all"
                fallback={<Navigate to="/login" replace />}
              >
                <Navigate to="/dashboard" replace />
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
