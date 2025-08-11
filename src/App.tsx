// src/App.tsx - PEŁNA MODULARNOŚĆ Z LAZY LOADING
import { Authenticated, ErrorComponent, Refine, useGetIdentity } from "@refinedev/core";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";
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
import { 
  courseStructureResource, 
  courseStructureRoutes 
} from "./pages/course-structure-wizard";

// Import panelu ucznia
import { studentRoutes } from "./pages/student";

// Import Landing Page
import LandingPage from "./pages/Landing";

// Import modułów auth - każdy z własnym lazy loading
import { 
  LoginModule,
  RegisterModule,
  ForgotPasswordModule,
  UpdatePasswordModule 
} from "./pages/auth";

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
          
          {/* MODUŁY AUTH - używane jako elementy JSX */}
          {LoginModule}
          {RegisterModule}
          {ForgotPasswordModule}
          {UpdatePasswordModule}

          {/* Chronione trasy - dla adminów i nauczycieli */}
          <Route
            element={
              <Authenticated
                key="admin-teacher-layout"
                fallback={<CatchAllNavigate to="/login" />}
              >
                <Layout>
                  <Outlet />
                </Layout>
              </Authenticated>
            }
          >
            <Route path="/admin" element={<RoleBasedRedirect />} />
            <Route path="/teacher" element={<RoleBasedRedirect />} />
            
            <Route
              path="/dashboard"
              element={<Navigate to="/dashboard/overview" replace />}
            />

            {/* Trasy pogrupowane logicznie */}
            {...dashboardRoutes}
            {...coursesRoutes}
            {...topicsRoutes}
            {...activitiesRoutes}
            {...questionsRoutes}
            {...courseStructureRoutes}
            {...educationalMaterialRoutes}
            {...quizWizardRoutes}
            {...groupsRoutes}
            {...usersRoutes}
            {...vendorsRoutes}
            {...reportsRoutes}
          </Route>

          {/* Panel ucznia */}
          <Route
            element={
              <Authenticated
                key="student-auth-wrapper"
                fallback={<CatchAllNavigate to="/login" />}
              >
                <Outlet />
              </Authenticated>
            }
          >
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            {...studentRoutes}
          </Route>

          {/* Catch all dla nieznanych tras */}
          <Route path="*" element={<ErrorComponent />} />
        </Routes>

        <UnsavedChangesNotifier />
        <DocumentTitleHandler />
      </Refine>
    </BrowserRouter>
  );
}

export default App;