"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromoterForm } from "@/components/admin/promoters/promoter-form";
import { PromoterCard } from "@/components/admin/promoters/promoter-card";

interface Promoter {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  marcas: number[];
  lojas: number[];
}

export default function CadastroPromotor() {
  const [showForm, setShowForm] = useState(false);
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [editingPromoter, setEditingPromoter] = useState<Promoter | null>(null);

  const handleSavePromoter = (data: Omit<Promoter, "id">) => {
    if (editingPromoter) {
      setPromoters(promoters.map(p => 
        p.id === editingPromoter.id ? { ...data, id: editingPromoter.id } : p
      ));
      setEditingPromoter(null);
    } else {
      setPromoters([...promoters, { ...data, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const handleEditPromoter = (promoter: Promoter) => {
    setEditingPromoter(promoter);
    setShowForm(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Promotor</h1>
          <p className="text-gray-600 mt-2">Gerencie os promotores do sistema</p>
        </div>
        <Button
          onClick={() => {
            setEditingPromoter(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Promotor
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promoters.map((promoter) => (
            <PromoterCard
              key={promoter.id}
              promoter={promoter}
              onEdit={() => handleEditPromoter(promoter)}
            />
          ))}
          {promoters.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                Nenhum promotor cadastrado. Clique em "Adicionar Promotor" para começar.
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}