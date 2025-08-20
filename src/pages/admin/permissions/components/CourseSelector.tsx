// src/pages/admin/permissions/components/CourseSelector.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Badge,
  Alert,
  AlertDescription,
  Skeleton,
} from "@/components/ui";
import { BookOpen, AlertCircle, Eye, EyeOff } from "lucide-react";
import type { Course } from "../assign";

interface CourseSelectorProps {
  courses: Course[];
  selectedCourse: Course | null;
  selectedCourseId: number | null;
  onCourseChange: (courseId: number) => void;
  loading: boolean;
}

export const CourseSelector = ({ 
  courses, 
  selectedCourse, 
  selectedCourseId, 
  onCourseChange, 
  loading 
}: CourseSelectorProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Wybór kursu
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-10 w-full" />
        ) : courses.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Brak dostępnych kursów. Utwórz najpierw kurs, aby móc zarządzać uprawnieniami.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center gap-3">
            <Select 
              value={selectedCourseId ? String(selectedCourseId) : undefined} 
              onValueChange={(v) => onCourseChange(Number(v))}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Wybierz kurs" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    <div className="flex items-center gap-2">
                      <span>{c.title}</span>
                      {!c.is_published && <Badge variant="secondary" className="ml-2">Szkic</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCourse && (
              <Badge variant={selectedCourse.is_published ? "default" : "secondary"} className="shrink-0">
                {selectedCourse.is_published ? (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Opublikowany
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Szkic
                  </>
                )}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
