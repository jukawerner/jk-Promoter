"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreForm } from "@/components/admin/stores/store-form";
import { StoreCard } from "@/components/admin/stores/store-card";
import { StoreFilter } from "@/components/admin/stores/store-filter";
import { ExcelUpload } from "@/components/admin/stores/excel-upload";

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

// Dados de exemplo para teste
const INITIAL_STORES: Store[] = [
  {
    id: 1,
    rede: "Supermercado ABC",
    cnpj: "12.345.678/0001-90",
    loja: "Filial Centro",
    endereco: "Rua das Flores, 123",
    bairro: "Centro",
    cidade: "São Paulo",
    cep: "01234-567",
    uf: "SP",
    marcas: [1, 2]
  },
  {
    id: 2,
    rede: "Mercado XYZ",
    cnpj: "98.765.432/0001-21",
    loja: "Unidade Jardins",
    endereco: "Av. Paulista, 1000",
    bairro: "Jardins",
    cidade: "São Paulo",
    cep: "04567-890",
    uf: "SP",
    marcas: [1, 3]
  },
  {
    id: 3,
    rede: "Supermercado ABC",
    cnpj: "12.345.678/0002-71",
    loja: "Filial Campinas",
    endereco: "Av. Brasil, 500",
    bairro: "Centro",
    cidade: "Campinas",
    cep: "13024-851",
    uf: "SP",
    marcas: [2, 3]
  }
];

export default function CadastroLojas() {
  const [showForm, setShowForm] = useState(false);
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [filters, setFilters] = useState({
    rede: "",
    loja: "",
    cidade: "",
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const redeMatch = store.rede.toLowerCase().includes(filters.rede.toLowerCase());
      const lojaMatch = store.loja.toLowerCase().includes(filters.loja.toLowerCase());
      const cidadeMatch = store.cidade.toLowerCase().includes(filters.cidade.toLowerCase());
      
      return redeMatch && lojaMatch && cidadeMatch;
    });
  }, [stores, filters]);

  const handleSaveStore = (store: Omit<Store, "id">) => {
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
        {filteredStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onEdit={() => handleEditStore(store)}
            onDelete={() => handleDeleteStore(store.id)}
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
