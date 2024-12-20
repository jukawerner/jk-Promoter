import { supabase } from '@/lib/supabase';
import { Store, StoreFormData } from '@/types/store';

export async function getLojas(): Promise<Store[]> {
  const { data, error } = await supabase
    .from("loja")
    .select(`
      *,
      usuario:promotor_id (
        id,
        nome,
        apelido,
        avatar_url
      ),
      rede:rede_id (
        id,
        nome
      )
    `)
    .order("nome");

  if (error) {
    console.error('Erro ao buscar lojas:', error);
    throw error;
  }

  return data || [];
}

export async function createLoja(data: StoreFormData): Promise<Store> {
  const { data: loja, error } = await supabase
    .from("loja")
    .insert(data)
    .select(`
      *,
      usuario:promotor_id (
        id,
        nome,
        apelido,
        avatar_url
      ),
      rede:rede_id (
        id,
        nome
      )
    `)
    .single();

  if (error) {
    console.error('Erro ao criar loja:', error);
    throw error;
  }

  return loja;
}

export async function updateLoja(id: number, data: StoreFormData): Promise<Store> {
  const { data: loja, error } = await supabase
    .from("loja")
    .update(data)
    .eq('id', id)
    .select(`
      *,
      usuario:promotor_id (
        id,
        nome,
        apelido,
        avatar_url
      ),
      rede:rede_id (
        id,
        nome
      )
    `)
    .single();

  if (error) {
    console.error('Erro ao atualizar loja:', error);
    throw error;
  }

  return loja;
}

export async function deleteLoja(id: number): Promise<void> {
  console.log('Iniciando exclusão da loja no Supabase, ID:', id);
  
  const { error } = await supabase
    .from("loja")
    .delete()
    .eq("id", id);

  if (error) {
    console.error('Erro detalhado ao deletar loja no Supabase:', error);
    throw error;
  }
  
  console.log('Loja excluída com sucesso do Supabase');
}

export async function getRedes(): Promise<{ id: number; nome: string; }[]> {
  const { data, error } = await supabase
    .from("rede")
    .select("id, nome")
    .order("nome");

  if (error) {
    console.error('Erro ao buscar redes:', error);
    throw error;
  }

  return data || [];
}

export async function getPromotores(): Promise<{ id: number; nome: string; apelido: string; }[]> {
  const { data, error } = await supabase
    .from("usuario")
    .select("id, nome, apelido")
    .order("nome");

  if (error) {
    console.error('Erro ao buscar promotores:', error);
    throw error;
  }

  return data || [];
}
