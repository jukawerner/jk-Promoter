-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON "public"."estoque";
DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON "public"."estoque";
DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON "public"."estoque";
DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON "public"."estoque";

-- Habilitar RLS
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;

-- Criar novas políticas
CREATE POLICY "Permitir SELECT para todos"
ON public.estoque
FOR SELECT
TO public
USING (true);

CREATE POLICY "Permitir INSERT para todos"
ON public.estoque
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Permitir UPDATE para todos"
ON public.estoque
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir DELETE para todos"
ON public.estoque
FOR DELETE
TO public
USING (true);
