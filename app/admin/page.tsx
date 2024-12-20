"use client";

import { motion } from "framer-motion";

export default function AdminPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Painel do Administrador
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Visão Geral</h2>
          <p className="text-gray-600">
            Bem-vindo ao painel administrativo do JK-Promoter.
          </p>
        </div>
        
        <a href="/admin/cadastro-roteiro" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4">Cadastros de Roteiro</h2>
            <p className="text-gray-600">
              Gerencie e otimize roteiros de visitas com mapa interativo.
            </p>
          </div>
        </a>
      </div>
    </motion.div>
  );
}