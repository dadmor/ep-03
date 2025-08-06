// pages/courses/hooks/useSmartPositionUpdate.ts
import { useUpdate, useInvalidate } from "@refinedev/core";
import { toast } from "sonner";
import { useState, useCallback } from "react";

interface PositionItem {
  id: number;
  position: number;
  [key: string]: any; // Pozwól na dodatkowe pola jak topic_id
}

export const useSmartPositionUpdate = (resource: string) => {
  const { mutate: update } = useUpdate();
  const invalidate = useInvalidate();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updatePositions = useCallback(async (items: PositionItem[]) => {
    if (isUpdating || items.length === 0) return;
    
    setIsUpdating(true);
    
    try {
      // Strategia 1: Dla małej liczby elementów - sekwencyjna aktualizacja
      if (items.length <= 5) {
        // Sortuj elementy według docelowych pozycji
        const sortedItems = [...items].sort((a, b) => a.position - b.position);
        
        // Najpierw przesuń wszystkie na tymczasowe pozycje
        for (let i = 0; i < sortedItems.length; i++) {
          await update({
            resource,
            id: sortedItems[i].id,
            values: { 
              position: 9000 + i, // Bardzo wysokie tymczasowe pozycje
            },
            mutationMode: "pessimistic",
          }, {
            successNotification: false,
            errorNotification: false,
          });
        }
        
        // Teraz ustaw właściwe pozycje
        for (let i = 0; i < sortedItems.length; i++) {
          await update({
            resource,
            id: sortedItems[i].id,
            values: { 
              position: i + 1,
            },
            mutationMode: "pessimistic",
          }, {
            successNotification: false,
            errorNotification: false,
          });
        }
      } else {
        // Strategia 2: Dla większej liczby elementów - batch update przez RPC
        // Jeśli masz funkcję RPC w Supabase, użyj jej tutaj
        // Na razie używamy sekwencyjnej aktualizacji
        
        const maxExistingPosition = Math.max(...items.map(item => item.position));
        const offset = maxExistingPosition + 100;
        
        // Krok 1: Przenieś wszystkie elementy poza zakres
        const tempMoves = items.map((item, index) =>
          update({
            resource,
            id: item.id,
            values: { position: offset + index },
            mutationMode: "pessimistic",
          }, {
            successNotification: false,
            errorNotification: false,
          })
        );
        
        await Promise.all(tempMoves);
        
        // Krok 2: Ustaw finalne pozycje
        const finalMoves = items.map((item, index) =>
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
        
        await Promise.all(finalMoves);
      }
      
      // Odśwież dane
      await invalidate({
        resource,
        invalidates: ["list", "detail"],
      });
      
      // Nie pokazuj toast dla każdej małej zmiany
      if (items.length > 1) {
        toast.success("Kolejność została zaktualizowana");
      }
    } catch (error: any) {
      console.error("Position update error:", error);
      toast.error("Nie udało się zaktualizować kolejności");
      
      // Zawsze odśwież dane w przypadku błędu
      await invalidate({
        resource,
        invalidates: ["list", "detail"],
      });
    } finally {
      setIsUpdating(false);
    }
  }, [resource, update, invalidate, isUpdating]);
  
  // Funkcja do aktualizacji pojedynczej pozycji (np. po dodaniu nowego elementu)
  const updateSinglePosition = useCallback(async (id: number, newPosition: number) => {
    try {
      await update({
        resource,
        id,
        values: { position: newPosition },
        mutationMode: "pessimistic",
      });
      
      await invalidate({
        resource,
        invalidates: ["list", "detail"],
      });
    } catch (error) {
      console.error("Single position update error:", error);
      toast.error("Nie udało się zaktualizować pozycji");
    }
  }, [resource, update, invalidate]);
  
  return { 
    updatePositions,
    updateSinglePosition,
    isUpdating
  };
};