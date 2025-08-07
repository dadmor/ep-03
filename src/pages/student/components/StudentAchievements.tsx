// src/pages/student/components/StudentAchievements.tsx
import React from "react";
import { Flame, Star, Zap, Trophy, Target, Rocket } from "lucide-react";
import { cn } from "@/utility";
import { 
  AnimatedCard,
  AnimatedProgress,
  motion,
  ANIMATION_DURATION,
  ANIMATION_DELAY
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
  common: { color: "bg-gray-100", borderColor: "border-gray-200", label: "Pospolite" },
  rare: { color: "bg-blue-100", borderColor: "border-blue-200", label: "Rzadkie" },
  epic: { color: "bg-purple-100", borderColor: "border-purple-200", label: "Epiczne" },
  legendary: { color: "bg-orange-100", borderColor: "border-orange-200", label: "Legendarne" }
};

export const StudentAchievements = () => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ANIMATION_DURATION.normal }}
        className="text-2xl font-semibold text-gray-900 mb-2"
      >
        Osiągnięcia
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: ANIMATION_DURATION.normal, delay: 0.1 }}
        className="text-gray-500 mb-8"
      >
        Odblokowano {unlockedCount} z {totalCount} osiągnięć
      </motion.p>

      {/* Progress Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ANIMATION_DURATION.normal, delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 p-6 mb-8"
      >
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Postęp osiągnięć</span>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-medium"
            >
              {Math.round((unlockedCount / totalCount) * 100)}%
            </motion.span>
          </div>
          <AnimatedProgress
            value={(unlockedCount / totalCount) * 100}
            delay={0.3}
          />
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-center">
          {Object.entries(rarityConfig).map(([rarity, config], index) => {
            const count = achievements.filter(a => a.rarity === rarity && a.unlocked).length;
            const total = achievements.filter(a => a.rarity === rarity).length;
            
            return (
              <motion.div 
                key={rarity}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.4 + index * ANIMATION_DELAY.staggerFast,
                  duration: ANIMATION_DURATION.normal 
                }}
              >
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.6 + index * ANIMATION_DELAY.staggerFast,
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  className="text-xl font-semibold"
                >
                  {count}/{total}
                </motion.p>
                <p className="text-sm text-gray-500">{config.label}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => {
          const config = rarityConfig[achievement.rarity];
          const Icon = achievement.icon;
          
          return (
            <AnimatedCard
              key={achievement.id}
              index={index}
              variant="fadeInUp"
              hover={achievement.unlocked ? "lift" : false}
              className={cn(
                "bg-white rounded-xl border p-6 transition-all",
                achievement.unlocked ? config.borderColor : "border-gray-100",
                !achievement.unlocked && "opacity-60"
              )}
            >
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 0.5 + index * ANIMATION_DELAY.staggerFast,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                    achievement.unlocked ? config.color : "bg-gray-100"
                  )}
                >
                  <Icon className={cn(
                    "w-8 h-8",
                    achievement.unlocked ? "text-gray-900" : "text-gray-400"
                  )} />
                </motion.div>
                
                <h3 className="font-semibold text-gray-900 mb-1">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {achievement.description}
                </p>
                
                {achievement.unlocked ? (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + index * ANIMATION_DELAY.staggerFast }}
                    className="text-xs text-gray-400"
                  >
                    {new Date(achievement.unlockedAt!).toLocaleDateString('pl-PL')}
                  </motion.p>
                ) : (
                  <div className="w-full">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Postęp</span>
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 + index * ANIMATION_DELAY.staggerFast }}
                        className="font-medium"
                      >
                        {achievement.progress}%
                      </motion.span>
                    </div>
                    <AnimatedProgress
                      value={achievement.progress}
                      className="bg-gray-100 rounded-full overflow-hidden"
                      barClassName="h-full bg-gray-400"
                      height="h-1.5"
                      delay={0.7 + index * ANIMATION_DELAY.staggerFast}
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