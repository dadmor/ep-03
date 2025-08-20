// src/pages/admin/permissions/index.tsx
import { Route } from "react-router-dom";
import { ShieldCheck, Building2, Users, BookOpen, UserCog } from "lucide-react";

import { VendorManagement } from "./vendors";
import { GroupManagement } from "./groups";
import { CoursePermissions } from "./courses";
import { UserManagement } from "./users";

// Główny zasób
export const permissionsResource = {
  name: "permissions",
  list: "/admin/permissions",
  meta: {
    label: "Zarządzanie dostępem",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
};

// Podmenu - Użytkownicy
export const usersManagementResource = {
  name: "permissions-users",
  list: "/admin/permissions/users",
  meta: {
    label: "Użytkownicy",
    icon: <UserCog className="h-4 w-4" />,
    parent: "permissions",
  },
};

// Podmenu - Vendorzy
export const vendorManagementResource = {
  name: "permissions-vendors",
  list: "/admin/permissions/vendors",
  meta: {
    label: "Vendorzy",
    icon: <Building2 className="h-4 w-4" />,
    parent: "permissions",
  },
};

// Podmenu - Grupy
export const groupManagementResource = {
  name: "permissions-groups",
  list: "/admin/permissions/groups",
  meta: {
    label: "Grupy",
    icon: <Users className="h-4 w-4" />,
    parent: "permissions",
  },
};

// Podmenu - Kursy
export const coursePermissionsResource = {
  name: "permissions-courses",
  list: "/admin/permissions/courses",
  meta: {
    label: "Dostęp do kursów",
    icon: <BookOpen className="h-4 w-4" />,
    parent: "permissions",
  },
};

export const permissionsRoutes = [
  <Route key="permissions-users" path="permissions/users" element={<UserManagement />} />,
  <Route key="permissions-vendors" path="permissions/vendors" element={<VendorManagement />} />,
  <Route key="permissions-groups" path="permissions/groups" element={<GroupManagement />} />,
  <Route key="permissions-courses" path="permissions/courses" element={<CoursePermissions />} />,
  <Route key="permissions-default" path="permissions" element={<UserManagement />} />,
];

// Eksportuj zasoby do App.tsx
export const permissionsResources = [
  permissionsResource,
  usersManagementResource,
  vendorManagementResource,
  groupManagementResource,
  coursePermissionsResource,
];