import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useGetIdentity } from "@refinedev/core";
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

interface UserFormData {
  full_name: string;
  email: string;
  role: string;
  vendor_id: number;
  is_active: boolean;
}

export const UsersCreate = () => {
  const { list } = useNavigation();
  const { data: identity } = useGetIdentity<any>();

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    defaultValues: {
      full_name: '',
      email: '',
      vendor_id: identity?.vendor_id || 0,
      role: "student",
      is_active: true,
    }
  });

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
          title="Dodaj użytkownika"
          description="Utwórz nowe konto użytkownika"
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
                error={errors.full_name?.message?.toString()}
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
                error={errors.email?.message?.toString()}
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
                />
              </FormControl>

              <FormControl
                label="Rola"
                error={errors.role?.message?.toString()}
                required
              >
                <Select
                  value={watch("role")}
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
                  checked={watch("is_active")}
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
                {isSubmitting ? "Tworzenie..." : "Utwórz użytkownika"}
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </SubPage>
  );
};