"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  User,
  Clock,
  Refrigerator,
} from "lucide-react";

const menuItems = [
  {
    icon: Store,
    label: "Início",
    href: "/promotor",
  },
  {
    icon: Refrigerator,
    label: "Ponto de Venda",
    href: "/promotor/pdv/ponto-de-venda",
  },
  {
    icon: Clock,
    label: "Data Curta",
    href: "/promotor/pdv/data-curta",
  },
  {
    icon: ShoppingCart,
    label: "Estoque da Loja",
    href: "/promotor/pdv/estoque-loja",
  },
  {
    icon: BarChart3,
    label: "Relatórios",
    href: "/promotor/relatorios",
  },
  {
    icon: Calendar,
    label: "Agenda",
    href: "/promotor/agenda",
  },
  {
    icon: Settings,
    label: "Configurações",
    href: "/promotor/configuracoes",
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-slate-900 text-white w-16 fixed left-0 top-0 bottom-0">
        <div className="p-4 flex justify-center">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full p-0 hover:bg-slate-800"
                onClick={() => router.push("/promotor/perfil")}
              >
                <Avatar>
                  <AvatarImage src="/avatar-placeholder.jpg" alt="Promotor" />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
              Meu Perfil
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1 py-6 flex flex-col items-center gap-4">
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
        </div>
        
        <div className="p-4 flex justify-center">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-slate-800"
                onClick={() => router.push("/login")}
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
