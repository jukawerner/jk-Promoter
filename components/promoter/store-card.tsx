"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StoreCardProps {
  store: {
    id: number;
    rede: string;
    loja: string;
    endereco: string;
    status: string;
    ultimaVisita: string;
    marcas: Array<{
      id: number;
      nome: string;
      avatar: string;
    }>;
  };
  onClick: () => void;
}

export function StoreCard({ store, onClick }: StoreCardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    setShowModal(true);
  };

  const handleStartWork = () => {
    router.push("/promotor/pdv/estoque-loja");
  };

  const formattedDate = format(new Date(store.ultimaVisita), "dd 'de' MMMM", {
    locale: ptBR,
  });

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative"
      >
        <motion.div
          className={cn(
            "bg-white p-6 rounded-xl border transition-all cursor-pointer",
            isHovered ? "shadow-lg border-rose-100" : "shadow-sm border-transparent"
          )}
          onClick={handleCardClick}
        >
          {/* Status indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-4 right-4">
                {store.status === "active" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {store.status === "active" 
                ? "Loja atualizada"
                : "Visita pendente"}
            </TooltipContent>
          </Tooltip>

          {/* Store info */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-rose-600">{store.rede}</p>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">
                {store.loja}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <p className="text-sm">{store.endereco}</p>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="h-4 w-4" />
                <p className="text-sm">Última visita: {formattedDate}</p>
              </div>
            </div>

            {/* Brands preview */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {store.marcas.slice(0, 3).map((marca) => (
                  <img
                    key={marca.id}
                    src={marca.avatar}
                    alt={marca.nome}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                ))}
                {store.marcas.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-medium">
                      +{store.marcas.length - 3}
                    </span>
                  </div>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Hover overlay */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-rose-50/5 rounded-xl"
          />
        </motion.div>

        {/* Modal de Início de Trabalhos */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Iniciar os Trabalhos</DialogTitle>
              <DialogDescription>
                Você está prestes a iniciar os trabalhos na loja {store.loja} da rede {store.rede}.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleStartWork} className="bg-rose-600 hover:bg-rose-700 text-white">
                Começar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
}