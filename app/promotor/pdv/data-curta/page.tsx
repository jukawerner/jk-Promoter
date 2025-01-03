"use client";

import { Button } from "components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { Checkbox } from "components/ui/checkbox";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table";
import { ArrowLeft, Pencil, Trash2, ImageIcon, Camera, Store, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "components/whatsapp-button";
import { supabase } from "lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, AlertTriangle, Package2, QrCode } from "lucide-react";
import BarcodeScanner from "components/barcode-scanner";
import { ConfirmModal } from "components/ConfirmModal";
import { formatNumber, parseFormattedNumber } from "lib/utils/formatters";

interface Marca {
  id: string;
  nome: string;
}

interface Produto {
  id: string;
  nome: string;
  marca: string;
}

interface Item {
  id: number;
  marca: string;
  produto: string;
  quantidade: string;
  data_validade: string;
  rede: string;
  loja: string;
}

const marcas = [] as Marca[];
const produtos = [] as Produto[];

export default function DataCurtaPage() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [produto, setProduto] = useState("");
  const [estoque, setEstoque] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [rede, setRede] = useState("");
  const [loja, setLoja] = useState("");
  const [marcasState, setMarcasState] = useState<Marca[]>([]);
  const [produtosState, setProdutosState] = useState<Produto[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [scannedBrand, setScannedBrand] = useState("");
  const [scannedProduct, setScannedProduct] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const redeSelected = localStorage.getItem("redeSelected") || "";
      const lojaSelected = localStorage.getItem("lojaSelected") || "";
      
      if (!redeSelected || !lojaSelected) {
        toast.error("Selecione uma rede e loja primeiro");
        router.push("/promotor/pdv/ponto-de-venda");
        return;
      }
      
      setRede(redeSelected.toUpperCase());
      setLoja(lojaSelected.toUpperCase());
    }
  }, [router]);

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        // Buscar o telefone do usuário do localStorage
        const phone = localStorage.getItem("userPhone");
        if (!phone) {
          toast.error("Usuário não encontrado");
          router.push("/");
          return;
        }

        // Primeiro, buscar o ID do promotor pelo telefone
        const { data: userData, error: userError } = await supabase
          .from("usuario")
          .select("id")
          .eq("telefone", phone)
          .single();

        if (userError || !userData) {
          console.error("Erro ao buscar usuário:", userError);
          toast.error("Erro ao buscar usuário");
          return;
        }

        // Agora, buscar as marcas vinculadas ao promotor
        const { data: promoterBrands, error: brandsError } = await supabase
          .from('promoter_marca')
          .select(`
            marca:marca_id (
              id,
              nome
            )
          `)
          .eq('promoter_id', userData.id);

        if (brandsError) {
          console.error("Erro ao buscar marcas:", brandsError);
          toast.error("Erro ao carregar marcas");
          return;
        }

        // Transformar os dados para o formato esperado
        const marcasData = promoterBrands
          .map(item => item.marca)
          .filter(brand => brand !== null)
          .map(brand => ({
            id: brand.id.toString(),
            nome: brand.nome
          }));

        setMarcasState(marcasData);
      } catch (error) {
        console.error("Erro ao carregar marcas:", error);
        toast.error("Erro ao carregar marcas");
      }
    };

    fetchMarcas();
  }, [router]);

  const carregarProdutos = async (marcaNome: string) => {
    try {
      const { data, error } = await supabase
        .from('produto')
        .select('*')
        .ilike('marca', marcaNome)
        .order('nome');

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        toast.error('Nenhum produto encontrado para esta marca');
      }

      const formattedData = data?.map(item => ({
        ...item,
        nome: item.nome.toUpperCase(),
        marca: item.marca.toUpperCase()
      }));
      setProdutosState(formattedData || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  useEffect(() => {
    if (marca) {
      carregarProdutos(marca);
    } else {
      setProdutosState([]);
    }
  }, [marca]);

  const handleSubmit = async () => {
    if (!marca || !produto || !estoque || !dataValidade) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      const dadosParaSalvar = {
        produto: produto.toUpperCase(),
        marca: marca.toUpperCase(),
        quantidade: parseFormattedNumber(estoque),
        data_validade: dataValidade,
        rede: rede.toUpperCase(),
        loja: loja.toUpperCase(),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("data_curta")
        .insert(dadosParaSalvar)
        .select();

      if (error) {
        console.error('Erro ao salvar:', error);
        throw error;
      }

      toast.success("Produto cadastrado com sucesso!");
      
      setMarca("");
      setProduto("");
      setEstoque("");
      setDataValidade("");
      
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error("Erro ao salvar produto");
    }
  };

  const handleGravar = () => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item antes de gravar");
      return;
    }
    router.push("/promotor/pdv/avaliacao");
  };

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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="container mx-auto p-6 max-w-[800px]">
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
                      <Label htmlFor="marca">Marca</Label>
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
                            {marcasState.map((marca) => (
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
                          {produtosState.map((produto) => (
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
                      <label className="text-sm font-medium text-gray-700">Quantidade</label>
                      <div className="relative">
                        <Package2 className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                        <Input
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
                          inputMode="decimal"
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

                <div className="flex justify-between items-center pt-6">
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/promotor")}
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
                        <th>Quantidade</th>
                        <th>Data de Validade</th>
                        <th>Rede</th>
                        <th>Loja</th>
                        <th className="text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="font-medium">{item.marca.toUpperCase()}</td>
                          <td>{item.produto.toUpperCase()}</td>
                          <td>{formatNumber(item.quantidade)}</td>
                          <td>{new Date(item.data_validade).toLocaleDateString()}</td>
                          <td>{item.rede.toUpperCase()}</td>
                          <td>{item.loja.toUpperCase()}</td>
                          <td>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const marca = marcasState.find(m => m.nome.toUpperCase() === item.marca.toUpperCase());
                                  const produto = produtosState.find(p => p.nome.toUpperCase() === item.produto.toUpperCase());
                                  setMarca(marca?.nome.toUpperCase() || '');
                                  setProduto(produto?.nome.toUpperCase() || '');
                                  setEstoque(formatNumber(item.quantidade));
                                  setDataValidade(item.data_validade);
                                  setRede(item.rede.toUpperCase());
                                  setLoja(item.loja.toUpperCase());
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
                                onClick={() => {
                                  setItems(items.filter(i => i.id !== item.id));
                                }}
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
