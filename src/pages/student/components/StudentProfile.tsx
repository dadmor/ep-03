// src/pages/student/components/StudentProfile.tsx
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { Mail, Calendar, Trophy, Target, Flame, Clock, Star } from "lucide-react";
import { useStudentStats } from "../hooks";
import { 
  AnimatedCard,
  AnimatedCounter,
  AnimatedButton,
  motion,
  ANIMATION_DURATION,
  ANIMATION_DELAY
} from "./motion";

export const StudentProfile = () => {
  const { data: identity } = useGetIdentity<any>();
  const { stats } = useStudentStats();

  const statCards = [
    { 
      icon: Trophy, 
      label: "Punktów zdobytych", 
      value: stats.points, 
      color: "bg-yellow-100",
      iconColor: "text-yellow-600",
      isCounter: true
    },
    { 
      icon: Target, 
      label: "Ukończonych quizów", 
      value: stats.quizzes_completed, 
      color: "bg-green-100",
      iconColor: "text-green-600",
      isCounter: false
    },
    { 
      icon: Star, 
      label: "Perfekcyjnych wyników", 
      value: stats.perfect_scores, 
      color: "bg-purple-100",
      iconColor: "text-purple-600",
      isCounter: false
    },
    { 
      icon: Flame, 
      label: "Najdłuższa seria", 
      value: `${stats.streak} dni`, 
      color: "bg-orange-100",
      iconColor: "text-orange-600",
      isCounter: false
    },
    { 
      icon: Clock, 
      label: "Czasu nauki", 
      value: `${Math.floor(stats.total_time / 60)}h`, 
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      isCounter: false
    },
    { 
      icon: Trophy, 
      label: "Aktualny poziom", 
      value: `Poziom ${stats.level}`, 
      color: "bg-pink-100",
      iconColor: "text-pink-600",
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
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ANIMATION_DURATION.normal }}
        className="bg-white rounded-2xl border border-gray-100 p-8 mb-8"
      >
        <div className="flex items-start gap-6">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: ANIMATION_DURATION.normal,
              delay: 0.2,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className="w-20 h-20 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-2xl font-semibold"
          >
            {identity?.full_name?.charAt(0) || 'U'}
          </motion.div>
          
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: ANIMATION_DURATION.normal, delay: 0.3 }}
              className="text-2xl font-semibold text-gray-900 mb-1"
            >
              {identity?.full_name}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: ANIMATION_DURATION.normal, delay: 0.4 }}
              className="flex items-center gap-4 text-sm text-gray-500"
            >
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{identity?.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Dołączył {new Date(identity?.created_at || Date.now()).toLocaleDateString('pl-PL')}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div>
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: ANIMATION_DURATION.normal, delay: 0.5 }}
          className="text-lg font-semibold text-gray-900 mb-4"
        >
          Statystyki
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedCard
                key={stat.label}
                index={index}
                variant="fadeInUp"
                hover="lift"
                className="bg-white rounded-xl border border-gray-100 p-6"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 0.6 + index * ANIMATION_DELAY.staggerFast,
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                    className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </motion.div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.isCounter ? (
                        <AnimatedCounter value={stat.value as number} />
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 space-y-3">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: ANIMATION_DURATION.normal, delay: 0.8 }}
          className="text-lg font-semibold text-gray-900 mb-4"
        >
          Ustawienia
        </motion.h2>
        {settingsButtons.map((button, index) => (
          <AnimatedButton
            key={button.action}
            index={index}
            variant="fadeInUp"
            whileHover={{ x: 4 }}
            className="w-full text-left p-4 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <span className={`font-medium ${button.danger ? 'text-red-600' : 'text-gray-900'}`}>
              {button.label}
            </span>
          </AnimatedButton>
        ))}
      </div>
    </div>
  );
};