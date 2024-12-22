import { supabase } from "lib/supabase";

export interface Product {
  id: string;
  nome: string;
  marca: string;
  codigo_ean: string;
  marca_nome?: string;
}

export async function findProductByEAN(ean: string): Promise<Product | null> {
  try {
    console.log('Buscando produto com EAN:', ean);

    // Primeiro, vamos verificar se o produto existe
    const { data: checkData, error: checkError } = await supabase
      .from('produto')
      .select('codigo_ean')
      .eq('codigo_ean', ean);

    if (checkError) {
      console.error('Erro ao verificar produto:', checkError);
      throw checkError;
    }

    console.log('Resultado da verificação:', checkData);

    if (!checkData || checkData.length === 0) {
      console.log('Produto não encontrado com EAN:', ean);
      return null;
    }

    // Se encontrou o produto, busca com os detalhes da marca
    const { data, error } = await supabase
      .from('produto')
      .select(`
        id,
        nome,
        marca,
        codigo_ean,
        marca:marca (
          id,
          nome
        )
      `)
      .eq('codigo_ean', ean)
      .single();

    if (error) {
      console.error('Erro ao buscar detalhes do produto:', error);
      throw error;
    }

    console.log('Dados do produto encontrado:', data);

    if (data) {
      // Verifica se os dados da marca estão presentes
      if (!data.marca) {
        console.error('Marca não encontrada para o produto:', data);
      }

      return {
        ...data,
        marca_nome: data.marca?.nome || ''
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }
}
