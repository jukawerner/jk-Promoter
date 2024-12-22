"use client";

import { useState, useEffect } from "react";
import { Button } from "components/ui/button";
import { DataTable } from "components/ui/data-table";
import { Input } from "components/ui/input";
import { DatePickerWithRange } from "components/ui/date-range-picker";
import { supabase } from "lib/supabase";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Download, X, Image, Eye, Presentation } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "components/ui/dialog";
import { Checkbox } from "components/ui/checkbox";
import * as XLSX from "xlsx";
import pptxgen from "pptxgenjs";

interface PDV {
  id: string;
  marca: string;
  ponto_extra_conquistado: boolean;
  fotos: string[];
  created_at: string;
  updated_at: string;
  rede?: string;
  loja?: string;
}

interface RowSelection {
  [key: string]: boolean;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
}

interface SupabasePDV {
  id: string;
  marca: string;
  ponto_extra_conquistado: boolean;
  fotos: string[];
  created_at: string;
  updated_at: string;
  loja: {
    nome: string;
    rede: {
      nome: string;
    };
  } | null;
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
          <DialogTitle>Fotos do PDV - {marca} ({new Date(data).toLocaleDateString('pt-BR')})</DialogTitle>
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

export default function PDVPage() {
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
  const [pdvData, setPdvData] = useState<PDV[]>([]);
  const [pdvCompleto, setPdvCompleto] = useState<PDV[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: "",
    dataInicio: null,
    dataFim: null,
  });
  const [selectedRows, setSelectedRows] = useState<PDV[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    setSelectedCount(selectedRows.length);
  }, [selectedRows]);

  useEffect(() => {
    loadPDV();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, pdvCompleto]);

  const loadPDV = async () => {
    try {
      setIsLoading(true);
      const { data: pdvData, error: pdvError } = await supabase
        .from("pdv")
        .select("*")
        .order('updated_at', { ascending: false });

      if (pdvError) {
        console.error("Erro ao buscar PDV:", pdvError);
        throw pdvError;
      }

      const formattedData = (pdvData || []).map(item => ({
        id: item.id,
        marca: (item.marca || '').toUpperCase(),
        ponto_extra_conquistado: item.ponto_extra_conquistado,
        fotos: item.fotos || [],
        created_at: item.created_at,
        updated_at: item.updated_at,
        rede: (item.rede || 'N/A').toUpperCase(),
        loja: (item.loja || 'N/A').toUpperCase()
      }));
      
      setPdvCompleto(formattedData);
      setPdvData(formattedData);
    } catch (error) {
      console.error("Erro ao carregar PDV:", error);
      toast.error("Erro ao carregar dados do PDV");
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let dadosFiltrados = [...pdvCompleto];

    if (filtros.busca) {
      const termoBusca = filtros.busca.toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(item => 
        item.marca.toLowerCase().includes(termoBusca)
      );
    }

    if (filtros.dataInicio && filtros.dataFim) {
      dadosFiltrados = dadosFiltrados.filter(item => {
        const dataItem = new Date(item.updated_at);
        return dataItem >= filtros.dataInicio! && dataItem <= filtros.dataFim!;
      });
    }

    setPdvData(dadosFiltrados);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este registro?")) {
      return;
    }

    try {
      const pdvToDelete = pdvData.find(pdv => pdv.id === id);
      if (!pdvToDelete?.fotos) return;

      // Excluir fotos do storage
      await Promise.all(pdvToDelete.fotos.map(async (fotoUrl) => {
        const fileName = fotoUrl.split('pdv-photos/')[1];
        await supabase.storage.from('pdv-photos').remove([fileName]);
      }));

      // Excluir registro do banco
      await supabase.from("pdv").delete().eq("id", id);
      
      toast.success("Registro excluído com sucesso!");
      loadPDV();
    } catch (error) {
      toast.error("Erro ao excluir registro");
    }
  };

