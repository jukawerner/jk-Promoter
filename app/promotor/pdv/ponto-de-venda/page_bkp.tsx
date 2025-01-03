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
import { ArrowLeft, ImageIcon, Camera, Store, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "components/whatsapp-button";
import { supabase } from "lib/supabase";

export default function PontoVenda() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [marcas, setMarcas] = useState<any[]>([]);
  const [imagens, setImagens] = useState<File[]>([]);
  const [pontoExtra, setPontoExtra] = useState(false);
  const [rede, setRede] = useState("");
  const [loja, setLoja] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const { data, error } = await supabase
          .from('marca')
          .select('*')
          .order('nome');

        if (error) throw error;
        // Convert marca names to uppercase
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

  const handleConfirm = async () => {
    if (!marca || imagens.length === 0 || !rede || !loja) {
      toast.error("Por favor, preencha todos os campos e adicione pelo menos uma imagem");
      return;
    }

    try {
      const marcaSelecionada = marcas.find(m => m.id === marca);

      if (!marcaSelecionada) {
        toast.error("Marca não encontrada");
        return;
      }

      const uploadedUrls = [];
      
      for (const image of imagens) {
        try {
          const cleanFileName = `${Date.now()}_${image.size}_${image.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

          const { error: uploadError } = await supabase.storage
            .from('pdv-photos')
            .upload(cleanFileName, image, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Erro ao fazer upload da imagem:', uploadError);
            toast.error(`Erro ao enviar imagem ${image.name}`);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('pdv-photos')
            .getPublicUrl(cleanFileName);

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

      const { error: insertError } = await supabase
        .from('pdv')
        .insert({
          marca: marcaSelecionada.nome.toUpperCase(),
          ponto_extra_conquistado: pontoExtra,
          fotos: uploadedUrls,
          rede: rede.toUpperCase(),
          loja: loja.toUpperCase()
        });

      if (insertError) {
        console.error('Erro ao salvar no banco:', insertError);
        toast.error("Erro ao salvar os dados no banco");
        return;
      }

      toast.success("Dados salvos com sucesso!");
      setMarca("");
      setImagens([]);
      setPontoExtra(false);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error("Erro ao salvar os dados. Tente novamente.");
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

  const handleDeleteImage = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
    toast.success("Imagem removida com sucesso!");
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
          className="space-y-3 md:space-y-8 bg-white rounded-lg shadow-sm p-3 md:p-6 border"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AnimatePresence>
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid gap-3 md:gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="rede" className="text-sm">Rede</Label>
                    <Input
                      id="rede"
                      value={rede}
                      disabled
                      className="bg-gray-50 h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="loja" className="text-sm">Loja</Label>
                    <Input
                      id="loja"
                      value={loja}
                      disabled
                      className="bg-gray-50 h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="marca" className="text-sm">Marca</Label>
                    <Select
                      value={marca}
                      onValueChange={setMarca}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione a marca" className="text-sm" />
                      </SelectTrigger>
                      <SelectContent>
                        {marcas.map((marca) => (
                          <SelectItem key={marca.id} value={marca.id} className="text-sm">
                            {marca.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-5" />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="pontoExtra"
                        checked={pontoExtra}
                        onCheckedChange={(checked) => setPontoExtra(checked as boolean)}
                      />
                      <label
                        htmlFor="pontoExtra"
                        className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        Ponto Extra conquistado
                      </label>
                    </div>
                  </div>
                </div>

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
                              className="w-full flex items-center justify-center gap-2 hover:border-rose-500 hover:text-rose-500 transition-colors text-sm"
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
                              className="w-full flex items-center justify-center gap-2 hover:border-rose-500 hover:text-rose-500 transition-colors text-sm"
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

                  <AnimatePresence>
                    {imagens.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-3 gap-1.5 md:gap-4"
                      >
                        {imagens.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
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
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-2 pt-4 md:pt-6 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/promotor")}
                    className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 text-sm h-9"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2 text-sm h-9"
                  >
                    <Plus className="w-4 h-4" />
                    Gravar
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
