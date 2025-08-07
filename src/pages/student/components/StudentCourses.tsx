// src/pages/student/components/StudentCourses.tsx - REDESIGNED
import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Sparkles, TrendingUp, Clock, Award, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
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
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Twoja przygoda z nauką
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Moje kursy
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/80 max-w-2xl mx-auto"
            >
              Wybierz kurs i kontynuuj swoją edukacyjną podróż
            </motion.p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Szukaj kursów..."
              className="pl-12 pr-4 py-6 text-lg rounded-2xl border-2 border-purple-200 focus:border-purple-400 shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.course_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/student/courses/${course.course_id}`)}
              className="cursor-pointer"
            >
              <Card className="group h-full hover:scale-[1.02] transition-all duration-300 border-0 shadow-xl overflow-hidden">
                <div className="relative h-40 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  
                  {/* Course Emoji */}
                  <motion.div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    {course.icon_emoji || '📚'}
                  </motion.div>
                  
                  {/* Progress Badge */}
                  {course.progress_percent > 0 && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-purple-700 border-0">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {course.progress_percent}%
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-3 group-hover:text-purple-700 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Postęp</span>
                      <span className="font-medium text-purple-700">{course.progress_percent}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress_percent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    {course.last_activity && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(course.last_activity).toLocaleDateString('pl-PL')}</span>
                      </div>
                    )}
                    
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-600 transition-colors"
                    >
                      <Zap className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {(!filteredCourses || filteredCourses.length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? "Nie znaleziono kursów" : "Brak kursów"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm 
                ? "Spróbuj wyszukać używając innych słów kluczowych" 
                : "Nie masz jeszcze przypisanych żadnych kursów. Skontaktuj się z nauczycielem."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};