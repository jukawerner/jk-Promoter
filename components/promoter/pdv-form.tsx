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
import { Store, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PDVItem {
  id: number;
  rede: string;
  loja: string;
  marca: string;
  produto: string;
  pontoExtra: boolean;
  ilhaExtra: boolean;
  crossMerchan: boolean;
}

interface PDVFormProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function PDVForm({ isOpen, onClose, onComplete }: PDVFormProps) {
  const [selectedMarca, setSelectedMarca] = useState("");
  const [selectedProduto, setSelectedProduto] = useState("");
  const [pontoExtra, setPontoExtra] = useState(false);
  const [ilhaExtra, setIlhaExtra] = useState(false);
  const [crossMerchan, setCrossMerchan] = useState(false);
  const [pdvItems, setPdvItems] = useState<PDVItem[]>([]);
  const [showTable, setShowTable] = useState(false);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];
  const produtos = ["Produto 1", "Produto 2", "Produto 3"];

  const handleAddItem = () => {
    if (!selectedMarca || !selectedProduto) {
      toast.error("Marca e Produto são obrigatórios");
      return;
    }

    const newItem: PDVItem = {
      id: Date.now(),
      rede: "Rede Exemplo",
      loja: "Loja Exemplo",
      marca: selectedMarca,
      produto: selectedProduto,
      pontoExtra,
      ilhaExtra,
      crossMerchan,
    };

    setPdvItems([...pdvItems, newItem]);
    setShowTable(true);
    resetForm();
  };

  const resetForm = () => {
    setSelectedMarca("");
    setSelectedProduto("");
    setPontoExtra(false);
    setIlhaExtra(false);
    setCrossMerchan(false);
  };

  const handleDeleteItem = (id: number) => {
    setPdvItems(pdvItems.filter(item => item.id !== id));
    if (pdvItems.length === 1) {
      setShowTable(false);
    }
  };

  const handleEditItem = (item: PDVItem) => {
    setSelectedMarca(item.marca);
    setSelectedProduto(item.produto);
    setPontoExtra(item.pontoExtra);
    setIlhaExtra(item.ilhaExtra);
    setCrossMerchan(item.crossMerchan);
    handleDeleteItem(item.id);
  };

  const handleSave = () => {
    if (pdvItems.length === 0) {
      toast.error("Adicione pelo menos um item antes de salvar");
      return;
    }

    toast.success("Informações de PDV salvas com sucesso!");
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Ponto de Vendas
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

          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pontoExtra"
                checked={pontoExtra}
                onCheckedChange={(checked) => setPontoExtra(checked as boolean)}
              />
              <Label htmlFor="pontoExtra">Ponto Extra</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ilhaExtra"
                checked={ilhaExtra}
                onCheckedChange={(checked) => setIlhaExtra(checked as boolean)}
              />
              <Label htmlFor="ilhaExtra">Ilha Extra</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="crossMerchan"
                checked={crossMerchan}
                onCheckedChange={(checked) => setCrossMerchan(checked as boolean)}
              />
              <Label htmlFor="crossMerchan">Cross Merchandising</Label>
            </div>
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
                  <TableHead>Ponto Extra</TableHead>
                  <TableHead>Ilha Extra</TableHead>
                  <TableHead>Cross Merchan</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pdvItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.rede}</TableCell>
                    <TableCell>{item.loja}</TableCell>
                    <TableCell>{item.marca}</TableCell>
                    <TableCell>{item.produto}</TableCell>
                    <TableCell>{item.pontoExtra ? "Sim" : "Não"}</TableCell>
                    <TableCell>{item.ilhaExtra ? "Sim" : "Não"}</TableCell>
                    <TableCell>{item.crossMerchan ? "Sim" : "Não"}</TableCell>
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
          <Button onClick={handleSave} disabled={pdvItems.length === 0}>
            Gravar Informações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}