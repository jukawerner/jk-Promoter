"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, ImagePlus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataCurtaDialog } from "./data-curta-dialog";

interface PDVItem {
  id: number;
  marca: string;
  images: File[];
  pontoExtra: boolean;
}

interface PDVFormProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function PDVForm({ isOpen, onClose, onComplete }: PDVFormProps) {
  const [selectedMarca, setSelectedMarca] = useState("");
  const [pontoExtra, setPontoExtra] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [pdvItems, setPdvItems] = useState<PDVItem[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [editingItem, setEditingItem] = useState<PDVItem | null>(null);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [isDataCurtaOpen, setIsDataCurtaOpen] = useState(false);

  // Dados mockados para exemplo
  const marcas = ["Marca A", "Marca B", "Marca C"];

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
      // Aqui você implementaria a lógica para capturar a foto
      // Por enquanto, vamos apenas mostrar um toast
      toast.success("Câmera aberta com sucesso!");
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast.error("Erro ao acessar a câmera");
    }
  };

  const handleConfirm = () => {
    if (!selectedMarca) {
      toast.error("Por favor, selecione uma marca");
      return;
    }
    
    if (images.length === 0) {
      toast.error("Por favor, adicione pelo menos uma imagem");
      return;
    }

    if (editingItem) {
      // Atualiza o item existente
      setPdvItems(prev => prev.map(item => 
        item.id === editingItem.id
          ? { ...item, marca: selectedMarca, images, pontoExtra }
          : item
      ));
      setEditingItem(null);
      toast.success("Item atualizado com sucesso!");
    } else {
      // Cria um novo item
      const newItem: PDVItem = {
        id: Date.now(),
        marca: selectedMarca,
        images: [...images],
        pontoExtra,
      };
      setPdvItems(prev => [...prev, newItem]);
      toast.success("Item adicionado com sucesso!");
    }

    resetForm();
    setShowTable(true);
  };

  const handleUpdate = () => {
    if (!selectedMarca) {
      toast.error("Por favor, selecione uma marca");
      return;
    }
    
    if (images.length === 0) {
      toast.error("Por favor, adicione pelo menos uma imagem");
      return;
    }

    // Atualiza o item existente
    setPdvItems(prev => prev.map(item => 
      item.id === editingItem?.id
        ? { ...item, marca: selectedMarca, images, pontoExtra }
        : item
    ));
    setEditingItem(null);
    resetForm();
    toast.success("Item atualizado com sucesso!");
  };

  const resetForm = () => {
    setSelectedMarca("");
    setPontoExtra(false);
    setImages([]);
    setEditingItem(null);
    setSelectedImages([]);
  };

  const handleEdit = (item: PDVItem) => {
    setSelectedMarca(item.marca);
    setPontoExtra(item.pontoExtra);
    setImages([...item.images]);
    setEditingItem(item);
    setShowTable(false);
    setSelectedImages([]);
  };

  const handleDelete = (id: number) => {
    setPdvItems(prev => prev.filter(item => item.id !== id));
    if (pdvItems.length === 1) {
      setShowTable(false);
    }
  };

  const handleImageSelect = (index: number) => {
    setSelectedImages(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleDeleteSelectedImages = () => {
    if (selectedImages.length === 0) {
      toast.error("Selecione pelo menos uma imagem para excluir");
      return;
    }

    setImages(prev => prev.filter((_, index) => !selectedImages.includes(index)));
    setSelectedImages([]);
    toast.success("Imagens selecionadas excluídas com sucesso!");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <div className="flex items-center gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-purple-500"
                >
                  <path
                    d="M12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2 7C2 5.93913 2.42143 4.92172 3.17157 4.17157C3.92172 3.42143 4.93913 3 6 3H18C19.0609 3 20.0783 3.42143 20.8284 4.17157C21.5786 4.92172 22 5.93913 22 7V17C22 18.0609 21.5786 19.0783 20.8284 19.8284C20.0783 20.5786 19.0609 21 18 21H6C4.93913 21 3.92172 20.5786 3.17157 19.8284C2.42143 19.0783 2 18.0609 2 17V7ZM18 5H6C5.46957 5 4.96086 5.21071 4.58579 5.58579C4.21071 5.96086 4 6.46957 4 7V17C4 17.5304 4.21071 18.0391 4.58579 18.4142C4.96086 18.7893 5.46957 19 6 19H18C18.5304 19 19.0391 18.7893 19.4142 18.4142C19.7893 18.0391 20 17.5304 20 17V7C20 6.46957 19.7893 5.96086 19.4142 5.58579C19.0391 5.21071 18.5304 5 18 5Z"
                    fill="currentColor"
                  />
                </svg>
                Ponto de Vendas
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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

            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-rose-700/20 border-rose-700/50">
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <ImagePlus className="w-4 h-4" />
                    Galeria
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleCameraCapture}
                  >
                    <Camera className="w-4 h-4" />
                    Câmera
                  </Button>
                </div>
                
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="text-sm text-rose-700">
                  {images.length > 0 ? (
                    <p>{images.length} imagem(ns) selecionada(s)</p>
                  ) : (
                    <p>Selecione imagens da galeria ou tire uma foto</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="ponto-extra"
                checked={pontoExtra}
                onCheckedChange={(checked) => setPontoExtra(checked as boolean)}
              />
              <Label htmlFor="ponto-extra" className="text-sm">
                Ponto Extra conquistado
              </Label>
            </div>

            <div className="flex justify-end gap-2 mb-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              {editingItem ? (
                <Button 
                  onClick={handleUpdate}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Atualizar
                </Button>
              ) : (
                <Button 
                  onClick={handleConfirm}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Adicionar Item
                </Button>
              )}
              <Button 
                onClick={() => setIsDataCurtaOpen(true)}
                className="bg-green-500 hover:bg-green-600"
              >
                Gravar
              </Button>
            </div>

            {images.length > 0 && (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Fotos ({images.length})</h3>
                  {selectedImages.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelectedImages}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir ({selectedImages.length})
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer border-2 rounded-lg overflow-hidden aspect-square
                        ${selectedImages.includes(index) ? 'border-blue-500' : 'border-transparent'}`}
                      onClick={() => handleImageSelect(index)}
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedImages.includes(index) && (
                        <div className="absolute top-1 right-1">
                          <Check className="h-3 w-3 text-blue-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pdvItems.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Marca</TableHead>
                      <TableHead>Fotos</TableHead>
                      <TableHead>Ponto Extra</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pdvItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.marca}</TableCell>
                        <TableCell>{item.images.length}</TableCell>
                        <TableCell>{item.pontoExtra ? "Sim" : "Não"}</TableCell>
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
          </div>
        </DialogContent>
      </Dialog>
      <DataCurtaDialog
        isOpen={isDataCurtaOpen}
        onClose={() => setIsDataCurtaOpen(false)}
        onConfirm={() => {
          setIsDataCurtaOpen(false);
          // Adicione aqui a lógica para salvar os dados
        }}
      />
    </>
  );
}