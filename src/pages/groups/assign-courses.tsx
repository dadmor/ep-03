import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne, useList, useCreate } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Check, X } from "lucide-react";
import { Button, Checkbox, Badge, Input } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { toast } from "sonner";
import { supabaseClient } from "@/utility/supabaseClient";

interface Course {
  id: number;
  title: string;
  description?: string;
  icon_emoji?: string;
  is_published: boolean;
}

interface CourseAccess {
  course_id: number;
  group_id: number;
}

export const GroupsAssignCourses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Pobierz dane grupy
  const { data: groupData, isLoading: groupLoading } = useOne({
    resource: "groups",
    id: id as string,
  });

  // Pobierz wszystkie kursy
  const { data: coursesData, isLoading: coursesLoading } = useList<Course>({
    resource: "courses",
    pagination: {
      mode: "off",
    },
  });

  // Pobierz aktualnie przypisane kursy
  const { data: assignedCoursesData, isLoading: assignedLoading } =
    useList<CourseAccess>({
      resource: "course_access",
      filters: [
        {
          field: "group_id",
          operator: "eq",
          value: parseInt(id as string),
        },
      ],
      pagination: {
        mode: "off",
      },
      meta: {
        select: "course_id, group_id",
      },
    });

  // Mutacja do przypisywania kursów
  const { mutate: createCourseAccess, isLoading: isAssigning } = useCreate();

  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      toast.error("Wybierz przynajmniej jeden kurs");
      return;
    }

    try {
      // Przypisz każdy kurs do grupy
      const promises = selectedCourses.map((courseId) =>
        createCourseAccess(
          {
            resource: "course_access",
            values: {
              course_id: courseId,
              group_id: parseInt(id as string),
            },
          },
          {
            onSuccess: () => {
              console.log(`Course ${courseId} assigned successfully`);
            },
            onError: (error) => {
              console.error("Error assigning course:", courseId, error);
            },
          }
        )
      );

      await Promise.all(promises);

      toast.success(`Przypisano ${selectedCourses.length} kursów do grupy`);
      navigate(`/groups/show/${id}`);
    } catch (error) {
      toast.error("Błąd podczas przypisywania kursów");
      console.error("Error details:", error);
    }
  };

  if (groupLoading || coursesLoading || assignedLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const group = groupData?.data;
  const assignedCourseIds =
    assignedCoursesData?.data?.map((a) => a.course_id) || [];

  // Filtruj kursy - pokaż tylko te które nie są jeszcze przypisane
  const availableCourses =
    coursesData?.data?.filter(
      (course) => !assignedCourseIds.includes(course.id)
    ) || [];

  // Filtruj po wyszukiwaniu
  const filteredCourses = availableCourses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCourse = (courseId: number) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const selectAll = () => {
    setSelectedCourses(filteredCourses.map((c) => c.id));
  };

  const deselectAll = () => {
    setSelectedCourses([]);
  };

  return (
    <SubPage>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/groups/show/${id}`)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do grupy
      </Button>

      <FlexBox>
        <Lead
          title="Przypisz kursy"
          description={`Przypisywanie kursów do grupy: ${group?.name}`}
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <FlexBox>
            <CardTitle>Dostępne kursy</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                disabled={filteredCourses.length === 0}
              >
                <Check className="w-4 h-4 mr-2" />
                Zaznacz wszystkie
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAll}
                disabled={selectedCourses.length === 0}
              >
                <X className="w-4 h-4 mr-2" />
                Odznacz wszystkie
              </Button>
            </div>
          </FlexBox>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Szukaj kursów..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          {filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {availableCourses.length === 0 ? (
                <>
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Wszystkie kursy są już przypisane do tej grupy</p>
                </>
              ) : (
                <>
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nie znaleziono kursów</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleCourse(course.id)}
                >
                  <Checkbox
                    checked={selectedCourses.includes(course.id)}
                    onCheckedChange={() => toggleCourse(course.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {course.icon_emoji && (
                        <span className="text-xl">{course.icon_emoji}</span>
                      )}
                      <span className="font-medium">{course.title}</span>
                    </div>
                    {course.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedCourses.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Wybrano {selectedCourses.length} kursów do przypisania
              </p>
              <FlexBox>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/groups/show/${id}`)}
                >
                  Anuluj
                </Button>
                <Button onClick={handleSubmit} disabled={isAssigning}>
                  {isAssigning ? "Przypisywanie..." : "Przypisz kursy"}
                </Button>
              </FlexBox>
            </div>
          )}
        </CardContent>
      </Card>
    </SubPage>
  );
};
