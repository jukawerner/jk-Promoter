import { supabase } from "lib/supabase/client";

export async function getLojasPorMarca() {
  const { data: lojas, error } = await supabase
    .from("lojas")
    .select("id, nome, marca, preenchida");

  if (error) {
    console.error("Erro ao buscar lojas:", error);
    return [];
  }

  // Agrupar lojas por marca
  const lojasPorMarca = lojas.reduce<Record<string, { total: number; preenchidas: number }>>((acc, loja) => {
    if (!loja?.marca) return acc;
    
    if (!acc[loja.marca]) {
      acc[loja.marca] = {
        total: 0,
        preenchidas: 0
      };
    }
    
    acc[loja.marca]!.total++;
    if (loja.preenchida) {
      acc[loja.marca]!.preenchidas++;
    }

    return acc;
  }, {});

  // Transformar em array para o gráfico
  return Object.entries(lojasPorMarca).map(([marca, dados]) => ({
    marca,
    total: dados?.total || 0,
    preenchidas: dados?.preenchidas || 0
  }));
}
