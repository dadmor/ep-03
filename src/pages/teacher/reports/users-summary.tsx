// path: src/pages/teacher/reports/users-summary.tsx
import { useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { FlexBox, GridBox } from "@/components/shared";
import { Badge } from "@/components/ui";
import { Users, Shield, GraduationCap, UserCircle } from "lucide-react";

type Role = "student" | "teacher" | "admin";

interface User {
  id: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export const ReportUsersSummary = () => {
  const { data, isLoading, isError } = useList<User>({ resource: "users", pagination: { mode: "off" } });

  const users = data?.data ?? [];
  const countsByRole: Record<Role, number> = { student: 0, teacher: 0, admin: 0 };
  const active = users.filter((u) => u.is_active).length;
  const inactive = users.length - active;

  users.forEach((u) => {
    countsByRole[u.role] = (countsByRole[u.role] ?? 0) + 1;
  });

  const roleIcon = (r: Role) =>
    r === "admin" ? <Shield className="w-4 h-4" /> :
    r === "teacher" ? <GraduationCap className="w-4 h-4" /> :
    <UserCircle className="w-4 h-4" />;

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </SubPage>
    );
  }

  if (isError) {
    return (
      <SubPage>
        <p className="text-sm text-red-600">Nie udało się pobrać danych użytkowników.</p>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <FlexBox>
        <Lead
          title="Użytkownicy – podsumowanie"
          description="Liczebność wg roli i statusu konta"
        />
      </FlexBox>

      <GridBox>
        <Card>
          <CardHeader>
            <CardTitle>Łącznie</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-muted-foreground">użytkowników</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status konta</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Badge variant="outline">Aktywni: <span className="ml-1 font-semibold">{active}</span></Badge>
            <Badge variant="secondary">Nieaktywni: <span className="ml-1 font-semibold">{inactive}</span></Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Wg roli</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(["student","teacher","admin"] as Role[]).map((r) => (
              <div key={r} className="flex items-center justify-between border rounded-md p-3">
                <div className="flex items-center gap-2">
                  {roleIcon(r)}
                  <span className="capitalize">{r}</span>
                </div>
                <span className="font-semibold">{countsByRole[r]}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </GridBox>
    </SubPage>
  );
};
