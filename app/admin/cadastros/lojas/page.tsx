"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { StoreCard } from "@/components/admin/stores/store-card";
import { StoreForm } from "@/components/admin/stores/store-form";
import { StoreFilter } from "@/components/admin/stores/store-filter";
import { ImportModal } from "@/components/admin/stores/import-modal";
import { Plus, Upload, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Store } from "@/types/store";
import { getLojas, createLoja, updateLoja, deleteLoja } from "@/lib/actions/loja";

export default function CadastroLojas() {
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setIsLoading(true);
      const data = await getLojas();
      setStores(data);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      toast.error("Erro ao carregar lojas");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStores = useMemo(() => {
    if (!searchQuery) return stores;
    
    const searchTerm = searchQuery.toLowerCase();
    return stores.filter(store => {
      return (
        store.rede?.nome?.toLowerCase().includes(searchTerm) ||
        store.nome?.toLowerCase().includes(searchTerm) ||
        store.usuario?.nome?.toLowerCase().includes(searchTerm)
      );
    });
  }, [stores, searchQuery]);

  const handleSaveStore = async (storeData: any) => {
    try {
      setIsLoading(true);
      console.log('Dados recebidos do formulário:', storeData);

      let savedStore;
      if (selectedStore) {
        console.log('Atualizando loja existente...');
        savedStore = await updateLoja(selectedStore.id, storeData);
        setStores(prev => prev.map(p => 
          p.id === selectedStore.id ? savedStore : p
        ));
      } else {
        console.log('Iniciando criação de nova loja...');
        savedStore = await createLoja(storeData);
        console.log('Resposta da criação:', savedStore);
        
        if (!savedStore) {
          throw new Error('Falha ao criar loja - nenhum dado retornado');
        }
        
        setStores(prev => [...prev, savedStore]);
      }
      
      console.log('Loja salva com sucesso:', savedStore);
      toast.success(selectedStore ? "Loja atualizada com sucesso!" : "Loja criada com sucesso!");
      setShowForm(false);
      setSelectedStore(null);
    } catch (error) {
      console.error("Erro detalhado ao salvar loja:", error);
      toast.error(`Erro ao salvar loja: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStore = (store: Store) => {
    setSelectedStore(store);
    setShowForm(true);
  };

  const handleDeleteStore = async (store: Store) => {
    console.log('Tentando excluir loja:', store.id);
    if (window.confirm("Tem certeza que deseja excluir esta loja?")) {
      try {
        setIsLoading(true);
        console.log('Iniciando exclusão da loja...');
        await deleteLoja(store.id);
        console.log('Loja excluída do banco com sucesso');
        
        // Remove a loja localmente para evitar reload
        setStores(prev => {
          console.log('Atualizando lista local de lojas');
          return prev.filter(p => p.id !== store.id);
        });
        
        toast.success("Loja excluída com sucesso!");
      } catch (error) {
        console.error('Erro detalhado ao excluir loja:', error);
        toast.error("Erro ao excluir loja");
      } finally {
        setIsLoading(false);
      }
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
              setShowForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Loja
          </Button>
        </div>
      </div>

      {showForm ? (
        <StoreForm
          store={selectedStore}
          onSave={handleSaveStore}
          onCancel={() => {
            setShowForm(false);
            setSelectedStore(null);
          }}
        />
      ) : (
        <>
          <div className="mb-6 relative">
            <Input
              type="text"
              placeholder="Buscar por nome, rede ou promotor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          </div>

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
                  onEdit={() => handleEditStore(store)}
                  onDelete={() => handleDeleteStore(store)}
                />
              ))}
              {filteredStores.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {searchQuery
                    ? "Nenhuma loja encontrada com este filtro."
                    : "Nenhuma loja cadastrada. Clique em \"Nova Loja\" para começar."}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={loadStores}
      />
    </motion.div>
  );
}
