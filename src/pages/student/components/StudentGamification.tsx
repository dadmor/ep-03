// src/pages/student/components/StudentGamification.tsx - POPRAWIONY
import React from "react";
import { Coins, Zap, Rocket, Brain, Coffee, Book } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubPage } from "@/components/layout";
import { GridBox, FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { toast } from "sonner";
import { useStudentStats } from "../hooks";
import { useRPC } from "../hooks/useRPC";
import { supabaseClient } from "@/utility";

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
        toast.success("Ulepszenie zakupione!", {
          description: `Nowy poziom: ${data.new_level}`
        });
        refetchStats();
        refetchUpgrades();
      }
    } catch (error: any) {
      toast.error("Nie udało się kupić ulepszenia", {
        description: error.message || "Niewystarczająca ilość punktów"
      });
    }
  };

  const upgrades = upgradesData || [];

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <div className="space-y-6">
        <Lead
          title="Gamifikacja"
          description="Ulepsz swoje możliwości zdobywania punktów"
        />

        {/* Idle Stats */}
        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Idle Game</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm opacity-80">Punkty na godzinę</p>
                <p className="text-4xl font-bold">{stats.idle_rate}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Twoje punkty</p>
                <p className="text-4xl font-bold">{stats.points}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrades */}
        <div>
          <h2 className="text-xl font-bold mb-4">Ulepszenia</h2>
          <GridBox>
            {upgrades.map((upgrade) => {
              const canAfford = stats.points >= upgrade.next_cost;
              const Icon = iconMap[upgrade.icon] || Coins;

              return (
                <Card key={upgrade.id} className="relative overflow-hidden">
                  <CardHeader>
                    <FlexBox>
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{upgrade.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            +{upgrade.bonus_per_level} pkt/h za poziom
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        Lvl {upgrade.current_level}
                      </Badge>
                    </FlexBox>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Aktualny bonus</span>
                        <span className="font-bold text-green-600">
                          +{upgrade.total_bonus} pkt/h
                        </span>
                      </div>
                      
                      <Button
                        className="w-full"
                        onClick={() => handleBuyUpgrade(upgrade.id)}
                        disabled={!canAfford}
                        variant={canAfford ? "default" : "secondary"}
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Ulepsz ({upgrade.next_cost} pkt)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </GridBox>
        </div>
      </div>
    </SubPage>
  );
};