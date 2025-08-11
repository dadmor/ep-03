// src/App.tsx
// ARCHITEKTURA MIKROSERWISOWA — prosta, spójna nawigacja po zalogowaniu

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Refine } from "@refinedev/core";
import { dataProvider } from "@refinedev/supabase";
import { supabaseClient } from "./utility";
import { authProvider } from "./utility/auth/authProvider";

import LandingPage from "./pages/landing/Landing";

// Moduły auth (lazy w środku)
import { LoginModule } from "./pages/auth";
import { RegisterModule } from "./pages/auth";
import { ForgotPasswordModule } from "./pages/auth";
import { UpdatePasswordModule } from "./pages/auth";

// Moduły aplikacji (z własnymi guardami)
import { TeacherModule } from "./pages/teacher";
import { StudentModule } from "./pages/student";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Refine
        dataProvider={dataProvider(supabaseClient)}
        authProvider={authProvider}
        resources={[]}
        options={{
          syncWithLocation: false,
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

            {/* APP */}
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
