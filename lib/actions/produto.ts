import { supabase } from '@/lib/supabase'

export interface Produto {
  id: number
  codigo_ean?: string
  nome: string
  familia: string
  unidade: string
  peso: number
  validade: number
  marca_id: number
  marca?: {
    nome: string
  }
  created_at?: string
  updated_at?: string
}

export type CreateProdutoInput = Omit<Produto, 'id' | 'created_at' | 'updated_at' | 'marca'>

export async function createProduto(data: CreateProdutoInput): Promise<Produto> {
  const { data: produto, error } = await supabase
    .from("produto")
    .insert([data])
    .select("*, marca(nome)")
    .single()

  if (error) {
    console.error('Erro ao criar produto:', error)
    throw error
  }
  return produto
}

export async function getProdutos(): Promise<Produto[]> {
  console.log('Buscando produtos...')
  const { data, error } = await supabase
    .from("produto")
    .select("*, marca(nome)")
    .order("nome")

  if (error) {
    console.error('Erro ao buscar produtos:', error)
    throw error
  }
  
  console.log('Produtos encontrados:', data)
  return data || []
}

export async function updateProduto(id: number, data: Partial<CreateProdutoInput>): Promise<Produto> {
  const { data: produto, error } = await supabase
    .from("produto")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, marca(nome)")
    .single()

  if (error) {
    console.error('Erro ao atualizar produto:', error)
    throw error
  }
  return produto
}

export async function deleteProduto(id: number): Promise<void> {
  const { error } = await supabase
    .from("produto")
    .delete()
    .eq("id", id)

  if (error) {
    console.error('Erro ao deletar produto:', error)
    throw error
  }
}

interface Marca {
  id: number
  nome: string
}

export async function getMarcas(): Promise<Marca[]> {
  console.log('Buscando marcas...')
  const { data, error } = await supabase
    .from("marca")
    .select("id, nome")
    .order("nome")

  if (error) {
    console.error('Erro ao buscar marcas:', error)
    throw error
  }
  
  console.log('Marcas encontradas:', data)
  return data || []
}
