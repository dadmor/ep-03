// src/pages/admin/permissions/components/GroupsTab.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Button, 
  Input, 
  Badge,
  Alert,
  AlertDescription,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui";
import { 
  Users, 
  Plus, 
  Search,
  Info,
  X,
  Loader2,
} from "lucide-react";
import type { Group } from "../assign";

interface GroupsTabProps {
  groups: Group[];
  courseGroups: Group[];
  onAddGroup: (groupId: number) => void;
  onRemoveGroup: (groupId: number) => void;
  creating: boolean;
  deleting: boolean;
  loadingGroups: boolean;
  loadingAccess: boolean;
}

export const GroupsTab = ({
  groups,
  courseGroups,
  onAddGroup,
  onRemoveGroup,
  creating,
  deleting,
  loadingGroups,
  loadingAccess,
}: GroupsTabProps) => {
  const [groupQuery, setGroupQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const q = groupQuery.trim().toLowerCase();
    const existing = new Set(courseGroups.map(g => g.id));
    return groups
      .filter(g => !existing.has(g.id))
      .filter(g => !q || g.name.toLowerCase().includes(q))
      .slice(0, 10);
  }, [groups, courseGroups, groupQuery]);

  const handleAddGroup = (groupId: number) => {
    onAddGroup(groupId);
    setGroupQuery("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Dodaj grupy do kursu
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Wszyscy uczniowie z przypisanych grup będą mieli dostęp do kursu</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wyszukiwarka grup */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Szukaj grupy po nazwie..." 
            value={groupQuery} 
            onChange={(e) => setGroupQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lista grup do dodania */}
        {groupQuery && (
          <div className="border rounded-lg max-h-64 overflow-auto">
            {loadingGroups ? (
              <div className="p-4 text-center">
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              </div>
            ) : filteredGroups.length > 0 ? (
              <div className="divide-y">
                {filteredGroups.map(g => (
                  <div key={g.id} className="p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{g.name}</div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddGroup(g.id)} 
                        disabled={creating}
                      >
                        {creating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1" />
                            Dodaj
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nie znaleziono grup</p>
              </div>
            )}
          </div>
        )}

        {/* Lista przypisanych grup */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            Grupy z dostępem
            <Badge variant="outline">{courseGroups.length}</Badge>
          </h4>
          {loadingAccess ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : courseGroups.length > 0 ? (
            <div className="space-y-2">
              {courseGroups.map(g => (
                <div key={g.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div className="font-medium">{g.name}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemoveGroup(g.id)} 
                    disabled={deleting}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Brak przypisanych grup. Użyj wyszukiwarki powyżej, aby dodać grupy.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};