/* path: src/components/StudentDashboard.tsx */
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Flame,
  TrendingUp,
  Trophy,
  Gift,
  Star,
  ArrowRight,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/utility";
import { useStudentStats } from "../hooks";
import { useRPC } from "../hooks/useRPC";
import {
  AnimatedCard,
  AnimatedProgress,
  AnimatedCounter,
  motion,
} from "./motion";

/**
 * Uwaga:
 * - Usunięty wewnętrzny <header> (by nie dublować z layoutem).
 * - Dodane dolne odstępy pod kontentem (pb-24), żeby nie wjeżdżać pod bottom-nav na mobile.
 * - W HERO "Punkty" znowu są bohaterem.
 * - Sekcja kursów wyeksponowana wyżej i szerzej.
 */

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<any>();
  const { stats, refetch: refetchStats } = useStudentStats();
  const { data: coursesData } = useRPC<any[]>("get_my_courses");
  const [claimablePoints, setClaimablePoints] = React.useState(0);

  const courses = coursesData || [];

  React.useEffect(() => {
    const checkRewards = async () => {
      try {
        const { data } = await supabaseClient.rpc("check_claimable_rewards");
        setClaimablePoints(data?.claimable_points || 0);
      } catch {
        /* pasywnie */
      }
    };
    checkRewards();
    const interval = setInterval(checkRewards, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleClaimRewards = async () => {
    try {
      const { data: result, error } = await supabaseClient.rpc(
        "claim_daily_rewards"
      );
      if (error) throw error;
      if (result) {
        toast.success(`Odebrano ${result.total_earned} punktów`);
        refetchStats();
        setClaimablePoints(0);
      }
    } catch {
      toast.error("Nie można odebrać nagród");
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-8 pb-24 lg:pb-8">
      {/* ========================= HERO: PUNKTY ========================= */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl border"
      >
        {/* Brandowane tło hero */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.12] via-secondary/[0.10] to-accent/[0.12]" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--ring)/0.35) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--ring)/0.35) 1px, transparent 1px)
              `,
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 p-6 md:p-8">
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            {/* Lewa: info + streak + claim */}
            <div className="md:col-span-4 space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Twoje tempo nauki
              </h2>
              {stats.streak > 0 && (
                <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1.5 shadow-soft">
                  <Flame className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">
                    Seria: {stats.streak} dni
                  </span>
                </div>
              )}
              {claimablePoints > 0 && (
                <button
                  onClick={handleClaimRewards}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus-ring"
                >
                  <Gift className="h-4 w-4" />
                  Odbierz {claimablePoints} pkt
                </button>
              )}
            </div>

            {/* Prawa: liczby – punkty głównym bohaterem */}
            <div className="md:col-span-8">
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                {/* PUNKTY */}
                <div className="rounded-xl border bg-card p-5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Punkty
                    </span>
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl md:text-5xl font-semibold tabular-nums text-primary leading-none">
                      <AnimatedCounter value={stats.points} />
                    </span>
                    <span className="mb-[2px] text-sm text-muted-foreground">
                      pkt
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    +<AnimatedCounter value={stats.idle_rate} />/h
                  </p>
                </div>

                {/* POZIOM */}
                <div className="rounded-xl border bg-card p-5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Poziom
                    </span>
                    <Star className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-4xl md:text-5xl font-semibold text-secondary leading-none">
                      {stats.level}
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-secondary transition-all"
                      style={{ width: `${stats.points % 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Do kolejnego: {100 - (stats.points % 100)} pkt
                  </p>
                </div>

                {/* TEMPO */}
                <div className="rounded-xl border bg-card p-5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Tempo
                    </span>
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl md:text-5xl font-semibold text-accent leading-none">
                      +<AnimatedCounter value={stats.idle_rate} />
                    </span>
                    <span className="mb-[2px] text-sm text-muted-foreground">
                      pkt/h
                    </span>
                  </div>
                  <button
                    onClick={() => navigate("/student/gamification")}
                    className="mt-3 w-full rounded-lg border px-3 py-2 hover:bg-primary/5 focus-ring"
                  >
                    Gamifikacja
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ========================= KURSY (PRIORYTET) ========================= */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
              Twoje kursy
            </h3>
            <p className="text-sm text-muted-foreground">
              To jest Twoja główna ścieżka — kontynuuj naukę tam, gdzie skończyłeś.
            </p>
          </div>
          <button
            onClick={() => navigate("/student/courses")}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-primary/5 focus-ring"
          >
            Zobacz wszystkie <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.slice(0, 9).map((course: any) => {
            const completed = course.progress_percent === 100;
            return (
              <div
                key={course.course_id}
                className="group relative rounded-2xl border bg-card p-5 shadow-soft hover:bg-muted/40 transition-colors"
              >
                {/* Tytuł + status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-3xl shrink-0 leading-none">
                      {course.icon_emoji || "📚"}
                    </span>
                    <h4 className="font-semibold text-foreground line-clamp-2">
                      {course.title}
                    </h4>
                  </div>

                  {completed ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400 px-2.5 py-1 text-[11px] font-semibold">
                      Ukończono
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 text-primary px-2.5 py-1 text-[11px] font-semibold">
                      {course.progress_percent}%
                    </span>
                  )}
                </div>

                {/* Progres */}
                <div className="mt-4">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        completed ? "bg-green-600" : "bg-primary"
                      }`}
                      style={{ width: `${course.progress_percent || 0}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Ukończono</span>
                    <span className="font-medium text-foreground">
                      {course.completed_lessons || 0}/{course.total_lessons || 10} lekcji
                    </span>
                  </div>
                </div>

                {/* Następna aktywność */}
                {course.next_activity && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2">
                    <Play className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium truncate">
                      {course.next_activity}
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-4 flex items-center justify-between">
                  {course.points_available ? (
                    <span className="inline-flex rounded-md bg-orange-500/10 text-[11px] font-semibold px-2 py-1 text-orange-600">
                      +{course.points_available} pkt
                    </span>
                  ) : (
                    <span />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/student/courses/${course.course_id}`)
                      }
                      className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus-ring"
                    >
                      Kontynuuj
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/student/courses/${course.course_id}`)
                      }
                      className="rounded-lg border px-3 py-2 hover:bg-primary/5 focus-ring"
                      title="Szczegóły"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {courses.length === 0 && (
            <div className="col-span-full rounded-2xl border bg-card p-10 text-center shadow-soft">
              <div className="text-5xl">🚀</div>
              <h4 className="mt-4 text-lg font-semibold">Zacznij swoją przygodę</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Dołącz do kursu i odkryj nowy sposób nauki.
              </p>
              <button
                onClick={() => navigate("/student/courses")}
                className="mt-6 rounded-lg bg-secondary px-5 py-2.5 text-white hover:opacity-95 focus-ring"
              >
                Odkryj kursy
              </button>
            </div>
          )}
        </div>
      </motion.section>

      {/* ========================= DODATKOWE STATY (DRUGI PLAN) ========================= */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <AnimatedCard className="rounded-xl border bg-card p-5 hover:bg-primary/3 hover-lift shadow-soft">
          <div className="flex items-start justify-between">
            <span className="text-sm text-muted-foreground">Punkty</span>
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">
            <AnimatedCounter value={stats.points} />
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            +<AnimatedCounter value={stats.idle_rate} />/h
          </p>
        </AnimatedCard>

        <AnimatedCard className="rounded-xl border bg-card p-5 hover:bg-secondary/5 hover-lift shadow-soft">
          <div className="flex items-start justify-between">
            <span className="text-sm text-muted-foreground">Poziom</span>
            <Trophy className="h-4 w-4 text-secondary" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-secondary">
            {stats.level}
          </p>
          <div className="mt-3">
            <AnimatedProgress value={stats.points % 100} />
          </div>
        </AnimatedCard>

        <AnimatedCard className="rounded-xl border bg-card p-5 hover:bg-destructive/5 hover-lift shadow-soft">
          <div className="flex items-start justify-between">
            <span className="text-sm text-muted-foreground">Seria dni</span>
            <Flame className="h-4 w-4 text-destructive" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-destructive">
            {stats.streak}
          </p>
          <p className="text-xs text-muted-foreground mt-1">dni z rzędu</p>
        </AnimatedCard>

        <AnimatedCard className="rounded-xl border bg-card p-5 hover:bg-accent/5 hover-lift shadow-soft">
          <div className="flex items-start justify-between">
            <span className="text-sm text-muted-foreground">Tempo</span>
            <TrendingUp className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-accent">
            +<AnimatedCounter value={stats.idle_rate} />
          </p>
          <p className="text-xs text-muted-foreground mt-1">punktów/h</p>
        </AnimatedCard>
      </motion.div>
    </div>
  );
};
