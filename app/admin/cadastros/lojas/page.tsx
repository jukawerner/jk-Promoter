"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { StoreCard } from "@/components/admin/stores/store-card";
import { StoreForm } from "@/components/admin/stores/store-form";
import { StoreFilter } from "@/components/admin/stores/store-filter";
import { ExcelUpload } from "@/components/admin/stores/excel-upload";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Store {
  id: number;
  nome: string;
  cnpj: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  rede_id: number;
  promotor_id: string | null;
  rede: {
    id: number;
    nome: string;
  };
  usuario?: {
    id: string;
    nome: string;
    avatar_url: string;
  } | null;
}

export default function CadastroLojas() {
  const [showForm, setShowForm] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [filters, setFilters] = useState({
    search: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setIsLoading(true);
      console.log("Carregando lojas...");
      
      const { data, error } = await supabase
        .from("loja")
        .select(`
          *,
          usuario:promotor_id (
            id,
            nome,
            avatar_url
          ),
          rede:rede_id (
            id,
            nome
          )
        `)
        .order("nome");

      if (error) {
        console.error("Erro ao carregar lojas:", error);
        throw error;
      }

      console.log("Lojas carregadas:", data);
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
        store.usuario?.nome?.toLowerCase().includes(searchTerm)
      );
    });
  }, [stores, filters]);

  const handleSaveStore = async (storeData: any) => {
    try {
      await loadStores(); // Recarrega a lista após salvar
      setShowForm(false);
      setEditingStore(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar loja:", error);
      toast.error("Erro ao salvar loja");
    }
  };

  const handleEditStore = (store: Store) => {
    console.log("Editando loja:", store);
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
      loadStores();
    } catch (error) {
      console.error("Erro ao excluir loja:", error);
      toast.error("Erro ao excluir loja");
    }
  };

  const handleImportStores = async (stores: Omit<Store, "id">[]) => {
    try {
      const { error } = await supabase
        .from("loja")
        .insert(stores.map(store => ({
          ...store,
          promotor_id: store.promotor_id === "null" ? null : store.promotor_id
        })));

      if (error) throw error;
      toast.success("Lojas importadas com sucesso!");
      loadStores();
    } catch (error) {
      console.error("Erro ao importar lojas:", error);
      toast.error("Erro ao importar lojas");
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
          <ExcelUpload onImport={handleImportStores} />
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
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
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
    </motion.div>
  );
}
