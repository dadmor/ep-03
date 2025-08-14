// src/pages/student/quizzes/take.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft, ArrowRight, Clock, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn, supabaseClient } from "@/utility";
import { invalidateRPCCache } from "../hooks/useRPC";
import { useStudentStats } from "../hooks";

interface QuizQuestion {
  id: number;
  question: string;
  points: number;
  options: Array<{
    id: number;
    text: string;
  }>;
}

export const QuizTake = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { refetch: refetchStats } = useStudentStats();
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = React.useState(true);

  const { data: quizData, isLoading: quizLoading } = useOne({
    resource: "activities",
    id: quizId!,
    meta: {
      select: "*, topics(title, course_id, courses(title, icon_emoji))"
    }
  });

  React.useEffect(() => {
    const initQuiz = async () => {
      if (!quizId) return;

      try {
        await supabaseClient.rpc('start_activity', {
          p_activity_id: parseInt(quizId)
        });

        setQuestionsLoading(true);
        const { data: questionsData, error } = await supabaseClient.rpc(
          'get_quiz_questions',
          { p_activity_id: parseInt(quizId) }
        );

        if (error) throw error;

        const parsedQuestions = typeof questionsData === 'string' 
          ? JSON.parse(questionsData) 
          : questionsData;
        
        setQuestions(Array.isArray(parsedQuestions) ? parsedQuestions : []);
      } catch (error) {
        console.error("Quiz init error:", error);
        toast.error("Błąd podczas ładowania quizu");
      } finally {
        setQuestionsLoading(false);
      }
    };

    initQuiz();
  }, [quizId]);

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
  const currentQ = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

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

      console.log('Submitting quiz answers...');

      const { data: result, error } = await supabaseClient.rpc('finish_quiz', {
        p_activity_id: parseInt(quizId!),
        p_answers: answersArray
      });

      if (error) throw error;

      if (result) {
        console.log('Quiz finished successfully:', result);
        
        // Invaliduj cache - tak jak w lekcjach
        invalidateRPCCache("get_course_structure");
        invalidateRPCCache("get_my_courses");
        invalidateRPCCache("get_my_stats");
        
        // Wymuś odświeżenie statystyk z opóźnieniem
        setTimeout(() => {
          console.log('Forcing stats refresh...');
          refetchStats();
        }, 500);

        // Dodatkowe sprawdzenie po chwili (dla debugowania)
        setTimeout(async () => {
          console.log('Manually checking updated stats...');
          const { data: newStats, error: statsError } = await supabaseClient.rpc('get_my_stats');
          console.log('New stats after quiz:', newStats, 'Error:', statsError);
        }, 1000);

        // Przekieruj do wyniku
        navigate(`/student/courses/${courseId}/quiz/${quizId}/result`, {
          state: {
            courseId,
            quizId,
            result: {
              ...result,
              passing_score: quiz?.passing_score || 70,
              max_attempts: quiz?.max_attempts,
              attempts_used: quiz?.attempts || 1
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error("Nie udało się przesłać odpowiedzi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (quizLoading || questionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(`/student/courses/${courseId}`)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Zakończ quiz</span>
        </button>

        {timeLeft !== null && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
            timeLeft < 60 ? "bg-red-100 text-red-700" : "bg-muted text-foreground"
          )}>
            <Clock className="w-4 h-4" />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Quiz Info */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{quiz?.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Pytanie {currentQuestion + 1} z {questions.length}</span>
          <span>•</span>
          <span>{currentQ?.points} pkt</span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-muted rounded-full overflow-hidden mb-8">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary"
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        {currentQ && (
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-card rounded-2xl border p-8 mb-8">
              <h2 className="text-lg font-medium mb-6">
                {currentQ.question}
              </h2>
              
              <div className="space-y-3">
                {currentQ.options.map((option) => (
                  <label
                    key={option.id}
                    className={cn(
                      "block p-4 rounded-xl border-2 cursor-pointer transition-all",
                      answers[currentQ.id] === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`question-${currentQ.id}`}
                        value={option.id}
                        checked={answers[currentQ.id] === option.id}
                        onChange={() => handleAnswer(currentQ.id, option.id)}
                        className="sr-only"
                      />
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        answers[currentQ.id] === option.id
                          ? "border-primary"
                          : "border-muted-foreground"
                      )}>
                        {answers[currentQ.id] === option.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="flex-1">{option.text}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
            currentQuestion === 0
              ? "text-muted-foreground cursor-not-allowed"
              : "text-foreground hover:bg-muted"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Poprzednie
        </button>

        {/* Question Dots */}
        <div className="flex gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentQuestion
                  ? "bg-primary w-8"
                  : answers[questions[index]?.id]
                  ? "bg-muted-foreground"
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={!answers[currentQ?.id]}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
              !answers[currentQ?.id]
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            Następne
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length < questions.length}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
              isSubmitting || Object.keys(answers).length < questions.length
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            )}
          >
            {isSubmitting ? "Przesyłanie..." : "Zakończ quiz"}
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};