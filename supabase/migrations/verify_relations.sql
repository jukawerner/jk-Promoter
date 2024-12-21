-- Verificar dados da tabela estoque com suas relações
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
