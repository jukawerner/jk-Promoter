"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { WhatsappButton } from "@/components/whatsapp-button";
import { StoreCard } from "@/components/promoter/store-card";
import { BrandsPage } from "@/components/promoter/brands-page";

// Dados mockados para exemplo
const mockStores = [
  {
    id: 1,
    rede: "Rede A",
    loja: "Loja A1",
    endereco: "Av. Paulista, 1000, São Paulo",
    marcas: [
      { id: 1, nome: "Marca A", avatar: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=64&h=64&fit=crop&q=80" },
      { id: 2, nome: "Marca B", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&q=80" },
    ]
  },
  {
    id: 2,
    rede: "Rede B",
    loja: "Loja B1",
    endereco: "Rua Augusta, 500, São Paulo",
    marcas: [
      { id: 1, nome: "Marca A", avatar: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=64&h=64&fit=crop&q=80" },
      { id: 3, nome: "Marca C", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=64&h=64&fit=crop&q=80" },
    ]
  },
];

export default function PromotorPage() {
  const [selectedStore, setSelectedStore] = useState<typeof mockStores[0] | null>(null);
  const [showBrands, setShowBrands] = useState(false);

  const handleStoreClick = (store: typeof mockStores[0]) => {
    setSelectedStore(store);
    setShowBrands(true);
  };

  const handleBack = () => {
    setSelectedStore(null);
    setShowBrands(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 p-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {showBrands ? `Marcas - ${selectedStore?.loja}` : "Minhas Lojas"}
          </h1>
          <WhatsappButton />
        </div>

        {showBrands ? (
          <BrandsPage
            store={selectedStore!}
            onBack={handleBack}
          />
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {mockStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onClick={() => handleStoreClick(store)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}