"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Pencil, Trash2, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EstoqueItem {
  id: number;
  marca: string;
  produto: string;
  estoque: string;
  estoqueVirtual: string;
}

export default function EstoqueLoja() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [produto, setProduto] = useState("");
  const [estoque, setEstoque] = useState("");
  const [estoqueVirtual, setEstoqueVirtual] = useState("");
  const [items, setItems] = useState<EstoqueItem[]>([]);
  const [editingItem, setEditingItem] = useState<EstoqueItem | null>(null);
  const [showForm, setShowForm] = useState(true);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];
  const produtos = ["Produto 1", "Produto 2", "Produto 3"];

  const handleConfirm = () => {
    if (!marca || !produto || !estoque || !estoqueVirtual) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, marca, produto, estoque, estoqueVirtual }
          : item
      ));
      setEditingItem(null);
    } else {
      const newItem: EstoqueItem = {
        id: Date.now(),
        marca,
        produto,
        estoque,
        estoqueVirtual,
      };
      setItems([...items, newItem]);
    }

    // Limpar formulário
    setMarca("");
    setProduto("");
    setEstoque("");
    setEstoqueVirtual("");
    setShowForm(false);
    toast.success(editingItem ? "Item atualizado com sucesso!" : "Item adicionado com sucesso!");
  };

  const handleEdit = (item: EstoqueItem) => {
    setMarca(item.marca);
    setProduto(item.produto);
    setEstoque(item.estoque);
    setEstoqueVirtual(item.estoqueVirtual);
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

  return (
    <div className="container mx-auto p-6 max-w-[800px]">
      <div className="space-y-6">
        {/* Header com ícone e título */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="relative">
            <Store className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-semibold">Estoque da Loja</h2>
          <p className="text-gray-600">Controle o estoque dos produtos na loja</p>
        </div>

        {showForm ? (
          /* Formulário */
          <div className="space-y-4">
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

            <Select value={produto} onValueChange={setProduto}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                {produtos.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Estoque (un/kg)"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
            />

            <Input
              placeholder="Estoque Virtual (un/kg)"
              value={estoqueVirtual}
              onChange={(e) => setEstoqueVirtual(e.target.value)}
            />

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
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8"
              >
                Confirmar
              </Button>
            </div>
          </div>
        ) : (
          /* Tabela e botão Gravar */
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
                  <TableHead>Produto</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Estoque Virtual</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.marca}</TableCell>
                    <TableCell>{item.produto}</TableCell>
                    <TableCell>{item.estoque}</TableCell>
                    <TableCell>{item.estoqueVirtual}</TableCell>
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
