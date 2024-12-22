"use client";

import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const initializeScanner = async () => {
      if (!isOpen) return;
      setIsInitializing(true);

      try {
        const readerElement = document.getElementById("reader");
        if (!readerElement) {
          throw new Error("Elemento do scanner não encontrado");
        }

        html5QrCode = new Html5Qrcode("reader");
        
        const constraints = {
          facingMode: { exact: "environment" },
          aspectRatio: 1
        };

        await html5QrCode.start(
          { facingMode: constraints.facingMode },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: constraints.aspectRatio,
          },
          (decodedText) => {
            html5QrCode?.stop();
            onScan(decodedText);
          },
          (errorMessage) => {
            console.log(errorMessage);
          }
        );

        setIsInitializing(false);
      } catch (err) {
        console.error("Erro ao inicializar scanner:", err);
        toast.error("Erro ao inicializar câmera. Tente novamente.");
        onClose();
      }
    };

    if (isOpen) {
      initializeScanner();
    }

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isOpen, onClose, onScan]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leitor de Código de Barras</DialogTitle>
          <DialogDescription>
            Posicione o código de barras no centro da câmera
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          <div id="reader" className="w-full aspect-square"></div>
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
