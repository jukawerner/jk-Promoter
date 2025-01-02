-- Cria a função para obter as colunas de uma tabela
create or replace function get_table_columns(table_name text)
returns table (
    column_name text,
    data_type text,
    is_nullable text,
    column_default text
) as $$
begin
    return query
    select 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default
    from information_schema.columns c
    where c.table_name = get_table_columns.table_name
    and c.table_schema = 'public';
end;
$$ language plpgsql;
