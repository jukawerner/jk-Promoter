"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ImportConfirmationModal } from "./import-confirmation-modal";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Store } from "@/types/store";

interface ExcelUploadProps {
  onImport: (stores: Omit<Store, 'id' | 'rede' | 'usuario'>[]) => void;
}

export function ExcelUpload({ onImport }: ExcelUploadProps) {
  const [showModal, setShowModal] = useState(false);
  const [parsedData, setParsedData] = useState<Omit<Store, 'id' | 'rede' | 'usuario'>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        if (!workbook.SheetNames.length) {
          throw new Error("Planilha vazia");
        }
        
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData.length) {
          throw new Error("Nenhum dado encontrado na planilha");
        }

        const parsedStores = jsonData.map((row: any, index: number) => {
          if (!row.nome || !row.rede_id) {
            throw new Error(`Linha ${index + 2}: Nome da loja e ID da rede são campos obrigatórios`);
          }

          return {
            nome: String(row.nome || ""),
            cnpj: String(row.cnpj || ""),
            endereco: String(row.endereco || ""),
            numero: String(row.numero || ""),
            bairro: String(row.bairro || ""),
            cidade: String(row.cidade || ""),
            uf: String(row.uf || ""),
            cep: String(row.cep || ""),
            rede_id: Number(row.rede_id),
            promotor_id: row.promotor_id ? String(row.promotor_id) : null,
          };
        });

        setParsedData(parsedStores);
        setShowModal(true);
      } catch (error) {
        console.error("Erro ao processar arquivo Excel:", error);
        toast.error(error instanceof Error ? error.message : "Erro ao processar o arquivo. Verifique se o formato está correto.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.onerror = () => {
      toast.error("Erro ao ler o arquivo. Tente novamente.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = () => {
    try {
      onImport(parsedData);
      setShowModal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      toast.error("Erro ao importar os dados. Tente novamente.");
    }
  };

  return (
    <>
      <div className="relative">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          ref={fileInputRef}
        />
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Importar Excel
        </Button>
      </div>

      <ImportConfirmationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        onConfirm={handleConfirmImport}
        data={parsedData}
      />
    </>
  );
}
