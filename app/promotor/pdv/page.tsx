"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Store, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { UploadPhotos } from "@/components/upload-photos";
import { Checkbox } from "@/components/ui/checkbox";

interface PDVItem {
  marca: string;
  fotos: string[];
  pontoExtraConquistado: boolean;
}

export default function PontoDeVenda() {
  const router = useRouter();
  const [items, setItems] = useState<PDVItem[]>([]);
  const [marca, setMarca] = useState("");
  const [pontoExtraConquistado, setPontoExtraConquistado] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];

  const handleSubmit = async () => {
    if (!marca) {
      toast.error("Selecione uma marca");
      return;
    }

    if (photos.length === 0) {
      toast.error("Adicione pelo menos uma foto");
      return;
    }

    const newItem: PDVItem = {
      marca,
      fotos: photos,
      pontoExtraConquistado
    };

    setItems([...items, newItem]);
    setShowForm(false);
    
    // Limpa o formulário
    setMarca("");
    setPontoExtraConquistado(false);
    setPhotos([]);

    toast.success("Item adicionado com sucesso!");
  };

  const handleGravar = async () => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item antes de gravar");
      return;
    }

    try {
      // Salva cada item no Supabase
      for (const item of items) {
        const { error } = await supabase
          .from('pdv')
          .insert({
            marca: item.marca,
            ponto_extra_conquistado: item.pontoExtraConquistado,
            fotos: item.fotos
          });

        if (error) throw error;
      }

      toast.success("PDV gravado com sucesso!");
      setItems([]); // Limpa a lista após gravar
    } catch (error) {
      console.error("Erro ao gravar PDV:", error);
      toast.error("Erro ao gravar PDV. Por favor, tente novamente.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="container mx-auto p-6 max-w-[800px]">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Store className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-center">Ponto de Venda</h1>
          <p className="text-gray-600 text-center">Registre os pontos de venda e suas características</p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">Marca</th>
                <th className="p-4 text-left">Imagens</th>
                <th className="p-4 text-left">Ponto Extra</th>
                <th className="p-4 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4">{item.marca}</td>
                  <td className="p-4">{item.fotos.length} imagem(ns)</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${item.pontoExtraConquistado ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                      {item.pontoExtraConquistado ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newItems = items.filter((_, i) => i !== index);
                        setItems(newItems);
                        toast.success("Item removido com sucesso!");
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm ? (
          /* Form */
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Marca</label>
              <Select value={marca} onValueChange={setMarca}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
                <SelectContent>
                  {marcas.map((marca) => (
                    <SelectItem key={marca} value={marca}>
                      {marca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pontoExtra"
                checked={pontoExtraConquistado}
                onCheckedChange={(checked) => setPontoExtraConquistado(checked as boolean)}
              />
              <label
                htmlFor="pontoExtra"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ponto Extra conquistado
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fotos</label>
              <UploadPhotos onPhotosChange={setPhotos} />
            </div>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={handleSubmit}>
                Adicionar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowForm(true)}
            >
              + Adicionar Novo
            </Button>
            <Button 
              onClick={handleGravar}
              className="bg-red-500 hover:bg-red-600"
            >
              Gravar
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
