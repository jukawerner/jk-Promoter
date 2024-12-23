"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BrandForm } from "@/components/admin/brands/brand-form";
import { Marca, createMarca, deleteMarca, getMarcas, updateMarca } from "@/lib/actions/marca";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CadastroMarcas() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingMarca, setEditingMarca] = useState<Marca | null>(null);

  useEffect(() => {
    loadMarcas();
  }, []);

  const loadMarcas = async () => {
    try {
      const data = await getMarcas();
      setMarcas(data);
    } catch (error) {
      toast.error("Erro ao carregar marcas");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMarca = async (nome: string) => {
    try {
      if (editingMarca) {
        await updateMarca(editingMarca.id, nome);
        toast.success("Marca atualizada com sucesso!");
      } else {
        await createMarca(nome);
        toast.success("Marca adicionada com sucesso!");
      }
      loadMarcas();
      setShowForm(false);
      setEditingMarca(null);
    } catch (error) {
      toast.error(editingMarca ? "Erro ao atualizar marca" : "Erro ao adicionar marca");
    }
  };

  const handleDeleteMarca = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta marca?")) return;
    
    try {
      await deleteMarca(id);
      toast.success("Marca removida com sucesso!");
      loadMarcas();
    } catch (error) {
      toast.error("Erro ao remover marca");
    }
  };

  const handleEditMarca = (marca: Marca) => {
    setEditingMarca(marca);
    setShowForm(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Marcas</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie as marcas do sistema</p>
        </div>
        <Button
          onClick={() => {
            setEditingMarca(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Marca
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <BrandForm 
              onSubmit={handleAddMarca} 
              onCancel={() => {
                setShowForm(false);
                setEditingMarca(null);
              }}
              initialData={editingMarca?.nome}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-md shadow">
        {loading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Marca</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marcas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center text-gray-500">
                    Nenhuma marca cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                marcas.map((marca) => (
                  <TableRow key={marca.id}>
                    <TableCell>{marca.nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMarca(marca)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMarca(marca.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </motion.div>
  );
}