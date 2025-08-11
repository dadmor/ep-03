// src/pages/student/StudentPanel.tsx
import { Refine } from "@refinedev/core";
import { Routes, Route, Navigate } from "react-router-dom";
import routerBindings from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { authProvider, supabaseClient } from "@/utility";

// Import layoutu
import { StudentLayout } from "./components/StudentLayout";

// Import wszystkich modułów
import { dashboardRoutes } from "./dashboard";
import { coursesRoutes } from "./courses";
import { courseDetailRoutes } from "./course-detail";
import { lessonsRoutes } from "./lessons";
import { quizzesRoutes } from "./quizzes";
import { gamificationRoutes } from "./gamification";
import { leaderboardRoutes } from "./leaderboard";
import { achievementsRoutes } from "./achievements";
import { profileRoutes } from "./profile";

const StudentPanel: React.FC = () => {
  // Wszystkie trasy studenta
  const allStudentRoutes = [
    ...dashboardRoutes,
    ...coursesRoutes,
    ...courseDetailRoutes,
    ...lessonsRoutes,
    ...quizzesRoutes,
    ...gamificationRoutes,
    ...leaderboardRoutes,
    ...achievementsRoutes,
    ...profileRoutes,
  ];

  return (
    <Refine
      dataProvider={dataProvider(supabaseClient)}
      liveProvider={liveProvider(supabaseClient)}
      authProvider={authProvider}
      routerProvider={routerBindings}
      resources={[]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        useNewQueryKeys: true,
        liveMode: "auto",
      }}
    >
      <StudentLayout>
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          {...allStudentRoutes}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </StudentLayout>
    </Refine>
  );
};

export default StudentPanel;