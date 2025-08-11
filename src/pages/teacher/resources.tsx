// path: src/pages/teacher/resources.tsx
import type { IResourceItem } from "@refinedev/core";

// importujesz własne zasoby z modułów (już je masz)
import { usersResource } from "./users";
import { vendorsResource } from "./vendors";
// import { coursesResource } from "./courses";
// import { topicsResource } from "./topics";
// import { ... } z reszty sekcji

// nagłówek grupy dla menu (klik prowadzi do overview)
const teacherRoot: IResourceItem = {
  name: "teacher-root",
  meta: {
    label: "Panel nauczyciela",
    route: "/teacher/dashboard/overview",
  },
};

// UWAGA: upewnij się, że te zasoby mają ścieżki z prefiksem /teacher/*
// (w usersResource już poprawiliśmy wcześniej)
export const teacherResources: IResourceItem[] = [
  teacherRoot,
  { ...usersResource,  meta: { ...usersResource.meta,  parent: "teacher-root" } },
  { ...vendorsResource, meta: { ...vendorsResource.meta, parent: "teacher-root" } },
  // { ...coursesResource,  meta: { ...coursesResource.meta,  parent: "teacher-root" } },
  // { ...topicsResource,   meta: { ...topicsResource.meta,   parent: "teacher-root" } },
  // ...
];
