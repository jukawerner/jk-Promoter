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
import { Trash2, Download, X, Image, Eye, Presentation } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "components/ui/dialog";
import * as XLSX from "xlsx";
import pptxgen from "pptxgenjs";

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

      const formattedData = (rncData || []).map(item => ({
        ...item,
        rede_id: (item.rede_id || '').toUpperCase(),
        loja_id: (item.loja_id || '').toUpperCase(),
        marca_id: (item.marca_id || '').toUpperCase(),
        produto_id: (item.produto_id || '').toUpperCase(),
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

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      dataInicio: null,
      dataFim: null,
    });
  };

  const columns: ColumnDef<RNC>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar tudo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">RNC - Relatório de Não Conformidade</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToExcel}
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
            {selectedCount > 0 && ` (${selectedCount} selecionados)`}
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToPresentation()}
            disabled={isLoading}
          >
            <Presentation className="w-4 h-4 mr-2" />
            Exportar Apresentação
            {selectedCount > 0 && ` (${selectedCount} selecionados)`}
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Buscar</label>
            <Input
              placeholder="Buscar por marca..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Período</label>
            <DatePickerWithRange
              onChange={(range) => {
                setFiltros({
                  ...filtros,
                  dataInicio: range?.from || null,
                  dataFim: range?.to || null,
                });
              }}
              from={filtros.dataInicio}
              to={filtros.dataFim}
            />
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (selectedRows.length === rncData.length) {
                  setSelectedRows([]);
                } else {
                  setSelectedRows([...rncData]);
                }
              }}
            >
              {selectedRows.length === rncData.length ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Desmarcar Todos
                </>
              ) : (
                <>
                  <Checkbox className="w-4 h-4 mr-2" />
                  Selecionar Todos
                </>
              )}
            </Button>
          </div>
          <Button variant="outline" onClick={limparFiltros}>
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rncData}
        loading={isLoading}
      />
      
      <FotoDialog 
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState(prev => ({ ...prev, isOpen: false }))}
        fotos={dialogState.fotos}
        marca={dialogState.marca}
        data={dialogState.data}
      />
    </div>
  );
}
