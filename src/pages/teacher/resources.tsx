// path: src/pages/teacher/resources.tsx
/**
 * TEACHER RESOURCES — PROSTY, JEDNOZNACZNY UKŁAD
 * - Każdy resource ma BEZWZGLĘDNĄ ścieżkę w 'list' (np. "/teacher/courses").
 * - Dzięki temu useMenu() zawsze dostaje poprawny 'route' i nic nie przeskakuje na "/".
 * - ZERO fallbacków w menu; wszystko wynika z resources.
 */

import type { IResourceItem } from "@refinedev/core";

import { coursesResource } from "./courses";
import { topicsResource } from "./topics";
import { activitiesResource } from "./activities";
import { groupsResource } from "./groups";
import { usersResource } from "./users";
import { vendorsResource } from "./vendors";
import {
  reportsResource,
  reportsEngagementResource,
  reportsSummaryResource,
} from "./reports";

// Dashboard jako normalny resource z listą:
const dashboardResource: IResourceItem = {
  name: "dashboard",
  list: "/teacher/dashboard/overview",
  meta: { label: "Zasoby edukacyjne" },
};

export const teacherResources: IResourceItem[] = [
  dashboardResource,

  // Program
  coursesResource,
  topicsResource,
  activitiesResource,

  // Użytkownicy/organizacje
  groupsResource,
  usersResource,
  vendorsResource,

  // Raporty (z dziećmi)
  reportsResource,
  {
    ...reportsEngagementResource,
    meta: { ...reportsEngagementResource.meta, parent: "reports" },
  },
  {
    ...reportsSummaryResource,
    meta: { ...reportsSummaryResource.meta, parent: "reports" },
  },
];
