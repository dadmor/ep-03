// src/pages/courses/components/TopicCard.tsx
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Plus,
  MoreVertical,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  FileText,
  Clock,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  activitiesCount,
}: TopicCardProps) => {
  const navigate = useNavigate();

  // Funkcja do nawigacji z zachowaniem stanu
  const handleNavigateWithState = (path: string) => {
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem("returnUrl", currentUrl);
    navigate(path);
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
      isExpanded ? 'shadow-sm' : ''
    }`}>
      <div className={`p-4 transition-colors duration-200 ${
        isExpanded ? 'bg-muted/50 border-b' : 'bg-background hover:bg-muted/30'
      }`}>
        <FlexBox>
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={onToggle}
              className="p-1 rounded hover:bg-muted transition-colors"
              aria-label={isExpanded ? "Zwiń temat" : "Rozwiń temat"}
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            
            <div className="cursor-move">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>

            <div 
              className="flex-1 cursor-pointer group" 
              onClick={onToggle}
            >
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-base group-hover:text-primary transition-colors">
                  Temat {topic.position}: {topic.title}
                </h4>
                <Badge 
                  variant={topic.is_published ? "default" : "secondary"}
                  className="text-xs"
                >
                  {topic.is_published ? "Opublikowany" : "Szkic"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {activitiesCount} {activitiesCount === 1 ? 'aktywność' : 'aktywności'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                handleNavigateWithState(
                  `/activities/create?topic_id=${topic.id}`
                )
              }
              title="Dodaj aktywność"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit("topics", topic.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edytuj temat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    handleNavigateWithState(
                      `/activities/create?topic_id=${topic.id}`
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj aktywność
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(topic.id, topic.title)}
                  className="text-red-600 focus:text-red-600"
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
        <div className="p-4 bg-muted/10">
          <div className="space-y-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};