"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FilterProps {
  filters: {
    search: string;
  };
  onFilterChange: (filters: any) => void;
}

export function StoreFilter({ filters, onFilterChange }: FilterProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">Lojas</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          className="pl-10 w-full bg-white"
          placeholder="Pesquisar por rede, loja ou promotor..."
          value={filters.search}
          onChange={(e) =>
            onFilterChange({ ...filters, search: e.target.value })
          }
        />
      </div>
    </div>
  );
}
