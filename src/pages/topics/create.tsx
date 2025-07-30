import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useOne } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Switch } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Form, FormActions, FormControl } from "@/components/form";
import { SubPage } from "@/components/layout";
import { useSearchParams } from "react-router-dom";

export const TopicsCreate = () => {
  const { list } = useNavigation();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');

  const { data: courseData } = useOne({
    resource: "courses",
    id: courseId as string,
    queryOptions: {
      enabled: !!courseId,
    },
  });

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      course_id: courseId ? parseInt(courseId) : undefined,
      is_published: false,
      position: 1,
    }
  });

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
          title="Dodaj temat"
          description={courseData?.data ? `Do kursu: ${courseData.data.title}` : "Utwórz nowy temat"}
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle>Informacje o temacie</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onFinish)}>
            <input type="hidden" {...register("course_id")} />
            
            <FormControl
              label="Tytuł tematu"
              htmlFor="title"
              error={errors.title?.message as string}
              required
            >
              <Input
                id="title"
                placeholder="np. Wprowadzenie do zmiennych"
                {...register("title", {
                  required: "Tytuł tematu jest wymagany",
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

            <FormControl label="Status publikacji">
              <FlexBox variant="start">
                <Switch
                  checked={watch("is_published") || false}
                  onCheckedChange={(checked) => setValue("is_published", checked)}
                />
                <span className="text-sm text-muted-foreground">
                  Opublikuj temat od razu
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
                {isSubmitting ? "Tworzenie..." : "Utwórz temat"}
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </SubPage>
  );
};