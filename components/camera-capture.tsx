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
      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 4096, min: 1920 },
          height: { ideal: 3072, min: 1080 },
          frameRate: { ideal: 60, min: 30 },
          aspectRatio: { ideal: 4/3 },
          resizeMode: "none"
        },
        audio: false
      };

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        handleStreamSuccess(mediaStream);
      } catch (err) {
        console.warn('Failed to get environment camera, trying without exact constraint:', err);
        // Fallback to any available camera if environment camera fails
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 4096 },
            height: { ideal: 3072 }
          },
          audio: false
        });
        handleStreamSuccess(fallbackStream);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Erro ao acessar a câmera. Verifique as permissões.');
      onClose();
    }
  };

  const handleStreamSuccess = (mediaStream: MediaStream) => {
    setStream(mediaStream);
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities();
        const settings = track.getSettings();
        console.log('Camera capabilities:', capabilities);
        console.log('Camera settings:', settings);

        // Aplica as melhores configurações disponíveis
        const constraints: MediaTrackConstraints = {
          width: { ideal: Math.max(settings.width || 1920, 4096) },
          height: { ideal: Math.max(settings.height || 1080, 3072) },
          aspectRatio: { ideal: 4/3 },
          frameRate: { max: 30, ideal: 24 }
        };

        track.applyConstraints(constraints)
          .catch(err => console.warn('Failed to apply constraints:', err));
      }
      
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        setIsVideoReady(true);
      };
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
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Use the actual video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      console.log('Capturing photo with dimensions:', canvas.width, 'x', canvas.height);
      
      const ctx = canvas.getContext('2d', { 
        alpha: false,
        willReadFrequently: true
      });
      
      if (!ctx) {
        throw new Error('Não foi possível criar contexto do canvas');
      }

      // Configurações para melhor qualidade
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob with maximum quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create file with original dimensions and quality
            const file = new File([blob], `photo_${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            console.log('Created image file:', file.name, 'Size:', file.size);
            onCapture(file);
            onClose();
          } else {
            throw new Error('Falha ao criar imagem');
          }
        },
        'image/jpeg',
        1.0  // Maximum quality
      );
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
