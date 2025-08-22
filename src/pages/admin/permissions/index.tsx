// src/pages/admin/permissions/index.tsx
import { Route } from "react-router-dom";
import { ShieldCheck, Building2, Users, BookOpen, UserCog } from "lucide-react";

import { VendorManagement } from "./vendors";
import { GroupManagement } from "./groups";
import { CoursePermissions } from "./courses";
import { UserManagement } from "./users";

// Import z folderu users, nie z pliku users.tsx!
import { usersResource, usersRoutes } from "./users/index";

// Główny zasób
export const permissionsResource = {
  name: "permissions",
  list: "/admin/permissions",
  meta: {
    label: "Zarządzanie dostępem",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
};

// Podmenu - Uprawnienia użytkowników (szybkie zarządzanie)
export const usersManagementResource = {
  name: "permissions-users-management",
  list: "/admin/permissions/users-management",
  meta: {
    label: "Uprawnienia użytkowników",
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
  // Route dla strony z szybkim zarządzaniem uprawnieniami
  <Route key="permissions-users-management" path="permissions/users-management" element={<UserManagement />} />,
  
  // Routes dla pełnego modułu users - mapujemy i dodajemy prefix do ścieżek
  ...usersRoutes.map(route => ({
    ...route,
    key: `permissions-${route.key}`,
    props: {
      ...route.props,
      path: `permissions/${route.props.path}`
    }
  })),
  
  // Pozostałe routes
  <Route key="permissions-vendors" path="permissions/vendors" element={<VendorManagement />} />,
  <Route key="permissions-groups" path="permissions/groups" element={<GroupManagement />} />,
  <Route key="permissions-courses" path="permissions/courses" element={<CoursePermissions />} />,
  
  // Default route
  <Route key="permissions-default" path="permissions" element={<UserManagement />} />,
];

// Eksportuj zasoby do App.tsx
export const permissionsResources = [
  permissionsResource,
  usersManagementResource,
  usersResource,
  vendorManagementResource,
  groupManagementResource,
  coursePermissionsResource,
];