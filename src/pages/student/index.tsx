// src/pages/student/index.tsx
import { Route } from "react-router";
import { 
  StudentDashboard,
  StudentCourses,
  StudentCourseDetail,
  StudentLesson,
  StudentQuiz,
  StudentGamification,
  StudentLeaderboard,
  StudentAchievements,
  StudentProfile
} from "./components";

// Eksportujemy tylko trasy, bez zasobu (bo student ma osobny panel)
export const studentRoutes = [
  // Dashboard
  <Route key="student-dashboard" path="/student/dashboard" element={<StudentDashboard />} />,
  
  // Kursy
  <Route key="student-courses" path="/student/courses" element={<StudentCourses />} />,
  <Route key="student-course-detail" path="/student/courses/:courseId" element={<StudentCourseDetail />} />,
  <Route key="student-lesson" path="/student/courses/:courseId/lesson/:lessonId" element={<StudentLesson />} />,
  <Route key="student-quiz" path="/student/courses/:courseId/quiz/:quizId" element={<StudentQuiz />} />,
  
  // Gamifikacja
  <Route key="student-gamification" path="/student/gamification" element={<StudentGamification />} />,
  <Route key="student-leaderboard" path="/student/leaderboard" element={<StudentLeaderboard />} />,
  <Route key="student-achievements" path="/student/achievements" element={<StudentAchievements />} />,
  
  // Profil
  <Route key="student-profile" path="/student/profile" element={<StudentProfile />} />,
];



