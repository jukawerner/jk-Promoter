"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface ClientFilterProps {
  filters: {
    rede: string;
    loja: string;
    cidade: string;
  };
  onFilterChange: (field: string, value: string) => void;
}

export function ClientFilter({ filters, onFilterChange }: ClientFilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-gray-500" />
        <h2 className="text-sm font-medium text-gray-700">Filtrar Clientes</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rede-filter" className="text-sm">
            Rede
          </Label>
          <Input
            id="rede-filter"
            placeholder="Filtrar por rede"
            value={filters.rede}
            onChange={(e) => onFilterChange("rede", e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="loja-filter" className="text-sm">
            Loja
          </Label>
          <Input
            id="loja-filter"
            placeholder="Filtrar por loja"
            value={filters.loja}
            onChange={(e) => onFilterChange("loja", e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidade-filter" className="text-sm">
            Cidade
          </Label>
          <Input
            id="cidade-filter"
            placeholder="Filtrar por cidade"
            value={filters.cidade}
            onChange={(e) => onFilterChange("cidade", e.target.value)}
            className="h-9"
          />
        </div>
      </div>
    </div>
  );
}
