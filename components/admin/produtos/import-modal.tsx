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
import { createProduto } from "@/lib/actions/produto";
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

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProdutoImport {
  codigo_ean?: string;
  nome: string;
  familia: string;
  unidade: string;
  peso: number;
  validade: number;
  marca: string;
  marca_id?: number;
  error?: string;
}

interface ImportError {
  linha: number;
  produto: string;
  erro: string;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [produtosParaImportar, setProdutosParaImportar] = useState<ProdutoImport[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'error'>('upload');
  const [errosImportacao, setErrosImportacao] = useState<ImportError[]>([]);

  const getMarcaIdByNome = async (nome: string): Promise<number | null> => {
    const { data, error } = await supabase
      .from("marca")
      .select("id")
      .ilike("nome", nome)
      .single();

    if (error || !data) {
      console.error(`Marca não encontrada: ${nome}`, error);
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
          
          // Converte para JSON com opções específicas
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false, // Mantém os valores como string
            defval: "", // Valor padrão para células vazias
          });

          console.log('Dados brutos do Excel:', jsonData);

          const produtos: ProdutoImport[] = jsonData.map((row: any) => {
            console.log('Processando linha:', row);
            
            // Tenta diferentes variações dos nomes das colunas
            const nome = row['Nome'] || row['NOME'] || row['nome'] || '';
            const familia = row['Família'] || row['Familia'] || row['FAMILIA'] || row['FAMÍLIA'] || '';
            const unidadeExcel = (row['Unidade'] || row['UNIDADE'] || '').toString().toLowerCase();
            const peso = row['Peso'] || row['PESO'] || row['Peso (g)'] || row['PESO (G)'] || '0';
            const validade = row['Validade'] || row['VALIDADE'] || row['Validade (dias)'] || row['VALIDADE (DIAS)'] || '0';
            const codigo_ean = row['Código EAN'] || row['Codigo EAN'] || row['CODIGO EAN'] || row['EAN'] || '';
            const marca = row['Marca'] || row['MARCA'] || '';

            // Padroniza a unidade
            let unidade = "unidade";
            if (unidadeExcel.includes('kg') || 
                unidadeExcel.includes('kilo') || 
                unidadeExcel.includes('quilo') || 
                unidadeExcel === 'k' || 
                unidadeExcel === 'kilogram' || 
                unidadeExcel === 'quilograma') {
              unidade = "quilograma";
            }

            const produto = {
              codigo_ean: String(codigo_ean),
              nome: String(nome),
              familia: String(familia),
              unidade,
              peso: Number(peso) || 0,
              validade: Number(validade) || 0,
              marca: String(marca)
            };

            console.log('Produto processado:', produto);
            return produto;
          });

          console.log('Todos os produtos:', produtos);

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

  const handleImport = async () => {
    try {
      setStep('importing');
      let successCount = 0;
      let errorCount = 0;
      const erros: ImportError[] = [];

      for (const produto of produtosParaImportar) {
        try {
          // Busca o ID da marca pelo nome
          const marca_id = await getMarcaIdByNome(produto.marca);
          
          if (!marca_id) {
            console.error(`Marca não encontrada: ${produto.marca}`);
            errorCount++;
            erros.push({
              linha: 0,
              produto: produto.nome,
              erro: `Marca não encontrada: ${produto.marca}`
            });
            continue;
          }

          // Remove a marca e adiciona o marca_id
          const { marca, ...produtoData } = produto;
          await createProduto({ ...produtoData, marca_id });
          successCount++;
        } catch (error) {
          console.error("Erro ao importar produto:", error);
          errorCount++;
          erros.push({
            linha: 0,
            produto: produto.nome,
            erro: "Erro ao salvar no banco de dados"
          });
        }
      }

      if (erros.length > 0) {
        setErrosImportacao(erros);
        setStep('error');
      } else {
        toast.success(
          `Importação concluída: ${successCount} produtos importados, ${errorCount} erros`
        );
        onSuccess();
        onClose();
        setStep('upload');
        setProdutosParaImportar([]);
      }
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
                      <TableHead>Produto</TableHead>
                      <TableHead>Erro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errosImportacao.map((erro, index) => (
                      <TableRow key={index}>
                        <TableCell>{erro.linha}</TableCell>
                        <TableCell>{erro.produto}</TableCell>
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
                    <TableHead>Código EAN</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Família</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Peso (g)</TableHead>
                    <TableHead>Validade</TableHead>
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
            </div>
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
              <Button onClick={handleImport} disabled={isLoading}>
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
                  <li>Unidade (UN, KG, CX, etc)</li>
                  <li>Peso (g)</li>
                  <li>Validade (dias)</li>
                  <li>Marca (nome da marca cadastrada no sistema)</li>
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
