// src/pages/student/quizzes/index.tsx
import { Route } from "react-router-dom";
import { QuizTake } from "./take";

export { QuizTake } from "./take";

export const quizzesRoutes = [
  <Route key="quiz-take" path="/courses/:courseId/quiz/:quizId" element={<QuizTake />} />,
];