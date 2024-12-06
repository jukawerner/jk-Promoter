"use client";

import { useRef, useState } from "react";
import { Button } from "./button";
import { ImageIcon, Camera, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onChange: (value: string[]) => void;
  value: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value }) => {
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
          if (newImages.length === files.length) {
            onChange([...value, ...newImages]);
          }
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL('image/jpeg');
      onChange([...value, imageDataUrl]);

      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 space-y-4">
        <div className="text-center text-gray-500">
          Selecione imagens da galeria ou tire uma foto
        </div>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Galeria
          </Button>
          <Button
            variant="outline"
            onClick={handleCameraCapture}
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Câmera
          </Button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {value.map((image, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={image}
                alt={`Imagem ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
