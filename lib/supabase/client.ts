import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URL and/or Anon Key not found. Please check your environment variables."
  );
}

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
export const createClient = () => supabase;
