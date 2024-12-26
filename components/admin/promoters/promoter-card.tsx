"use client";

import { motion } from "framer-motion";
import { Edit2, User, Trash2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserCardProps {
  promoter: {
    id: number;
    nome: string;
    apelido: string;
    email: string;
    telefone: string;
    avatar_url?: string;
    tipo: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function UserCard({ promoter, onEdit, onDelete }: UserCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow h-[200px] w-full flex flex-col justify-between"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 shrink-0">
          <AvatarImage src={promoter.avatar_url} alt={promoter.apelido} />
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{promoter.apelido}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{promoter.nome}</p>
                </div>
                <Badge variant={promoter.tipo === "Admin" ? "default" : "secondary"} className="shrink-0">
                  {promoter.tipo}
                </Badge>
              </div>
              <div className="flex flex-col gap-1 mt-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 shrink-0" />
                  <p className="text-sm truncate">{promoter.email}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 shrink-0" />
                  <p className="text-sm truncate">{promoter.telefone}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="text-gray-400 hover:text-blue-500"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}