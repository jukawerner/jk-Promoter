"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandCard } from "./brand-card";

interface Brand {
  id: number;
  nome: string;
  avatar_url?: string;
}

interface BrandsPageProps {
  store: {
    id: number;
    rede: string;
    loja: string;
    marcas: Brand[];
  };
  onBack: () => void;
}

export function BrandsPage({ store, onBack }: BrandsPageProps) {
  if (!store.marcas || store.marcas.length === 0) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2 hover:bg-gray-100"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para lojas
        </Button>
        <div className="text-center text-gray-500">
          Nenhuma marca encontrada para este promotor
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="flex items-center gap-2 hover:bg-gray-100"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para lojas
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {store.marcas.map((marca) => (
          <BrandCard 
            key={marca.id} 
            brand={{
              id: marca.id,
              nome: marca.nome,
              avatar: marca.avatar_url || ''
            }} 
          />
        ))}
      </div>
    </div>
  );
}