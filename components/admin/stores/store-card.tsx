"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash, User, Building2, MapPin } from "lucide-react";
import { Store } from "@/types/store";
import { Badge } from "@/components/ui/badge";

interface StoreCardProps {
  store: Store;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
  selected?: boolean;
  onSelect?: (store: Store) => void;
}

export function StoreCard({ store, onEdit, onDelete, selected, onSelect }: StoreCardProps) {
  return (
    <Card className="relative h-[220px] p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            {onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onSelect(store)}
                className="h-4 w-4 rounded border-gray-300 mt-1.5"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 truncate">{store.rede?.nome || "Rede não especificada"}</p>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 truncate pr-16 mt-1">{store.nome}</h3>
            </div>
          </div>
          <div className="flex gap-2 absolute right-4 top-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(store)}
              className="h-8 w-8 text-gray-400 hover:text-blue-500"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(store)}
              className="h-8 w-8 text-gray-400 hover:text-red-500"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          <p className="flex items-center gap-2">
            <span className="font-medium min-w-[50px]">CNPJ:</span>
            <span className="text-gray-600 truncate">{store.cnpj || "N/A"}</span>
          </p>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <p className="text-gray-600 truncate">{store.endereco}</p>
          </div>
        </div>
      </div>

      {store.promotor ? (
        <div className="flex items-center gap-2 pt-3 border-t">
          <Avatar className="h-8 w-8">
            <AvatarImage src={store.promotor.avatar_url} alt={store.promotor.apelido} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="text-sm font-medium text-gray-700 truncate block">
              {store.promotor.apelido}
            </span>
            <span className="text-xs text-gray-500 truncate block">Promotor</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-3 border-t text-gray-400">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="text-sm text-gray-400">
              Sem promotor designado
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
