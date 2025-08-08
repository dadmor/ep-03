/* path: src/pages/student/components/StudentLesson.tsx */
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Clock, Lock, Check, Circle, X } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/utility";
import { invalidateRPCCache } from "../hooks/useRPC";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import YAML from "yaml";

/** ============== TYPES ============== */
type Section = { id: string; title: string; content: string };
type QuizDef = { question: string; options: string[]; answerIndex: number; key: string };

/** ============== UTILS ============== */
const slug = (s: string) =>
  s.toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/(^-|-$)/g, "") || "sekcja";

const splitSections = (md: string, fb: string): Section[] => {
  const parts = md.split(/\n(?=##\s+)/g);
  if (parts.length <= 1 && !/^##\s+/.test(md)) return [{ id: slug(fb || "Sekcja 1"), title: fb || "Sekcja 1", content: md }];
  return parts.map((raw, i) => {
    const m = raw.match(/^##\s+(.+?)\s*$/m);
    const title = (m?.[1] || `Sekcja ${i + 1}`).trim();
    const content = raw.replace(/^##\s+.+?\n/, "").trim();
    return { id: slug(title) || slug(`${fb}-${i + 1}`), title, content };
  });
};

const QUIZ_RE = /```quiz\s*?\n([\s\S]*?)```/g;
const parseQuiz = (raw: string, sectionId: string, idx: number): QuizDef | null => {
  try {
    const d = YAML.parse(raw) as { question?: string; options?: unknown[]; answerIndex?: number };
    const opts = (d?.options || []).map(String);
    if (!d?.question || !Array.isArray(d?.options) || typeof d?.answerIndex !== "number") return null;
    if (d.answerIndex < 0 || d.answerIndex >= opts.length) return null;
    return { question: d.question, options: opts, answerIndex: d.answerIndex, key: `${sectionId}:${idx}` };
  } catch {
    return null;
  }
};

const extractQuizzes = (sections: Section[]) =>
  new Map(
    sections.map((s) => [
      s.id,
      [...s.content.matchAll(QUIZ_RE)]
        .map((m, i) => parseQuiz(m[1], s.id, i))
        .filter(Boolean) as QuizDef[],
    ])
  );

/** ============== HOOKS ============== */
const useLocalJson = <T,>(key: string, init: T) => {
  const [state, setState] = React.useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : init;
    } catch {
      return init;
    }
  });
  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.error("Błąd zapisu do localStorage:", err);
    }
  }, [key, state]);
  return [state, setState] as const;
};

const useLiveRegion = () => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const say = (msg: string) => {
    if (!ref.current) return;
    ref.current.textContent = "";
    setTimeout(() => ref.current && (ref.current.textContent = msg), 30);
  };
  return { ref, say };
};

/** ============== MD RENDERERS (ukryj ```quiz```) ============== */
const MDRenderers = {
  code: ({ inline, className = "", children, ...p }: any) => {
    const lang = (className || "").toLowerCase();
    if (!inline && lang.includes("language-quiz")) return null;
    return (
      <code className={className} {...p}>
        {children}
      </code>
    );
  },
  pre: (props: any) => {
    const c: any = Array.isArray(props.children) ? props.children[0] : props.children;
    const cn = c?.props?.className?.toLowerCase?.() || "";
    if (cn.includes("language-quiz")) return null;
    return <pre {...props} />;
  },
};

