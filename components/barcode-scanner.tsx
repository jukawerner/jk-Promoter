import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from 'sonner';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleScan = (decodedText: string) => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        onScan(decodedText);
      }).catch(console.error);
    }
  };

  const handleError = (err: string | Error) => {
    console.log("Erro de leitura:", err);
  };

  const initializeScanner = async () => {
    if (!isOpen) return;
    setIsInitializing(true);

    try {
      // Aguarda o DOM estar pronto
      await new Promise(resolve => setTimeout(resolve, 100));

      const readerElement = document.getElementById("reader");
      if (!readerElement) {
        throw new Error("Elemento do scanner não encontrado");
      }

      // Limpa instância anterior
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (stopError) {
          console.log("Erro ao parar scanner:", stopError);
        }
        scannerRef.current = null;
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        formatsToSupport: [ Html5QrcodeSupportedFormats.EAN_13 ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      scannerRef.current = new Html5Qrcode("reader");

      try {
        // Tenta primeiro com a câmera traseira
        await scannerRef.current.start(
          { facingMode: "environment" },
          config,
          handleScan,
          handleError
        );
      } catch (err) {
        console.log("Erro ao iniciar câmera traseira, tentando qualquer câmera:", err);
        
        // Tenta com qualquer câmera disponível
        await scannerRef.current.start(
          true,
          config,
          handleScan,
          handleError
        );
      }
    } catch (error) {
      console.error("Erro ao inicializar scanner:", error);
      toast.error("Erro ao inicializar scanner: " + (error as Error).message);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (isOpen && mounted) {
      initializeScanner();
    }

    return () => {
      mounted = false;
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(console.error);
        } catch (error) {
          console.error("Erro ao limpar scanner:", error);
        }
      }
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leitor de Código de Barras</DialogTitle>
          <DialogDescription>
            Posicione o código de barras no centro da câmera
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative overflow-hidden rounded-lg bg-black">
          <div 
            id="reader" 
            className="w-full h-64"
            style={{ minHeight: '250px' }}
          ></div>
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
