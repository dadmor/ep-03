import { useOne, useNavigation, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Shield,
  Trophy,
  Clock,
  Activity,
  BookOpen,
  Target,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { useParams } from "react-router-dom";

export const UsersShow = () => {
  const { list, edit } = useNavigation();
  const { id } = useParams();

  const { data: userData, isLoading: userLoading } = useOne({
    resource: "users",
    id: id as string,
    meta: {
      select: "*, user_stats(*)",
    },
  });

  const { data: progressData } = useList({
    resource: "activity_progress",
    filters: [
      {
        field: "user_id",
        operator: "eq",
        value: id,
      },
    ],
  });

  if (userLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const user = userData?.data;
  const stats = user?.user_stats?.[0] || {};

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "teacher":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <SubPage>
      <Button variant="outline" size="sm" onClick={() => list("users")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <Lead title={user?.full_name} description={user?.email} />
        <Button onClick={() => edit("users", user?.id ?? "")}>
          <Edit className="w-4 h-4 mr-2" />
          Edytuj użytkownika
        </Button>
      </FlexBox>

      <GridBox>
        {/* Informacje podstawowe */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informacje podstawowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Imię i nazwisko
                  </p>
                  <p className="text-lg">{user?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-lg flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Rola
                  </p>
                  <Badge variant="default" className="mt-1">
                    {getRoleIcon(user?.role)}
                    <span className="ml-1 capitalize">{user?.role}</span>
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant={user?.is_active ? "outline" : "secondary"}
                    className="mt-1"
                  >
                    {user?.is_active ? "Aktywny" : "Nieaktywny"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statystyki gracza */}
          <Card>
            <CardHeader>
              <CardTitle>Statystyki gamifikacji</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">
                    {stats.total_points || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Punkty</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">
                    {stats.current_level || 1}
                  </p>
                  <p className="text-sm text-muted-foreground">Poziom</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">
                    {stats.daily_streak || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Dni z rzędu</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">
                    {Math.round((stats.total_time_spent || 0) / 60)}
                  </p>
                  <p className="text-sm text-muted-foreground">Godzin nauki</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Postępy w nauce */}
          <Card>
            <CardHeader>
              <CardTitle>Postępy w nauce</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ukończone quizy</span>
                  <span className="font-bold">
                    {stats.quizzes_completed || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    Wyniki perfekcyjne
                  </span>
                  <span className="font-bold">{stats.perfect_scores || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    Ukończone aktywności
                  </span>
                  <span className="font-bold">
                    {progressData?.data?.filter((p: any) => p.completed_at)
                      .length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel boczny */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Utworzono</p>
                <p className="text-sm font-medium">
                  {new Date(user?.created_at).toLocaleDateString("pl-PL")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Ostatnia aktywność
                </p>
                <p className="text-sm font-medium">
                  {stats.last_active
                    ? new Date(stats.last_active).toLocaleDateString("pl-PL")
                    : "Brak aktywności"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Idle Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Punkty/h</span>
                <span className="font-bold">{stats.idle_points_rate || 1}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Ostatnie odebranie
                </p>
                <p className="text-sm font-medium">
                  {stats.last_idle_claim
                    ? new Date(stats.last_idle_claim).toLocaleString("pl-PL")
                    : "Nigdy"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </GridBox>
    </SubPage>
  );
};
