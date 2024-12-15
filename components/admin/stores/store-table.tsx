"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Store {
  id: number;
  nome: string;
  cnpj: string;
  cidade: string;
  uf: string;
  rede: { nome: string };
  promotor: { nome: string } | null;
}

interface StoreTableProps {
  stores: Store[];
  onEdit: (store: Store) => void;
  onDelete: (id: number) => void;
}

export function StoreTable({ stores, onEdit, onDelete }: StoreTableProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta loja?")) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('loja')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Loja excluída com sucesso!");
      onDelete(id);
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error("Erro ao excluir loja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>UF</TableHead>
            <TableHead>Rede</TableHead>
            <TableHead>Promotor</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((store) => (
            <TableRow key={store.id}>
              <TableCell>{store.nome}</TableCell>
              <TableCell>{store.cnpj}</TableCell>
              <TableCell>{store.cidade}</TableCell>
              <TableCell>{store.uf}</TableCell>
              <TableCell>{store.rede.nome}</TableCell>
              <TableCell>{store.promotor?.nome || "Sem promotor"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(store)}
                    disabled={loading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(store.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
