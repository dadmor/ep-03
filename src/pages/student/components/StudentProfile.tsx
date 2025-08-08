// src/pages/student/components/StudentProfile.tsx
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { Mail, Calendar, Trophy, Target, Flame, Clock, Star } from "lucide-react";
import { useStudentStats } from "../hooks";
import { 
  AnimatedCard,
  AnimatedCounter,
  motion
} from "./motion";

export const StudentProfile = () => {
  const { data: identity } = useGetIdentity<any>();
  const { stats } = useStudentStats();

  const statCards = [
    { 
      icon: Trophy, 
      label: "Punktów zdobytych", 
      value: stats.points, 
      color: "text-yellow-600 bg-yellow-100",
      isCounter: true
    },
    { 
      icon: Target, 
      label: "Ukończonych quizów", 
      value: stats.quizzes_completed, 
      color: "text-green-600 bg-green-100",
      isCounter: false
    },
    { 
      icon: Star, 
      label: "Perfekcyjnych wyników", 
      value: stats.perfect_scores, 
      color: "text-purple-600 bg-purple-100",
      isCounter: false
    },
    { 
      icon: Flame, 
      label: "Najdłuższa seria", 
      value: `${stats.streak} dni`, 
      color: "text-orange-600 bg-orange-100",
      isCounter: false
    },
    { 
      icon: Clock, 
      label: "Czasu nauki", 
      value: `${Math.floor(stats.total_time / 60)}h`, 
      color: "text-blue-600 bg-blue-100",
      isCounter: false
    },
    { 
      icon: Trophy, 
      label: "Aktualny poziom", 
      value: `Poziom ${stats.level}`, 
      color: "text-pink-600 bg-pink-100",
      isCounter: false
    }
  ];

  const settingsButtons = [
    { label: "Zmień hasło", action: "password" },
    { label: "Ustawienia powiadomień", action: "notifications" },
    { label: "Usuń konto", action: "delete", danger: true }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header - Uproszczony */}
      <div className="bg-card rounded-2xl border border-border p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">
            {identity?.full_name?.charAt(0) || 'U'}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground mb-1">
              {identity?.full_name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{identity?.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Dołączył {new Date(identity?.created_at || Date.now()).toLocaleDateString('pl-PL')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Czyste karty */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Statystyki
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const [textColor, bgColor] = stat.color.split(' ');
            
            return (
              <AnimatedCard
                key={stat.label}
                index={index}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${textColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {stat.isCounter ? (
                        <AnimatedCounter value={stat.value as number} />
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      </div>

      {/* Quick Actions - Proste przyciski */}
      <div className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Ustawienia
        </h2>
        {settingsButtons.map((button, index) => (
          <motion.button
            key={button.action}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-left p-4 bg-card rounded-xl border border-border hover:bg-muted/30 transition-colors"
          >
            <span className={`font-medium ${button.danger ? 'text-destructive' : 'text-foreground'}`}>
              {button.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};