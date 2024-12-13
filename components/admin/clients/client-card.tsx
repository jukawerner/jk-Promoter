"use client";

import { motion } from "framer-motion";
import { Edit2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientCardProps {
  client: {
    id: number;
    rede: string;
    loja: string;
    endereco: string;
    bairro: string;
    cidade: string;
    cep: string;
    uf: string;
  };
  onEdit: () => void;
}

export function ClientCard({ client, onEdit }: ClientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{client.rede}</h3>
            <p className="text-gray-600">{client.loja}</p>
          </div>
          <div className="flex items-start gap-2 text-gray-500">
            <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
            <div className="text-sm">
              <p>{client.endereco}</p>
              <p>{client.bairro}</p>
              <p>{client.cidade} - {client.uf}</p>
              <p>CEP: {client.cep}</p>
            </div>
          </div>
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
    </motion.div>
  );
}