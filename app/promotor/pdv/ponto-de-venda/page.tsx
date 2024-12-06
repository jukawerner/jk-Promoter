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
import { ImageUpload } from "@/components/ui/image-upload";
import { Pencil, Trash2, ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PontoVendaItem {
  id: number;
  marca: string;
  imagens: string[];
  pontoExtra: boolean;
}

export default function PontoVenda() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [pontoExtra, setPontoExtra] = useState(false);
  const [items, setItems] = useState<PontoVendaItem[]>([]);
  const [editingItem, setEditingItem] = useState<PontoVendaItem | null>(null);
  const [showForm, setShowForm] = useState(true);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];

  const handleConfirm = () => {
    if (!marca || imagens.length === 0) {
      toast.error("Por favor, preencha todos os campos e adicione pelo menos uma imagem");
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

  const handleGravar = () => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item antes de gravar");
      return;
    }
    router.push("/promotor/pdv/mensagem-sucesso");
  };

  return (
    <div className="container mx-auto p-6 max-w-[800px]">
      <div className="space-y-6">
        {/* Header com ícone e título */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="relative">
            <ImageIcon className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-semibold">Ponto de Venda</h2>
          <p className="text-gray-600">Registre os pontos de venda e suas características</p>
        </div>

        {showForm ? (
          /* Formulário */
          <div className="space-y-4">
            <ImageUpload
              value={imagens}
              onChange={setImagens}
            />

            <Select value={marca} onValueChange={setMarca}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pontoExtra"
                checked={pontoExtra}
                onCheckedChange={(checked) => setPontoExtra(checked as boolean)}
              />
              <label
                htmlFor="pontoExtra"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ponto Extra conquistado
              </label>
            </div>

            {/* Botões do formulário */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  if (items.length > 0) {
                    setShowForm(false);
                  } else {
                    router.back();
                  }
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Adicionar Item
              </Button>
            </div>
          </div>
        ) : (
          /* Tabela e botões */
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Adicionar Item
              </Button>
              <Button
                onClick={handleGravar}
                className="bg-[#202020] hover:bg-[#303030] text-white"
              >
                Gravar
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca</TableHead>
                  <TableHead>Imagens</TableHead>
                  <TableHead>Ponto Extra</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.marca}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.imagens.length > 0 && (
                          <div className="relative w-10 h-10">
                            <Image
                              src={item.imagens[0]}
                              alt={`Primeira imagem de ${item.marca}`}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <span>{item.imagens.length} imagens</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.pontoExtra ? "Sim" : "Não"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
