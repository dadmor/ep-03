// pages/courses/hooks/usePositionManager.ts
import { useUpdate, useInvalidate } from "@refinedev/core";
import { toast } from "sonner";
import { useState, useCallback } from "react";

interface PositionItem {
  id: number;
  position: number;
  [key: string]: any;
}

export const usePositionManager = (resource: string) => {
  const { mutate: update } = useUpdate();
  const invalidate = useInvalidate();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updatePositions = useCallback(async (items: PositionItem[]) => {
    if (isUpdating || items.length === 0) return;
    
    setIsUpdating(true);
    
    try {
      // Generuj losowe wysokie liczby dla tymczasowych pozycji
      const randomBase = Math.floor(Math.random() * 900000) + 100000;
      
      // Krok 1: Przenieś wszystkie na losowe tymczasowe pozycje
      for (let i = 0; i < items.length; i++) {
        await update({
          resource,
          id: items[i].id,
          values: { 
            position: randomBase + i 
          },
          mutationMode: "pessimistic",
        }, {
          successNotification: false,
          errorNotification: false,
        });
      }
      
      // Krok 2: Ustaw właściwe pozycje
      for (let i = 0; i < items.length; i++) {
        await update({
          resource,
          id: items[i].id,
          values: { 
            position: i + 1 
          },
          mutationMode: "pessimistic",
        }, {
          successNotification: false,
          errorNotification: false,
        });
      }
      
      // Odśwież dane
      await invalidate({
        resource,
        invalidates: ["list"],
      });
      
      toast.success("Kolejność została zaktualizowana");
    } catch (error: any) {
      console.error("Position update error:", error);
      toast.error("Nie udało się zaktualizować kolejności");
      
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