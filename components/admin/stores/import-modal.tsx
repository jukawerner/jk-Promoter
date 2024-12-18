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
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Store, StoreImportData } from "@/types/store";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportError {
  linha: number;
  loja: string;
  erro: string;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lojasParaImportar, setLojasParaImportar] = useState<StoreImportData[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'error'>('upload');
  const [errosImportacao, setErrosImportacao] = useState<ImportError[]>([]);

  const getRedeIdByNome = async (nome: string): Promise<number | null> => {
    const { data, error } = await supabase
      .from("rede")
      .select("id")
      .ilike("nome", nome)
      .single();

    if (error || !data) {
      console.error(`Rede não encontrada: ${nome}`, error);
      return null;
    }

    return data.id;
  };

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

          const lojas: StoreImportData[] = await Promise.all(jsonData.map(async (row: any) => {
            console.log('Processando linha:', row);
            
            const nome = row['Nome'] || row['NOME'] || row['nome'] || '';
            const rede = row['Rede'] || row['REDE'] || row['rede'] || '';
            const cnpj = row['CNPJ'] || row['cnpj'] || '';
            const endereco = row['Endereço'] || row['ENDERECO'] || row['endereco'] || '';
            const numero = row['Número'] || row['NUMERO'] || row['numero'] || '';
            const bairro = row['Bairro'] || row['BAIRRO'] || row['bairro'] || '';
            const cidade = row['Cidade'] || row['CIDADE'] || row['cidade'] || '';
            const uf = row['UF'] || row['uf'] || '';
            const cep = row['CEP'] || row['cep'] || '';
            const promotor_id = row['Promotor ID'] || row['PROMOTOR_ID'] || row['promotor_id'] || null;

            // Busca o ID da rede
            const rede_id = await getRedeIdByNome(rede);
            if (!rede_id) {
              throw new Error(`Rede não encontrada: ${rede}`);
            }

            return {
              nome: String(nome),
              cnpj: String(cnpj),
              endereco: String(endereco),
              numero: String(numero),
              bairro: String(bairro),
              cidade: String(cidade),
              uf: String(uf),
              cep: String(cep),
              rede_id,
              promotor_id: promotor_id ? String(promotor_id) : null,
            };
          }));

          console.log('Todas as lojas:', lojas);

          if (lojas.length > 0) {
            setLojasParaImportar(lojas);
            setStep('preview');
          } else {
            toast.error("Nenhuma loja encontrada no arquivo");
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

  const handleImport = async () => {
    try {
      setStep('importing');
      let successCount = 0;
      let errorCount = 0;
      const erros: ImportError[] = [];

      const { data: result, error } = await supabase
        .from("loja")
        .insert(lojasParaImportar)
        .select();

      if (error) {
        console.error("Erro ao importar lojas:", error);
        setErrosImportacao([{
          linha: 0,
          loja: "Múltiplas lojas",
          erro: "Erro ao salvar no banco de dados"
        }]);
        setStep('error');
        return;
      }

      successCount = result?.length || 0;
      toast.success(`${successCount} lojas importadas com sucesso!`);
      onSuccess();
      onClose();
      setStep('upload');
      setLojasParaImportar([]);
    } catch (error) {
      console.error("Erro na importação:", error);
      toast.error("Erro na importação");
      setStep('preview');
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'error':
        return (
          <div>
            <DialogHeader>
              <DialogTitle>Erros na Importação</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Foram encontrados erros na importação</AlertTitle>
                <AlertDescription>
                  Por favor, corrija os erros abaixo e tente novamente.
                </AlertDescription>
              </Alert>
              <div className="mt-4 max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Linha</TableHead>
                      <TableHead>Loja</TableHead>
                      <TableHead>Erro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errosImportacao.map((erro, index) => (
                      <TableRow key={index}>
                        <TableCell>{erro.linha}</TableCell>
                        <TableCell>{erro.loja}</TableCell>
                        <TableCell className="text-red-500">{erro.erro}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                onClick={() => {
                  setStep('upload');
                  setErrosImportacao([]);
                }}
              >
                Voltar
              </Button>
            </DialogFooter>
          </div>
        );
      case 'preview':
        return (
          <div>
            <DialogHeader>
              <DialogTitle>Confirmar Importação</DialogTitle>
            </DialogHeader>
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead>Rede ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lojasParaImportar.map((loja, index) => (
                    <TableRow key={index}>
                      <TableCell>{loja.nome}</TableCell>
                      <TableCell>{loja.cnpj}</TableCell>
                      <TableCell>{`${loja.endereco}, ${loja.numero}`}</TableCell>
                      <TableCell>{loja.cidade}</TableCell>
                      <TableCell>{loja.uf}</TableCell>
                      <TableCell>{loja.rede_id}</TableCell>
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
                  setLojasParaImportar([]);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleImport} disabled={isLoading}>
                {isLoading ? "Importando..." : "Confirmar Importação"}
              </Button>
            </DialogFooter>
          </div>
        );
      case 'importing':
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="text-lg font-semibold mb-4">Importando lojas...</div>
            <div className="text-sm text-gray-500">Por favor, aguarde...</div>
          </div>
        );
      default:
        return (
          <div>
            <DialogHeader>
              <DialogTitle>Importar Lojas do Excel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500">
                  Faça o upload de um arquivo Excel (.xlsx) com as seguintes colunas:
                </p>
                <ul className="text-sm text-gray-500 list-disc list-inside">
                  <li>Nome</li>
                  <li>Rede (nome da rede cadastrada no sistema)</li>
                  <li>CNPJ</li>
                  <li>Endereço</li>
                  <li>Número</li>
                  <li>Bairro</li>
                  <li>Cidade</li>
                  <li>UF</li>
                  <li>CEP</li>
                  <li>Promotor ID (opcional)</li>
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
      <DialogContent className="max-w-4xl">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
