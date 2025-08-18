// src/pages/admin/vendors/create.tsx
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, Input, Switch } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Form, FormActions, FormControl } from "@/components/form";
import { SubPage } from "@/components/layout";
import { ArrowLeft, Building } from "lucide-react";

interface VendorFormData {
  name: string;
  subdomain: string;
  is_active: boolean;
}

export const VendorsCreate = () => {
  const { list } = useNavigation();
  
  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormData>({
    defaultValues: {
      is_active: true,
    },
    refineCoreProps: {
      resource: "vendors",
      successNotification: () => ({
        message: "Organizacja została utworzona",
        type: "success",
      }),
    },
  });

  return (
    <SubPage>
      <Button
        variant="outline"
        size="sm"
        onClick={() => list("vendors")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <Lead
          title="Dodaj organizację"
          description="Utwórz nową organizację w systemie"
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Dane organizacji
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onFinish)}>
            <FormControl
              label="Nazwa organizacji"
              htmlFor="name"
              error={errors.name?.message as string}
              required
            >
              <Input
                id="name"
                placeholder="np. Szkoła Podstawowa nr 1"
                {...register("name", {
                  required: "Nazwa organizacji jest wymagana",
                  minLength: {
                    value: 3,
                    message: "Nazwa musi mieć minimum 3 znaki",
                  },
                  maxLength: {
                    value: 100,
                    message: "Nazwa może mieć maksimum 100 znaków",
                  },
                })}
              />
            </FormControl>

            <FormControl
              label="Subdomena"
              htmlFor="subdomain"
              error={errors.subdomain?.message as string}
              required
              hint="Ta wartość będzie używana w adresie URL: subdomena.smartup.pl"
            >
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  placeholder="np. sp1-warszawa"
                  {...register("subdomain", {
                    required: "Subdomena jest wymagana",
                    minLength: {
                      value: 3,
                      message: "Subdomena musi mieć minimum 3 znaki",
                    },
                    maxLength: {
                      value: 50,
                      message: "Subdomena może mieć maksimum 50 znaków",
                    },
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message: "Subdomena może zawierać tylko małe litery, cyfry i myślniki",
                    },
                  })}
                />
                <span className="text-sm text-muted-foreground">.smartup.pl</span>
              </div>
            </FormControl>

            <FormControl label="Status">
              <FlexBox variant="start">
                <Switch
                  checked={watch("is_active") || false}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
                <div>
                  <span className="text-sm font-medium">
                    Organizacja aktywna
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Nieaktywne organizacje nie mogą się logować do systemu
                  </p>
                </div>
              </FlexBox>
            </FormControl>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => list("vendors")}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Tworzenie..." : "Utwórz organizację"}
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </SubPage>
  );
};