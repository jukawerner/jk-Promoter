"use client";

import { useState, useEffect } from "react";
import { Button } from "components/ui/button";
import { Checkbox } from "components/ui/checkbox";
import { DataTable } from "components/ui/data-table";
import { Input } from "components/ui/input";
import { DatePickerWithRange } from "components/ui/date-range-picker";
import { supabase } from "lib/supabase";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Download, X } from "lucide-react";
import * as XLSX from "xlsx";

interface PesquisaPreco {
  id: string;
  rede: string;
  loja: string;
  marca: string;
  produto: string;
  preco: string;
  promocao: boolean;
  created_at: string;
  updated_at: string;
}

interface Filtros {
  busca: string;
  dataInicio: Date | null;
  dataFim: Date | null;
}

export default function PesquisaPrecoPage() {
  const [pesquisaPreco, setPesquisaPreco] = useState<PesquisaPreco[]>([]);
  const [pesquisaPrecoCompleto, setPesquisaPrecoCompleto] = useState<PesquisaPreco[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<PesquisaPreco[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    setSelectedCount(selectedRows.length);
  }, [selectedRows]);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: "",
    dataInicio: null,
    dataFim: null,
  });

  useEffect(() => {
    loadPesquisaPreco();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, pesquisaPrecoCompleto]);

  const loadPesquisaPreco = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("pesquisa_preco")
        .select("*")
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Erro detalhado do Supabase:", error);
        throw error;
      }
      
      setPesquisaPrecoCompleto(data || []);
      setPesquisaPreco(data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let dadosFiltrados = [...pesquisaPrecoCompleto];

    if (filtros.busca) {
      const termoBusca = filtros.busca.toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(item => 
        item.rede.toLowerCase().includes(termoBusca) ||
        item.loja.toLowerCase().includes(termoBusca) ||
        item.marca.toLowerCase().includes(termoBusca) ||
        item.produto.toLowerCase().includes(termoBusca)
      );
    }

    if (filtros.dataInicio && filtros.dataFim) {
      dadosFiltrados = dadosFiltrados.filter(item => {
        const dataItem = new Date(item.updated_at);
        return dataItem >= filtros.dataInicio! && dataItem <= filtros.dataFim!;
      });
    }

    setPesquisaPreco(dadosFiltrados);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      try {
        const { error } = await supabase
          .from("pesquisa_preco")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast.success("Registro excluído com sucesso!");
        loadPesquisaPreco();
      } catch (error) {
        console.error("Erro ao excluir registro:", error);
        toast.error("Erro ao excluir registro");
      }
    }
  };

  const exportToExcel = () => {
    try {
      const dadosExport = pesquisaPreco.map((item) => ({
        Data: new Date(item.updated_at).toLocaleDateString('pt-BR'),
        Rede: item.rede.toUpperCase(),
        Loja: item.loja.toUpperCase(),
        Marca: item.marca.toUpperCase(),
        Produto: item.produto.toUpperCase(),
        "Preço": parseFloat(item.preco).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        "Promo": item.promocao ? "Sim" : "Não"
      }));

      const ws = XLSX.utils.json_to_sheet(dadosExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pesquisa de Preços");
      XLSX.writeFile(wb, "relatorio-pesquisa-precos.xlsx");
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

  const columns: ColumnDef<PesquisaPreco>[] = [
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
          aria-label="Selecionar tudo"
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
      accessorKey: "preco",
      header: "Preço",
      cell: ({ row }) => {
        const preco = parseFloat(row.original.preco);
        return preco.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      },
    },
    {
      accessorKey: "promocao",
      header: "Promo",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          row.original.promocao 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.original.promocao ? "Sim" : "Não"}
        </span>
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
        <h1 className="text-2xl font-bold">Relatório de Pesquisa de Preços</h1>
        <div className="flex gap-2">
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              onClick={async () => {
                if (!window.confirm(`Tem certeza que deseja excluir ${selectedCount} registros?`)) {
                  return;
                }
                try {
                  for (const item of selectedRows) {
                    await supabase.from("pesquisa_preco").delete().eq("id", item.id);
                  }
                  toast.success(`${selectedCount} registros excluídos com sucesso!`);
                  loadPesquisaPreco();
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
          <Button onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
            {selectedCount > 0 && ` (${selectedCount} selecionados)`}
          </Button>
        </div>
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
        <div className="flex justify-between gap-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (selectedRows.length === pesquisaPreco.length) {
                  setSelectedRows([]);
                } else {
                  setSelectedRows([...pesquisaPreco]);
                }
              }}
            >
              {selectedRows.length === pesquisaPreco.length ? (
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
        data={pesquisaPreco}
        loading={isLoading}
      />
    </div>
  );
}
