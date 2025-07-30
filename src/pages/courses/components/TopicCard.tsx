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
    <div className="border rounded-lg">
      <div className="p-4 bg-muted/30">
        <FlexBox>
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={onToggle}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            <GripVertical className="w-4 h-4 text-muted-foreground" />

            <div className=" cursor-pointer" onClick={onToggle}>
              <h4 className="font-medium">
                {topic.position}. {topic.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {activitiesCount} aktywności
              </p>
            </div>

            <Badge variant={topic.is_published ? "default" : "secondary"}>
              {topic.is_published ? "Opublikowany" : "Szkic"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Szybkie akcje */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                handleNavigateWithState(
                  `/activities/create?topic_id=${topic.id}`
                )
              }
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

      {isExpanded && <div className="p-4 space-y-2">{children}</div>}
    </div>
  );
};
