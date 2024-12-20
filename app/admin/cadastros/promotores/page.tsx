"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromoterForm } from "@/components/admin/promoters/promoter-form";
import { UserCard } from "@/components/admin/promoters/promoter-card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createUsuario, getUsuarios, updateUsuario, deleteUsuario, uploadAvatar, Usuario } from "@/lib/actions/usuario";

interface Promoter extends Usuario {}

export default function CadastroPromotor() {
  const [showForm, setShowForm] = useState(false);
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
        telefone: telefone, // Telefone sem formatação
        endereco: data.endereco,
        cep: data.cep,
        tipo: data.tipo,
        avatar_url
      };
      
      console.log('Dados para salvar:', userData);

      let savedUser;
      if (editingPromoter) {
        console.log('Atualizando usuário existente...');
        savedUser = await updateUsuario(editingPromoter.id, userData);
        // Atualiza o usuário localmente para evitar reload
        setPromoters(prev => prev.map(p => 
          p.id === editingPromoter.id ? savedUser : p
        ));
      } else {
        console.log('Criando novo usuário...');
        savedUser = await createUsuario(userData);
        // Adiciona o novo usuário localmente para evitar reload
        setPromoters(prev => [...prev, savedUser]);
      }
      
      console.log('Usuário salvo:', savedUser);
      toast.success(editingPromoter ? "Usuário atualizado com sucesso!" : "Usuário criado com sucesso!");
      setShowForm(false);
      setEditingPromoter(null);
    } catch (error) {
      toast.error("Erro ao salvar usuário");
      console.error(error);
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
          <h1 className="text-3xl font-bold text-gray-900">Cadastro Usuário</h1>
          <p className="text-gray-600 mt-2">Gerencie os usuários do sistema</p>
        </div>
        <Button
          onClick={() => {
            setEditingPromoter(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Usuário
        </Button>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromoters.map((promoter) => (
              <UserCard
                key={promoter.id}
                promoter={promoter}
                onEdit={() => handleEditPromoter(promoter)}
                onDelete={() => handleDeletePromoter(promoter.id)}
              />
            ))}
            {filteredPromoters.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  {searchQuery
                    ? "Nenhum usuário encontrado com este filtro."
                    : "Nenhum usuário cadastrado. Clique em \"Adicionar Usuário\" para começar."}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}