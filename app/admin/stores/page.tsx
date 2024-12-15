"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StoreCard } from "@/components/admin/stores/store-card";
import { StoreFilter } from "@/components/admin/stores/store-filter";
import { StoreForm } from "@/components/admin/stores/store-form";
import { ExcelUpload } from "@/components/admin/stores/excel-upload";
import { supabase } from "@/lib/supabase";

interface Store {
  id: number;
  rede: string;
  cnpj: string;
  loja: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  uf: string;
  marcas: number[];
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filters, setFilters] = useState({
    rede: "",
    loja: "",
    cidade: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar lojas
  const loadStores = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .order("rede", { ascending: true });

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      toast.error("Erro ao carregar lojas");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar lojas
  const filteredStores = stores.filter((store) => {
    const matchesRede = store.rede
      .toLowerCase()
      .includes(filters.rede.toLowerCase());
    const matchesLoja = store.loja
      .toLowerCase()
      .includes(filters.loja.toLowerCase());
    const matchesCidade = store.cidade
      .toLowerCase()
      .includes(filters.cidade.toLowerCase());
    return matchesRede && matchesLoja && matchesCidade;
  });

  // Manipuladores de eventos
  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (storeData: Omit<Store, "id">) => {
    try {
      if (editingStore) {
        const { error } = await supabase
          .from("stores")
          .update(storeData)
          .eq("id", editingStore.id);

        if (error) throw error;
        toast.success("Loja atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("stores").insert([storeData]);
        if (error) throw error;
        toast.success("Loja cadastrada com sucesso!");
      }

      setShowForm(false);
      setEditingStore(null);
      loadStores();
    } catch (error) {
      console.error("Erro ao salvar loja:", error);
      toast.error("Erro ao salvar loja");
    }
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setShowForm(true);
  };

  const handleDelete = async (store: Store) => {
    if (!confirm("Tem certeza que deseja excluir esta loja?")) return;

    try {
      const { error } = await supabase
        .from("stores")
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

  const handleImport = async (stores: Omit<Store, "id">[]) => {
    try {
      const { error } = await supabase.from("stores").insert(stores);
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
      className="container mx-auto p-6 max-w-7xl"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lojas</h1>
          <p className="text-gray-500">Gerencie as lojas do sistema</p>
        </div>
        <div className="flex gap-4">
          <ExcelUpload onImport={handleImport} />
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Loja
          </Button>
        </div>
      </div>

      {/* Filters */}
      <StoreFilter filters={filters} onFilterChange={handleFilterChange} />

      {/* Store Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeletons
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
              onEdit={() => handleEdit(store)}
              onDelete={() => handleDelete(store)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            Nenhuma loja encontrada
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <StoreForm
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingStore(null);
          }}
          initialData={editingStore}
        />
      )}
    </motion.div>
  );
}
