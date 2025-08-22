// src/pages/admin/permissions/courses.tsx - POPRAWIONA WERSJA
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui";
import { 
  BookOpen, 
  Users, 
  UserCheck, 
  Plus, 
  X, 
  Loader2,
  Link,
  AlertCircle
} from "lucide-react";

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
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

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
    meta: {
      select: `
        *,
        groups(id, name, academic_year),
        users!course_access_teacher_id_fkey(id, full_name, email)
      `
    }
  });

  const { mutate: createAccess, isLoading: creating } = useCreate();

  const courses = coursesData?.data ?? [];
  const groups = groupsData?.data ?? [];
  const teachers = teachersData?.data ?? [];
  const access = accessData?.data ?? [];

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // Dostęp do wybranego kursu
  const courseAccess = useMemo(() => {
    if (!selectedCourseId) return { assignments: [] };
    
    const courseAccessRows = access.filter(a => a.course_id === selectedCourseId);
    
    // Grupuj po teacher_id i group_id
    const assignments = courseAccessRows.map(row => ({
      teacher: row.teacher_id ? teachers.find(t => t.id === row.teacher_id) : null,
      group: row.group_id ? groups.find(g => g.id === row.group_id) : null,
      raw: row
    })).filter(a => a.teacher || a.group);
    
    return { assignments };
  }, [selectedCourseId, access, teachers, groups]);

  // Grupy bez nauczyciela w tym kursie
  const groupsWithoutTeacher = useMemo(() => {
    if (!selectedCourseId) return [];
    
    const courseGroups = courseAccess.assignments
      .filter(a => a.group && !a.teacher)
      .map(a => a.group);
      
    return courseGroups;
  }, [courseAccess]);

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

  const handleAssignTeacherToGroup = () => {
    if (!selectedCourseId || !selectedGroupId || !selectedTeacherId) return;

    createAccess(
      {
        resource: "course_access",
        values: { 
          course_id: selectedCourseId, 
          group_id: selectedGroupId,
          teacher_id: selectedTeacherId 
        },
        successNotification: () => ({
          message: "Nauczyciel przypisany do grupy",
          type: "success"
        }),
      },
      { 
        onSuccess: () => {
          refetchAccess();
          setShowAssignDialog(false);
          setSelectedGroupId(null);
          setSelectedTeacherId(null);
        }
      }
    );
  };

  const handleRemoveAccess = async (type: 'group' | 'assignment', id: string | number, teacherId?: string) => {
    if (!selectedCourseId) return;

    setRemoving(true);
    try {
      const query = supabaseClient
        .from('course_access')
        .delete()
        .eq('course_id', selectedCourseId);

      if (type === 'group') {
        query.eq('group_id', id);
      } else if (type === 'assignment' && teacherId) {
        query.eq('group_id', id).eq('teacher_id', teacherId);
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

  // Grupuj przypisania
  const groupedAssignments = useMemo(() => {
    const grouped = new Map<number, { group: Group; teachers: Teacher[] }>();
    
    courseAccess.assignments.forEach(assignment => {
      if (assignment.group) {
        if (!grouped.has(assignment.group.id)) {
          grouped.set(assignment.group.id, {
            group: assignment.group,
            teachers: []
          });
        }
        if (assignment.teacher) {
          grouped.get(assignment.group.id)?.teachers.push(assignment.teacher);
        }
      }
    });
    
    return Array.from(grouped.values());
  }, [courseAccess]);

  // Dostępne grupy do dodania
  const availableGroups = groups.filter(g => 
    !groupedAssignments.some(ga => ga.group.id === g.id)
  );

  return (
    <SubPage>
      <Lead 
        title="Zarządzanie dostępem do kursów" 
        description="Przypisz grupy i nauczycieli do kursów"
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
        <div className="lg:col-span-2">
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Grupy w kursie</CardTitle>
                  <Select onValueChange={(v) => handleAddGroup(Number(v))} disabled={creating}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Dodaj grupę" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGroups.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Brak dostępnych grup
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
                </div>
              </CardHeader>
              <CardContent>
                {groupedAssignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Brak grup przypisanych do tego kursu</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedAssignments.map(({ group, teachers }) => (
                      <div key={group.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {group.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Rok: {group.academic_year}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {teachers.length === 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedGroupId(group.id);
                                  setShowAssignDialog(true);
                                }}
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Przypisz nauczyciela
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveAccess('group', group.id)}
                              disabled={removing}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {teachers.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Nauczyciele prowadzący:
                            </p>
                            {teachers.map(teacher => (
                              <div key={teacher.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <div>
                                  <div className="text-sm font-medium">{teacher.full_name}</div>
                                  <div className="text-xs text-muted-foreground">{teacher.email}</div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveAccess('assignment', group.id, teacher.id)}
                                  disabled={removing}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
                            <AlertCircle className="w-4 h-4" />
                            <span>Grupa nie ma przypisanego nauczyciela</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog przypisywania nauczyciela */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Przypisz nauczyciela do grupy</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz nauczyciela" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.full_name} ({teacher.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Anuluj
            </Button>
            <Button 
              onClick={handleAssignTeacherToGroup} 
              disabled={!selectedTeacherId || creating}
            >
              Przypisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SubPage>
  );
};