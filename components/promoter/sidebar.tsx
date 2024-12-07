"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  ShoppingCart,
  Clock,
  LogOut,
  Tag,
  DollarSign,
  Package,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  {
    icon: Building2,
    label: "Início",
    href: "/promotor",
  },
  {
    icon: Package,
    label: "Estoque da Loja",
    href: "/promotor/pdv/estoque-loja",
  },
  {
    icon: Store,
    label: "Ponto de Venda",
    href: "/promotor/pdv/ponto-de-venda",
  },
  {
    icon: Clock,
    label: "Data Curta",
    href: "/promotor/pdv/data-curta",
  },
  {
    icon: Tag,
    label: "Pesquisa Preço",
    href: "/promotor/pdv/pesquisa-preco",
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="flex flex-col h-full bg-white text-gray-700 w-16 fixed left-0 top-0 bottom-0 shadow-lg"
      >
        <div className="flex-1 py-6 flex flex-col items-center gap-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-12 h-12 rounded-xl hover:bg-rose-50 relative group",
                      pathname.startsWith(item.href) && "bg-rose-50"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors",
                      pathname.startsWith(item.href) ? "text-rose-600" : "text-gray-600 group-hover:text-rose-600"
                    )} />
                    {pathname.startsWith(item.href) && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-rose-600 rounded-full"
                      />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white border-0">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </div>
        
        <div className="p-4 flex justify-center">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-rose-50 group"
                onClick={() => router.push("/")}
              >
                <LogOut className="h-5 w-5 text-gray-600 group-hover:text-rose-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-900 text-white border-0">
              Sair
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
