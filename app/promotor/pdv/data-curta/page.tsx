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
import { Clock, AlertTriangle, ArrowLeft, Pencil, Trash2, CalendarClock, Package2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "@/components/whatsapp-button";
import { motion, AnimatePresence } from "framer-motion";

interface DataCurtaItem {
  id: number;
  marca: string;
  produto: string;
  estoque: string;
  dataValidade: string;
}

export default function DataCurtaPage() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [produto, setProduto] = useState("");
  const [estoque, setEstoque] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [items, setItems] = useState<DataCurtaItem[]>([]);
  const [editingItem, setEditingItem] = useState<DataCurtaItem | null>(null);
  const [showForm, setShowForm] = useState(true);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];
  const produtos = ["Produto 1", "Produto 2", "Produto 3"];

  const handleConfirm = () => {
    if (!marca || !produto || !estoque || !dataValidade) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, marca, produto, estoque, dataValidade }
          : item
      ));
      setEditingItem(null);
    } else {
      const newItem: DataCurtaItem = {
        id: Date.now(),
        marca,
        produto,
        estoque,
        dataValidade,
      };
      setItems([...items, newItem]);
    }

    // Limpar formulário
    setMarca("");
    setProduto("");
    setEstoque("");
    setDataValidade("");
    setShowForm(false);
    toast.success(editingItem ? "Item atualizado com sucesso!" : "Item adicionado com sucesso!");
  };

  const handleEdit = (item: DataCurtaItem) => {
    setMarca(item.marca);
    setProduto(item.produto);
    setEstoque(item.estoque);
    setDataValidade(item.dataValidade);
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
    router.push("/promotor/pdv/avaliacao");
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
              <CalendarClock className="w-12 h-12 text-rose-600" />
            </div>
            <div className="absolute -right-2 -bottom-2 bg-amber-100 rounded-full p-2 shadow-sm border-2 border-white">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Data Curta</h2>
            <p className="text-gray-500 mt-1">Produtos que estão perto do vencimento</p>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Marca</label>
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Produto</label>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Estoque</label>
                      <div className="relative">
                        <Package2 className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                        <Input
                          placeholder="Quantidade (un/kg)"
                          value={estoque}
                          onChange={(e) => setEstoque(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Data de Validade</label>
                      <div className="relative">
                        <Clock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                        <Input
                          type="date"
                          value={dataValidade}
                          onChange={(e) => setDataValidade(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões do formulário */}
                <div className="flex justify-between items-center pt-6">
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
                    className="bg-rose-500 hover:bg-rose-600 text-white px-8"
                  >
                    {editingItem ? "Atualizar" : "Adicionar"}
                  </Button>
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
                    className="bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2"
                  >
                    <Package2 className="w-4 h-4" />
                    Adicionar Item
                  </Button>
                  <Button
                    onClick={handleGravar}
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Gravar
                  </Button>
                </div>
                
                <div className="border rounded-lg overflow-hidden bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Marca</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Data de Validade</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{item.marca}</TableCell>
                          <TableCell>{item.produto}</TableCell>
                          <TableCell>{item.estoque}</TableCell>
                          <TableCell>{new Date(item.dataValidade).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                                className="hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item.id)}
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
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            Nenhum item adicionado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
