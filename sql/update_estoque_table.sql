-- Adicionar novas colunas na tabela estoque
ALTER TABLE estoque
ADD COLUMN rede text,
ADD COLUMN loja text;

-- Atualizar as políticas de segurança
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir SELECT para usuários autenticados" ON "public"."estoque"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir INSERT para usuários autenticados" ON "public"."estoque"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir UPDATE para usuários autenticados" ON "public"."estoque"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir DELETE para usuários autenticados" ON "public"."estoque"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);
