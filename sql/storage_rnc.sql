-- Cria o bucket para fotos do RNC se não existir
insert into storage.buckets (id, name, public)
values ('rnc_photos', 'rnc_photos', true)
on conflict (id) do nothing;

-- Remove políticas existentes
drop policy if exists "Permitir acesso público de leitura 1jf24j" on storage.objects;
drop policy if exists "Permitir upload para usuários autenticados 1h423h" on storage.objects;
drop policy if exists "Permitir atualização para usuários autenticados 2k5h4j" on storage.objects;
drop policy if exists "Permitir deleção para autenticados 1j4h23" on storage.objects;

-- Habilita RLS
alter table storage.objects enable row level security;

-- Permite acesso público total
create policy "Permitir acesso público total" on storage.objects
  for all
  to public
  using (bucket_id = 'rnc_photos')
  with check (bucket_id = 'rnc_photos');
