"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search, Tag, DollarSign, ArrowLeft, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "@/components/whatsapp-button";

interface PesquisaPrecoItem {
  id: number;
  marca: string;
  produto: string;
  preco: string;
  promo: boolean;
}

export default function PesquisaPreco() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [produto, setProduto] = useState("");
  const [preco, setPreco] = useState("");
  const [promo, setPromo] = useState(false);
  const [items, setItems] = useState<PesquisaPrecoItem[]>([]);
  const [editingItem, setEditingItem] = useState<PesquisaPrecoItem | null>(null);
  const [showForm, setShowForm] = useState(true);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];
  const produtos = ["Produto 1", "Produto 2", "Produto 3"];

  const handleConfirm = () => {
    if (!marca || !produto || !preco) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, marca, produto, preco, promo }
          : item
      ));
      setEditingItem(null);
    } else {
      const newItem: PesquisaPrecoItem = {
        id: Date.now(),
        marca,
        produto,
        preco,
        promo,
      };
      setItems([...items, newItem]);
    }

    // Limpar formulário
    setMarca("");
    setProduto("");
    setPreco("");
    setPromo(false);
    setShowForm(false);
    toast.success(editingItem ? "Item atualizado com sucesso!" : "Item adicionado com sucesso!");
  };

  const handleEdit = (item: PesquisaPrecoItem) => {
    setMarca(item.marca);
    setProduto(item.produto);
    setPreco(item.preco);
    setPromo(item.promo);
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("Item excluído com sucesso!");
  };

  const handleGravar = () => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item antes de gravar");
      return;
    }
    router.push("/promotor/pdv/mensagem-sucesso");
  };

  return (
    <div className="container mx-auto p-6 max-w-[800px]">
      <WhatsappButton />
      <div className="space-y-8">
        {/* Header com ícone e título */}
        <div className="flex flex-col items-center text-center space-y-3">
          <motion.div 
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="bg-rose-100 p-4 rounded-full">
              <Tag className="w-12 h-12 text-rose-600" />
              <div className="absolute -bottom-1 -right-1 bg-rose-200 rounded-full p-2">
                <DollarSign className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pesquisa de Preço</h2>
            <p className="text-gray-500 mt-1">Registre os preços dos produtos no PDV</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div 
              className="space-y-6 bg-white rounded-xl shadow-sm border p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Marca</label>
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
                  <label className="text-sm font-medium text-gray-700">Produto</label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Preço</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={preco}
                        onChange={(e) => setPreco(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg flex-1">
                      <Checkbox
                        id="promo"
                        checked={promo}
                        onCheckedChange={(checked) => setPromo(checked as boolean)}
                      />
                      <label
                        htmlFor="promo"
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        Produto em Promoção
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (items.length > 0) {
                      setShowForm(false);
                    } else {
                      router.back();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {items.length > 0 ? "Voltar" : "Cancelar"}
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
                >
                  {editingItem ? (
                    <>
                      <Pencil className="w-4 h-4" />
                      Atualizar Item
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Adicionar Item
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Marca</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Promoção</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.marca}</TableCell>
                        <TableCell>{item.produto}</TableCell>
                        <TableCell>
                          <span className="font-medium text-gray-900">
                            R$ {Number(item.preco).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.promo ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Sim
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Não
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                          Nenhum item registrado ainda
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Item
                </Button>
                <div className="space-x-3">
                  <Button variant="ghost" onClick={() => router.back()}>
                    Cancelar
                  </Button>
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
      </div>
    </div>
  );
}
