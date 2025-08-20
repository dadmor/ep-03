// src/pages/admin/resources.tsx
import type { IResourceItem } from "@refinedev/core";
import { LayoutDashboard } from "lucide-react";
import { vendorsResource } from "./vendors";
import { usersResource } from "./users";
import { coursesResource } from "./courses";
import { systemSettingsResource } from "./system-settings";
import { reportsResource } from "./reports";
import { 
  permissionsResource,
  usersManagementResource,
  vendorManagementResource,
  groupManagementResource,
  coursePermissionsResource
} from "./permissions";

export const adminResources: IResourceItem[] = [
  {
    name: "dashboard",
    list: "/admin/dashboard/overview",
    meta: {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />
    },
  },
  vendorsResource,
  usersResource,
  coursesResource,
  
  // Moduł uprawnień z podmenu
  permissionsResource,              // Rodzic: "Zarządzanie dostępem"
  usersManagementResource,          // Podmenu: "Użytkownicy"
  vendorManagementResource,         // Podmenu: "Vendorzy"
  groupManagementResource,          // Podmenu: "Grupy"
  coursePermissionsResource,        // Podmenu: "Dostęp do kursów"
  
  systemSettingsResource,
  reportsResource,
];