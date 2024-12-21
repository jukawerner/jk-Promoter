"use client";

import { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageFile: File) => void;
}

export function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      // Request the highest possible resolution
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 4096 }, // 4K
          height: { ideal: 2160 },
          aspectRatio: { ideal: 4/3 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      // Get the actual constraints being used
      const videoTrack = mediaStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      const settings = videoTrack.getSettings();
      
      console.log('Camera capabilities:', capabilities);
      console.log('Active settings:', settings);
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsVideoReady(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Erro ao acessar a câmera. Verifique as permissões.');
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsVideoReady(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !isVideoReady) {
      toast.error('Câmera não está pronta. Aguarde um momento.');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      // Use the actual video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d', { 
        alpha: false,
        desynchronized: true // Pode melhorar o desempenho
      });
      
      if (!ctx) {
        throw new Error('Não foi possível criar contexto do canvas');
      }

      // Configurações para melhor qualidade
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Flip horizontally if using front camera
      if (stream?.getVideoTracks()[0].getSettings().facingMode === "user") {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
      }
      
      // Capture in highest quality
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { 
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          onCapture(file);
          onClose();
        } else {
          throw new Error('Falha ao criar imagem');
        }
      }, 'image/jpeg', 0.95); // Increased quality to 95%
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      toast.error('Erro ao capturar foto. Tente novamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tirar Foto</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-[4/3] object-cover rounded-lg"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="bg-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="bg-white text-black hover:bg-gray-100"
              onClick={capturePhoto}
              disabled={!isVideoReady}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
