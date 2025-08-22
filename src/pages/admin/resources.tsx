// src/pages/admin/resources.tsx
import type { IResourceItem } from "@refinedev/core";
import { LayoutDashboard } from "lucide-react";

import { vendorsResource } from "./vendors";
import { 
  permissionsResource,
  usersManagementResource,
  vendorManagementResource,
  groupManagementResource,
  coursePermissionsResource,
  permissionsResources
} from "./permissions";

export const adminResources: IResourceItem[] = permissionsResources.includes(vendorsResource) 
  ? permissionsResources 
  : [
      {
        name: "dashboard",
        list: "/admin/dashboard/overview",
        meta: {
          label: "Dashboard",
          icon: <LayoutDashboard className="h-4 w-4" />
        },
      },
      vendorsResource,
      ...permissionsResources,
    ];