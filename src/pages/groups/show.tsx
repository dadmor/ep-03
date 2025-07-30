import { useOne, useNavigation, useList, useInvalidate } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Users,
  Calendar,
  BookOpen,
  Plus,
  UserPlus,
  Trash2,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabaseClient } from "@/utility/supabaseClient";

export const GroupsShow = () => {
  const { list, edit } = useNavigation();
  const { id } = useParams();
  const navigate = useNavigate();
  const invalidate = useInvalidate();

  const { data: groupData, isLoading: groupLoading } = useOne({
    resource: "groups",
    id: id as string,
    liveMode: "off",
  });

  const { data: membersData } = useList({
    resource: "group_members",
    filters: [
      {
        field: "group_id",
        operator: "eq",
        value: id,
      },
    ],
    meta: {
      select: "*, users(*)",
    },
    queryOptions: {
      enabled: !!id,
    },
    liveMode: "off",
  });

  const { data: coursesData } = useList({
    resource: "course_access",
    filters: [
      {
        field: "group_id",
        operator: "eq",
        value: id,
      },
    ],
    meta: {
      select: "*, courses(*)",
    },
    queryOptions: {
      enabled: !!id,
    },
    liveMode: "off",
  });

  const handleRemoveCourse = async (courseId: number, courseTitle: string) => {
    if (confirm(`Czy na pewno chcesz odpiąć kurs "${courseTitle}" od tej grupy?`)) {
      try {
        const { error } = await supabaseClient
          .from("course_access")
          .delete()
          .eq("course_id", courseId)
          .eq("group_id", parseInt(id as string));
        
        if (error) {
          throw error;
        }
        
        toast.success("Kurs został odpięty od grupy");
        // Odśwież listę kursów
        invalidate({
          resource: "course_access",
          invalidates: ["list"],
        });
      } catch (error) {
        console.error("Error removing course:", error);
        toast.error("Błąd podczas odpinania kursu");
      }
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (confirm(`Czy na pewno chcesz usunąć "${userName}" z tej grupy?`)) {
      try {
        const { error } = await supabaseClient
          .from("group_members")
          .delete()
          .eq("user_id", userId)
          .eq("group_id", parseInt(id as string));
        
        if (error) {
          throw error;
        }
        
        toast.success("Uczeń został usunięty z grupy");
        // Odśwież listę członków
        invalidate({
          resource: "group_members",
          invalidates: ["list"],
        });
      } catch (error) {
        console.error("Error removing member:", error);
        toast.error("Błąd podczas usuwania ucznia z grupy");
      }
    }
  };

  if (groupLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const group = groupData?.data;

  return (
    <SubPage>
      <Button variant="outline" size="sm" onClick={() => list("groups")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <Lead
          title={group?.name}
          description={`Rok akademicki: ${group?.academic_year}`}
        />
        <Button onClick={() => edit("groups", group?.id ?? "")}>
          <Edit className="w-4 h-4 mr-2" />
          Edytuj grupę
        </Button>
      </FlexBox>

      <GridBox variant="2-2-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={group?.is_active ? "default" : "secondary"}>
              {group?.is_active ? "Aktywna" : "Nieaktywna"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uczniowie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membersData?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kursy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesData?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utworzono</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {new Date(group?.created_at).toLocaleDateString("pl-PL")}
            </div>
          </CardContent>
        </Card>
      </GridBox>

      {/* Lista uczniów */}
      <Card>
        <CardHeader>
          <FlexBox>
            <CardTitle>Uczniowie grupy</CardTitle>
            <Button size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Dodaj ucznia
            </Button>
          </FlexBox>
        </CardHeader>
        <CardContent>
          {membersData?.data?.length ? (
            <div className="space-y-2">
              {membersData.data.map((member: any) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{member.users?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.users?.email}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveMember(member.user_id, member.users?.full_name)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Brak uczniów w grupie</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista kursów */}
      <Card>
        <CardHeader>
          <FlexBox>
            <CardTitle>Przypisane kursy</CardTitle>
            <Button
              size="sm"
              onClick={() => navigate(`/groups/${id}/assign-courses`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Przypisz kurs
            </Button>
          </FlexBox>
        </CardHeader>
        <CardContent>
          {coursesData?.data?.length ? (
            <div className="space-y-2">
              {coursesData.data.map((access: any) => (
                <div
                  key={access.course_id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {access.courses?.icon_emoji ? (
                      <span className="text-2xl">
                        {access.courses.icon_emoji}
                      </span>
                    ) : (
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{access.courses?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Przypisano:{" "}
                        {new Date(access.assigned_at).toLocaleDateString(
                          "pl-PL"
                        )}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveCourse(access.course_id, access.courses?.title)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Brak przypisanych kursów</p>
            </div>
          )}
        </CardContent>
      </Card>
    </SubPage>
  );
};