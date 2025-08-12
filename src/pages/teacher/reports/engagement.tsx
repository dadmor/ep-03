// src/pages/teacher/reports/EngagementReport.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Users, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";

export const EngagementReport: React.FC = () => {
  const stats = [
    { label: "Aktywni użytkownicy", value: "892", icon: Users, change: "+12%" },
    { label: "Średni czas nauki", value: "2.5h", icon: Clock, change: "+5%" },
    { label: "Ukończone kursy", value: "1,234", icon: Award, change: "+18%" },
    { label: "Wskaźnik zaangażowania", value: "87%", icon: TrendingUp, change: "+3%" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/teacher/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do raportów
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Raport zaangażowania</h1>
      </div>

      {/* Statystyki */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> vs. ostatni miesiąc
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wykres placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Zaangażowanie w czasie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-muted-foreground">Miejsce na wykres</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};