// src/pages/admin/permissions/assign.tsx
import { useMemo, useState, useEffect } from "react";
import { useList, useCreate, useUpdate } from "@refinedev/core";
import { useNotification } from "@refinedev/core";

import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Button, 
  Input, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Badge, 
  Alert,
  AlertDescription,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TooltipProvider,
} from "@/components/ui";
import { 
  BookOpen, 
  Users, 
  UserCheck, 
  ListChecks, 
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

// Import komponentów
import { CourseSelector } from "./components/CourseSelector";
import { TeachersTab } from "./components/TeachersTab";
import { GroupsTab } from "./components/GroupsTab";
import { TopicsTab } from "./components/TopicsTab";
import { supabaseClient } from "@/utility";

// Typy
export type Course = { id: number; title: string; vendor_id: number; is_published: boolean };
export type User = { id: string; full_name: string; email: string; role: "student"|"teacher"|"admin"; is_active: boolean };
export type Group = { id: number; name: string; is_active: boolean };
export type CourseAccess = { course_id: number; group_id: number|null; teacher_id: string|null };
export type Topic = { id: number; course_id: number; title: string; position: number; is_published: boolean };

export const AssignPermissions = () => {
  const { open } = useNotification();
  
  // dane bazowe
  const { data: coursesData, isLoading: loadingCourses } = useList<Course>({ 
    resource: "courses", 
    pagination: { pageSize: 1000 }, 
    sorters: [{ field: "title", order: "asc" }]
  });
  const { data: usersData, isLoading: loadingUsers } = useList<User>({ 
    resource: "users", 
    pagination: { pageSize: 10000 }
  });
  const { data: groupsData, isLoading: loadingGroups } = useList<Group>({ 
    resource: "groups", 
    pagination: { pageSize: 10000 }, 
    sorters: [{ field: "name", order: "asc" }]
  });
  const { data: accessData, refetch: refetchAccess, isLoading: loadingAccess } = useList<CourseAccess>({ 
    resource: "course_access", 
    pagination: { pageSize: 100000 }
  });
  const { data: topicsData, refetch: refetchTopics, isLoading: loadingTopics } = useList<Topic>({ 
    resource: "topics", 
    pagination: { pageSize: 100000 }, 
    sorters: [{ field: "position", order: "asc" }]
  });

  const { mutate: createAccess, isLoading: creating } = useCreate();
  const { mutate: updateTopic, isLoading: updatingTopic } = useUpdate();

  const courses = coursesData?.data ?? [];
  const users   = usersData?.data   ?? [];
  const groups  = groupsData?.data  ?? [];
  const access  = accessData?.data  ?? [];
  const topics  = topicsData?.data  ?? [];

  const teachers = useMemo(() => users.filter(u => u.role === "teacher" && u.is_active), [users]);
  const activeGroups = useMemo(() => groups.filter(g => g.is_active), [groups]);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("teachers");
  const [deleting, setDeleting] = useState(false);

  // Automatycznie wybierz pierwszy kurs
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || null;

  const courseAccess = useMemo(() => {
    if (!selectedCourseId) return { teachers: [] as User[], groups: [] as Group[] };
    const rows = access.filter(a => a.course_id === selectedCourseId);
    const teacherIds = new Set(rows.filter(r => r.teacher_id).map(r => r.teacher_id!));
    const groupIds   = new Set(rows.filter(r => r.group_id).map(r => r.group_id!));
    return {
      teachers: teachers.filter(t => teacherIds.has(t.id)),
      groups: activeGroups.filter(g => groupIds.has(g.id)),
    };
  }, [access, selectedCourseId, teachers, activeGroups]);

  const courseTopics = useMemo(() => {
    return topics.filter(t => t.course_id === selectedCourseId);
  }, [topics, selectedCourseId]);

  const stats = useMemo(() => ({
    totalTopics: courseTopics.length,
    publishedTopics: courseTopics.filter(t => t.is_published).length,
    unpublishedTopics: courseTopics.filter(t => !t.is_published).length,
  }), [courseTopics]);

  const addTeacher = (teacherId: string) => {
    if (!selectedCourseId) return;
    createAccess(
      {
        resource: "course_access",
        values: { course_id: selectedCourseId, teacher_id: teacherId, group_id: null },
        successNotification: () => ({ message: "Nauczyciel został dodany do kursu", type: "success" }),
        errorNotification: () => ({ message: "Nie udało się dodać nauczyciela", type: "error" }),
      },
      { onSuccess: () => refetchAccess() }
    );
  };

  const addGroup = (groupId: number) => {
    if (!selectedCourseId) return;
    createAccess(
      {
        resource: "course_access",
        values: { course_id: selectedCourseId, group_id: groupId, teacher_id: null },
        successNotification: () => ({ message: "Grupa została dodana do kursu", type: "success" }),
        errorNotification: () => ({ message: "Nie udało się dodać grupy", type: "error" }),
      },
      { onSuccess: () => refetchAccess() }
    );
  };

  const removeTeacher = async (teacherId: string) => {
    if (!selectedCourseId) return;
    
    setDeleting(true);
    try {
      const { error } = await supabaseClient
        .from('course_access')
        .delete()
        .eq('course_id', selectedCourseId)
        .eq('teacher_id', teacherId);
        
      if (error) throw error;
      
      open?.({
        type: "success",
        message: "Nauczyciel został usunięty z kursu",
      });
      
      refetchAccess();
    } catch (error) {
      console.error("Błąd podczas usuwania nauczyciela:", error);
      open?.({
        type: "error",
        message: "Nie udało się usunąć nauczyciela",
      });
    } finally {
      setDeleting(false);
    }
  };

  const removeGroup = async (groupId: number) => {
    if (!selectedCourseId) return;
    
    setDeleting(true);
    try {
      const { error } = await supabaseClient
        .from('course_access')
        .delete()
        .eq('course_id', selectedCourseId)
        .eq('group_id', groupId);
        
      if (error) throw error;
      
      open?.({
        type: "success",
        message: "Grupa została usunięta z kursu",
      });
      
      refetchAccess();
    } catch (error) {
      console.error("Błąd podczas usuwania grupy:", error);
      open?.({
        type: "error",
        message: "Nie udało się usunąć grupy",
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleTopicPublish = (topic: Topic, publish: boolean) => {
    updateTopic(
      {
        resource: "topics",
        id: topic.id,
        values: { is_published: publish },
        successNotification: () => ({ 
          message: publish ? "Temat został opublikowany" : "Temat został ukryty", 
          type: "success" 
        }),
        errorNotification: () => ({ message: "Nie udało się zapisać zmian", type: "error" }),
      },
      { onSuccess: () => refetchTopics() }
    );
  };

  const publishAllTopics = () => {
    const unpublishedTopics = courseTopics.filter(t => !t.is_published);
    unpublishedTopics.forEach(topic => {
      toggleTopicPublish(topic, true);
    });
  };

  const isLoading = loadingCourses || loadingUsers || loadingGroups || loadingAccess || loadingTopics;

  return (
    <SubPage>
      <Lead
        title="Zarządzanie uprawnieniami"
        description="Przypisuj kursy nauczycielom i grupom oraz kontroluj widoczność tematów."
      />

      {/* Wybór kursu */}
      <CourseSelector
        courses={courses}
        selectedCourse={selectedCourse}
        selectedCourseId={selectedCourseId}
        onCourseChange={setSelectedCourseId}
        loading={loadingCourses}
      />

      {!selectedCourse && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Wybierz kurs, aby zarządzać dostępem i tematami.</p>
        </div>
      )}

      {selectedCourse && (
        <TooltipProvider>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Nauczyciele
                {courseAccess.teachers.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{courseAccess.teachers.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Grupy
                {courseAccess.groups.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{courseAccess.groups.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="topics" className="flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                Tematy
                <Badge variant="secondary" className="ml-1">
                  {stats.publishedTopics}/{stats.totalTopics}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teachers">
              <TeachersTab
                teachers={teachers}
                courseTeachers={courseAccess.teachers}
                onAddTeacher={addTeacher}
                onRemoveTeacher={removeTeacher}
                creating={creating}
                deleting={deleting}
                loadingUsers={loadingUsers}
                loadingAccess={loadingAccess}
              />
            </TabsContent>

            <TabsContent value="groups">
              <GroupsTab
                groups={activeGroups}
                courseGroups={courseAccess.groups}
                onAddGroup={addGroup}
                onRemoveGroup={removeGroup}
                creating={creating}
                deleting={deleting}
                loadingGroups={loadingGroups}
                loadingAccess={loadingAccess}
              />
            </TabsContent>

            <TabsContent value="topics">
              <TopicsTab
                topics={courseTopics}
                stats={stats}
                onTogglePublish={toggleTopicPublish}
                onPublishAll={publishAllTopics}
                updatingTopic={updatingTopic}
                loadingTopics={loadingTopics}
              />
            </TabsContent>
          </Tabs>
        </TooltipProvider>
      )}
    </SubPage>
  );
};