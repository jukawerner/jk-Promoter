"use client";

import { Button } from "components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2, Store, Package2, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "components/whatsapp-button";
import { supabase } from "lib/supabase";
import BarcodeScanner from "components/barcode-scanner";
import { findProductByEAN } from "lib/utils/product-search";
import { formatPromoterData, parseFormattedNumber } from "lib/utils/formatters";

type FormattedData = {
  [key: string]: string | number | FormattedData | FormattedData[] | null;
};

interface EstoqueItem {
  id?: string;
  marca: string;
  produto: string;
  estoque: string;
  estoqueVirtual: string;
  rede: string;
  loja: string;
}

interface Marca {
  id: string;
  nome: string;
}

interface Produto {
  id: string;
  nome: string;
  marca: string;
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
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const redeSelected = localStorage.getItem("redeSelected") || "";
      const lojaSelected = localStorage.getItem("lojaSelected") || "";
      
      if (!redeSelected || !lojaSelected) {
        toast.error("Selecione uma rede e loja primeiro");
        router.push("/promotor");
        return;
      }
      
      setRede(redeSelected.toUpperCase());
      setLoja(lojaSelected);
    }
  }, [router]);

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const { data, error } = await supabase
          .from('marca')
          .select('*')
          .order('nome');

        if (error) throw error;
        const formattedData = data?.map(item => ({
          ...item,
          nome: item.nome.toUpperCase()
        }));
        setMarcas(formattedData || []);
      } catch (error) {
        console.error('Erro ao carregar marcas:', error);
        toast.error('Erro ao carregar marcas');
      }
    };

    fetchMarcas();
  }, []);

  const carregarProdutos = async (marcaNome: string) => {
    try {
      const { data, error } = await supabase
        .from('produto')
        .select('*')
        .ilike('marca', marcaNome)
        .order('nome');

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('Nenhum produto encontrado para esta marca');
      }

      const formattedData = data?.map(item => ({
        ...item,
        nome: item.nome.toUpperCase(),
        marca: item.marca.toUpperCase()
      }));
      setProdutos(formattedData || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  const fetchExistingItems = async () => {
    try {
      const { data, error } = await supabase
        .from("estoque")
        .select("*")
        .eq("rede", rede)
        .eq("loja", loja);

      if (error) throw error;

      if (data) {
        const formattedItems = data.map(item => ({
          id: item.id,
          rede: item.rede.toUpperCase(),
          loja: item.loja.toUpperCase(),
          marca: item.marca.toUpperCase(),
          produto: item.produto.toUpperCase(),
          estoque: formatNumber(item.estoque_fisico),
          estoqueVirtual: formatNumber(item.estoque_virtual)
        }));
        setItems(formattedItems);
      }
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      toast.error("Erro ao carregar itens do estoque");
    }
  };

  useEffect(() => {
    if (marca) {
      carregarProdutos(marca);
    } else {
      setProdutos([]);
    }
  }, [marca]);

  useEffect(() => {
    if (rede && loja) {
      fetchExistingItems();
    }
  }, [rede, loja]);

  // Format number for display
  const formatNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const handleConfirm = async () => {
    if (!marca || !produto || !estoque || !estoqueVirtual || !rede || !loja) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      const itemData = {
        rede: rede.toUpperCase(),
        loja: loja.toUpperCase(),
        marca: marca.toUpperCase(),
        produto: produto.toUpperCase(),
        estoque_fisico: parseFormattedNumber(estoque),
        estoque_virtual: parseFormattedNumber(estoqueVirtual),
        created_at: new Date().toISOString()
      };

      let data, error;

      if (editingItem?.id) {
        // Update existing item
        const { data: updateData, error: updateError } = await supabase
          .from("estoque")
          .update(itemData)
          .eq('id', editingItem.id)
          .select();
        data = updateData;
        error = updateError;
      } else {
        // Insert new item
        const { data: insertData, error: insertError } = await supabase
          .from("estoque")
          .insert([itemData])
          .select();
        data = insertData;
        error = insertError;
      }

      if (error) throw error;

      if (data && data[0]) {
        const formattedItem = {
          id: data[0].id,
          rede: itemData.rede,
          loja: itemData.loja,
          marca: itemData.marca,
          produto: itemData.produto,
          estoque: formatNumber(itemData.estoque_fisico),
          estoqueVirtual: formatNumber(itemData.estoque_virtual)
        };

        setItems(prevItems => {
          if (editingItem?.id) {
            // Replace existing item
            return prevItems.map(item => 
              item.id === editingItem.id ? formattedItem : item
            );
          } else {
            // Add new item
            return [...prevItems, formattedItem];
          }
        });
      }

      toast.success(editingItem ? "Estoque atualizado com sucesso!" : "Estoque cadastrado com sucesso!");
      setMarca("");
      setProduto("");
      setEstoque("");
      setEstoqueVirtual("");
      setEditingItem(null);
    } catch (error) {
      console.error('Erro ao salvar estoque:', error);
      toast.error("Erro ao salvar estoque");
    }
  };

  const handleEdit = (item: EstoqueItem) => {
    setMarca(item.marca.toUpperCase());
    setProduto(item.produto.toUpperCase());
    setEstoque(formatNumber(item.estoque));
    setEstoqueVirtual(formatNumber(item.estoqueVirtual));
    setRede(item.rede.toUpperCase());
    setLoja(item.loja.toUpperCase());
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
              rede: item.rede.toUpperCase(),
              loja: item.loja.toUpperCase(),
              marca: item.marca.toUpperCase(),
              produto: item.produto.toUpperCase(),
              estoque_fisico: parseFormattedNumber(item.estoque),
              estoque_virtual: parseFormattedNumber(item.estoqueVirtual),
            }
          ]);
          
        if (error) throw error;
      }

      toast.success("Estoque salvo com sucesso!");
      setItems([]);
      router.push("/promotor/pdv/ponto-de-venda");
    } catch (error) {
      console.error("Erro ao salvar estoque:", error);
      toast.error("Erro ao salvar estoque");
    }
  };

  const handleBarcodeScan = async (result: string) => {
    setIsScannerOpen(false);
    console.log('Código de barras lido:', result);
    
    try {
      const product = await findProductByEAN(result);
      console.log('Produto retornado:', product);
      
      if (product) {
        console.log('Atualizando campos com:', {
          marca: product.marca_nome?.toUpperCase(),
          produto: product.nome.toUpperCase()
        });

        // Define a marca e produto diretamente
        setMarca(product.marca_nome?.toUpperCase() || '');
        setProduto(product.nome.toUpperCase());
        toast.success("Produto encontrado!");
      } else {
        console.log('Nenhum produto encontrado para o código:', result);
        toast.error("Produto não encontrado no sistema");
      }
    } catch (error) {
      console.error('Erro ao processar código de barras:', error);
      toast.error("Erro ao buscar produto. Tente novamente.");
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Marca</Label>
                      <div className="flex gap-2">
                        <Select
                          value={marca}
                          onValueChange={(value) => {
                            setMarca(value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a marca" />
                          </SelectTrigger>
                          <SelectContent>
                            {marcas.map((marca) => (
                              <SelectItem key={marca.id} value={marca.nome}>
                                {marca.nome}
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
                      <Select
                        value={produto}
                        onValueChange={setProduto}
                        disabled={!marca}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {produtos.map((produto) => (
                            <SelectItem key={produto.id} value={produto.nome}>
                              {produto.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estoque">Estoque Físico</Label>
                      <div className="relative">
                        <Package2 className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                        <Input
                          id="estoque"
                          type="text"
                          value={estoque}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d,]/g, '');
                            setEstoque(value);
                          }}
                          onBlur={(e) => {
                            if (e.target.value) {
                              const num = parseFormattedNumber(e.target.value);
                              setEstoque(formatNumber(num));
                            }
                          }}
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
                          type="text"
                          value={estoqueVirtual}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d,]/g, '');
                            setEstoqueVirtual(value);
                          }}
                          onBlur={(e) => {
                            if (e.target.value) {
                              const num = parseFormattedNumber(e.target.value);
                              setEstoqueVirtual(formatNumber(num));
                            }
                          }}
                          placeholder="Quantidade (un/kg)"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

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
                        <TableHead>Estoque Físico</TableHead>
                        <TableHead>Estoque Virtual</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.rede.toUpperCase()}</TableCell>
                          <TableCell>{item.loja}</TableCell>
                          <TableCell>{item.marca}</TableCell>
                          <TableCell>{item.produto}</TableCell>
                          <TableCell>{formatNumber(item.estoque)}</TableCell>
                          <TableCell>{formatNumber(item.estoqueVirtual)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item.id!)}
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
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </motion.div>
  );
}
