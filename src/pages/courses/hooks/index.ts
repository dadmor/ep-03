// pages/courses/hooks/index.ts
import { useNavigate, useLocation } from "react-router-dom";
import { useOne, useList, useUpdate, useInvalidate } from "@refinedev/core";
import { toast } from "sonner";
import { useState, useCallback } from "react";

// Hook do nawigacji z zachowaniem stanu powrotu
export const useNavigationHelper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const saveReturnUrl = () => {
    const currentUrl = `${location.pathname}${location.search}`;
    sessionStorage.setItem('returnUrl', currentUrl);
  };
  
  const navigateWithReturn = (path: string) => {
    saveReturnUrl();
    navigate(path);
  };
  
  const goBack = (defaultPath?: string) => {
    const returnUrl = sessionStorage.getItem('returnUrl');
    if (returnUrl) {
      sessionStorage.removeItem('returnUrl');
      navigate(returnUrl);
    } else if (defaultPath) {
      navigate(defaultPath);
    } else {
      navigate(-1);
    }
  };

  const navigateToWizard = (wizardPath: string, context?: any) => {
    if (context) {
      sessionStorage.setItem("wizardContext", JSON.stringify(context));
    }
    saveReturnUrl();
    navigate(wizardPath);
  };
  
  return { 
    navigateWithReturn, 
    goBack, 
    saveReturnUrl,
    navigateToWizard,
    currentUrl: `${location.pathname}${location.search}`
  };
};

// Hook do zmiany statusu publikacji
export const usePublishToggle = (resource: string) => {
  const { mutate: update, isLoading } = useUpdate();
  
  const togglePublish = async (
    id: number, 
    currentState: boolean, 
    title: string,
    onSuccess?: () => void
  ) => {
    update(
      {
        resource,
        id,
        values: { is_published: !currentState },
      },
      {
        onSuccess: () => {
          toast.success(
            !currentState 
              ? `${title} został opublikowany` 
              : `${title} został ukryty`
          );
          onSuccess?.();
        },
        onError: (error) => {
          toast.error("Nie udało się zmienić statusu publikacji");
          console.error("Publish toggle error:", error);
        }
      }
    );
  };
  
  return { togglePublish, isToggling: isLoading };
};

// Hook do zarządzania pozycjami
interface PositionItem {
  id: number;
  position: number;
  [key: string]: any;
}

