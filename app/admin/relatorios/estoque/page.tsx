"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Download, Search, X } from "lucide-react";
import * as XLSX from "xlsx";

interface Estoque {
  id: number;
  rede: string;
  loja: string;
  marca: string;
  produto: string;
  estoque_fisico: number;
  estoque_virtual: number;
  created_at: string;
  updated_at: string;
}

interface Filtros {
  busca: string;
  dataInicio: Date | null;
  dataFim: Date | null;
}

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<Estoque[]>([]);
  const [estoqueCompleto, setEstoqueCompleto] = useState<Estoque[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [filtros, setFiltros] = useState<Filtros>({
    busca: "",
    dataInicio: null,
    dataFim: null,
  });

  useEffect(() => {
    loadEstoque();
  }, []);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, estoqueCompleto]);

  const loadEstoque = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("estoque")
        .select("*");

      if (error) {
        console.error("Erro detalhado do Supabase:", error);
        throw error;
      }
      
      setEstoqueCompleto(data || []);
      setEstoque(data || []);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      toast.error("Erro ao carregar estoque");
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let dadosFiltrados = [...estoqueCompleto];

    // Aplicar filtro de busca
    if (filtros.busca) {
      const termoBusca = filtros.busca.toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(item => 
        item.rede.toLowerCase().includes(termoBusca) ||
        item.loja.toLowerCase().includes(termoBusca) ||
        item.marca.toLowerCase().includes(termoBusca) ||
        item.produto.toLowerCase().includes(termoBusca)
      );
    }

    // Aplicar filtro de data
    if (filtros.dataInicio && filtros.dataFim) {
      dadosFiltrados = dadosFiltrados.filter(item => {
        const dataItem = new Date(item.updated_at);
        return dataItem >= filtros.dataInicio! && dataItem <= filtros.dataFim!;
      });
    }

    setEstoque(dadosFiltrados);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este item do estoque?")) {
      try {
        const { error } = await supabase
          .from("estoque")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast.success("Item excluído com sucesso!");
        loadEstoque();
      } catch (error) {
        console.error("Erro ao excluir item:", error);
        toast.error("Erro ao excluir item");
      }
    }
  };

  const exportToExcel = () => {
    try {
      const dadosExport = estoque.map((item) => ({
        Data: new Date(item.updated_at).toLocaleDateString('pt-BR'),
        Rede: item.rede.toUpperCase(),
        Loja: item.loja.toUpperCase(),
        Marca: item.marca.toUpperCase(),
        Produto: item.produto.toUpperCase(),
        "Estoque Físico": item.estoque_fisico.toLocaleString('pt-BR'),
        "Estoque Virtual": item.estoque_virtual.toLocaleString('pt-BR'),
      }));

      const ws = XLSX.utils.json_to_sheet(dadosExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Estoque");
      XLSX.writeFile(wb, "relatorio-estoque.xlsx");
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar relatório");
    }
  };

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      dataInicio: null,
      dataFim: null,
    });
  };

  const columns: ColumnDef<Estoque>[] = [
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
      accessorKey: "rede",
      header: "Rede",
      cell: ({ row }) => row.original.rede.toUpperCase(),
    },
    {
      accessorKey: "loja",
      header: "Loja",
      cell: ({ row }) => row.original.loja.toUpperCase(),
    },
    {
      accessorKey: "marca",
      header: "Marca",
      cell: ({ row }) => row.original.marca.toUpperCase(),
    },
    {
      accessorKey: "produto",
      header: "Produto",
      cell: ({ row }) => row.original.produto.toUpperCase(),
    },
    {
      accessorKey: "estoque_fisico",
      header: "Estoque Físico",
      cell: ({ row }) => {
        const numero = row.original.estoque_fisico;
        return numero.toLocaleString('pt-BR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
      },
    },
    {
      accessorKey: "estoque_virtual",
      header: "Estoque Virtual",
      cell: ({ row }) => {
        const numero = row.original.estoque_virtual;
        return numero.toLocaleString('pt-BR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
      },
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
        <h1 className="text-2xl font-bold">Relatório de Estoque</h1>
        <Button onClick={exportToExcel}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Excel
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Buscar</label>
            <Input
              placeholder="Buscar por rede, loja, marca ou produto..."
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
        data={estoque}
        onRowSelectionChange={setRowSelection}
        state={{ rowSelection }}
        loading={isLoading}
      />
    </div>
  );
}
