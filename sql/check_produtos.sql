-- Verifica todos os produtos
SELECT * FROM produto ORDER BY marca, nome;

-- Verifica produtos por marca específica
SELECT * FROM produto WHERE marca = 'Bom Destino' ORDER BY nome;

-- Conta produtos por marca
SELECT marca, COUNT(*) as total FROM produto GROUP BY marca ORDER BY marca;
