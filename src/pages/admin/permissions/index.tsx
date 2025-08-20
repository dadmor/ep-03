import { Route } from "react-router-dom";
import { ShieldCheck, KeyRound, List } from "lucide-react";

import { AssignPermissions } from "./assign";
import { PermissionsList } from "./list";

// Główny zasób - rodzic
export const permissionsResource = {
  name: "permissions",
  list: "/admin/permissions",
  meta: {
    label: "Uprawnienia",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
};

// Podmenu 1 - Lista uprawnień
export const permissionsListResource = {
  name: "permissions-list",
  list: "/admin/permissions",
  meta: {
    label: "Lista uprawnień",
    icon: <List className="h-4 w-4" />,
    parent: "permissions", // To sprawia, że będzie widoczne jako dziecko
  },
};

// Podmenu 2 - Nadawanie dostępu
export const permissionsAssignResource = {
  name: "permissions-assign",
  list: "/admin/permissions/assign",
  meta: {
    label: "Nadawanie dostępu",
    icon: <KeyRound className="h-4 w-4" />,
    parent: "permissions", // To sprawia, że będzie widoczne jako dziecko
  },
};

export const permissionsRoutes = [
  <Route key="permissions-root" path="permissions" element={<PermissionsList />} />,
  <Route key="permissions-assign" path="permissions/assign" element={<AssignPermissions />} />,
];

export { PermissionsList } from "./list";
export { AssignPermissions } from "./assign";