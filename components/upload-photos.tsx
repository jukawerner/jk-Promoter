"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Camera, ImageIcon, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface UploadPhotosProps {
  onPhotosChange: (urls: string[]) => void;
}

export function UploadPhotos({ onPhotosChange }: UploadPhotosProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      const uploadedUrls = [];
      
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('pdv-photos')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('pdv-photos')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setPhotos(prev => [...prev, ...uploadedUrls]);
      onPhotosChange([...photos, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setUploading(false);
    }
  }, [photos, onPhotosChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    }
  });

  const removePhoto = async (url: string) => {
    const fileName = url.split('/').pop();
    if (!fileName) return;

    try {
      const { error } = await supabase.storage
        .from('pdv-photos')
        .remove([fileName]);

      if (error) throw error;

      const updatedPhotos = photos.filter(photo => photo !== url);
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos);
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <ImageIcon className="w-8 h-8 text-gray-400" />
          {isDragActive ? (
            <p>Solte as imagens aqui...</p>
          ) : (
            <p>Arraste e solte suas imagens aqui ou</p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" disabled={uploading}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Galeria
            </Button>
            <Button variant="outline" disabled={uploading}>
              <Camera className="w-4 h-4 mr-2" />
              Câmera
            </Button>
          </div>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={photo} className="relative group">
              <Image
                src={photo}
                alt={`Uploaded photo ${index + 1}`}
                width={300}
                height={300}
                className="rounded-lg object-cover w-full aspect-square"
              />
              <button
                onClick={() => removePhoto(photo)}
                className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
