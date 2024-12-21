-- Atualiza a estrutura da tabela produto
ALTER TABLE produto
ADD COLUMN IF NOT EXISTS codigo_ean TEXT,
ADD COLUMN IF NOT EXISTS marca TEXT;

-- Remove a coluna marca_id se ela existir
ALTER TABLE produto
DROP COLUMN IF EXISTS marca_id;
