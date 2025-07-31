// src/pages/student/components/StudentCourses.tsx - POPRAWIONY
import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubPage } from "@/components/layout";
import { GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { CourseCard } from "./CourseCard";
import { useRPC } from "../hooks/useRPC";

export const StudentCourses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const { data: coursesData, isLoading } = useRPC<any[]>('get_my_courses');

  const filteredCourses = React.useMemo(() => {
    if (!coursesData || !searchTerm) return coursesData || [];
    
    return coursesData.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [coursesData, searchTerm]);

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <div className="space-y-6">
        <Lead
          title="Moje kursy"
          description="Wybierz kurs i kontynuuj naukę"
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Szukaj kursów..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <GridBox>
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.course_id}
              course={{
                id: course.course_id,
                title: course.title,
                emoji: course.icon_emoji || '📚',
                progress: course.progress_percent || 0,
                lastActivity: course.last_activity 
                  ? new Date(course.last_activity).toLocaleDateString('pl-PL')
                  : null
              }}
              onClick={() => navigate(`/student/courses/${course.course_id}`)}
            />
          ))}
        </GridBox>

        {(!filteredCourses || filteredCourses.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                {searchTerm ? "Nie znaleziono kursów" : "Nie masz jeszcze żadnych kursów"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </SubPage>
  );
};