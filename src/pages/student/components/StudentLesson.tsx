/* path: src/pages/student/components/StudentLesson.tsx */
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Clock, Lock, Check, Circle } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/utility";
import { invalidateRPCCache } from "../hooks/useRPC";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** ==================== SKELETON ==================== */
const LessonSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
    <div className="h-5 w-24 rounded bg-muted/60" />
    <div className="rounded-2xl border bg-card p-6 shadow-soft animate-pulse">
      <div className="h-6 w-2/3 rounded bg-muted/60 mb-2" />
      <div className="h-4 w-40 rounded bg-muted/60" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-4 w-full rounded bg-muted/50" />
      ))}
    </div>
    <div className="h-12 w-56 rounded-lg bg-muted/60 ml-auto" />
  </div>
);

/** ==================== UTILS ==================== */
type Section = { id: string; title: string; content: string };

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/(^-|-$)/g, "");

const splitMarkdownIntoSections = (md: string, fallbackTitle: string): Section[] => {
  const parts = md.split(/\n(?=##\s+)/g);

  // Brak nagłówków "##" – pojedyncza sekcja
  if (parts.length <= 1 && !/^##\s+/.test(md)) {
    const title = fallbackTitle?.trim() || "Sekcja 1";
    return [{ id: slug(title) || "sekcja-1", title, content: md }];
  }

  // Podział na sekcje po "##"
  const sections: Section[] = [];
  let counter = 1;
  for (const raw of parts) {
    const m = raw.match(/^##\s+(.+?)\s*$/m);
    const title = m?.[1]?.trim() || `Sekcja ${counter}`;
    const body = raw.replace(/^##\s+.+?\n/, "");
    sections.push({
      id: slug(title) || slug(`${fallbackTitle || "sekcja"}-${counter}`) || `sekcja-${counter}`,
      title,
      content: body.trim(),
    });
    counter++;
  }
  return sections;
};

const useLocalProgress = (key: string, initial: Record<string, boolean>) => {
  const [state, setState] = React.useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Error setting local storage:", error);
    }
  }, [key, state]);
  return [state, setState] as const;
};

export const StudentLesson: React.FC = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const { data: lessonData, isLoading } = useOne({
    resource: "activities",
    id: lessonId!,
    meta: { select: "*, topics(title, course_id, courses(title, icon_emoji))" },
  });

  const lesson = (lessonData?.data ?? {}) as any;
  const md: string | undefined = (lesson?.content_md ?? lesson?.markdown ?? lesson?.content) as
    | string
    | undefined;

  const sections = React.useMemo<Section[]>(
    () => (md && typeof md === "string" ? splitMarkdownIntoSections(md, lesson?.title ?? "Sekcja") : []),
    [md, lesson?.title]
  );

  const progressKey = `lesson-progress:${lessonId}`;
  const [sectionDone, setSectionDone] = useLocalProgress(
    progressKey,
    Object.fromEntries((sections ?? []).map((s) => [s.id, false]))
  );

  React.useEffect(() => {
    if (!sections.length) return;
    setSectionDone((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const s of sections) if (!(s.id in next)) (next[s.id] = false), (changed = true);
      for (const k of Object.keys(next))
        if (!sections.some((s) => s.id === k)) (delete next[k], (changed = true));
      return changed ? next : prev;
    });
  }, [sections, setSectionDone]);

  const firstUnreadIdx = sections.findIndex((s) => !sectionDone[s.id]);
  const allChecked = firstUnreadIdx === -1;

  const toggleSection = (idx: number) => {
    const s = sections[idx];
    if (!s) return;
    const unlocked = firstUnreadIdx === -1 || idx <= firstUnreadIdx;
    if (!unlocked && !sectionDone[s.id]) return;
    setSectionDone((prev) => ({ ...prev, [s.id]: !prev[s.id] }));
  };

  const handleCompleteLesson = async () => {
    if (!allChecked) {
      toast.info("Najpierw odhacz wszystkie sekcje po kolei.");
      return;
    }
    try {
      await supabaseClient.rpc("start_activity", { p_activity_id: parseInt(lessonId!) });
      const { data: result, error } = await supabaseClient.rpc("complete_material", {
        p_activity_id: parseInt(lessonId!),
      });
      if (error) throw error;
      if (result) {
        toast.success("Lekcja ukończona!");
        invalidateRPCCache("get_course_structure");
        invalidateRPCCache("get_my_courses");
        try {
          localStorage.removeItem(progressKey);
        } catch (error) {
          console.error(error);
          toast.error("Nie udało się ukończyć lekcji");
        }
        navigate(`/student/courses/${courseId}`);
      }
    } catch {
      toast.error("Nie udało się ukończyć lekcji");
    }
  };

  // Live region do komunikatów a11y
  const liveRef = React.useRef<HTMLDivElement | null>(null);
  const announce = (msg: string) => {
    if (!liveRef.current) return;
    liveRef.current.textContent = "";
    // niewielkie opóźnienie, aby SR wyłapał zmianę
    setTimeout(() => {
      if (liveRef.current) liveRef.current.textContent = msg;
    }, 50);
  };

  React.useEffect(() => {
    // Ogłaszaj postęp
    const doneCount = Object.values(sectionDone).filter(Boolean).length;
    if (sections.length) {
      announce(`Postęp: ${doneCount} z ${sections.length} sekcji ukończonych.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sectionDone), sections.length]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28 lg:pb-14">
      {/* Hidden live region for screen readers */}
      <div
        ref={liveRef}
        aria-live="polite"
        className="sr-only"
      />

      {/* BACK */}
      <button
        onClick={() => navigate(`/student/courses/${courseId}`)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors not-prose"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Powrót do kursu</span>
      </button>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border not-prose">
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

        <div className="relative z-10 p-4 sm:p-6 md:p-8">
          <div className="flex items-start gap-3">
            <div className="text-4xl md:text-5xl leading-none">
              {lesson?.topics?.courses?.icon_emoji || "📚"}
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                <span className="truncate">{lesson?.topics?.courses?.title || "…"}</span>
                <span>•</span>
                <span className="truncate">{lesson?.topics?.title || "…"}</span>
              </div>
              <h1 className="mt-1 text-xl md:text-3xl font-bold tracking-tight text-foreground">
                {lesson?.title || "Ładowanie…"}
              </h1>
              {lesson?.duration_min && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1.5 shadow-soft">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">{lesson?.duration_min} min czytania</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* GRID: CONTENT + TOC */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
        {/* CONTENT */}
        <main>
          {isLoading ? (
            <LessonSkeleton />
          ) : (
            <section>
              {/* Utrzymujemy otoczkę .prose na całej kolumnie */}
              <div className="prose prose-neutral dark:prose-invert max-w-[68ch] mx-auto prose-headings:font-semibold prose-p:text-muted-foreground">
                {sections.length > 0 ? (
                  sections.map((s, idx) => {
                    const isDone = !!sectionDone[s.id];
                    const unlocked = firstUnreadIdx === -1 || idx <= firstUnreadIdx;
                    const futureLocked = !unlocked && !isDone;
                    const isCurrentToCheck = idx === firstUnreadIdx && !isDone;

                    const actionTitle = futureLocked
                      ? "Najpierw ukończ poprzednie sekcje"
                      : isDone
                      ? "Sekcja odhaczona — kliknij, aby cofnąć"
                      : "Odhacz tę sekcję";

                    return (
                      <div
                        key={s.id}
                        id={s.id}
                        className="mb-10 scroll-mt-24 sm:scroll-mt-28 lg:scroll-mt-32"
                      >
                        {/* KARTA SEKCJI */}
                        <div
                          className={`rounded-2xl border bg-card p-4 sm:p-5 md:p-6 shadow-soft ${
                            futureLocked ? "opacity-75" : ""
                          }`}
                        >
                          {/* Pasek nagłówka */}
                          <div className="not-prose flex items-start sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              {!unlocked && !isDone && (
                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                                  <Lock className="h-3.5 w-3.5" />
                                  Zablokowana
                                </span>
                              )}
                              <h2 className="text-xl md:text-2xl font-semibold tracking-tight m-0">
                                {s.title || `Sekcja ${idx + 1}`}
                              </h2>
                            </div>
                          </div>

                          {/* Treść markdown */}
                          <div className={futureLocked ? "pointer-events-none select-none" : ""}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content}</ReactMarkdown>
                          </div>

                          {/* ====== LEPSZY CHECKBOX ====== */}
                          <div className="not-prose mt-5 flex items-start justify-end">
                            <div className="flex flex-col items-end gap-1">
                              <label
                                className={`inline-flex items-center gap-3 max-w-full ${
                                  futureLocked ? "cursor-not-allowed" : "cursor-pointer"
                                }`}
                                title={actionTitle}
                              >
                                {/* Natywny input dla a11y i klawiatury */}
                                <input
                                  type="checkbox"
                                  aria-label={`Odhacz sekcję: ${s.title || `Sekcja ${idx + 1}`}`}
                                  className="peer sr-only"
                                  checked={isDone}
                                  onChange={() => {
                                    if (futureLocked) return;
                                    toggleSection(idx);
                                    const msg = !isDone
                                      ? `Sekcja ${idx + 1} odhaczona.`
                                      : `Sekcja ${idx + 1} cofnięta.`;
                                    announce(msg);
                                  }}
                                  disabled={futureLocked && !isDone}
                                  aria-disabled={futureLocked && !isDone}
                                  id={`chk-${s.id}`}
                                  aria-describedby={`hint-${s.id}`}
                                />

                                {/* Wizualny przycisk */}
                                <span
                                  role="presentation"
                                  className={[
                                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                                    "shadow-soft",
                                    "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring",
                                    "peer-disabled:opacity-60 peer-disabled:pointer-events-none",
                                    isDone
                                      ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                                      : futureLocked
                                      ? "bg-muted/40 border-muted-foreground/20 text-muted-foreground"
                                      : "bg-background hover:bg-muted border-muted-foreground/30",
                                  ].join(" ")}
                                >
                                  {futureLocked ? (
                                    <Lock className="h-4 w-4" />
                                  ) : isDone ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Circle className="h-4 w-4" />
                                  )}
                                  <span className="whitespace-nowrap">
                                    {String(idx + 1).padStart(2, "0")} •{" "}
                                    {futureLocked ? "Zablokowana" : isDone ? "Odhaczono" : "Odhacz sekcję"}
                                  </span>
                                </span>
                              </label>

                              {isCurrentToCheck && (
                                <span id={`hint-${s.id}`} className="text-xs text-muted-foreground">
                                  Zaznacz, aby przejść dalej
                                </span>
                              )}
                            </div>
                          </div>
                          {/* ====== /LEPSZY CHECKBOX ====== */}
                        </div>

                        <hr className="my-8" />
                      </div>
                    );
                  })
                ) : md && typeof md === "string" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: (lesson?.content as string) || "" }} />
                )}
              </div>

              {/* PRZYCISK UKOŃCZ LEKCJĘ */}
              {!isLoading && sections.length > 0 && (
                <div className="not-prose mt-8 flex justify-end">
                  <button
                    onClick={handleCompleteLesson}
                    className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-soft hover:bg-muted transition-colors disabled:opacity-60"
                    disabled={!allChecked}
                    aria-disabled={!allChecked}
                    title={!allChecked ? "Najpierw odhacz wszystkie sekcje" : undefined}
                  >
                    Zakończ lekcję
                  </button>
                </div>
              )}
            </section>
          )}
        </main>

        {/* TOC po prawej */}
        <aside className="not-prose">
          <nav className="border rounded-lg p-4 bg-background/60 lg:sticky lg:top-28">
            <h2 className="text-sm font-semibold mb-2">Spis treści</h2>
            {isLoading ? (
              <div className="h-4 w-40 rounded bg-muted/60 animate-pulse" />
            ) : sections.length > 0 ? (
              <ol className="space-y-1 text-sm">
                {sections.map((s, idx) => {
                  const isDone = !!sectionDone[s.id];
                  const unlocked = firstUnreadIdx === -1 || idx <= firstUnreadIdx;
                  return (
                    <li key={s.id} className="flex items-center gap-1">
                      {!unlocked && !isDone ? (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : isDone ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <span className="h-3.5 w-3.5" />
                      )}
                      <a
                        href={`#${s.id}`}
                        className={`flex-1 block px-2 py-1 rounded hover:bg-muted transition-colors ${
                          isDone
                            ? "text-emerald-700"
                            : unlocked
                            ? ""
                            : "text-muted-foreground pointer-events-none"
                        }`}
                        aria-disabled={!unlocked && !isDone}
                      >
                        {String(idx + 1).padStart(2, "0")}. {s.title || `Sekcja ${idx + 1}`}
                      </a>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">Brak sekcji.</p>
            )}
          </nav>
        </aside>
      </div>
    </div>
  );
};
