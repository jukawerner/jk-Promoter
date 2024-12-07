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
  User,
  Camera,
  Search,
} from "lucide-react";

const menuItems = [
  {
    icon: Store,
    label: "Início",
    href: "/promotor",
  },
  {
    icon: ShoppingCart,
    label: "Estoque da Loja",
    href: "/promotor/pdv/estoque-loja",
  },
  {
    icon: Camera,
    label: "Ponto de Venda",
    href: "/promotor/pdv/ponto-de-venda",
  },
  {
    icon: Clock,
    label: "Data Curta",
    href: "/promotor/pdv/data-curta",
  },
  {
    icon: Search,
    label: "Pesquisa Preço",
    href: "/promotor/pdv/pesquisa-preco",
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-slate-900 text-white w-16 fixed left-0 top-0 bottom-0">
        <div className="flex-1 py-6 flex flex-col items-center gap-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-12 h-12 rounded-xl hover:bg-slate-800",
                      pathname.startsWith(item.href) && "bg-slate-800"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
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
                className="w-12 h-12 rounded-xl hover:bg-slate-800"
                onClick={() => router.push("/")}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
              Sair
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
