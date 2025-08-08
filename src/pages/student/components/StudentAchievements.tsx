// src/pages/student/components/StudentAchievements.tsx
import React from "react";
import { Flame, Star, Zap, Trophy, Target, Rocket } from "lucide-react";
import { cn } from "@/utility";
import { 
  AnimatedCard,
  AnimatedProgress
} from "./motion";

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
  common: { bg: "bg-gray-100", border: "border-gray-200", label: "Pospolite" },
  rare: { bg: "bg-blue-100", border: "border-blue-200", label: "Rzadkie" },
  epic: { bg: "bg-purple-100", border: "border-purple-200", label: "Epiczne" },
  legendary: { bg: "bg-orange-100", border: "border-orange-200", label: "Legendarne" }
};

export const StudentAchievements = () => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-2">
        Osiągnięcia
      </h1>
      <p className="text-muted-foreground mb-8">
        Odblokowano {unlockedCount} z {totalCount} osiągnięć
      </p>

      {/* Progress Overview - Uproszczony */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-8">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Postęp osiągnięć</span>
            <span className="font-medium">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
          <AnimatedProgress
            value={(unlockedCount / totalCount) * 100}
            className="bg-muted rounded-full overflow-hidden"
            barClassName="h-full bg-primary rounded-full"
          />
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-center">
          {Object.entries(rarityConfig).map(([rarity, config]) => {
            const count = achievements.filter(a => a.rarity === rarity && a.unlocked).length;
            const total = achievements.filter(a => a.rarity === rarity).length;
            
            return (
              <div key={rarity}>
                <p className="text-xl font-semibold">
                  {count}/{total}
                </p>
                <p className="text-sm text-muted-foreground">{config.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Grid - Czyste karty */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => {
          const config = rarityConfig[achievement.rarity];
          const Icon = achievement.icon;
          
          return (
            <AnimatedCard
              key={achievement.id}
              index={index}
              
              className={cn(
                "bg-card rounded-xl border p-6 transition-all",
                achievement.unlocked ? config.border : "border-border",
                !achievement.unlocked && "opacity-60"
              )}
            >
              <div className="flex flex-col items-center text-center">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                  achievement.unlocked ? config.bg : "bg-muted"
                )}>
                  <Icon className={cn(
                    "w-8 h-8",
                    achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                  )} />
                </div>
                
                <h3 className="font-semibold text-foreground mb-1">
                  {achievement.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {achievement.description}
                </p>
                
                {achievement.unlocked ? (
                  <p className="text-xs text-muted-foreground">
                    {new Date(achievement.unlockedAt!).toLocaleDateString('pl-PL')}
                  </p>
                ) : (
                  <div className="w-full">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Postęp</span>
                      <span className="font-medium">
                        {achievement.progress}%
                      </span>
                    </div>
                    <AnimatedProgress
                      value={achievement.progress}
                      className="bg-muted rounded-full overflow-hidden"
                      barClassName="h-full bg-muted-foreground rounded-full"
                     
                    />
                  </div>
                )}
              </div>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
};