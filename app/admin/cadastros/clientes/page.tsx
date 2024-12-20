"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreForm } from "@/components/admin/stores/store-form";
import { StoreCard } from "@/components/admin/stores/store-card";
import { StoreFilter } from "@/components/admin/stores/store-filter";
import { ExcelUpload } from "@/components/admin/stores/excel-upload";

import { Store, StoreFormData } from "types/store";

// Dados de exemplo para teste
const INITIAL_STORES: Store[] = [
  {
    id: 1,
    nome: "Filial Centro",
    cnpj: "12.345.678/0001-90",
    endereco: "Rua das Flores",
    numero: "123",
    bairro: "Centro",
    cidade: "São Paulo",
    cep: "01234-567",
    uf: "SP",
    rede_id: 1,
    promotor_id: null,
    rede: {
      id: 1,
      nome: "Supermercado ABC"
    }
  },
  {
    id: 2,
    nome: "Unidade Jardins",
    cnpj: "98.765.432/0001-21",
    endereco: "Av. Paulista",
    numero: "1000",
    bairro: "Jardins",
    cidade: "São Paulo",
    cep: "04567-890",
    uf: "SP",
    rede_id: 2,
    promotor_id: null,
    rede: {
      id: 2,
      nome: "Mercado XYZ"
    }
  }
];

export default function CadastroLojas() {
  const [showForm, setShowForm] = useState(false);
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [filters, setFilters] = useState({
    search: ""
  });

  const handleFilterChange = (newFilters: { search: string }) => {
    setFilters(newFilters);
  };

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const searchTerm = filters.search.toLowerCase();
      const redeName = store.rede?.nome.toLowerCase() ?? "";
      const storeName = store.nome.toLowerCase();
      const cidade = store.cidade.toLowerCase();
      
      return redeName.includes(searchTerm) || 
             storeName.includes(searchTerm) || 
             cidade.includes(searchTerm);
    });
  }, [stores, filters]);

  const handleSaveStore = (store: StoreFormData) => {
    if (editingStore) {
      setStores(stores.map(s => 
        s.id === editingStore.id ? { ...store, id: editingStore.id } : s
      ));
      setEditingStore(null);
    } else {
      setStores([...stores, { ...store, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setShowForm(true);
  };

  const handleDeleteStore = (id: number) => {
    setStores(stores.filter(s => s.id !== id));
  };

  const handleImportStores = (importedStores: Omit<Store, "id">[]) => {
    const newStores = importedStores.map(store => ({
      ...store,
      id: Date.now() + Math.random(),
    }));
    setStores([...stores, ...newStores]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
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
            store={editingStore}
            onSave={handleSaveStore}
            onCancel={() => {
              setShowForm(false);
              setEditingStore(null);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onEdit={() => handleEditStore(store)}
            onDelete={() => handleDeleteStore(store.id!)}
          />
        ))}
      </div>

      {filteredStores.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Nenhuma loja cadastrada. Clique em "Nova Loja" para começar.
          </p>
        </div>
      )}
    </motion.div>
  );
}