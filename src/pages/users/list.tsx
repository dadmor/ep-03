import { useTable, useNavigation, useDelete } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  GraduationCap,
  UserCircle,
  MoreVertical,
  Search
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  is_active: boolean;
  created_at: string;
  vendor_id: number;
  user_stats?: {
    total_points: number;
    current_level: number;
  };
}

export const UsersList = () => {
  const { create, edit, show } = useNavigation();
  const { mutate: deleteUser } = useDelete();
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable<User>({
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
    meta: {
      select: '*, user_stats(total_points, current_level)'
    }
  });
  
  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Czy na pewno chcesz usunąć użytkownika "${name}"?`)) {
      deleteUser({
        resource: "users",
        id,
      });
    }
  };

  const handleSearch = (value: string) => {
    const filters: any[] = [];
    
    if (value) {
      filters.push({
        operator: "or",
        value: [
          {
            field: "full_name",
            operator: "contains",
            value,
          },
          {
            field: "email",
            operator: "contains",
            value,
          },
        ],
      });
    }
    
    if (roleFilter !== "all") {
      filters.push({
        field: "role",
        operator: "eq",
        value: roleFilter,
      });
    }
    
    setFilters(filters);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'teacher':
        return <GraduationCap className="w-3 h-3" />;
      default:
        return <UserCircle className="w-3 h-3" />;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'teacher':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <SubPage>
      <FlexBox>
        <Lead
          title="Użytkownicy"
          description="Zarządzaj użytkownikami systemu"
        />
        <Button onClick={() => create("users")}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj użytkownika
        </Button>
      </FlexBox>

      <FlexBox className="gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Szukaj po nazwie lub email..."
            className="pl-10"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <Select value={roleFilter} onValueChange={(value) => {
          setRoleFilter(value);
          handleSearch("");
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtruj po roli" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie role</SelectItem>
            <SelectItem value="student">Studenci</SelectItem>
            <SelectItem value="teacher">Nauczyciele</SelectItem>
            <SelectItem value="admin">Administratorzy</SelectItem>
          </SelectContent>
        </Select>
      </FlexBox>

      <div className="space-y-4">
        {data?.data?.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">{user.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  
                  <Badge variant={getRoleVariant(user.role)}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1 capitalize">{user.role}</span>
                  </Badge>
                  
                  <Badge variant={user.is_active ? "outline" : "secondary"}>
                    {user.is_active ? "Aktywny" : "Nieaktywny"}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6">
                  {user.user_stats && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Punkty</p>
                      <p className="font-semibold">{user.user_stats.total_points}</p>
                    </div>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => show("users", user.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Podgląd
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => edit("users", user.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edytuj
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(user.id, user.full_name)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Usuń
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="użytkowników"
      />
    </SubPage>
  );
};