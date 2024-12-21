-- Primeiro, vamos atualizar os produto_id baseado no nome do produto
UPDATE estoque e
SET produto_id = p.id
FROM produto p
WHERE e.produto = p.nome;

-- Depois, vamos atualizar os marca_id baseado no nome da marca
UPDATE estoque e
SET marca_id = m.id
FROM marca m
WHERE e.marca = m.nome;

-- Verificar o resultado
SELECT 
    e.id,
    e.produto,
    e.produto_id,
    p.nome as produto_nome,
    e.marca,
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
