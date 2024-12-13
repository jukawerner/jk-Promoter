"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { WhatsappButton } from "@/components/whatsapp-button";
import { StoreCard } from "@/components/promoter/store-card";
import { BrandsPage } from "@/components/promoter/brands-page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Store, Building2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dados mockados para exemplo
const mockStores = [
  {
    id: 1,
    rede: "Rede A",
    loja: "Loja A1",
    endereco: "Av. Paulista, 1000, São Paulo",
    status: "active",
    ultimaVisita: "2024-12-05",
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
    status: "pending",
    ultimaVisita: "2024-12-04",
    marcas: [
      { id: 1, nome: "Marca A", avatar: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=64&h=64&fit=crop&q=80" },
      { id: 3, nome: "Marca C", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=64&h=64&fit=crop&q=80" },
    ]
  },
];

const networks = Array.from(new Set(mockStores.map(store => store.rede)));

export default function PromotorPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useState(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  });

  const filteredStores = useMemo(() => {
    return mockStores.filter(store => {
      const matchesSearch = 
        store.loja.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.endereco.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesNetwork = !selectedNetwork || store.rede === selectedNetwork;
      return matchesSearch && matchesNetwork;
    });
  }, [searchQuery, selectedNetwork]);

  const handleStoreClick = (store: typeof mockStores[0]) => {
    localStorage.setItem("redeSelected", store.rede);
    localStorage.setItem("lojaSelected", store.loja);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedNetwork("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-3 rounded-xl">
                <Store className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Minhas Lojas
                </h1>
                <p className="text-gray-500 text-sm">
                  Visualize e gerencie todas as suas lojas
                </p>
              </div>
            </div>
            <WhatsappButton />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Filters Section */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por loja ou endereço..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filtrar por rede" />
                    </SelectTrigger>
                    <SelectContent>
                      {networks.map((network) => (
                        <SelectItem key={network} value={network}>
                          {network}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(searchQuery || selectedNetwork) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearFilters}
                      className="h-10 w-10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Stores Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {isLoading ? (
                    // Loading skeletons
                    Array.from({ length: 6 }).map((_, index) => (
                      <motion.div
                        key={`skeleton-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white rounded-xl h-[200px] animate-pulse"
                      />
                    ))
                  ) : filteredStores.length > 0 ? (
                    // Store cards
                    filteredStores.map((store) => (
                      <StoreCard
                        key={store.id}
                        store={store}
                        onClick={() => handleStoreClick(store)}
                      />
                    ))
                  ) : (
                    // Empty state
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full flex flex-col items-center justify-center py-12 text-center"
                    >
                      <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Nenhuma loja encontrada
                      </h3>
                      <p className="text-gray-500 mt-1">
                        Tente ajustar seus filtros de busca
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        className="mt-4"
                      >
                        Limpar filtros
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}