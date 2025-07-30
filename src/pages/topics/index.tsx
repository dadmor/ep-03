import { Route } from "react-router";
import { TopicsCreate } from "./create";
import { TopicsEdit } from "./edit";

export { TopicsCreate } from "./create";
export { TopicsEdit } from "./edit";

export const topicsResource = {
  name: "topics",
  create: "/topics/create",
  edit: "/topics/edit/:id",
  meta: {
    label: "Tematy",
    parent: "courses",
  },
};

export const topicsRoutes = [
  <Route key="topics-create" path="/topics/create" element={<TopicsCreate />} />,
  <Route key="topics-edit" path="/topics/edit/:id" element={<TopicsEdit />} />,
];