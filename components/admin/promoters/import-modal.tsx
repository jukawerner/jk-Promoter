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
import { Progress } from "components/ui/progress";
import { Usuario } from "lib/actions/usuario";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (users: Partial<Usuario>[]) => void;
}

interface ImportError {
  linha: number;
  nome: string;
  erro: string;
}

export function ImportModal({ isOpen, onClose, onConfirm }: ImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [usuariosParaImportar, setUsuariosParaImportar] = useState<Partial<Usuario>[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [errosImportacao, setErrosImportacao] = useState<ImportError[]>([]);
  const [progress, setProgress] = useState(0);

  const formatTelefone = (telefone: string) => {
    if (!telefone) return '';
    return telefone.replace(/\D/g, '').trim();
  };

  const formatCEP = (cep: string) => {
    if (!cep) return '';
    const numbers = cep.replace(/\D/g, '').trim();
    if (numbers.length !== 8) return numbers;
    return numbers.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      setProgress(0);
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

          const usuarios: Partial<Usuario>[] = [];
          const erros: ImportError[] = [];
          const totalRows = jsonData.length;

          for (let i = 0; i < jsonData.length; i++) {
            const row: any = jsonData[i];
            setProgress(Math.round((i / totalRows) * 100));

            try {
              const nome = row['Nome'] || row['NOME'] || '';
              const apelido = row['Apelido'] || row['APELIDO'] || '';
              const email = (row['Email'] || row['EMAIL'] || '').toLowerCase();
              const telefone = formatTelefone(row['Telefone'] || row['TELEFONE'] || '');
              const cep = formatCEP(row['CEP'] || row['Cep'] || '');
              const endereco = row['Endereco'] || row['ENDERECO'] || row['endereço'] || row['ENDEREÇO'] || row['Endereço'] || '';
              const tipo = (row['Tipo'] || row['TIPO'] || 'promotor').toLowerCase();

              // Validações básicas
              if (!nome) throw new Error('Nome é obrigatório');
              if (!email) throw new Error('Email é obrigatório');
              
              // Log para debug
              console.log('Dados lidos do Excel:', {
                nome,
                apelido,
                email,
                telefone,
                cep,
                endereco,
                tipo
              });

              if (nome && email) {
                usuarios.push({
                  nome: nome.trim().toUpperCase(),
                  apelido: apelido.trim().toUpperCase(),
                  email: email.trim(),
                  telefone,
                  cep,
                  endereco: endereco.trim().toUpperCase(),
                  tipo,
                });
              }
            } catch (error) {
              erros.push({
                linha: i + 2,
                nome: row['Nome'] || `Linha ${i + 2}`,
                erro: error instanceof Error ? error.message : 'Erro desconhecido',
              });
            }
          }

          setProgress(100);

          if (erros.length > 0) {
            setErrosImportacao(erros);
            toast.error("Foram encontrados erros na importação");
            return;
          }

          if (usuarios.length > 0) {
            setUsuariosParaImportar(usuarios);
            setStep('preview');
          } else {
            toast.error("Nenhum usuário encontrado no arquivo");
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
    setProgress(0);
    
    // Simula o progresso durante a importação
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Inicia a importação
    onConfirm(usuariosParaImportar);
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Apelido</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>CEP</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosParaImportar.map((usuario, index) => (
                    <TableRow key={index}>
                      <TableCell>{usuario.nome}</TableCell>
                      <TableCell>{usuario.apelido}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.telefone?.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}</TableCell>
                      <TableCell>{usuario.cep}</TableCell>
                      <TableCell>{usuario.endereco}</TableCell>
                      <TableCell>{usuario.tipo}</TableCell>
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
                  setUsuariosParaImportar([]);
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
            <div className="text-lg font-semibold mb-4">Importando usuários...</div>
            <Progress value={progress} className="w-[60%] mb-2" />
            <div className="text-sm text-gray-500">
              {progress < 100 ? "Por favor, aguarde..." : "Concluído!"}
            </div>
          </div>
        );
      default:
        return (
          <div>
            <DialogHeader>
              <DialogTitle>Importar Usuários do Excel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500">
                  Faça o upload de um arquivo Excel (.xlsx) com as seguintes colunas:
                </p>
                <ul className="text-sm text-gray-500 list-disc list-inside">
                  <li>Nome</li>
                  <li>Apelido</li>
                  <li>Email</li>
                  <li>Telefone</li>
                  <li>CEP</li>
                  <li>Endereço</li>
                  <li>Tipo (promotor, admin, supervisor, coordenador)</li>
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
                      {isLoading ? (
                        <>
                          <div className="mr-2">Processando...</div>
                          <Progress value={progress} className="w-20" />
                        </>
                      ) : (
                        "Selecionar Arquivo"
                      )}
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
