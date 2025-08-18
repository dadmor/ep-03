// src/pages/admin/vendors/list.tsx
import { useTable, useUpdate, useDelete, useNavigation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Globe, Calendar, Power, Edit, Eye, Trash2, Plus, Search } from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { PaginationSwith } from "@/components/navigation";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";
import { Badge, Input, Button, Switch } from "@/components/ui";
import { SubPage } from "@/components/layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface Vendor {
  id: number;
  name: string;
  subdomain: string;
  is_active: boolean;
  created_at: string;
}

export const VendorsList = () => {
  const { create, edit, show } = useNavigation();
  const { mutate: updateVendor } = useUpdate();
  const { mutate: deleteVendor } = useDelete();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  
  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable<Vendor>({
    resource: "vendors",
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });
  
  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const handleToggleActive = async (vendor: Vendor) => {
    await updateVendor({
      resource: "vendors",
      id: vendor.id,
      values: {
        is_active: !vendor.is_active,
      },
      successNotification: () => ({
        message: vendor.is_active ? "Organizacja dezaktywowana" : "Organizacja aktywowana",
        type: "success",
      }),
    });
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) return;
    
    await deleteVendor({
      resource: "vendors",
      id: vendorToDelete.id,
      successNotification: () => ({
        message: "Organizacja została usunięta",
        type: "success",
      }),
      errorNotification: () => ({
        message: "Nie można usunąć organizacji - prawdopodobnie ma przypisanych użytkowników",
        type: "error",
      }),
    });
    
    setDeleteModalOpen(false);
    setVendorToDelete(null);
  };

  return (
    <SubPage>
      <FlexBox>
        <Lead
          title="Organizacje"
          description="Zarządzaj wszystkimi organizacjami w systemie"
        />
        <Button onClick={() => create("vendors")}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj organizację
        </Button>
      </FlexBox>

      <FlexBox>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Szukaj organizacji..."
            className="pl-10"
            onChange={(e) => {
              setFilters([
                {
                  operator: "or",
                  value: [
                    {
                      field: "name",
                      operator: "contains",
                      value: e.target.value,
                    },
                    {
                      field: "subdomain",
                      operator: "contains",
                      value: e.target.value,
                    },
                  ],
                },
              ]);
            }}
          />
        </div>
      </FlexBox>

      <GridBox>
        {data?.data?.map((vendor) => (
          <Card key={vendor.id} className={!vendor.is_active ? "opacity-60" : ""}>
            <CardHeader>
              <FlexBox>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {vendor.name}
                </CardTitle>
                <Badge variant={vendor.is_active ? "default" : "secondary"}>
                  {vendor.is_active ? "Aktywna" : "Nieaktywna"}
                </Badge>
              </FlexBox>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-3 h-3" />
                <span>{vendor.subdomain}.smartup.pl</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Utworzono: {new Date(vendor.created_at).toLocaleDateString('pl-PL')}</span>
              </div>
              
              <div className="flex items-center gap-2 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Aktywna:</span>
                  <Switch
                    checked={vendor.is_active}
                    onCheckedChange={() => handleToggleActive(vendor)}
                  />
                </div>
                
                <div className="ml-auto flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => show("vendors", vendor.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => edit("vendors", vendor.id)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteClick(vendor)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </GridBox>

      {data?.data?.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nie znaleziono organizacji</p>
        </div>
      )}

      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="organizacji"
      />

      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Usunięcie organizacji <strong>{vendorToDelete?.name}</strong> jest nieodwracalne.
              Upewnij się, że organizacja nie ma przypisanych użytkowników.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SubPage>
  );
};