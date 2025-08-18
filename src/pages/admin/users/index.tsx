// src/pages/admin/users/index.tsx
import { Route } from "react-router-dom";
import { Users } from "lucide-react";
import { UsersList } from "./list";

export { UsersList } from "./list";

export const usersResource = {
  name: "users",
  list: "/admin/users",
  meta: {
    label: "Użytkownicy",
    icon: <Users className="h-4 w-4" />,
  },
};

export const usersRoutes = [
  <Route key="users-list" path="users" element={<UsersList />} />,
];