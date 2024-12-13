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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Pencil, Trash2, ImageIcon, Camera, Store, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "@/components/whatsapp-button";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, AlertTriangle, Package2 } from "lucide-react";

const marcas = ["Marca 1", "Marca 2", "Marca 3"]; // Substitua com suas marcas
const produtos = ["Produto 1", "Produto 2", "Produto 3"]; // Substitua com seus produtos

export default function DataCurtaPage() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [produto, setProduto] = useState("");
  const [estoque, setEstoque] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [rede, setRede] = useState("");
  const [loja, setLoja] = useState("");

  // Carregar rede e loja do localStorage quando o componente montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const redeSelected = localStorage.getItem("redeSelected") || "";
      const lojaSelected = localStorage.getItem("lojaSelected") || "";
      
      if (!redeSelected || !lojaSelected) {
        toast.error("Selecione uma rede e loja primeiro");
        router.push("/promotor/pdv/ponto-de-venda");
        return;
      }
      
      setRede(redeSelected);
      setLoja(lojaSelected);
    }
  }, [router]);

  const handleSubmit = async () => {
    // Validação dos campos
    if (!marca || !produto || !estoque || !dataValidade) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      // Inserir no Supabase
      const { error } = await supabase
        .from("data_curta")
        .insert({
          marca,
          produto,
          quantidade: parseFloat(estoque),
          data_validade: dataValidade,
          rede,
          loja
        });

      if (error) throw error;

      // Redirecionar para a página de lista
      router.push("/promotor/pdv/data-curta/lista");
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar os dados. Por favor, tente novamente.");
    }
  };

  const handleConfirm = async () => {
    try {
      // Inserir no Supabase
      const { error } = await supabase
        .from("data_curta")
        .insert({
          marca,
          produto,
          quantidade: parseFloat(estoque),
          data_validade: dataValidade,
          rede,
          loja
        });

      if (error) throw error;

      toast.success("Produto registrado com sucesso!");
      
      // Limpar formulário
      setMarca("");
      setProduto("");
      setEstoque("");
      setDataValidade("");
      setShowConfirmDialog(false);
      
      // Adicionar item à lista
      setItems([...items, {
        id: Date.now(),
        marca,
        produto,
        quantidade: estoque,
        data_validade: dataValidade,
        rede,
        loja
      }]);
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar os dados. Por favor, tente novamente.");
      setShowConfirmDialog(false);
    }
  };

  const handleEdit = async (item) => {
    try {
      // Atualizar no Supabase
      const { error } = await supabase
        .from("data_curta")
        .update({
          marca: item.marca,
          produto: item.produto,
          quantidade: parseFloat(item.estoque),
          data_validade: item.dataValidade,
          rede: item.rede,
          loja: item.loja
        })
        .eq("id", item.id);

      if (error) throw error;

      toast.success("Produto atualizado com sucesso!");
      
      // Atualizar item na lista
      setItems(items.map(i => i.id === item.id ? item : i));
      
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar os dados. Por favor, tente novamente.");
    }
  };

  const handleDelete = async (id) => {
    try {
      // Deletar no Supabase
      const { error } = await supabase
        .from("data_curta")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Produto excluído com sucesso!");
      
      // Remover item da lista
      setItems(items.filter(item => item.id !== id));
      
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir os dados. Por favor, tente novamente.");
    }
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
          <Button
            variant="ghost"
            onClick={() => router.push("/promotor/pdv/ponto-de-venda")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
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
              <Clock className="w-12 h-12 text-rose-600" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Rede</label>
                      <Input
                        value={rede}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Loja</label>
                      <Input
                        value={loja}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Estoque</label>
                      <div className="relative">
                        <Package2 className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                        <Input
                          type="number"
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
                        router.push("/promotor/pdv/ponto-de-venda");
                      }
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-rose-500 hover:bg-rose-600 text-white px-8"
                  >
                    Adicionar
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
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th>Marca</th>
                        <th>Produto</th>
                        <th>Estoque</th>
                        <th>Data de Validade</th>
                        <th>Rede</th>
                        <th>Loja</th>
                        <th className="text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="font-medium">{item.marca}</td>
                          <td>{item.produto}</td>
                          <td>{item.quantidade}</td>
                          <td>{new Date(item.data_validade).toLocaleDateString()}</td>
                          <td>{item.rede}</td>
                          <td>{item.loja}</td>
                          <td>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setMarca(item.marca);
                                  setProduto(item.produto);
                                  setEstoque(item.quantidade);
                                  setDataValidade(item.data_validade);
                                  setRede(item.rede);
                                  setLoja(item.loja);
                                  setEditingItem(item);
                                  setShowForm(true);
                                }}
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
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-gray-500">
                            Nenhum item adicionado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal de Confirmação */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Produto</DialogTitle>
            <DialogDescription>
              Verifique se os dados estão corretos antes de confirmar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Marca</p>
                <p className="text-lg font-semibold">{marca}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Produto</p>
                <p className="text-lg font-semibold">{produto}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estoque</p>
                <p className="text-lg font-semibold">{estoque} un/kg</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Validade</p>
                <p className="text-lg font-semibold">
                  {dataValidade && format(new Date(dataValidade), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rede</p>
                <p className="text-lg font-semibold">{rede}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Loja</p>
                <p className="text-lg font-semibold">{loja}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
