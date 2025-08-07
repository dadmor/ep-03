// src/pages/student/components/StudentGamification.tsx
import React from "react";
import { Zap, Rocket, Brain, Coffee, Book, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utility";
import { useStudentStats } from "../hooks";
import { useRPC } from "../hooks/useRPC";
import { supabaseClient } from "@/utility";
import { 
  AnimatedCard, 
  AnimatedCounter,
  AnimatedProgress,
  motion,
  ANIMATION_DURATION
} from "./motion";

interface IdleUpgrade {
  id: number;
  name: string;
  icon: string;
  current_level: number;
  next_cost: number;
  bonus_per_level: number;
  total_bonus: number;
}

const iconMap: Record<string, any> = {
  '⚡': Zap,
  '🚀': Rocket,
  '🧠': Brain,
  '☕': Coffee,
  '📚': Book,
};

export const StudentGamification = () => {
  const { stats, refetch: refetchStats } = useStudentStats();
  const { data: upgradesData, isLoading, refetch: refetchUpgrades } = useRPC<IdleUpgrade[]>(
    'get_idle_upgrades'
  );

  const handleBuyUpgrade = async (upgradeId: number) => {
    try {
      const { data, error } = await supabaseClient.rpc('buy_idle_upgrade', {
        p_upgrade_id: upgradeId
      });

      if (error) throw error;

      if (data) {
        toast.success(`Ulepszenie zakupione! Poziom ${data.new_level}`);
        refetchStats();
        refetchUpgrades();
      }
    } catch (error: any) {
      toast.error("Niewystarczająca ilość punktów");
    }
  };

  const upgrades = upgradesData || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ANIMATION_DURATION.normal }}
        className="text-2xl font-semibold text-gray-900 mb-8"
      >
        Ulepszenia
      </motion.h1>

      {/* Current Stats */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: ANIMATION_DURATION.normal, delay: 0.1 }}
        className="bg-gray-900 text-white rounded-2xl p-8 mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 mb-2">Punkty na godzinę</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold">
                <AnimatedCounter value={stats.idle_rate} />
              </span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 mb-2">Twoje punkty</p>
            <p className="text-3xl font-semibold">
              <AnimatedCounter value={stats.points} />
            </p>
          </div>
        </div>
      </motion.div>

      {/* Upgrades Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {upgrades.map((upgrade, index) => {
          const canAfford = stats.points >= upgrade.next_cost;
          const Icon = iconMap[upgrade.icon] || Zap;

          return (
            <AnimatedCard
              key={upgrade.id}
              index={index}
              variant="fadeInUp"
              hover="lift"
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: ANIMATION_DURATION.normal, delay: 0.3 + index * 0.1 }}
                    className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"
                  >
                    <Icon className="w-6 h-6 text-gray-700" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{upgrade.name}</h3>
                    <p className="text-sm text-gray-500">Poziom {upgrade.current_level}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Aktualny bonus</span>
                  <span className="font-medium text-green-600">
                    +<AnimatedCounter value={upgrade.total_bonus} /> pkt/h
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Następny poziom</span>
                  <span className="font-medium">+{upgrade.bonus_per_level} pkt/h</span>
                </div>
              </div>

              <motion.button
                whileHover={canAfford ? { scale: 1.02 } : {}}
                whileTap={canAfford ? { scale: 0.98 } : {}}
                onClick={() => handleBuyUpgrade(upgrade.id)}
                disabled={!canAfford}
                className={cn(
                  "w-full py-3 rounded-lg font-medium transition-all",
                  canAfford
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                Ulepsz za <AnimatedCounter value={upgrade.next_cost} /> pkt
              </motion.button>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
};