export const usePositionManager = (resource: string) => {
  const { mutate: update } = useUpdate();
  const invalidate = useInvalidate();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updatePositions = useCallback(async (items: PositionItem[], dragInfo?: any) => {
    if (isUpdating || items.length === 0) return;
    
    setIsUpdating(true);
    
    try {
      if (dragInfo) {
        const { fromIndex, toIndex } = dragInfo;
        
        // Prosta zamiana dwóch sąsiednich elementów
        if (Math.abs(fromIndex - toIndex) === 1) {
          const item1 = items[fromIndex];
          const item2 = items[toIndex];
          
          // Użyj bardzo wysokiej tymczasowej wartości
          await new Promise<void>((resolve, reject) => {
            update({
              resource,
              id: item1.id,
              values: { position: 9999 },
              mutationMode: "pessimistic",
            }, {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            });
          });
          
          // Ustaw pozycje
          await new Promise<void>((resolve, reject) => {
            update({
              resource,
              id: item2.id,
              values: { position: fromIndex + 1 },
              mutationMode: "pessimistic",
            }, {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            });
          });
          
          await new Promise<void>((resolve, reject) => {
            update({
              resource,
              id: item1.id,
              values: { position: toIndex + 1 },
              mutationMode: "pessimistic",
            }, {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            });
          });
          
          console.log(`Swapped adjacent items at positions ${fromIndex + 1} and ${toIndex + 1}`);
        } else {
          // Dla bardziej skomplikowanych przesunięć
          const minIndex = Math.min(fromIndex, toIndex);
          const maxIndex = Math.max(fromIndex, toIndex);
          const affectedItems = items.slice(minIndex, maxIndex + 1);
          
          // Użyj unikalnego base dla tej operacji
          const tempBase = 5000 + Math.floor(Math.random() * 1000);
          
          // Przenieś affected items na tymczasowe pozycje
          for (let i = 0; i < affectedItems.length; i++) {
            await new Promise<void>((resolve, reject) => {
              update({
                resource,
                id: affectedItems[i].id,
                values: { position: tempBase + i },
                mutationMode: "pessimistic",
              }, {
                onSuccess: () => resolve(),
                onError: (error) => reject(error),
              });
            });
          }
          
          // Ustaw finalne pozycje
          for (let i = 0; i < affectedItems.length; i++) {
            await new Promise<void>((resolve, reject) => {
              update({
                resource,
                id: affectedItems[i].id,
                values: { position: minIndex + i + 1 },
                mutationMode: "pessimistic",
              }, {
                onSuccess: () => resolve(),
                onError: (error) => reject(error),
              });
            });
          }
          
          console.log(`Updated ${affectedItems.length} items from position ${minIndex + 1} to ${maxIndex + 1}`);
        }
      } else {
        // Fallback - nie powinno się wydarzyć
        console.error("No drag info provided!");
      }
      
      toast.success("Kolejność została zaktualizowana");
      
      // Zawsze odśwież dane po zakończeniu
      await invalidate({
        resource,
        invalidates: ["list"],
      });
    } catch (error: any) {
      console.error("Position update error:", error);
      toast.error("Nie udało się zaktualizować kolejności");
      
      // W razie błędu odśwież dane
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

// Hook do pobierania danych kursu
interface Topic {
  id: number;
  title: string;
  position: number;
  is_published: boolean;
  course_id: number;
  _count?: {
    activities: number;
  };
}

interface Activity {
  id: number;
  title: string;
  type: "material" | "quiz";
  position: number;
  is_published: boolean;
  duration_min?: number;
  topic_id: number;
  _count?: {
    questions: number;
  };
}

export const useCourseData = (courseId: string | undefined) => {
  // Pobierz dane kursu
  const { data: courseData, isLoading: courseLoading } = useOne({
    resource: "courses",
    id: courseId as string,
    queryOptions: {
      enabled: !!courseId,
    },
  });

  // Pobierz tematy
  const {
    data: topicsData,
    isLoading: topicsLoading,
    refetch: refetchTopics,
  } = useList<Topic>({
    resource: "topics",
    filters: [
      {
        field: "course_id",
        operator: "eq",
        value: courseId,
      },
    ],
    sorters: [
      {
        field: "position",
        order: "asc",
      },
    ],
    meta: {
      select: "*, activities(count)",
    },
    queryOptions: {
      enabled: !!courseId,
    },
  });

  // Pobierz aktywności
  const { 
    data: activitiesData, 
    refetch: refetchActivities 
  } = useList<Activity>({
    resource: "activities",
    filters: [
      {
        field: "topic_id",
        operator: "in",
        value: topicsData?.data?.map((t) => t.id) || [],
      },
    ],
    sorters: [
      {
        field: "position",
        order: "asc",
      },
    ],
    meta: {
      select: "*, questions(count)",
    },
    queryOptions: {
      enabled: !!topicsData?.data?.length,
    },
  });

  // Pobierz dostępy
  const { data: accessData } = useList({
    resource: "course_access",
    filters: [
      {
        field: "course_id",
        operator: "eq",
        value: courseId,
      },
    ],
    queryOptions: {
      enabled: !!courseId,
    },
  });

  const isLoading = courseLoading || topicsLoading;

  const stats = {
    topicsCount: topicsData?.total || 0,
    activitiesCount: activitiesData?.total || 0,
    accessCount: accessData?.total || 0,
  };

  const getActivitiesForTopic = (topicId: number) => {
    return activitiesData?.data?.filter(
      (activity) => activity.topic_id === topicId
    ) || [];
  };

  return {
    course: courseData?.data,
    topics: topicsData?.data || [],
    activities: activitiesData?.data || [],
    stats,
    isLoading,
    refetchTopics,
    refetchActivities,
    getActivitiesForTopic,
  };
};