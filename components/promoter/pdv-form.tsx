"use client";

import { useState, useEffect, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMarca, setSelectedMarca] = useState("");
  const [pontoExtra, setPontoExtra] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [pdvItems, setPdvItems] = useState<PDVItem[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [editingItem, setEditingItem] = useState<PDVItem | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const startCamera = async () => {
    try {
      console.log('Iniciando câmera...');
      
      // Primeiro, verificar se a API está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('API de câmera não suportada neste navegador');
      }

      // Tentar primeiro a câmera traseira
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      console.log('Stream obtido com sucesso:', stream.getVideoTracks()[0].getSettings());

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Garantir que o vídeo está carregado antes de mostrar
        videoRef.current.onloadedmetadata = () => {
          console.log('Vídeo carregado, dimensões:', {
            width: videoRef.current?.videoWidth,
            height: videoRef.current?.videoHeight
          });
          videoRef.current?.play();
          setShowCamera(true);
        };
      } else {
        throw new Error('Referência do vídeo não encontrada');
      }
    } catch (error) {
      console.error('Erro ao iniciar câmera:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao acessar a câmera");
      stopCamera();
    }
  };

  const capturePhoto = async () => {
    try {
      if (!videoRef.current) {
        throw new Error('Referência do vídeo não encontrada');
      }

      // Garantir que o vídeo está pronto
      if (videoRef.current.readyState !== 4) {
        throw new Error('Vídeo não está pronto para captura');
      }

      console.log('Iniciando captura...');
      
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      // Usar as dimensões reais do vídeo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      console.log('Dimensões da captura:', {
        width: canvas.width,
        height: canvas.height
      });

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Não foi possível criar contexto do canvas');
      }

      // Desenhar o frame atual do vídeo
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Converter para blob com qualidade alta
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.95);
      });

      if (!blob) {
        throw new Error('Falha ao gerar imagem');
      }

      // Criar arquivo com nome único
      const file = new File([blob], `photo-${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      console.log('Foto capturada com sucesso:', {
        size: file.size,
        type: file.type
      });

      setImages(prev => [...prev, file]);
      toast.success("Foto capturada com sucesso!");
      stopCamera();
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao capturar foto");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleCameraCapture = () => {
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleConfirm = () => {
    if (!selectedMarca) {
      toast.error("Por favor, selecione uma marca");
      return;
    }
    
    if (images.length === 0) {
      toast.error("Por favor, adicione pelo menos uma imagem");
      return;
    }

    const newItem: PDVItem = {
      id: Date.now(),
      marca: selectedMarca,
      images: [...images],
      pontoExtra,
    };

    setPdvItems(prev => [...prev, newItem]);
    resetForm();
    setShowTable(true);
    toast.success("Item adicionado com sucesso!");
  };

  const resetForm = () => {
    setSelectedMarca("");
    setPontoExtra(false);
    setImages([]);
    setEditingItem(null);
  };

  const handleEdit = (item: PDVItem) => {
    setSelectedMarca(item.marca);
    setPontoExtra(item.pontoExtra);
    setImages([...item.images]);
    setEditingItem(item);
    setShowTable(false);
  };

  const handleDelete = (id: number) => {
    setPdvItems(prev => prev.filter(item => item.id !== id));
    if (pdvItems.length === 1) {
      setShowTable(false);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Ponto de Venda
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!showTable ? (
              <div className="space-y-6">
                {/* Componente de Upload de Fotos */}
                <div className="border-2 border-dashed rounded-lg p-6 text-center bg-rose-700/20 border-rose-700/50">
                  <div className="flex flex-col items-center gap-4">
                    {showCamera ? (
                      <div className="relative w-full max-w-md">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline
                          muted
                          className="w-full rounded-lg"
                          style={{ transform: 'scaleX(-1)' }}
                        />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                          <Button
                            variant="default"
                            className="flex items-center gap-2"
                            onClick={capturePhoto}
                          >
                            <Camera className="w-4 h-4" />
                            Capturar
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex items-center gap-2"
                            onClick={stopCamera}
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImagePlus className="w-4 h-4" />
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
                          className="flex items-center gap-2"
                          onClick={handleCameraCapture}
                        >
                          <Camera className="w-4 h-4" />
                          Câmera
                        </Button>
                      </div>
                    )}
                    
                    <div className="text-sm text-rose-700">
                      {images.length > 0 ? (
                        <p>{images.length} imagem(ns) selecionada(s)</p>
                      ) : (
                        <p>Selecione imagens da galeria ou tire uma foto</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview das Fotos */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleDeleteImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Seleção de Marca */}
                <div className="pt-4 border-t">
                  <div className="space-y-2">
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

                  <div className="flex items-center gap-2 mt-4">
                    <Checkbox
                      id="ponto-extra"
                      checked={pontoExtra}
                      onCheckedChange={(checked) => setPontoExtra(checked as boolean)}
                    />
                    <Label htmlFor="ponto-extra" className="text-sm">
                      Ponto Extra conquistado
                    </Label>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirm}>
                    {editingItem ? "Atualizar" : "Confirmar"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Marca</TableHead>
                      <TableHead>Fotos</TableHead>
                      <TableHead>Ponto Extra</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pdvItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.marca}</TableCell>
                        <TableCell>{item.images.length} foto(s)</TableCell>
                        <TableCell>{item.pontoExtra ? "Sim" : "Não"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setShowTable(false)}>
                    Adicionar Item
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={onClose}>
                      Cancelar
                    </Button>
                    <Button onClick={onComplete}>Concluir</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}