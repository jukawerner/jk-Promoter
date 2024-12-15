"use client";

import { motion } from "framer-motion";
import { Edit2, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserCardProps {
  promoter: {
    id: number;
    apelido: string;
    cidade: string;
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
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={promoter.avatar_url} alt={promoter.apelido} />
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">{promoter.apelido}</h3>
                <Badge variant={promoter.tipo === "Admin" ? "default" : "secondary"}>
                  {promoter.tipo}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">{promoter.cidade}</p>
            </div>
            <div className="flex gap-2">
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