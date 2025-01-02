-- Add marca column to pdv table
alter table pdv
add column marca text;

-- Update existing rows to set marca based on marca_id
update pdv
set marca = (select nome from marca where id = pdv.marca_id);

-- Make marca column required
alter table pdv
alter column marca set not null;

-- Update RLS policy to include new column
drop policy if exists "Allow full access to authenticated users" on pdv;

create policy "Allow full access to authenticated users"
  on pdv
  for all
  to authenticated
  using (true)
  with check (true);
