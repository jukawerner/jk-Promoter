"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Search,
  ShoppingCart,
  BarChart3,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const menuItems = [
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

  return (
    <motion.div
      initial={false}
      animate={{ width: 72 }}
      className="fixed left-0 top-0 h-full bg-white shadow-xl z-50 flex flex-col"
    >
      <div className="flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white"
        >
          <LayoutDashboard className="h-6 w-6" />
        </motion.div>
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
    </motion.div>
  );
}