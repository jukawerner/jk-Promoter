import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Criar uma única instância do cliente
export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

// Manter a função createClient para compatibilidade, mas retornar a mesma instância
export const createClient = () => supabase;