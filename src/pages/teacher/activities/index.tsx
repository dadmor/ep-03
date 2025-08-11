import { Route } from "react-router";
import { ActivitiesCreate } from "./create";
import { ActivitiesEdit } from "./edit";
import { ActivitiesShow } from "./show";

export { ActivitiesCreate } from "./create";
export { ActivitiesEdit } from "./edit";
export { ActivitiesShow } from "./show";

export const activitiesResource = {
  name: "activities",
  create: "/activities/create",
  edit: "/activities/edit/:id",
  show: "/activities/show/:id",
  meta: {
    label: "Aktywności",
    parent: "topics",
  },
};

export const activitiesRoutes = [
  <Route key="activities-create" path="/activities/create" element={<ActivitiesCreate />} />,
  <Route key="activities-edit" path="/activities/edit/:id" element={<ActivitiesEdit />} />,
  <Route key="activities-show" path="/activities/show/:id" element={<ActivitiesShow />} />,
];