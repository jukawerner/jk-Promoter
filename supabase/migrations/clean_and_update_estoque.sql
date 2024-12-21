-- Primeiro, vamos limpar os campos antigos
UPDATE estoque
SET produto = NULL,
    marca = NULL;

-- Agora vamos atualizar os IDs baseado nos dados que temos
UPDATE estoque e
SET produto_id = p.id
FROM produto p
WHERE e.produto = p.nome;

UPDATE estoque e
SET marca_id = m.id
FROM marca m
WHERE e.marca = m.nome;

-- Remover as colunas antigas
ALTER TABLE estoque
DROP COLUMN IF EXISTS produto,
DROP COLUMN IF EXISTS marca;

-- Verificar o resultado
SELECT 
    e.id,
    e.produto_id,
    p.nome as produto_nome,
    e.marca_id,
    m.nome as marca_nome,
    e.rede,
    e.loja,
    e.estoque_fisico,
    e.estoque_virtual
FROM 
    estoque e
LEFT JOIN 
    produto p ON e.produto_id = p.id
LEFT JOIN 
    marca m ON e.marca_id = m.id
ORDER BY 
    e.updated_at DESC
LIMIT 10;
