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
  motion
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-8">
        Ulepszenia
      </h1>

      {/* Current Stats - Uproszczone */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/60 mb-2">Punkty na godzinę</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold">
                <AnimatedCounter value={stats.idle_rate} />
              </span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-primary-foreground/60 mb-2">Twoje punkty</p>
            <p className="text-3xl font-semibold">
              <AnimatedCounter value={stats.points} />
            </p>
          </div>
        </div>
      </div>

      {/* Upgrades Grid - Czyste karty */}
      <div className="grid md:grid-cols-2 gap-4">
        {upgrades.map((upgrade, index) => {
          const canAfford = stats.points >= upgrade.next_cost;
          const Icon = iconMap[upgrade.icon] || Zap;

          return (
            <AnimatedCard
              key={upgrade.id}
              index={index}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{upgrade.name}</h3>
                    <p className="text-sm text-muted-foreground">Poziom {upgrade.current_level}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aktualny bonus</span>
                  <span className="font-medium text-green-600">
                    +<AnimatedCounter value={upgrade.total_bonus} /> pkt/h
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Następny poziom</span>
                  <span className="font-medium">+{upgrade.bonus_per_level} pkt/h</span>
                </div>
              </div>

              <motion.button
                whileHover={canAfford ? { scale: 1.02 } : {}}
                whileTap={canAfford ? { scale: 0.98 } : {}}
                onClick={() => handleBuyUpgrade(upgrade.id)}
                disabled={!canAfford}
                className={cn(
                  "w-full py-3 rounded-lg font-medium transition-colors",
                  canAfford
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
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