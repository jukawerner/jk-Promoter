'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Save, QrCode, ImageIcon, Camera, X, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from 'components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import BarcodeScanner from '@/components/barcode-scanner';
import { motion } from 'framer-motion';
import { ConfirmModal } from 'components/ConfirmModal';
import { formatCurrency } from '@/lib/utils';

interface Marca {
  id: string;
  nome: string;
}

interface Produto {
  id: string;
  nome: string;
  marca: string;
}

export default function RNCPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rede, setRede] = useState("");
  const [loja, setLoja] = useState("");
  const [marca, setMarca] = useState("");
  const [produto, setProduto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [numeroNotaFiscal, setNumeroNotaFiscal] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [scannedBrand, setScannedBrand] = useState("");
  const [scannedProduct, setScannedProduct] = useState("");
  const [imagens, setImagens] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega rede e loja do localStorage
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
      setLoja(lojaSelected.toUpperCase());
    }
  }, [router]);

  // Carrega marcas
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

  // Carrega produtos quando marca é selecionada
  useEffect(() => {
    const carregarProdutos = async () => {
      if (!marca) {
        setProdutos([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('produto')
          .select('*')
          .ilike('marca', marca)
          .order('nome');

        if (error) throw error;

        if (!data || data.length === 0) {
          toast.error('Nenhum produto encontrado para esta marca');
          return;
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

    carregarProdutos();
  }, [marca]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setImagens([...imagens, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImagens(imagens.filter((_, i) => i !== index));
  };

  const handleBarcodeScan = async (result: string) => {
    setIsScannerOpen(false);
    setScannedBarcode(result);
    setIsModalOpen(true);

    try {
      const { data: produtos, error } = await supabase
        .from('produto')
        .select('*')
        .eq('codigo_barras', result)
        .single();

      if (error || !produtos) {
        toast.error('Produto não encontrado');
        return;
      }

      setScannedBrand(produtos.marca);
      setScannedProduct(produtos.nome);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast.error('Erro ao buscar produto');
    }
  };

  const handleConfirmScan = () => {
    setMarca(scannedBrand);
    setTimeout(() => {
      setProduto(scannedProduct);
      setIsModalOpen(false);
    }, 500);
  };

  const handleSubmit = async () => {
    if (!marca || !produto || !motivo || !numeroNotaFiscal || !valorTotal) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (imagens.length === 0) {
      toast.error("Adicione pelo menos uma foto");
      return;
    }

    setIsLoading(true);

    try {
      // Upload das imagens
      const uploadPromises = imagens.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('rnc_photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        return filePath;
      });

      const uploadedPaths = await Promise.all(uploadPromises);

      // Salva o RNC
      const { error: insertError } = await supabase
        .from("rnc")
        .insert([
          {
            rede_id: rede,
            loja_id: loja,
            marca_id: marca,
            produto_id: produto,
            motivo: motivo,
            numero_nota_fiscal: numeroNotaFiscal,
            valor_total: parseFloat(valorTotal.replace(/[^0-9,]/g, '').replace(',', '.')),
            observacoes: observacoes,
            fotos: uploadedPaths,
          },
        ]);

      if (insertError) throw insertError;

      toast.success("RNC registrado com sucesso!");
      
      // Limpa os campos após salvar com sucesso
      setMarca("");
      setProduto("");
      setMotivo("");
      setNumeroNotaFiscal("");
      setValorTotal("");
      setObservacoes("");
      setImagens([]);
      
    } catch (error) {
      console.error("Erro ao salvar RNC:", error);
      toast.error("Erro ao salvar RNC");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="container mx-auto p-6 max-w-[800px]">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/promotor/pdv")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ImageIcon className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-[#1f2937] mb-4">Relatório de Não Conformidade</h1>
          <p className="text-xl text-gray-500">Registre ocorrências e não conformidades encontradas nos produtos</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Grid de Rede e Loja */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Rede</h2>
              <div className="p-2.5 bg-gray-50 rounded-md text-gray-900">
                {rede}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Loja</h2>
              <div className="p-2.5 bg-gray-50 rounded-md text-gray-900">
                {loja}
              </div>
            </div>
          </div>

          {/* Grid de Marca e Produto */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Seleção de Marca */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Marca</h2>
              <div className="flex gap-2">
                <Select value={marca} onValueChange={setMarca}>
                  <SelectTrigger className="bg-white">
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
                  className="shrink-0"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Seleção de Produto */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Produto</h2>
              <Select value={produto} onValueChange={setProduto}>
                <SelectTrigger className="bg-white">
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

          {/* Demais campos em uma coluna */}
          <div className="space-y-6">
            {/* Motivo */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Motivo</h2>
              <Select value={motivo} onValueChange={setMotivo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUTO_VENCIDO">Produto Vencido</SelectItem>
                  <SelectItem value="PRODUTO_AVARIADO">Produto Avariado</SelectItem>
                  <SelectItem value="PRODUTO_INCORRETO">Produto Incorreto</SelectItem>
                  <SelectItem value="QUANTIDADE_INCORRETA">Quantidade Incorreta</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nota Fiscal */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Número da Nota Fiscal</h2>
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numeroNotaFiscal}
                onChange={(e) => setNumeroNotaFiscal(e.target.value)}
                placeholder="Digite o número da nota fiscal"
              />
            </div>

            {/* Valor Total */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Valor Total</h2>
              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                value={valorTotal}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value === '') {
                    setValorTotal('');
                    return;
                  }
                  const numberValue = parseInt(value);
                  const formattedValue = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(numberValue / 100);
                  setValorTotal(formattedValue);
                }}
                placeholder="R$ 0,00"
              />
            </div>

            {/* Observações */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Observações</h2>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Digite observações adicionais"
              />
            </div>

            {/* Upload de Fotos */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Fotos</h2>
              <div className="flex flex-wrap gap-4">
                {imagens.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-24 h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-8 w-8" />
                  <span className="text-xs">Adicionar Foto</span>
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                />
              </div>
            </div>

            {/* Botão Salvar */}
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar RNC
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Scanner de Código de Barras</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsScannerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <BarcodeScanner onResult={handleBarcodeScan} />
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {isModalOpen && (
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmScan}
          title="Produto Encontrado"
          description={`Marca: ${scannedBrand}\nProduto: ${scannedProduct}`}
        />
      )}
    </motion.div>
  );
}
