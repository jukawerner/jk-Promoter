"use client";

import { Package2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: number;
  nome: string;
  familia: string;
  unidade: string;
  peso: number;
  validade: number;
  marca: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
}

export function ProductCard({ product, onEdit }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Package2 className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{product.nome}</h3>
              <p className="text-gray-600">{product.familia}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Marca:</span>
            {product.marca}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Unidade:</span>
            {product.unidade} ({product.peso}g)
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Validade:</span>
            {product.validade} dias
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
