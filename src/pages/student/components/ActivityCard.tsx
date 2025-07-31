// src/components/student/ActivityCard.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Brain, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Trophy
} from "lucide-react";

interface ActivityCardProps {
  activity: {
    id: number;
    title: string;
    type: 'material' | 'quiz';
    completed?: boolean;
    score?: number | null;
    duration?: number;
    points?: number;
    courseTitle?: string;
    courseEmoji?: string;
  };
  onStart: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onStart }) => {
  const getActivityIcon = () => {
    return activity.type === 'quiz' ? Brain : BookOpen;
  };

  const getActivityTypeLabel = () => {
    return activity.type === 'quiz' ? 'Quiz' : 'Materiał';
  };

  const getActivityColor = () => {
    return activity.type === 'quiz' ? 'bg-purple-500' : 'bg-blue-500';
  };

  const Icon = getActivityIcon();

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        activity.completed ? 'bg-gray-50/50' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Ikona */}
          <div className={`p-3 rounded-xl ${getActivityColor()} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${getActivityColor().replace('bg-', 'text-')}`} />
          </div>

          {/* Treść */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-medium truncate">{activity.title}</h3>
              {activity.completed && (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {getActivityTypeLabel()}
              </Badge>
              
              {activity.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{activity.duration} min</span>
                </div>
              )}
              
              {activity.points && (
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  <span>{activity.points} pkt</span>
                </div>
              )}
              
              {activity.score !== null && activity.score !== undefined && (
                <Badge 
                  variant={activity.score >= 80 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {activity.score}%
                </Badge>
              )}
            </div>

            {activity.courseTitle && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <span>{activity.courseEmoji || '📚'}</span>
                <span>{activity.courseTitle}</span>
              </div>
            )}
          </div>

          {/* Akcja */}
          <Button
            size="sm"
            variant={activity.completed ? "ghost" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="flex-shrink-0"
          >
            {activity.completed ? (
              <>
                Powtórz
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Rozpocznij
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};