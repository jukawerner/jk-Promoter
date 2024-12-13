"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Pencil, Trash2, Package2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface EstoqueItem {
  id?: string;
  marca: string;
  produto: string;
  estoque: string;
  estoqueVirtual: string;
  rede: string;
  loja: string;
}

export default function EstoqueLoja() {
  const [marca, setMarca] = useState("");
  const [produto, setProduto] = useState("");
  const [estoque, setEstoque] = useState("");
  const [estoqueVirtual, setEstoqueVirtual] = useState("");
  const [rede, setRede] = useState("");
  const [loja, setLoja] = useState("");
  const [items, setItems] = useState<EstoqueItem[]>([]);
  const [editingItem, setEditingItem] = useState<EstoqueItem | null>(null);
  const [showForm, setShowForm] = useState(true);
  const router = useRouter();

  // Lista de marcas e produtos para os selects
  const marcas = ["Marca A", "Marca B", "Marca C"];
  const produtos = ["Produto 1", "Produto 2", "Produto 3"];

  // Carregar rede e loja do localStorage quando o componente montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const redeSelected = localStorage.getItem("redeSelected") || "";
      const lojaSelected = localStorage.getItem("lojaSelected") || "";
      
      console.log('Valores do localStorage:', { redeSelected, lojaSelected });
      
      if (!redeSelected || !lojaSelected) {
        toast.error("Selecione uma rede e loja primeiro");
        router.push("/promotor");
        return;
      }
      
      setRede(redeSelected);
      setLoja(lojaSelected);
      console.log('Estados atualizados:', { rede: redeSelected, loja: lojaSelected });
    }
  }, [router]);

  const handleConfirm = () => {
    if (!marca || !produto || !estoque || !estoqueVirtual || !rede || !loja) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const estoqueNum = parseFloat(estoque);
    const estoqueVirtualNum = parseFloat(estoqueVirtual);

    if (isNaN(estoqueNum) || isNaN(estoqueVirtualNum)) {
      toast.error("Por favor, insira números válidos para os estoques");
      return;
    }

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, marca, produto, estoque: estoqueNum.toString(), estoqueVirtual: estoqueVirtualNum.toString(), rede, loja }
          : item
      ));
      setEditingItem(null);
    } else {
      const newItem: EstoqueItem = {
        id: Math.random().toString(),
        marca,
        produto,
        estoque: estoqueNum.toString(),
        estoqueVirtual: estoqueVirtualNum.toString(),
        rede,
        loja,
      };
      setItems([...items, newItem]);
    }

    setMarca("");
    setProduto("");
    setEstoque("");
    setEstoqueVirtual("");
    setShowForm(false);
    toast.success(editingItem ? "Item atualizado com sucesso!" : "Item adicionado com sucesso!");
  };

  const handleEdit = (item: EstoqueItem) => {
    setMarca(item.marca);
    setProduto(item.produto);
    setEstoque(item.estoque);
    setEstoqueVirtual(item.estoqueVirtual);
    setRede(item.rede);
    setLoja(item.loja);
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("Item removido com sucesso!");
  };

  const handleGravar = async () => {
    try {
      for (const item of items) {
        const { error } = await supabase
          .from("estoque")
          .insert([
            {
              marca: item.marca,
              produto: item.produto,
              estoque_fisico: parseFloat(item.estoque),
              estoque_virtual: parseFloat(item.estoqueVirtual),
              rede: item.rede,
              loja: item.loja
            }
          ]);
          
        if (error) throw error;
      }

      toast.success("Estoque salvo com sucesso!");
      setItems([]);
      router.push("/promotor/pdv/ponto-de-venda");
    } catch (error: any) {
      console.log("Erro ao salvar estoque:", error);
      toast.error("Erro ao salvar estoque");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Toaster />
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="bg-rose-100 p-4 rounded-full mb-4">
          <Package2 className="w-8 h-8 text-rose-600" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Estoque da Loja</h1>
        <p className="text-gray-600 text-center">
          Registre o estoque dos produtos no PDV
        </p>
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="grid gap-4">
              {/* Campos Rede e Loja lado a lado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rede">Rede</Label>
                  <Input
                    id="rede"
                    value={rede}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loja">Loja</Label>
                  <Input
                    id="loja"
                    value={loja}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              {/* Campos Marca e Produto lado a lado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Select value={marca} onValueChange={setMarca}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {marcas.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="produto">Produto</Label>
                  <Select value={produto} onValueChange={setProduto}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campos Estoque Físico e Virtual lado a lado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estoque">Estoque Físico</Label>
                  <Input
                    id="estoque"
                    type="number"
                    value={estoque}
                    onChange={(e) => setEstoque(e.target.value)}
                    placeholder="Digite a quantidade em estoque"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estoqueVirtual">Estoque Virtual</Label>
                  <Input
                    id="estoqueVirtual"
                    type="number"
                    value={estoqueVirtual}
                    onChange={(e) => setEstoqueVirtual(e.target.value)}
                    placeholder="Digite o estoque virtual"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button
                variant="ghost"
                onClick={() => router.push("/promotor")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button onClick={handleConfirm} className="bg-rose-600 hover:bg-rose-700 text-white">
                {editingItem ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Item
                  </Button>
                  <Button
                    onClick={handleGravar}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Gravar
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rede</TableHead>
                        <TableHead>Loja</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Estoque Físico</TableHead>
                        <TableHead>Estoque Virtual</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.rede}</TableCell>
                          <TableCell>{item.loja}</TableCell>
                          <TableCell>{item.marca}</TableCell>
                          <TableCell>{item.produto}</TableCell>
                          <TableCell>{item.estoque}</TableCell>
                          <TableCell>{item.estoqueVirtual}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => item.id && handleDelete(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Nenhum item adicionado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
