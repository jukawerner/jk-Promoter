"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Product {
  nome: string;
  familia: string;
  unidade: string;
  peso: number;
  validade: number;
  marca: string;
}

interface ImportConfirmationModalProps {
  products: Product[];
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportConfirmationModal({
  products,
  isOpen,
  onConfirm,
  onCancel,
}: ImportConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Confirmar Importação de Produtos</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-4">
            Revise os {products.length} produtos que serão importados:
          </p>
          
          <div className="max-h-[400px] overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Família</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Validade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{product.nome}</TableCell>
                    <TableCell>{product.familia}</TableCell>
                    <TableCell>{product.marca}</TableCell>
                    <TableCell>{product.unidade}</TableCell>
                    <TableCell>{product.peso}g</TableCell>
                    <TableCell>{product.validade} dias</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Confirmar Importação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
