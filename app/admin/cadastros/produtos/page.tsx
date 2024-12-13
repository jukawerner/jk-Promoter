"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/products/product-form";
import { ProductCard } from "@/components/admin/products/product-card";
import { ProductFilter } from "@/components/admin/products/product-filter";
import { ExcelUpload } from "@/components/admin/products/excel-upload";

interface Product {
  id: number;
  nome: string;
  familia: string;
  unidade: string;
  peso: number;
  validade: number;
  marca: string;
}

// Dados de exemplo para teste
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    nome: "Chocolate ao Leite",
    familia: "Chocolates",
    unidade: "UN",
    peso: 100,
    validade: 180,
    marca: "Cacau Show"
  },
  {
    id: 2,
    nome: "Café Premium",
    familia: "Café",
    unidade: "KG",
    peso: 1000,
    validade: 365,
    marca: "Três Corações"
  },
  {
    id: 3,
    nome: "Biscoito Recheado",
    familia: "Biscoitos",
    unidade: "UN",
    peso: 140,
    validade: 120,
    marca: "Nestlé"
  }
];

export default function CadastroProdutos() {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({
    nome: "",
    familia: "",
    marca: "",
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const nomeMatch = product.nome.toLowerCase().includes(filters.nome.toLowerCase());
      const familiaMatch = product.familia.toLowerCase().includes(filters.familia.toLowerCase());
      const marcaMatch = product.marca.toLowerCase().includes(filters.marca.toLowerCase());
      
      return nomeMatch && familiaMatch && marcaMatch;
    });
  }, [products, filters]);

  const handleSaveProduct = (product: Omit<Product, "id">) => {
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...product, id: editingProduct.id } : p
      ));
      setEditingProduct(null);
    } else {
      setProducts([...products, { ...product, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleImportProducts = (importedProducts: Omit<Product, "id">[]) => {
    const newProducts = importedProducts.map(product => ({
      ...product,
      id: Date.now() + Math.random()
    }));
    
    // Adiciona os produtos e garante que a visualização esteja em cards
    setProducts(prev => [...prev, ...newProducts]);
    setShowForm(false);
    
    // Limpa os filtros para mostrar todos os produtos, incluindo os novos
    setFilters({
      nome: "",
      familia: "",
      marca: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Produtos</h1>
          <p className="text-gray-600 mt-2">Gerencie os produtos do sistema</p>
        </div>
        <div className="flex items-center gap-4">
          <ExcelUpload onProductsImported={handleImportProducts} />
          <Button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>
      </div>

      {!showForm && (
        <ProductFilter
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProductForm
              onSave={handleSaveProduct}
              onCancel={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
              initialData={editingProduct}
            />
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <ProductCard
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </motion.div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  {products.length === 0
                    ? "Nenhum produto cadastrado. Clique em \"Adicionar Produto\" para começar."
                    : "Nenhum produto encontrado com os filtros aplicados."}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
