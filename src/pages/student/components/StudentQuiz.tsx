// src/pages/student/components/StudentQuiz.tsx - REDESIGNED (część 1/2)
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { 
  ChevronLeft, 
  ChevronRight,
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  Target,
  Trophy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn, supabaseClient } from "@/utility";
import { invalidateRPCCache } from "../hooks/useRPC";

interface QuizQuestion {
  id: number;
  question: string;
  points: number;
  options: Array<{
    id: number;
    text: string;
  }>;
}

export const StudentQuiz = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = React.useState(true);

  // Pobierz dane quizu
  const { data: quizData, isLoading: quizLoading } = useOne({
    resource: "activities",
    id: quizId!,
    meta: {
      select: "*, topics(title, course_id, courses(title, icon_emoji))"
    }
  });

  // Pobierz pytania i rozpocznij quiz
  React.useEffect(() => {
    const initQuiz = async () => {
      if (!quizId) return;

      try {
        // Rozpocznij quiz
        const { error: startError } = await supabaseClient.rpc('start_activity', {
          p_activity_id: parseInt(quizId)
        });

        if (startError) {
          console.error("Error starting quiz:", startError);
          toast.error("Nie udało się rozpocząć quizu", {
            icon: <XCircle size={24} />
          });
        }

        // Pobierz pytania
        setQuestionsLoading(true);
        const { data: questionsData, error: questionsError } = await supabaseClient.rpc(
          'get_quiz_questions',
          { p_activity_id: parseInt(quizId) }
        );

        if (questionsError) {
          console.error("Error fetching questions:", questionsError);
          toast.error("Nie udało się pobrać pytań", {
            icon: <XCircle size={24} />
          });
        } else {
          const parsedQuestions = typeof questionsData === 'string' 
            ? JSON.parse(questionsData) 
            : questionsData;
          
          setQuestions(Array.isArray(parsedQuestions) ? parsedQuestions : []);
        }
      } catch (error) {
        console.error("Quiz init error:", error);
        toast.error("Błąd podczas ładowania quizu", {
          icon: <XCircle size={24} />
        });
      } finally {
        setQuestionsLoading(false);
      }
    };

    initQuiz();
  }, [quizId]);

  // Timer
  React.useEffect(() => {
    if (quizData?.data?.time_limit && timeLeft === null) {
      setTimeLeft(quizData.data.time_limit * 60);
    }
  }, [quizData]);

  React.useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const quiz = quizData?.data;

  const handleAnswer = (questionId: number, optionId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, optionId]) => ({
        question_id: parseInt(questionId),
        option_id: optionId
      }));

      const { data: result, error } = await supabaseClient.rpc('finish_quiz', {
        p_activity_id: parseInt(quizId!),
        p_answers: answersArray
      });

      if (error) {
        throw error;
      }

      if (result) {
        const { score, passed, points_earned } = result;
        
        if (passed) {
          toast.success(`Quiz zaliczony! Wynik: ${score}%`, {
            description: `Zdobyłeś ${points_earned} punktów!`,
            icon: <CheckCircle size={24} />
          });
        } else {
          toast.warning(`Quiz niezaliczony. Wynik: ${score}%`, {
            description: `Wymagane minimum ${quiz?.passing_score || 70}% do zaliczenia. Spróbuj ponownie!`,
            icon: <AlertTriangle size={24} />
          });
        }
        
        invalidateRPCCache('get_course_structure');
        
        setTimeout(() => {
          navigate(`/student/courses/${courseId}`);
        }, 500);
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error("Nie udało się przesłać odpowiedzi", {
        description: error.message,
        icon: <XCircle size={24} />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (quizLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/student/courses/${courseId}`)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Zakończ quiz
            </Button>

            <div className="flex items-center gap-6">
              {/* Timer */}
              {timeLeft !== null && (
                <motion.div 
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full",
                    timeLeft < 60 ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"
                  )}
                  animate={timeLeft < 60 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-medium">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </motion.div>
              )}

              {/* Progress */}
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">
                  {answeredCount}/{questions.length}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Quiz Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge className="mb-4" variant="secondary">
            <Zap className="w-3 h-3 mr-1" />
            {quiz?.topics?.courses?.title}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz?.title}</h1>
          <p className="text-gray-600">
            Pytanie {currentQuestion + 1} z {questions.length}
          </p>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {currentQ && questions.length > 0 ? (
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1">
                  <CardHeader className="bg-white rounded-t-[calc(0.75rem-1px)] pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl pr-4">{currentQ.question}</CardTitle>
                      <Badge className="bg-purple-100 text-purple-700 border-0 flex-shrink-0">
                        <Trophy className="w-3 h-3 mr-1" />
                        {currentQ.points} pkt
                      </Badge>
                    </div>
                  </CardHeader>
                </div>
                
                <CardContent className="p-6">
                  <RadioGroup
                    value={String(answers[currentQ.id] || '')}
                    onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
                    className="space-y-3"
                  >
                    {currentQ.options && Array.isArray(currentQ.options) && currentQ.options.map((option, index) => (
                      <motion.div
                        key={`option-${currentQ.id}-${option.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Label
                          htmlFor={`radio-${currentQ.id}-${option.id}`}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            answers[currentQ.id] === option.id
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                          )}
                        >
                          <RadioGroupItem 
                            value={String(option.id)} 
                            id={`radio-${currentQ.id}-${option.id}`}
                            className="border-2"
                          />
                          <span className="flex-1 text-gray-900">{option.text}</span>
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>
          ) : questions.length === 0 && !questionsLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Nie znaleziono pytań dla tego quizu</p>
              </CardContent>
            </Card>
          ) : null}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Poprzednie
          </Button>

          {/* Question Dots */}
          <div className="flex gap-2">
            {questions.map((question, index) => (
              <motion.button
                key={`nav-${question.id}-${index}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentQuestion(index)}
                className={cn(
                  "w-10 h-10 rounded-full font-medium transition-all",
                  index === currentQuestion
                    ? "bg-purple-600 text-white shadow-lg"
                    : answers[question.id]
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-purple-200"
                )}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>

          {currentQuestion < questions.length - 1 ? (
            <Button
              size="lg"
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[currentQ?.id]}
              className="gap-2"
            >
              Następne
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length < questions.length}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? "Przesyłanie..." : "Zakończ quiz"}
              <Trophy className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};