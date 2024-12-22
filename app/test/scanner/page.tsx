"use client";

import { useState } from 'react';
import { BarcodeScanner } from 'components/barcode-scanner';
import { Button } from 'components/ui/button';

export default function TestScanner() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const handleScan = (result: string) => {
    setScannedCode(result);
    console.log('Scanned code:', result);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Test Scanner</h1>
        
        <Button 
          onClick={() => setShowScanner(true)}
          className="w-full"
        >
          Open Scanner
        </Button>

        {scannedCode && (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="font-semibold">Last Scanned Code:</h2>
            <p className="mt-2">{scannedCode}</p>
          </div>
        )}

        <BarcodeScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleScan}
        />
      </div>
    </div>
  );
}
