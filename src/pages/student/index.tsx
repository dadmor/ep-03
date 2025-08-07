// src/pages/student/index.tsx - FIXED WITHOUT COURSES ROUTE
import { Route } from "react-router";
import { Outlet } from "react-router-dom";
import { StudentLayout } from "./components/StudentLayout";
import { 
  StudentDashboard,
  StudentCourseDetail,
  StudentLesson,
  StudentQuiz,
  StudentGamification,
  StudentLeaderboard,
  StudentAchievements,
  StudentProfile
} from "./components";

// Wrapper component that applies StudentLayout
const StudentLayoutWrapper = () => {
  return (
    <StudentLayout>
      <Outlet />
    </StudentLayout>
  );
};

// Eksportujemy trasy z własnym layoutem
export const studentRoutes = [
  // Główna trasa z StudentLayout
  <Route key="student-layout" path="/student" element={<StudentLayoutWrapper />}>
    {/* Dashboard */}
    <Route path="dashboard" element={<StudentDashboard />} />
    
    {/* Szczegóły kursu - zachowujemy bo potrzebne */}
    <Route path="courses/:courseId" element={<StudentCourseDetail />} />
    <Route path="courses/:courseId/lesson/:lessonId" element={<StudentLesson />} />
    <Route path="courses/:courseId/quiz/:quizId" element={<StudentQuiz />} />
    
    {/* Gamifikacja */}
    <Route path="gamification" element={<StudentGamification />} />
    <Route path="leaderboard" element={<StudentLeaderboard />} />
    <Route path="achievements" element={<StudentAchievements />} />
    
    {/* Profil */}
    <Route path="profile" element={<StudentProfile />} />
  </Route>
];