/** ============== QUIZ MODAL ============== */
const QuizModal: React.FC<{ quiz: QuizDef; onClose: () => void; onPass: () => void }> = ({ quiz, onClose, onPass }) => {
  const [choice, setChoice] = React.useState<number | null>(null);
  const [locked, setLocked] = React.useState(false);

  const submit = () => {
    const pass = choice !== null && choice === quiz.answerIndex;
    setLocked(pass);
    if (pass) {
      toast.success("Poprawna odpowiedź!");
      setTimeout(onPass, 200);
    } else {
      toast.error("Niepoprawna odpowiedź — spróbuj ponownie.");
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-[91] w-full sm:max-w-lg bg-background rounded-t-2xl sm:rounded-2xl border shadow-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base sm:text-lg font-semibold">Pytanie kontrolne</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted" aria-label="Zamknij">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-3 text-sm sm:text-base">{quiz.question}</p>
        <div className="space-y-2 mb-4">
          {quiz.options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted">
              <input type="radio" name="quiz-choice" className="h-4 w-4" checked={choice === i} onChange={() => setChoice(i)} disabled={locked} />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
            Anuluj
          </button>
          <button onClick={submit} className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted" disabled={locked}>
            Zatwierdź
          </button>
        </div>
      </div>
    </div>
  );
};

/** ============== SKELETON ============== */
const LessonSkeleton = () => (
  <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
    <div className="h-5 w-24 rounded bg-muted/60" />
    <div className="rounded-2xl border bg-card p-6 shadow-soft animate-pulse">
      <div className="h-6 w-2/3 rounded bg-muted/60 mb-2" />
      <div className="h-4 w-40 rounded bg-muted/60" />
    </div>
    <div className="space-y-3">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-4 w-full rounded bg-muted/50" />)}</div>
    <div className="h-10 w-48 rounded-lg bg-muted/60 ml-auto" />
  </div>
);

/** ============== MAIN ============== */
export const StudentLesson: React.FC = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const { data: lessonData, isLoading } = useOne({
    resource: "activities",
    id: lessonId!,
    meta: { select: "*, topics(title, course_id, courses(title, icon_emoji))" },
  });

  const lesson = (lessonData?.data ?? {}) as any;
  const md: string | undefined = (lesson?.content_md ?? lesson?.markdown ?? lesson?.content) as string | undefined;

  const sections = React.useMemo<Section[]>(
    () => (md ? splitSections(md, lesson?.title ?? "Sekcja") : []),
    [md, lesson?.title]
  );
  const quizzes = React.useMemo(() => extractQuizzes(sections), [sections]);

  const progressKey = `lesson-progress:${lessonId}`;
  const quizKey = `lesson-quiz:${lessonId}`;

  const [sectionDone, setSectionDone] = useLocalJson<Record<string, boolean>>(
    progressKey,
    Object.fromEntries(sections.map((s) => [s.id, false]))
  );
  const [quizResults, setQuizResults] = useLocalJson<Record<string, boolean>>(quizKey, {});
  const [activeQuiz, setActiveQuiz] = React.useState<QuizDef | null>(null);

  // sync keys po zmianie sekcji
  React.useEffect(() => {
    if (!sections.length) return;
    setSectionDone((prev) => {
      const next: Record<string, boolean> = {};
      sections.forEach((s) => (next[s.id] = prev[s.id] ?? false));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map((s) => s.id).join("|")]);

  const { ref: liveRef, say } = useLiveRegion();

  const firstUnreadIdx = sections.findIndex((s) => !sectionDone[s.id]);
  const allChecked = firstUnreadIdx === -1;

  const openQuizForSection = (sid: string) => {
    const [first] = quizzes.get(sid) ?? [];
    if (first) setActiveQuiz(first);
  };

  const handleCheckboxClick = (idx: number) => {
    const s = sections[idx];
    if (!s) return;

    const unlocked = firstUnreadIdx === -1 || idx <= firstUnreadIdx;
    if (!unlocked && !sectionDone[s.id]) return;

    if (sectionDone[s.id]) {
      setSectionDone((p) => ({ ...p, [s.id]: false }));
      say(`Sekcja ${idx + 1} cofnięta.`);
      return;
    }

    const hasQuiz = (quizzes.get(s.id) ?? []).length > 0;
    if (!hasQuiz) {
      setSectionDone((p) => ({ ...p, [s.id]: true }));
      say(`Sekcja ${idx + 1} odhaczona.`);
    } else openQuizForSection(s.id);
  };

  const handlePassActiveQuiz = () => {
    const q = activeQuiz;
    setActiveQuiz(null);
    if (!q) return;
    setQuizResults((p) => ({ ...p, [q.key]: true }));
    const sectionId = q.key.split(":")[0];
    setSectionDone((p) => ({ ...p, [sectionId]: true }));
    const idx = sections.findIndex((s) => s.id === sectionId);
    say(`Sekcja ${idx + 1} odhaczona po pytaniu kontrolnym.`);
  };

  const completeLesson = async () => {
    if (!allChecked) return toast.info("Najpierw odhacz wszystkie sekcje po kolei.");
    try {
      await supabaseClient.rpc("start_activity", { p_activity_id: parseInt(lessonId!) });
      const { data: result, error } = await supabaseClient.rpc("complete_material", { p_activity_id: parseInt(lessonId!) });
      if (error) throw error;
      if (result) {
        toast.success("Lekcja ukończona!");
        invalidateRPCCache("get_course_structure");
        invalidateRPCCache("get_my_courses");
        try {
          localStorage.removeItem(progressKey);
          localStorage.removeItem(quizKey);
        } catch (err) {
          console.error("Błąd zapisu do localStorage:", err);
        }
        navigate(`/student/courses/${courseId}`);
      }
    } catch {
      toast.error("Nie udało się ukończyć lekcji");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28 lg:pb-14">
      <div ref={liveRef} aria-live="polite" className="sr-only" />

      {/* BACK */}
      <button
        onClick={() => navigate(`/student/courses/${courseId}`)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Powrót do kursu</span>
      </button>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border">
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
            <div className="text-4xl md:text-5xl leading-none">{lesson?.topics?.courses?.icon_emoji || "📚"}</div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                <span className="truncate">{lesson?.topics?.courses?.title || "…"}</span>
                <span>•</span>
                <span className="truncate">{lesson?.topics?.title || "…"}</span>
              </div>
              <h1 className="mt-1 text-xl md:text-3xl font-bold tracking-tight">{lesson?.title || "Ładowanie…"}</h1>
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

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
        {/* CONTENT */}
        <main>
          {isLoading ? (
            <LessonSkeleton />
          ) : (
            <section>
              <div className="prose prose-neutral dark:prose-invert max-w-[68ch] mx-auto prose-headings:font-semibold prose-p:text-muted-foreground">
                {sections.length ? (
                  sections.map((s, idx) => {
                    const done = !!sectionDone[s.id];
                    const unlocked = firstUnreadIdx === -1 || idx <= firstUnreadIdx;
                    const futureLocked = !unlocked && !done;
                    const needHint = idx === firstUnreadIdx && !done;
                    const q = (quizzes.get(s.id) ?? [])[0];

                    return (
                      <div key={s.id} id={s.id} className="mb-10 scroll-mt-24 sm:scroll-mt-28 lg:scroll-mt-32">
                        <div className={`rounded-2xl border bg-card p-4 sm:p-5 md:p-6 shadow-soft ${futureLocked ? "opacity-75" : ""}`}>
                          <div className="flex items-start sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              {!unlocked && !done && (
                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                                  <Lock className="h-3.5 w-3.5" />
                                  Zablokowana
                                </span>
                              )}
                              <h2 className="text-xl md:text-2xl font-semibold tracking-tight m-0">{s.title || `Sekcja ${idx + 1}`}</h2>
                            </div>
                          </div>

                          <div className={futureLocked ? "pointer-events-none select-none" : ""}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MDRenderers}>
                              {s.content}
                            </ReactMarkdown>
                          </div>

                          <div className="mt-5 flex justify-end">
                            <label
                              className={`inline-flex items-center gap-3 ${futureLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                              title={
                                futureLocked
                                  ? "Najpierw ukończ poprzednie sekcje"
                                  : done
                                  ? "Sekcja odhaczona — klik, aby cofnąć"
                                  : q
                                  ? "Kliknij, aby odpowiedzieć na pytanie"
                                  : "Odhacz sekcję"
                              }
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={done}
                                onChange={() => !futureLocked && handleCheckboxClick(idx)}
                                disabled={futureLocked && !done}
                                aria-label={`Odhacz sekcję: ${s.title || `Sekcja ${idx + 1}`}`}
                              />
                              <span
                                className={[
                                  "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-soft transition-all",
                                  done
                                    ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                                    : "bg-background hover:bg-muted border-muted-foreground/30",
                                ].join(" ")}
                              >
                                {q && !done ? (
                                  <span className="truncate max-w-[52ch]">{q.question}</span>
                                ) : (
                                  <>
                                    {done ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                    <span className="whitespace-nowrap">
                                      {String(idx + 1).padStart(2, "0")} • {done ? "Odhaczono" : q ? "Odhacz (pytanie)" : "Odhacz sekcję"}
                                    </span>
                                  </>
                                )}
                              </span>
                            </label>
                          </div>

                          {needHint && <span className="mt-1 block text-right text-xs text-muted-foreground">Zaznacz, aby przejść dalej</span>}
                        </div>
                        <hr className="my-8" />
                      </div>
                    );
                  })
                ) : md ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MDRenderers}>
                    {md}
                  </ReactMarkdown>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: (lesson?.content as string) || "" }} />
                )}
              </div>

              {!!sections.length && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={completeLesson}
                    className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-soft hover:bg-muted transition-colors disabled:opacity-60"
                    disabled={!allChecked}
                    title={!allChecked ? "Najpierw odhacz wszystkie sekcje" : undefined}
                  >
                    Zakończ lekcję
                  </button>
                </div>
              )}
            </section>
          )}
        </main>

        {/* TOC */}
        <aside>
          <nav className="border rounded-lg p-4 bg-background/60 lg:sticky lg:top-28">
            <h2 className="text-sm font-semibold mb-2">Spis treści</h2>
            {isLoading ? (
              <div className="h-4 w-40 rounded bg-muted/60 animate-pulse" />
            ) : sections.length ? (
              <ol className="space-y-1 text-sm">
                {sections.map((s, idx) => {
                  const done = !!sectionDone[s.id];
                  const unlocked = firstUnreadIdx === -1 || idx <= firstUnreadIdx;
                  return (
                    <li key={s.id} className="flex items-center gap-1">
                      {!unlocked && !done ? (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : done ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <span className="h-3.5 w-3.5" />
                      )}
                      <a
                        href={`#${s.id}`}
                        className={`flex-1 block px-2 py-1 rounded hover:bg-muted transition-colors ${
                          done ? "text-emerald-700" : unlocked ? "" : "text-muted-foreground pointer-events-none"
                        }`}
                        aria-disabled={!unlocked && !done}
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

      {activeQuiz && <QuizModal quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onPass={handlePassActiveQuiz} />}
    </div>
  );
};
