"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { StoreCard } from "@/components/admin/stores/store-card";
import { StoreForm } from "@/components/admin/stores/store-form";
import { StoreFilter } from "@/components/admin/stores/store-filter";
import { ImportModal } from "@/components/admin/stores/import-modal";
import { Plus, Upload, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Store } from "@/types/store";

export default function CadastroLojas() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filters, setFilters] = useState({
    search: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("loja")
        .select(`
          *,
          usuario:promotor_id (
            id,
            nome,
            apelido,
            avatar_url
          ),
          rede:rede_id (
            id,
            nome
          )
        `)
        .order("nome");

      if (error) throw error;

      setStores(data || []);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      toast.error("Erro ao carregar lojas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const filteredStores = useMemo(() => {
    if (!filters.search) return stores;
    
    const searchTerm = filters.search.toLowerCase();
    return stores.filter(store => {
      return (
        store.rede?.nome?.toLowerCase().includes(searchTerm) ||
        store.nome?.toLowerCase().includes(searchTerm) ||
        store.usuario?.apelido?.toLowerCase().includes(searchTerm)
      );
    });
  }, [stores, filters]);

  const handleSaveStore = async (storeData: Omit<Store, 'id' | 'rede' | 'usuario'>) => {
    try {
      const { error } = await supabase
        .from("loja")
        .upsert({
          ...storeData,
          id: selectedStore?.id,
        });

      if (error) throw error;

      toast.success(selectedStore ? "Loja atualizada com sucesso!" : "Loja criada com sucesso!");
      await loadStores();
      setIsDialogOpen(false);
      setSelectedStore(null);
    } catch (error) {
      console.error("Erro ao salvar loja:", error);
      toast.error("Erro ao salvar loja");
    }
  };

  const handleEditStore = (store: Store) => {
    setSelectedStore(store);
    setIsDialogOpen(true);
  };

  const handleDeleteStore = async (store: Store) => {
    if (!confirm("Tem certeza que deseja excluir esta loja?")) return;

    try {
      const { error } = await supabase
        .from("loja")
        .delete()
        .eq("id", store.id);

      if (error) throw error;
      
      toast.success("Loja excluída com sucesso!");
      await loadStores();
    } catch (error) {
      console.error("Erro ao excluir loja:", error);
      toast.error("Erro ao excluir loja");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Lojas</h1>
          <p className="text-gray-600 mt-2">Gerencie as lojas do sistema</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar Excel
          </Button>
          <Button
            onClick={() => {
              setSelectedStore(null);
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Loja
          </Button>
        </div>
      </div>

      <StoreFilter
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onEdit={handleEditStore}
              onDelete={handleDeleteStore}
            />
          ))}
          {filteredStores.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              Nenhuma loja encontrada
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStore ? "Editar Loja" : "Nova Loja"}
            </DialogTitle>
          </DialogHeader>
          <StoreForm
            store={selectedStore}
            onSave={handleSaveStore}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={loadStores}
      />
    </motion.div>
  );
}
