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

interface DataCurta {
  id: string;
  marca: string;
  produto: string;
  quantidade: string;
  data_validade: string;
  created_at: string;
}

interface Filtros {
  busca: string;
  dataInicio: Date | null;
  dataFim: Date | null;
}

export default function DataCurtaPage() {
  const [dataCurta, setDataCurta] = useState<DataCurta[]>([]);
  const [dataCurtaCompleto, setDataCurtaCompleto] = useState<DataCurta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DataCurta[]>([]);
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
    loadDataCurta();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, dataCurtaCompleto]);

  const loadDataCurta = async () => {
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
            .from("data_curta")
            .select("*");

          if (error) throw error;
          setDataCurtaCompleto(data || []);
          setDataCurta(data || []);
          return;
        }

        // Se tiver marcas vinculadas, filtra por elas
        const marcasPermitidas = marcasData.map(m => m.marca.nome);
        const { data, error } = await supabase
          .from("data_curta")
          .select("*");

        if (error) throw error;

        const dadosFiltrados = data?.filter(item => 
          marcasPermitidas.includes(item.marca)
        ) || [];

        setDataCurtaCompleto(dadosFiltrados);
        setDataCurta(dadosFiltrados);
      } else {
        // Se não for admin, não mostra nada
        setDataCurtaCompleto([]);
        setDataCurta([]);
      }
    } catch (error) {
      console.error("Erro ao carregar data curta:", error);
      toast.error("Erro ao carregar data curta");
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let dadosFiltrados = [...dataCurtaCompleto];

    if (filtros.busca) {
      const termoBusca = filtros.busca.toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(item => 
        item.marca.toLowerCase().includes(termoBusca) ||
        item.produto.toLowerCase().includes(termoBusca)
      );
    }

    if (filtros.dataInicio && filtros.dataFim) {
      dadosFiltrados = dadosFiltrados.filter(item => {
        const dataItem = new Date(item.data_validade);
        return dataItem >= filtros.dataInicio! && dataItem <= filtros.dataFim!;
      });
    }

    setDataCurta(dadosFiltrados);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      try {
        const { error } = await supabase
          .from("data_curta")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast.success("Registro excluído com sucesso!");
        loadDataCurta();
      } catch (error) {
        console.error("Erro ao excluir registro:", error);
        toast.error("Erro ao excluir registro");
      }
    }
  };

  const exportToExcel = () => {
    try {
      const dadosExport = dataCurta.map((item) => ({
        "Data do Registro": new Date(item.created_at).toLocaleDateString('pt-BR'),
        Marca: item.marca.toUpperCase(),
        Produto: item.produto.toUpperCase(),
        Quantidade: (() => {
          const numero = parseFloat(item.quantidade);
          if (isNaN(numero)) return '0';
          
          if (Number.isInteger(numero)) {
            return numero.toLocaleString('pt-BR');
          }
          return numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        })(),
        "Data de Validade": new Date(item.data_validade).toLocaleDateString('pt-BR'),
      }));

      const ws = XLSX.utils.json_to_sheet(dadosExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Curta");
      XLSX.writeFile(wb, "relatorio-data-curta.xlsx");
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

  const columns: ColumnDef<DataCurta>[] = [
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
      accessorKey: "created_at",
      header: "Data do Registro",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
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
      accessorKey: "produto",
      header: "Produto",
      cell: ({ row }) => row.original.produto.toUpperCase(),
    },
    {
      accessorKey: "quantidade",
      header: "Quantidade",
      cell: ({ row }) => {
        const numero = parseFloat(row.original.quantidade);
        if (isNaN(numero)) return '0';
        
        if (Number.isInteger(numero)) {
          return numero.toLocaleString('pt-BR');
        }
        return numero.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      },
    },
    {
      accessorKey: "data_validade",
      header: "Data de Validade",
      cell: ({ row }) => {
        const date = new Date(row.original.data_validade);
        const hoje = new Date();
        const diasRestantes = Math.ceil((date.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        
        let className = 'px-2 py-1 rounded-full text-sm ';
        if (diasRestantes <= 7) {
          className += 'bg-red-100 text-red-800';
        } else if (diasRestantes <= 30) {
          className += 'bg-yellow-100 text-yellow-800';
        } else {
          className += 'bg-green-100 text-green-800';
        }

        return (
          <span className={className}>
            {date.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </span>
        );
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
        <h1 className="text-2xl font-bold">Relatório de Data Curta</h1>
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
                    await supabase.from("data_curta").delete().eq("id", item.id);
                  }
                  toast.success(`${selectedCount} registros excluídos com sucesso!`);
                  loadDataCurta();
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
              placeholder="Buscar por marca ou produto..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Período de Validade</label>
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
                if (selectedRows.length === dataCurta.length) {
                  setSelectedRows([]);
                } else {
                  setSelectedRows([...dataCurta]);
                }
              }}
            >
              {selectedRows.length === dataCurta.length ? (
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
        data={dataCurta}
        loading={isLoading}
      />
    </div>
  );
}
