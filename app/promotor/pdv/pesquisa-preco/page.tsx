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
import { ArrowLeft, Pencil, Trash2, Store, Plus, QrCode } from "lucide-react";
import BarcodeScanner from "components/barcode-scanner";
import { ConfirmModal } from "components/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "@/components/whatsapp-button";
import { createClient } from "@supabase/supabase-js";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PesquisaPrecoItem {
  id: number;
  marca: string;
  produto: string;
  preco: string;
  rede: string;
  loja: string;
  promo: boolean;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PesquisaPreco() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [produto, setProduto] = useState("");
  const [preco, setPreco] = useState("");
  const [items, setItems] = useState<PesquisaPrecoItem[]>([]);
  const [editingItem, setEditingItem] = useState<PesquisaPrecoItem | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [rede, setRede] = useState("");
  const [loja, setLoja] = useState("");
  const [promo, setPromo] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [scannedBrand, setScannedBrand] = useState("");
  const [scannedProduct, setScannedProduct] = useState("");

  const handleBarcodeScan = async (result: string) => {
    setIsScannerOpen(false);
    
    try {
      const { data: product, error } = await supabase
        .from('produto')
        .select('nome, marca')
        .eq('codigo_ean', result)
        .single();

      if (error) throw error;
      
      if (product) {
        setScannedBarcode(result);
        setScannedBrand(product.marca.toUpperCase());
        setScannedProduct(product.nome.toUpperCase());
        setIsModalOpen(true);
      } else {
        toast.error("Produto não encontrado no sistema");
      }
    } catch (error) {
      console.error('Erro ao processar código de barras:', error);
      toast.error("Erro ao buscar produto. Tente novamente.");
    }
  };

  const handleConfirmScan = () => {
    setMarca(scannedBrand);
    setProduto(scannedProduct);
    setIsModalOpen(false);
  };

  // Dados mockados para exemplo
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
    if (!marca || !produto || !preco || !rede || !loja) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, marca, produto, preco, rede, loja, promo }
          : item
      ));
      setEditingItem(null);
    } else {
      const newItem: PesquisaPrecoItem = {
        id: Date.now(),
        marca,
        produto,
        preco,
        rede,
        loja,
        promo
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
    setRede(item.rede);
    setLoja(item.loja);
    setPromo(item.promo);
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("Item removido com sucesso!");
  };

  const handleSave = async () => {
    try {
      // Verifica se há itens para salvar
      if (items.length === 0) {
        toast.error("Não há itens para salvar");
        return;
      }

      // Log para debug
      console.log('Itens a serem salvos:', items);

      // Salva todos os itens no Supabase
      const { data, error } = await supabase
        .from('pesquisa_preco')
        .insert(
          items.map(item => ({
            rede: item.rede,
            loja: item.loja,
            marca: item.marca,
            produto: item.produto,
            preco: parseFloat(item.preco),
            promo: item.promo
          }))
        )
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Dados salvos:', data);

      // Limpa a lista de itens após salvar
      setItems([]);
      toast.success("Dados salvos com sucesso!");
      
      // Mostra o diálogo de sucesso
      setShowSuccessDialog(true);
      
      // Volta para o modo de formulário
      setShowForm(true);
    } catch (error: any) {
      console.error('Erro ao salvar dados:', error);
      toast.error(error.message || "Erro ao salvar os dados");
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
              <Store className="w-12 h-12 text-rose-600" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pesquisa de Preço</h2>
            <p className="text-gray-500 mt-1">Registre os preços dos produtos</p>
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
                      <div className="flex gap-2">
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
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          onClick={() => setIsScannerOpen(true)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
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

                  {/* Campos Preço e Promoção lado a lado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preco">Preço</Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        min="0"
                        value={preco}
                        onChange={(e) => setPreco(e.target.value)}
                        placeholder="Digite o preço"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="h-6" /> {/* Espaçador para alinhar com o label do Preço */}
                      <div className="flex items-center gap-2 h-10"> {/* h-10 para alinhar com a altura do Input */}
                        <Checkbox
                          id="promo"
                          checked={promo}
                          onCheckedChange={(checked) => setPromo(checked as boolean)}
                        />
                        <label
                          htmlFor="promo"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                          Produto em Promoção
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => router.push("/promotor")}
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
                {/* Lista de itens */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Marca</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Rede</TableHead>
                        <TableHead>Loja</TableHead>
                        <TableHead>Promoção</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.marca}</TableCell>
                          <TableCell>{item.produto}</TableCell>
                          <TableCell>R$ {parseFloat(item.preco).toFixed(2)}</TableCell>
                          <TableCell>{item.rede}</TableCell>
                          <TableCell>{item.loja}</TableCell>
                          <TableCell>
                            {item.promo ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                Sim
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                Não
                              </span>
                            )}
                          </TableCell>
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

                <div className="flex justify-between items-center mt-4">
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
                      onClick={handleSave}
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      Gravar
                    </Button>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      Novo
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal de Confirmação */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dados Salvos com Sucesso!</DialogTitle>
            <DialogDescription>
              Os preços foram registrados com sucesso no banco de dados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                router.push("/promotor/pdv");
              }}
            >
              Voltar ao Menu
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowSuccessDialog(false);
                setShowForm(true);
              }}
            >
              Novo Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmScan}
        barcode={scannedBarcode}
        brand={scannedBrand}
        product={scannedProduct}
      />
    </motion.div>
  );
}
