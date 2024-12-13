"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImportConfirmationModal } from "./import-confirmation-modal";

interface Client {
  id: number;
  rede: string;
  cnpj: string;
  loja: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  uf: string;
}

interface ExcelUploadProps {
  onClientsImported: (clients: Omit<Client, "id">[]) => void;
}

export function ExcelUpload({ onClientsImported }: ExcelUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [clientsToImport, setClientsToImport] = useState<Omit<Client, "id">[]>([]);

  const processExcelFile = async (file: File) => {
    try {
      setIsLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validar e transformar os dados
      const clients = jsonData.map((row: any) => {
        // Verificar campos obrigatórios
        if (!row.rede || !row.cnpj || !row.loja || !row.endereco || !row.bairro || !row.cidade || !row.cep || !row.uf) {
          throw new Error("Arquivo Excel inválido. Certifique-se de que todas as colunas necessárias estão presentes (rede, cnpj, loja, endereco, bairro, cidade, cep, uf).");
        }

        // Validar formato do CNPJ (pode ser ajustado conforme necessário)
        const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
        if (!cnpjRegex.test(String(row.cnpj))) {
          throw new Error(`CNPJ inválido: ${row.cnpj}. Use o formato: XX.XXX.XXX/XXXX-XX`);
        }

        return {
          rede: String(row.rede),
          cnpj: String(row.cnpj),
          loja: String(row.loja),
          endereco: String(row.endereco),
          bairro: String(row.bairro),
          cidade: String(row.cidade),
          cep: String(row.cep),
          uf: String(row.uf),
        };
      });

      setClientsToImport(clients);
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
    onClientsImported(clientsToImport);
    setShowConfirmation(false);
    setClientsToImport([]);
    toast.success(`${clientsToImport.length} clientes importados com sucesso!`);
  };

  const handleCancelImport = () => {
    setShowConfirmation(false);
    setClientsToImport([]);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          id="excel-upload"
          disabled={isLoading}
        />
        <label htmlFor="excel-upload">
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            disabled={isLoading}
            asChild
          >
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar Clientes via Excel
            </div>
          </Button>
        </label>
      </div>

      <ImportConfirmationModal
        clients={clientsToImport}
        isOpen={showConfirmation}
        onConfirm={handleConfirmImport}
        onCancel={handleCancelImport}
      />
    </>
  );
}
