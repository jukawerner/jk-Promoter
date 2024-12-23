"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { StoreForm } from "@/components/admin/stores/store-form";
import { ImportModal } from "@/components/admin/stores/import-modal";
import { StoreTable } from "@/components/admin/stores/store-table";
import { Plus, Upload, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Store } from "@/types/store";
import { getLojas, createLoja, updateLoja, deleteLoja } from "@/lib/actions/loja";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CadastroLojas() {
  const router = useRouter();
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

  const handleSaveStore = async (storeData: any) => {
    try {
      setIsLoading(true);
      console.log('Dados recebidos do formulário:', storeData);

      const lojaData = {
        nome: storeData.nome,
        cnpj: storeData.cnpj,
        endereco: storeData.endereco,
        cep: storeData.cep,
        rede_id: Number(storeData.rede_id),
        promotor_id: storeData.promotor_id === null ? null : Number(storeData.promotor_id),
      };

      let savedStore: Store | null = null;
      if (selectedStore && selectedStore.id) {
        console.log('Atualizando loja existente...');
        const updatedStore = await updateLoja(selectedStore.id, storeData);
        if (updatedStore) {
          setStores(prev => prev.map(p => 
            p.id === selectedStore.id ? updatedStore : p
          ));
          savedStore = updatedStore;
        }
      } else {
        console.log('Iniciando criação de nova loja...');
        savedStore = await createLoja(storeData);
        console.log('Resposta da criação:', savedStore);
        
        if (!savedStore) {
          throw new Error('Falha ao criar loja - nenhum dado retornado');
        }
        
        setStores(prev => [...prev, savedStore as Store]);
      }
      
      console.log('Loja salva com sucesso:', savedStore);
      toast.success(selectedStore ? "Loja atualizada com sucesso!" : "Loja criada com sucesso!");
      setShowForm(false);
      setSelectedStore(null);
      
      router.refresh();
      router.push('/admin/cadastros/lojas');
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

  const handleDeleteStore = async (id: number) => {
    console.log('Tentando excluir loja:', id);
    if (window.confirm("Tem certeza que deseja excluir esta loja?")) {
      try {
        setIsLoading(true);
        console.log('Iniciando exclusão da loja...');
        await deleteLoja(id);
        console.log('Loja excluída do banco com sucesso');
        
        setStores(prev => prev.filter(p => p.id !== id));
        toast.success("Loja excluída com sucesso!");
      } catch (error) {
        console.error('Erro detalhado ao excluir loja:', error);
        toast.error("Erro ao excluir loja");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteSelected = async (ids: number[]) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('loja')
        .delete()
        .in('id', ids);

      if (error) throw error;

      setStores(prev => prev.filter(store => !ids.includes(store.id)));
      toast.success(`${ids.length} lojas excluídas com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir lojas:', error);
      toast.error('Erro ao excluir lojas selecionadas');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStores = stores.filter(store => {
    if (!searchQuery) return true;
    
    const searchTerm = searchQuery.toLowerCase();
    return (
      store.nome?.toLowerCase().includes(searchTerm) ||
      store.cnpj?.toLowerCase().includes(searchTerm) ||
      store.endereco?.toLowerCase().includes(searchTerm) ||
      store.rede?.nome?.toLowerCase().includes(searchTerm) ||
      store.promotor?.apelido?.toLowerCase().includes(searchTerm)
    );
  });

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
            <StoreTable
              stores={filteredStores}
              onEdit={handleEditStore}
              onDelete={handleDeleteStore}
              onDeleteSelected={handleDeleteSelected}
            />
          )}
        </>
      )}

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false);
          loadStores();
        }}
      />
    </motion.div>
  );
}
