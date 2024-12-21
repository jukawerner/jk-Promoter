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

      const { data: lojaData, error: lojaError } = await supabase
        .from("loja")
        .select("id, nome, rede:rede_id(nome)");

      if (lojaError) {
        console.error("Erro ao buscar lojas:", lojaError);
        throw lojaError;
      }

      const lojaMap = new Map(lojaData.map(loja => [
        loja.id,
        { nome: loja.nome, rede: loja.rede?.nome }
      ]));

      const formattedData = (pdvData || []).map(item => ({
        id: item.id,
        marca: item.marca,
        ponto_extra_conquistado: item.ponto_extra_conquistado,
        fotos: item.fotos || [],
        created_at: item.created_at,
        updated_at: item.updated_at,
        rede: lojaMap.get(item.loja_id)?.rede || 'N/A',
        loja: lojaMap.get(item.loja_id)?.nome || 'N/A'
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
    if (window.confirm("Tem certeza que deseja excluir este registro de PDV?")) {
      try {
        const { error } = await supabase
          .from("pdv")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast.success("Registro excluído com sucesso!");
        loadPDV();
      } catch (error) {
        console.error("Erro ao excluir registro:", error);
        toast.error("Erro ao excluir registro");
      }
    }
  };

  const exportToExcel = () => {
    try {
      const dadosExport = pdvData.map((item) => ({
        Data: new Date(item.updated_at).toLocaleDateString('pt-BR'),
        Rede: item.rede?.toUpperCase() || 'N/A',
        Loja: item.loja?.toUpperCase() || 'N/A',
        Marca: item.marca.toUpperCase(),
        "Ponto Extra": item.ponto_extra_conquistado ? "SIM" : "NÃO",
        "Quantidade de Fotos": item.fotos?.length || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(dadosExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PDV");
      XLSX.writeFile(wb, "relatorio-pdv.xlsx");
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar relatório");
    }
  };

  const exportToPowerPoint = async () => {
    try {
      const pptx = new pptxgen();
      
      // Agrupar dados por marca
      const groupedByMarca: Record<string, PDV[]> = {};
      pdvData.forEach(item => {
        const marca = item.marca || 'Sem Marca';
        if (!groupedByMarca[marca]) {
          groupedByMarca[marca] = [];
        }
        groupedByMarca[marca].push(item);
      });

      // Para cada marca
      for (const [marca, items] of Object.entries(groupedByMarca)) {
        // Criar slide de título para a marca
        const titleSlide = pptx.addSlide();
        titleSlide.addText(marca.toUpperCase(), {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 1,
          align: "center",
          bold: true,
          color: "363636"
        });

        // Para cada item da marca
        for (const item of items) {
          if (!item.fotos) continue;
          
          // Para cada foto do item
          for (const foto of item.fotos) {
            const slide = pptx.addSlide();
            
            // Adicionar foto
            slide.addImage({
              path: foto,
              x: 0.5,
              y: 0.5,
              w: 9,
              h: 5,
              sizing: { type: "contain", w: 9, h: 5 }
            });

            // Adicionar informações
            const textContent = [
              `Data: ${new Date(item.updated_at).toLocaleDateString('pt-BR')}`,
              ` | Rede: ${item.rede}`,
              ` | Loja: ${item.loja}`,
              ` | Marca: ${item.marca}`,
              ` | Ponto Extra: ${item.ponto_extra_conquistado ? 'SIM' : 'NÃO'}`
            ].join("");

            slide.addText(textContent, {
              x: 0.5,
              y: 6,
              w: 9,
              h: 0.5,
              align: "center",
              color: "363636",
              fill: { color: "F1F1F1" }
            });
          }
        }
      }

      // Salvar apresentação
      await pptx.writeFile({ fileName: "apresentacao-pdv.pptx" });
      toast.success("Apresentação exportada com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar apresentação:", error);
      toast.error("Erro ao exportar apresentação");
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
      accessorKey: "updated_at",
      header: "Data",
      cell: ({ row }) => {
        const date = new Date(row.original.updated_at);
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
      cell: ({ row }) => row.original.marca.toUpperCase(),
    },
    {
      accessorKey: "ponto_extra_conquistado",
      header: "Ponto Extra",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          row.original.ponto_extra_conquistado 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.original.ponto_extra_conquistado ? 'SIM' : 'NÃO'}
        </span>
      ),
    },
    {
      accessorKey: "fotos",
      header: "Fotos",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Image className="w-4 h-4 mr-2" />
          {row.original.fotos?.length || 0} foto(s)
        </div>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDialogState({
                isOpen: true,
                fotos: row.original.fotos || [],
                marca: row.original.marca,
                data: row.original.updated_at
              })}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row.original.id)}
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Relatório de PDV</h1>
        <div className="flex gap-2">
          <Button onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={exportToPowerPoint} variant="secondary">
            <Presentation className="w-4 h-4 mr-2" />
            Exportar Apresentação
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
        <div className="flex justify-end gap-2">
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
