"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Pencil, Trash2, Store, Package2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { WhatsappButton } from "@/components/whatsapp-button";
import { motion, AnimatePresence } from "framer-motion";

interface EstoqueItem {
  id: number;
  marca: string;
  produto: string;
  estoque: string;
  estoqueVirtual: string;
}

export default function EstoqueLoja() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rede, setRede] = useState(searchParams.get("rede") || "");
  const [loja, setLoja] = useState(searchParams.get("loja") || "");
  const [marca, setMarca] = useState("");
  const [produto, setProduto] = useState("");
  const [estoque, setEstoque] = useState("");
  const [estoqueVirtual, setEstoqueVirtual] = useState("");
  const [items, setItems] = useState<EstoqueItem[]>([]);
  const [editingItem, setEditingItem] = useState<EstoqueItem | null>(null);
  const [showForm, setShowForm] = useState(true);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];
  const produtos = ["Produto 1", "Produto 2", "Produto 3"];

  useEffect(() => {
    if (!rede || !loja) {
      toast.error("Informações da loja não encontradas");
      router.push("/promotor");
    }
  }, [rede, loja, router]);

  const handleConfirm = () => {
    if (!marca || !produto || !estoque || !estoqueVirtual) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, marca, produto, estoque, estoqueVirtual }
          : item
      ));
      setEditingItem(null);
    } else {
      const newItem: EstoqueItem = {
        id: Date.now(),
        marca,
        produto,
        estoque,
        estoqueVirtual,
      };
      setItems([...items, newItem]);
    }

    // Limpar formulário
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
              <Package2 className="w-12 h-12 text-rose-600" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Estoque da Loja</h2>
            <p className="text-gray-500 mt-1">Registre o estoque dos produtos na loja</p>
            {rede && loja && (
              <div className="mt-2 text-sm text-gray-600">
                <p>{rede} - {loja}</p>
              </div>
            )}
          </div>
        </div>

        {showForm ? (
          <motion.div 
            className="space-y-6 bg-white rounded-xl shadow-sm border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Marca
                </label>
                <Select value={marca} onValueChange={setMarca}>
                  <SelectTrigger className="w-full">
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

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Produto
                </label>
                <Select value={produto} onValueChange={setProduto}>
                  <SelectTrigger className="w-full">
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
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estoque
                  </label>
                  <Input
                    type="number"
                    value={estoque}
                    onChange={(e) => setEstoque(e.target.value)}
                    placeholder="Digite a quantidade"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estoque Virtual
                  </label>
                  <Input
                    type="number"
                    value={estoqueVirtual}
                    onChange={(e) => setEstoqueVirtual(e.target.value)}
                    placeholder="Digite o virtual"
                  />
                </div>
              </div>
            </div>

            {/* Botões de ação */}
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
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {editingItem ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Lista de itens */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Marca</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Estoque Virtual</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.marca}</TableCell>
                      <TableCell>{item.produto}</TableCell>
                      <TableCell>{item.estoque}</TableCell>
                      <TableCell>{item.estoqueVirtual}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8 text-gray-600 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 text-gray-600 hover:text-rose-600"
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

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Novo
              </Button>
              <Button
                onClick={handleGravar}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Finalizar
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
