'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, QrCode, ImageIcon, Camera, X, ArrowLeft, FileText, ClipboardList } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from 'components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import BarcodeScanner from '@/components/barcode-scanner';
import { motion } from 'framer-motion';
import { ConfirmModal } from 'components/ConfirmModal';

const formSchema = z.object({
  rede: z.string().min(1, "Selecione uma rede"),
  loja: z.string().min(1, "Selecione uma loja"),
  marca: z.string().min(1, "Selecione uma marca"),
  produto: z.string().min(1, "Selecione um produto"),
  motivo: z.string().min(1, "Selecione um motivo"),
  numero_nota_fiscal: z.string().min(1, "Digite o número da nota fiscal"),
  valor_total: z.string().min(1, "Digite o valor total"),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [endereco, setEndereco] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [scannedBrand, setScannedBrand] = useState("");
  const [scannedProduct, setScannedProduct] = useState("");
  const [imagens, setImagens] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rede: "",
      loja: "",
      marca: "",
      produto: "",
      motivo: "",
      numero_nota_fiscal: "",
      valor_total: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const redeSelected = localStorage.getItem("redeSelected") || "";
      const lojaSelected = localStorage.getItem("lojaSelected") || "";
      
      if (!redeSelected || !lojaSelected) {
        toast.error("Selecione uma rede e loja primeiro");
        router.push("/promotor");
        return;
      }
      
      form.setValue("rede", redeSelected.toUpperCase());
      form.setValue("loja", lojaSelected);
    }
  }, [router, form]);

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

  useEffect(() => {
    if (form.getValues("marca")) {
      carregarProdutos(form.getValues("marca"));
    }
  }, [form.getValues("marca")]);

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
        return;
      }

      const formattedData = data?.map(item => ({
        ...item,
        nome: item.nome.toUpperCase(),
        marca: item.marca.toUpperCase()
      }));

      // Remove duplicatas baseado no ID
      const uniqueProducts = formattedData.filter((produto, index, self) =>
        index === self.findIndex((p) => p.id === produto.id)
      );

      setProdutos(uniqueProducts || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  useEffect(() => {
    const fetchLojaDetails = async () => {
      if (form.getValues("loja")) {
        try {
          const { data, error } = await supabase
            .from('loja')
            .select('endereco, cnpj')
            .eq('nome', form.getValues("loja"))
            .single();

          if (error) throw error;

          if (data) {
            setEndereco(data.endereco);
            setCnpj(data.cnpj);
          }
        } catch (error) {
          console.error('Erro ao carregar detalhes da loja:', error);
          toast.error('Erro ao carregar detalhes da loja');
        }
      }
    };

    fetchLojaDetails();
  }, [form.getValues("loja")]);

  const handleBarcodeScan = async (result: string) => {
    setIsScannerOpen(false);
    console.log('Código lido:', result);
    
    try {
      const { data: product, error } = await supabase
        .from('produto')
        .select('*') // Selecionar todos os campos para debug
        .eq('codigo_ean', result)
        .single();

      console.log('Produto encontrado:', product);
      console.log('Erro:', error);

      if (error) throw error;
      
      if (product) {
        console.log('Setando estados:', {
          barcode: result,
          brand: product.marca,
          product: product.nome
        });
        
        setScannedBarcode(result);
        setScannedBrand(product.marca.toUpperCase());
        setScannedProduct(product.nome.toUpperCase());
        setIsModalOpen(true);

        console.log('Modal deve estar aberto:', {
          isModalOpen: true,
          scannedBrand: product.marca.toUpperCase(),
          scannedProduct: product.nome.toUpperCase()
        });
      } else {
        toast.error("Produto não encontrado no sistema");
      }
    } catch (error) {
      console.error('Erro ao processar código de barras:', error);
      toast.error("Erro ao buscar produto. Tente novamente.");
    }
  };

  const handleConfirmScan = () => {
    console.log('Confirmando seleção:', {
      marca: scannedBrand,
      produto: scannedProduct
    });

    form.setValue("marca", scannedBrand);
    form.setValue("produto", scannedProduct);
    setIsModalOpen(false);

    // Forçar carregamento dos produtos
    carregarProdutos(scannedBrand);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const uploadedUrls = [];
      
      for (const image of imagens) {
        try {
          const cleanFileName = `${Date.now()}_${image.size}_${image.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          
          // Primeiro, tenta fazer o upload
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('rnc_photos')
            .upload(cleanFileName, image);

          if (uploadError) {
            console.error('Erro ao fazer upload da imagem:', uploadError);
            toast.error(`Erro ao enviar imagem ${image.name}: ${uploadError.message}`);
            continue;
          }

          if (!uploadData?.path) {
            console.error('Upload realizado mas path não retornado');
            toast.error(`Erro ao obter URL da imagem ${image.name}`);
            continue;
          }

          // Se o upload foi bem sucedido, pega a URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('rnc_photos')
            .getPublicUrl(uploadData.path);

          if (!publicUrl) {
            console.error('URL pública não gerada');
            continue;
          }

          uploadedUrls.push(publicUrl);
          console.log('Upload realizado com sucesso:', publicUrl);
        } catch (imageError) {
          console.error('Erro ao processar imagem:', imageError);
          toast.error(`Erro ao processar imagem ${image.name}`);
        }
      }

      if (uploadedUrls.length === 0) {
        toast.error("Nenhuma imagem foi enviada com sucesso");
        return;
      }

      const valorTotal = data.valor_total
        .replace(/[^\d,]/g, '')
        .replace(',', '.');

      const { error: insertError } = await supabase.from("rnc").insert([
        {
          rede_id: data.rede,
          loja_id: data.loja,
          marca_id: data.marca,
          produto_id: data.produto,
          motivo: data.motivo,
          numero_nota_fiscal: data.numero_nota_fiscal,
          valor_total: parseFloat(valorTotal),
          observacoes: data.observacoes,
          fotos: uploadedUrls,
        },
      ]);

      if (insertError) {
        console.error('Erro ao salvar no banco:', insertError);
        toast.error("Erro ao salvar os dados no banco");
        return;
      }

      toast.success("RNC registrado com sucesso!");
      form.reset();
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
      <div className="container mx-auto px-3 py-4 md:p-6 max-w-[800px]">
        <div className="flex flex-col items-center text-center space-y-3 md:space-y-6 mb-4 md:mb-8">
          <motion.div 
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="bg-rose-100 p-4 rounded-full">
              <FileText className="w-12 h-12 text-rose-600" />
            </div>
            <div className="absolute -right-2 -bottom-2 bg-rose-50 rounded-full p-2 shadow-sm border-2 border-white">
              <ClipboardList className="w-6 h-6 text-rose-600" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Relatório de Não Conformidade</h2>
            <p className="text-gray-500 mt-1">Registre ocorrências e não conformidades encontradas nos produtos</p>
          </div>
        </div>

        <motion.div 
          className="space-y-3 md:space-y-8 bg-white rounded-lg shadow-sm p-3 md:p-6 border"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rede"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Rede</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loja"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Loja</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="marca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Marca</FormLabel>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              carregarProdutos(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecione a marca" />
                              </SelectTrigger>
                            </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="produto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Produto</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Selecione o produto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {produtos.map((produto) => (
                              <SelectItem key={produto.id} value={produto.nome}>
                                {produto.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="motivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Motivo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione o motivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Produto vencido">Produto vencido</SelectItem>
                          <SelectItem value="Produto avariado no transporte (pote quebrado, produto amassado)">Produto avariado no transporte (pote quebrado, produto amassado)</SelectItem>
                          <SelectItem value="Produto com problemas de qualidade (corpo estranho, mofo, fora do padrão de qualidade, divergência de data entre nota fiscal e embalagem)">Produto com problemas de qualidade (corpo estranho, mofo, fora do padrão de qualidade, divergência de data entre nota fiscal e embalagem)</SelectItem>
                          <SelectItem value="Produto para uso em degustação">Produto para uso em degustação</SelectItem>
                          <SelectItem value="Ausência do produtos em caixa (diferença de peso e/ou falta de unidade)">Ausência do produtos em caixa (diferença de peso e/ou falta de unidade)</SelectItem>
                          <SelectItem value="Divergência comercial (divergência de preço faturado x preço negociado, divergência de pedido x faturado, quantidade faturada errada, item faturado sem pedido)">Divergência comercial (divergência de preço faturado x preço negociado, divergência de pedido x faturado, quantidade faturada errada, item faturado sem pedido)</SelectItem>
                          <SelectItem value="Produto com data curta">Produto com data curta</SelectItem>
                          <SelectItem value="Inversão do produto (produto faturado é diferente do produto entregue)">Inversão do produto (produto faturado é diferente do produto entregue)</SelectItem>
                          <SelectItem value="Temperatura">Temperatura</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numero_nota_fiscal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Número da Nota Fiscal</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valor_total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Valor Total</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="h-9"
                            onChange={(e) => {
                              const value = e.target.value;
                              const numericValue = value.replace(/[^\d]/g, '');
                              if (numericValue === '') {
                                field.onChange('');
                                return;
                              }
                              const numberValue = Number(numericValue) / 100;
                              const formatted = numberValue.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              });
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="min-h-[100px] resize-none"
                          placeholder="Digite aqui observações adicionais..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 p-3 md:p-6 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-900/80">
                    <div className="flex flex-col items-center gap-2 md:gap-4">
                      <div className="text-center space-y-2">
                        <div className="text-gray-500 dark:text-gray-400">
                          <ImageIcon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-[10px] md:text-sm">Adicione suas imagens</p>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <div className="w-full grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full flex items-center justify-center gap-2 hover:border-rose-500 hover:text-rose-500 transition-colors text-sm h-9"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Galeria
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              onClick={() => document.getElementById('camera-input')?.click()}
                              className="w-full flex items-center justify-center gap-2 hover:border-rose-500 hover:text-rose-500 transition-colors text-sm h-9"
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
                              onChange={handleImageUpload}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 md:gap-4">
                    {imagens.map((image, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-md overflow-hidden"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover rounded-lg ring-1 ring-gray-200 dark:ring-gray-800"
                        />
                        <button
                          onClick={() => handleDeleteImage(index)}
                          className="absolute -top-1 -right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-rose-600 hover:scale-110"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-2 pt-4 md:pt-6 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push("/promotor")}
                    className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 text-sm h-9"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2 text-sm h-9"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Gravar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>

      {isScannerOpen && (
        <BarcodeScanner
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScan={handleBarcodeScan}
        />
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Fechando modal');
          setIsModalOpen(false);
        }}
        onConfirm={() => {
          console.log('Modal confirmado');
          handleConfirmScan();
        }}
        barcode={scannedBarcode}
        brand={scannedBrand}
        product={scannedProduct}
      />
    </motion.div>
  );
}
