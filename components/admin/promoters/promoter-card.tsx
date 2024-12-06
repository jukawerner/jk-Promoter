"use client";

import { motion } from "framer-motion";
import { Edit2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PromoterCardProps {
  promoter: {
    id: number;
    apelido: string;
    cidade: string;
    marcas: number[];
    lojas: number[];
    avatarUrl?: string;
  };
  onEdit: () => void;
}

export function PromoterCard({ promoter, onEdit }: PromoterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={promoter.avatarUrl} alt={promoter.apelido} />
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{promoter.apelido}</h3>
              <p className="text-gray-600 mt-1">{promoter.cidade}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="text-gray-400 hover:text-blue-500"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <span className="block text-lg font-bold text-blue-600">
            {promoter.marcas.length}
          </span>
          <span className="text-xs text-blue-600 font-medium">
            Marcas
          </span>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <span className="block text-lg font-bold text-green-600">
            {promoter.lojas.length}
          </span>
          <span className="text-xs text-green-600 font-medium">
            Lojas
          </span>
        </div>
      </div>
    </motion.div>
  );
}