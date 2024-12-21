-- Create Estoque table
CREATE TABLE IF NOT EXISTS estoque (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    marca TEXT NOT NULL,
    produto TEXT NOT NULL,
    estoque_fisico DECIMAL NOT NULL,
    estoque_virtual DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_estoque_updated_at
    BEFORE UPDATE ON estoque
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
