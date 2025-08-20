// src/pages/admin/permissions/list.tsx
import { useEffect, useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { FlexBox } from "@/components/shared";
import { Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ShieldCheck, Search, User, Users, BookOpen, Layers, ChevronUp, ChevronDown } from "lucide-react";

/**
 * Składamy "efektywny dostęp" po stronie FE:
 * - admin (aplikacyjny) ma dostęp do wszystkich kursów we własnym vendorze (RLS i tak ogranicza widoczność do current_vendor_id()).
 * - teacher: dostęp jeśli jest teacher_id w course_access LUB jest członkiem grupy, która ma dostęp.
 * - student: dostęp jeśli jest członkiem grupy, która ma dostęp.
 */

type Role = "student" | "teacher" | "admin";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  vendor_id: number;
  is_active: boolean;
};

type CourseRow = {
  id: number;
  title: string;
  vendor_id: number;
  is_published: boolean;
};

type CourseAccessRow = {
  course_id: number;
  group_id: number | null;
  teacher_id: string | null;
};

type GroupRow = {
  id: number;
  vendor_id: number;
  name: string;
  is_active: boolean;
};

type GroupMemberRow = {
  group_id: number;
  user_id: string;
};

type EffectiveAccess = {
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: Role;
  course_id: number;
  course_title: string;
  reason: "admin_vendor" | "teacher_assigned" | "group_member";
  via_group_name?: string | null;
};

type SortField = "user_name" | "user_email" | "user_role" | "course_title" | "reason";
type SortDirection = "asc" | "desc";

