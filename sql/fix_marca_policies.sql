-- Enable RLS
alter table public.marca enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Enable read access for all users" on public.marca;
drop policy if exists "Enable insert for authenticated users only" on public.marca;
drop policy if exists "Enable update for authenticated users only" on public.marca;

-- Create policies
create policy "Enable read access for all users" on public.marca
  for select using (true);

create policy "Enable insert for authenticated users only" on public.marca
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.marca
  for update using (auth.role() = 'authenticated');
