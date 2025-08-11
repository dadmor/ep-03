// path: src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Refine } from "@refinedev/core";
import { dataProvider } from "@refinedev/supabase";
import { supabaseClient } from "./utility";
import { authProvider } from "./utility/auth/authProvider";

import LandingPage from "./pages/landing/Landing";

// Auth
import { LoginModule, RegisterModule, ForgotPasswordModule, UpdatePasswordModule } from "./pages/auth";

// Panele (ROUTES)
import { TeacherModule } from "./pages/teacher";
import { StudentModule } from "./pages/student";

// >>> jedyny import MENU dla teachera
import { teacherResources } from "./pages/teacher/resources";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false, staleTime: 5 * 60 * 1000 } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Refine
        dataProvider={dataProvider(supabaseClient)}
        authProvider={authProvider}
        // >>> CHUDO: tylko jedna tablica z modułu teachera
        resources={teacherResources}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: false,
          useNewQueryKeys: true,
          disableTelemetry: true,
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* AUTH */}
            {LoginModule}
            {RegisterModule}
            {ForgotPasswordModule}
            {UpdatePasswordModule}

            {/* APP (ROUTES per rola) */}
            {TeacherModule}
            {StudentModule}

            {/* Alias admin -> teacher */}
            <Route path="/admin/*" element={<Navigate to="/teacher" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </Refine>
    </QueryClientProvider>
  );
}

export default App;
