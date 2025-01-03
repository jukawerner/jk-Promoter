-- Criar tabela de relacionamento entre promotores e marcas
CREATE TABLE IF NOT EXISTS promoter_marca (
    promoter_id BIGINT REFERENCES usuario(id) ON DELETE CASCADE,
    marca_id BIGINT REFERENCES marca(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (promoter_id, marca_id)
);

-- Adicionar políticas RLS
ALTER TABLE promoter_marca ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON promoter_marca;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON promoter_marca;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON promoter_marca;
DROP POLICY IF EXISTS "Permitir deleção para usuários autenticados" ON promoter_marca;

-- Política para inserção
CREATE POLICY "Permitir inserção" ON promoter_marca
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Política para seleção
CREATE POLICY "Permitir leitura" ON promoter_marca
    FOR SELECT 
    TO public
    USING (true);

-- Política para atualização
CREATE POLICY "Permitir atualização" ON promoter_marca
    FOR UPDATE 
    TO public
    USING (true)
    WITH CHECK (true);

-- Política para deleção
CREATE POLICY "Permitir deleção" ON promoter_marca
    FOR DELETE 
    TO public
    USING (true);
