import { supabase } from '@/lib/supabase';

export interface Produto {
  id: number;
  codigo_ean?: string;
  nome: string;
  familia: string;
  unidade: string;
  peso: number;
  validade: number;
  marca_id: number;
  created_at?: string;
  updated_at?: string;
}

export type CreateProdutoInput = Omit<Produto, 'id' | 'created_at' | 'updated_at'>;

export async function createProduto(data: CreateProdutoInput): Promise<Produto> {
  const { data: produto, error } = await supabase
    .from("produto")
    .insert([data])
    .select("*, marca(nome)")
    .single();

  if (error) throw error;
  return produto;
}

export async function getProdutos(): Promise<Produto[]> {
  const { data, error } = await supabase
    .from("produto")
    .select("*, marca(nome)")
    .order("nome");

  if (error) throw error;
  return data || [];
}

export async function updateProduto(id: number, data: Partial<CreateProdutoInput>): Promise<Produto> {
  const { data: produto, error } = await supabase
    .from("produto")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, marca(nome)")
    .single();

  if (error) throw error;
  return produto;
}

export async function deleteProduto(id: number): Promise<void> {
  const { error } = await supabase
    .from("produto")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Função para buscar marcas para o select
export async function getMarcas() {
  const { data, error } = await supabase
    .from("marca")
    .select("id, nome")
    .order("nome");

  if (error) throw error;
  return data || [];
}
