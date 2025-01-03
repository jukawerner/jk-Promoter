'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Save, ImageIcon, Camera, X, ArrowLeft, FileText, ClipboardList, QrCode } from 'lucide-react';
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
import { formatCurrency } from '@/lib/utils';
import { motion } from "framer-motion";
import BarcodeScanner from "components/barcode-scanner";
import { ConfirmModal } from "components/ConfirmModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "components/ui/dialog";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rede, setRede] = useState("");
  const [loja, setLoja] = useState("");
  const [marca, setMarca] = useState("");
  const [produto, setProduto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [numeroNotaFiscal, setNumeroNotaFiscal] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [imagens, setImagens] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
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
        router.push("/promotor");
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

        setMarcas(marcasData);
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
      setProdutos(formattedData || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  useEffect(() => {
    if (marca) {
      carregarProdutos(marca);
    } else {
      setProdutos([]);
    }
  }, [marca]);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const validImageFiles = Array.from(files).filter(file =>
        file.type.startsWith('image/')
      );

      if (validImageFiles.length > 0) {
        setImagens(prev => [...prev, ...validImageFiles]);
        toast.success("Imagens adicionadas com sucesso!");
      } else {
        toast.error("Por favor, selecione apenas arquivos de imagem");
      }
    } catch (error) {
      console.error('Erro ao processar imagens:', error);
      toast.error("Erro ao processar as imagens");
    }
  };

  const handleDeleteImage = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
    toast.success("Imagem removida com sucesso!");
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

  const handleConfirmScan = async () => {
    setMarca(scannedBrand);
    setProduto(scannedProduct);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 py-4 md:p-6 max-w-[800px]">
        <Button
          variant="ghost"
          className="mb-4 md:mb-6"
          onClick={() => router.push("/promotor")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex flex-col items-center text-center space-y-3 md:space-y-6 mb-4 md:mb-8">
          <motion.div 
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="bg-rose-100 p-4 rounded-full">
              <FileText className="w-12 h-12 text-rose-500" />
            </div>
            <div className="absolute -right-2 -bottom-2 bg-rose-100 rounded-full p-2 shadow-sm border-2 border-white">
              <ClipboardList className="w-6 h-6 text-rose-500" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Relatório de Não Conformidade</h2>
            <p className="text-gray-500 mt-1">Registre ocorrências e não conformidades encontradas nos produtos</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 md:p-6 border space-y-3 md:space-y-6">
          {/* Rede e Loja */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5">Rede</Label>
              <Input
                value={rede}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5">Loja</Label>
              <Input
                value={loja}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Marca e Produto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5">Marca</Label>
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
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5">Produto</Label>
              <Select value={produto} onValueChange={setProduto} disabled={!marca}>
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

          {/* Motivo */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5">Motivo</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRODUTO_VENCIDO">Produto vencido</SelectItem>
                <SelectItem value="PRODUTO_AVARIADO">
                  Produto avariado no transporte (pote quebrado, produto amassado)
                </SelectItem>
                <SelectItem value="PROBLEMA_QUALIDADE">
                  Produto com problemas de qualidade (corpo estranho, mofo, fora do padrão de qualidade, divergência de data entre nota fiscal e embalagem)
                </SelectItem>
                <SelectItem value="DEGUSTACAO">Produto para uso em degustação</SelectItem>
                <SelectItem value="AUSENCIA_PRODUTOS">
                  Ausência do produtos em caixa (diferença de peso e/ou falta de unidade)
                </SelectItem>
                <SelectItem value="DIVERGENCIA_COMERCIAL">
                  Divergência comercial (divergência de preço faturado x preço negociado, divergência de pedido x faturado, quantidade faturada errada, item faturado sem pedido)
                </SelectItem>
                <SelectItem value="DATA_CURTA">Produto com data curta</SelectItem>
                <SelectItem value="INVERSAO_PRODUTO">
                  Inversão do produto (produto faturado é diferente do produto entregue)
                </SelectItem>
                <SelectItem value="TEMPERATURA">Temperatura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nota Fiscal e Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5">Número da Nota Fiscal</Label>
              <Input
                type="text"
                value={numeroNotaFiscal}
                onChange={(e) => setNumeroNotaFiscal(e.target.value)}
                className="pl-10"
                placeholder="Digite o número da nota fiscal"
                inputMode="numeric"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5">Valor Total</Label>
              <Input
                type="text"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                className="pl-10"
                placeholder="Digite o valor total"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5">Observações (opcional)</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="min-h-[80px]"
              placeholder="Observações adicionais"
            />
          </div>

          {/* Upload de Fotos */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5">Fotos</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-4 transition-colors hover:bg-gray-50/80">
              <div className="flex flex-col items-center gap-2">
                <div className="text-center space-y-2">
                  <div className="text-gray-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Adicione suas imagens</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Galeria
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('camera-input')?.click()}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Câmera
                    </Button>
                    <input
                      id="camera-input"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </div>
                </div>
              </div>
            </div>

            {imagens.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {imagens.map((image, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-md overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover rounded-lg ring-1 ring-gray-200"
                    />
                    <button
                      onClick={() => handleDeleteImage(index)}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-rose-600 hover:scale-110"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão de Enviar */}
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </div>
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
    </div>
  );
}
