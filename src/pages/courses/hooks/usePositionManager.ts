// pages/courses/hooks/usePositionManager.ts
import { useUpdate, useInvalidate } from "@refinedev/core";
import { toast } from "sonner";
import { useState, useCallback } from "react";

interface PositionItem {
  id: number;
  position: number;
}

export const usePositionManager = (resource: string) => {
  const { mutate: update } = useUpdate();
  const invalidate = useInvalidate();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updatePositions = useCallback(async (items: PositionItem[]) => {
    if (isUpdating) return; // Zapobiegaj wielokrotnym wywołaniom
    
    setIsUpdating(true);
    
    try {
      // Grupuj aktualizacje w batch
      const updates = items.map((item, index) => ({
        id: item.id,
        newPosition: index + 1,
        currentPosition: item.position
      }));
      
      // Sortuj aktualizacje, aby uniknąć konfliktów
      const sortedUpdates = updates.sort((a, b) => {
        // Najpierw przenieś elementy, które idą w dół
        if (a.newPosition > a.currentPosition && b.newPosition <= b.currentPosition) return -1;
        if (b.newPosition > b.currentPosition && a.newPosition <= a.currentPosition) return 1;
        return 0;
      });
      
      // Wykonaj aktualizacje
      for (const update of sortedUpdates) {
        await updatePosition(update.id, update.newPosition);
      }
      
      // Odśwież dane
      await invalidate({
        resource,
        invalidates: ["list", "detail"],
      });
      
      toast.success("Kolejność została zaktualizowana");
    } catch (error: any) {
      toast.error("Nie udało się zaktualizować kolejności");
      console.error("Position update error:", error);
      
      // Odśwież dane w przypadku błędu
      await invalidate({
        resource,
        invalidates: ["list", "detail"],
      });
      
      throw error; // Rzuć błąd dalej, aby obsłużyć w komponencie
    } finally {
      setIsUpdating(false);
    }
  }, [resource, update, invalidate, isUpdating]);
  
  const updatePosition = async (id: number, position: number) => {
    return update({
      resource,
      id,
      values: { position },
      mutationMode: "optimistic", // Użyj trybu optimistic
    }, {
      successNotification: false,
      errorNotification: false,
    });
  };
  
  return { 
    updatePositions,
    isUpdating
  };
};