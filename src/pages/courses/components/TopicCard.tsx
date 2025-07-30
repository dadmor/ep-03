// src/pages/courses/components/TopicCard.tsx
export * from './TopicCard';
export * from './ActivityCard';

// TopicCard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUpdate } from "@refinedev/core";
import { 
  Edit, Plus, MoreVertical, Trash2, 
  ChevronDown, ChevronRight, GripVertical 
} from "lucide-react";
import { Button, Badge, Input } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface TopicCardProps {
  topic: {
    id: number;
    title: string;
    position: number;
    is_published: boolean;
  };
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (id: number, title: string) => void;
  onEdit: (resource: string, id: number) => void;
  children?: React.ReactNode;
  activitiesCount: number;
}

export const TopicCard = ({ 
  topic, 
  isExpanded, 
  onToggle, 
  onDelete, 
  onEdit,
  children,
  activitiesCount
}: TopicCardProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(topic.title);
  const { mutate: updateTopic } = useUpdate();

  const handleSaveTitle = () => {
    if (editingTitle.trim() && editingTitle !== topic.title) {
      updateTopic(
        {
          resource: "topics",
          id: topic.id,
          values: { title: editingTitle },
        },
        {
          onSuccess: () => {
            toast.success("Tytuł tematu został zaktualizowany");
            setIsEditing(false);
          },
        }
      );
    } else {
      setIsEditing(false);
      setEditingTitle(topic.title);
    }
  };

  return (
    <div className="border rounded-lg">
      <div className="p-4 bg-muted/30">
        <FlexBox>
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={onToggle}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            
            {isEditing ? (
              <Input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditingTitle(topic.title);
                  }
                }}
                className="h-8 flex-1"
                autoFocus
              />
            ) : (
              <div className="flex-1 cursor-pointer" onClick={onToggle}>
                <h4 className="font-medium">
                  {topic.position}. {topic.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {activitiesCount} aktywności
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={topic.is_published ? "default" : "secondary"}>
              {topic.is_published ? "Opublikowany" : "Szkic"}
            </Badge>
            
            {/* Szybkie akcje */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/activities/create?topic_id=${topic.id}`)}
              title="Dodaj aktywność"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Zmień nazwę
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit("topics", topic.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edytuj szczegóły
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/activities/create?topic_id=${topic.id}`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj aktywność
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(topic.id, topic.title)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Usuń temat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </FlexBox>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};