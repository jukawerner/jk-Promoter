import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface Store {
  id: string;
  nome: string;
  rede: {
    id: string;
    nome: string;
  };
  usuario: {
    id: string;
    nome: string;
  } | null;
  endereco: string;
  cidade: string;
  uf: string;
  cnpj: string;
  ie: string;
  telefone: string;
  email: string;
  promotor_id: string | null;
}

interface StoreCardProps {
  store: Store;
  onEdit: () => void;
  onDelete: () => void;
}

export function StoreCard({ store, onEdit, onDelete }: StoreCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{store.nome}</p>
          <p className="text-sm text-muted-foreground">{store.rede.nome}</p>
          <p className="text-sm text-muted-foreground">
            {store.usuario?.nome || "Sem promotor"}
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>{store.endereco}</p>
          <p>
            {store.cidade} - {store.uf}
          </p>
          <p>CNPJ: {store.cnpj}</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>
    </Card>
  );
}
