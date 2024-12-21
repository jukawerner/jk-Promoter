"use client";

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onResult: (result: string) => void;
  onError?: (error: any) => void;
}

export function QRScanner({ onResult, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: 250,
          aspectRatio: 1.0,
          disableFlip: false,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          if (scannerRef.current) {
            scannerRef.current.clear();
            onResult(decodedText);
          }
        },
        (error) => {
          if (onError) {
            onError(error);
          }
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [onResult, onError]);

  return <div id="qr-reader" className="w-full max-w-sm mx-auto" />;
}
