"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WhatsappButton } from "components/whatsapp-button";
import { StoreCard } from "components/promoter/store-card";
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
import { supabase } from "@/lib/supabase/client";
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
  const [selectedNetwork, setSelectedNetwork] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [networks, setNetworks] = useState<string[]>([]);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const userPhone = localStorage.getItem("userPhone");

        if (!userPhone) {
          toast.error("Usuário não está logado");
          router.push("/");
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from("usuario")
          .select("id")
          .eq("telefone", userPhone)
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

    if (!localStorage.getItem("userPhone")) {
      toast.error("Usuário não está logado");
      router.push("/");
    } else {
      loadStores();
    }
  }, [router]);

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch =
        !searchQuery ||
        store.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.endereco.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.bairro.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.cidade.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesNetwork =
        !selectedNetwork || selectedNetwork === 'all' || store.rede.nome === selectedNetwork;

      return matchesSearch && matchesNetwork;
    });
  }, [stores, searchQuery, selectedNetwork]);

  const handleStoreClick = (store: Store) => {
    localStorage.setItem("redeSelected", store.rede.nome);
    localStorage.setItem("lojaSelected", store.nome);
    router.push("/promotor/pdv/estoque-loja");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Minhas Lojas</h1>
        <p className="text-gray-600">
          Selecione uma loja para acessar as funcionalidades
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, endereço, bairro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full md:w-64">
          <Select
            value={selectedNetwork}
            onValueChange={setSelectedNetwork}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por rede" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as redes</SelectItem>
              {networks.map((network) => (
                <SelectItem key={network} value={network}>
                  {network}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(searchQuery || selectedNetwork !== 'all') && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery("");
              setSelectedNetwork("all");
            }}
            className="w-full md:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-48 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredStores.map((store) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <StoreCard
                  store={{
                    id: store.id,
                    rede: store.rede.nome,
                    loja: store.nome,
                    endereco: [
                      store.endereco,
                      store.bairro,
                      store.cidade,
                      store.uf,
                    ].filter(Boolean).join('\n'),
                    status: "pending",
                    ultimaVisita: new Date().toISOString(),
                  }}
                  onClick={() => handleStoreClick(store)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <WhatsappButton />
    </div>
  );
}
