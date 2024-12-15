"use client";

import { Package2, Edit, Trash2, Barcode } from "lucide-react";
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
  ean: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
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
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(product)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(product.id)}
              className="h-8 w-8 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
          <div className="flex items-center text-sm text-gray-600">
            <Barcode className="h-4 w-4 mr-1" />
            <span className="font-medium mr-2">EAN:</span>
            {product.ean}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
