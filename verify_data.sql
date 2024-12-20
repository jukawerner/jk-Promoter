-- Verificar estrutura da tabela usuario
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'usuario';

-- Verificar dados dos promotores
SELECT id, apelido, endereco, tipo_usuario
FROM usuario
WHERE tipo_usuario = 'promotor';

-- Verificar estrutura da tabela lojas
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'lojas';

-- Verificar dados das lojas
SELECT id, nome_loja, endereco
FROM lojas;
