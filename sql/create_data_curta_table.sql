-- Criar a tabela data_curta
create table if not exists data_curta (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    marca text not null,
    produto text not null,
    quantidade decimal not null,
    data_validade date not null
);

-- Habilitar RLS (Row Level Security)
alter table data_curta enable row level security;

-- Criar política para permitir select público
create policy "Allow public selects"
on data_curta for select
to public
using (true);

-- Criar política para permitir insert público
create policy "Allow public inserts"
on data_curta for insert
to public
with check (true);

-- Criar política para permitir update público
create policy "Allow public updates"
on data_curta for update
to public
using (true)
with check (true);

-- Criar política para permitir delete público
create policy "Allow public deletes"
on data_curta for delete
to public
using (true);
