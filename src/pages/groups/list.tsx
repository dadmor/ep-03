import { useTable, useNavigation, useDelete } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  MoreVertical
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { PaginationSwith } from "@/components/navigation";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";
import { Badge, Button, Input } from "@/components/ui";
import { SubPage } from "@/components/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Group {
  id: number;
  name: string;
  academic_year: string;
  is_active: boolean;
  created_at: string;
  vendor_id: number;
  _count?: {
    group_members: number;
    course_access: number;
  };
}

export const GroupsList = () => {
  const { create, edit, show } = useNavigation();
  const { mutate: deleteGroup } = useDelete();
  
  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable<Group>({
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
    meta: {
      select: '*, group_members(count), course_access(count)'
    }
  });
  
  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Czy na pewno chcesz usunąć grupę "${name}"?`)) {
      deleteGroup({
        resource: "groups",
        id,
      });
    }
  };

  return (
    <SubPage>
      <FlexBox>
        <Lead
          title="Grupy"
          description="Zarządzaj grupami uczniów"
        />
        <Button onClick={() => create("groups")}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj grupę
        </Button>
      </FlexBox>

      <FlexBox>
        <Input
          placeholder="Szukaj grup..."
          className="max-w-sm"
          onChange={(e) => {
            setFilters([
              {
                field: "name",
                operator: "contains",
                value: e.target.value,
              },
            ]);
          }}
        />
      </FlexBox>

      <GridBox>
        {data?.data?.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <FlexBox>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {group.name}
                </CardTitle>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => show("groups", group.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Podgląd
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => edit("groups", group.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edytuj
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(group.id, group.name)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Usuń
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </FlexBox>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {group.academic_year}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {group._count?.group_members || 0} uczniów
                  </span>
                </div>
                
                <Badge variant={group.is_active ? "default" : "secondary"}>
                  {group.is_active ? "Aktywna" : "Nieaktywna"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </GridBox>

      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="grup"
      />
    </SubPage>
  );
};