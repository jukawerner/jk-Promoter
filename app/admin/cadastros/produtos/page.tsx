"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProdutoForm } from "@/components/admin/produtos/produto-form";
import { ImportModal } from "@/components/admin/produtos/import-modal";
import { DataTable } from "@/components/ui/data-table";
import { createProduto, getProdutos, updateProduto, deleteProduto } from "@/lib/actions/produto";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Upload } from "lucide-react";

interface Produto {
  id: number;
  codigo_ean: string;
  nome: string;
  familia: string;
  unidade: string;
  peso: number;
  validade: number;
  marca: { nome: string };
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      setIsLoading(true);
      const data = await getProdutos();
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingProduto) {
        await updateProduto(editingProduto.id, data);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await createProduto(data);
        toast.success("Produto criado com sucesso!");
      }
      setShowForm(false);
      setEditingProduto(null);
      loadProdutos();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto");
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteProduto(id);
        toast.success("Produto excluído com sucesso!");
        loadProdutos();
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        toast.error("Erro ao excluir produto");
      }
    }
  };

  const columns: ColumnDef<Produto>[] = [
    {
      accessorKey: "codigo_ean",
      header: "Código EAN",
    },
    {
      accessorKey: "nome",
      header: "Nome",
    },
    {
      accessorKey: "familia",
      header: "Família",
    },
    {
      accessorKey: "unidade",
      header: "Unidade",
    },
    {
      accessorKey: "peso",
      header: "Peso (g)",
    },
    {
      accessorKey: "validade",
      header: "Validade (dias)",
    },
    {
      accessorKey: "marca.nome",
      header: "Marca",
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const produto = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(produto)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(produto.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Excluir</span>
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredProdutos = produtos.filter((produto) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      produto.nome.toLowerCase().includes(searchLower) ||
      produto.familia.toLowerCase().includes(searchLower) ||
      produto.marca.nome.toLowerCase().includes(searchLower)
    );
  });

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">
            {editingProduto ? "Editar Produto" : "Novo Produto"}
          </h1>
          <ProdutoForm
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingProduto(null);
            }}
            initialData={editingProduto}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Produtos</h1>
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Pesquisar por produto, família ou marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar Excel
            </Button>
            <Button onClick={() => setShowForm(true)}>Novo Produto</Button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredProdutos}
        loading={isLoading}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={loadProdutos}
      />
    </div>
  );
}
