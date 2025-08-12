// path: src/pages/teacher/resources.tsx
import type { IResourceItem } from "@refinedev/core";
import { usersResource } from "./users";
import { vendorsResource } from "./vendors";
import {
  reportsResource,
  reportsEngagementResource,
  reportsSummaryResource,
} from "./reports";

const teacherRoot: IResourceItem = {
  name: "teacher-root",
  meta: { label: "Panel nauczyciela", route: "/teacher/dashboard/overview" },
};

export const teacherResources: IResourceItem[] = [
  // Sekcja 1: Panel nauczyciela
  teacherRoot,
  { ...usersResource,   meta: { ...usersResource.meta,   parent: "teacher-root" } },
  { ...vendorsResource, meta: { ...vendorsResource.meta, parent: "teacher-root" } },

  // Sekcja 2: Raporty jako osobny top-level (bez parenta)
  reportsResource,
  { ...reportsEngagementResource, meta: { ...reportsEngagementResource.meta, parent: "reports" } },
  { ...reportsSummaryResource,    meta: { ...reportsSummaryResource.meta,    parent: "reports" } },
];
