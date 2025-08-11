// src/pages/teacher/TeacherPanel.tsx
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Layout } from "@/components/layout";

// Import wszystkich tras
import { dashboardRoutes } from "./dashboard";
import { coursesRoutes } from "./courses";
import { topicsRoutes } from "./topics";
import { activitiesRoutes } from "./activities";
import { groupsRoutes } from "./groups";
import { usersRoutes } from "./users";
import { vendorsRoutes } from "./vendors";
import { reportsRoutes } from "./reports";
import { courseStructureRoutes } from "./course-structure-wizard";
import { educationalMaterialRoutes } from "./educational-material-wizard";
import { quizWizardRoutes } from "./quiz-wizard";
import { questionsRoutes } from "./questions";

const TeacherPanel: React.FC = () => {
  // Wszystkie trasy nauczyciela
  const allTeacherRoutes = [
    ...dashboardRoutes,
    ...coursesRoutes,
    ...topicsRoutes,
    ...activitiesRoutes,
    ...questionsRoutes,
    ...courseStructureRoutes,
    ...educationalMaterialRoutes,
    ...quizWizardRoutes,
    ...groupsRoutes,
    ...usersRoutes,
    ...vendorsRoutes,
    ...reportsRoutes,
  ];

  return (
    <Routes>
      <Route
        element={
          <Layout>
            <Outlet />
          </Layout>
        }
      >
        {/* Domyślne przekierowanie do dashboard */}
        <Route index element={<Navigate to="dashboard/overview" replace />} />
        
        {/* Wszystkie trasy nauczyciela */}
        {allTeacherRoutes}
      </Route>
    </Routes>
  );
};

export default TeacherPanel;