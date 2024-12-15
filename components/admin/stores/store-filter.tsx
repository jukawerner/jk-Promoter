import { Input } from "@/components/ui/input";

interface StoreFilterProps {
  filters: {
    rede: string;
    loja: string;
    cidade: string;
  };
  onFilterChange: (field: string, value: string) => void;
}

export function StoreFilter({ filters, onFilterChange }: StoreFilterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div>
        <Input
          placeholder="Filtrar por rede..."
          value={filters.rede}
          onChange={(e) => onFilterChange("rede", e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Input
          placeholder="Filtrar por loja..."
          value={filters.loja}
          onChange={(e) => onFilterChange("loja", e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Input
          placeholder="Filtrar por cidade..."
          value={filters.cidade}
          onChange={(e) => onFilterChange("cidade", e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
}
