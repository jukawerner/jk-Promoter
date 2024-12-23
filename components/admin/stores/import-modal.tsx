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
import { ProgressModal } from "@/components/ui/progress-modal";

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
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

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

  const formatApelido = (apelido: string): string => {
    return apelido
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^A-Z0-9]/g, ''); // Remove caracteres especiais
  };

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

  const getPromotorByApelido = async (apelido: string): Promise<{ id: string; apelido: string } | null> => {
    const apelidoFormatado = formatApelido(apelido);
    console.log('Buscando promotor. Original:', apelido, 'Formatado:', apelidoFormatado);
    
    const { data, error } = await supabase
      .from("usuario")
      .select("id,apelido")
      .ilike('apelido', `%${apelidoFormatado}%`);

    if (error) {
      console.error(`Erro ao buscar usuário com apelido ${apelidoFormatado}:`, error);
      return null;
    }

    console.log('Resultados encontrados:', data);

    if (!data || data.length === 0) {
      console.log(`Nenhum usuário encontrado com apelido ${apelidoFormatado}`);
      return null;
    }

    // Se encontrou mais de um, usa o que tem o match mais próximo
    if (data.length > 1) {
      const matchExato = data.find(u => formatApelido(u.apelido) === apelidoFormatado);
      if (matchExato) return matchExato;
    }

    return data[0];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      setShowProgress(true);
      setProgress(0);
      toast.info("Processando arquivo...");
      const file = event.target.files?.[0];
      if (!file) {
        setIsLoading(false);
        setShowProgress(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (!e.target?.result) {
            throw new Error("Erro ao ler arquivo");
          }
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Força todos os valores como texto
          const rows = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: "",
            blankrows: false
          }) as Record<string, string>[];

          console.log('Dados brutos do Excel:', rows);

          const lojas: StoreImportData[] = [];
          const erros: ImportError[] = [];
          const totalRows = rows.length;

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            // Atualiza o progresso
            setProgress(Math.round(((i + 1) / totalRows) * 100));

            try {
              // Função auxiliar para buscar valor em diferentes variações de nome de coluna
              const getValue = (keys: string[]): string => {
                for (const key of keys) {
                  // Verifica o valor exato e também tenta encontrar como substring
                  if (row[key] !== undefined && row[key] !== "") {
                    return row[key];
                  }
                  // Procura por colunas que contenham a chave
                  const matchingKey = Object.keys(row).find(k => 
                    k.toUpperCase().includes(key.toUpperCase())
                  );
                  if (matchingKey && row[matchingKey] !== "") {
                    return row[matchingKey];
                  }
                }
                return "";
              };

              // Busca valores com diferentes possíveis nomes de coluna
              const nome = getValue(["NOME DA LOJA", "Nome", "NOME", "nome", "LOJA"]);
              const cnpj = getValue(["CNPJ", "Cnpj", "cnpj"]);
              const endereco = getValue(["ENDERECO", "Endereço", "ENDEREÇO", "endereço"]);
              const cep = getValue(["CEP", "Cep", "cep"]);
              const rede = getValue(["REDE", "Rede", "rede"]);
              const promotor = getValue(["PROMOTOR", "Promotor", "promotor"]);

              // Validações básicas dos campos obrigatórios
              if (!nome) throw new Error("Nome é obrigatório");
              if (!cnpj) throw new Error("CNPJ é obrigatório");
              if (!endereco) throw new Error("Endereço é obrigatório");
              if (!cep) throw new Error("CEP é obrigatório");
              if (!rede) throw new Error("Rede é obrigatória");

              // Busca o ID da rede pelo nome
              const rede_id = await getRedeIdByNome(rede);
              if (!rede_id) {
                throw new Error(`Rede "${rede}" não encontrada`);
              }

              // Busca o ID do promotor pelo apelido (opcional)
              let promotor_id = null;
              if (promotor) {
                console.log('Tentando encontrar promotor:', promotor);
                const promotorData = await getPromotorByApelido(promotor);
                if (!promotorData) {
                  throw new Error(`Promotor com apelido "${promotor}" não encontrado`);
                }
                promotor_id = promotorData.id;
                console.log('Promotor encontrado:', promotorData);
              }

              const novaLoja: StoreImportData = {
                nome: formatText(nome),
                cnpj: formatCNPJ(String(cnpj)),
                endereco: formatText(endereco),
                cep: formatCEP(String(cep)),
                rede_id: rede_id,
                promotor_id: promotor_id,
                promotor_apelido: promotor ? formatText(promotor) : null,
                latitude: -23.5505, // Valores default
                longitude: -46.6333,
              };

              lojas.push(novaLoja);
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
            setShowProgress(false);
            return;
          }

          if (lojas.length > 0) {
            setLojasParaImportar(lojas);
            setStep('preview');
          } else {
            toast.error("Nenhuma loja encontrada no arquivo");
          }
          setShowProgress(false);
        } catch (error) {
          console.error("Erro ao processar arquivo:", error);
          toast.error("Erro ao processar arquivo Excel");
          setShowProgress(false);
        }
      };

      reader.onerror = () => {
        toast.error("Erro ao ler arquivo");
        setShowProgress(false);
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Erro na importação:", error);
      toast.error("Erro na importação");
      setShowProgress(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setStep('importing');
      setShowProgress(true);
      setProgress(0);

      // Importa as lojas
      for (let i = 0; i < lojasParaImportar.length; i++) {
        const loja = lojasParaImportar[i];
        
        // Insere a loja no banco
        const { error } = await supabase
          .from("loja")
          .insert([{
            nome: loja.nome,
            cnpj: loja.cnpj,
            endereco: loja.endereco,
            cep: loja.cep,
            latitude: loja.latitude,
            longitude: loja.longitude,
            rede_id: loja.rede_id,
            promotor_id: loja.promotor_id
          }]);

        if (error) {
          console.error('Erro ao inserir loja:', error);
          throw error;
        }
        
        // Atualiza o progresso
        setProgress(Math.round(((i + 1) / lojasParaImportar.length) * 100));
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
    } finally {
      setShowProgress(false);
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          {renderContent()}
        </DialogContent>
      </Dialog>

      <ProgressModal
        isOpen={showProgress}
        title="Processando Importação"
        description={step === 'importing' ? 'Salvando lojas no banco de dados...' : 'Processando arquivo Excel...'}
        progress={progress}
      />
    </>
  );
}
