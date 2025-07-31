import { useTable, useNavigation, useDelete } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  MoreVertical,
  BookOpen
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
  group_members?: Array<{ count: number }>;
  course_access?: Array<{ count: number }>;
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
      select: '*, group_members:group_members(count), course_access:course_access(count)'
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
          <Card 
            key={group.id} 
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={(e) => {
              // Sprawdź czy nie kliknięto w dropdown menu
              if (!(e.target as HTMLElement).closest('[role="menu"]')) {
                show("groups", group.id);
              }
            }}
          >
            <CardHeader>
              <FlexBox>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {group.name}
                </CardTitle>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
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
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Rok akademicki: {group.academic_year}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-background rounded-md">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Uczniowie</p>
                        <p className="text-lg font-semibold">
                          {group.group_members?.[0]?.count || group._count?.group_members || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-background rounded-md">
                        <BookOpen className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Kursy</p>
                        <p className="text-lg font-semibold">
                          {group.course_access?.[0]?.count || group._count?.course_access || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Badge variant={group.is_active ? "default" : "secondary"}>
                    {group.is_active ? "Aktywna" : "Nieaktywna"}
                  </Badge>
                </div>
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