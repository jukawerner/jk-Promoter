import { supabase } from '@/lib/supabase';

export interface Rede {
  id: number;
  nome: string;
  created_at?: string;
  updated_at?: string;
}

export async function createRede(nome: string): Promise<Rede | null> {
  const { data, error } = await supabase
    .from('rede')
    .insert([{ nome }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar rede:', error);
    throw error;
  }

  return data;
}

export async function getRedes(): Promise<Rede[]> {
  const { data, error } = await supabase
    .from('rede')
    .select('*')
    .order('nome');

  if (error) {
    console.error('Erro ao buscar redes:', error);
    throw error;
  }

  return data || [];
}

export async function updateRede(id: number, nome: string): Promise<Rede | null> {
  const { data, error } = await supabase
    .from('rede')
    .update({ nome, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar rede:', error);
    throw error;
  }

  return data;
}

export async function deleteRede(id: number): Promise<void> {
  const { error } = await supabase
    .from('rede')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar rede:', error);
    throw error;
  }
}
