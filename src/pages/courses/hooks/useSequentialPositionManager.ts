// pages/courses/hooks/useSequentialPositionManager.ts
import { useUpdate, useInvalidate } from "@refinedev/core";
import { toast } from "sonner";
import { useState, useCallback } from "react";

interface PositionItem {
  id: number;
  position: number;
  topic_id?: number;
}

export const useSequentialPositionManager = (resource: string) => {
  const { mutate: update } = useUpdate();
  const invalidate = useInvalidate();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updatePositions = useCallback(async (items: PositionItem[]) => {
    if (isUpdating || items.length === 0) return;
    
    setIsUpdating(true);
    
    try {
      // Dla aktywności używamy sekwencyjnej aktualizacji
      if (resource === 'activities') {
        // Krok 1: Przenieś wszystkie na wysokie pozycje (sekwencyjnie)
        for (let i = 0; i < items.length; i++) {
          await update({
            resource,
            id: items[i].id,
            values: { position: 1000 + i },
            mutationMode: "pessimistic",
          }, {
            successNotification: false,
            errorNotification: false,
          });
        }
        
        // Krok 2: Ustaw właściwe pozycje (sekwencyjnie)
        for (let i = 0; i < items.length; i++) {
          await update({
            resource,
            id: items[i].id,
            values: { position: i + 1 },
            mutationMode: "pessimistic",
          }, {
            successNotification: false,
            errorNotification: false,
          });
        }
      } else {
        // Dla tematów używamy równoległej aktualizacji (działało dobrze)
        const updatePromises = items.map((item, index) =>
          update({
            resource,
            id: item.id,
            values: { position: index + 1 },
            mutationMode: "pessimistic",
          }, {
            successNotification: false,
            errorNotification: false,
          })
        );
        
        await Promise.all(updatePromises);
      }
      
      // Odśwież dane
      await invalidate({
        resource,
        invalidates: ["list"],
      });
      
      toast.success("Kolejność została zaktualizowana");
    } catch (error: any) {
      toast.error("Nie udało się zaktualizować kolejności");
      console.error("Position update error:", error);
      
      // Odśwież dane w przypadku błędu
      await invalidate({
        resource,
        invalidates: ["list"],
      });
    } finally {
      setIsUpdating(false);
    }
  }, [resource, update, invalidate, isUpdating]);
  
  return { 
    updatePositions,
    isUpdating
  };
};