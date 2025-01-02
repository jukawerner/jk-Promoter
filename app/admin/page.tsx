"use client";

import Link from "next/link";
import { Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { Chart } from "components/ui/chart"; // Corrigindo a importação para usar a exportação nomeada
import { useEffect, useState } from "react";
import { supabase } from "lib/supabase";

interface EstoqueData {
  marca: string;
  estoque_fisico: number;
  estoque_virtual: number;
}

interface DataCurta {
  marca: string;
  quantidade: number;
}

export default function AdminPage() {
  const [estoqueData, setEstoqueData] = useState<EstoqueData[]>([]);
  const [dataCurta, setDataCurta] = useState<DataCurta[]>([]);
  const [pdvData, setPdvData] = useState<{marca: string, fotos: number}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("estoque")
        .select("marca, estoque_fisico, estoque_virtual")
        .order("marca");

      if (error) {
        console.error("Erro ao buscar dados:", error);
      } else if (data) {
        // Agrupa os estoques por marca
        const groupedData = data.reduce((acc: Record<string, {fisico: number, virtual: number}>, item) => {
          if (item.marca) {
            const current = acc[item.marca] || { fisico: 0, virtual: 0 };
            const fisico = typeof item.estoque_fisico === 'number' ? item.estoque_fisico : 0;
            const virtual = typeof item.estoque_virtual === 'number' ? item.estoque_virtual : 0;
            
            acc[item.marca] = {
              fisico: current.fisico + fisico,
              virtual: current.virtual + virtual
            };
          }
          return acc;
        }, {} as Record<string, {fisico: number, virtual: number}>);

        // Converte o objeto agrupado em array
        const formattedData = Object.entries(groupedData).map(([marca, estoques]) => ({
          marca,
          estoque_fisico: estoques.fisico,
          estoque_virtual: estoques.virtual
        }));

        setEstoqueData(formattedData);
      }
    };

    const fetchDataCurta = async () => {
      const { data, error } = await supabase
        .from("data_curta")
        .select("marca, quantidade")
        .order("marca");

      if (error) {
        console.error("Erro ao buscar dados de data curta:", error);
      } else if (data) {
        // Agrupa as quantidades por marca
        const groupedData = data.reduce((acc: Record<string, number>, item) => {
          acc[item.marca] = (acc[item.marca] || 0) + item.quantidade;
          return acc;
        }, {});

        // Converte o objeto agrupado em array
        const formattedData = Object.entries(groupedData).map(([marca, quantidade]) => ({
          marca,
          quantidade
        }));

        setDataCurta(formattedData);
      }
    };

    const fetchPdvData = async () => {
      console.log("Iniciando busca de dados PDV...");
      const { data, error } = await supabase
        .from("pdv")
        .select("marca, fotos")
        .order("marca");

      if (error) {
        console.error("Erro ao buscar dados de PDV:", error);
        return;
      }

      console.log("Dados brutos retornados:", data);
      
      if (!data || data.length === 0) {
        console.warn("Nenhum dado encontrado na tabela PDV");
        return;
      }

      // Conta as fotos por marca
      const countByMarca = data.reduce((acc: Record<string, number>, item: { marca: string, fotos: string[] }) => {
        if (item.marca && item.fotos) {
          const numFotos = Array.isArray(item.fotos) ? item.fotos.length : 0;
          acc[item.marca] = (acc[item.marca] || 0) + numFotos;
        }
        return acc;
      }, {} as Record<string, number>);

      const formattedData = Object.entries(countByMarca).map(([marca, count]) => ({
        marca,
        fotos: count
      }));

      console.log("Dados formatados para o gráfico:", formattedData);
      console.log("Labels:", formattedData.map(item => item.marca));
      console.log("Valores:", formattedData.map(item => item.fotos));
      setPdvData(formattedData);
    };

    fetchData();
    fetchDataCurta();
    fetchPdvData();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Administração</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gráficos de Análise Rápida */}
        <div className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">Relatório de Estoque</h2>
          <Chart 
            type="bar" 
            data={{
              labels: estoqueData.map(item => item.marca),
              datasets: [
                {
                  label: 'Estoque Físico',
                  data: estoqueData.map(item => item.estoque_fisico),
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                },
                {
                  label: 'Estoque Virtual',
                  data: estoqueData.map(item => item.estoque_virtual),
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  borderColor: 'rgba(255, 99, 132, 1)',
                  borderWidth: 1,
                },
              ],
            }} 
            options={{ responsive: true }} 
          />
          <div className="flex justify-center mt-4">
            <Link 
              href="/admin/relatorios/estoque"
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Ver Detalhes
            </Link>
          </div>
        </div>

        <div className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">Data Curta</h2>
          <Chart 
            type="bar" 
            data={{
              labels: dataCurta.map(item => item.marca),
              datasets: [{
                label: 'Quantidade',
                data: dataCurta.map(item => item.quantidade),
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
              }]
            }} 
            options={{ responsive: true }} 
          />
          <div className="flex justify-center mt-4">
            <Link 
              href="/admin/relatorios/data-curta"
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Ver Detalhes
            </Link>
          </div>
        </div>

        <div className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">Fotos por Marca</h2>
          <Chart 
            type="bar" 
            data={{
              labels: pdvData.map(item => item.marca),
              datasets: [{
                label: 'Fotos',
                data: pdvData.map(item => item.fotos),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              }]
            }} 
            options={{ responsive: true }} 
          />
          <div className="flex justify-center mt-4">
            <Link 
              href="/admin/relatorios/pdv"
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Ver Detalhes
            </Link>
          </div>
        </div>

        {/* Outros links de relatórios... */}
      </div>
    </div>
  );
}
