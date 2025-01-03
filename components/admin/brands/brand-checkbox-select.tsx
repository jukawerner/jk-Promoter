"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface Brand {
  id: string;
  nome: string;
}

interface BrandCheckboxSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function BrandCheckboxSelect({ value = [], onChange }: BrandCheckboxSelectProps) {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const fetchBrands = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('marcas').select('id, nome');

      if (error) {
        console.error("Erro ao buscar marcas:", error);
      } else {
        setBrands(data || []);
      }
    };

    fetchBrands();
  }, []);

  const handleCheckboxChange = (brandId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, brandId]);
    } else {
      onChange(value.filter(id => id !== brandId));
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {brands.map((brand) => (
        <div key={brand.id} className="flex items-center space-x-2">
          <Checkbox
            id={`brand-${brand.id}`}
            checked={value.includes(brand.id)}
            onCheckedChange={(checked) => handleCheckboxChange(brand.id, checked as boolean)}
          />
          <Label htmlFor={`brand-${brand.id}`}>{brand.nome}</Label>
        </div>
      ))}
    </div>
  );
}
