"use client";

import { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

interface CodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export function CodeScanner({ isOpen, onClose, onScan }: CodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      const codeReader = new BrowserMultiFormatReader();
      
      // Tentar usar a câmera traseira primeiro
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          const camera = videoDevices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('traseira')
          ) || videoDevices[0];

          if (camera) {
            codeReader.decodeFromVideoDevice(
              camera.deviceId, 
              videoRef.current!, 
              (result: Result | null) => {
                if (result) {
                  onScan(result.getText());
                  onClose();
                }
              }
            ).catch(err => {
              console.error('Erro ao iniciar câmera:', err);
              toast.error('Erro ao iniciar câmera');
            });
          } else {
            toast.error('Nenhuma câmera encontrada');
          }
        })
        .catch(err => {
          console.error('Erro ao listar câmeras:', err);
          toast.error('Erro ao acessar câmera');
        });

      return () => {
        codeReader.reset();
      };
    }
  }, [isOpen, onClose, onScan]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear Código</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 border-2 border-dashed border-white/50 pointer-events-none">
            <div className="absolute inset-8 border border-white/50"></div>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
