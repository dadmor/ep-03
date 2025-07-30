import { useEffect } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useOne } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Switch } from "@/components/ui";
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

export const UsersEdit = () => {
  const { list } = useNavigation();
  const { id } = useParams();

  const { data, isLoading } = useOne({
    resource: "users",
    id: id as string,
    liveMode: "off", // Wyłącz live mode
  });

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    refineCoreProps: {
      resource: "users",
      id: id as string,
      redirect: "list",
      liveMode: "off", // Wyłącz live mode
    }
  });

  // Ustaw wartości formularza po załadowaniu danych
  useEffect(() => {
    if (data?.data) {
      reset({
        full_name: data.data.full_name,
        email: data.data.email,
        role: data.data.role,
        is_active: data.data.is_active,
        vendor_id: data.data.vendor_id,
      });
    }
  }, [data, reset]);

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
        onClick={() => list("users")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <Lead
          title="Edytuj użytkownika"
          description={`Edycja: ${data?.data?.full_name}`}
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle>Dane użytkownika</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onFinish)}>
            <GridBox variant="1-2-2">
              <FormControl
                label="Imię i nazwisko"
                htmlFor="full_name"
                error={errors.full_name?.message as string}
                required
              >
                <Input
                  id="full_name"
                  placeholder="np. Jan Kowalski"
                  {...register("full_name", {
                    required: "Imię i nazwisko są wymagane",
                    minLength: {
                      value: 3,
                      message: "Minimum 3 znaki",
                    },
                  })}
                />
              </FormControl>

              <FormControl
                label="Email"
                htmlFor="email"
                error={errors.email?.message as string}
                required
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="np. jan.kowalski@example.com"
                  {...register("email", {
                    required: "Email jest wymagany",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Nieprawidłowy format email",
                    },
                  })}
                  disabled
                />
              </FormControl>

              <FormControl
                label="Rola"
                error={errors.role?.message as string}
                required
              >
                <Select
                  value={watch("role") || "student"}
                  onValueChange={(value) => setValue("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz rolę" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Nauczyciel</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </GridBox>

            <FormControl label="Status konta">
              <FlexBox variant="start">
                <Switch
                  checked={watch("is_active") ?? true}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
                <span className="text-sm text-muted-foreground">
                  Konto aktywne (użytkownik może się zalogować)
                </span>
              </FlexBox>
            </FormControl>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => list("users")}
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