"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface Store {
  id: number;
  nome: string;
  cnpj: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  rede: {
    id: number;
    nome: string;
  };
  usuario?: {
    id: string;
    nome: string;
    avatar_url?: string;
  } | null;
}

interface StoreCardProps {
  store: Store;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
}

export function StoreCard({ store, onEdit, onDelete }: StoreCardProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{store.rede.nome}</p>
          <h3 className="text-xl font-semibold">{store.nome}</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(store)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(store)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Endereço</p>
        <p className="text-sm text-gray-600">
          {store.endereco}, {store.numero}
        </p>
        <p className="text-sm text-gray-600">
          {store.bairro} - {store.cidade}/{store.uf}
        </p>
        <p className="text-sm text-gray-600">{store.cep}</p>
      </div>

      {store.usuario && (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {store.usuario.avatar_url ? (
              <AvatarImage src={store.usuario.avatar_url} alt={store.usuario.nome} />
            ) : (
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="text-sm font-medium">Promotor</p>
            <p className="text-sm text-gray-600">{store.usuario.nome}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
