import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ImportConfirmationModal } from "./import-confirmation-modal";
import * as XLSX from "xlsx";

interface Store {
  rede: string;
  cnpj: string;
  loja: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  uf: string;
  marcas: number[];
}

interface ExcelUploadProps {
  onImport: (stores: Store[]) => void;
}

export function ExcelUpload({ onImport }: ExcelUploadProps) {
  const [showModal, setShowModal] = useState(false);
  const [parsedData, setParsedData] = useState<Store[]>([]);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedStores = jsonData.map((row: any) => ({
          rede: row.rede || "",
          cnpj: row.cnpj || "",
          loja: row.loja || "",
          endereco: row.endereco || "",
          bairro: row.bairro || "",
          cidade: row.cidade || "",
          cep: row.cep || "",
          uf: row.uf || "",
          marcas: row.marcas ? String(row.marcas).split(",").map(Number) : [],
        }));

        setParsedData(parsedStores);
        setShowModal(true);
      } catch (error) {
        console.error("Erro ao processar arquivo Excel:", error);
        alert("Erro ao processar o arquivo. Verifique se o formato está correto.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = () => {
    onImport(parsedData);
    setShowModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          ref={(ref) => (fileInputRef.current = ref)}
        />
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Importar Excel
        </Button>
      </div>

      <ImportConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmImport}
        data={parsedData}
      />
    </>
  );
}
