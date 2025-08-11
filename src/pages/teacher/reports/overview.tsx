import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Users, 
  BookOpen,
  Award,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { supabaseClient } from "@/utility/supabaseClient";

export const ReportsOverview = () => {
  const [reportType, setReportType] = useState("users");
  const [dateRange, setDateRange] = useState("month");
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Tutaj implementacja generowania raportów
      alert("Funkcja generowania raportów będzie dostępna wkrótce");
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    {
      id: "users",
      name: "Raport użytkowników",
      description: "Statystyki użytkowników, postępy, aktywność",
      icon: Users,
    },
    {
      id: "courses",
      name: "Raport kursów",
      description: "Popularność kursów, wskaźniki ukończenia",
      icon: BookOpen,
    },
    {
      id: "gamification",
      name: "Raport gamifikacji",
      description: "Punkty, poziomy, rankingi",
      icon: Award,
    },
    {
      id: "activity",
      name: "Raport aktywności",
      description: "Logi, czas nauki, częstotliwość",
      icon: TrendingUp,
    },
  ];

  return (
    <SubPage>
      <Lead
        title="Raporty"
        description="Generuj raporty i analizy systemu"
      />

      <Card>
        <CardHeader>
          <CardTitle>Generator raportów</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Typ raportu</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Zakres czasowy</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Ostatni tydzień</SelectItem>
                  <SelectItem value="month">Ostatni miesiąc</SelectItem>
                  <SelectItem value="quarter">Ostatni kwartał</SelectItem>
                  <SelectItem value="year">Ostatni rok</SelectItem>
                  <SelectItem value="all">Wszystkie dane</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            {reportTypes.find((t) => t.id === reportType) && (
              <div className="flex items-start gap-3">
                {(() => {
                  const Icon = reportTypes.find((t) => t.id === reportType)!.icon;
                  return <Icon className="w-5 h-5 mt-0.5 text-muted-foreground" />;
                })()}
                <div>
                  <h4 className="font-medium">
                    {reportTypes.find((t) => t.id === reportType)!.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {reportTypes.find((t) => t.id === reportType)!.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={generateReport}
            disabled={loading}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {loading ? "Generowanie..." : "Generuj raport"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ostatnie raporty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Brak wygenerowanych raportów</p>
            <p className="text-sm mt-1">
              Wygenerowane raporty będą wyświetlane tutaj
            </p>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};