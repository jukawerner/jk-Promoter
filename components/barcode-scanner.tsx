"use client";

import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  useEffect(() => {
    if (isOpen) {
      const html5QrCode = new Html5Qrcode("reader");
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCode.start(
        { facingMode: "environment" }, 
        config,
        (decodedText) => {
          onScan(decodedText);
          html5QrCode.stop();
          onClose();
        },
        (error) => {
          // Ignorar erros de leitura individual
        }
      ).catch((err) => {
        console.error("Erro ao iniciar scanner:", err);
        toast.error("Erro ao iniciar câmera");
      });

      return () => {
        html5QrCode.stop().catch(console.error);
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
          <div id="reader" className="w-full h-full"></div>
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
