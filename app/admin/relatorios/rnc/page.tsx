"use client";

import { useState, useEffect } from "react";
import { Button } from "components/ui/button";
import { DataTable } from "components/ui/data-table";
import { Input } from "components/ui/input";
import { DatePickerWithRange } from "components/ui/date-range-picker";
import { Checkbox } from "components/ui/checkbox";
import { supabase } from "lib/supabase";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Download, X, Image, Eye, Presentation, FileText, ClipboardList } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "components/ui/dialog";
import * as XLSX from "xlsx";
import pptxgen from "pptxgenjs";
import { Label } from "components/ui/label";

interface RNC {
  id: number;
  data: string;
  rede_id: string;
  loja_id: string;
  marca_id: string;
  produto_id: string;
  motivo: string;
  numero_nota_fiscal: string;
  valor_total: number;
  observacoes: string | null;
  fotos: string[];
  created_at: string;
}

interface RowSelection {
  [key: string]: boolean;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
}

interface Filtros {
  busca: string;
  dataInicio: Date | null;
  dataFim: Date | null;
  rede: string;
  loja: string;
}

function FotoDialog({ fotos, isOpen, onClose, marca, data }: { 
  fotos: string[]; 
  isOpen: boolean; 
  onClose: () => void;
  marca: string;
  data: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Fotos da RNC - {marca} ({new Date(data).toLocaleDateString('pt-BR')})</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {fotos.map((foto, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={foto}
                alt={`Foto ${index + 1}`}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function RNCPage() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    fotos: string[];
    marca: string;
    data: string;
  }>({
    isOpen: false,
    fotos: [],
    marca: "",
    data: "",
  });
  const [rncData, setRncData] = useState<RNC[]>([]);
  const [rncCompleto, setRncCompleto] = useState<RNC[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: "",
    dataInicio: null,
    dataFim: null,
    rede: "",
    loja: "",
  });
  const [selectedRows, setSelectedRows] = useState<RNC[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    setSelectedCount(selectedRows.length);
  }, [selectedRows]);

  useEffect(() => {
    loadRNC();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, rncCompleto]);

  const loadRNC = async () => {
    try {
      setIsLoading(true);
      const { data: rncData, error } = await supabase
        .from('rnc')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;

      const formattedData = await Promise.all((rncData || []).map(async item => {
        // Processa as URLs das fotos
        let fotosUrls = [];
        if (Array.isArray(item.fotos)) {
          fotosUrls = item.fotos.map((foto) => {
            if (foto.startsWith('http')) return foto;
            const { data } = supabase.storage.from('rnc_photos').getPublicUrl(foto);
            return data.publicUrl;
          });
        }

        return {
          ...item,
          rede_id: (item.rede_id || '').toUpperCase(),
          loja_id: (item.loja_id || '').toUpperCase(),
          marca_id: (item.marca_id || '').toUpperCase(),
          produto_id: (item.produto_id || '').toUpperCase(),
          fotos: fotosUrls,
        };
      }));

      setRncCompleto(formattedData);
      setRncData(formattedData);
    } catch (error) {
      console.error('Erro ao carregar RNC:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let dadosFiltrados = [...rncCompleto];

    if (filtros.busca) {
      const termoBusca = filtros.busca.toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(item => 
        item.marca_id.toLowerCase().includes(termoBusca)
      );
    }

    if (filtros.dataInicio && filtros.dataFim) {
      dadosFiltrados = dadosFiltrados.filter(item => {
        const dataItem = new Date(item.data);
        return dataItem >= filtros.dataInicio! && dataItem <= filtros.dataFim!;
      });
    }

    if (filtros.rede) {
      dadosFiltrados = dadosFiltrados.filter(item => item.rede_id === filtros.rede);
    }

    if (filtros.loja) {
      dadosFiltrados = dadosFiltrados.filter(item => item.loja_id === filtros.loja);
    }

    setRncData(dadosFiltrados);
  };

  const exportToExcel = () => {
    try {
      if (selectedRows.length === 0) {
        toast.error("Por favor, selecione pelo menos um item para exportar.");
        return;
      }

      const rowsToExport = selectedRows;
      const dadosExport = rowsToExport.map((rnc) => ({
        Data: new Date(rnc.data).toLocaleDateString('pt-BR'),
        Rede: rnc.rede_id?.toUpperCase() || 'N/A',
        Loja: rnc.loja_id?.toUpperCase() || 'N/A',
        Marca: rnc.marca_id?.toUpperCase() || 'N/A',
        Produto: rnc.produto_id?.toUpperCase() || 'N/A',
        Motivo: rnc.motivo,
        'Nota Fiscal': rnc.numero_nota_fiscal,
        'Valor Total': new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(rnc.valor_total),
        'Quantidade de Fotos': Array.isArray(rnc.fotos) ? rnc.fotos.length : 0,
      }));

      const ws = XLSX.utils.json_to_sheet(dadosExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "RNC");
      
      // Usar o XLSX.write para gerar o arquivo
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      
      // Converter para Blob e criar URL
      const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      // Criar link e fazer download
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_rnc_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      
      // Limpar
      window.URL.revokeObjectURL(url);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
      toast.error("Erro ao exportar relatório");
    }
  };

  // Função auxiliar para converter string para ArrayBuffer
  function s2ab(s: string): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  const exportToPresentation = async (singleRnc?: RNC) => {
    const toastId = toast.loading("Gerando apresentação...");
    
    try {
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';
      
      const MARGINS = {
        top: '5%',
        left: '5%',
        right: '5%',
        bottom: '5%'
      };
      
      const rowsToExport = singleRnc 
        ? [singleRnc] 
        : (selectedRows.length > 0 ? selectedRows : rncData);

      toast.loading("Gerando apresentação...", { id: toastId });
      
      for (const rnc of rowsToExport) {
        const slide = pptx.addSlide();
        
        slide.addText(`RNC - ${rnc.marca_id}`, {
          x: MARGINS.left,
          y: MARGINS.top,
          w: '90%',
          h: '8%',
          fontSize: 32,
          bold: true,
          color: '363636',
          align: 'left',
          fontFace: 'Arial'
        });

        const infoData = [
          ['Data', new Date(rnc.data).toLocaleDateString('pt-BR')],
          ['Rede', rnc.rede_id || 'N/A'],
          ['Loja', rnc.loja_id || 'N/A'],
          ['Marca', rnc.marca_id],
          ['Produto', rnc.produto_id],
          ['Motivo', rnc.motivo],
          ['Nota Fiscal', rnc.numero_nota_fiscal],
          ['Valor Total', new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).format(rnc.valor_total)]
        ];

        infoData.forEach((row, index) => {
          slide.addText(row[0], {
            x: MARGINS.left,
            y: `${15 + (index * 5)}%`,
            w: '15%',
            h: '5%',
            fontSize: 14,
            bold: true,
            color: '363636',
            align: 'left',
            fontFace: 'Arial'
          });

          slide.addText(row[1], {
            x: `${parseInt(MARGINS.left) + 15}%`,
            y: `${15 + (index * 5)}%`,
            w: '75%',
            h: '5%',
            fontSize: 14,
            color: '363636',
            align: 'left',
            fontFace: 'Arial'
          });
        });

        if (Array.isArray(rnc.fotos) && rnc.fotos.length > 0) {
          const photosPerRow = 3;
          const totalWidth = 90;
          const photoWidth = Math.floor(totalWidth / photosPerRow);
          const photoHeight = 45;
          const horizontalGap = 2;
          const startY = 55;

          for (let i = 0; i < rnc.fotos.length; i++) {
            try {
              const foto = rnc.fotos[i];
              if (!foto) continue;

              const response = await fetch(foto);
              const blob = await response.blob();
              const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });

              const row = Math.floor(i / photosPerRow);
              const col = i % photosPerRow;
              
              const x = parseInt(MARGINS.left) + (col * (photoWidth + horizontalGap));
              const y = startY;

              slide.addImage({
                data: base64,
                x: `${x}%`,
                y: `${y}%`,
                w: `${photoWidth}%`,
                h: `${photoHeight}%`
              });
            } catch (error) {
              console.error(`Erro ao processar foto ${i + 1}:`, error);
            }
          }
        }
      }

      const fileName = singleRnc 
        ? `rnc_${singleRnc.marca_id}_${new Date().toISOString().split('T')[0]}.pptx`
        : `rnc_geral_${new Date().toISOString().split('T')[0]}.pptx`;

      await pptx.writeFile({ fileName });
      toast.success("Apresentação exportada com sucesso!", { id: toastId });
    } catch (error) {
      console.error("Erro ao exportar apresentação:", error);
      toast.error("Erro ao exportar apresentação", { id: toastId });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este registro?")) {
      return;
    }

    try {
      const rncToDelete = rncData.find(rnc => rnc.id === id);
      if (!rncToDelete) return;

      // Excluir fotos do storage
      if (rncToDelete.fotos && rncToDelete.fotos.length > 0) {
        await Promise.all(rncToDelete.fotos.map(async (fotoUrl) => {
          const fileName = fotoUrl.split('rnc_photos/')[1];
          if (fileName) {
            await supabase.storage.from('rnc_photos').remove([fileName]);
          }
        }));
      }

      // Excluir registro do banco
      const { error } = await supabase
        .from("rnc")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Registro excluído com sucesso!");
      loadRNC(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error("Erro ao excluir registro");
    }
  };

  const handleDeleteSelected = async () => {
    try {
      if (!selectedRows.length) return;

      const { error } = await supabase
        .from('rnc')
        .delete()
        .in('id', selectedRows.map(row => row.id));

      if (error) throw error;

      // Remover os itens excluídos do estado
      setRncData(prev => prev.filter(item => !selectedRows.map(row => row.id).includes(item.id)));
      setSelectedRows([]);
      toast.success('Registros excluídos com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir registros:', error);
      toast.error('Erro ao excluir registros');
    }
  };

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      dataInicio: null,
      dataFim: null,
      rede: "",
      loja: "",
    });
  };

  const columns: ColumnDef<RNC>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            const rows = table.getRowModel().rows;
            if (value) {
              setSelectedRows(rows.map((row) => row.original));
            } else {
              setSelectedRows([]);
            }
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            if (value) {
              setSelectedRows(prev => [...prev, row.original]);
            } else {
              setSelectedRows(prev => prev.filter(item => item.id !== row.original.id));
            }
          }}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "data",
      header: "Data",
      cell: ({ row }) => new Date(row.getValue("data")).toLocaleDateString('pt-BR'),
    },
    {
      accessorKey: "rede_id",
      header: "Rede",
    },
    {
      accessorKey: "loja_id",
      header: "Loja",
    },
    {
      accessorKey: "marca_id",
      header: "Marca",
    },
    {
      accessorKey: "produto_id",
      header: "Produto",
    },
    {
      accessorKey: "motivo",
      header: "Motivo",
    },
    {
      accessorKey: "numero_nota_fiscal",
      header: "Nota Fiscal",
    },
    {
      accessorKey: "valor_total",
      header: "Valor Total",
      cell: ({ row }) => {
        const valor = parseFloat(row.getValue("valor_total"));
        return new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(valor);
      },
    },
    {
      id: "fotos",
      header: "Fotos",
      cell: ({ row }) => {
        const fotos = row.original.fotos;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDialogState({
                  isOpen: true,
                  fotos: fotos,
                  marca: row.original.marca_id,
                  data: row.original.data,
                });
              }}
              disabled={!fotos || fotos.length === 0}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {Array.isArray(fotos) ? fotos.length : 0} foto(s)
            </span>
          </div>
        );
      },
    },
    {
      id: 'acoes',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => exportToPresentation(row.original)}
          >
            <Presentation className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-rose-100 rounded-full flex items-center justify-center">
              <FileText className="h-12 w-12 text-rose-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-rose-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatório de Não Conformidade</h1>
          <p className="text-gray-500">Registre ocorrências e não conformidades encontradas nos produtos</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            {/* Rede */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5">Rede</Label>
              <Input
                value={filtros.rede || ""}
                className="w-full bg-gray-50"
                disabled
              />
            </div>

            {/* Loja */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5">Loja</Label>
              <Input
                value={filtros.loja || ""}
                className="w-full bg-gray-50"
                disabled
              />
            </div>

            {/* Marca */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5">Marca</Label>
              <Input
                placeholder="Buscar por marca..."
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                className="w-full bg-gray-50"
              />
            </div>

            {/* Período */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5">Período</Label>
              <DatePickerWithRange
                value={{
                  from: filtros.dataInicio,
                  to: filtros.dataFim,
                }}
                onChange={(range) => {
                  setFiltros({
                    ...filtros,
                    dataInicio: range?.from || null,
                    dataFim: range?.to || null,
                  });
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={exportToExcel}
                variant="outline"
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Excel
              </Button>
              <Button
                onClick={exportToPresentation}
                variant="outline"
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <Presentation className="w-4 h-4" />
                Exportar Apresentação
              </Button>
              {selectedCount > 0 && (
                <Button
                  onClick={handleDeleteSelected}
                  variant="destructive"
                  size="sm"
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Selecionados ({selectedCount})
                </Button>
              )}
              <Button
                onClick={limparFiltros}
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto flex items-center gap-2 ml-auto"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </Button>
            </div>

            <div className="mt-6">
              <DataTable
                columns={columns}
                data={rncData}
                loading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      <FotoDialog
        fotos={dialogState.fotos}
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ ...dialogState, isOpen: false })}
        marca={dialogState.marca}
        data={dialogState.data}
      />
    </div>
  );
}
