// src/pages/admin/permissions/components/TeachersTab.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Button, 
  Input, 
  Badge,
  Alert,
  AlertDescription,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui";
import { 
  UserCheck, 
  Plus, 
  Search,
  Info,
  X,
  Loader2,
  UserPlus
} from "lucide-react";
import type { User } from "../assign";

interface TeachersTabProps {
  teachers: User[];
  courseTeachers: User[];
  onAddTeacher: (teacherId: string) => void;
  onRemoveTeacher: (teacherId: string) => void;
  creating: boolean;
  deleting: boolean;
  loadingUsers: boolean;
  loadingAccess: boolean;
}

export const TeachersTab = ({
  teachers,
  courseTeachers,
  onAddTeacher,
  onRemoveTeacher,
  creating,
  deleting,
  loadingUsers,
  loadingAccess,
}: TeachersTabProps) => {
  const [teacherQuery, setTeacherQuery] = useState("");

  const filteredTeachers = useMemo(() => {
    const q = teacherQuery.trim().toLowerCase();
    const existing = new Set(courseTeachers.map(t => t.id));
    return teachers
      .filter(t => !existing.has(t.id))
      .filter(t => !q || t.full_name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q))
      .slice(0, 10);
  }, [teachers, courseTeachers, teacherQuery]);

  const handleAddTeacher = (teacherId: string) => {
    onAddTeacher(teacherId);
    setTeacherQuery("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Dodaj nauczycieli do kursu
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Nauczyciele mogą przeglądać i edytować zawartość kursu</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wyszukiwarka nauczycieli */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Szukaj nauczyciela po imieniu lub emailu..." 
            value={teacherQuery} 
            onChange={(e) => setTeacherQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lista nauczycieli do dodania */}
        {teacherQuery && (
          <div className="border rounded-lg max-h-64 overflow-auto">
            {loadingUsers ? (
              <div className="p-4 text-center">
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              </div>
            ) : filteredTeachers.length > 0 ? (
              <div className="divide-y">
                {filteredTeachers.map(t => (
                  <div key={t.id} className="p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-medium">{t.full_name}</div>
                        <div className="text-sm text-muted-foreground truncate">{t.email}</div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddTeacher(t.id)} 
                        disabled={creating}
                        className="ml-3 shrink-0"
                      >
                        {creating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1" />
                            Dodaj
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nie znaleziono nauczycieli</p>
              </div>
            )}
          </div>
        )}

        {/* Lista przypisanych nauczycieli */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            Przypisani nauczyciele
            <Badge variant="outline">{courseTeachers.length}</Badge>
          </h4>
          {loadingAccess ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : courseTeachers.length > 0 ? (
            <div className="space-y-2">
              {courseTeachers.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{t.full_name}</div>
                      <div className="text-sm text-muted-foreground">{t.email}</div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemoveTeacher(t.id)} 
                    disabled={deleting}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Brak przypisanych nauczycieli. Użyj wyszukiwarki powyżej, aby dodać nauczycieli.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};