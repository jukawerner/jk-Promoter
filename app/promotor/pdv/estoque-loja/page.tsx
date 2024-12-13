"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Pencil, Trash2, Store, Package2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "@/components/whatsapp-button";
import { supabase } from "@/lib/supabase";

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
      
      if (!redeSelected || !lojaSelected) {
        toast.error("Selecione uma rede e loja primeiro");
        router.push("/promotor");
        return;
      }
      
      setRede(redeSelected);
      setLoja(lojaSelected);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="container mx-auto p-6 max-w-[800px]">
        <div className="flex justify-end mb-4">
          <WhatsappButton />
        </div>

        {/* Header com ícone e título */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <motion.div 
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="bg-rose-100 p-4 rounded-full">
              <Package2 className="w-12 h-12 text-rose-600" />
            </div>
            <div className="absolute -right-2 -bottom-2 bg-rose-50 rounded-full p-2 shadow-sm border-2 border-white">
              <Store className="w-6 h-6 text-rose-600" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Estoque da Loja</h2>
            <p className="text-gray-500 mt-1">Controle o estoque dos produtos na loja</p>
          </div>
        </div>

        <motion.div 
          className="space-y-8 bg-white rounded-xl shadow-sm p-6 border"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
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
                      <div className="relative">
                        <Package2 className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                        <Input
                          id="estoque"
                          type="number"
                          value={estoque}
                          onChange={(e) => setEstoque(e.target.value)}
                          placeholder="Quantidade (un/kg)"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estoqueVirtual">Estoque Virtual</Label>
                      <div className="relative">
                        <Package2 className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                        <Input
                          id="estoqueVirtual"
                          type="number"
                          value={estoqueVirtual}
                          onChange={(e) => setEstoqueVirtual(e.target.value)}
                          placeholder="Quantidade (un/kg)"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/promotor")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleConfirm}
                      className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {editingItem ? "Atualizar" : "Adicionar"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Item
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Rede</TableHead>
                        <TableHead>Loja</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Estoque Virtual</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell>{item.rede}</TableCell>
                          <TableCell>{item.loja}</TableCell>
                          <TableCell className="font-medium">{item.marca}</TableCell>
                          <TableCell>{item.produto}</TableCell>
                          <TableCell>{item.estoque}</TableCell>
                          <TableCell>{item.estoqueVirtual}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => item.id && handleDelete(item.id)}
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Nenhum item adicionado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Botões da tabela */}
                <div className="flex justify-between items-center pt-6">
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/promotor")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleGravar}
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      Gravar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
