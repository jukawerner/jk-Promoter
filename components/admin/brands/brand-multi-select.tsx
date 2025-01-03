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
        
        // Sempre busca todas as marcas disponíveis
        const { data: allBrands, error: brandsError } = await supabase
          .from('marca')
          .select('id, nome')
          .order('nome');

        if (brandsError) throw brandsError;

        // Se for readOnly e tiver promoterId, filtra apenas as marcas vinculadas
        if (readOnly && promoterId) {
          const { data: promoterBrands, error: promoterError } = await supabase
            .from('promoter_marca')
            .select('marca_id')
            .eq('promoter_id', promoterId);

          if (promoterError) throw promoterError;

          const promoterBrandIds = promoterBrands.map(pb => pb.marca_id);
          setBrands(allBrands.filter(brand => promoterBrandIds.includes(brand.id)));
        } else {
          setBrands(allBrands || []);
        }
      } catch (error) {
        console.error("Erro ao buscar marcas:", error);
        setError("Erro ao carregar as marcas. Por favor, tente novamente.");
        toast.error("Erro ao carregar as marcas");
        setBrands([]); // Garante que brands seja um array vazio em caso de erro
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
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  if (!brands.length) {
    return (
      <div className="text-gray-500 p-4 text-center">
        Nenhuma marca disponível.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {brands.map((brand) => (
        <div key={brand.id} className="flex items-center space-x-2">
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
