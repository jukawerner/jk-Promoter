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

-- Adiciona novas colunas à tabela routes
alter table routes add column if not exists origin_address text;
alter table routes add column if not exists origin_position jsonb; -- {lat: number, lng: number}
alter table routes add column if not exists destination_address text;
alter table routes add column if not exists destination_position jsonb; -- {lat: number, lng: number}
alter table routes add column if not exists waypoints jsonb[]; -- Array de {location: {lat: number, lng: number}, stopover: boolean}
alter table routes add column if not exists route_polyline text; -- Encoded polyline da rota
alter table routes add column if not exists status text default 'active'; -- active, completed, cancelled
alter table routes add column if not exists completed_at timestamp with time zone;
alter table routes add column if not exists notes text;
alter table routes add column if not exists created_by uuid references auth.users(id);
alter table routes add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Atualiza a estrutura do campo stores para incluir mais informações
comment on column routes.stores is 'Array de lojas com formato: {
  id: string,
  name: string,
  address: string,
  position: {lat: number, lng: number},
  order: number,
  estimated_arrival: string,
  status: string,
  notes: string
}';

-- Habilita RLS
alter table routes enable row level security;

-- Política para permitir acesso público total
create policy "Permitir acesso público total"
on routes
for all
using (true)
with check (true);
