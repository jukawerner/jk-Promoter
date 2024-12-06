"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BrandCard } from "@/components/admin/brands/brand-card";
import { BrandForm } from "@/components/admin/brands/brand-form";

export default function CadastroMarcas() {
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleAddBrand = (brandName: string) => {
    const newBrand = {
      id: Date.now(),
      name: brandName,
    };
    setBrands([...brands, newBrand]);
    setShowForm(false);
    toast.success("Marca adicionada com sucesso!");
  };

  const handleDeleteBrand = (id: number) => {
    setBrands(brands.filter(brand => brand.id !== id));
    toast.success("Marca removida com sucesso!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cadastro de Marcas</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Marca
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <BrandForm onSubmit={handleAddBrand} onCancel={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {brands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              onDelete={handleDeleteBrand}
            />
          ))}
        </AnimatePresence>
      </div>

      {brands.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Nenhuma marca cadastrada. Clique em "Nova Marca" para começar.
          </p>
        </div>
      )}
    </motion.div>
  );
}