// src/pages/admin/permissions/components/TopicsTab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Button, 
  Badge,
  Alert,
  AlertDescription,
  Skeleton,
  Switch,
} from "@/components/ui";
import { 
  ListChecks, 
  Info,
  AlertCircle,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Topic } from "../assign";

interface TopicsTabProps {
  topics: Topic[];
  stats: {
    totalTopics: number;
    publishedTopics: number;
    unpublishedTopics: number;
  };
  onTogglePublish: (topic: Topic, publish: boolean) => void;
  onPublishAll: () => void;
  updatingTopic: boolean;
  loadingTopics: boolean;
}

export const TopicsTab = ({
  topics,
  stats,
  onTogglePublish,
  onPublishAll,
  updatingTopic,
  loadingTopics,
}: TopicsTabProps) => {
  const [showOnlyUnpublished, setShowOnlyUnpublished] = useState(false);

  const filteredTopics = showOnlyUnpublished 
    ? topics.filter(t => !t.is_published) 
    : topics;

  return (
    <Card>
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5" />
              Zarządzanie widocznością tematów
            </CardTitle>
            {stats.unpublishedTopics > 0 && (
              <Button 
                size="sm" 
                onClick={onPublishAll}
                disabled={updatingTopic}
              >
                <Eye className="w-4 h-4 mr-1" />
                Opublikuj wszystkie ({stats.unpublishedTopics})
              </Button>
            )}
          </div>
          
          {/* Statystyki */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Opublikowane: {stats.publishedTopics}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Szkice: {stats.unpublishedTopics}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground" />
              <span>Łącznie: {stats.totalTopics}</span>
            </div>
          </div>

          {/* Filtr */}
          <div className="flex items-center gap-2">
            <Switch 
              id="unpublished-only"
              checked={showOnlyUnpublished}
              onCheckedChange={setShowOnlyUnpublished}
            />
            <label 
              htmlFor="unpublished-only" 
              className="text-sm font-medium cursor-pointer"
            >
              Pokaż tylko nieopublikowane
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loadingTopics ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {showOnlyUnpublished 
                ? "Wszystkie tematy w tym kursie są już opublikowane."
                : "Brak tematów w tym kursie."}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            {filteredTopics.map(topic => (
              <div 
                key={topic.id} 
                className={`
                  flex items-center justify-between p-4 rounded-lg border
                  ${topic.is_published ? 'bg-background' : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900'}
                `}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{topic.position}
                    </span>
                    <h4 className="font-medium truncate">{topic.title}</h4>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>ID: {topic.id}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {topic.is_published ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Widoczny dla uczniów
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Tylko dla nauczycieli
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <Badge 
                    variant={topic.is_published ? "default" : "secondary"}
                    className={topic.is_published ? "bg-green-500" : ""}
                  >
                    {topic.is_published ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Opublikowany
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 mr-1" />
                        Szkic
                      </>
                    )}
                  </Badge>
                  <Switch
                    checked={topic.is_published}
                    onCheckedChange={(val) => onTogglePublish(topic, val)}
                    disabled={updatingTopic}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Wskazówka:</strong> Uczniowie widzą tylko opublikowane tematy. 
            Nauczyciele i administratorzy mają dostęp również do szkiców.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};