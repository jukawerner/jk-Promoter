"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, ImagePlus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

interface PDVItem {
  id: number;
  marca: string;
  images: File[];
  pontoExtra: boolean;
}

export default function PDVPage() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [produto, setProduto] = useState("");
  const [estoque, setEstoque] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [items, setItems] = useState<PDVItem[]>([]);
  const [editingItem, setEditingItem] = useState<PDVItem | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];
  const produtos = ["Produto 1", "Produto 2", "Produto 3"];

  const handleConfirm = () => {
    if (!marca || !produto || !estoque || !dataValidade) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, marca, produto, estoque, dataValidade }
          : item
      ));
      setEditingItem(null);
    } else {
      const newItem: PDVItem = {
        id: Date.now(),
        marca,
        produto,
        estoque,
        dataValidade,
      };
      setItems([...items, newItem]);
    }

    // Limpar formulário
    setMarca("");
    setProduto("");
    setEstoque("");
    setDataValidade("");
    setShowForm(false);
    toast.success(editingItem ? "Item atualizado com sucesso!" : "Item adicionado com sucesso!");
  };

  const handleEdit = (item: PDVItem) => {
    setMarca(item.marca);
    setProduto(item.produto);
    setEstoque(item.estoque);
    setDataValidade(item.dataValidade);
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
    router.push("/promotor/pdv/avaliacao");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages]);
        toast.success("Imagens adicionadas com sucesso!");
      } else {
        toast.error("Por favor, selecione apenas arquivos de imagem");
      }
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      toast.success("Câmera aberta com sucesso!");
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast.error("Erro ao acessar a câmera");
    }
  };

  const handleDataCurta = () => {
    router.push("/promotor/pdv/data-curta");
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h2 className="text-2xl font-bold">PDV</h2>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={handleDataCurta} 
          className="w-full"
          variant="outline"
        >
          Produtos com Data Curta
        </Button>

        <Button 
          onClick={() => router.push("/promotor/pdv/estoque")} 
          className="w-full"
          variant="outline"
        >
          Estoque Loja
        </Button>
      </div>
    </div>
  );
}
