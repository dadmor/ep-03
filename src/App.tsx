// src/App.tsx - NAPRAWIONA ARCHITEKTURA MIKROSERWISOWA
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import Landing Page
import LandingPage from "./pages/Landing";

// Import modułów auth (każdy z własnym lazy loading)
import { 
  LoginModule,
  RegisterModule,
  ForgotPasswordModule,
  UpdatePasswordModule 
} from "./pages/auth";

// Import modułów aplikacji (każdy z własnym lazy loading i Refine)
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
      <BrowserRouter>
        <Routes>
          {/* Publiczne trasy */}
          <Route path="/" element={<LandingPage />} />
          
          {/* MODUŁY AUTH - jako elementy JSX */}
          {LoginModule}
          {RegisterModule}
          {ForgotPasswordModule}
          {UpdatePasswordModule}

          {/* MODUŁY APLIKACJI - każdy sam zarządza swoimi trasami */}
          <>{TeacherModule}</>
          {StudentModule}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;