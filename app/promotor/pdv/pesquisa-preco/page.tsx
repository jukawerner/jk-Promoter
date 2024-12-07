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
import { Pencil, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "@/components/whatsapp-button";

interface PesquisaPrecoItem {
  id: number;
  marca: string;
  produto: string;
  preco: string;
  promo: boolean;
}

export default function PesquisaPreco() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [produto, setProduto] = useState("");
  const [preco, setPreco] = useState("");
  const [promo, setPromo] = useState(false);
  const [items, setItems] = useState<PesquisaPrecoItem[]>([]);
  const [editingItem, setEditingItem] = useState<PesquisaPrecoItem | null>(null);
  const [showForm, setShowForm] = useState(true);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];
  const produtos = ["Produto 1", "Produto 2", "Produto 3"];

  const handleConfirm = () => {
    if (!marca || !produto || !preco) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, marca, produto, preco, promo }
          : item
      ));
      setEditingItem(null);
    } else {
      const newItem: PesquisaPrecoItem = {
        id: Date.now(),
        marca,
        produto,
        preco,
        promo,
      };
      setItems([...items, newItem]);
    }

    // Limpar formulário
    setMarca("");
    setProduto("");
    setPreco("");
    setPromo(false);
    setShowForm(false);
    toast.success(editingItem ? "Item atualizado com sucesso!" : "Item adicionado com sucesso!");
  };

  const handleEdit = (item: PesquisaPrecoItem) => {
    setMarca(item.marca);
    setProduto(item.produto);
    setPreco(item.preco);
    setPromo(item.promo);
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
      <WhatsappButton />
      <div className="space-y-6">
        {/* Header com ícone e título */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="relative">
            <Search className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-semibold">Pesquisa de Preço</h2>
          <p className="text-gray-600">Registre os preços dos produtos</p>
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

            <div className="flex items-center gap-4">
              <Input
                type="number"
                step="0.01"
                placeholder="Preço"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="flex-1"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="promo"
                  checked={promo}
                  onCheckedChange={(checked) => setPromo(checked as boolean)}
                />
                <label
                  htmlFor="promo"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Promo
                </label>
              </div>
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
                  <TableHead>Produto</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Promo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.marca}</TableCell>
                    <TableCell>{item.produto}</TableCell>
                    <TableCell>R$ {Number(item.preco).toFixed(2)}</TableCell>
                    <TableCell>{item.promo ? "Sim" : "Não"}</TableCell>
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
