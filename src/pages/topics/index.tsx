// src/pages/topics/index.tsx
import { Route } from "react-router";
import { FileText } from "lucide-react";
import { TopicsCreate } from "./create";
import { TopicsEdit } from "./edit";

export { TopicsList } from "./list";
export { TopicsCreate } from "./create";
export { TopicsEdit } from "./edit";

export const topicsResource = {
  name: "topics",
  create: "/topics/create",
  edit: "/topics/edit/:id",
  meta: {
    label: "Tematy",
    icon: <FileText className="h-4 w-4" />,
  },
};

export const topicsRoutes = [
  <Route key="topics-create" path="/topics/create" element={<TopicsCreate />} />,
  <Route key="topics-edit" path="/topics/edit/:id" element={<TopicsEdit />} />,
];