// src/pages/courses/components/ActivityCard.tsx
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Eye,
  MoreVertical,
  Trash2,
  Clock,
  HelpCircle,
  FileText,
  GripVertical,
  ListChecks,
  Plus,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ActivityCardProps {
  activity: {
    id: number;
    title: string;
    type: "material" | "quiz";
    position: number;
    is_published: boolean;
    duration_min?: number;
    _count?: {
      questions: number;
    };
  };
  topicPosition: number;
  onDelete: (id: number, title: string) => void;
  onEdit: (resource: string, id: number) => void;
}

export const ActivityCard = ({
  activity,
  topicPosition,
  onDelete,
  onEdit,
}: ActivityCardProps) => {
  const navigate = useNavigate();

  const getActivityIcon = () => {
    return activity.type === "quiz" ? (
      <HelpCircle className="w-4 h-4 text-blue-500" />
    ) : (
      <FileText className="w-4 h-4 text-green-500" />
    );
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <GripVertical className="w-4 h-4 text-muted-foreground" />
      {getActivityIcon()}

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {topicPosition}.{activity.position} {activity.title}
          </span>
          <Badge variant="outline" className="text-xs">
            {activity.type === "quiz" ? "Quiz" : "Materiał"}
          </Badge>
          {activity.type === "quiz" &&
            activity._count?.questions !== undefined && (
              <Badge variant="outline" className="text-xs">
                {activity._count.questions} pytań
              </Badge>
            )}
          <Badge variant={activity.is_published ? "default" : "secondary"}>
            {activity.is_published ? "Opublikowany" : "Szkic"}
          </Badge>
        </div>
        {activity.duration_min && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="w-3 h-3" />
            {activity.duration_min} min
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Szybkie akcje */}
        {activity.type === "quiz" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/questions/manage/${activity.id}`)}
            title="Zarządzaj pytaniami"
          >
            <ListChecks className="h-4 w-4" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigate(`/activities/show/${activity.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Podgląd
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit("activities", activity.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edytuj
            </DropdownMenuItem>
            {activity.type === "quiz" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate(`/questions/manage/${activity.id}`)}
                  className="text-blue-600"
                >
                  <ListChecks className="mr-2 h-4 w-4" />
                  Zarządzaj pytaniami
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/questions/create?activity_id=${activity.id}`)
                  }
                  className="text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj pytanie
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(activity.id, activity.title)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Usuń
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
