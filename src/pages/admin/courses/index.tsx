import { Route } from "react-router-dom";
import { BookOpen } from "lucide-react";

const CoursesList = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">All Courses</h1>
    <p>Courses management for admin</p>
  </div>
);

export const coursesResource = {
  name: "courses",
  list: "/admin/courses",
  meta: {
    label: "Wszystkie kursy",
    icon: <BookOpen className="h-4 w-4" />,
  },
};

export const coursesRoutes = [
  <Route key="courses-list" path="courses" element={<CoursesList />} />,
];