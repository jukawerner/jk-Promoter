"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductForm } from "@/components/admin/products/product-form";
import { ImportModal } from "@/components/admin/products/import-modal";
import { createProduto, getProdutos, updateProduto, deleteProduto, Produto } from "@/lib/actions/produto";
import { toast } from "sonner";
import { Pencil, Trash2, Upload, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      setIsLoading(true);
      const data = await getProdutos();
      setProdutos(data);
      setSelectedItems([]); // Clear selection when reloading
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredProdutos.map(p => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      toast.error("Selecione pelo menos um item para excluir");
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir ${selectedItems.length} produto(s)?`)) {
      return;
    }

    try {
      setIsLoading(true);
      for (const id of selectedItems) {
        await deleteProduto(id);
      }
      toast.success(`${selectedItems.length} produto(s) excluído(s) com sucesso!`);
      loadProdutos();
    } catch (error) {
      console.error("Erro ao excluir produtos:", error);
      toast.error("Erro ao excluir produtos");
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
          {selectedItems.length > 0 && (
            <Button
              onClick={handleDeleteSelected}
              variant="destructive"
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Selecionados ({selectedItems.length})
            </Button>
          )}
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

      <div className="flex-1 max-w-md mb-4">
        <Input
          placeholder="Pesquisar por produto ou marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="w-[40px] p-4">
                <Checkbox
                  checked={selectedItems.length === filteredProdutos.length && filteredProdutos.length > 0}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  aria-label="Selecionar todos"
                />
              </th>
              <th className="p-4 text-left font-medium text-gray-900">Código EAN</th>
              <th className="p-4 text-left font-medium text-gray-900">Nome</th>
              <th className="p-4 text-left font-medium text-gray-900">Marca</th>
              <th className="w-[100px] p-4 text-left font-medium text-gray-900">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProdutos.map((produto) => (
              <tr key={produto.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <Checkbox
                    checked={selectedItems.includes(produto.id)}
                    onCheckedChange={(checked) => handleSelectItem(produto.id, checked as boolean)}
                    aria-label={`Selecionar ${produto.nome}`}
                  />
                </td>
                <td className="p-4 text-sm text-gray-600">{produto.codigo_ean}</td>
                <td className="p-4 text-sm text-gray-900">{produto.nome}</td>
                <td className="p-4 text-sm text-gray-600">{produto.marca}</td>
                <td className="p-4">
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