export const PermissionsList = () => {
  // 1) Zaciągamy dane (RLS już ogranicza do vendora admina)
  const { data: usersData, isLoading: usersLoading } = useList<UserRow>({ resource: "users", pagination: { pageSize: 1000 }});
  const { data: coursesData, isLoading: coursesLoading } = useList<CourseRow>({ resource: "courses", pagination: { pageSize: 1000 }});
  const { data: accessData, isLoading: accessLoading } = useList<CourseAccessRow>({ resource: "course_access", pagination: { pageSize: 10000 }});
  const { data: groupsData } = useList<GroupRow>({ resource: "groups", pagination: { pageSize: 10000 }});
  const { data: membersData, isLoading: membersLoading } = useList<GroupMemberRow>({ resource: "group_members", pagination: { pageSize: 100000 }});

  const loading = usersLoading || coursesLoading || accessLoading || membersLoading;

  const users = usersData?.data ?? [];
  const courses = coursesData?.data ?? [];
  const access = accessData?.data ?? [];
  const groups = groupsData?.data ?? [];
  const members = membersData?.data ?? [];

  // Słowniki pomocnicze
  const groupById = useMemo(() => {
    const m = new Map<number, GroupRow>();
    for (const g of groups) m.set(g.id, g);
    return m;
  }, [groups]);

  const coursesById = useMemo(() => {
    const m = new Map<number, CourseRow>();
    for (const c of courses) m.set(c.id, c);
    return m;
  }, [courses]);

  const memberSetByGroup = useMemo(() => {
    const m = new Map<number, Set<string>>();
    for (const gm of members) {
      if (!m.has(gm.group_id)) m.set(gm.group_id, new Set());
      m.get(gm.group_id)!.add(gm.user_id);
    }
    return m;
  }, [members]);

  const teacherCourseSet = useMemo(() => {
    // course_id → set(teacher_id)
    const m = new Map<number, Set<string>>();
    for (const ca of access) {
      if (ca.teacher_id) {
        if (!m.has(ca.course_id)) m.set(ca.course_id, new Set());
        m.get(ca.course_id)!.add(ca.teacher_id);
      }
    }
    return m;
  }, [access]);

  const groupAccess = useMemo(() => {
    // course_id → array(group_id)
    const m = new Map<number, number[]>();
    for (const ca of access) {
      if (ca.group_id) {
        if (!m.has(ca.course_id)) m.set(ca.course_id, []);
        m.get(ca.course_id)!.push(ca.group_id);
      }
    }
    return m;
  }, [access]);

  // 2) Wyliczamy efektywny dostęp
  const effective: EffectiveAccess[] = useMemo(() => {
    const rows: EffectiveAccess[] = [];

    // Pre-budowa indeksów użytkowników (dla szybkiego lookupu)
    const usersById = new Map(users.map(u => [u.id, u]));

    // ADMIN: dostęp do wszystkich kursów (we własnym vendorze – filtr robi RLS)
    for (const u of users) {
      if (u.role === "admin" && u.is_active) {
        for (const c of courses) {
          rows.push({
            user_id: u.id,
            user_name: u.full_name,
            user_email: u.email,
            user_role: u.role,
            course_id: c.id,
            course_title: c.title,
            reason: "admin_vendor",
          });
        }
      }
    }

    // TEACHER przypisany do kursu
    for (const [courseId, teacherIds] of teacherCourseSet.entries()) {
      for (const teacherId of teacherIds) {
        const u = usersById.get(teacherId);
        const c = coursesById.get(courseId);
        if (!u || !c || !u.is_active) continue;
        rows.push({
          user_id: u.id,
          user_name: u.full_name,
          user_email: u.email,
          user_role: u.role,
          course_id: c.id,
          course_title: c.title,
          reason: "teacher_assigned",
        });
      }
    }

    // CZŁONEK GRUPY z dostępem do kursu
    for (const [courseId, groupIds] of groupAccess.entries()) {
      const c = coursesById.get(courseId);
      if (!c) continue;

      for (const gid of groupIds) {
        const g = groupById.get(gid);
        const set = memberSetByGroup.get(gid);
        if (!g || !set) continue;

        for (const userId of set) {
          const u = usersById.get(userId);
          if (!u || !u.is_active) continue;
          // Uwaga: też obejmie teacherów/studentów będących w grupie (zamierzony efekt)
          rows.push({
            user_id: u.id,
            user_name: u.full_name,
            user_email: u.email,
            user_role: u.role,
            course_id: c.id,
            course_title: c.title,
            reason: "group_member",
            via_group_name: g.name,
          });
        }
      }
    }

    return rows;
  }, [users, courses, teacherCourseSet, groupAccess, coursesById, groupById, memberSetByGroup]);

  // 3) Filtry (tekst + rola + ścieżka dostępu)
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | Role>("all");
  const [reason, setReason] = useState<"all" | EffectiveAccess["reason"]>("all");
  
  // 4) Sortowanie
  const [sortField, setSortField] = useState<SortField>("user_name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    const result = effective.filter(r => {
      const matchQ = !qLower ||
        r.user_name.toLowerCase().includes(qLower) ||
        r.user_email.toLowerCase().includes(qLower) ||
        r.course_title.toLowerCase().includes(qLower) ||
        (r.via_group_name?.toLowerCase().includes(qLower) ?? false);

      const matchRole = role === "all" || r.user_role === role;
      const matchReason = reason === "all" || r.reason === reason;

      return matchQ && matchRole && matchReason;
    }).sort((a, b) => {
      let aVal = "";
      let bVal = "";
      
      switch (sortField) {
        case "user_name":
          aVal = a.user_name.toLowerCase();
          bVal = b.user_name.toLowerCase();
          break;
        case "user_email":
          aVal = a.user_email.toLowerCase();
          bVal = b.user_email.toLowerCase();
          break;
        case "user_role":
          aVal = a.user_role;
          bVal = b.user_role;
          break;
        case "course_title":
          aVal = a.course_title.toLowerCase();
          bVal = b.course_title.toLowerCase();
          break;
        case "reason":
          aVal = a.reason;
          bVal = b.reason;
          break;
      }
      
      if (sortDirection === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return result;
  }, [effective, q, role, reason, sortField, sortDirection]);

  if (loading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </SubPage>
    );
  }

  const reasonBadge = (r: EffectiveAccess["reason"]) => {
    switch (r) {
      case "admin_vendor": return <Badge variant="destructive">Admin (vendor)</Badge>;
      case "teacher_assigned": return <Badge>Teacher</Badge>;
      case "group_member": return <Badge variant="secondary">Grupa</Badge>;
    }
  };

  const roleBadge = (r: Role) => {
    switch (r) {
      case "admin": return <Badge variant="destructive">{r}</Badge>;
      case "teacher": return <Badge>{r}</Badge>;
      case "student": return <Badge variant="secondary">{r}</Badge>;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4 ml-1 inline" /> : 
      <ChevronDown className="w-4 h-4 ml-1 inline" />;
  };

  return (
    <SubPage>
      <FlexBox>
        <Lead
          title={(
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Uprawnienia dostępu do kursów
            </div>
          )}
          description="Pokazuje, kto widzi które kursy i z jakiego powodu – w obrębie Twojego vendora."
        />
      </FlexBox>

      <FlexBox className="gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po użytkowniku / kursie / grupie…"
            className="pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Select value={role} onValueChange={(v) => setRole(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtr: rola" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie role</SelectItem>
            <SelectItem value="admin">Administratorzy</SelectItem>
            <SelectItem value="teacher">Nauczyciele</SelectItem>
            <SelectItem value="student">Uczniowie</SelectItem>
          </SelectContent>
        </Select>

        <Select value={reason} onValueChange={(v) => setReason(v as any)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtr: ścieżka dostępu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="admin_vendor">Admin (vendor)</SelectItem>
            <SelectItem value="teacher_assigned">Teacher</SelectItem>
            <SelectItem value="group_member">Grupa</SelectItem>
          </SelectContent>
        </Select>
      </FlexBox>

      <Card>
        <CardHeader className="text-sm text-muted-foreground">
          Znaleziono {filtered.length} uprawnień
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("user_name")}
                  >
                    Użytkownik <SortIcon field="user_name" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("user_email")}
                  >
                    Email <SortIcon field="user_email" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 w-[120px]"
                    onClick={() => handleSort("user_role")}
                  >
                    Rola <SortIcon field="user_role" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 w-[250px]"
                    onClick={() => handleSort("course_title")}
                  >
                    Kurs <SortIcon field="course_title" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 w-[200px]"
                    onClick={() => handleSort("reason")}
                  >
                    Ścieżka dostępu <SortIcon field="reason" />
                  </TableHead>
                  <TableHead className="w-[200px]">Przez grupę</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Brak wyników dla obecnych filtrów.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row, idx) => (
                    <TableRow key={`${row.user_id}-${row.course_id}-${row.reason}-${row.via_group_name ?? "none"}-${idx}`}>
                      <TableCell className="font-medium">{row.user_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.user_email}</TableCell>
                      <TableCell>{roleBadge(row.user_role)}</TableCell>
                      <TableCell>
                        <div className="max-w-[180px] truncate" title={row.course_title}>
                          {row.course_title}
                        </div>
                      </TableCell>
                      <TableCell>{reasonBadge(row.reason)}</TableCell>
                      <TableCell>
                        {row.reason === "group_member" && row.via_group_name && (
                          <Badge variant="outline" className="text-xs">
                            {row.via_group_name}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};