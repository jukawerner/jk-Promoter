"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromoterForm } from "@/components/admin/promoters/promoter-form";
import { PromoterGrid } from "@/components/admin/promoters/promoter-grid";
import { Input } from "@/components/ui/input";
import { ImportModal } from "@/components/admin/promoters/import-modal";
import { toast } from "sonner";
import { createUsuario, getUsuarios, updateUsuario, deleteUsuario, uploadAvatar, Usuario } from "@/lib/actions/usuario";
import { createClient } from "@supabase/auth-helpers-nextjs";

interface Promoter extends Usuario {}

export default function CadastroPromotor() {
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [editingPromoter, setEditingPromoter] = useState<Promoter | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPromoters();
  }, []);

  const loadPromoters = async () => {
    try {
      const data = await getUsuarios();
      setPromoters(data);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePromoter = async (data: any) => {
    try {
      setIsLoading(true);
      console.log('Dados recebidos:', data);
      
      let avatar_url = data.avatarUrl;
      
      // Só faz upload se houver um novo arquivo
      if (data.avatarFile instanceof File) {
        console.log('Fazendo upload do avatar...');
        avatar_url = await uploadAvatar(data.avatarFile);
        console.log('Avatar URL:', avatar_url);
      }

      // Remove formatação do telefone
      const telefone = data.telefone.replace(/\D/g, '');
      console.log('Telefone formatado:', telefone);

      // Preparar dados para o Supabase
      const userData = {
        nome: data.nome,
        apelido: data.apelido,
        email: data.email,
        telefone: telefone,
        endereco: data.endereco,
        cep: data.cep,
        tipo: data.tipo,
        avatar_url
      };
      
      console.log('Dados para salvar:', userData);

      let savedUser: Usuario | null = null;
      if (editingPromoter) {
        console.log('Atualizando usuário existente...');
        savedUser = await updateUsuario(editingPromoter.id, userData);
      } else {
        console.log('Criando novo usuário...');
        savedUser = await createUsuario(userData);
      }
      
      console.log('Usuário salvo:', savedUser);

      // Atualiza a lista local
      if (savedUser) {
        if (editingPromoter) {
          setPromoters(prev => prev.map(p => 
            p.id === editingPromoter.id ? { ...savedUser, marcas: data.marcas } : p
          ));
        } else {
          setPromoters(prev => [...prev, { ...savedUser, marcas: data.marcas }]);
        }
      }

      return savedUser; // Retorna o usuário salvo para o PromoterForm
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      throw error; // Propaga o erro para o PromoterForm tratar
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportUsers = async (users: Partial<Usuario>[]) => {
    try {
      setIsLoading(true);
      let processados = 0;
      for (const userData of users) {
        try {
          // Verifica se todos os campos obrigatórios estão presentes
          if (!userData.nome || !userData.email || !userData.tipo) {
            throw new Error(`Dados incompletos para o usuário ${userData.nome || 'sem nome'}: nome, email e tipo são obrigatórios`);
          }

          // Cria o usuário com os campos obrigatórios e opcionais
          const userToCreate = {
            nome: userData.nome,
            email: userData.email,
            tipo: userData.tipo,
            apelido: userData.apelido || '',
            telefone: userData.telefone || '',
            endereco: userData.endereco || '',
            cep: userData.cep || '',
          };

          const savedUser = await createUsuario(userToCreate);
          setPromoters(prev => [...prev, savedUser]);
          processados++;
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? `Erro ao importar ${userData.nome || 'usuário'} (${userData.email}): ${error.message}`
            : `Erro ao importar usuário`;
          toast.error(errorMessage);
          console.error('Erro detalhado:', error);
        }
      }
      if (processados > 0) {
        toast.success(`${processados} usuário(s) importado(s) com sucesso!`);
      }
      setShowImportModal(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao importar usuários";
      toast.error(errorMessage);
      console.error('Erro detalhado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPromoter = (promoter: Promoter) => {
    setEditingPromoter(promoter);
    setShowForm(true);
  };

  const handleDeletePromoter = async (id: number) => {
    console.log('Tentando excluir usuário:', id);
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        setIsLoading(true);
        console.log('Iniciando exclusão do usuário...');
        await deleteUsuario(id);
        console.log('Usuário excluído do banco com sucesso');
        
        // Remove o usuário localmente para evitar reload
        setPromoters(prev => {
          console.log('Atualizando lista local de usuários');
          return prev.filter(p => p.id !== id);
        });
        
        toast.success("Usuário excluído com sucesso!");
      } catch (error) {
        console.error('Erro detalhado ao excluir usuário:', error);
        toast.error("Erro ao excluir usuário");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteSelected = async (ids: number[]) => {
    try {
      setIsLoading(true);
      for (const id of ids) {
        await deleteUsuario(id);
        setPromoters(prev => prev.filter(p => p.id !== id));
      }
      toast.success(`${ids.length} usuários excluídos com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir usuários:', error);
      toast.error("Erro ao excluir usuários");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPromoters = promoters.filter((promoter) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      promoter.nome.toLowerCase().includes(searchLower) ||
      (promoter.apelido?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cadastro Usuário</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowImportModal(true)}
            variant="outline"
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button onClick={() => {
            setEditingPromoter(null);
            setShowForm(true);
          }} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {showForm ? (
        <PromoterForm
          onSave={handleSavePromoter}
          onCancel={() => {
            setShowForm(false);
            setEditingPromoter(null);
          }}
          initialData={editingPromoter}
        />
      ) : (
        <>
          <div className="mb-6 relative">
            <Input
              type="text"
              placeholder="Buscar por nome ou apelido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          </div>

          <PromoterGrid
            promoters={filteredPromoters}
            onEdit={handleEditPromoter}
            onDelete={handleDeletePromoter}
            onDeleteSelected={handleDeleteSelected}
          />
        </>
      )}
      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onConfirm={handleImportUsers}
        />
      )}
    </motion.div>
  );
}