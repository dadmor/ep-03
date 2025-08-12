// src/pages/student/quizzes/result.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Trophy, Clock, Target, Zap, ArrowRight, RefreshCw, TrendingUp, Flame, Brain, Diamond } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utility";

interface QuizResult {
  score: number;
  passed: boolean;
  points_earned: number;
  time_spent: number;
  passing_score: number;
  max_attempts?: number;
  attempts_used?: number;
  // Dodatkowe dane z calculate_quiz_points
  base_points?: number;
  multipliers?: {
    quiz_multiplier?: number;
    streak_multiplier?: number;
    min_points?: number;
  };
  perfect_bonus?: number;
  streak_days?: number;
}

export const QuizResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, quizId, result } = location.state as {
    courseId: string;
    quizId: string;
    result: QuizResult;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getBasePoints = (score: number): number => {
    if (score < 30) return 1;
    if (score < 50) return 2;
    if (score < 70) return 5;
    return 10 + Math.floor((score - 70) / 3);
  };

  const canRetry = result.max_attempts && (result.attempts_used ?? 0) < result.max_attempts;
  const isPerfect = result.score === 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border bg-card p-6 md:p-8 shadow-soft"
      >
        {/* Status */}
        <div className="text-center mb-6">
          <div className={cn(
            "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
            result.passed ? "bg-green-100" : "bg-orange-100"
          )}>
            <Trophy className={cn(
              "w-8 h-8",
              result.passed ? "text-green-600" : "text-orange-600"
            )} />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            {result.passed ? "Quiz zaliczony!" : "Niezaliczone, ale zdobywasz punkty!"}
          </h1>
          
          <p className="text-muted-foreground">
            {result.passed 
              ? isPerfect ? "Perfekcyjny wynik! Jesteś mistrzem!" : "Gratulacje! Świetnie Ci poszło."
              : `Zdobywasz ${result.points_earned} punktów za swoją próbę!`}
          </p>
        </div>

        {/* Wynik główny */}
        <div className="bg-muted/50 rounded-xl p-6 mb-6">
          <div className="text-center">
            <div className={cn(
              "text-5xl font-bold mb-2",
              getScoreColor(result.score)
            )}>
              {result.score}%
            </div>
            <p className="text-sm text-muted-foreground">Twój wynik</p>
          </div>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="font-semibold text-lg">{result.points_earned}</span>
            </div>
            <p className="text-xs text-muted-foreground">Punktów zdobytych</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{formatTime(result.time_spent)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Czas</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="font-semibold">{result.passing_score}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Próg zaliczenia</p>
          </div>
        </div>

        {/* Szczegółowe obliczenie punktów */}
        <div className={cn(
          "rounded-lg p-4 mb-6",
          result.points_earned > 0 ? "bg-primary/5" : "bg-muted/50"
        )}>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Jak obliczyliśmy Twoje punkty:
          </h3>
          
          <div className="space-y-2 text-sm">
            {/* Punkty bazowe */}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Punkty bazowe za wynik {result.score}%:
              </span>
              <span className="font-medium tabular-nums">
                {result.base_points || getBasePoints(result.score)} pkt
              </span>
            </div>

            {/* Mnożnik z ulepszeń */}
            {result.multipliers?.quiz_multiplier && result.multipliers.quiz_multiplier > 1 && (
              <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  Ulepszenie "Szybki umysł":
                </span>
                <span className="font-medium">
                  ×{result.multipliers.quiz_multiplier}
                </span>
              </div>
            )}

            {/* Bonus za streak */}
            {result.streak_days && result.streak_days > 0 && result.multipliers?.streak_multiplier && (
              <div className="flex justify-between items-center text-orange-600 dark:text-orange-400">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Streak {result.streak_days} dni:
                </span>
                <span className="font-medium">
                  ×{result.multipliers.streak_multiplier.toFixed(1)}
                </span>
              </div>
            )}

            {/* Bonus za perfekcję */}
            {isPerfect && result.perfect_bonus && result.perfect_bonus > 0 && (
              <div className="flex justify-between items-center text-purple-600 dark:text-purple-400">
                <span className="flex items-center gap-1">
                  <Diamond className="w-3 h-3" />
                  Bonus perfekcjonisty:
                </span>
                <span className="font-medium">
                  +{result.perfect_bonus} pkt
                </span>
              </div>
            )}

            {/* Minimalne punkty z ulepszeń */}
            {result.multipliers?.min_points && result.score < 30 && (
              <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Gwarancja "Druga szansa":
                </span>
                <span className="font-medium">
                  min. {result.multipliers.min_points} pkt
                </span>
              </div>
            )}

            {/* Separator i suma */}
            <div className="pt-2 mt-2 border-t border-border/50">
              <div className="flex justify-between items-center font-semibold">
                <span>Łącznie zdobywasz:</span>
                <span className="text-lg text-primary">
                  {result.points_earned} punktów
                </span>
              </div>
            </div>
          </div>

          {/* Wskazówka o ulepszeniach */}
          {(!result.multipliers?.quiz_multiplier || result.multipliers.quiz_multiplier === 1) && (
            <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                💡 Wskazówka: Kup ulepszenia w zakładce Idle aby zwiększyć punkty z quizów!
              </p>
            </div>
          )}
        </div>

        {/* Motywacja dla niezaliczonych */}
        {!result.passed && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-sm mb-1 text-blue-700 dark:text-blue-400">
              Nie poddawaj się! 💪
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              {result.score >= 60 
                ? `Świetnie Ci idzie! Brakuje tylko ${result.passing_score - result.score}% do zaliczenia.`
                : result.score >= 40
                ? "Już prawie połowa! Przejrzyj materiały i spróbuj ponownie."
                : "Każda próba to krok naprzód. Wróć do materiałów i próbuj dalej!"}
            </p>
          </div>
        )}

        {/* Akcje */}
        <div className="flex gap-3">
          {result.passed ? (
            <button
              onClick={() => navigate(`/student/courses/${courseId}`)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-primary-foreground hover:bg-primary/90 focus-ring"
            >
              Kontynuuj kurs
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              {canRetry ? (
                <button
                  onClick={() => navigate(`/student/courses/${courseId}/quiz/${quizId}`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-primary-foreground hover:bg-primary/90 focus-ring"
                >
                  <RefreshCw className="w-4 h-4" />
                  Spróbuj ponownie
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/student/courses/${courseId}`)}
                  className="flex-1 rounded-lg border px-4 py-2.5 hover:bg-muted/50 focus-ring"
                >
                  Wróć do kursu
                </button>
              )}
            </>
          )}
          
          <button
            onClick={() => navigate("/student/dashboard")}
            className="px-4 py-2.5 rounded-lg border hover:bg-muted/50 focus-ring"
          >
            Dashboard
          </button>
        </div>

        {/* Info o próbach */}
        {result.max_attempts && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Wykorzystane próby: {result.attempts_used} z {result.max_attempts}
          </p>
        )}
      </motion.div>

      {/* Easter egg dla 100% */}
      {isPerfect && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-muted-foreground">
            🎯 Mistrzostwo! Twoja wiedza jest imponująca!
          </p>
        </motion.div>
      )}
    </div>
  );
};