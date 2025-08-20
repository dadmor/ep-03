// src/pages/admin/permissions/courses.tsx
import { useState, useMemo } from "react";
import { useList, useCreate, useNotification } from "@refinedev/core";
import { supabaseClient } from "@/utility";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  ScrollArea,
} from "@/components/ui";
import { BookOpen, Users, UserCheck, Plus, X, Loader2 } from "lucide-react";

type Course = {
  id: number;
  title: string;
  is_published: boolean;
};

type Group = {
  id: number;
  name: string;
  academic_year: string;
};

type Teacher = {
  id: string;
  full_name: string;
  email: string;
};

type CourseAccess = {
  course_id: number;
  group_id: number | null;
  teacher_id: string | null;
};

export const CoursePermissions = () => {
  const { open } = useNotification();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);

  // Pobierz dane
  const { data: coursesData, isLoading: loadingCourses } = useList<Course>({
    resource: "courses",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "title", order: "asc" }],
  });

  const { data: groupsData, isLoading: loadingGroups } = useList<Group>({
    resource: "groups",
    filters: [{ field: "is_active", operator: "eq", value: true }],
    pagination: { pageSize: 1000 },
  });

  const { data: teachersData, isLoading: loadingTeachers } = useList<Teacher>({
    resource: "users",
    filters: [
      { field: "role", operator: "eq", value: "teacher" },
      { field: "is_active", operator: "eq", value: true }
    ],
    pagination: { pageSize: 1000 },
  });

  const { data: accessData, refetch: refetchAccess, isLoading: loadingAccess } = useList<CourseAccess>({
    resource: "course_access",
    pagination: { pageSize: 10000 },
  });

  const { mutate: createAccess, isLoading: creating } = useCreate();

  const courses = coursesData?.data ?? [];
  const groups = groupsData?.data ?? [];
  const teachers = teachersData?.data ?? [];
  const access = accessData?.data ?? [];

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // Dostęp do wybranego kursu
  const courseAccess = useMemo(() => {
    if (!selectedCourseId) return { teachers: [], groups: [] };
    
    const courseAccessRows = access.filter(a => a.course_id === selectedCourseId);
    
    const assignedTeachers = teachers.filter(t => 
      courseAccessRows.some(a => a.teacher_id === t.id)
    );
    
    const assignedGroups = groups.filter(g => 
      courseAccessRows.some(a => a.group_id === g.id)
    );
    
    return { teachers: assignedTeachers, groups: assignedGroups };
  }, [selectedCourseId, access, teachers, groups]);

  const availableTeachers = teachers.filter(t => 
    !courseAccess.teachers.some(at => at.id === t.id)
  );

  const availableGroups = groups.filter(g => 
    !courseAccess.groups.some(ag => ag.id === g.id)
  );

  const handleAddTeacher = (teacherId: string) => {
    if (!selectedCourseId) return;

    createAccess(
      {
        resource: "course_access",
        values: { 
          course_id: selectedCourseId, 
          teacher_id: teacherId,
          group_id: null 
        },
        successNotification: () => ({
          message: "Nauczyciel dodany do kursu",
          type: "success"
        }),
      },
      { onSuccess: () => refetchAccess() }
    );
  };

  const handleAddGroup = (groupId: number) => {
    if (!selectedCourseId) return;

    createAccess(
      {
        resource: "course_access",
        values: { 
          course_id: selectedCourseId, 
          group_id: groupId,
          teacher_id: null 
        },
        successNotification: () => ({
          message: "Grupa dodana do kursu",
          type: "success"
        }),
      },
      { onSuccess: () => refetchAccess() }
    );
  };

  const handleRemoveAccess = async (type: 'teacher' | 'group', id: string | number) => {
    if (!selectedCourseId) return;

    setRemoving(true);
    try {
      const query = supabaseClient
        .from('course_access')
        .delete()
        .eq('course_id', selectedCourseId);

      if (type === 'teacher') {
        query.eq('teacher_id', id);
      } else {
        query.eq('group_id', id);
      }

      const { error } = await query;
      if (error) throw error;

      open?.({
        type: "success",
        message: "Dostęp został usunięty",
      });

      refetchAccess();
    } catch (error) {
      open?.({
        type: "error",
        message: "Nie udało się usunąć dostępu",
      });
    } finally {
      setRemoving(false);
    }
  };

  const loading = loadingCourses || loadingGroups || loadingTeachers || loadingAccess;

  return (
    <SubPage>
      <Lead 
        title="Zarządzanie dostępem do kursów" 
        description="Przypisz nauczycieli i grupy do kursów"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista kursów */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Wybierz kurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCourses ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {courses.map(course => (
                      <button
                        key={course.id}
                        onClick={() => setSelectedCourseId(course.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedCourseId === course.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="font-medium">{course.title}</div>
                        <Badge 
                          variant={selectedCourseId === course.id ? "secondary" : "outline"}
                          className="mt-1"
                        >
                          {course.is_published ? "Opublikowany" : "Szkic"}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Zarządzanie dostępem */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedCourse ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">
                  Wybierz kurs z listy po lewej stronie
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Nauczyciele */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Nauczyciele ({courseAccess.teachers.length})
                    </div>
                    <Select onValueChange={handleAddTeacher} disabled={creating}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Dodaj nauczyciela" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTeachers.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Brak dostępnych
                          </div>
                        ) : (
                          availableTeachers.map(teacher => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.full_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {courseAccess.teachers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Brak przypisanych nauczycieli
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {courseAccess.teachers.map(teacher => (
                        <div key={teacher.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <div className="font-medium">{teacher.full_name}</div>
                            <div className="text-sm text-muted-foreground">{teacher.email}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveAccess('teacher', teacher.id)}
                            disabled={removing}
                          >
                            {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grupy */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Grupy ({courseAccess.groups.length})
                    </div>
                    <Select onValueChange={(v) => handleAddGroup(Number(v))} disabled={creating}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Dodaj grupę" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGroups.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Brak dostępnych
                          </div>
                        ) : (
                          availableGroups.map(group => (
                            <SelectItem key={group.id} value={String(group.id)}>
                              {group.name} ({group.academic_year})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {courseAccess.groups.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Brak przypisanych grup
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {courseAccess.groups.map(group => (
                        <div key={group.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <div className="font-medium">{group.name}</div>
                            <div className="text-sm text-muted-foreground">Rok: {group.academic_year}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveAccess('group', group.id)}
                            disabled={removing}
                          >
                            {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </SubPage>
  );
};