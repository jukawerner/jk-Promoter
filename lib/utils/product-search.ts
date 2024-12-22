import { supabase } from "lib/supabase";

export interface Product {
  id: string;
  nome: string;
  marca: string;
  codigo_ean: string;
}

export async function findProductByEAN(ean: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('produto')
      .select('id, nome, marca, codigo_ean')
      .eq('codigo_ean', ean)
      .single();

    if (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }
}
