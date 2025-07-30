import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useOne } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, HelpCircle } from "lucide-react";
import { Button, Input, Textarea, Switch } from "@/components/ui";
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
import { useParams } from "react-router-dom";

export const ActivitiesEdit = () => {
  const { list } = useNavigation();
  const { id } = useParams();

  const { data, isLoading } = useOne({
    resource: "activities",
    id: id as string,
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
    }
  });

  const activityType = watch("type");

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <Button
        variant="outline"
        size="sm"
        onClick={() => list("courses")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do kursu
      </Button>

      <FlexBox>
        <Lead
          title="Edytuj aktywność"
          description={`Edycja: ${data?.data?.title}`}
        />
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
                  onValueChange={(value) => setValue("type", value)}
                  disabled
                >
                  <SelectTrigger>
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
                label="Pozycja"
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
              >
                <Textarea
                  id="content"
                  placeholder="Wprowadź treść materiału..."
                  rows={8}
                  {...register("content", {
                    required: activityType === "material" ? "Treść jest wymagana dla materiału" : false,
                  })}
                />
              </FormControl>
            )}

            {activityType === "quiz" && (
              <GridBox variant="1-1-1">
                <FormControl
                  label="Próg zaliczenia (%)"
                  htmlFor="passing_score"
                  error={errors.passing_score?.message as string}
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
            )}

            <FormControl label="Status publikacji">
              <FlexBox variant="start">
                <Switch
                  checked={watch("is_published") || false}
                  onCheckedChange={(checked) => setValue("is_published", checked)}
                />
                <span className="text-sm text-muted-foreground">
                  Aktywność jest opublikowana
                </span>
              </FlexBox>
            </FormControl>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => list("courses")}
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