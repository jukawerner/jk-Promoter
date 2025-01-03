"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Download, Search, X } from "lucide-react";
import * as XLSX from "xlsx";
import { useUserPermissions } from "@/hooks/useUserPermissions";

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
  const { isFullAdmin, userMarcas } = useUserPermissions();
  const [estoque, setEstoque] = useState<Estoque[]>([]);
  const [estoqueCompleto, setEstoqueCompleto] = useState<Estoque[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Estoque[]>([]);
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
    loadEstoque();
  }, []);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, estoqueCompleto]);

  const loadEstoque = async () => {
    try {
      setIsLoading(true);

      // Busca as marcas do usuário
      const phone = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userPhone="))
        ?.split("=")[1];

      if (!phone) {
        toast.error("Usuário não está logado");
        return;
      }

      // Busca os dados do usuário
      const { data: userData, error: userError } = await supabase
        .from("usuario")
        .select("id, tipo")
        .eq("telefone", phone)
        .single();

      if (userError || !userData) {
        console.error("Erro ao buscar usuário:", userError);
        return;
      }

      // Se for admin completo, não filtra por marca
      if (userData.tipo === "Admin") {
        const { data: marcasData } = await supabase
          .from("promoter_marca")
          .select("marca:marca_id(nome)")
          .eq("promoter_id", userData.id);

        // Se não tiver marcas vinculadas, é admin completo
        if (!marcasData || marcasData.length === 0) {
          const { data, error } = await supabase
            .from("estoque")
            .select("*");

          if (error) throw error;
          setEstoqueCompleto(data || []);
          setEstoque(data || []);
          return;
        }

        // Se tiver marcas vinculadas, filtra por elas
        const marcasPermitidas = marcasData.map(m => m.marca.nome);
        const { data, error } = await supabase
          .from("estoque")
          .select("*");

        if (error) throw error;

        const dadosFiltrados = data?.filter(item => 
          marcasPermitidas.includes(item.marca)
        ) || [];

        setEstoqueCompleto(dadosFiltrados);
        setEstoque(dadosFiltrados);
      } else {
        // Se não for admin, não mostra nada
        setEstoqueCompleto([]);
        setEstoque([]);
      }
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
      accessorKey: "estoque_fisico",
      header: "Estoque Físico",
      cell: ({ row }) => row.original.estoque_fisico.toLocaleString('pt-BR'),
    },
    {
      accessorKey: "estoque_virtual",
      header: "Estoque Virtual",
      cell: ({ row }) => row.original.estoque_virtual.toLocaleString('pt-BR'),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Relatório de Estoque</h1>
        <p className="text-gray-600">
          Visualize e exporte os dados de estoque das lojas
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por rede, loja, marca ou produto..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full md:w-auto">
          <DatePickerWithRange
            value={{
              from: filtros.dataInicio,
              to: filtros.dataFim,
            }}
            onChange={(range) =>
              setFiltros({
                ...filtros,
                dataInicio: range?.from || null,
                dataFim: range?.to || null,
              })
            }
          />
        </div>
        {(filtros.busca || filtros.dataInicio || filtros.dataFim) && (
          <Button
            variant="ghost"
            onClick={limparFiltros}
            className="w-full md:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        )}
        <Button onClick={exportToExcel} className="w-full md:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={estoque}
        loading={isLoading}
      />
    </div>
  );
}
