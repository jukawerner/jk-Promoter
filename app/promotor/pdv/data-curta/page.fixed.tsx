"use client";

import { Button } from "components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { Checkbox } from "components/ui/checkbox";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table";
import { ArrowLeft, Pencil, Trash2, ImageIcon, Camera, Store, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "components/whatsapp-button";
import { supabase } from "lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, AlertTriangle, Package2, QrCode } from "lucide-react";
import BarcodeScanner from "components/barcode-scanner";
import { ConfirmModal } from "components/ConfirmModal";
import { formatNumber, parseFormattedNumber } from "lib/utils/formatters";

// ... (mantenha todas as interfaces e estados existentes) ...

export default function DataCurtaPage() {
  // ... (mantenha todos os estados existentes) ...

  const handleBarcodeScan = async (result: string) => {
    setIsScannerOpen(false);
    
    try {
      const { data: product, error } = await supabase
        .from('produto')
        .select('nome, marca')
        .eq('codigo_ean', result)
        .single();

      if (error) throw error;
      
      if (product) {
        setScannedBarcode(result);
        setScannedBrand(product.marca.toUpperCase());
        setScannedProduct(product.nome.toUpperCase());
        setIsModalOpen(true);
      } else {
        toast.error("Produto não encontrado no sistema");
      }
    } catch (error) {
      console.error('Erro ao processar código de barras:', error);
      toast.error("Erro ao buscar produto. Tente novamente.");
    }
  };

  const handleConfirmScan = () => {
    setMarca(scannedBrand);
    setProduto(scannedProduct);
    setIsModalOpen(false);
  };

  // ... (mantenha todas as outras funções existentes) ...

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* ... (mantenha todo o JSX existente até o Select da marca) ... */}
      
      <div className="space-y-2">
        <Label htmlFor="marca">Marca</Label>
        <div className="flex gap-2">
          <Select
            value={marca}
            onValueChange={(value) => {
              setMarca(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a marca" />
            </SelectTrigger>
            <SelectContent>
              {marcasState.map((marca) => (
                <SelectItem key={marca.id} value={marca.nome}>
                  {marca.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={() => setIsScannerOpen(true)}
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ... (mantenha todo o restante do JSX existente) ... */}

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmScan}
        barcode={scannedBarcode}
        brand={scannedBrand}
        product={scannedProduct}
      />
    </motion.div>
  );
}
