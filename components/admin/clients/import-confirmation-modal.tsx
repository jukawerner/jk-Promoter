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

interface Client {
  rede: string;
  cnpj: string;
  loja: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  uf: string;
}

interface ImportConfirmationModalProps {
  clients: Client[];
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportConfirmationModal({
  clients,
  isOpen,
  onConfirm,
  onCancel,
}: ImportConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Confirmar Importação de Clientes</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-4">
            Revise os {clients.length} clientes que serão importados:
          </p>
          
          <div className="max-h-[400px] overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead>Rede</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>UF</TableHead>
                  <TableHead>Endereço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{client.rede}</TableCell>
                    <TableCell>{client.cnpj}</TableCell>
                    <TableCell>{client.loja}</TableCell>
                    <TableCell>{client.cidade}</TableCell>
                    <TableCell>{client.uf}</TableCell>
                    <TableCell>{client.endereco}</TableCell>
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
