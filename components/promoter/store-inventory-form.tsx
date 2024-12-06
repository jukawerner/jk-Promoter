"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PDVForm } from "./pdv-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StockItem {
  id: number;
  marca: string;
  produto: string;
  estoque: string;
  estoqueVirtual: string;
}

interface StoreInventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function StoreInventoryForm({
  isOpen,
  onClose,
  onComplete,
}: StoreInventoryFormProps) {
  const [showPDVForm, setShowPDVForm] = useState(false);
  const [selectedMarca, setSelectedMarca] = useState("");
  const [selectedProduto, setSelectedProduto] = useState("");
  const [estoque, setEstoque] = useState("");
  const [estoqueVirtual, setEstoqueVirtual] = useState("");
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];
  const produtos = ["Produto 1", "Produto 2", "Produto 3"];

  const handleAdd = () => {
    if (!selectedMarca || !selectedProduto || !estoque || !estoqueVirtual) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const newItem: StockItem = {
      id: editingItem?.id || Date.now(),
      marca: selectedMarca,
      produto: selectedProduto,
      estoque,
      estoqueVirtual,
    };

    if (editingItem) {
      setStockItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? newItem : item))
      );
      setEditingItem(null);
      toast.success("Item atualizado com sucesso!");
    } else {
      setStockItems((prev) => [...prev, newItem]);
      toast.success("Item adicionado com sucesso!");
    }

    // Limpar campos
    setSelectedMarca("");
    setSelectedProduto("");
    setEstoque("");
    setEstoqueVirtual("");
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setSelectedMarca(item.marca);
    setSelectedProduto(item.produto);
    setEstoque(item.estoque);
    setEstoqueVirtual(item.estoqueVirtual);
  };

  const handleDelete = (id: number) => {
    setStockItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removido com sucesso!");
  };

  const handleSave = () => {
    if (stockItems.length === 0) {
      toast.error("Adicione pelo menos um item antes de salvar");
      return;
    }

    toast.success("Informações gravadas com sucesso!");
    setShowPDVForm(true);
  };

  const handlePDVClose = () => {
    setShowPDVForm(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-purple-500"
              >
                <path
                  d="M4 7V17C4 17.5304 4.21071 18.0391 4.58579 18.4142C4.96086 18.7893 5.46957 19 6 19H18C18.5304 19 19.0391 18.7893 19.4142 18.4142C19.7893 18.0391 20 17.5304 20 17V7M4 7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H18C18.5304 5 19.0391 5.21071 19.4142 5.58579C19.7893 5.96086 20 6.46957 20 7M4 7L12 13L20 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Estoque de Loja
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label>Marca</Label>
                <Select value={selectedMarca} onValueChange={setSelectedMarca}>
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

              <div>
                <Label>Produto</Label>
                <Select value={selectedProduto} onValueChange={setSelectedProduto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((produto) => (
                      <SelectItem key={produto} value={produto}>
                        {produto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estoque</Label>
                <Input
                  value={estoque}
                  onChange={(e) => setEstoque(e.target.value)}
                  type="number"
                />
              </div>

              <div>
                <Label>Estoque Virtual</Label>
                <Input
                  value={estoqueVirtual}
                  onChange={(e) => setEstoqueVirtual(e.target.value)}
                  type="number"
                />
              </div>

              <Button onClick={handleAdd} className="w-full">
                {editingItem ? "Atualizar Item" : "Adicionar Item"}
              </Button>
            </div>

            {stockItems.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
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
                    {stockItems.map((item) => (
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
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
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
            )}

            <Button onClick={handleSave} className="w-full">
              Gravar Informações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showPDVForm && (
        <PDVForm
          isOpen={showPDVForm}
          onClose={handlePDVClose}
          onComplete={onComplete}
        />
      )}
    </>
  );
}