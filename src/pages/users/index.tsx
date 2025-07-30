import { Route } from "react-router";
import { UsersList } from "./list";
import { UsersCreate } from "./create";
import { UsersEdit } from "./edit";
import { UsersShow } from "./show";

export { UsersList } from "./list";
export { UsersCreate } from "./create";
export { UsersEdit } from "./edit";
export { UsersShow } from "./show";

export const usersResource = {
  name: "users",
  list: "/users",
  create: "/users/create",
  edit: "/users/edit/:id",
  show: "/users/show/:id",
  meta: {
    label: "Użytkownicy",
    icon: "Users",
  },
};

export const usersRoutes = [
  <Route key="users-list" path="/users" element={<UsersList />} />,
  <Route key="users-create" path="/users/create" element={<UsersCreate />} />,
  <Route key="users-edit" path="/users/edit/:id" element={<UsersEdit />} />,
  <Route key="users-show" path="/users/show/:id" element={<UsersShow />} />,
];