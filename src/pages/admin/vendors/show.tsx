// src/pages/admin/vendors/show.tsx
import { useOne, useList, useNavigation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, Badge } from "@/components/ui";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { ArrowLeft, Building, Globe, Calendar, Users, BookOpen, Edit, Power } from "lucide-react";
import { useParams } from "react-router-dom";

export const VendorsShow = () => {
  const { list, edit } = useNavigation();
  const { id } = useParams();

  const { data: vendorData, isLoading: vendorLoading } = useOne({
    resource: "vendors",
    id: id as string,
  });

  const { data: usersData } = useList({
    resource: "users",
    filters: [
      {
        field: "vendor_id",
        operator: "eq",
        value: id,
      },
    ],
  });

  const { data: coursesData } = useList({
    resource: "courses",
    filters: [
      {
        field: "vendor_id",
        operator: "eq",
        value: id,
      },
    ],
  });

  if (vendorLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const vendor = vendorData?.data;

  const stats = {
    totalUsers: usersData?.total || 0,
    students: usersData?.data?.filter(u => u.role === 'student').length || 0,
    teachers: usersData?.data?.filter(u => u.role === 'teacher').length || 0,
    admins: usersData?.data?.filter(u => u.role === 'admin').length || 0,
    totalCourses: coursesData?.total || 0,
  };

  return (
    <SubPage>
      <Button variant="outline" size="sm" onClick={() => list("vendors")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <Lead
          title={
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8" />
              {vendor?.name}
            </div>
          }
          description={`Szczegóły organizacji`}
        />
        <Button onClick={() => edit("vendors", vendor?.id ?? "")}>
          <Edit className="w-4 h-4 mr-2" />
          Edytuj
        </Button>
      </FlexBox>

      <GridBox variant="2-2-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Power className="w-4 h-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={vendor?.is_active ? "default" : "secondary"} className="text-sm">
              {vendor?.is_active ? "Aktywna" : "Nieaktywna"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Subdomena
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-mono">{vendor?.subdomain}.smartup.pl</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Użytkownicy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Utworzono
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {new Date(vendor?.created_at).toLocaleDateString("pl-PL", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </CardContent>
        </Card>
      </GridBox>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Statystyki użytkowników
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Uczniowie</span>
                <span className="text-2xl font-bold">{stats.students}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Nauczyciele</span>
                <span className="text-2xl font-bold">{stats.teachers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Administratorzy</span>
                <span className="text-2xl font-bold">{stats.admins}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Kursy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold mb-2">{stats.totalCourses}</div>
              <p className="text-sm text-muted-foreground">Utworzonych kursów</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ostatni użytkownicy</CardTitle>
        </CardHeader>
        <CardContent>
          {usersData?.data && usersData.data.length > 0 ? (
            <div className="space-y-2">
              {usersData.data.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={
                    user.role === 'admin' ? 'destructive' :
                    user.role === 'teacher' ? 'default' :
                    'secondary'
                  }>
                    {user.role === 'admin' ? 'Administrator' :
                     user.role === 'teacher' ? 'Nauczyciel' : 'Uczeń'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Brak użytkowników w tej organizacji
            </p>
          )}
        </CardContent>
      </Card>
    </SubPage>
  );
};