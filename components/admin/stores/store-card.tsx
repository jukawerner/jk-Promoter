import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface Store {
  id: number;
  rede: string;
  cnpj: string;
  loja: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  uf: string;
  marcas: number[];
}

interface StoreCardProps {
  store: Store;
  onEdit: () => void;
  onDelete: () => void;
}

export function StoreCard({ store, onEdit, onDelete }: StoreCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{store.loja}</h3>
          <p className="text-sm text-gray-500">{store.rede}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p className="text-gray-600">
          <span className="font-medium">CNPJ:</span> {store.cnpj}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Endereço:</span> {store.endereco}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Bairro:</span> {store.bairro}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Cidade:</span> {store.cidade} - {store.uf}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">CEP:</span> {store.cep}
        </p>
      </div>
    </Card>
  );
}
