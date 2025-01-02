"use client";

import Link from "next/link";
import { Package, Calendar, Store, DollarSign, AlertTriangle } from "lucide-react";

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

        <Link 
          href="/admin/relatorios/data-curta"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500 text-white rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Data Curta</h2>
              <p className="text-gray-600">Monitore produtos próximos ao vencimento</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/admin/relatorios/pdv"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500 text-white rounded-lg">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Ponto de Venda</h2>
              <p className="text-gray-600">Visualize os registros de PDV e pontos extras</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/admin/relatorios/pesquisa-preco"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 text-white rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Pesquisa de Preços</h2>
              <p className="text-gray-600">Acompanhe os preços dos produtos no mercado</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/admin/relatorios/rnc"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500 text-white rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">RNC</h2>
              <p className="text-gray-600">Relatório de Não Conformidade</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/admin/relatorios/lojas-marcas"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 text-white rounded-lg">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Lojas por Marca</h2>
              <p className="text-gray-600">Distribuição de lojas por marca</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
