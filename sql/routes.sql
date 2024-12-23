-- Create routes table
create table if not exists routes (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    usuario_id bigint references usuario(id) on delete cascade,
    stores jsonb not null, -- Array of store IDs and their order
    estimated_time integer not null, -- in minutes
    distance float not null, -- in kilometers
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create RLS policies
alter table routes enable row level security;

create policy "Enable read access for authenticated users" on routes
    for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on routes
    for insert with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users" on routes
    for update using (auth.role() = 'authenticated');

create policy "Enable delete access for authenticated users" on routes
    for delete using (auth.role() = 'authenticated');

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_routes_updated_at
    before update on routes
    for each row
    execute function update_updated_at_column();
