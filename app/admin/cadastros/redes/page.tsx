"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rede, createRede, deleteRede, getRedes, updateRede } from "@/lib/actions/rede";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CadastroRedes() {
  const [redes, setRedes] = useState<Rede[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingRede, setEditingRede] = useState<Rede | null>(null);
  const [nome, setNome] = useState("");

  useEffect(() => {
    loadRedes();
  }, []);

  const loadRedes = async () => {
    try {
      const data = await getRedes();
      setRedes(data);
    } catch (error) {
      toast.error("Erro ao carregar redes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    try {
      if (editingRede) {
        await updateRede(editingRede.id, nome);
        toast.success("Rede atualizada com sucesso!");
      } else {
        await createRede(nome);
        toast.success("Rede adicionada com sucesso!");
      }
      setNome("");
      setShowForm(false);
      setEditingRede(null);
      loadRedes();
    } catch (error) {
      toast.error(editingRede ? "Erro ao atualizar rede" : "Erro ao adicionar rede");
    }
  };

  const handleDeleteRede = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta rede?")) return;
    
    try {
      await deleteRede(id);
      toast.success("Rede removida com sucesso!");
      loadRedes();
    } catch (error) {
      toast.error("Erro ao remover rede");
    }
  };

  const handleEditRede = (rede: Rede) => {
    setEditingRede(rede);
    setNome(rede.nome);
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
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Redes</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie as redes do sistema</p>
        </div>
        <Button
          onClick={() => {
            setEditingRede(null);
            setNome("");
            setShowForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Rede
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
            <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Rede</Label>
                <Input
                  id="nome"
                  placeholder="Digite o nome da rede"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRede(null);
                    setNome("");
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingRede ? "Atualizar" : "Salvar"}
                </Button>
              </div>
            </form>
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
                <TableHead>Nome da Rede</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center text-gray-500">
                    Nenhuma rede cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                redes.map((rede) => (
                  <TableRow key={rede.id}>
                    <TableCell>{rede.nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRede(rede)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRede(rede.id)}
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
