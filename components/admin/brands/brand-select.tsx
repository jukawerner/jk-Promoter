import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import { createClient } from "../../../lib/supabase/client";

interface Brand {
  id: string;
  nome: string;
}

interface BrandSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function BrandSelect({ value, onChange }: BrandSelectProps) {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const fetchBrands = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('marcas').select('id, nome');

      if (error) {
        console.error("Erro ao buscar marcas:", error);
      } else {
        setBrands(data);
      }
    };

    fetchBrands();
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma marca" />
      </SelectTrigger>
      <SelectContent>
        {brands.map((brand) => (
          <SelectItem key={brand.id} value={brand.id}>
            {brand.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
