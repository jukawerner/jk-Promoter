"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRScanner } from "./qr-scanner";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const handleScan = (result: string) => {
    onScan(result);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escanear QR Code</DialogTitle>
        </DialogHeader>
        <QRScanner
          onResult={handleScan}
          onError={(error) => console.error(error)}
        />
      </DialogContent>
    </Dialog>
  );
}
