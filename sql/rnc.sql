-- Remove políticas existentes
drop policy if exists "Permitir acesso público total" on rnc;

-- Recria a tabela rnc
drop table if exists rnc cascade;
create table rnc (
    id bigint generated by default as identity primary key,
    data timestamp with time zone default timezone('utc'::text, now()) not null,
    rede_id text references redes(id) on delete cascade,
    loja_id text references lojas(id) on delete cascade,
    marca_id text references marcas(id) on delete cascade,
    produto_id text references produtos(id) on delete cascade,
    motivo text not null,
    numero_nota_fiscal text not null,
    valor_total decimal(10,2) not null,
    observacoes text,
    fotos jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilita RLS
alter table rnc enable row level security;

-- Cria política de acesso público
create policy "Permitir acesso público total"
on rnc
for all
using (true)
with check (true);
