"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface FornecedorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fornecedor: Fornecedor) => void;
  fornecedor?: Fornecedor;
}

export interface Fornecedor {
  id?: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
}

export function FornecedorDialog({
  isOpen,
  onClose,
  onSave,
  fornecedor,
}: FornecedorDialogProps) {
  const [cnpj, setCnpj] = useState(fornecedor?.cnpj || "");
  const [razaoSocial, setRazaoSocial] = useState(fornecedor?.razaoSocial || "");
  const [nomeFantasia, setNomeFantasia] = useState(fornecedor?.nomeFantasia || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cnpj || !razaoSocial || !nomeFantasia) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    onSave({
      id: fornecedor?.id,
      cnpj,
      razaoSocial,
      nomeFantasia,
    });

    // Limpar campos
    setCnpj("");
    setRazaoSocial("");
    setNomeFantasia("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="razaoSocial">Razão Social</Label>
            <Input
              id="razaoSocial"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              placeholder="Razão Social do Fornecedor"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
            <Input
              id="nomeFantasia"
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
              placeholder="Nome Fantasia do Fornecedor"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Gravar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
