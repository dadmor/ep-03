// path: src/pages/teacher/reports/overview.tsx
import { NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { FlexBox, GridBox } from "@/components/shared";
import { Users, Activity } from "lucide-react";

export const ReportsOverview = () => {
  const items = [
    {
      to: "/teacher/reports/summary",
      title: "summary",
      description: "Podsumowanie użytkowników.",
      icon: <Users className="h-5 w-5" />,
    },
    {
      to: "/teacher/reports/engagement",
      title: "engagement",
      description: "Ukończenia aktywności, uczestnicy, ostatnie 7 dni.",
      icon: <Activity className="h-5 w-5" />,
    },
  ];

  return (
    <SubPage>
      <FlexBox>
        <Lead title="Raporty — overview" description="Wybierz raport" />
      </FlexBox>

      <GridBox>
        {items.map((it) => (
          <NavLink key={it.to} to={it.to}>
            <Card className="transition hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {it.icon}
                  {it.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {it.description}
              </CardContent>
            </Card>
          </NavLink>
        ))}
      </GridBox>
    </SubPage>
  );
};
