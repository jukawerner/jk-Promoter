"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  ClipboardList,
  Search,
  ShoppingCart,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/user-avatar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Sidebar() {
  const router = useRouter();
  const menuItems = [
    {
      icon: <Home className="h-5 w-5" />,
      title: "Admin",
      href: "/admin",
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      title: "Cadastros",
      href: "/admin/cadastros",
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Pesquisa de Preços",
      href: "/admin/pesquisa-precos",
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      title: "Execução PDV",
      href: "/admin/execucao-pdv",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Relatórios",
      href: "/admin/relatorios",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("userPhone");
    toast.success("Logout realizado com sucesso!");
    router.push("/");
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: 72 }}
      className="fixed left-0 top-0 h-full bg-white shadow-xl z-50 flex flex-col"
    >
      <div className="flex items-center justify-center p-4">
        <UserAvatar />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <TooltipProvider>
          {menuItems.map((item) => (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  )}
                >
                  {item.icon}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 text-white">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      <div className="p-4">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center justify-center p-3 w-full text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                )}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-900 text-white">
              <p>Sair</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
}
