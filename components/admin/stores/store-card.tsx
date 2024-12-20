"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash, User } from "lucide-react";
import { Store } from "@/types/store";

interface StoreCardProps {
  store: Store;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
}

export function StoreCard({ store, onEdit, onDelete }: StoreCardProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{store.nome}</h3>
          <p className="text-sm text-gray-500">{store.rede?.nome}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(store)}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(store)}
            className="h-8 w-8 text-red-500 hover:text-red-600"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">CNPJ:</span> {store.cnpj || "N/A"}
        </p>
        <p>
          <span className="font-medium">Endereço:</span> {store.endereco}
        </p>
        <p>
          <span className="font-medium">CEP:</span> {store.cep}
        </p>
        {store.usuario && (
          <div className="flex items-center gap-2 mt-4 border-t pt-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={store.usuario.avatar_url} alt={store.usuario.apelido} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">{store.usuario.apelido}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
