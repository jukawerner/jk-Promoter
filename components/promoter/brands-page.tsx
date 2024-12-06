"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandCard } from "./brand-card";

interface BrandsPageProps {
  store: {
    id: number;
    rede: string;
    loja: string;
    marcas: Array<{
      id: number;
      nome: string;
      avatar: string;
    }>;
  };
  onBack: () => void;
}

export function BrandsPage({ store, onBack }: BrandsPageProps) {
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
          <BrandCard key={marca.id} brand={marca} />
        ))}
      </div>
    </div>
  );
}