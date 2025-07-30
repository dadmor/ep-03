import { Route } from "react-router";
import { CoursesList } from "./list";
import { CoursesCreate } from "./create";
import { CoursesEdit } from "./edit";
import { CoursesShow } from "./show";

export { CoursesList } from "./list";
export { CoursesCreate } from "./create";
export { CoursesEdit } from "./edit";
export { CoursesShow } from "./show";

export const coursesResource = {
  name: "courses",
  list: "/courses",
  create: "/courses/create",
  edit: "/courses/edit/:id",
  show: "/courses/show/:id",
  meta: {
    label: "Kursy",
    icon: "BookOpen",
  },
};

export const coursesRoutes = [
  <Route key="courses-list" path="/courses" element={<CoursesList />} />,
  <Route key="courses-create" path="/courses/create" element={<CoursesCreate />} />,
  <Route key="courses-edit" path="/courses/edit/:id" element={<CoursesEdit />} />,
  <Route key="courses-show" path="/courses/show/:id" element={<CoursesShow />} />,
];