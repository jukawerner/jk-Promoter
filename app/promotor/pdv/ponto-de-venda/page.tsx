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
import { ArrowLeft, Pencil, Trash2, ImageIcon, Camera, Store, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "@/components/whatsapp-button";
import { supabase } from "@/lib/supabase";

interface PontoVendaItem {
  id: number;
  marca: string;
  imagens: File[];
  pontoExtra: boolean;
}

export default function PontoVenda() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [imagens, setImagens] = useState<File[]>([]);
  const [pontoExtra, setPontoExtra] = useState(false);
  const [items, setItems] = useState<PontoVendaItem[]>([]);
  const [editingItem, setEditingItem] = useState<PontoVendaItem | null>(null);
  const [showForm, setShowForm] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];

  const handleConfirm = () => {
    if (!marca || imagens.length === 0) {
      toast.error("Por favor, selecione uma marca e adicione pelo menos uma imagem");
      return;
    }

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, marca, imagens, pontoExtra }
          : item
      ));
      setEditingItem(null);
    } else {
      const newItem: PontoVendaItem = {
        id: Date.now(),
        marca,
        imagens,
        pontoExtra,
      };
      setItems([...items, newItem]);
    }

    // Limpar formulário
    setMarca("");
    setImagens([]);
    setPontoExtra(false);
    setShowForm(false);
    toast.success(editingItem ? "Item atualizado com sucesso!" : "Item adicionado com sucesso!");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (newImages.length > 0) {
        setImagens(prev => [...prev, ...newImages]);
        toast.success("Imagens adicionadas com sucesso!");
      } else {
        toast.error("Por favor, selecione apenas arquivos de imagem");
      }
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Aqui você pode implementar a lógica para capturar a foto
      // Por enquanto, vamos apenas mostrar que a câmera foi acessada
      toast.success("Câmera aberta com sucesso!");
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast.error("Erro ao acessar a câmera");
    }
  };

  const handleDeleteImage = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
    toast.success("Imagem removida com sucesso!");
  };

  const handleEdit = (item: PontoVendaItem) => {
    setMarca(item.marca);
    setImagens(item.imagens);
    setPontoExtra(item.pontoExtra);
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("Item excluído com sucesso!");
  };

  const handleGravar = async () => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item antes de gravar");
      return;
    }

    try {
      for (const item of items) {
        const uploadedUrls = [];
        
        // Upload das imagens
        for (const image of item.imagens) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

          // Upload do arquivo
          const { error: uploadError } = await supabase.storage
            .from('pdv-photos')
            .upload(fileName, image, {
              cacheControl: '3600',
              contentType: image.type
            });

          if (uploadError) throw uploadError;

          // Pegar a URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('pdv-photos')
            .getPublicUrl(fileName);

          uploadedUrls.push(publicUrl);
        }

        // Salvar no banco
        const { error: insertError } = await supabase
          .from('pdv')
          .insert({
            marca: item.marca,
            ponto_extra_conquistado: item.pontoExtra,
            fotos: uploadedUrls
          });

        if (insertError) throw insertError;
      }

      toast.success("PDV gravado com sucesso!");
      setItems([]); // Limpa a lista após gravar
      setShowForm(true); // Volta para o formulário
    } catch (error) {
      console.error("Erro ao gravar PDV:", error);
      toast.error("Erro ao gravar PDV. Por favor, tente novamente.");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Toaster richColors />
      <div className="container mx-auto p-6 max-w-[800px]">
        <WhatsappButton />
        <div className="space-y-8">
          {/* Header com ícone e título */}
          <div className="flex flex-col items-center text-center space-y-3">
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
              <h2 className="text-2xl font-bold text-gray-900">Ponto de Venda</h2>
              <p className="text-gray-500 mt-1">Registre os pontos de venda e suas características</p>
            </div>
          </div>

          {showForm ? (
            <motion.div 
              className="space-y-6 bg-white rounded-xl shadow-sm border p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
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
                          onClick={handleCameraCapture}
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

              {/* Seleção de Marca */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Marca
                  </label>
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

                <div className="flex items-center gap-2 pt-2">
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

              {/* Botões de ação */}
              <div className="flex justify-between items-center pt-6 border-t">
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
                  className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {editingItem ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Lista de itens */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Marca</TableHead>
                      <TableHead>Imagens</TableHead>
                      <TableHead>Ponto Extra</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.marca}</TableCell>
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

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Novo
                </Button>
                <Button
                  onClick={handleGravar}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Gravar
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
