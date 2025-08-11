// src/pages/teacher/index.tsx
import { lazy, Suspense } from "react";
import { Route, Navigate } from "react-router-dom";
import { Authenticated, useGetIdentity } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router";

// Lazy load głównego komponentu Teacher Panel
const TeacherPanel = lazy(() => import('./TeacherPanel'));

// Loading fallback
const TeacherLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Ładowanie panelu nauczyciela...</p>
    </div>
  </div>
);

// Komponent sprawdzający dostęp do panelu nauczyciela
const TeacherAccessGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: identity, isLoading } = useGetIdentity<any>();
  
  if (isLoading) {
    return <TeacherLoadingFallback />;
  }
  
  // Tylko teacher i admin mają dostęp
  if (identity?.role !== 'teacher' && identity?.role !== 'admin') {
    return <Navigate to="/student/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Eksport modułu - obsługuje /teacher/*
export const TeacherModule = (
  <Route
    path="/teacher/*"
    element={
      <Authenticated
        key="teacher-auth-check"
        fallback={<CatchAllNavigate to="/login" />}
      >
        <TeacherAccessGuard>
          <Suspense fallback={<TeacherLoadingFallback />}>
            <TeacherPanel />
          </Suspense>
        </TeacherAccessGuard>
      </Authenticated>
    }
  />
);