// src/pages/student/components/StudentAchievements.tsx

import { Flame, Star, Zap, Trophy, Target, Rocket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SubPage } from "@/components/layout";
import { GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";

// Przykładowe osiągnięcia - normalnie pobierane z bazy
const achievements = [
  {
    id: 1,
    icon: Flame,
    title: "Pierwszy Krok",
    description: "Ukończ pierwszą lekcję",
    unlocked: true,
    rarity: "common" as const,
    unlockedAt: "2024-01-15",
    progress: 100
  },
  {
    id: 2,
    icon: Star,
    title: "Perfekcjonista",
    description: "Zdobądź 100% w 10 quizach",
    unlocked: true,
    rarity: "rare" as const,
    unlockedAt: "2024-02-20",
    progress: 100
  },
  {
    id: 3,
    icon: Zap,
    title: "Błyskawica",
    description: "Ukończ 5 lekcji w jeden dzień",
    unlocked: false,
    rarity: "epic" as const,
    progress: 60
  },
  {
    id: 4,
    icon: Trophy,
    title: "Mistrz",
    description: "Osiągnij poziom 50",
    unlocked: false,
    rarity: "legendary" as const,
    progress: 24
  },
  {
    id: 5,
    icon: Target,
    title: "Snajper",
    description: "Odpowiedz poprawnie na 100 pytań z rzędu",
    unlocked: false,
    rarity: "epic" as const,
    progress: 45
  },
  {
    id: 6,
    icon: Rocket,
    title: "Rakieta",
    description: "Ukończ kurs w mniej niż tydzień",
    unlocked: false,
    rarity: "rare" as const,
    progress: 0
  }
];

const rarityConfig = {
  common: {
    gradient: "from-gray-400 to-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    label: "Pospolite"
  },
  rare: {
    gradient: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Rzadkie"
  },
  epic: {
    gradient: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    label: "Epiczne"
  },
  legendary: {
    gradient: "from-yellow-400 to-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    label: "Legendarne"
  }
};

export const StudentAchievements = () => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <SubPage>
      <div className="space-y-6">
        <Lead
          title="Osiągnięcia"
          description={`Odblokowano ${unlockedCount} z ${totalCount} osiągnięć`}
        />

        {/* Statystyki */}
        <Card>
          <CardHeader>
            <CardTitle>Postęp osiągnięć</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={(unlockedCount / totalCount) * 100} className="h-3" />
              <div className="grid grid-cols-4 gap-4 text-center">
                {Object.entries(rarityConfig).map(([rarity, config]) => {
                  const count = achievements.filter(a => a.rarity === rarity && a.unlocked).length;
                  const total = achievements.filter(a => a.rarity === rarity).length;
                  
                  return (
                    <div key={rarity}>
                      <p className="text-2xl font-bold">{count}/{total}</p>
                      <p className="text-sm text-muted-foreground">{config.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Osiągnięcia */}
        <GridBox variant="1-2-3">
          {achievements.map((achievement) => {
            const config = rarityConfig[achievement.rarity];
            const Icon = achievement.icon;
            
            return (
              <Card 
                key={achievement.id} 
                className={`relative overflow-hidden ${
                  !achievement.unlocked ? 'opacity-75' : ''
                } border-2 ${config.borderColor}`}
              >
                <div className={`absolute inset-0 ${config.bgColor} opacity-20`} />
                
                <CardContent className="relative p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${
                      achievement.unlocked ? config.gradient : 'from-gray-300 to-gray-400'
                    } flex items-center justify-center shadow-lg`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                    </div>
                    
                    {achievement.unlocked ? (
                      <div className="text-xs text-muted-foreground">
                        Odblokowano {new Date(achievement.unlockedAt!).toLocaleDateString('pl-PL')}
                      </div>
                    ) : (
                      <div className="w-full space-y-2">
                        <Progress value={achievement.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {achievement.progress}% ukończone
                        </p>
                      </div>
                    )}
                    
                    <Badge variant={achievement.unlocked ? "default" : "secondary"}>
                      {config.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </GridBox>
      </div>
    </SubPage>
  );
};