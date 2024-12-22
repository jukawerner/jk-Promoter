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
    let html5QrCode: Html5Qrcode | null = null;

    const initializeScanner = async () => {
      if (!isOpen) return;

      try {
        // Check if camera access is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera access not supported");
        }

        // Wait for DOM element to be ready
        const readerElement = document.getElementById("reader");
        if (!readerElement) {
          throw new Error("Scanner element not found");
        }

        html5QrCode = new Html5Qrcode("reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        // Request camera permission first
        await navigator.mediaDevices.getUserMedia({ video: true });

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            onScan(decodedText);
            html5QrCode?.stop();
            onClose();
          },
          (error) => {
            // Ignore individual scan errors
            console.debug("Scan error:", error);
          }
        );
      } catch (err: any) {
        console.error("Scanner initialization error:", err);
        if (err.message?.includes("permission")) {
          toast.error("Permissão da câmera negada");
        } else if (err.message?.includes("supported")) {
          toast.error("Seu navegador não suporta acesso à câmera");
        } else {
          toast.error("Erro ao iniciar câmera. Tente novamente.");
        }
        onClose();
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
