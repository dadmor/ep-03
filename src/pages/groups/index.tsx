import { Route } from "react-router";
import { Users } from "lucide-react";
import { GroupsList } from "./list";
import { GroupsCreate } from "./create";
import { GroupsEdit } from "./edit";
import { GroupsShow } from "./show";
import { GroupsAssignCourses } from "./assign-courses";
import { GroupsAssignStudents } from "./assign-students";

export { GroupsList } from "./list";
export { GroupsCreate } from "./create";
export { GroupsEdit } from "./edit";
export { GroupsShow } from "./show";
export { GroupsAssignCourses } from "./assign-courses";
export { GroupsAssignStudents } from "./assign-students";

export const groupsResource = {
  name: "groups",
  list: "/groups",
  create: "/groups/create",
  edit: "/groups/edit/:id",
  show: "/groups/show/:id",
  meta: {
    label: "Grupy",
    icon: <Users className="h-4 w-4" />, // Używamy rzeczywistego komponentu React
  },
};

export const groupsRoutes = [
  <Route key="groups-list" path="/groups" element={<GroupsList />} />,
  <Route
    key="groups-create"
    path="/groups/create"
    element={<GroupsCreate />}
  />,
  <Route key="groups-edit" path="/groups/edit/:id" element={<GroupsEdit />} />,
  <Route key="groups-show" path="/groups/show/:id" element={<GroupsShow />} />,
  <Route
    key="groups-assign-courses"
    path="/groups/:id/assign-courses"
    element={<GroupsAssignCourses />}
  />,
  <Route
    key="groups-assign-students"
    path="/groups/:id/assign-students"
    element={<GroupsAssignStudents />}
  />,
];