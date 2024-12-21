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
import { Label } from "@/components/ui/label";
import { ArrowLeft, Pencil, Trash2, ImageIcon, Camera, Store, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "@/components/whatsapp-button";
import { supabase } from "@/lib/supabase";
import { CameraCapture } from "@/components/camera-capture";

interface PontoVendaItem {
  id: number;
  marca_nome: string;
  imagens: File[];
  pontoExtra: boolean;
  rede: string;
  loja: string;
}

export default function PontoVenda() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [marcas, setMarcas] = useState<any[]>([]);
  const [imagens, setImagens] = useState<File[]>([]);
  const [pontoExtra, setPontoExtra] = useState(false);
  const [items, setItems] = useState<PontoVendaItem[]>([]);
  const [editingItem, setEditingItem] = useState<PontoVendaItem | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [rede, setRede] = useState("");
  const [loja, setLoja] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar marcas do Supabase
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const { data, error } = await supabase
          .from('marca')
          .select('*')
          .order('nome');

        if (error) throw error;
        setMarcas(data || []);
      } catch (error) {
        console.error('Erro ao carregar marcas:', error);
        toast.error('Erro ao carregar marcas');
      }
    };

    fetchMarcas();
  }, []);

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

  const handleConfirm = async () => {
    if (!marca || imagens.length === 0 || !rede || !loja) {
      toast.error("Por favor, preencha todos os campos e adicione pelo menos uma imagem");
      return;
    }

    try {
      // Buscar o nome da marca selecionada
      const marcaSelecionada = marcas.find(m => m.id === marca);

      if (!marcaSelecionada) {
        toast.error("Marca não encontrada");
        return;
      }

      if (editingItem) {
        setItems(items.map(item => 
          item.id === editingItem.id 
            ? { 
                ...item,
                marca_nome: marcaSelecionada.nome,
                imagens, 
                pontoExtra, 
                rede, 
                loja 
              }
            : item
        ));
        setEditingItem(null);
      } else {
        const newItem: PontoVendaItem = {
          id: Date.now(),
          marca_nome: marcaSelecionada.nome,
          imagens,
          pontoExtra,
          rede,
          loja
        };
        setItems([...items, newItem]);
      }

      // Limpar formulário
      setMarca("");
      setImagens([]);
      setPontoExtra(false);
      setShowForm(false);
      toast.success(editingItem ? "Item atualizado com sucesso!" : "Item adicionado com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar ponto de venda:', error);
      toast.error("Erro ao salvar ponto de venda");
    }
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

  const handleImageCapture = async (imageFile: File) => {
    try {
      setImagens(prev => [...prev, imageFile]);
      toast.success('Foto capturada com sucesso!');
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar imagem. Tente novamente.');
    }
  };

  const handleDeleteImage = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
    toast.success("Imagem removida com sucesso!");
  };

  const handleEdit = (item: PontoVendaItem) => {
    setMarca(item.marca_nome);
    setImagens(item.imagens);
    setPontoExtra(item.pontoExtra);
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este item?")) {
      return;
    }

    try {
      // 1. Buscar o registro com as fotos
      const { data: pdvData } = await supabase
        .from('pdv')
        .select('fotos')
        .eq('id', id)
        .single();

      // 2. Excluir as fotos do storage
      if (pdvData?.fotos) {
        const fileNames = pdvData.fotos.map(url => {
          const parts = url.split('pdv-photos/');
          return parts[parts.length - 1];
        }).filter(Boolean);

        if (fileNames.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('pdv-photos')
            .remove(fileNames);

          if (storageError) {
            console.error('Erro ao excluir fotos:', storageError);
          }
        }
      }

      // 3. Excluir o registro
      const { error: deleteError } = await supabase
        .from('pdv')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // 4. Atualizar interface
      setItems(items.filter(item => item.id !== id));
      toast.success("Item excluído com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error("Erro ao excluir o item");
    }
  };

  const handleSave = async () => {
    try {
      if (items.length === 0) {
        toast.error("Adicione pelo menos um item antes de gravar");
        return;
      }

      // Para cada item, precisamos primeiro fazer upload das imagens
      for (const item of items) {
        const uploadedUrls = [];
        
        // Upload de cada imagem
        for (const image of item.imagens) {
          try {
            // Limpar o nome do arquivo mantendo as dimensões originais
            const cleanFileName = `${Date.now()}_${image.size}_${image.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

            console.log('Uploading image:', {
              name: cleanFileName,
              size: image.size,
              type: image.type
            });

            // Upload da imagem com configurações para alta qualidade
            const { error: uploadError } = await supabase.storage
              .from('pdv-photos')
              .upload(cleanFileName, image, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'image/jpeg'
              });

            if (uploadError) {
              console.error('Erro ao fazer upload da imagem:', uploadError);
              toast.error(`Erro ao enviar imagem ${image.name}`);
              continue;
            }

            // Obter URL pública da imagem
            const { data: { publicUrl } } = supabase.storage
              .from('pdv-photos')
              .getPublicUrl(cleanFileName);

            console.log('Image uploaded successfully:', publicUrl);
            uploadedUrls.push(publicUrl);
          } catch (imageError) {
            console.error('Erro ao processar imagem:', imageError);
            toast.error(`Erro ao processar imagem ${image.name}`);
          }
        }

        if (uploadedUrls.length === 0) {
          toast.error("Nenhuma imagem foi enviada com sucesso");
          return;
        }

        try {
          // Salvar no banco de dados
          const { error: insertError } = await supabase
            .from('pdv')
            .insert({
              marca: item.marca_nome,
              ponto_extra_conquistado: item.pontoExtra,
              fotos: uploadedUrls,
              rede: item.rede,
              loja: item.loja
            });

          if (insertError) {
            console.error('Erro ao salvar no banco:', insertError);
            toast.error("Erro ao salvar os dados no banco");
            return;
          }

          toast.success("Dados salvos com sucesso!");
          setItems([]); // Limpar a lista de items após salvar
          router.back(); // Voltar para a página anterior
        } catch (dbError) {
          console.error('Erro ao salvar no banco:', dbError);
          toast.error("Erro ao salvar os dados no banco");
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error("Erro ao salvar os dados. Tente novamente.");
    }
  };

  const handleProximo = () => {
    router.push("/promotor/pdv/data-curta");
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
              <ImageIcon className="w-12 h-12 text-rose-600" />
            </div>
            <div className="absolute -right-2 -bottom-2 bg-rose-50 rounded-full p-2 shadow-sm border-2 border-white">
              <Store className="w-6 h-6 text-rose-600" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ponto de Venda</h2>
            <p className="text-gray-500 mt-1">Registre as fotos do PDV</p>
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

                  {/* Marca e Ponto Extra lado a lado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marca">Marca</Label>
                      <Select
                        value={marca}
                        onValueChange={setMarca}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {marcas.map((marca) => (
                            <SelectItem key={marca.id} value={marca.id}>
                              {marca.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="h-6" /> {/* Espaçador para alinhar com o label da Marca */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="pontoExtra"
                          checked={pontoExtra}
                          onCheckedChange={(checked) => setPontoExtra(checked as boolean)}
                        />
                        <label
                          htmlFor="pontoExtra"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                          Ponto Extra conquistado
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Área de upload de imagens */}
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 p-8 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-900/80">
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-center space-y-2">
                          <div className="text-gray-500 dark:text-gray-400">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">Arraste e solte suas imagens aqui ou</p>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 hover:border-rose-500 hover:text-rose-500 transition-colors"
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
                              onClick={() => setShowCamera(true)}
                              className="flex items-center gap-2 hover:border-rose-500 hover:text-rose-500 transition-colors"
                            >
                              <Camera className="w-4 h-4" />
                              Câmera
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview das imagens */}
                    <AnimatePresence>
                      {imagens.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        >
                          {imagens.map((image, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="relative group aspect-square"
                            >
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index}`}
                                className="w-full h-full object-cover rounded-lg ring-1 ring-gray-200 dark:ring-gray-800"
                              />
                              <button
                                onClick={() => handleDeleteImage(index)}
                                className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-rose-600 hover:scale-110"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (items.length > 0) {
                          setShowForm(false);
                        } else {
                          router.push("/promotor/pdv/estoque-loja");
                        }
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="w-4 h-4" /> Voltar
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
                        <TableHead>Imagens</TableHead>
                        <TableHead>Ponto Extra</TableHead>
                        <TableHead>Rede</TableHead>
                        <TableHead>Loja</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.marca_nome}</TableCell>
                          <TableCell>{item.imagens.length} imagem(ns)</TableCell>
                          <TableCell>
                            {item.pontoExtra ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                Sim
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                Não
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{item.rede}</TableCell>
                          <TableCell>{item.loja}</TableCell>
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

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                    disabled={items.length === 0}
                  >
                    Gravar
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {showCamera && (
        <CameraCapture
          isOpen={showCamera}
          onClose={() => setShowCamera(false)}
          onCapture={handleImageCapture}
        />
      )}
    </motion.div>
  );
}
