-- Remove políticas existentes
drop policy if exists "Enable read access for authenticated users" on routes;
drop policy if exists "Enable insert access for authenticated users" on routes;
drop policy if exists "Enable update access for authenticated users" on routes;
drop policy if exists "Enable delete access for authenticated users" on routes;
drop policy if exists "Permitir leitura para usuários autenticados" on routes;
drop policy if exists "Permitir inserção para usuários autenticados" on routes;
drop policy if exists "Permitir atualização pelo próprio usuário" on routes;
drop policy if exists "Permitir exclusão pelo próprio usuário" on routes;
drop policy if exists "Permitir acesso público total" on routes;

-- Habilita RLS
alter table routes enable row level security;

-- Política para permitir acesso público total
create policy "Permitir acesso público total"
on routes
for all
using (true)
with check (true);
