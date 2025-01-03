-- Create marca table
create table if not exists public.marca (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.marca enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.marca
  for select using (true);

create policy "Enable insert for authenticated users only" on public.marca
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.marca
  for update using (auth.role() = 'authenticated');

-- Create indexes
create index if not exists marca_nome_idx on public.marca (nome);

-- Create trigger for updating updated_at
create trigger handle_updated_at before update on public.marca
  for each row execute procedure moddatetime (updated_at);
