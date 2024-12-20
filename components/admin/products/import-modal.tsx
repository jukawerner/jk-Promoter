"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Produto {
  codigo_ean: string;
  nome: string;
  familia: string;
  unidade: string;
  peso: number;
  validade: number;
  marca: string;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (produtos: Produto[]) => void;
}

interface ImportError {
  linha: number;
  produto: string;
  erro: string;
}

export function ImportModal({ isOpen, onClose, onConfirm }: ImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [produtosParaImportar, setProdutosParaImportar] = useState<Produto[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [errosImportacao, setErrosImportacao] = useState<ImportError[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: "",
          });

          console.log('Dados brutos do Excel:', jsonData);

          const produtos: Produto[] = [];
          const erros: ImportError[] = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row: any = jsonData[i];
            console.log('Processando linha:', row);

            try {
              // Função para buscar valor em diferentes variações de nome de coluna
              const getColumnValue = (baseNames: string[]): string => {
                const variations = baseNames.reduce((acc: string[], base) => [
                  ...acc,
                  base,
                  base.toUpperCase(),
                  base.toLowerCase(),
                  base.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
                  base.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(),
                  base.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
                ], []);

                for (const variant of variations) {
                  if (row[variant] !== undefined && row[variant] !== null) {
                    return String(row[variant]).trim();
                  }
                }
                return '';
              };

              const formatText = (text: string): string => {
                return String(text || '')
                  .trim()
                  .toUpperCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/\s+/g, ' ');
              };

              // Função para formatar número
              const formatNumber = (value: any): number => {
                if (!value) return 0;
                const cleanValue = String(value).replace(/[^\d.]/g, '');
                return Number(cleanValue) || 0;
              };
              const codigo_ean = getColumnValue(['Codigo EAN', 'CODIGO EAN', 'EAN', 'Código EAN', 'CÓDIGO EAN', 'Codigo', 'CODIGO']);
              const nome = formatText(getColumnValue(['Nome', 'NOME', 'Produto', 'PRODUTO', 'Nome do Produto', 'NOME DO PRODUTO']));
              const familia = formatText(getColumnValue(['Familia', 'FAMILIA', 'Família', 'FAMÍLIA', 'Categoria', 'CATEGORIA']));
              const unidade = formatText(getColumnValue(['Unidade', 'UNIDADE', 'UN', 'Und', 'UND']));
              const peso = formatNumber(getColumnValue(['Peso', 'PESO', 'Peso (g)', 'PESO (G)', 'Peso em Gramas', 'PESO EM GRAMAS']));
              const validade = formatNumber(getColumnValue(['Validade', 'VALIDADE', 'Validade (dias)', 'VALIDADE (DIAS)']));
              const marca = formatText(getColumnValue(['Marca', 'MARCA', 'Fabricante', 'FABRICANTE']));

              console.log('Valores extraídos:', { 
                codigo_ean, nome, familia, unidade, peso, validade, marca 
              });

              produtos.push({
                codigo_ean,
                nome,
                familia,
                unidade,
                peso,
                validade,
                marca,
              });
            } catch (error) {
              erros.push({
                linha: i + 2,
                produto: row['Nome'] || `Linha ${i + 2}`,
                erro: error instanceof Error ? error.message : 'Erro desconhecido',
              });
            }
          }

          if (erros.length > 0) {
            setErrosImportacao(erros);
            toast.error("Foram encontrados erros na importação");
            return;
          }

          if (produtos.length > 0) {
            setProdutosParaImportar(produtos);
            setStep('preview');
          } else {
            toast.error("Nenhum produto encontrado no arquivo");
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

  const handleConfirm = () => {
    setStep('importing');
    onConfirm(produtosParaImportar);
  };

  const renderContent = () => {
    switch (step) {
      case 'preview':
        return (
          <div>
            <DialogHeader>
              <DialogTitle>Confirmar Importação</DialogTitle>
            </DialogHeader>
            <ScrollArea className="mt-4 h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código EAN</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Família</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Peso (g)</TableHead>
                    <TableHead>Validade (dias)</TableHead>
                    <TableHead>Marca</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosParaImportar.map((produto, index) => (
                    <TableRow key={index}>
                      <TableCell>{produto.codigo_ean}</TableCell>
                      <TableCell>{produto.nome}</TableCell>
                      <TableCell>{produto.familia}</TableCell>
                      <TableCell>{produto.unidade}</TableCell>
                      <TableCell>{produto.peso}</TableCell>
                      <TableCell>{produto.validade}</TableCell>
                      <TableCell>{produto.marca}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('upload');
                  setProdutosParaImportar([]);
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
            <div className="text-lg font-semibold mb-4">Importando produtos...</div>
            <div className="text-sm text-gray-500">Por favor, aguarde...</div>
          </div>
        );
      default:
        return (
          <div>
            <DialogHeader>
              <DialogTitle>Importar Produtos do Excel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500">
                  Faça o upload de um arquivo Excel (.xlsx) com as seguintes colunas:
                </p>
                <ul className="text-sm text-gray-500 list-disc list-inside">
                  <li>Código EAN</li>
                  <li>Nome</li>
                  <li>Família</li>
                  <li>Unidade</li>
                  <li>Peso (g)</li>
                  <li>Validade (dias)</li>
                  <li>Marca</li>
                </ul>
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
      <DialogContent className="max-w-7xl">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
