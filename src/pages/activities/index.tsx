import { Route } from "react-router";
import { ActivitiesCreate } from "./create";
import { ActivitiesEdit } from "./edit";

export { ActivitiesCreate } from "./create";
export { ActivitiesEdit } from "./edit";

export const activitiesResource = {
  name: "activities",
  create: "/activities/create",
  edit: "/activities/edit/:id",
  meta: {
    label: "Aktywności",
    parent: "topics",
  },
};

export const activitiesRoutes = [
  <Route key="activities-create" path="/activities/create" element={<ActivitiesCreate />} />,
  <Route key="activities-edit" path="/activities/edit/:id" element={<ActivitiesEdit />} />,
];