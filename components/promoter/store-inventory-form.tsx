"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface StockItem {
  id: number;
  rede: string;
  loja: string;
  marca: string;
  produto: string;
  estoque: number;
  estoqueVirtual: number;
  corrigido: boolean;
}

interface StoreInventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function StoreInventoryForm({ isOpen, onClose, onComplete }: StoreInventoryFormProps) {
  const [selectedMarca, setSelectedMarca] = useState("");
  const [selectedProduto, setSelectedProduto] = useState("");
  const [estoque, setEstoque] = useState("");
  const [estoqueVirtual, setEstoqueVirtual] = useState("");
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [showTable, setShowTable] = useState(false);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];
  const produtos = ["Produto 1", "Produto 2", "Produto 3"];

  const handleAddItem = () => {
    if (!selectedMarca || !selectedProduto || !estoque || !estoqueVirtual) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    const newItem: StockItem = {
      id: Date.now(),
      rede: "Rede Exemplo",
      loja: "Loja Exemplo",
      marca: selectedMarca,
      produto: selectedProduto,
      estoque: Number(estoque),
      estoqueVirtual: Number(estoqueVirtual),
      corrigido: false,
    };

    setStockItems([...stockItems, newItem]);
    setShowTable(true);
    resetForm();
  };

  const resetForm = () => {
    setSelectedMarca("");
    setSelectedProduto("");
    setEstoque("");
    setEstoqueVirtual("");
  };

  const handleDeleteItem = (id: number) => {
    setStockItems(stockItems.filter(item => item.id !== id));
    if (stockItems.length === 1) {
      setShowTable(false);
    }
  };

  const handleEditItem = (item: StockItem) => {
    setSelectedMarca(item.marca);
    setSelectedProduto(item.produto);
    setEstoque(item.estoque.toString());
    setEstoqueVirtual(item.estoqueVirtual.toString());
    handleDeleteItem(item.id);
  };

  const handleToggleCorrigido = (id: number) => {
    setStockItems(stockItems.map(item => 
      item.id === id ? { ...item, corrigido: !item.corrigido } : item
    ));
  };

  const handleSave = () => {
    if (stockItems.length === 0) {
      toast.error("Adicione pelo menos um item antes de salvar");
      return;
    }

    // Verificar se todos os itens foram corrigidos
    const allCorrected = stockItems.every(item => item.corrigido);
    if (!allCorrected) {
      toast.error("Todos os itens devem ser marcados como corrigidos antes de salvar");
      return;
    }

    toast.success("Estoque salvo com sucesso!");
    onComplete(); // Chama o callback que irá abrir o próximo modal
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estoque de Loja
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label>Marca</Label>
            <Select value={selectedMarca} onValueChange={setSelectedMarca}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas.map(marca => (
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
                {produtos.map(produto => (
                  <SelectItem key={produto} value={produto}>
                    {produto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Estoque (un/kg)</Label>
            <Input
              type="number"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <Label>Estoque Virtual (un/kg)</Label>
            <Input
              type="number"
              value={estoqueVirtual}
              onChange={(e) => setEstoqueVirtual(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <Button onClick={handleAddItem} className="w-full mb-6">
          Confirmar
        </Button>

        {showTable && (
          <div className="border rounded-lg overflow-hidden mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rede</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Estoque Virtual</TableHead>
                  <TableHead>Corrigido</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.rede}</TableCell>
                    <TableCell>{item.loja}</TableCell>
                    <TableCell>{item.marca}</TableCell>
                    <TableCell>{item.produto}</TableCell>
                    <TableCell>{item.estoque}</TableCell>
                    <TableCell>{item.estoqueVirtual}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={item.corrigido}
                        onCheckedChange={() => handleToggleCorrigido(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditItem(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
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

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={stockItems.length === 0}>
            Gravar Informações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}