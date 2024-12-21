-- Create a table for PDV (Ponto de Venda)
create table pdv (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  marca text not null,
  ponto_extra_conquistado boolean default false,
  fotos text[], -- Array to store photo URLs
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table pdv enable row level security;

-- Create policy to allow all operations for authenticated users
create policy "Allow full access to authenticated users"
  on pdv
  for all
  to authenticated
  using (true)
  with check (true);

-- Create storage bucket for PDV photos
insert into storage.buckets (id, name, public) 
values ('pdv-photos', 'pdv-photos', true);

-- Create policy to allow viewing photos in the bucket
create policy "Allow public viewing of PDV photos"
  on storage.objects
  for select
  to public
  using (bucket_id = 'pdv-photos');

-- Create policy to allow authenticated users to upload photos
create policy "Allow authenticated users to upload PDV photos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'pdv-photos');

-- Create policy to allow authenticated users to delete their photos
create policy "Allow authenticated users to delete PDV photos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'pdv-photos');
