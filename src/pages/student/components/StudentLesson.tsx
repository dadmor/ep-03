/* path: src/pages/student/components/StudentLesson.tsx */
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Clock } from "lucide-react";
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
  if (parts.length <= 1 && !/^##\s+/.test(md)) {
    return [{ id: slug(fallbackTitle || "sekcja"), title: fallbackTitle || "Sekcja", content: md }];
  }
  const sections: Section[] = [];
  for (const raw of parts) {
    const m = raw.match(/^##\s+(.+?)\s*$/m);
    const title = m?.[1]?.trim() || "Sekcja";
    const body = raw.replace(/^##\s+.+?\n/, "");
    sections.push({ id: slug(title) || slug(fallbackTitle + Math.random()), title, content: body.trim() });
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
  const md: string | undefined = (lesson?.content_md ?? lesson?.markdown ?? lesson?.content) as string | undefined;

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

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28 lg:pb-14">
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
              <div className="prose prose-neutral dark:prose-invert max-w-[68ch] mx-auto prose-headings:font-semibold prose-p:text-muted-foreground">
                {sections.length > 0 ? (
                  sections.map((s, idx) => {
                    const isDone = !!sectionDone[s.id];
                    const unlocked = firstUnreadIdx === -1 || idx <= firstUnreadIdx;
                    const futureLocked = !unlocked && !isDone;
                    return (
                      <div key={s.id} className="mb-10" id={s.id}>
                        <div className={futureLocked ? "opacity-60" : ""}>
                          <h2 className="scroll-mt-28 md:scroll-mt-32">{s.title}</h2>
                          <div className={futureLocked ? "pointer-events-none" : ""}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content}</ReactMarkdown>
                          </div>
                        </div>
                        <div className="not-prose mt-4 flex items-center justify-between gap-3">
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-muted-foreground/40"
                              checked={isDone}
                              onChange={() => toggleSection(idx)}
                              disabled={!unlocked && !isDone}
                            />
                            <span>{String(idx + 1).padStart(2, "0")}. {s.title}</span>
                          </label>
                        </div>
                        <hr className="my-8" />
                      </div>
                    );
                  })
                ) : (
                  md && typeof md === "string" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: (lesson?.content as string) || "" }} />
                  )
                )}
              </div>
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
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`block px-2 py-1 rounded hover:bg-muted transition-colors ${
                          isDone ? "text-green-600" : unlocked ? "" : "text-muted-foreground"
                        }`}
                      >
                        {String(idx + 1).padStart(2, "0")}. {s.title}
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
