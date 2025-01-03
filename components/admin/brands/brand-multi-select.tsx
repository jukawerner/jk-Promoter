"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Brand {
  id: number;
  nome: string;
}

interface BrandMultiSelectProps {
  value: number[];
  onChange: (value: number[]) => void;
  promoterId?: number; // ID do promotor para filtrar marcas
  readOnly?: boolean; // Se true, mostra apenas as marcas vinculadas
}

export function BrandMultiSelect({ value = [], onChange, promoterId, readOnly = false }: BrandMultiSelectProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const supabase = createClient();
        console.log('Buscando marcas...');
        
        let query;
        
        if (readOnly && promoterId) {
          // Se for somente leitura e tiver promoterId, busca apenas as marcas vinculadas
          const { data, error } = await supabase
            .from('promoter_marca')
            .select(`
              marca:marca_id (
                id,
                nome
              )
            `)
            .eq('promoter_id', promoterId);

          if (error) throw error;
          
          // Transforma os dados para o formato esperado
          const brandsData = data
            .map(item => item.marca)
            .filter(brand => brand !== null);
            
          setBrands(brandsData);
        } else {
          // Caso contrário, busca todas as marcas
          const { data, error } = await supabase
            .from('marca')
            .select('id, nome')
            .order('nome');

          if (error) throw error;
          setBrands(data || []);
        }

      } catch (error) {
        console.error("Erro ao buscar marcas:", error);
        setError("Erro ao carregar as marcas. Por favor, tente novamente.");
        toast.error("Erro ao carregar as marcas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, [promoterId, readOnly]);

  const handleCheckboxChange = (brandId: number, checked: boolean) => {
    if (readOnly) return; // Não permite alterações se for somente leitura
    
    const newValue = checked
      ? [...value, brandId]
      : value.filter(id => id !== brandId);
    console.log('Marcas selecionadas:', newValue);
    onChange(newValue);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2">Carregando marcas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        Nenhuma marca encontrada
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-2 border rounded-md">
      {brands.map((brand) => (
        <div key={brand.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
          <Checkbox
            id={`brand-${brand.id}`}
            checked={value.includes(brand.id)}
            onCheckedChange={(checked) => handleCheckboxChange(brand.id, checked as boolean)}
            disabled={readOnly}
          />
          <Label
            htmlFor={`brand-${brand.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {brand.nome}
          </Label>
        </div>
      ))}
    </div>
  );
}
