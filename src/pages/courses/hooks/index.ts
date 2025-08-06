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
  
  const updatePositions = useCallback(async (items: PositionItem[]) => {
    if (isUpdating || items.length === 0) return;
    
    setIsUpdating(true);
    
    try {
      // Użyj MAŁYCH wartości tymczasowych - smallint ma zakres do 32767
      const tempBase = 1000;
      
      // Krok 1: Przenieś wszystkie na tymczasowe pozycje
      for (let i = 0; i < items.length; i++) {
        await update({
          resource,
          id: items[i].id,
          values: { 
            position: tempBase + i
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