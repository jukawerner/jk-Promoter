-- Create the roteiros table
CREATE TABLE roteiros (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  id_promotor BIGINT REFERENCES usuario(id) NOT NULL,
  endereco_inicial TEXT NOT NULL,
  pontos_rota JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE roteiros ENABLE ROW LEVEL SECURITY;

-- Policy for inserting roteiros (only authenticated users)
CREATE POLICY "Enable insert for authenticated users only"
ON roteiros FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for selecting roteiros (users can only see their own roteiros)
CREATE POLICY "Users can view own roteiros"
ON roteiros FOR SELECT
TO authenticated
USING (auth.uid()::text::bigint = id_promotor);

-- Policy for updating roteiros (users can only update their own roteiros)
CREATE POLICY "Users can update own roteiros"
ON roteiros FOR UPDATE
TO authenticated
USING (auth.uid()::text::bigint = id_promotor)
WITH CHECK (auth.uid()::text::bigint = id_promotor);

-- Policy for deleting roteiros (users can only delete their own roteiros)
CREATE POLICY "Users can delete own roteiros"
ON roteiros FOR DELETE
TO authenticated
USING (auth.uid()::text::bigint = id_promotor);

-- Create trigger for updating updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON roteiros
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
