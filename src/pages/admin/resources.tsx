// src/pages/admin/resources.tsx
import type { IResourceItem } from "@refinedev/core";
import { LayoutDashboard } from "lucide-react";

import { vendorsResource } from "./vendors";
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
  
  // Moduł uprawnień z podmenu
  permissionsResource,              // Rodzic: "Zarządzanie dostępem"
  usersManagementResource,          // Podmenu: "Użytkownicy"
  vendorManagementResource,         // Podmenu: "Vendorzy"
  groupManagementResource,          // Podmenu: "Grupy"
  coursePermissionsResource,        // Podmenu: "Dostęp do kursów"
  

];