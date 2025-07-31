// src/pages/student/components/StudentProfile.tsx

import { useGetIdentity } from "@refinedev/core";
import { User, Mail, Calendar, Trophy, Clock, Target, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubPage } from "@/components/layout";
import { GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { useStudentStats } from "../hooks";


export const StudentProfile = () => {
  const { data: identity } = useGetIdentity<any>();
  const { stats } = useStudentStats();

  return (
    <SubPage>
      <div className="space-y-6">
        <Lead
          title="Mój profil"
          description="Zarządzaj swoim kontem i zobacz swoje statystyki"
        />

        {/* Informacje podstawowe */}
        <Card>
          <CardHeader>
            <CardTitle>Informacje osobiste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold">
                {identity?.full_name?.charAt(0) || 'U'}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{identity?.full_name}</h2>
                  <Badge variant="secondary" className="mt-1">Uczeń</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{identity?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Dołączył: {new Date(identity?.created_at || Date.now()).toLocaleDateString('pl-PL')}</span>
                  </div>
                </div>
              </div>
              
              <Button variant="outline">
                Edytuj profil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statystyki */}
        <div>
          <h2 className="text-xl font-bold mb-4">Moje osiągnięcia</h2>
          <GridBox variant="2-2-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.points}</p>
                    <p className="text-sm text-muted-foreground">Punktów zdobytych</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.quizzes_completed}</p>
                    <p className="text-sm text-muted-foreground">Ukończonych quizów</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.perfect_scores}</p>
                    <p className="text-sm text-muted-foreground">Perfekcyjnych wyników</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.streak} dni</p>
                    <p className="text-sm text-muted-foreground">Najdłuższa seria</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.floor(stats.total_time / 60)}h</p>
                    <p className="text-sm text-muted-foreground">Czasu nauki</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Poziom {stats.level}</p>
                    <p className="text-sm text-muted-foreground">Aktualny poziom</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </GridBox>
        </div>

        {/* Ustawienia */}
        <Card>
          <CardHeader>
            <CardTitle>Ustawienia konta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Zmień hasło
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Ustawienia powiadomień
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              Usuń konto
            </Button>
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
};
