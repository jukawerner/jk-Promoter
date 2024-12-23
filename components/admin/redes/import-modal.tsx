"use client";

import { useState } from "react";
import { Button } from "components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "components/ui/dialog";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import { ScrollArea } from "components/ui/scroll-area";
import { createRede } from "lib/actions/rede";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RedeImport {
  nome: string;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [redesParaImportar, setRedesParaImportar] = useState<RedeImport[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (!e.target?.result) {
            throw new Error("Falha ao ler arquivo");
          }

          const workbook = XLSX.read(e.target.result, { type: "binary" });
          
          if (!workbook.SheetNames.length) {
            throw new Error("Arquivo Excel vazio");
          }

          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          if (!worksheet) {
            throw new Error("Planilha vazia");
          }

          // Ler a primeira coluna como nomes
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1000');
          const redes: RedeImport[] = [];

          // Começar da segunda linha (índice 1) para pular o cabeçalho
          for (let R = 1; R <= range.e.r; ++R) {
            const cell = worksheet[XLSX.utils.encode_cell({r: R, c: 0})];
            if (cell?.v) {
              const nome = String(cell.v).trim().toUpperCase();
              if (nome) {
                redes.push({ nome });
              }
            }
          }

          if (redes.length > 0) {
            setRedesParaImportar(redes);
            setStep('preview');
          } else {
            toast.error("Nenhuma rede encontrada no arquivo");
          }
        } catch (error) {
          console.error("Erro ao processar arquivo:", error);
          toast.error("Erro ao processar arquivo Excel");
        }
      };

      reader.onerror = () => {
        toast.error("Erro ao ler arquivo");
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Erro na importação:", error);
      toast.error("Erro na importação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setStep('importing');
      setIsLoading(true);

      for (const rede of redesParaImportar) {
        await createRede(rede.nome);
      }

      toast.success("Redes importadas com sucesso!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao importar redes:", error);
      toast.error("Erro ao importar redes");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'preview':
        return (
          <div>
            <DialogHeader>
              <DialogTitle>Confirmar Importação</DialogTitle>
            </DialogHeader>
            <div className="mt-4 relative" style={{ height: "400px", overflowY: "auto" }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Rede</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redesParaImportar.map((rede, index) => (
                    <TableRow key={index}>
                      <TableCell>{rede.nome}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('upload');
                  setRedesParaImportar([]);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? "Importando..." : "Confirmar Importação"}
              </Button>
            </DialogFooter>
          </div>
        );
      case 'importing':
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="text-lg font-semibold mb-4">Importando redes...</div>
            <div className="text-sm text-gray-500">Por favor, aguarde...</div>
          </div>
        );
      default:
        return (
          <div>
            <DialogHeader>
              <DialogTitle>Importar Redes do Excel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500">
                  Faça o upload de um arquivo Excel (.xlsx) contendo uma coluna com o nome das redes.
                </p>
                <p className="text-sm text-gray-500">
                  O sistema irá identificar automaticamente a coluna pelo cabeçalho "Nome", "Rede" ou usar a primeira coluna disponível.
                </p>
              </div>
              <div className="flex justify-center">
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="hidden"
                  id="excel-upload"
                />
                <label htmlFor="excel-upload">
                  <Button
                    asChild
                    disabled={isLoading}
                    className="cursor-pointer"
                  >
                    <span>
                      {isLoading ? "Processando..." : "Selecionar Arquivo"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
