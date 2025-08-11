// src/pages/student/routes.tsx
// TRASY STUDENTA - dla kompatybilności wstecznej

import { Route } from "react-router-dom";
import { DashboardOverview } from "./dashboard";
import { CoursesList } from "./courses";
import { CourseDetailView } from "./course-detail";
import { LessonView } from "./lessons";
import { QuizTake } from "./quizzes";
import { GamificationUpgrades } from "./gamification";
import { LeaderboardRanking } from "./leaderboard";
import { AchievementsList } from "./achievements";
import { ProfileSettings } from "./profile";

// Eksport tras jako tablica (dla kompatybilności)
export const studentRoutes = [
  <Route key="student-dashboard" path="/student/dashboard" element={<DashboardOverview />} />,
  <Route key="student-courses" path="/student/courses" element={<CoursesList />} />,
  <Route key="student-course-detail" path="/student/courses/:courseId" element={<CourseDetailView />} />,
  <Route key="student-lesson" path="/student/courses/:courseId/lesson/:lessonId" element={<LessonView />} />,
  <Route key="student-quiz" path="/student/courses/:courseId/quiz/:quizId" element={<QuizTake />} />,
  <Route key="student-gamification" path="/student/gamification" element={<GamificationUpgrades />} />,
  <Route key="student-leaderboard" path="/student/leaderboard" element={<LeaderboardRanking />} />,
  <Route key="student-achievements" path="/student/achievements" element={<AchievementsList />} />,
  <Route key="student-profile" path="/student/profile" element={<ProfileSettings />} />,
];