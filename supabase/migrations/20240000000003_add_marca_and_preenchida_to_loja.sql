-- Add marca and preenchida columns to loja table
alter table loja
add column marca text,
add column preenchida boolean default false;

-- Update existing rows to set default values
update loja
set marca = 'Sem marca',
    preenchida = false;

-- Make columns required
alter table loja
alter column marca set not null,
alter column preenchida set not null;

-- Update RLS policy to include new columns
drop policy if exists "Allow full access to authenticated users" on loja;

create policy "Allow full access to authenticated users"
  on loja
  for all
  to authenticated
  using (true)
  with check (true);
