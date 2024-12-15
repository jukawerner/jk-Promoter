"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StoreForm } from "@/components/admin/stores/store-form";
import { StoreCard } from "@/components/admin/stores/store-card";
import { StoreFilter } from "@/components/admin/stores/store-filter";
import { ExcelUpload } from "@/components/admin/stores/excel-upload";
import { supabase } from "@/lib/supabase";

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
  } | null;
}

export default function CadastroLojas() {
  const [showForm, setShowForm] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [filters, setFilters] = useState({
    rede: "",
    loja: "",
    cidade: "",
  });
  const [isLoading, setIsLoading] = useState(true);

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
            nome
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

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const redeMatch = store.rede?.nome?.toLowerCase().includes(filters.rede.toLowerCase());
      const lojaMatch = store.nome?.toLowerCase().includes(filters.loja.toLowerCase());
      const cidadeMatch = store.cidade?.toLowerCase().includes(filters.cidade.toLowerCase());
      
      return redeMatch && lojaMatch && cidadeMatch;
    });
  }, [stores, filters]);

  const handleSaveStore = async (storeData: any) => {
    try {
      await loadStores(); // Recarrega a lista após salvar
      setShowForm(false);
      setEditingStore(null);
    } catch (error) {
      console.error("Erro ao salvar loja:", error);
      toast.error("Erro ao salvar loja");
    }
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setShowForm(true);
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
              setEditingStore(null);
              setShowForm(true);
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

      {showForm && (
        <div className="mb-8">
          <StoreForm
            onSave={handleSaveStore}
            onCancel={() => {
              setShowForm(false);
              setEditingStore(null);
            }}
            initialData={editingStore}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[200px] bg-gray-100 rounded-lg animate-pulse"
            />
          ))
        ) : filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onEdit={() => handleEditStore(store)}
              onDelete={() => handleDeleteStore(store)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            {filters.rede || filters.loja || filters.cidade
              ? "Nenhuma loja encontrada com os filtros aplicados"
              : "Nenhuma loja cadastrada. Clique em 'Nova Loja' para começar."}
          </div>
        )}
      </div>
    </motion.div>
  );
}
