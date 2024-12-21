"use client";

import Link from "next/link";
import { Package } from "lucide-react";

export default function RelatoriosPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Relatórios</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/admin/relatorios/estoque"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500 text-white rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Estoque de Produto</h2>
              <p className="text-gray-600">Acompanhe o estoque físico dos produtos</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}