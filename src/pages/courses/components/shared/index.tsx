// pages/courses/components/shared/index.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GridBox } from "@/components/shared";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Komponent do wyświetlania stanu ładowania
export const LoadingState = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// Komponent do wyświetlania statystyk kursu
interface CourseStatsProps {
  course: any;
  topicsCount: number;
  activitiesCount: number;
  accessCount: number;
}

export const CourseStats = ({ 
  course, 
  topicsCount, 
  activitiesCount, 
  accessCount 
}: CourseStatsProps) => (
  <GridBox variant="2-2-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant={course?.is_published ? "default" : "secondary"}>
          {course?.is_published ? "Opublikowany" : "Szkic"}
        </Badge>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Tematy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{topicsCount}</div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Aktywności</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{activitiesCount}</div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Uczestników</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{accessCount}</div>
      </CardContent>
    </Card>
  </GridBox>
);

// Wrapper komponent dla sortable item
export const SortableItem = ({ 
  id, 
  disabled = false,
  children 
}: { 
  id: number; 
  disabled?: boolean;
  children: (props: any) => React.ReactNode 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandleProps = disabled ? {} : {
    ...attributes,
    ...listeners,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandleProps, isDragging })}
    </div>
  );
};

// Generyczny komponent drag & drop z pozycjami FLOAT
interface DraggableListProps<T extends { id: number; position: number }> {
  items: T[];
  renderItem: (item: T, index: number, dragHandleProps?: any) => React.ReactNode;
  onReorder: (itemId: number, newPosition: number) => void;
  className?: string;
  disabled?: boolean;
}

export const DraggableList = <T extends { id: number; position: number }>({
  items,
  renderItem,
  onReorder,
  className = "space-y-2",
  disabled = false,
}: DraggableListProps<T>) => {
  const [localItems, setLocalItems] = useState<T[]>(items);
  const [activeId, setActiveId] = useState<number | null>(null);
  
  // Aktualizuj lokalny stan gdy zmienią się elementy z API
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item.id === Number(active.id));
      const newIndex = localItems.findIndex((item) => item.id === Number(over.id));
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        // Najpierw zaktualizuj lokalny stan dla natychmiastowego feedbacku
        const newItems = arrayMove(localItems, oldIndex, newIndex);
        setLocalItems(newItems);
        
        // Oblicz nową pozycję float
        let newPosition: number;
        const movedItem = localItems[oldIndex];
        
        if (newIndex === 0) {
          // Przeniesiony na początek
          newPosition = localItems[0].position / 2;
        } else if (newIndex === localItems.length - 1) {
          // Przeniesiony na koniec
          newPosition = localItems[localItems.length - 1].position + 1000;
        } else {
          // Przeniesiony między dwa elementy
          if (oldIndex < newIndex) {
            // Przesuwamy w dół
            const afterItem = localItems[newIndex];
            const beforeItem = newIndex + 1 < localItems.length ? localItems[newIndex + 1] : null;
            
            if (beforeItem) {
              newPosition = (afterItem.position + beforeItem.position) / 2;
            } else {
              newPosition = afterItem.position + 1000;
            }
          } else {
            // Przesuwamy w górę
            const beforeItem = newIndex > 0 ? localItems[newIndex - 1] : null;
            const afterItem = localItems[newIndex];
            
            if (beforeItem) {
              newPosition = (beforeItem.position + afterItem.position) / 2;
            } else {
              newPosition = afterItem.position / 2;
            }
          }
        }
        
        // Wywołaj callback tylko dla przenoszonego elementu
        onReorder(movedItem.id, newPosition);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localItems.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>
          {localItems.map((item, index) => (
            <SortableItem 
              key={item.id} 
              id={item.id}
              disabled={disabled}
            >
              {(props: any) => renderItem(item, index, props.dragHandleProps)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};