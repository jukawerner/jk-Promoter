"use client";

import { cn } from "lib/utils";
import { Button } from "components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/ui/tooltip";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  Clock,
  LogOut,
  Tag,
  Package,
  Building2,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { UserAvatar } from "components/user-avatar";

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
  {
    icon: AlertTriangle,
    label: "RNC",
    href: "/promotor/rnc",
  },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50"
      >
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Avatar */}
            <div className="flex items-center">
              <UserAvatar />
            </div>

            {/* Menu Items */}
            <nav className="flex items-center space-x-1 md:space-x-2 overflow-x-auto">
              {menuItems.map((item) => (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "w-9 h-9 md:w-10 md:h-10 rounded-xl relative group transition-all",
                        pathname === item.href 
                          ? "bg-rose-600 text-white hover:bg-rose-500" 
                          : "hover:bg-rose-50 text-gray-600 hover:text-rose-600"
                      )}
                      onClick={() => router.push(item.href)}
                    >
                      <item.icon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white border-0">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="flex items-center shrink-0">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 md:w-10 md:h-10 rounded-xl hover:bg-rose-50 group"
                    onClick={() => router.push("/")}
                  >
                    <LogOut className="h-5 w-5 text-gray-600 group-hover:text-rose-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-gray-900 text-white border-0">
                  Sair
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
