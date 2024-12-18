"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ClipboardList, Users, Building, Package, Network } from "lucide-react";
import * as XLSX from 'xlsx';

export default function CadastrosPage() {
  const menuCards = [
    {
      title: "Cadastro de Produtos",
      icon: <Package className="h-8 w-8" />,
      href: "/admin/cadastros/produtos",
      description: "Gerencie os produtos do sistema",
      color: "bg-orange-500",
    },
    {
      title: "Cadastro de Marcas",
      icon: <ClipboardList className="h-8 w-8" />,
      href: "/admin/cadastros/marcas",
      description: "Gerencie as marcas disponíveis no sistema",
      color: "bg-blue-500",
    },
    {
      title: "Cadastro de Redes",
      icon: <Network className="h-8 w-8" />,
      href: "/admin/cadastros/redes",
      description: "Gerencie as redes de lojas do sistema",
      color: "bg-indigo-500",
    },
    {
      title: "Cadastro de Lojas",
      icon: <Building className="h-8 w-8" />,
      href: "/admin/cadastros/lojas",
      description: "Gerencie as lojas e seus detalhes",
      color: "bg-green-500",
    },
    {
      title: "Cadastro de Usuário",
      icon: <Users className="h-8 w-8" />,
      href: "/admin/cadastros/promotores",
      description: "Gerencie os usuários do sistema",
      color: "bg-purple-500",
    },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const formattedData = jsonData.map((row) => {
                return Object.fromEntries(
                    Object.entries(row).map(([key, value]) => [
                        key,
                        typeof value === 'string' ? value.toUpperCase() : typeof value === 'number' ? Number(value).toFixed(2) : value,
                    ])
                );
            });

            console.log(formattedData); // Aqui você pode atualizar o estado ou fazer o que precisar com os dados formatados
        };
        reader.readAsArrayBuffer(file);
    }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cadastros</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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