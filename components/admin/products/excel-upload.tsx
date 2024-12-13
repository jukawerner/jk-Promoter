"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImportConfirmationModal } from "./import-confirmation-modal";

interface Product {
  id: number;
  nome: string;
  familia: string;
  unidade: string;
  peso: number;
  validade: number;
  marca: string;
}

interface ExcelUploadProps {
  onProductsImported: (products: Omit<Product, "id">[]) => void;
}

export function ExcelUpload({ onProductsImported }: ExcelUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [productsToImport, setProductsToImport] = useState<Omit<Product, "id">[]>([]);

  const processExcelFile = async (file: File) => {
    try {
      setIsLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validar e transformar os dados
      const products = jsonData.map((row: any) => {
        // Verificar campos obrigatórios
        if (!row.nome || !row.familia || !row.unidade || !row.peso || !row.validade || !row.marca) {
          throw new Error("Arquivo Excel inválido. Certifique-se de que todas as colunas necessárias estão presentes.");
        }

        return {
          nome: String(row.nome),
          familia: String(row.familia),
          unidade: String(row.unidade),
          peso: Number(row.peso),
          validade: Number(row.validade),
          marca: String(row.marca),
        };
      });

      setProductsToImport(products);
      setShowConfirmation(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar arquivo Excel");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar extensão do arquivo
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls"].includes(fileExtension || "")) {
      toast.error("Por favor, selecione um arquivo Excel (.xlsx ou .xls)");
      return;
    }

    processExcelFile(file);
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = "";
  };

  const handleConfirmImport = () => {
    onProductsImported(productsToImport);
    setShowConfirmation(false);
    setProductsToImport([]);
    toast.success(`${productsToImport.length} produtos importados com sucesso!`);
  };

  const handleCancelImport = () => {
    setShowConfirmation(false);
    setProductsToImport([]);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          id="excel-upload"
          disabled={isLoading}
        />
        <Button
          variant="outline"
          asChild
          disabled={isLoading}
        >
          <label htmlFor="excel-upload" className="cursor-pointer flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {isLoading ? "Processando..." : "Importar Excel"}
          </label>
        </Button>
        <p className="text-sm text-gray-500">
          Formato esperado: nome, familia, unidade, peso, validade, marca
        </p>
      </div>

      <ImportConfirmationModal
        products={productsToImport}
        isOpen={showConfirmation}
        onConfirm={handleConfirmImport}
        onCancel={handleCancelImport}
      />
    </>
  );
}
