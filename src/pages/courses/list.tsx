// pages/courses/list.tsx
import { useTable, useNavigation, useDelete } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  FileText,
  MoreVertical,
  Layout,
  Sparkles,
  Brain,
  Clock,
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { PaginationSwith } from "@/components/navigation";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";
import { Badge, Button, Input } from "@/components/ui";
import { SubPage } from "@/components/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePublishToggle } from "./hooks";
import { toast } from "sonner";

interface Course {
  id: number;
  title: string;
  description?: string;
  icon_emoji?: string;
  is_published: boolean;
  created_at: string;
  vendor_id: number;
  topics?: Array<{ count: number }>;
  course_access?: Array<{ count: number }>;
}

export const CoursesList = () => {
  const { create, edit, show } = useNavigation();
  const { mutate: deleteCourse } = useDelete();
  const { togglePublish } = usePublishToggle("courses");

  const {
    tableQuery: { data, isLoading, isError, refetch },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable<Course>({
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
    meta: {
      select: "*, topics(count), course_access(count)",
    },
  });

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Czy na pewno chcesz usunąć kurs "${title}"?`)) {
      deleteCourse(
        {
          resource: "courses",
          id,
        },
        {
          onSuccess: () => {
            toast.success("Kurs został usunięty");
            refetch();
          },
        }
      );
    }
  };

  const handleNavigateToWizard = (
    wizardPath: string,
    courseId?: number,
    courseTitle?: string
  ) => {
    if (courseId && courseTitle) {
      sessionStorage.setItem(
        "wizardContext",
        JSON.stringify({
          courseId,
          courseTitle,
        })
      );
    }
    window.location.href = wizardPath;
  };

  return (
    <SubPage>
      <FlexBox>
        <Lead title="Kursy" description="Zarządzaj kursami w systemie" />
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleNavigateToWizard("/course-structure/step1")
                  }
                >
                  <Layout className="w-4 h-4 mr-2" />
                  <Sparkles className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Stwórz kurs z pomocą AI</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button onClick={() => create("courses")}>
            <Plus className="w-4 h-4 mr-2" />
            Dodaj kurs
          </Button>
        </div>
      </FlexBox>

      <FlexBox>
        <Input
          placeholder="Szukaj kursów..."
          className="max-w-sm"
          onChange={(e) => {
            setFilters([
              {
                field: "title",
                operator: "contains",
                value: e.target.value,
              },
            ]);
          }}
        />
      </FlexBox>

      <GridBox>
        {data?.data?.map((course) => (
          <Card
            key={course.id}
            className={`relative cursor-pointer transition-all duration-200 ${
              !course.is_published
                ? "opacity-80 hover:opacity-90 "
                : "hover:shadow-lg"
            }`}
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest('[role="menu"]')) {
                show("courses", course.id);
              }
            }}
          >
            <CardHeader>
              <FlexBox>
                <CardTitle className="flex items-center gap-2 min-w-0">
                  <span className="flex-shrink-0">
                    {course.icon_emoji ? (
                      <span className="text-2xl">{course.icon_emoji}</span>
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                  </span>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate">{course.title}</span>
                      </TooltipTrigger>
                      {course.title.length > 30 && (
                        <TooltipContent>
                          <p className="max-w-xs">{course.title}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => show("courses", course.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Podgląd
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => edit("courses", course.id)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edytuj
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        togglePublish(
                          course.id,
                          course.is_published,
                          course.title,
                          refetch
                        )
                      }
                    >
                      {course.is_published ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Ukryj kurs
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Opublikuj kurs
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        handleNavigateToWizard(
                          "/educational-material/step1",
                          course.id,
                          course.title
                        )
                      }
                      className="text-purple-600 focus:text-purple-600"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generuj materiał z AI
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleNavigateToWizard(
                          "/quiz-wizard/step1",
                          course.id,
                          course.title
                        )
                      }
                      className="text-blue-600 focus:text-blue-600"
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      Generuj quiz z AI
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(course.id, course.title)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Usuń
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </FlexBox>
            </CardHeader>
            <CardContent>
              {course.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {course.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge
                    variant={course.is_published ? "default" : "secondary"}
                    className={course.is_published ? "bg-green-600" : ""}
                  >
                    {course.is_published ? "Opublikowany" : "Szkic"}
                  </Badge>
                </div>

                <div className="flex gap-3 text-sm text-muted-foreground">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {course.topics?.[0]?.count || 0}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Liczba tematów</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.course_access?.[0]?.count || 0}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Liczba uczestników</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {course.created_at && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    Utworzono:{" "}
                    {new Date(course.created_at).toLocaleDateString("pl-PL")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </GridBox>

      {/* Karta do tworzenia nowego kursu z AI */}
      {data?.data?.length === 0 && (
        <Card className="border-dashed border-2 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <CardContent className="text-center py-12">
            <Layout className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
            <h3 className="text-lg font-semibold mb-2">Brak kursów</h3>
            <p className="text-muted-foreground mb-6">
              Rozpocznij od stworzenia pierwszego kursu
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => create("courses")}>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj ręcznie
              </Button>
              <Button
                onClick={() =>
                  handleNavigateToWizard("/course-structure/step1")
                }
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Wygeneruj z AI
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="kursów"
      />

      {/* Floating Action Button dla AI */}
      {data?.data && data.data.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  className="rounded-full shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  onClick={() =>
                    handleNavigateToWizard("/course-structure/step1")
                  }
                >
                  <Layout className="w-5 h-5 mr-2" />
                  <Sparkles className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Stwórz nowy kurs z pomocą AI</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </SubPage>
  );
};
