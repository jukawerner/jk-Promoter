"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "components/whatsapp-button";
import { StoreCard } from "components/promoter/store-card";
import { BrandsPage } from "components/promoter/brands-page";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import { Search, MapPin, Store, Building2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { supabase } from "lib/supabase";
import { toast } from "sonner";

interface Store {
  id: number;
  nome: string;
  rede: { nome: string };
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export default function PromotorPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [networks, setNetworks] = useState<string[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) {
        toast.error("Usuário não está logado");
        router.push("/");
        return false;
      }

      const { data: userData, error: userError } = await supabase
        .from("usuario")
        .select("tipo")
        .eq("telefone", phone)
        .single();

      if (userError || !userData || userData.tipo?.toUpperCase() !== "PROMOTOR") {
        toast.error("Acesso não autorizado");
        router.push("/");
        return false;
      }

      return true;
    };

    const loadStores = async () => {
      try {
        const isAuthorized = await checkAuth();
        if (!isAuthorized) return;

        const phone = localStorage.getItem("userPhone");
        const { data: userData, error: userError } = await supabase
          .from("usuario")
          .select("id")
          .eq("telefone", phone)
          .single();

        if (userError || !userData) {
          console.error("Erro ao buscar usuário:", userError);
          toast.error("Usuário não encontrado");
          return;
        }

        const { data: storesData, error: storesError } = await supabase
          .from("loja")
          .select(`
            *,
            rede:rede_id ( nome )
          `)
          .eq("promotor_id", userData.id);

        if (storesError) {
          console.error("Erro ao buscar lojas:", storesError);
          throw storesError;
        }

        if (!storesData || storesData.length === 0) {
          toast.info("Nenhuma loja encontrada para este promotor");
        }

        setStores(storesData || []);
        const uniqueNetworks = Array.from(new Set(storesData?.map(store => store.rede.nome) || []));
        setNetworks(uniqueNetworks);
      } catch (error) {
        console.error("Erro ao carregar lojas:", error);
        toast.error("Erro ao carregar lojas");
      } finally {
        setIsLoading(false);
      }
    };

    loadStores();
  }, [router]);

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = 
        store.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.endereco.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesNetwork = !selectedNetwork || store.rede.nome === selectedNetwork;
      return matchesSearch && matchesNetwork;
    });
  }, [searchQuery, selectedNetwork, stores]);

  const handleStoreClick = (store: Store) => {
    localStorage.setItem("redeSelected", store.rede.nome);
    localStorage.setItem("lojaSelected", store.nome);
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
      <div className="px-4 py-6 md:container md:mx-auto md:p-6 max-w-7xl">
        <div className="flex flex-col space-y-6">
          {/* Header Section */}
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-3 rounded-xl">
                <Store className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Minhas Lojas
                </h1>
                <p className="text-sm text-gray-500">
                  Visualize e gerencie todas as suas lojas
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 md:space-y-6"
            >
              {/* Filters Section */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por loja ou endereço..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-12 md:h-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                      <SelectTrigger className="w-full h-12 md:h-10 md:w-[200px]">
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
                        className="h-12 w-12 md:h-10 md:w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stores Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                <AnimatePresence>
                  {isLoading ? (
                    // Loading skeletons
                    Array.from({ length: 6 }).map((_, index) => (
                      <motion.div
                        key={`skeleton-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white rounded-xl h-[180px] md:h-[200px] animate-pulse"
                      />
                    ))
                  ) : filteredStores.length > 0 ? (
                    // Store cards
                    filteredStores.map((store) => (
                      <motion.div
                        key={store.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="touch-manipulation"
                      >
                        <StoreCard
                          store={{
                            id: store.id,
                            rede: store.rede.nome,
                            loja: store.nome,
                            endereco: [
                              store.endereco && store.bairro ? `${store.endereco}, ${store.bairro}` : store.endereco,
                              store.cidade && store.uf ? `${store.cidade} - ${store.uf}` : ''
                            ].filter(Boolean).join('\n'),
                            status: "pending",
                            ultimaVisita: new Date().toISOString(),
                            marcas: []
                          }}
                          onClick={() => handleStoreClick(store)}
                        />
                      </motion.div>
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
                      <p className="text-sm text-gray-500 mt-1">
                        Tente ajustar os filtros de busca
                      </p>
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
