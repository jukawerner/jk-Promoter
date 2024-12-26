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
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { cn } from "lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/ui/tooltip";

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
  const [isPressed, setIsPressed] = useState(false);

  const handleCardClick = () => {
    onClick(); // Salva no localStorage
    router.push("/promotor/pdv/estoque-loja");
  };

  const formattedDate = format(new Date(store.ultimaVisita), "dd 'de' MMMM", {
    locale: ptBR,
  });

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="relative touch-pan-y"
    >
      <motion.div
        animate={{ scale: isPressed ? 0.98 : 1 }}
        className={cn(
          "bg-white p-3 md:p-4 rounded-xl border transition-all active:bg-gray-50",
          "hover:border-rose-100 hover:shadow-lg",
          "select-none",
          "active:shadow-inner active:border-rose-200"
        )}
        onClick={handleCardClick}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
      >
        {/* Status indicator */}
        <div className="absolute top-3 md:top-4 right-3 md:right-4">
          {store.status === "active" ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-green-600 hidden md:inline">
                Atualizada
              </span>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-amber-600 hidden md:inline">
                Pendente
              </span>
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
          )}
        </div>

        {/* Store info */}
        <div className="space-y-2 md:space-y-3">
          <div>
            <p className="text-sm font-medium text-rose-600">{store.rede}</p>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mt-1 pr-8">
              {store.loja}
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="h-4 w-4 mt-1 shrink-0" />
              <p className="text-sm whitespace-pre-line">{store.endereco}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <p className="text-sm">Última visita: {formattedDate}</p>
            </div>
          </div>

          {/* Brands preview */}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {store.marcas.slice(0, 3).map((marca) => (
                <img
                  key={marca.id}
                  src={marca.avatar}
                  alt={marca.nome}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white"
                />
              ))}
              {store.marcas.length > 3 && (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">
                    +{store.marcas.length - 3}
                  </span>
                </div>
              )}
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Active state overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: isPressed ? 1 : 0 }}
          className="absolute inset-0 bg-gray-100/50 rounded-xl pointer-events-none"
        />
      </motion.div>
    </motion.div>
  );
}
