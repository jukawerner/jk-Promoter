-- Primeiro, remover constraints existentes se houver
ALTER TABLE estoque
DROP CONSTRAINT IF EXISTS fk_estoque_produto,
DROP CONSTRAINT IF EXISTS fk_estoque_marca;

-- Remover colunas existentes se houver
ALTER TABLE estoque
DROP COLUMN IF EXISTS produto_id,
DROP COLUMN IF EXISTS marca_id;

-- Adicionar as colunas de chave estrangeira
ALTER TABLE estoque
ADD COLUMN produto_id BIGINT,
ADD COLUMN marca_id BIGINT;

-- Adicionar as constraints de chave estrangeira
ALTER TABLE estoque
ADD CONSTRAINT fk_estoque_produto
    FOREIGN KEY (produto_id)
    REFERENCES produto(id)
    ON DELETE SET NULL;

ALTER TABLE estoque
ADD CONSTRAINT fk_estoque_marca
    FOREIGN KEY (marca_id)
    REFERENCES marca(id)
    ON DELETE SET NULL;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_estoque_produto_id ON estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_marca_id ON estoque(marca_id);

-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON estoque;
DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON estoque;
DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON estoque;
DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON estoque;

-- Habilitar RLS (Row Level Security)
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir select para usuários autenticados
CREATE POLICY "Permitir SELECT para usuários autenticados" ON estoque
    FOR SELECT
    TO authenticated
    USING (true);

-- Criar política para permitir insert para usuários autenticados
CREATE POLICY "Permitir INSERT para usuários autenticados" ON estoque
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Criar política para permitir update para usuários autenticados
CREATE POLICY "Permitir UPDATE para usuários autenticados" ON estoque
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Criar política para permitir delete para usuários autenticados
CREATE POLICY "Permitir DELETE para usuários autenticados" ON estoque
    FOR DELETE
    TO authenticated
    USING (true);
