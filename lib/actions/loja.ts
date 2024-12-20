import { supabase } from '@/lib/supabase';
import { Store, StoreFormData, StoreImportData } from '@/types/store';

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
  console.log('Dados recebidos em createLoja:', data);
  
  // Garantir que os dados estão no formato correto
  const lojaData = {
    nome: data.nome,
    cnpj: data.cnpj,
    endereco: data.endereco,
    cep: data.cep,
    rede_id: Number(data.rede_id),
    promotor_id: data.promotor_id === null ? null : Number(data.promotor_id),
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
  };

  console.log('Dados formatados para inserção:', lojaData);

  const { data: loja, error } = await supabase
    .from("loja")
    .insert([lojaData])
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
    console.error('Erro detalhado ao criar loja:', error);
    
    // Tratamento específico para erro de CNPJ duplicado
    if (error.code === '23505' && error.message.includes('loja_cnpj_key')) {
      throw new Error(`Já existe uma loja cadastrada com o CNPJ ${data.cnpj}`);
    }
    
    throw new Error(`Erro ao criar loja: ${error.message}`);
  }

  if (!loja) {
    throw new Error('Loja não foi criada - nenhum dado retornado');
  }

  console.log('Loja criada com sucesso:', loja);
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

export async function importLojas(lojas: StoreImportData[]): Promise<Store[]> {
  console.log('Iniciando importação de lojas:', lojas);
  
  const { data, error } = await supabase
    .from("loja")
    .insert(lojas.map(loja => ({
      nome: String(loja.nome).trim().toUpperCase(),
      cnpj: loja.cnpj,
      endereco: String(loja.endereco).trim().toUpperCase(),
      numero: "S/N",  // Valor padrão
      bairro: "NÃO INFORMADO",  // Valor padrão
      cidade: "NÃO INFORMADO",  // Valor padrão
      uf: "SC",  // Valor padrão
      cep: loja.cep.replace(/\D/g, ''),
      rede_id: Number(loja.rede_id),
      promotor_id: loja.promotor_id === null ? null : Number(loja.promotor_id),
      latitude: Number(loja.latitude) || -23.5505,
      longitude: Number(loja.longitude) || -46.6333,
    })))
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
    `);

  if (error) {
    console.error('Erro ao importar lojas:', error);
    throw new Error(`Erro ao importar lojas: ${error.message}`);
  }

  console.log('Lojas importadas com sucesso:', data);
  return data || [];
}
