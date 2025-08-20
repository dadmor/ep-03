// src/pages/admin/permissions/groups.tsx
import { useState, useMemo } from "react";
import { useList, useCreate, useUpdate, useNotification } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Button,
  Badge,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
} from "@/components/ui";
import { Users, Plus, Search, Calendar, User, Edit } from "lucide-react";

type Group = {
  id: number;
  name: string;
  academic_year: string;
  is_active: boolean;
  created_at: string;
};

type GroupMember = {
  group_id: number;
  user_id: string;
};

type User = {
  id: string;
  full_name: string;
  email: string;
};

export const GroupManagement = () => {
  const { open } = useNotification();
  const [search, setSearch] = useState("");
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupYear, setNewGroupYear] = useState(new Date().getFullYear().toString());
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const { data: groupsData, isLoading: loadingGroups, refetch: refetchGroups } = useList<Group>({
    resource: "groups",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "name", order: "asc" }],
  });

  const { data: membersData, isLoading: loadingMembers } = useList<GroupMember>({
    resource: "group_members",
    pagination: { pageSize: 10000 },
  });

  const { data: usersData } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "student" }],
    pagination: { pageSize: 10000 },
  });

  const { mutate: createGroup, isLoading: creating } = useCreate();
  const { mutate: updateGroup, isLoading: updating } = useUpdate();

  const groups = groupsData?.data ?? [];
  const members = membersData?.data ?? [];
  const users = usersData?.data ?? [];

  // Filtrowanie grup
  const filteredGroups = groups.filter(group =>
    search === "" || 
    group.name.toLowerCase().includes(search.toLowerCase()) ||
    group.academic_year.includes(search)
  );

  // Liczba członków w każdej grupie
  const memberCountMap = useMemo(() => {
    const map = new Map<number, number>();
    members.forEach(m => {
      map.set(m.group_id, (map.get(m.group_id) ?? 0) + 1);
    });
    return map;
  }, [members]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;

    createGroup(
      {
        resource: "groups",
        values: {
          name: newGroupName,
          academic_year: newGroupYear,
          vendor_id: 1, // Zakładamy vendor_id = 1
        },
        successNotification: () => ({
          message: "Grupa została utworzona",
          type: "success"
        }),
      },
      {
        onSuccess: () => {
          setShowNewGroupDialog(false);
          setNewGroupName("");
          refetchGroups();
        }
      }
    );
  };

  const handleToggleActive = (groupId: number, isActive: boolean) => {
    updateGroup(
      {
        resource: "groups",
        id: groupId,
        values: { is_active: isActive },
        successNotification: () => ({
          message: isActive ? "Grupa aktywowana" : "Grupa dezaktywowana",
          type: "success"
        }),
      },
      { onSuccess: () => refetchGroups() }
    );
  };

  return (
    <SubPage>
      <Lead 
        title="Zarządzanie grupami" 
        description="Twórz i zarządzaj grupami uczniów"
      />

      {/* Nagłówek z przyciskiem */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj grupy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowNewGroupDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nowa grupa
        </Button>
      </div>

      {/* Lista grup */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Grupy uczniów
            </CardTitle>
            <Badge variant="outline">
              {filteredGroups.length} grup
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadingGroups ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Nie znaleziono grup</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa grupy</TableHead>
                    <TableHead>Rok akademicki</TableHead>
                    <TableHead>Liczba uczniów</TableHead>
                    <TableHead>Data utworzenia</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map(group => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div className="font-medium">{group.name}</div>
                      </TableCell>
                      <TableCell>{group.academic_year}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {memberCountMap.get(group.id) ?? 0} uczniów
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(group.created_at).toLocaleDateString('pl-PL')}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={group.is_active ? "default" : "secondary"}>
                          {group.is_active ? "Aktywna" : "Nieaktywna"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog tworzenia nowej grupy */}
      <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Utwórz nową grupę</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa grupy</Label>
              <Input
                id="name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="np. Klasa 3A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Rok akademicki</Label>
              <Input
                id="year"
                value={newGroupYear}
                onChange={(e) => setNewGroupYear(e.target.value)}
                placeholder="np. 2024/2025"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewGroupDialog(false)}>
              Anuluj
            </Button>
            <Button onClick={handleCreateGroup} disabled={creating || !newGroupName.trim()}>
              Utwórz grupę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SubPage>
  );
};