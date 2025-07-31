// src/pages/student/components/StudentQuiz.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ChevronLeft, Clock, AlertCircle, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { SubPage } from "@/components/layout";
import { FlexBox } from "@/components/shared";
import { toast } from "sonner";
import { supabaseClient } from "@/utility";

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
          // Parsuj JSON jeśli to string lub użyj bezpośrednio jeśli to już tablica
          const parsedQuestions = typeof questionsData === 'string' 
            ? JSON.parse(questionsData) 
            : questionsData;
          
          console.log("Questions data:", parsedQuestions);
          // Dodajmy też log pierwszego pytania żeby zobaczyć strukturę opcji
          if (parsedQuestions && parsedQuestions.length > 0) {
            console.log("First question options:", parsedQuestions[0].options);
          }
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

      console.log("Submitting answers:", answersArray);

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
        
        // Dodaj parametr do URL żeby wymusić odświeżenie
        navigate(`/student/courses/${courseId}?refresh=true`);
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
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  return (
    <SubPage>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Nawigacja */}
        <FlexBox>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/student/courses/${courseId}`)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Powrót do kursu
          </Button>

          {timeLeft !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
          )}
        </FlexBox>

        {/* Nagłówek */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{quiz?.title}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="default">Quiz</Badge>
            <span className="text-sm text-muted-foreground">
              Pytanie {currentQuestion + 1} z {questions.length}
            </span>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2" />

        {/* Pytanie */}
        {currentQ && questions.length > 0 ? (
          <Card>
            <CardHeader>
              <FlexBox>
                <CardTitle className="text-xl">{currentQ.question}</CardTitle>
                <Badge variant="secondary">{currentQ.points} pkt</Badge>
              </FlexBox>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={String(answers[currentQ.id] || '')}
                onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
              >
                {currentQ.options && Array.isArray(currentQ.options) && currentQ.options.map((option) => (
                  <div key={`option-${currentQ.id}-${option.id}`} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={String(option.id)} 
                      id={`radio-${currentQ.id}-${option.id}`} 
                    />
                    <Label 
                      htmlFor={`radio-${currentQ.id}-${option.id}`} 
                      className="flex-1 cursor-pointer py-2"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {!answers[currentQ.id] && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Wybierz odpowiedź</span>
                </div>
              )}
            </CardContent>
          </Card>
        ) : questions.length === 0 && !questionsLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nie znaleziono pytań dla tego quizu</p>
            </CardContent>
          </Card>
        ) : null}

        {/* Nawigacja między pytaniami */}
        <FlexBox>
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Poprzednie
          </Button>

          <div className="flex gap-2">
            {questions.map((question, index) => (
              <button
                key={`nav-${question.id}-${index}`}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  index === currentQuestion
                    ? 'border-primary bg-primary text-white'
                    : answers[question.id]
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[currentQ?.id]}
            >
              Następne
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length < questions.length}
              variant="default"
            >
              {isSubmitting ? "Przesyłanie..." : "Zakończ quiz"}
            </Button>
          )}
        </FlexBox>
      </div>
    </SubPage>
  );
};