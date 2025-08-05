// src/pages/course-structure-wizard/CourseWizardStep5.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import { useCreate, useGetIdentity } from "@refinedev/core";
import { Save, ArrowLeft, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import {
  COURSE_UI_TEXTS,
  COURSE_PATHS,
} from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";
import { toast } from "sonner";

export const CourseWizardStep5: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const { mutate: createCourse } = useCreate();
  const { mutate: createTopic } = useCreate();
  const { data: identity } = useGetIdentity<any>();
  const formData = getData("course-structure-wizard");

  const [courseName, setCourseName] = useState(formData.courseTitle || "");
  const [iconEmoji, setIconEmoji] = useState("📚");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { steps, errors: errorTexts } = COURSE_UI_TEXTS;

  const handleSave = async () => {
    if (!courseName.trim()) {
      toast.error("Nazwa kursu jest wymagana");
      return;
    }

    // Sprawdź czy mamy vendor_id
    if (!identity?.vendor_id) {
      toast.error("Brak informacji o vendor_id. Skontaktuj się z administratorem.");
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      // 1. Utwórz kurs z vendor_id
      createCourse(
        {
          resource: "courses",
          values: {
            vendor_id: identity.vendor_id, // Użyj vendor_id z kontekstu użytkownika
            title: courseName.trim(),
            description: formData.description,
            icon_emoji: iconEmoji,
            is_published: isPublished,
          },
        },
        {
          onSuccess: async (courseData) => {
            const courseId = courseData.data.id;
            let topicPosition = 1;

            // 2. Utwórz tematy dla każdego tygodnia
            try {
              for (const week of formData.structure) {
                for (const topic of week.topics) {
                  await new Promise((resolve, reject) => {
                    createTopic(
                      {
                        resource: "topics",
                        values: {
                          course_id: courseId,
                          title: topic.title,
                          position: topicPosition++,
                          is_published: false,
                        },
                      },
                      {
                        onSuccess: resolve,
                        onError: reject,
                      }
                    );
                  });
                }
              }

              // 3. Zapisz w lokalnym store
              setData("course-structure-wizard", {
                ...formData,
                courseName: courseName.trim(),
                courseId,
                saved: true,
              });

              setSaving(false);
              setSaved(true);

              // Przekieruj do kursu
              setTimeout(() => {
                navigate(`${COURSE_PATHS.courses}/show/${courseId}`);
              }, 2000);
            } catch (error) {
              setSaving(false);
              console.error("Błąd podczas tworzenia tematów:", error);
              toast.error("Wystąpił błąd podczas tworzenia struktury kursu");
            }
          },
          onError: (error: any) => {
            setSaving(false);
            console.error(errorTexts.saveError, error);
            
            // Szczegółowa obsługa błędów
            if (error?.code === '42501') {
              toast.error("Brak uprawnień do tworzenia kursów. Sprawdź swoje uprawnienia.");
            } else if (error?.code === '23505') {
              toast.error("Kurs o takiej nazwie już istnieje.");
            } else {
              toast.error(errorTexts.saveError);
            }
          },
        }
      );
    } catch (error) {
      setSaving(false);
      console.error(errorTexts.unexpectedError, error);
      toast.error(errorTexts.unexpectedError);
    }
  };

  // Wybór emoji dla różnych typów kursów
  const getDefaultEmoji = () => {
    switch (formData.courseType) {
      case 'matura': return '🎓';
      case 'academic': return '🏛️';
      case 'professional': return '💼';
      case 'hobby': return '🎨';
      case 'certification': return '📜';
      default: return '📚';
    }
  };

  // Ustaw domyślne emoji przy pierwszym renderowaniu
  React.useEffect(() => {
    setIconEmoji(getDefaultEmoji());
  }, [formData.courseType]);

  return (
    <SubPage>
      <div className="border rounded-lg bg-white shadow relative">
        <StepsHero step={5} />

        <div className="p-8">
          <StepsHeader
            title={
              <>
                <Layout className="w-8 h-8 text-indigo-500" />
                <span>{steps[5].title}</span>
              </>
            }
            description={steps[5].description}
          />

          {saved && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {steps[5].success}
              </AlertDescription>
            </Alert>
          )}

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div>
              <Label htmlFor="courseName">
                Nazwa kursu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="courseName"
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="np. Matematyka - Kurs maturalny poziom rozszerzony"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="iconEmoji">Emoji ikona</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="iconEmoji"
                  type="text"
                  value={iconEmoji}
                  onChange={(e) => setIconEmoji(e.target.value)}
                  placeholder="np. 📚 📐 🎓"
                  className="flex-1"
                  maxLength={5}
                />
                <div className="flex gap-1">
                  {['📚', '🎓', '📐', '🏛️', '💼', '🎨', '📜', '🚀'].map((emoji) => (
                    <Button
                      key={emoji}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIconEmoji(emoji)}
                      className="w-10 h-10"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Wybierz emoji z listy lub wpisz własne
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={isPublished}
                onCheckedChange={(checked) => setIsPublished(checked as boolean)}
              />
              <label htmlFor="isPublished" className="text-sm cursor-pointer">
                Opublikuj kurs od razu (uczniowie będą mogli go zobaczyć)
              </label>
            </div>

            {/* Podsumowanie */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Co zostanie utworzone:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Kurs "{courseName || formData.courseTitle}" z pełnym opisem</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{formData.summary?.totalTopics || 0} tematów rozłożonych na {formData.summary?.totalWeeks || 0} tygodni</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Struktura gotowa do wypełnienia materiałami i quizami</span>
                </li>
              </ul>
            </div>

            {/* Informacja o zapisie */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-indigo-800 text-sm">{steps[5].saveInfo}</p>
            </div>

            <Separator />

            {/* Przyciski nawigacji */}
            <footer className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(COURSE_PATHS.step4)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Wstecz
              </Button>

              <Button
                type="submit"
                disabled={saving || saved}
                className="flex items-center gap-2 min-w-[160px]"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {steps[5].loading}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {steps[5].button}
                  </>
                )}
              </Button>
            </footer>
          </form>
        </div>
      </div>
    </SubPage>
  );
};