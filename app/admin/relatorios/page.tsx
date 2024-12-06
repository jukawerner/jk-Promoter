"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart2, Box } from "lucide-react";

export default function RelatoriosPage() {
  const menuCards = [
    {
      title: "Estoque de Produto",
      icon: <Box className="h-8 w-8" />,
      href: "/admin/relatorios/estoque",
      description: "Acompanhe o estoque físico dos produtos",
      color: "bg-orange-500",
    },
    {
      title: "Estoque Virtual",
      icon: <BarChart2 className="h-8 w-8" />,
      href: "/admin/relatorios/estoque-virtual",
      description: "Visualize o estoque virtual e previsões",
      color: "bg-teal-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Relatórios</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center text-white mb-4`}>
                {card.icon}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {card.title}
              </h2>
              <p className="text-gray-600">
                {card.description}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}