const exportToExcel = () => {
    try {
      if (selectedRows.length === 0) {
        toast.error("Por favor, selecione pelo menos um item para exportar.");
        return;
      }

      const rowsToExport = selectedRows;
      const dadosExport = rowsToExport.map((item) => ({
        Data: new Date(item.updated_at).toLocaleDateString('pt-BR'),
        Rede: item.rede?.toUpperCase() || 'N/A',
        Loja: item.loja?.toUpperCase() || 'N/A',
        Marca: item.marca.toUpperCase(),
        "Ponto Extra": item.ponto_extra_conquistado ? "SIM" : "NÃO",
        "Quantidade de Fotos": Array.isArray(item.fotos) ? item.fotos.length : 0,
      }));

      const ws = XLSX.utils.json_to_sheet(dadosExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PDV");
      
      // Usar o XLSX.write para gerar o arquivo
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      
      // Converter para Blob e criar URL
      const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      // Criar link e fazer download
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_pdv_${new Date().toISOString().split('T')[0]}.xlsx`;
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

  const exportToPresentation = async (singlePdv?: PDV) => {
    const toastId = toast.loading("Gerando apresentação...");
    
    try {
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';
      
      // Define margens e espaçamentos padrão
      const MARGINS = {
        top: '5%',
        left: '5%',
        right: '5%',
        bottom: '5%'
      };
      
      const rowsToExport = singlePdv 
        ? [singlePdv] 
        : (selectedRows.length > 0 ? selectedRows : pdvData);

      toast.loading("Gerando apresentação...", { id: toastId });
      
      for (const pdv of rowsToExport) {
        const slide = pptx.addSlide();
        
        // Título com estilo melhorado
        slide.addText(`PDV - ${pdv.marca}`, {
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

        // Informações em formato de tabela sem bordas
        const infoData = [
          ['Data', new Date(pdv.updated_at).toLocaleDateString('pt-BR')],
          ['Rede', pdv.rede || 'N/A'],
          ['Loja', pdv.loja || 'N/A'],
          ['Marca', pdv.marca],
          ['Ponto Extra', pdv.ponto_extra_conquistado ? "SIM" : "NÃO"]
        ];

        // Adiciona cada linha de informação separadamente para melhor controle
        infoData.forEach((row, index) => {
          // Label (primeira coluna)
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

          // Valor (segunda coluna)
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

        // Adicionar fotos se existirem
        if (Array.isArray(pdv.fotos) && pdv.fotos.length > 0) {
          const photosPerRow = 3;
          const totalWidth = 90; // Largura total disponível em %
          const photoWidth = Math.floor(totalWidth / photosPerRow); // Divide igualmente o espaço
          const photoHeight = 45; // Altura fixa para todas as fotos
          const horizontalGap = 2; // Espaço pequeno entre as fotos
          const startY = 35; // Começa um pouco mais abaixo dos dados

          for (let i = 0; i < pdv.fotos.length; i++) {
            try {
              const foto = pdv.fotos[i];
              if (!foto) continue;

              const response = await fetch(foto);
              const blob = await response.blob();
              const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });

              // Calcular posição da foto
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

      // Gerar nome do arquivo
      const fileName = singlePdv 
        ? `pdv_${singlePdv.marca}_${new Date().toISOString().split('T')[0]}.pptx`
        : `pdv_geral_${new Date().toISOString().split('T')[0]}.pptx`;

      // Salvar arquivo
      await pptx.writeFile({ fileName });
      toast.success("Apresentação exportada com sucesso!", { id: toastId });
    } catch (error) {
      console.error("Erro ao exportar apresentação:", error);
      toast.error("Erro ao exportar apresentação", { id: toastId });
    }
  };

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      dataInicio: null,
      dataFim: null,
    });
  };

  const columns: ColumnDef<PDV>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            const allPageRows = table.getRowModel().rows.map(row => row.original);
            setSelectedRows(value ? allPageRows : []);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRows.some(item => item.id === row.original.id)}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            setSelectedRows(prev => {
              if (value) {
                return [...prev, row.original];
              }
              return prev.filter(item => item.id !== row.original.id);
            });
          }}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "updated_at",
      header: "Data",
      cell: ({ row }) => {
        const date = new Date(row.getValue("updated_at"));
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      },
    },
    {
      accessorKey: "marca",
      header: "Marca",
    },
    {
      accessorKey: "rede",
      header: "Rede",
    },
    {
      accessorKey: "loja",
      header: "Loja",
    },
    {
      accessorKey: "ponto_extra_conquistado",
      header: "Ponto Extra",
      cell: ({ row }) => (
        <span className={row.getValue("ponto_extra_conquistado") ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
          {row.getValue("ponto_extra_conquistado") ? "SIM" : "NÃO"}
        </span>
      ),
    },
    {
      accessorKey: "fotos",
      header: "Fotos",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          <span className="font-medium">{row.getValue("fotos")?.length || 0} foto(s)</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const pdv = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDialogState({
                isOpen: true,
                fotos: pdv.fotos,
                marca: pdv.marca,
                data: pdv.updated_at,
              })}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => exportToPresentation(pdv)}
            >
              <Presentation className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(pdv.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Relatório de PDV</h1>
        <div className="flex gap-2">
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              onClick={async () => {
                if (!window.confirm(`Tem certeza que deseja excluir ${selectedCount} registros?`)) {
                  return;
                }
                try {
                  for (const pdv of selectedRows) {
                    // Excluir fotos do storage
                    if (pdv.fotos) {
                      await Promise.all(pdv.fotos.map(async (fotoUrl) => {
                        const fileName = fotoUrl.split('pdv-photos/')[1];
                        await supabase.storage.from('pdv-photos').remove([fileName]);
                      }));
                    }
                    // Excluir registro do banco
                    await supabase.from("pdv").delete().eq("id", pdv.id);
                  }
                  toast.success(`${selectedCount} registros excluídos com sucesso!`);
                  loadPDV();
                  setSelectedRows([]);
                } catch (error) {
                  toast.error("Erro ao excluir registros");
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Selecionados ({selectedCount})
            </Button>
          )}
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
                if (selectedRows.length === pdvData.length) {
                  setSelectedRows([]);
                } else {
                  setSelectedRows([...pdvData]);
                }
              }}
            >
              {selectedRows.length === pdvData.length ? (
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
        data={pdvData}
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
