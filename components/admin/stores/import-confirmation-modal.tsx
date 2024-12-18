"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Store } from "@/types/store";

interface ImportConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: Omit<Store, 'id' | 'rede' | 'usuario'>[];
}

export function ImportConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  data,
}: ImportConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Confirmar Importação</DialogTitle>
          <DialogDescription>
            Revise os dados antes de confirmar a importação. Serão importadas{" "}
            {data.length} lojas.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] rounded-md border">
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Nome</TableHead>
                  <TableHead className="w-[150px]">CNPJ</TableHead>
                  <TableHead className="w-[200px]">Endereço</TableHead>
                  <TableHead className="w-[150px]">Cidade</TableHead>
                  <TableHead className="w-[80px]">UF</TableHead>
                  <TableHead className="w-[100px]">Rede ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((store, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{store.nome}</TableCell>
                    <TableCell>{store.cnpj}</TableCell>
                    <TableCell>{`${store.endereco}, ${store.numero}`}</TableCell>
                    <TableCell>{store.cidade}</TableCell>
                    <TableCell>{store.uf}</TableCell>
                    <TableCell>{store.rede_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Confirmar Importação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
