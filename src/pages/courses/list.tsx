import { useTable, useNavigation, useDelete } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  FileText,
  MoreVertical
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
} from "@/components/ui/dropdown-menu";

interface Course {
  id: number;
  title: string;
  description?: string;
  icon_emoji?: string;
  is_published: boolean;
  created_at: string;
  vendor_id: number;
  _count?: {
    topics: number;
    course_access: number;
  };
}

export const CoursesList = () => {
  const { create, edit, show } = useNavigation();
  const { mutate: deleteCourse } = useDelete();
  
  const {
    tableQuery: { data, isLoading, isError },
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
      select: '*, topics(count), course_access(count)'
    }
  });
  
  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Czy na pewno chcesz usunąć kurs "${title}"?`)) {
      deleteCourse({
        resource: "courses",
        id,
      });
    }
  };

  return (
    <SubPage>
      <FlexBox>
        <Lead
          title="Kursy"
          description="Zarządzaj kursami w systemie"
        />
        <Button onClick={() => create("courses")}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj kurs
        </Button>
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
            className="relative cursor-pointer transition-shadow hover:shadow-lg"
            onClick={(e) => {
              // Sprawdzamy czy kliknięcie nie było w dropdown menu
              if (!(e.target as HTMLElement).closest('[role="menu"]')) {
                show("courses", course.id);
              }
            }}
          >
            <CardHeader>
              <FlexBox>
                <CardTitle className="flex items-center gap-2">
                  {course.icon_emoji && (
                    <span className="text-2xl">{course.icon_emoji}</span>
                  )}
                  {!course.icon_emoji && <BookOpen className="w-5 h-5" />}
                  <span className="truncate">{course.title}</span>
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
                    <DropdownMenuItem onClick={() => show("courses", course.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Podgląd
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => edit("courses", course.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edytuj
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(course.id, course.title)}
                      className="text-red-600"
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
                  <Badge variant={course.is_published ? "default" : "secondary"}>
                    {course.is_published ? "Opublikowany" : "Szkic"}
                  </Badge>
                </div>
                
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {course._count?.topics || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course._count?.course_access || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </GridBox>

      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="kursów"
      />
    </SubPage>
  );
};