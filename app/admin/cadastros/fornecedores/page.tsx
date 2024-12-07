"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { FornecedorDialog, type Fornecedor } from "@/components/admin/fornecedor-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function FornecedoresPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | undefined>();

  const handleSave = (fornecedor: Fornecedor) => {
    if (fornecedor.id) {
      // Editar fornecedor existente
      setFornecedores(fornecedores.map(f => 
        f.id === fornecedor.id ? fornecedor : f
      ));
      toast.success("Fornecedor atualizado com sucesso!");
    } else {
      // Adicionar novo fornecedor
      setFornecedores([...fornecedores, { ...fornecedor, id: Date.now() }]);
      toast.success("Fornecedor cadastrado com sucesso!");
    }
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setFornecedores(fornecedores.filter(f => f.id !== id));
    toast.success("Fornecedor excluído com sucesso!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
        <Button onClick={() => {
          setEditingFornecedor(undefined);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CNPJ</TableHead>
              <TableHead>Razão Social</TableHead>
              <TableHead>Nome Fantasia</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fornecedores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  Nenhum fornecedor cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              fornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id}>
                  <TableCell>{fornecedor.cnpj}</TableCell>
                  <TableCell>{fornecedor.razaoSocial}</TableCell>
                  <TableCell>{fornecedor.nomeFantasia}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(fornecedor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(fornecedor.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FornecedorDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingFornecedor(undefined);
        }}
        onSave={handleSave}
        fornecedor={editingFornecedor}
      />
    </motion.div>
  );
}
