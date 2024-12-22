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
        // Wait for DOM element to be ready with retries
        let retries = 3;
        let readerElement = null;
        
        while (retries > 0 && !readerElement) {
          readerElement = document.getElementById("reader");
          if (!readerElement) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries--;
          }
        }

        if (!readerElement) {
          toast.error("Erro ao inicializar scanner. Tente novamente.");
          onClose();
          return;
        }

        html5QrCode = new Html5Qrcode("reader", { verbose: true });

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast.error("Seu dispositivo não suporta acesso à câmera");
          onClose();
          return;
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
          });
          stream.getTracks().forEach(track => track.stop());
        } catch (permissionError: any) {
          if (permissionError.name === 'NotAllowedError') {
            toast.error("Acesso à câmera negado. Por favor, permita o acesso nas configurações do navegador.");
          } else if (permissionError.name === 'NotFoundError') {
            toast.error("Nenhuma câmera encontrada no dispositivo");
          } else {
            toast.error("Erro ao acessar câmera");
          }
          onClose();
          return;
        }

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            onScan(decodedText);
            html5QrCode?.stop().catch(console.error);
            onClose();
          },
          (error) => {
            console.debug("Scan error:", error);
          }
        );
      } catch (err: any) {
        console.error("Scanner error:", err);
        toast.error("Erro ao iniciar câmera. Tente novamente.");
        onClose();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeScanner();

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
          <DialogTitle>Escanear Código</DialogTitle>
          <DialogDescription>
            Posicione o código de barras no centro da câmera para escanear
          </DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          )}
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
