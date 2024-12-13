-- Criar o bucket pdv-photos se não existir
insert into storage.buckets (id, name, public)
values ('pdv-photos', 'pdv-photos', true)
on conflict (id) do nothing;

-- Habilitar RLS para o bucket
alter table storage.objects enable row level security;

-- Remover políticas existentes do bucket (caso existam)
drop policy if exists "Allow public uploads" on storage.objects;
drop policy if exists "Allow public downloads" on storage.objects;
drop policy if exists "Allow authenticated uploads" on storage.objects;
drop policy if exists "Allow authenticated downloads" on storage.objects;

-- Criar política para permitir upload público
create policy "Allow public uploads"
on storage.objects for insert
to public
with check (bucket_id = 'pdv-photos');

-- Criar política para permitir download público
create policy "Allow public downloads"
on storage.objects for select
to public
using (bucket_id = 'pdv-photos');

-- Criar política para permitir upload autenticado
create policy "Allow authenticated uploads"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'pdv-photos');

-- Criar política para permitir download autenticado
create policy "Allow authenticated downloads"
on storage.objects
for select
to authenticated
using (bucket_id = 'pdv-photos');

-- Habilitar RLS para a tabela pdv
alter table pdv enable row level security;

-- Remover políticas existentes da tabela pdv (caso existam)
drop policy if exists "Allow public inserts" on pdv;
drop policy if exists "Allow public selects" on pdv;
drop policy if exists "Enable insert access for authenticated users" on pdv;
drop policy if exists "Enable select access for authenticated users" on pdv;

-- Criar política para permitir inserção pública
create policy "Allow public inserts"
on pdv for insert
to public
with check (true);

-- Criar política para permitir select público
create policy "Allow public selects"
on pdv for select
to public
using (true);

-- Create policy to allow insert for authenticated users
create policy "Enable insert access for authenticated users"
on pdv
for insert
to authenticated
with check (true);

-- Create policy to allow select for authenticated users
create policy "Enable select access for authenticated users"
on pdv
for select
to authenticated
using (true);
