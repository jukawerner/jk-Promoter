"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Package } from "lucide-react";

interface BrandCardProps {
  brand: {
    id: number;
    nome: string;
    avatar: string;
  };
}

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-12 w-12">
          <AvatarImage src={brand.avatar} alt={brand.nome} />
          <AvatarFallback>
            <Package className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-bold text-gray-900">{brand.nome}</h3>
      </div>

      <Button className="w-full">Iniciar</Button>
    </motion.div>
  );
}