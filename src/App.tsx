// src/App.tsx - ARCHITEKTURA MIKROSERWISOWA

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Refine } from "@refinedev/core";
import { dataProvider } from "@refinedev/supabase";
import { supabaseClient } from "./utility";
import { authProvider } from "./utility/auth/authProvider";

// Import Landing Page
import LandingPage from "./pages/Landing";

// Import modułów auth (każdy z własnym lazy loading)
import { 
  LoginModule,
  RegisterModule,
  ForgotPasswordModule,
  UpdatePasswordModule 
} from "./pages/auth";

// Import modułów aplikacji
import { TeacherModule } from "./pages/teacher";
import { StudentModule } from "./pages/student";

// Globalna instancja QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
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
        }}
      >
        <BrowserRouter>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* MODUŁY AUTH - jako elementy JSX */}
            {LoginModule}
            {RegisterModule}
            {ForgotPasswordModule}
            {UpdatePasswordModule}

            {/* MODUŁY APLIKACJI - już są elementami JSX */}
            {TeacherModule}
            {StudentModule}
          </Routes>
        </BrowserRouter>
      </Refine>
    </QueryClientProvider>
  );
}

export default App;