"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductForm } from "@/components/admin/products/product-form";
import { ImportModal } from "@/components/admin/products/import-modal";
import { createProduto, getProdutos, updateProduto, deleteProduto, Produto } from "@/lib/actions/produto";
import { toast } from "sonner";
import { Pencil, Trash2, Upload, Plus } from "lucide-react";

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
      const produtoData = {
        codigo_ean: data.codigo_ean,
        nome: data.nome,
        familia: data.familia,
        unidade: data.unidade,
        peso: Number(data.peso),
        validade: Number(data.validade),
        marca: data.marca
      };

      console.log('Dados a serem salvos:', produtoData);

      if (editingProduto) {
        await updateProduto(editingProduto.id, produtoData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await createProduto(produtoData);
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

  const handleImportProducts = async (produtos: any[]) => {
    try {
      setIsLoading(true);
      console.log('Produtos a serem importados:', produtos);
      const mappedProdutos = produtos.map(p => ({
        codigo_ean: p.codigo_ean,
        nome: p.nome,
        familia: p.familia,
        unidade: p.unidade,
        peso: p.peso,
        validade: p.validade,
        marca: p.marca
      }));

      console.log('Produtos mapeados:', mappedProdutos);

      for (const produto of mappedProdutos) {
        await createProduto(produto);
      }

      toast.success('Produtos importados com sucesso!');
      loadProdutos(); // Recarrega a lista após importação
    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      toast.error('Erro ao importar produtos');
    } finally {
      setIsLoading(false);
      setShowImportModal(false);
    }
  };

  const handleImportSuccess = async () => {
    setShowImportModal(false);
    await loadProdutos(); // Recarrega a lista após importação bem-sucedida
  };

  const filteredProdutos = produtos.filter((produto) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      produto.nome.toLowerCase().includes(searchLower) ||
      produto.marca.toLowerCase().includes(searchLower) ||
      produto.codigo_ean?.toLowerCase().includes(searchLower)
    );
  });

  if (showForm) {
    return (
      <div className="container mx-auto py-10">
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h1 className="text-2xl font-bold mb-4">
                {editingProduto ? "Editar Produto" : "Novo Produto"}
              </h1>
              <ProductForm
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingProduto(null);
                }}
                initialData={editingProduto ? {
                  codigo_ean: editingProduto.codigo_ean || '',
                  nome: editingProduto.nome,
                  familia: editingProduto.familia,
                  unidade: editingProduto.unidade as 'UN' | 'KG',
                  peso: editingProduto.peso,
                  validade: editingProduto.validade,
                  marca: editingProduto.marca
                } : undefined}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowImportModal(true)}
            variant="outline"
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Excel
          </Button>
          <Button
            onClick={() => {
              setEditingProduto(null);
              setShowForm(true);
            }}
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      <div className="flex-1 max-w-md">
        <Input
          placeholder="Pesquisar por produto ou marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Código EAN</th>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Marca</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProdutos.map((produto) => (
              <tr key={produto.id}>
                <td className="border px-4 py-2">{produto.codigo_ean}</td>
                <td className="border px-4 py-2">{produto.nome.toUpperCase()}</td>
                <td className="border px-4 py-2">{produto.marca.toUpperCase()}</td>
                <td className="border px-4 py-2">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onConfirm={async (produtos) => {
            await handleImportProducts(produtos);
            await handleImportSuccess();
          }}
        />
      )}
    </div>
  );
}
