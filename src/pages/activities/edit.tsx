import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useOne } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, HelpCircle, ListChecks } from "lucide-react";
import { Button, Input, Textarea, Switch, Badge } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Form, FormActions, FormControl } from "@/components/form";
import { SubPage } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const ActivitiesEdit = () => {
  const { list, show } = useNavigation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useOne({
    resource: "activities",
    id: id as string,
    liveMode: "off",
    meta: {
      select: '*, topics(*, courses(*)), questions(count)'
    }
  });

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    refineCoreProps: {
      resource: "activities",
      id: id as string,
      liveMode: "off",
      redirect: false,
      successNotification: false,
      onMutationSuccess: () => {
        const courseId = data?.data?.topics?.course_id;
        toast.success("Aktywność została zaktualizowana");
        
        if (courseId) {
          show("courses", courseId);
        } else {
          list("activities");
        }
      },
    }
  });

  const activityType = watch("type") || data?.data?.type || "material";

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const activity = data?.data;
  const topic = activity?.topics;
  const course = topic?.courses;

  const handleCancel = () => {
    if (course?.id) {
      show("courses", course.id);
    } else {
      list("activities");
    }
  };

  const getActivityIcon = () => {
    return activityType === 'quiz' ? 
      <HelpCircle className="w-6 h-6 text-blue-500" /> : 
      <FileText className="w-6 h-6 text-green-500" />;
  };

  return (
    <SubPage>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCancel}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do kursu
      </Button>

      <FlexBox>
        <Lead
          title={
            <div className="flex items-center gap-2">
              {getActivityIcon()}
              Edytuj aktywność
            </div>
          }
          description={
            <div>
              <div className="text-lg font-medium">{activity?.title}</div>
              <div className="text-sm text-muted-foreground">
                {course?.title} → Temat {topic?.position}: {topic?.title}
              </div>
            </div>
          }
        />
        {activityType === 'quiz' && (
          <Button 
            onClick={() => navigate(`/questions/manage/${activity?.id}`)}
            variant="outline"
          >
            <ListChecks className="w-4 h-4 mr-2" />
            Zarządzaj pytaniami ({activity?._count?.questions || 0})
          </Button>
        )}
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle>Informacje o aktywności</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onFinish)}>
            <GridBox variant="1-2-2">
              <FormControl
                label="Typ aktywności"
                error={errors.type?.message as string}
                required
              >
                <Select
                  value={activityType}
                  disabled
                >
                  <SelectTrigger className="bg-muted">
                    <SelectValue placeholder="Wybierz typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="material">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Materiał
                      </div>
                    </SelectItem>
                    <SelectItem value="quiz">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Quiz
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Typ aktywności nie może być zmieniony
                </p>
              </FormControl>

              <FormControl
                label="Tytuł"
                htmlFor="title"
                error={errors.title?.message as string}
                required
              >
                <Input
                  id="title"
                  placeholder={activityType === "quiz" ? "np. Test wiedzy" : "np. Wprowadzenie"}
                  {...register("title", {
                    required: "Tytuł jest wymagany",
                    minLength: {
                      value: 3,
                      message: "Tytuł musi mieć minimum 3 znaki",
                    },
                  })}
                />
              </FormControl>

              <FormControl
                label="Pozycja w temacie"
                htmlFor="position"
                error={errors.position?.message as string}
                required
              >
                <Input
                  id="position"
                  type="number"
                  min="1"
                  {...register("position", {
                    required: "Pozycja jest wymagana",
                    min: {
                      value: 1,
                      message: "Pozycja musi być większa od 0",
                    },
                    valueAsNumber: true,
                  })}
                />
              </FormControl>

              <FormControl
                label="Czas trwania (min)"
                htmlFor="duration_min"
                hint="Szacowany czas potrzebny na ukończenie"
              >
                <Input
                  id="duration_min"
                  type="number"
                  min="1"
                  placeholder="np. 15"
                  {...register("duration_min", {
                    min: {
                      value: 1,
                      message: "Czas musi być większy od 0",
                    },
                    valueAsNumber: true,
                  })}
                />
              </FormControl>
            </GridBox>

            {activityType === "material" && (
              <FormControl
                label="Treść materiału"
                htmlFor="content"
                error={errors.content?.message as string}
                required
                hint="Możesz używać formatowania Markdown"
              >
                <Textarea
                  id="content"
                  placeholder="Wprowadź treść materiału..."
                  rows={10}
                  {...register("content", {
                    required: activityType === "material" ? "Treść jest wymagana dla materiału" : false,
                  })}
                />
              </FormControl>
            )}

            {activityType === "quiz" && (
              <>
                <GridBox variant="1-1-1">
                  <FormControl
                    label="Próg zaliczenia (%)"
                    htmlFor="passing_score"
                    error={errors.passing_score?.message as string}
                    hint="Minimalny wynik do zaliczenia"
                  >
                    <Input
                      id="passing_score"
                      type="number"
                      min="0"
                      max="100"
                      {...register("passing_score", {
                        min: {
                          value: 0,
                          message: "Wartość minimalna to 0",
                        },
                        max: {
                          value: 100,
                          message: "Wartość maksymalna to 100",
                        },
                        valueAsNumber: true,
                      })}
                    />
                  </FormControl>

                  <FormControl
                    label="Limit czasu (min)"
                    htmlFor="time_limit"
                    hint="Pozostaw puste dla braku limitu"
                  >
                    <Input
                      id="time_limit"
                      type="number"
                      min="1"
                      placeholder="Brak limitu"
                      {...register("time_limit", {
                        min: {
                          value: 1,
                          message: "Limit musi być większy od 0",
                        },
                        valueAsNumber: true,
                      })}
                    />
                  </FormControl>

                  <FormControl
                    label="Maksymalna liczba prób"
                    htmlFor="max_attempts"
                    hint="Pozostaw puste dla nieograniczonej liczby"
                  >
                    <Input
                      id="max_attempts"
                      type="number"
                      min="1"
                      placeholder="Bez limitu"
                      {...register("max_attempts", {
                        min: {
                          value: 1,
                          message: "Minimum 1 próba",
                        },
                        valueAsNumber: true,
                      })}
                    />
                  </FormControl>
                </GridBox>
                
                {activity?._count?.questions !== undefined && (
                  <Card className="mt-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Ten quiz zawiera {activity._count.questions} {activity._count.questions === 1 ? 'pytanie' : 'pytań'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Możesz zarządzać pytaniami klikając przycisk powyżej
                          </p>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {activity._count.questions}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <FormControl label="Status publikacji">
              <FlexBox variant="start">
                <Switch
                  checked={watch("is_published") || false}
                  onCheckedChange={(checked) => setValue("is_published", checked)}
                />
                <span className="text-sm text-muted-foreground">
                  Aktywność jest opublikowana (uczniowie mogą ją zobaczyć)
                </span>
              </FlexBox>
            </FormControl>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </SubPage>
  );
};