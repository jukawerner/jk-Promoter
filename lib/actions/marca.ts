import { supabase } from '@/lib/supabase';

export interface Marca {
  id: number;
  nome: string;
  created_at?: string;
  updated_at?: string;
}

export async function createMarca(nome: string): Promise<Marca | null> {
  const { data, error } = await supabase
    .from('marca')
    .insert([{ nome }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar marca:', error);
    throw error;
  }

  return data;
}

export async function getMarcas(): Promise<Marca[]> {
  const { data, error } = await supabase
    .from('marca')
    .select('*')
    .order('nome');

  if (error) {
    console.error('Erro ao buscar marcas:', error);
    throw error;
  }

  return data || [];
}

export async function updateMarca(id: number, nome: string): Promise<Marca | null> {
  const { data, error } = await supabase
    .from('marca')
    .update({ nome, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar marca:', error);
    throw error;
  }

  return data;
}

export async function deleteMarca(id: number): Promise<void> {
  const { error } = await supabase
    .from('marca')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar marca:', error);
    throw error;
  }
}
