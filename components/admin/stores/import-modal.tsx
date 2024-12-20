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
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const getPromotorIdByNome = async (nome: string): Promise<{ id: string; apelido: string } | null> => {
    const { data, error } = await supabase
      .from("usuario")
      .select("id, apelido")
      .ilike("apelido", nome)
      .single();

    if (error || !data) {
      console.error(`Promotor não encontrado: ${nome}`, error);
      return null;
    }

    return { id: data.id, apelido: data.apelido };
  };

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '';
    // Remove tudo que não é número
    const numbers = cnpj.replace(/\D/g, '').trim();
    // Se não tiver números suficientes, retorna vazio
    if (numbers.length < 14) return '';
    // Pega apenas os primeiros 14 dígitos
    const formatted = numbers.slice(0, 14);
    // Formata como XX.XXX.XXX/XXXX-XX
    return formatted.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  const formatCEP = (cep: string) => {
    if (!cep) return '';
    // Remove tudo que não é número
    const numbers = cep.replace(/\D/g, '').trim();
    // Se não tiver números suficientes, retorna vazio
    if (numbers.length < 8) return '';
    // Pega apenas os primeiros 8 dígitos
    const formatted = numbers.slice(0, 8);
    // Formata como XXXXX-XXX
    return formatted.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  };

  const formatText = (text: string) => {
    if (!text) return '';
    return text.trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, ' '); // Remove espaços extras
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

          const lojas: StoreImportData[] = [];
          const erros: ImportError[] = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row: any = jsonData[i];
            console.log('Processando linha:', row); // Log para debug

            try {
              // Função auxiliar para buscar valor em diferentes variações de nome de coluna
              const getColumnValue = (baseNames: string[]): string => {
                const variations = baseNames.reduce((acc: string[], base) => [
                  ...acc,
                  base,
                  base.toUpperCase(),
                  base.toLowerCase(),
                  base.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), // sem acentos
                  base.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(),
                  base.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
                ], []);

                for (const variant of variations) {
                  if (row[variant] !== undefined && row[variant] !== null) {
                    return String(row[variant]);
                  }
                }
                return '';
              };

              const nome = getColumnValue(['Nome', 'NOME DA LOJA', 'LOJA', 'Nome da Loja', 'Loja']);
              const rede = getColumnValue(['Rede', 'REDE', 'Nome da Rede', 'NOME DA REDE']);
              const cnpj = getColumnValue(['CNPJ', 'Cnpj']);
              const endereco = getColumnValue(['Endereco', 'Endereço', 'ENDERECO', 'ENDEREÇO']);
              const cep = getColumnValue(['CEP', 'Cep']);
              const promotorNome = getColumnValue(['Promotor', 'PROMOTOR', 'Nome do Promotor', 'NOME DO PROMOTOR']);

              console.log('Valores extraídos:', { nome, rede, cnpj, endereco, cep, promotorNome }); // Log para debug

              // Busca o ID da rede se fornecido
              let rede_id = null;
              if (rede) {
                rede_id = await getRedeIdByNome(rede);
                if (!rede_id) {
                  throw new Error(`Rede não encontrada: ${rede}`);
                }
              }

              // Busca o ID do promotor se fornecido
              let promotor_id = null;
              let promotor_apelido = null;
              if (promotorNome) {
                const promotor = await getPromotorIdByNome(promotorNome);
                if (!promotor) {
                  throw new Error(`Promotor não encontrado: ${promotorNome}`);
                }
                promotor_id = promotor.id;
                promotor_apelido = promotor.apelido;
              }

              lojas.push({
                nome: formatText(nome),
                cnpj: formatCNPJ(String(cnpj)),
                endereco: formatText(endereco),
                cep: formatCEP(String(cep)),
                rede_id,
                promotor_id,
                promotor_apelido: promotor_apelido ? formatText(promotor_apelido) : null,
                latitude: -23.5505,
                longitude: -46.6333,
              });
            } catch (error) {
              erros.push({
                linha: i + 2,
                loja: row['Nome'] || `Linha ${i + 2}`,
                erro: error instanceof Error ? error.message : 'Erro desconhecido',
              });
            }
          }

          if (erros.length > 0) {
            setErrosImportacao(erros);
            setStep('error');
            return;
          }

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
      const { data, error } = await supabase
        .from("loja")
        .insert(lojasParaImportar.map(({ promotor_apelido, ...loja }) => loja))
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

      toast.success(`${lojasParaImportar.length} lojas importadas com sucesso!`);
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
            <ScrollArea className="mt-4 h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>CEP</TableHead>
                    <TableHead>Promotor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lojasParaImportar.map((loja, index) => (
                    <TableRow key={index}>
                      <TableCell>{loja.nome}</TableCell>
                      <TableCell>{loja.cnpj}</TableCell>
                      <TableCell>{loja.endereco}</TableCell>
                      <TableCell>{loja.cep}</TableCell>
                      <TableCell>{loja.promotor_apelido || '-'}</TableCell>
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
                  <li>Rede (nome da rede cadastrada)</li>
                  <li>CNPJ</li>
                  <li>Endereço</li>
                  <li>CEP</li>
                  <li>Promotor (apelido do promotor cadastrado)</li>
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
